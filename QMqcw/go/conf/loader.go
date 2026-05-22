package conf

import (
	"os"

	"gopkg.in/yaml.v3"
)

type MysqlConfig struct {
	Host         string `yaml:"host"`
	Port         int    `yaml:"port"`
	User         string `yaml:"user"`
	Password     string `yaml:"password"`
	Database     string `yaml:"database"`
	Charset      string `yaml:"charset"`
	MaxOpenConns int    `yaml:"max_open_conns"`
	MaxIdleConns int    `yaml:"max_idle_conns"`
}

type SystemConfig struct {
	BotCount            int `yaml:"bot_count"`
	BotCronInterval     int `yaml:"bot_cron_interval"`
	BotTicketThreshold  int `yaml:"bot_ticket_threshold"`
	VisitorLogKeepHours int `yaml:"visitor_log_keep_hours"`
}

type ServerConfig struct {
	Port int    `yaml:"port"`
	Mode string `yaml:"mode"`
}

type GameConfig struct {
	MaxLevel            int     `yaml:"max_level"`
	MaxCars             int     `yaml:"max_cars"`
	MaxSpaces           int     `yaml:"max_spaces"`
	SellBackRate        float64 `yaml:"sell_back_rate"`
	RecallRate          float64 `yaml:"recall_rate"`
	TicketRate          float64 `yaml:"ticket_rate"`
	TicketOwnerRate     float64 `yaml:"ticket_owner_rate"`
	ParkFullHours       int     `yaml:"park_full_hours"`
	LockPeriodMinutes   int     `yaml:"lock_period_minutes"`
	EscapePeriodMinutes int     `yaml:"escape_period_minutes"`
	KillPeriodMinutes   int     `yaml:"kill_period_minutes"`
	DailyLuckyCardLimit int     `yaml:"daily_lucky_card_limit"`
}

var Cfg = new(Config)

type Config struct {
	Mysql  MysqlConfig  `yaml:"mysql"`
	System SystemConfig `yaml:"system"`
	Server ServerConfig `yaml:"server"`
	Game   GameConfig   `yaml:"game"`
}

func Init() error {
	// 加载数据库和系统配置
	dbBuf, err := os.ReadFile("conf/config.yaml")
	if err != nil {
		return err
	}
	if err = yaml.Unmarshal(dbBuf, Cfg); err != nil {
		return err
	}

	// 加载服务和游戏配置
	appBuf, err := os.ReadFile("conf/app.yaml")
	if err != nil {
		return err
	}
	if err = yaml.Unmarshal(appBuf, Cfg); err != nil {
		return err
	}

	return nil
}
