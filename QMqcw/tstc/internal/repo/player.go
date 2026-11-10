package repo

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"tstc/internal/gameplay"
	"tstc/internal/money"
)

// queryer 抽出发送 SQL 的最小能力，*sql.DB 与 *sql.Tx 都满足它。
// 这样同一套语句既能在事务里跑，也能独立执行，不必写两份。
type queryer interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

const playerCols = "id, uid, nick, avatar, lv, exp, coin, card, ad_used, ad_day, bot, created_at"

func scanPlayer(sc interface{ Scan(...any) error }) (Player, error) {
	var p Player
	err := sc.Scan(&p.ID, &p.UID, &p.Nick, &p.Avatar, &p.Level, &p.Exp,
		&p.Coin, &p.Card, &p.AdUsed, &p.AdDay, &p.Bot, &p.CreatedAt)
	if err != nil {
		return Player{}, classify(err)
	}
	return p, nil
}

// PlayerByID 按主键取玩家。
func (s *Store) PlayerByID(ctx context.Context, id int64) (Player, error) {
	row := s.QueryRow(ctx, "SELECT "+playerCols+" FROM acct_player WHERE id = ?", id)
	return scanPlayer(row)
}

// PlayerByUID 按对外短号取玩家。
func (s *Store) PlayerByUID(ctx context.Context, uid string) (Player, error) {
	row := s.QueryRow(ctx, "SELECT "+playerCols+" FROM acct_player WHERE uid = ?",
		strings.ToUpper(uid))
	return scanPlayer(row)
}

// PlayerIn 在指定连接（通常是事务）里读取玩家。
func (s *Store) PlayerIn(ctx context.Context, q queryer, id int64) (Player, error) {
	row := q.QueryRowContext(ctx, "SELECT "+playerCols+" FROM acct_player WHERE id = ?", id)
	return scanPlayer(row)
}

// LockPlayer 在事务内加行锁读取玩家，用于余额与幸运卡这类必须串行的改动。
func (s *Store) LockPlayer(ctx context.Context, tx *sql.Tx, id int64) (Player, error) {
	row := tx.QueryRowContext(ctx,
		"SELECT "+playerCols+" FROM acct_player WHERE id = ? FOR UPDATE", id)
	return scanPlayer(row)
}

