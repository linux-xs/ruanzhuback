package model

import (
	"time"
)

// FreeAdQuota 免广告次数表
type FreeAdQuota struct {
	ID           uint      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID       string    `gorm:"column:user_id;type:varchar(64);uniqueIndex:uk_user_game" json:"user_id"`
	GameID       string    `gorm:"column:game_id;type:varchar(50);uniqueIndex:uk_user_game" json:"game_id"`
	FreeCount    int       `gorm:"column:free_count;default:0" json:"free_count"`
	MaxFreeCount int       `gorm:"column:max_free_count;default:2" json:"max_free_count"`
	ResetDate    time.Time `gorm:"column:reset_date;type:date" json:"reset_date"`
}

// TableName 指定表名
func (FreeAdQuota) TableName() string {
	return "free_ad_quota"
}
