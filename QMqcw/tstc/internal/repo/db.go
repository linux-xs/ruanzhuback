// Package repo 负责 MySQL 持久化：连接池、事务边界与各表的最小查询集。
// 业务规则不写在这里，这里只保证「读到的数据是对的、写下去的变更能回滚」。
package repo

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/go-sql-driver/mysql"
)

// 仓储层对外暴露的错误，服务层据此映射成接口提示。
var (
	// ErrNoRow 表示按条件没有查到记录。
	ErrNoRow = errors.New("记录不存在")
	// ErrConflict 表示并发写入时条件已被别人改掉。
	ErrConflict = errors.New("数据已被改动，请刷新后重试")
	// ErrDuplicate 表示唯一键冲突（重复签到、重复建号等）。
	ErrDuplicate = errors.New("记录已存在")
)

// Config 是连接数据源需要的参数。
type Config struct {
	User     string
	Secret   string
	Host     string
	Port     int
	Schema   string
	MaxOpen  int
	MaxIdle  int
	LifeTime time.Duration
}

// DSN 拼装 go-sql-driver 使用的连接串。
func (c Config) DSN() string {
	if c.Port <= 0 {
		c.Port = 3306
	}
	cfg := mysql.NewConfig()
	cfg.User = c.User
	cfg.Passwd = c.Secret
	cfg.Net = "tcp"
	cfg.Addr = fmt.Sprintf("%s:%d", c.Host, c.Port)
	cfg.DBName = c.Schema
	cfg.ParseTime = true
	cfg.Loc = time.Local
	cfg.Collation = "utf8mb4_unicode_ci"
	cfg.Params = map[string]string{"charset": "utf8mb4"}
	cfg.InterpolateParams = true
	return cfg.FormatDSN()
}

// Store 持有底层连接池，是仓储层的入口。
type Store struct {
	db *sql.DB
}

// Open 建立连接池并按需做一次探活。
func Open(ctx context.Context, cfg Config) (*Store, error) {
	db, err := sql.Open("mysql", cfg.DSN())
	if err != nil {
		return nil, err
	}
	if cfg.MaxOpen > 0 {
		db.SetMaxOpenConns(cfg.MaxOpen)
	}
	if cfg.MaxIdle > 0 {
		db.SetMaxIdleConns(cfg.MaxIdle)
	}
	if cfg.LifeTime > 0 {
		db.SetConnMaxLifetime(cfg.LifeTime)
	}
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := db.PingContext(pingCtx); err != nil {
		_ = db.Close()
		return nil, err
	}
	return &Store{db: db}, nil
}

// Close 关闭连接池。
func (s *Store) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

// InTx 把一组写操作放进同一个事务；回调返回错误则整体回滚。
func (s *Store) InTx(ctx context.Context, fn func(tx *sql.Tx) error) error {
	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelReadCommitted})
	if err != nil {
		return err
	}
	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}
	return tx.Commit()
}

// QueryRow 是对 *sql.DB 的薄封装，让各仓储方法少写一层 s.db。
func (s *Store) QueryRow(ctx context.Context, query string, args ...any) *sql.Row {
	return s.db.QueryRowContext(ctx, query, args...)
}

// Query 是对 *sql.DB 的薄封装。
func (s *Store) Query(ctx context.Context, query string, args ...any) (*sql.Rows, error) {
	return s.db.QueryContext(ctx, query, args...)
}

// Exec 是对 *sql.DB 的薄封装。
func (s *Store) Exec(ctx context.Context, query string, args ...any) (sql.Result, error) {
	return s.db.ExecContext(ctx, query, args...)
}

// 下面三个方法让 *Store 同时满足 queryer 接口，
// 这样「不关心事务」的调用可以直接把 Store 传进去，少写一次分支。
func (s *Store) ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error) {
	return s.db.ExecContext(ctx, query, args...)
}

func (s *Store) QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error) {
	return s.db.QueryContext(ctx, query, args...)
}

func (s *Store) QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row {
	return s.db.QueryRowContext(ctx, query, args...)
}

// classify 把驱动返回的错误归一到仓储层错误，方便上层统一处理。
func classify(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNoRow
	}
	var me *mysql.MySQLError
	if errors.As(err, &me) && me.Number == 1062 {
		return ErrDuplicate
	}
	return err
}

// requireAffected 在条件更新影响行数为零时返回冲突错误。
func requireAffected(res sql.Result, err error) error {
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
