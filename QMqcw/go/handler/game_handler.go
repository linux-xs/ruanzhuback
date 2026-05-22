package handler

import (
	"strconv"

	"qmqcw/common"
	"qmqcw/dao"
	"qmqcw/service"

	"github.com/gin-gonic/gin"
)

// =================== 玩家相关 ===================

func GetPlayerInfo(c *gin.Context) {
	id, _ := strconv.Atoi(c.Query("player_id"))
	player, err := dao.GetPlayerById(id)
	if err != nil || player == nil {
		common.Fail(c, common.CodeNotFound, "玩家不存在")
		return
	}

	// 查车辆
	cars, _ := dao.GetCarsByPlayerId(id)
	// 查车位
	spaces, _ := dao.GetSpacesByPlayerId(id)
	// 查好友和仇人数
	friends, _ := dao.GetFriendList(id)
	enemies, _ := dao.GetEnemyList(id)

	common.Success(c, gin.H{
		"player":     player,
		"cars":       cars,
		"spaces":     spaces,
		"friend_cnt": len(friends),
		"enemy_cnt":  len(enemies),
	})
}

func SearchPlayer(c *gin.Context) {
	uid := c.Query("uid")
	player, err := dao.GetPlayerByUid(uid)
	if err != nil || player == nil {
		common.Fail(c, common.CodeNotFound, "玩家不存在")
		return
	}
	common.Success(c, player)
}

// =================== 停车相关 ===================

func ParkCar(c *gin.Context) {
	var req struct {
		PlayerId int `json:"player_id"`
		CarId    int `json:"car_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Fail(c, common.CodeParamErr, "参数错误")
		return
	}

	res, err := service.ParkCar(req.PlayerId, req.CarId)
	if err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, res)
}

func RecallCar(c *gin.Context) {
	var req struct {
		PlayerId int `json:"player_id"`
		CarId    int `json:"car_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Fail(c, common.CodeParamErr, "参数错误")
		return
	}

	res, err := service.RecallCar(req.PlayerId, req.CarId)
	if err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, res)
}

func TicketCar(c *gin.Context) {
	var req struct {
		PlayerId int `json:"player_id"`
		CarId    int `json:"car_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Fail(c, common.CodeParamErr, "参数错误")
		return
	}

	res, err := service.TicketCar(req.PlayerId, req.CarId)
	if err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, res)
}

func LuckySettle(c *gin.Context) {
	var req struct {
		PlayerId int `json:"player_id"`
		CarId    int `json:"car_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Fail(c, common.CodeParamErr, "参数错误")
		return
	}

	res, err := service.LuckySettle(req.PlayerId, req.CarId)
	if err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, res)
}

// =================== 车辆买卖 ===================

func BuyCar(c *gin.Context) {
	var req struct {
		PlayerId int `json:"player_id"`
		CarLevel int `json:"car_level"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Fail(c, common.CodeParamErr, "参数错误")
		return
	}

	if err := service.BuyCar(req.PlayerId, req.CarLevel); err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, nil)
}

func SellCar(c *gin.Context) {
	var req struct {
		PlayerId int `json:"player_id"`
		CarId    int `json:"car_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Fail(c, common.CodeParamErr, "参数错误")
		return
	}

	if err := service.SellCar(req.PlayerId, req.CarId); err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, nil)
}

// =================== 签到 ===================

func DailySign(c *gin.Context) {
	var req struct {
		PlayerId int  `json:"player_id"`
		SignType int8 `json:"sign_type"` // 1普通 2幸运卡
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Fail(c, common.CodeParamErr, "参数错误")
		return
	}

	res, err := service.DailySign(req.PlayerId, req.SignType)
	if err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, res)
}

// =================== 社交关系 ===================

func AddRelation(c *gin.Context) {
	var req struct {
		PlayerId int  `json:"player_id"`
		TargetId int  `json:"target_id"`
		RelType  int8 `json:"rel_type"` // 1好友 2仇人
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Fail(c, common.CodeParamErr, "参数错误")
		return
	}

	if err := service.AddRelation(req.PlayerId, req.TargetId, req.RelType); err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, nil)
}

func GetFriendList(c *gin.Context) {
	id, _ := strconv.Atoi(c.Query("player_id"))
	list, err := dao.GetFriendList(id)
	if err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, list)
}

func GetEnemyList(c *gin.Context) {
	id, _ := strconv.Atoi(c.Query("player_id"))
	list, err := dao.GetEnemyList(id)
	if err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, list)
}

// =================== 访客动态 ===================

func GetVisitorLogs(c *gin.Context) {
	id, _ := strconv.Atoi(c.Query("player_id"))
	hours := 24
	logs, err := dao.GetVisitorLogs(id, hours)
	if err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, logs)
}

// =================== 幸运卡 ===================

func WatchAd(c *gin.Context) {
	var req struct {
		PlayerId int `json:"player_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Fail(c, common.CodeParamErr, "参数错误")
		return
	}

	if err := service.WatchAd(req.PlayerId); err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, nil)
}

// =================== 车辆图鉴 ===================

func GetCarConfigs(c *gin.Context) {
	configs, err := dao.GetAllCarConfigs()
	if err != nil {
		common.Error(c, err.Error())
		return
	}
	common.Success(c, configs)
}
