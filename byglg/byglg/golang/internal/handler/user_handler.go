package handler

import (
	"net/http"

	"byglg/internal/database"
	"byglg/internal/model"

	"github.com/gin-gonic/gin"
)

// UserHandler 用户相关处理器
type UserHandler struct{}

// NewUserHandler 创建用户处理器实例
func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

// GetUserInfo 获取用户信息
func (h *UserHandler) GetUserInfo(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	var user model.UserInfo
	if err := database.DB.Where("user_id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// CreateOrUpdateUser 创建或更新用户信息
func (h *UserHandler) CreateOrUpdateUser(c *gin.Context) {
	var req model.UserInfo
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 检查用户是否存在
	var existingUser model.UserInfo
	result := database.DB.Where("user_id = ?", req.UserID).First(&existingUser)

	if result.Error != nil {
		// 创建新用户
		if err := database.DB.Create(&req).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"data": req, "message": "user created"})
	} else {
		// 更新用户信息
		database.DB.Model(&existingUser).Updates(req)
		c.JSON(http.StatusOK, gin.H{"data": existingUser, "message": "user updated"})
	}
}

// UpdateUserLoginTime 更新用户最后登录时间
func (h *UserHandler) UpdateUserLoginTime(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	if err := database.DB.Model(&model.UserInfo{}).
		Where("user_id = ?", userID).
		Update("last_login_time", database.DB.Now()).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update login time"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "login time updated"})
}
