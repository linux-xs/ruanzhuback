package handler

import (
	"net/http"
	"time"

	"byglg/internal/database"
	"byglg/internal/model"

	"github.com/gin-gonic/gin"
)

// GameHandler 游戏进度处理器
type GameHandler struct{}

// NewGameHandler 创建游戏处理器实例
func NewGameHandler() *GameHandler {
	return &GameHandler{}
}

// GetGameProgress 获取游戏进度
func (h *GameHandler) GetGameProgress(c *gin.Context) {
	userID := c.Param("id")
	gameID := c.Param("gameId")

	if userID == "" || gameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id and game_id are required"})
		return
	}

	var progress model.GameProgress
	if err := database.DB.Where("user_id = ? AND game_id = ?", userID, gameID).First(&progress).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "game progress not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": progress})
}

// UpdateGameProgress 更新游戏进度
func (h *GameHandler) UpdateGameProgress(c *gin.Context) {
	var req struct {
		UserID       string `json:"user_id" binding:"required"`
		GameID       string `json:"game_id" binding:"required"`
		CurrentLevel int    `json:"current_level"`
		BestScore    int    `json:"best_score"`
		PlayTime     int    `json:"play_time"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var progress model.GameProgress
	result := database.DB.Where("user_id = ? AND game_id = ?", req.UserID, req.GameID).First(&progress)

	if result.Error != nil {
		// 创建新进度
		progress = model.GameProgress{
			UserID:       req.UserID,
			GameID:       req.GameID,
			CurrentLevel: req.CurrentLevel,
			MaxLevel:     req.CurrentLevel,
			BestScore:    req.BestScore,
			TotalPlayTime: req.PlayTime,
			PlayCount:    1,
			LastPlayTime: time.Now(),
		}
		if err := database.DB.Create(&progress).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create progress"})
			return
		}
	} else {
		// 更新进度
		updates := map[string]interface{}{
			"last_play_time": time.Now(),
			"play_count":     progress.PlayCount + 1,
			"total_play_time": progress.TotalPlayTime + req.PlayTime,
		}
		if req.CurrentLevel > progress.MaxLevel {
			updates["max_level"] = req.CurrentLevel
			updates["current_level"] = req.CurrentLevel
		}
		if req.BestScore > progress.BestScore {
			updates["best_score"] = req.BestScore
		}
		database.DB.Model(&progress).Updates(updates)
	}

	c.JSON(http.StatusOK, gin.H{"data": progress, "message": "progress updated"})
}

// GetLeaderboard 获取排行榜
func (h *GameHandler) GetLeaderboard(c *gin.Context) {
	gameID := c.Param("gameId")
	if gameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "game_id is required"})
		return
	}

	var leaderboard []model.Leaderboard
	database.DB.Where("game_id = ?", gameID).
		Order("score DESC").
		Limit(100).
		Find(&leaderboard)

	c.JSON(http.StatusOK, gin.H{"data": leaderboard})
}
