package model

// UserSettings 设置表
type UserSettings struct {
	UserID             string `gorm:"column:user_id;type:varchar(64);primaryKey" json:"user_id"`
	MusicEnabled       bool   `gorm:"column:music_enabled;default:true" json:"music_enabled"`
	SoundEnabled       bool   `gorm:"column:sound_enabled;default:true" json:"sound_enabled"`
	VibrationEnabled   bool   `gorm:"column:vibration_enabled;default:true" json:"vibration_enabled"`
	NotificationEnabled bool  `gorm:"column:notification_enabled;default:true" json:"notification_enabled"`
	Language           string `gorm:"column:language;type:varchar(10);default:'zh-CN'" json:"language"`
}

// TableName 指定表名
func (UserSettings) TableName() string {
	return "user_settings"
}
