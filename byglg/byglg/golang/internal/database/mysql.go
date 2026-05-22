package database

import (
	"log"
	"time"

	"byglg/internal/config"
	"byglg/internal/model"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitMySQL 初始化MySQL连接
func InitMySQL(cfg *config.MySQLConfig) error {
	dsn := cfg.GetDSN()

	// 配置日志级别
	var logLevel logger.LogLevel
	switch cfg.LogLevel {
	case "silent":
		logLevel = logger.Silent
	case "error":
		logLevel = logger.Error
	case "warn":
		logLevel = logger.Warn
	case "info":
		logLevel = logger.Info
	default:
		logLevel = logger.Info
	}

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.New(
			log.New(log.Writer(), log.Prefix(), log.Flags()),
			logger.Config{
				SlowThreshold:             200 * time.Millisecond,
				LogLevel:                  logLevel,
				IgnoreRecordNotFoundError: true,
				ParameterizedQueries:      true,
				Colorful:                  true,
			},
		),
	})

	if err != nil {
		return err
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	// 设置连接池
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return nil
}

// AutoMigrate 自动迁移数据库表
func AutoMigrate() error {
	return DB.AutoMigrate(
		&model.UserInfo{},
		&model.EnergySystem{},
		&model.GameProgress{},
		&model.AdRecord{},
		&model.FreeAdQuota{},
		&model.Leaderboard{},
		&model.UserSettings{},
	)
}

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}
