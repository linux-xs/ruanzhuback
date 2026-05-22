package model

import (
	"time"
)

// EnergySystem 体力系统表
type EnergySystem struct {
	UserID          int64     `gorm:"column:user_id;type:varchar(64);primaryKey" json:"user_id"`
	CurrentEnergy   int       `gorm:"column:current_energy;default:200" json:"current_energy"`
	MaxEnergy       int       `gorm:"column:max_energy;default:200" json:"max_energy"`
	LastRecoverTime time.Time `gorm:"column:last_recover_time" json:"last_recover_time"`
	RecoverInterval int       `gorm:"column:recover_interval;default:300" json:"recover_interval"` // 恢复间隔（秒）
	RecoverAmount   int       `gorm:"column:recover_amount;default:1" json:"recover_amount"`        // 每次恢复量
	EnergyCapTime   time.Time `gorm:"column:energy_cap_time" json:"energy_cap_time"`
}

// TableName 指定表名
func (EnergySystem) TableName() string {
	return "energy_system"
}
