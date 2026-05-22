package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

// Config 全局配置结构
type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	Log      LogConfig      `mapstructure:"log"`
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	MySQL MySQLConfig `mapstructure:"mysql"`
}

// MySQLConfig MySQL配置
type MySQLConfig struct {
	Host         string `mapstructure:"host"`
	Port         int    `mapstructure:"port"`
	Username     string `mapstructure:"username"`
	Password     string `mapstructure:"password"`
	DBName       string `mapstructure:"dbname"`
	Charset      string `mapstructure:"charset"`
	MaxIdleConns int    `mapstructure:"max_idle_conns"`
	MaxOpenConns int    `mapstructure:"max_open_conns"`
	LogLevel     string `mapstructure:"log_level"`
}

// JWTConfig JWT配置
type JWTConfig struct {
	Secret string `mapstructure:"secret"`
	Expire int    `mapstructure:"expire"`
}

// LogConfig 日志配置
type LogConfig struct {
	Level  string `mapstructure:"level"`
	Format string `mapstructure:"format"`
	Output string `mapstructure:"output"`
}

// GlobalConfig 全局配置实例
var GlobalConfig *Config

// InitConfig 初始化配置
func InitConfig() error {
	v := viper.New()
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath("./conf")
	v.AddConfigPath("../conf")
	v.AddConfigPath("../../conf")

	// 读取配置文件
	if err := v.ReadInConfig(); err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	// 解析配置到结构体
	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return fmt.Errorf("failed to unmarshal config: %w", err)
	}

	GlobalConfig = &cfg
	return nil
}

// GetDSN 获取数据库连接字符串
func (m *MySQLConfig) GetDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
		m.Username,
		m.Password,
		m.Host,
		m.Port,
		m.DBName,
		m.Charset,
	)
}

// GetEnvOrDefault 获取环境变量，如果不存在则返回默认值
func GetEnvOrDefault(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
