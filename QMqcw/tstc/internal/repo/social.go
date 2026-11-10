package repo

import (
	"context"
	"database/sql"
	"time"

	"tstc/internal/money"
)

// BondsOf 列出通讯录：好友按「有空位 + 等级高」排序，仇人按热度排序。
func (s *Store) BondsOf(ctx context.Context, holderID int64, kind string) ([]BondCard, error) {
	order := "p.lv DESC, free_cells DESC"
	if kind == BondFoe {
		order = "b.heat DESC, b.last_at DESC"
	}
	query := `
		SELECT b.id, b.holder_id, b.target_id, b.kind, b.heat, b.last_at,
		       p.nick, p.lv, p.uid,
		       (SELECT COUNT(1) FROM lot_cell c WHERE c.owner_id = p.id AND c.state = 0) AS free_cells,
		       (SELECT COUNT(1) FROM lot_cell c WHERE c.owner_id = p.id) AS total_cells
		FROM social_bond b
		JOIN acct_player p ON p.id = b.target_id
		WHERE b.holder_id = ? AND b.kind = ?
		ORDER BY ` + order + `
		LIMIT 100`
	rows, err := s.Query(ctx, query, holderID, kind)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]BondCard, 0, 16)
	for rows.Next() {
		var c BondCard
		if err := rows.Scan(&c.ID, &c.HolderID, &c.TargetID, &c.Kind, &c.Heat, &c.LastAt,
			&c.TargetNick, &c.TargetLevel, &c.TargetUID, &c.FreeCells, &c.TotalCells); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

// UpsertBond 写关系。一个人对同一个人只保留一种关系，重复标记直接覆盖种类。
func (s *Store) UpsertBond(ctx context.Context, q queryer, holderID, targetID int64, kind string) error {
	_, err := q.ExecContext(ctx, `
		INSERT INTO social_bond (holder_id, target_id, kind, heat, last_at)
		VALUES (?, ?, ?, 0, ?)
		ON DUPLICATE KEY UPDATE kind = VALUES(kind), last_at = VALUES(last_at)`,
		holderID, targetID, kind, time.Now())
	return classify(err)
}

// BumpHeat 给某条关系加热度，贴条会自动调用它，仇人列表因此自然浮上来。
func (s *Store) BumpHeat(ctx context.Context, q queryer, holderID, targetID int64) error {
	_, err := q.ExecContext(ctx, `
		UPDATE social_bond SET heat = heat + 1, last_at = ?
		WHERE holder_id = ? AND target_id = ? AND kind = ?`,
		time.Now(), holderID, targetID, BondFoe)
	return classify(err)
}

// HeatOf 读某条关系的热度，用于动态播报里的措辞分级。
func (s *Store) HeatOf(ctx context.Context, holderID, targetID int64) (int, error) {
	var heat int
	err := s.QueryRow(ctx,
		"SELECT heat FROM social_bond WHERE holder_id = ? AND target_id = ?", holderID, targetID).Scan(&heat)
	if err != nil {
		return 0, classify(err)
	}
	return heat, nil
}

// AddFeed 记一条访客动态。
func (s *Store) AddFeed(ctx context.Context, q queryer, hostID, actorID int64, kind, vlevel int, vname string, coin money.Coin) error {
	_, err := q.ExecContext(ctx, `
		INSERT INTO feed_note (host_id, actor_id, kind, v_level, v_name, coin, at)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		hostID, actorID, kind, vlevel, vname, int64(coin), time.Now())
	return classify(err)
}

// FeedOf 取某人在指定时间之后的动态。
func (s *Store) FeedOf(ctx context.Context, hostID int64, since time.Time, limit int) ([]FeedCard, error) {
	if limit <= 0 {
		limit = 30
	}
	const query = `
		SELECT f.id, f.host_id, f.actor_id, f.kind, f.v_level, f.v_name, f.coin, f.at,
		       p.nick, p.lv
		FROM feed_note f
		JOIN acct_player p ON p.id = f.actor_id
		WHERE f.host_id = ? AND f.at >= ?
		ORDER BY f.at DESC
		LIMIT ?`
	rows, err := s.Query(ctx, query, hostID, since, limit)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]FeedCard, 0, limit)
	for rows.Next() {
		var c FeedCard
		if err := rows.Scan(&c.ID, &c.HostID, &c.ActorID, &c.Kind, &c.VLevel, &c.VName,
			&c.Coin, &c.At, &c.ActorNick, &c.ActorLevel); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

// PurgeFeed 清掉过期动态，避免动态表无限膨胀。
func (s *Store) PurgeFeed(ctx context.Context, before time.Time) (int64, error) {
	res, err := s.Exec(ctx, "DELETE FROM feed_note WHERE at < ? LIMIT 500", before)
	if err != nil {
		return 0, classify(err)
	}
	return res.RowsAffected()
}

// RelationKinds 返回某人到某人的关系种类，没有关系时返回空串。
func (s *Store) RelationKinds(ctx context.Context, q queryer, holderID, targetID int64) (string, error) {
	var kind string
	err := q.QueryRowContext(ctx,
		"SELECT kind FROM social_bond WHERE holder_id = ? AND target_id = ?", holderID, targetID).Scan(&kind)
	if err != nil {
		if e := classify(err); e == ErrNoRow {
			return "", nil
		}
		return "", classify(err)
	}
	return kind, nil
}

// ensure sql 包被引用：仓储层统一用 database/sql 的类型表达空值。
var _ = sql.ErrNoRows
