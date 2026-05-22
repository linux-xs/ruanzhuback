package model

import "time"

// 玩家表
type Player struct {
	Id           int       `json:"id"`
	PlayerUid    string    `json:"player_uid"`
	Nickname     string    `json:"nickname"`
	Avatar       string    `json:"avatar"`
	Level        int       `json:"level"`
	Exp          int64     `json:"exp"`
	Gold         int64     `json:"gold"`
	LuckyCard    int       `json:"lucky_card"`
	DailyAdCount int       `json:"daily_ad_count"`
	IsBot        int8      `json:"is_bot"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// 车辆表
type Car struct {
	Id        int       `json:"id"`
	PlayerId  int       `json:"player_id"`
	CarLevel  int       `json:"car_level"`
	CarName   string    `json:"car_name"`
	Status    int8      `json:"status"` // 0空闲 1停车中
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// 车位表
type Space struct {
	Id        int       `json:"id"`
	PlayerId  int       `json:"player_id"`
	SlotIndex int       `json:"slot_index"`
	Status    int8      `json:"status"` // 0空闲 1被占用
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// 停车记录表
type ParkRecord struct {
	Id           int       `json:"id"`
	CarId        int       `json:"car_id"`
	SpaceId      int       `json:"space_id"`
	CarOwnerId   int       `json:"car_owner_id"`
	SpaceOwnerId int       `json:"space_owner_id"`
	StartTime    time.Time `json:"start_time"`
	EndTime      time.Time `json:"end_time"`
	Status       int8      `json:"status"`      // 0停车中 1已结算
	SettleType   int8      `json:"settle_type"` // 0无 1召回 2贴条 3自然 4幸运卡
	TotalGold    int64     `json:"total_gold"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// 社交关系表
type SocialRelation struct {
	Id        int       `json:"id"`
	PlayerId  int       `json:"player_id"`
	TargetId  int       `json:"target_id"`
	RelType   int8      `json:"rel_type"` // 1好友 2仇人
	HateCount int       `json:"hate_count"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// 访客动态表
type VisitorLog struct {
	Id         int       `json:"id"`
	PlayerId   int       `json:"player_id"`
	VisitorId  int       `json:"visitor_id"`
	EventType  int8      `json:"event_type"` // 1停车 2离开 3被贴条
	CarLevel   int       `json:"car_level"`
	CarName    string    `json:"car_name"`
	GoldIncome int64     `json:"gold_income"`
	CreatedAt  time.Time `json:"created_at"`
}

// 签到记录表
type SignRecord struct {
	Id        int       `json:"id"`
	PlayerId  int       `json:"player_id"`
	SignDate  string    `json:"sign_date"`
	SignType  int8      `json:"sign_type"` // 1普通 2幸运卡
	CreatedAt time.Time `json:"created_at"`
}