// InsertPlayer 建号，短号由调用方生成。
func (s *Store) InsertPlayer(ctx context.Context, q queryer, p Player) (int64, error) {
	res, err := q.ExecContext(ctx,
		`INSERT INTO acct_player (uid, nick, avatar, lv, exp, coin, card, ad_used, ad_day, bot)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		p.UID, p.Nick, p.Avatar, p.Level, p.Exp, int64(p.Coin), p.Card, p.AdUsed, p.AdDay, p.Bot)
	if err != nil {
		return 0, classify(err)
	}
	return res.LastInsertId()
}

// BumpNick 改昵称，空昵称直接拒绝，避免界面出现无名字的卡片。
func (s *Store) BumpNick(ctx context.Context, id int64, nick string) error {
	nick = strings.TrimSpace(nick)
	if nick == "" {
		return ErrConflict
	}
	return requireAffected(s.Exec(ctx, "UPDATE acct_player SET nick = ? WHERE id = ?", nick, id))
}

// AddCoin 调整余额。delta 为负时要求调整后不为负，否则返回冲突。
func (s *Store) AddCoin(ctx context.Context, q queryer, id int64, delta money.Coin) error {
	if delta == 0 {
		return nil
	}
	_, err := q.ExecContext(ctx,
		"UPDATE acct_player SET coin = coin + ? WHERE id = ? AND coin + ? >= 0",
		int64(delta), id, int64(delta))
	if err != nil {
		return classify(err)
	}
	return nil
}

// AddCard 调整幸运卡数量，扣减时要求余量足够。
func (s *Store) AddCard(ctx context.Context, q queryer, id int64, delta int) error {
	if delta == 0 {
		return nil
	}
	res, err := q.ExecContext(ctx,
		"UPDATE acct_player SET card = card + ? WHERE id = ? AND card + ? >= 0",
		delta, id, delta)
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

// ClaimAdCard 领取看广告的幸运卡：跨天先刷额度，再判断当日是否还有名额。
// 返回领取后的幸运卡总数与今日已用次数。
func (s *Store) ClaimAdCard(ctx context.Context, tx *sql.Tx, id int64,
	today string, quota int) (int, int, error) {
	p, err := s.LockPlayer(ctx, tx, id)
	if err != nil {
		return 0, 0, err
	}
	used := p.AdUsed
	if p.AdDay != today {
		used = 0
	}
	if used >= quota {
		return p.Card, used, ErrConflict
	}
	used++
	_, err = tx.ExecContext(ctx,
		"UPDATE acct_player SET card = card + 1, ad_used = ?, ad_day = ? WHERE id = ?",
		used, today, id)
	if err != nil {
		return 0, 0, classify(err)
	}
	return p.Card + 1, used, nil
}

// GainExp 增加经验并按需升级，返回升级后的等级与剩余经验。
// 等级封顶 100，满级后经验停留在当前值不再累加。
func (s *Store) GainExp(ctx context.Context, q queryer, id int64, gain int) (int, int, error) {
	var level, exp int
	err := q.QueryRowContext(ctx, "SELECT lv, exp FROM acct_player WHERE id = ?", id).
		Scan(&level, &exp)
	if err != nil {
		return 0, 0, classify(err)
	}
	if gain > 0 {
		exp += gain
		for level < 100 {
			need := gameplay.LevelUpExp(level)
			if need <= 0 || exp < need {
				break
			}
			exp -= need
			level++
		}
		if level >= 100 {
			level = 100
			exp = 0
		}
	}
	if _, err := q.ExecContext(ctx,
		"UPDATE acct_player SET lv = ?, exp = ? WHERE id = ?", level, exp, id); err != nil {
		return 0, 0, classify(err)
	}
	return level, exp, nil
}

// AdSlot 返回今日剩余的可领取次数。
func AdSlot(p Player, today string, quota int) int {
	used := p.AdUsed
	if p.AdDay != today {
		used = 0
	}
	left := quota - used
	if left < 0 {
		return 0
	}
	return left
}

// SignedToday 判断今天是否已经签到过。
func (s *Store) SignedToday(ctx context.Context, playerID int64, day string) (bool, error) {
	var n int
	err := s.QueryRow(ctx,
		"SELECT COUNT(1) FROM day_sign WHERE player_id = ? AND day = ?", playerID, day).Scan(&n)
	if err != nil {
		return false, classify(err)
	}
	return n > 0, nil
}

// RecordSign 写入签到流水，重复签到由唯一键拦住。
func (s *Store) RecordSign(ctx context.Context, q queryer, playerID int64,
	day string, way gameplay.SignWay, coin money.Coin) error {
	_, err := q.ExecContext(ctx,
		"INSERT INTO day_sign (player_id, day, way, coin) VALUES (?, ?, ?, ?)",
		playerID, day, string(way), int64(coin))
	return classify(err)
}

// SignStreak 返回最近连续签到天数，用于首页展示。
func (s *Store) SignStreak(ctx context.Context, playerID int64, today time.Time) (int, error) {
	rows, err := s.Query(ctx,
		"SELECT day FROM day_sign WHERE player_id = ? ORDER BY day DESC LIMIT 30", playerID)
	if err != nil {
		return 0, classify(err)
	}
	defer rows.Close()

	streak := 0
	cursor := today
	for rows.Next() {
		var day string
		if err := rows.Scan(&day); err != nil {
			return streak, err
		}
		expect := cursor.Format("2006-01-02")
		if day == expect {
			streak++
			cursor = cursor.AddDate(0, 0, -1)
			continue
		}
		if streak == 0 && day == cursor.AddDate(0, 0, -1).Format("2006-01-02") {
			cursor = cursor.AddDate(0, 0, -1)
			continue
		}
		break
	}
	return streak, rows.Err()
}

// SearchByUID 做通讯录里的按号找人，命中自己的号码时由服务层过滤。
func (s *Store) SearchByUID(ctx context.Context, uid string) (Player, error) {
	row := s.QueryRow(ctx, "SELECT "+playerCols+" FROM acct_player WHERE uid = ?",
		strings.ToUpper(uid))
	return scanPlayer(row)
}

// Bots 取一批机器人账号，供定时巡检脚本使用。
func (s *Store) Bots(ctx context.Context, limit int) ([]Player, error) {
	if limit <= 0 {
		limit = 100
	}
	rows, err := s.Query(ctx,
		"SELECT "+playerCols+" FROM acct_player WHERE bot = 1 ORDER BY id LIMIT ?", limit)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]Player, 0, limit)
	for rows.Next() {
		p, err := scanPlayer(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

// TopPlayers 是「推荐玩家」列表的数据源：优先取等级高、有空位的活人。
func (s *Store) TopPlayers(ctx context.Context, excludeID int64, limit int) ([]BondCard, error) {
	if limit <= 0 {
		limit = 10
	}
	query := fmt.Sprintf(`
		SELECT p.id, p.uid, p.nick, p.lv,
		       (SELECT COUNT(1) FROM lot_cell c WHERE c.owner_id = p.id AND c.state = 0) AS free_cells,
		       (SELECT COUNT(1) FROM lot_cell c WHERE c.owner_id = p.id) AS total_cells
		FROM acct_player p
		WHERE p.id <> ? AND p.bot = 0
		HAVING free_cells > 0
		ORDER BY p.lv DESC, free_cells DESC
		LIMIT %d`, limit)
	rows, err := s.Query(ctx, query, excludeID)
	if err != nil {
		return nil, classify(err)
	}
	defer rows.Close()

	out := make([]BondCard, 0, limit)
	for rows.Next() {
		var c BondCard
		if err := rows.Scan(&c.TargetID, &c.TargetUID, &c.TargetNick, &c.TargetLevel,
			&c.FreeCells, &c.TotalCells); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}
