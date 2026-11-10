package repo

import (
	"context"
	"database/sql"
	"time"

	"tstc/internal/gameplay"
	"tstc/internal/money"
)

// EnsureCells 补齐某人的车位：按额度插入缺少的序号，已有的不动。
func (s *Store) EnsureCells(ctx context.Context, q queryer, ownerID int64, want int) error {
	if want <= 0 {
		return nil
	}
	rows, err := q.QueryContext(ctx, "SELECT seq FROM lot_cell WHERE owner_id = ?", ownerID)
	if err != nil {
		return classify(err)
	}
	have := make(map[int]bool, want)
	for rows.Next() {
		var seq int
		if err := rows.Scan(&seq); err != nil {
			rows.Close()
			return err
		}
		have[seq] = true
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return err
	}

	for seq := 1; seq <= want; seq++ {
		if have[seq] {
			continue
		}
		if _, err := q.ExecContext(ctx,
			"INSERT IGNORE INTO lot_cell (owner_id, seq, state) VALUES (?, ?, 0)", ownerID, seq); err != nil {
			return classify(err)
		}
	}
	return nil
}

// CellsOf 返回某人名下的全部车位。
func (s *Store) CellsOf(ctx context.Context, ownerID int64) ([]Cell, error) {
	rows, err := s.Query(ctx,
		"SELECT id, owner_id, seq, state FROM lot_cell WHERE owner_id = ? ORDER BY seq ASC", ownerID)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]Cell, 0, gameplay.CapCeiling)
	for rows.Next() {
		var c Cell
		if err := rows.Scan(&c.ID, &c.OwnerID, &c.Seq, &c.State); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

// GrabRandomFreeCell 从全服空闲车位里随机锁一个，是「一键停车」的分配逻辑。
// ORDER BY RAND() 在车位表规模不大时足够快，真正的并发安全由 FOR UPDATE 保证。
func (s *Store) GrabRandomFreeCell(ctx context.Context, tx *sql.Tx, selfID int64) (Cell, error) {
	row := tx.QueryRowContext(ctx, `
		SELECT id, owner_id, seq, state FROM lot_cell
		WHERE state = 0 AND owner_id <> ?
		ORDER BY RAND() LIMIT 1 FOR UPDATE`, selfID)
	var c Cell
	if err := row.Scan(&c.ID, &c.OwnerID, &c.Seq, &c.State); err != nil {
		return Cell{}, classify(err)
	}
	return c, nil
}

// GrabFreeCellOfHost 锁定指定玩家名下的第一个空车位，是通讯录精准停车的入口。
func (s *Store) GrabFreeCellOfHost(ctx context.Context, tx *sql.Tx, hostID int64) (Cell, error) {
	row := tx.QueryRowContext(ctx, `
		SELECT id, owner_id, seq, state FROM lot_cell
		WHERE state = 0 AND owner_id = ?
		ORDER BY seq ASC LIMIT 1 FOR UPDATE`, hostID)
	var c Cell
	if err := row.Scan(&c.ID, &c.OwnerID, &c.Seq, &c.State); err != nil {
		return Cell{}, classify(err)
	}
	return c, nil
}

// BookCell 占用车位，条件更新确保同一时刻只有一个请求能占到同一个车位。
func (s *Store) BookCell(ctx context.Context, q queryer, cellID int64) error {
	res, err := q.ExecContext(ctx, "UPDATE lot_cell SET state = 1 WHERE id = ? AND state = 0", cellID)
	if err != nil {
		return classify(err)
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return ErrConflict
	}
	return nil
}

// ReleaseCell 把车位置回空闲，重复释放不会报错。
func (s *Store) ReleaseCell(ctx context.Context, q queryer, cellID int64) error {
	_, err := q.ExecContext(ctx, "UPDATE lot_cell SET state = 0 WHERE id = ?", cellID)
	return classify(err)
}

// InsertLease 建立一段租约。
func (s *Store) InsertLease(ctx context.Context, q queryer, vehicleID, cellID, parkerID, hostID int64, began time.Time) (int64, error) {
	res, err := q.ExecContext(ctx, `
		INSERT INTO lot_lease (vehicle_id, cell_id, parker_id, host_id, began_at, status)
		VALUES (?, ?, ?, ?, ?, 0)`, vehicleID, cellID, parkerID, hostID, began)
	if err != nil {
		return 0, classify(err)
	}
	return res.LastInsertId()
}

const leaseCols = "id, vehicle_id, cell_id, parker_id, host_id, began_at, ended_at, end_kind, gross, parker_pay, host_pay"

func scanLease(sc interface{ Scan(...any) error }) (Lease, error) {
	var (
		l     Lease
		ended sql.NullTime
	)
	err := sc.Scan(&l.ID, &l.VehicleID, &l.CellID, &l.ParkerID, &l.HostID,
		&l.BeganAt, &ended, &l.EndKind, &l.Gross, &l.ParkerPay, &l.HostPay)
	if err != nil {
		return Lease{}, classify(err)
	}
	if ended.Valid {
		t := ended.Time
		l.EndedAt = &t
	}
	return l, nil
}

// ActiveLeaseByVehicle 查一辆车正在执行的租约，没有则返回 ErrNoRow。
func (s *Store) ActiveLeaseByVehicle(ctx context.Context, q queryer, vehicleID int64) (Lease, error) {
	row := q.QueryRowContext(ctx,
		"SELECT "+leaseCols+" FROM lot_lease WHERE vehicle_id = ? AND status = 0 ORDER BY id DESC LIMIT 1", vehicleID)
	return scanLease(row)
}

// CloseLease 结束租约并落账。条件更新保证同一段租约只会被结算一次，
// 贴条与期满自动结算同时命中时不会重复发钱。
func (s *Store) CloseLease(ctx context.Context, q queryer, leaseID int64, kind gameplay.Kind,
	gross, parkerPay, hostPay money.Coin, endedAt time.Time) error {
	return requireAffected(q.ExecContext(ctx, `
		UPDATE lot_lease
		SET status = 1, end_kind = ?, gross = ?, parker_pay = ?, host_pay = ?, ended_at = ?
		WHERE id = ? AND status = 0`,
		int(kind), int64(gross), int64(parkerPay), int64(hostPay), endedAt, leaseID))
}

// OccupancyOf 返回停在我家车位上的车，按停入时间倒序。
func (s *Store) OccupancyOf(ctx context.Context, hostID int64) ([]Occupancy, error) {
	const query = `
		SELECT l.id, l.cell_id, c.seq, l.vehicle_id, v.lv, l.parker_id, p.nick, p.lv, l.began_at
		FROM lot_lease l
		JOIN lot_cell c ON c.id = l.cell_id
		JOIN acct_vehicle v ON v.id = l.vehicle_id
		JOIN acct_player p ON p.id = l.parker_id
		WHERE l.host_id = ? AND l.status = 0
		ORDER BY l.began_at DESC`
	rows, err := s.Query(ctx, query, hostID)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]Occupancy, 0, gameplay.CapCeiling)
	for rows.Next() {
		var o Occupancy
		if err := rows.Scan(&o.LeaseID, &o.CellID, &o.CellSeq, &o.VehicleID, &o.VehicleLv,
			&o.ParkerID, &o.ParkerNick, &o.ParkerLv, &o.BeganAt); err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, rows.Err()
}

