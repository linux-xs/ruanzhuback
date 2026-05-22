package service

import (
	"errors"
	"time"

	"qmqcw/common"
	"qmqcw/conf"
	"qmqcw/dao"
	"qmqcw/model"
)

// 一键停车
func ParkCar(playerId int, carId int) (interface{}, error) {
	// 查车辆
	cars, err := dao.GetCarsByPlayerId(playerId)
	if err != nil {
		return nil, err
	}
	var targetCar *model.Car
	for _, c := range cars {
		if c.Id == carId {
			targetCar = c
			break
		}
	}
	if targetCar == nil {
		return nil, errors.New("车辆不存在")
	}
	if targetCar.Status != 0 {
		return nil, errors.New("车辆不在空闲状态")
	}

	// 随机拿全局空闲车位
	space, host, err := dao.GetRandomFreeSpace(playerId)
	if err != nil {
		return nil, errors.New("全服暂无空闲车位")
	}

	// 获取车辆产出配置
	carCfg, err := dao.GetCarConfigByLevel(targetCar.CarLevel)
	if err != nil {
		return nil, errors.New("车辆配置不存在")
	}

	// 计算倍率
	myPlayer, _ := dao.GetPlayerById(playerId)
	rate := common.CalcRate(myPlayer.Level, host.Level)

	// 创建停车记录
	now := time.Now()
	record := &model.ParkRecord{
		CarId:        carId,
		SpaceId:      space.Id,
		CarOwnerId:   playerId,
		SpaceOwnerId: host.Id,
		StartTime:    now,
		Status:       0,
	}
	_, err = dao.InsertParkRecord(record)
	if err != nil {
		return nil, err
	}

	// 更新车和车位状态
	dao.UpdateCarStatus(carId, 1)
	dao.UpdateSpaceStatus(space.Id, 1)

	// 记录访客动态
	visitor := &model.VisitorLog{
		PlayerId:   host.Id,
		VisitorId:  playerId,
		EventType:  1,
		CarLevel:   targetCar.CarLevel,
		CarName:    carCfg.CarName,
		GoldIncome: 0,
	}
	dao.InsertVisitorLog(visitor)

	return map[string]interface{}{
		"car_name":        carCfg.CarName,
		"host_name":       host.Nickname,
		"host_level":      host.Level,
		"rate":            rate,
		"output_per_hour": carCfg.OutputPerHour,
	}, nil
}

// 主动召回
func RecallCar(playerId int, carId int) (interface{}, error) {
	record, err := dao.GetActiveParkRecordByCarId(carId)
	if err != nil {
		return nil, errors.New("该车不在停车中")
	}
	if record.CarOwnerId != playerId {
		return nil, errors.New("不是你的车")
	}

	phase := common.GetTimePhase(record.StartTime)
	if phase == 1 {
		return nil, errors.New("锁定期内不可召回")
	}

	// 计算收益
	carCfg, _ := dao.GetCarConfigByLevel(carIdToLevel(carId))
	myPlayer, _ := dao.GetPlayerById(playerId)
	host, _ := dao.GetPlayerById(record.SpaceOwnerId)
	rate := common.CalcRate(myPlayer.Level, host.Level)
	elapsed := int(time.Since(record.StartTime).Minutes())
	totalGold := common.CalcParkGold(carCfg.OutputPerHour, elapsed, rate)
	actualGold := int64(float64(totalGold) * conf.Cfg.Game.RecallRate)

	// 结算
	dao.SettleParkRecord(record.Id, 1, actualGold)
	dao.UpdateCarStatus(carId, 0)
	dao.UpdateSpaceStatus(record.SpaceId, 0)
	dao.UpdatePlayerGold(playerId, actualGold)

	return map[string]interface{}{
		"total_gold":  totalGold,
		"actual_gold": actualGold,
		"settle_type": "召回",
	}, nil
}

// 贴条制裁
func TicketCar(playerId int, carId int) (interface{}, error) {
	record, err := dao.GetActiveParkRecordByCarId(carId)
	if err != nil {
		return nil, errors.New("该车不在停车中")
	}
	if record.SpaceOwnerId != playerId {
		return nil, errors.New("这不是你的车位")
	}

	phase := common.GetTimePhase(record.StartTime)
	if phase < 3 {
		return nil, errors.New("未到贴条时间")
	}

	// 计算收益
	carCfg, _ := dao.GetCarConfigByLevel(carIdToLevel(carId))
	carOwner, _ := dao.GetPlayerById(record.CarOwnerId)
	host, _ := dao.GetPlayerById(playerId)
	rate := common.CalcRate(carOwner.Level, host.Level)
	elapsed := int(time.Since(record.StartTime).Minutes())
	totalGold := common.CalcParkGold(carCfg.OutputPerHour, elapsed, rate)
	ownerGold := int64(float64(totalGold) * conf.Cfg.Game.TicketRate)
	ticketGold := int64(float64(totalGold) * conf.Cfg.Game.TicketOwnerRate)

	// 结算
	dao.SettleParkRecord(record.Id, 2, totalGold)
	dao.UpdateCarStatus(carId, 0)
	dao.UpdateSpaceStatus(record.SpaceId, 0)
	dao.UpdatePlayerGold(record.CarOwnerId, ownerGold)
	dao.UpdatePlayerGold(playerId, ticketGold)

	// 仇人自动录入
	dao.UpsertSocialRelation(record.CarOwnerId, playerId, 2)
	dao.IncHateCount(record.CarOwnerId, playerId)

	// 访客动态
	visitor := &model.VisitorLog{
		PlayerId:   playerId,
		VisitorId:  record.CarOwnerId,
		EventType:  3,
		CarLevel:   carCfg.CarLevel,
		CarName:    carCfg.CarName,
		GoldIncome: ticketGold,
	}
	dao.InsertVisitorLog(visitor)

	return map[string]interface{}{
		"total_gold":  totalGold,
		"owner_gold":  ownerGold,
		"ticket_gold": ticketGold,
		"settle_type": "贴条",
	}, nil
}

