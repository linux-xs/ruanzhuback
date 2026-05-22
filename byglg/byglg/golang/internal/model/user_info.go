package model

import (
	"time"
)

// UserInfo 用户信息表
type UserInfo struct {
	UserID           string    `gorm:"column:user_id;type:varchar(64);primaryKey" json:"user_id"`
	NickName         string    `gorm:"column:nick_name;type:varchar(100)" json:"nick_name"`
	AvatarURL        string    `gorm:"column:avatar_url;type:varchar(500)" json:"avatar_url"`
	Gender           int8      `gorm:"column:gender;type:tinyint;default:0" json:"gender"` // 0-未知 1-男 2-女
	CreateTime       time.Time `gorm:"column:create_time;autoCreateTime" json:"create_time"`
	LastLoginTime    time.Time `gorm:"column:last_login_time" json:"last_login_time"`
	TotalGamesPlayed int       `gorm:"column:total_games_played;default:0" json:"total_games_played"`
	TotalAdsWatched  int       `gorm:"column:total_ads_watched;default:0" json:"total_ads_watched"`
	VipExpireTime    time.Time `gorm:"column:vip_expire_time" json:"vip_expire_time"`
	IsNewUser        bool      `gorm:"column:is_new_user;default:true" json:"is_new_user"`
}

// TableName 指定表名
func (UserInfo) TableName() string {
	return "user_info"
}
