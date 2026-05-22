package handler

import (
	"net/http"
	"time"

	"byglg/internal/database"
	"byglg/internal/model"

	"github.com/gin-gonic/gin"
)

// EnergyHandler 体力系统处理器
type EnergyHandler struct{}

// NewEnergyHandler 创建体力处理器实例
func NewEnergyHandler() *EnergyHandler {
	return &EnergyHandler{}
}

// GetEnergy 获取用户体力信息
func (h *EnergyHandler) GetEnergy(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	var energy model.EnergySystem
	if err := database.DB.Where("user_id = ?", userID).First(&energy).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "energy data not found"})
		return
	}

	// 计算当前恢复的体力
	now := time.Now()
	elapsed := int(now.Sub(energy.LastRecoverTime).Seconds())
	recoverTimes := elapsed / energy.RecoverInterval
	recoveredAmount := recoverTimes * energy.RecoverAmount
	currentEnergy := energy.CurrentEnergy + recoveredAmount
	if currentEnergy > energy.MaxEnergy {
		currentEnergy = energy.MaxEnergy
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"current_energy":  currentEnergy,
			"max_energy":      energy.MaxEnergy,
			"last_recover_time": energy.LastRecoverTime,
			"recover_interval": energy.RecoverInterval,
			"recover_amount":  energy.RecoverAmount,
		},
	})
}

// InitEnergy 初始化用户体力
func (h *EnergyHandler) InitEnergy(c *gin.Context) {
	var req struct {
		UserID string `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	energy := model.EnergySystem{
		UserID:          req.UserID,
		CurrentEnergy:   200,
		MaxEnergy:       200,
		LastRecoverTime: time.Now(),
		RecoverInterval: 300,
		RecoverAmount:   1,
	}

	if err := database.DB.Create(&energy).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to init energy"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": energy, "message": "energy initialized"})
}