// MatureRow 是自动结算扫描需要的最小字段集，一次查询带全三方等级。
type MatureRow struct {
	LeaseID   int64
	VehicleID int64
	CellID    int64
	ParkerID  int64
	HostID    int64
	BeganAt   time.Time
	VehicleLv int
	ParkerLv  int
	HostLv    int
}

// MatureCandidates 捞出已经超过期满满额的租约，交给服务层逐条结算。
func (s *Store) MatureCandidates(ctx context.Context, before time.Time, limit int) ([]MatureRow, error) {
	if limit <= 0 {
		limit = 200
	}
	const query = `
		SELECT l.id, l.vehicle_id, l.cell_id, l.parker_id, l.host_id, l.began_at, v.lv, p.lv, h.lv
		FROM lot_lease l
		JOIN acct_vehicle v ON v.id = l.vehicle_id
		JOIN acct_player p ON p.id = l.parker_id
		JOIN acct_player h ON h.id = l.host_id
		WHERE l.status = 0 AND l.began_at <= ?
		ORDER BY l.began_at ASC
		LIMIT ?`
	rows, err := s.Query(ctx, query, before, limit)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]MatureRow, 0, limit)
	for rows.Next() {
		var m MatureRow
		if err := rows.Scan(&m.LeaseID, &m.VehicleID, &m.CellID, &m.ParkerID, &m.HostID,
			&m.BeganAt, &m.VehicleLv, &m.ParkerLv, &m.HostLv); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

// TicketReadyCandidates 捞出机器人可贴条的租约：停放超过阈值且在争夺期内。
func (s *Store) TicketReadyCandidates(ctx context.Context, hostID int64, before time.Time, limit int) ([]MatureRow, error) {
	if limit <= 0 {
		limit = 20
	}
	const query = `
		SELECT l.id, l.vehicle_id, l.cell_id, l.parker_id, l.host_id, l.began_at, v.lv, p.lv, h.lv
		FROM lot_lease l
		JOIN acct_vehicle v ON v.id = l.vehicle_id
		JOIN acct_player p ON p.id = l.parker_id
		JOIN acct_player h ON h.id = l.host_id
		WHERE l.status = 0 AND l.host_id = ? AND l.began_at <= ?
		ORDER BY l.began_at ASC
		LIMIT ?`
	rows, err := s.Query(ctx, query, hostID, before, limit)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]MatureRow, 0, limit)
	for rows.Next() {
		var m MatureRow
		if err := rows.Scan(&m.LeaseID, &m.VehicleID, &m.CellID, &m.ParkerID, &m.HostID,
			&m.BeganAt, &m.VehicleLv, &m.ParkerLv, &m.HostLv); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}
