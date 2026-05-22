package handler

import (
	"net/http"
	"time"

	"byglg/internal/database"
	"byglg/internal/model"

	"github.com/gin-gonic/gin"
)

// AdHandler 广告记录处理器
type AdHandler struct{}

// NewAdHandler 创建广告处理器实例
func NewAdHandler() *AdHandler {
	return &AdHandler{}
}

// RecordAdWatch 记录广告观看
func (h *AdHandler) RecordAdWatch(c *gin.Context) {
	var req struct {
		UserID     string `json:"user_id" binding:"required"`
		GameID     string `json:"game_id" binding:"required"`
		AdType     string `json:"ad_type" binding:"required"`
		AdUnitID   string `json:"ad_unit_id"`
		RewardType string `json:"reward_type"`
		Completed  bool   `json:"is_completed"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	record := model.AdRecord{
		UserID:      req.UserID,
		GameID:      req.GameID,
		AdType:      req.AdType,
		AdUnitID:    req.AdUnitID,
		RewardType:  req.RewardType,
		RewardAmount: 1,
		IsCompleted: req.Completed,
		WatchTime:   time.Now(),
	}

	if err := database.DB.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record ad watch"})
		return
	}

	// 更新用户总广告观看次数
	database.DB.Model(&model.UserInfo{}).
		Where("user_id = ?", req.UserID).
		UpdateColumn("total_ads_watched", database.DB.Raw("total_ads_watched + 1"))

	c.JSON(http.StatusCreated, gin.H{"data": record, "message": "ad watch recorded"})
}

// GetFreeAdQuota 获取免广告次数
func (h *AdHandler) GetFreeAdQuota(c *gin.Context) {
	userID := c.Param("id")
	gameID := c.Param("gameId")

	if userID == "" || gameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id and game_id are required"})
		return
	}

	var quota model.FreeAdQuota
	if err := database.DB.Where("user_id = ? AND game_id = ?", userID, gameID).First(&quota).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "free ad quota not found"})
		return
	}

	// 检查是否需要重置（按天）
	today := time.Now().Truncate(24 * time.Hour)
	if quota.ResetDate.Before(today) {
		database.DB.Model(&quota).Updates(map[string]interface{}{
			"free_count":  0,
			"reset_date":  today,
		})
		quota.FreeCount = 0
		quota.ResetDate = today
	}

	c.JSON(http.StatusOK, gin.H{"data": quota})
}

// UseFreeAd 使用免广告次数
func (h *AdHandler) UseFreeAd(c *gin.Context) {
	userID := c.Param("id")
	gameID := c.Param("gameId")

	if userID == "" || gameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id and game_id are required"})
		return
	}

	var quota model.FreeAdQuota
	if err := database.DB.Where("user_id = ? AND game_id = ?", userID, gameID).First(&quota).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "free ad quota not found"})
		return
	}

	if quota.FreeCount >= quota.MaxFreeCount {
		c.JSON(http.StatusBadRequest, gin.H{"error": "free ad quota exceeded"})
		return
	}

	database.DB.Model(&quota).UpdateColumn("free_count", quota.FreeCount+1)
	c.JSON(http.StatusOK, gin.H{"message": "free ad used", "remaining": quota.MaxFreeCount - quota.FreeCount - 1})
}