// 幸运卡秒结
func LuckySettle(playerId int, carId int) (interface{}, error) {
	record, err := dao.GetActiveParkRecordByCarId(carId)
	if err != nil {
		return nil, errors.New("该车不在停车中")
	}
	if record.CarOwnerId != playerId {
		return nil, errors.New("不是你的车")
	}

	myPlayer, _ := dao.GetPlayerById(playerId)
	if myPlayer.LuckyCard <= 0 {
		return nil, errors.New("幸运卡不足")
	}

	// 计算满额收益
	carCfg, _ := dao.GetCarConfigByLevel(carIdToLevel(carId))
	host, _ := dao.GetPlayerById(record.SpaceOwnerId)
	rate := common.CalcRate(myPlayer.Level, host.Level)
	fullGold := int64(carCfg.OutputPerHour * conf.Cfg.Game.ParkFullHours)

	// 结算
	dao.SettleParkRecord(record.Id, 4, fullGold)
	dao.UpdateCarStatus(carId, 0)
	dao.UpdateSpaceStatus(record.SpaceId, 0)
	dao.UpdatePlayerGold(playerId, fullGold)
	dao.AddPlayerLuckyCard(playerId, -1)

	return map[string]interface{}{
		"total_gold":  fullGold,
		"settle_type": "幸运卡秒结",
		"rate":        rate,
	}, nil
}

// 买车
func BuyCar(playerId int, carLevel int) error {
	player, _ := dao.GetPlayerById(playerId)
	if player.Level < carLevel {
		return errors.New("等级不够")
	}

	cars, _ := dao.GetCarsByPlayerId(playerId)
	maxCars := player.Level
	if maxCars > conf.Cfg.Game.MaxCars {
		maxCars = conf.Cfg.Game.MaxCars
	}
	if len(cars) >= maxCars {
		return errors.New("车辆位已满")
	}

	cfg, _ := dao.GetCarConfigByLevel(carLevel)
	if cfg == nil {
		return errors.New("车辆不存在")
	}
	if player.Gold < cfg.BuyPrice {
		return errors.New("金币不足")
	}

	dao.UpdatePlayerGold(playerId, -cfg.BuyPrice)
	car := &model.Car{
		PlayerId: playerId,
		CarLevel: carLevel,
		CarName:  cfg.CarName,
		Status:   0,
	}
	dao.InsertCar(car)
	return nil
}

// 卖车
func SellCar(playerId int, carId int) error {
	cars, _ := dao.GetCarsByPlayerId(playerId)
	var target *model.Car
	for _, c := range cars {
		if c.Id == carId {
			target = c
			break
		}
	}
	if target == nil {
		return errors.New("车辆不存在")
	}
	if target.Status != 0 {
		return errors.New("停车中的车不能卖")
	}

	cfg, _ := dao.GetCarConfigByLevel(target.CarLevel)
	sellPrice := int64(float64(cfg.BuyPrice) * conf.Cfg.Game.SellBackRate)

	dao.UpdatePlayerGold(playerId, sellPrice)
	dao.DeleteCar(carId)
	return nil
}

// 签到
func DailySign(playerId int, signType int8) (interface{}, error) {
	today := time.Now().Format("2006-01-02")
	exist, _ := dao.GetTodaySignRecord(playerId, today)
	if exist != nil {
		return nil, errors.New("今日已签到")
	}

	r := &model.SignRecord{
		PlayerId: playerId,
		SignDate: today,
		SignType: signType,
	}
	dao.InsertSignRecord(r)

	var rewardGold int64
	if signType == 1 {
		rewardGold = 5000
	} else {
		player, _ := dao.GetPlayerById(playerId)
		if player.LuckyCard <= 0 {
			return nil, errors.New("幸运卡不足")
		}
		dao.AddPlayerLuckyCard(playerId, -1)
		rewardGold = 50000
	}
	dao.UpdatePlayerGold(playerId, rewardGold)

	return map[string]interface{}{
		"reward_gold": rewardGold,
		"sign_type":   signType,
	}, nil
}

// 添加社交关系
func AddRelation(playerId int, targetId int, relType int8) error {
	if playerId == targetId {
		return errors.New("不能对自己操作")
	}
	return dao.UpsertSocialRelation(playerId, targetId, relType)
}

// 看广告获取幸运卡
func WatchAd(playerId int) error {
	player, _ := dao.GetPlayerById(playerId)
	if player.DailyAdCount >= conf.Cfg.Game.DailyLuckyCardLimit {
		return errors.New("今日广告次数已用完")
	}
	dao.UpdatePlayerDailyAd(playerId)
	dao.AddPlayerLuckyCard(playerId, 1)
	return nil
}

// 辅助函数
func carIdToLevel(carId int) int {
	return 1 // 简化处理，实际应从DB查询
}
