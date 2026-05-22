package router

import (
	"byglg/internal/handler"

	"github.com/gin-gonic/gin"
)

// SetupRouter 设置路由
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// 初始化处理器
	userHandler := handler.NewUserHandler()
	energyHandler := handler.NewEnergyHandler()
	gameHandler := handler.NewGameHandler()
	adHandler := handler.NewAdHandler()

	// API v1 路由组
	v1 := r.Group("/api/v1")
	{
		// 用户相关路由
		users := v1.Group("/users")
		{
			users.GET("/:id", userHandler.GetUserInfo)
			users.POST("/", userHandler.CreateOrUpdateUser)
			users.PUT("/:id/login-time", userHandler.UpdateUserLoginTime)
		}

		// 体力相关路由
		energy := v1.Group("/energy")
		{
			energy.GET("/:id", energyHandler.GetEnergy)
			energy.POST("/init", energyHandler.InitEnergy)
		}

		// 游戏进度相关路由
		games := v1.Group("/games")
		{
			games.GET("/:id/progress/:gameId", gameHandler.GetGameProgress)
			games.POST("/progress", gameHandler.UpdateGameProgress)
			games.GET("/:gameId/leaderboard", gameHandler.GetLeaderboard)
		}

		// 广告相关路由
		ads := v1.Group("/ads")
		{
			ads.POST("/watch", adHandler.RecordAdWatch)
			ads.GET("/free-quota/:id/:gameId", adHandler.GetFreeAdQuota)
			ads.POST("/free-quota/:id/:gameId/use", adHandler.UseFreeAd)
		}
	}

	return r
}
