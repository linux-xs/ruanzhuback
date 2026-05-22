package model

import (
	"time"
)

// AdRecord 广告记录表
type AdRecord struct {
	ID          uint      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID      string    `gorm:"column:user_id;type:varchar(64)" json:"user_id"`
	GameID      string    `gorm:"column:game_id;type:varchar(50)" json:"game_id"`
	AdType      string    `gorm:"column:ad_type;type:varchar(20)" json:"ad_type"` // 广告类型 (video/free/energy)
	WatchTime   time.Time `gorm:"column:watch_time;autoCreateTime" json:"watch_time"`
	AdUnitID    string    `gorm:"column:ad_unit_id;type:varchar(100)" json:"ad_unit_id"`
	RewardType  string    `gorm:"column:reward_type;type:varchar(20)" json:"reward_type"` // 奖励类型 (continue/energy/vip)
	RewardAmount int      `gorm:"column:reward_amount;default:1" json:"reward_amount"`
	IsCompleted bool      `gorm:"column:is_completed;default:true" json:"is_completed"`
}

// TableName 指定表名
func (AdRecord) TableName() string {
	return "ad_record"
}
