package model

import (
	"time"
)

// GameProgress 游戏进度表
type GameProgress struct {
	ID             uint      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID         string    `gorm:"column:user_id;type:varchar(64);uniqueIndex:uk_user_game" json:"user_id"`
	GameID         string    `gorm:"column:game_id;type:varchar(50);uniqueIndex:uk_user_game" json:"game_id"`
	CurrentLevel   int       `gorm:"column:current_level;default:1" json:"current_level"`
	MaxLevel       int       `gorm:"column:max_level;default:1" json:"max_level"`
	BestScore      int       `gorm:"column:best_score;default:0" json:"best_score"`
	TotalPlayTime  int       `gorm:"column:total_play_time;default:0" json:"total_play_time"` // 总游戏时长（秒）
	PlayCount      int       `gorm:"column:play_count;default:0" json:"play_count"`
	LastPlayTime   time.Time `gorm:"column:last_play_time" json:"last_play_time"`
	LevelData      string    `gorm:"column:level_data;type:json" json:"level_data"` // 关卡解锁状态JSON
}

// TableName 指定表名
func (GameProgress) TableName() string {
	return "game_progress"
}
