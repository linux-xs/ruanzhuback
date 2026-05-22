package dao

import (
	"database/sql"
	"fmt"

	"qmqcw/conf"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitMySQL() error {
	cfg := conf.Cfg.Mysql
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=true&loc=Local",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Database, cfg.Charset)

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return err
	}

	DB.SetMaxOpenConns(cfg.MaxOpenConns)
	DB.SetMaxIdleConns(cfg.MaxIdleConns)

	if err = DB.Ping(); err != nil {
		return err
	}

	return nil
}
