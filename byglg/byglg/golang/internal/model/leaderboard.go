package model

import (
	"time"
)

// Leaderboard 排行榜表
type Leaderboard struct {
	ID       uint      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID   string    `gorm:"column:user_id;type:varchar(64);uniqueIndex:uk_user_game_date" json:"user_id"`
	GameID   string    `gorm:"column:game_id;type:varchar(50);uniqueIndex:uk_user_game_date" json:"game_id"`
	Score    int       `gorm:"column:score;default:0" json:"score"`
	Level    int       `gorm:"column:level;default:1" json:"level"`
	RankDate time.Time `gorm:"column:rank_date;type:date;uniqueIndex:uk_user_game_date" json:"rank_date"`
	RankType string    `gorm:"column:rank_type;type:varchar(20);default:'daily'" json:"rank_type"` // 排名类型 (daily/weekly/all)
}

// TableName 指定表名
func (Leaderboard) TableName() string {
	return "leaderboard"
}
