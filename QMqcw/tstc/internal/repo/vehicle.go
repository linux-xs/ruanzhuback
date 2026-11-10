package repo

import (
	"context"
	"database/sql"
	"time"

	"tstc/internal/gameplay"
)

const vehicleCols = "id, owner_id, lv, state, born_at"

func scanVehicle(sc interface{ Scan(...any) error }) (Vehicle, error) {
	var v Vehicle
	err := sc.Scan(&v.ID, &v.OwnerID, &v.Level, &v.State, &v.BornAt)
	if err != nil {
		return Vehicle{}, classify(err)
	}
	return v, nil
}

// VehiclesOf 返回某人车库里的全部车辆（不含租约信息）。
func (s *Store) VehiclesOf(ctx context.Context, ownerID int64) ([]Vehicle, error) {
	rows, err := s.Query(ctx,
		"SELECT "+vehicleCols+" FROM acct_vehicle WHERE owner_id = ? ORDER BY lv DESC, id ASC", ownerID)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]Vehicle, 0, 10)
	for rows.Next() {
		v, err := scanVehicle(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, v)
	}
	return out, rows.Err()
}

// VehicleByID 按主键取车，读到的可能是别人的车，调用方需自行校验归属。
func (s *Store) VehicleByID(ctx context.Context, id int64) (Vehicle, error) {
	row := s.QueryRow(ctx, "SELECT "+vehicleCols+" FROM acct_vehicle WHERE id = ?", id)
	return scanVehicle(row)
}

// VehicleIn 在指定连接（通常是事务）里读取车辆，保证读到的是同一事务内的最新状态。
func (s *Store) VehicleIn(ctx context.Context, q queryer, id int64) (Vehicle, error) {
	row := q.QueryRowContext(ctx, "SELECT "+vehicleCols+" FROM acct_vehicle WHERE id = ?", id)
	return scanVehicle(row)
}

// InsertVehicle 新增一辆车。
func (s *Store) InsertVehicle(ctx context.Context, q queryer, ownerID int64,
	level int) (int64, error) {
	res, err := q.ExecContext(ctx,
		"INSERT INTO acct_vehicle (owner_id, lv, state, born_at) VALUES (?, ?, 0, ?)",
		ownerID, level, time.Now())
	if err != nil {
		return 0, classify(err)
	}
	return res.LastInsertId()
}

// RemoveVehicle 删除车辆。只有空闲状态的车允许删除，停车中的车必须先结算。
func (s *Store) RemoveVehicle(ctx context.Context, q queryer, ownerID, vehicleID int64) error {
	return requireAffected(q.ExecContext(ctx,
		"DELETE FROM acct_vehicle WHERE id = ? AND owner_id = ? AND state = 0", vehicleID, ownerID))
}

// CountVehicles 统计某人当前拥有的车辆数，用于额度校验。
func (s *Store) CountVehicles(ctx context.Context, q queryer, ownerID int64) (int, error) {
	var n int
	err := q.QueryRowContext(ctx,
		"SELECT COUNT(1) FROM acct_vehicle WHERE owner_id = ?", ownerID).Scan(&n)
	if err != nil {
		return 0, classify(err)
	}
	return n, nil
}

// TakeVehicle 用一次条件更新把车辆从 from 状态改成 to，影响行数为零表示被别人先改了。
// 这就是「手快有、手慢无」的落锁点：只有一个人能把同一辆车从空闲改成停车中。
func (s *Store) TakeVehicle(ctx context.Context, q queryer, vehicleID int64, ownerID int64,
	from, to gameplay.VehicleState) error {
	res, err := q.ExecContext(ctx,
		"UPDATE acct_vehicle SET state = ? WHERE id = ? AND owner_id = ? AND state = ?",
		to, vehicleID, ownerID, from)
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

// IdleVehiclesOf 取某人空闲的车，机器人巡检用它发车。
func (s *Store) IdleVehiclesOf(ctx context.Context, ownerID int64, limit int) ([]Vehicle, error) {
	if limit <= 0 {
		limit = 10
	}
	const query = `
		SELECT id, owner_id, lv, state, born_at
		FROM acct_vehicle
		WHERE owner_id = ? AND state = 0
		ORDER BY lv DESC
		LIMIT ?`
	rows, err := s.Query(ctx, query, ownerID, limit)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]Vehicle, 0, limit)
	for rows.Next() {
		v, err := scanVehicle(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, v)
	}
	return out, rows.Err()
}

// VehiclesWithLease 返回车库卡片列表：车辆 + 当前租约的对方信息。
// 用一条左连接语句拿全，避免前端为每辆车再发一次请求。
func (s *Store) VehiclesWithLease(ctx context.Context, ownerID int64) ([]VehicleCard, error) {
	const query = `
		SELECT v.id, v.owner_id, v.lv, v.state, v.born_at,
		       COALESCE(l.host_id, 0), COALESCE(h.nick, ''), COALESCE(h.lv, 0), l.began_at
		FROM acct_vehicle v
		LEFT JOIN lot_lease l ON l.vehicle_id = v.id AND l.status = 0
		LEFT JOIN acct_player h ON h.id = l.host_id
		WHERE v.owner_id = ?
		ORDER BY v.lv DESC, v.id ASC`
	rows, err := s.Query(ctx, query, ownerID)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]VehicleCard, 0, 10)
	for rows.Next() {
		var (
			c     VehicleCard
			began sql.NullTime
		)
		if err := rows.Scan(&c.ID, &c.OwnerID, &c.Level, &c.State, &c.BornAt,
			&c.HostID, &c.HostNick, &c.HostLevel, &began); err != nil {
			return nil, err
		}
		if began.Valid {
			t := began.Time
			c.BeganAt = &t
		}
		out = append(out, c)
	}
	return out, rows.Err()
}
