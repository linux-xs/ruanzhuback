package router

import (
	"qmqcw/handler"
	"qmqcw/middleware"

	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.Cors())
	r.Use(middleware.Logger())

	api := r.Group("/api")
	{
		// 玩家
		api.GET("/player/info", handler.GetPlayerInfo)
		api.GET("/player/search", handler.SearchPlayer)

		// 停车操作
		api.POST("/park/start", handler.ParkCar)
		api.POST("/park/recall", handler.RecallCar)
		api.POST("/park/ticket", handler.TicketCar)
		api.POST("/park/lucky", handler.LuckySettle)

		// 车辆买卖
		api.POST("/car/buy", handler.BuyCar)
		api.POST("/car/sell", handler.SellCar)

		// 签到
		api.POST("/sign/daily", handler.DailySign)

		// 社交
		api.POST("/social/add", handler.AddRelation)
		api.GET("/social/friends", handler.GetFriendList)
		api.GET("/social/enemies", handler.GetEnemyList)

		// 动态
		api.GET("/visitor/logs", handler.GetVisitorLogs)

		// 幸运卡
		api.POST("/ad/watch", handler.WatchAd)

		// 车辆图鉴
		api.GET("/car/configs", handler.GetCarConfigs)
	}

	return r
}
