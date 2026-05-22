package dao

import (
	"database/sql"
	"time"

	"qmqcw/model"
)

// ================ Player ================

func GetPlayerById(id int) (*model.Player, error) {
	row := DB.QueryRow(`SELECT id, player_uid, nickname, avatar, level, exp, gold, lucky_card, daily_ad_count, is_bot, created_at, updated_at FROM player WHERE id=?`, id)
	p := &model.Player{}
	err := row.Scan(&p.Id, &p.PlayerUid, &p.Nickname, &p.Avatar, &p.Level, &p.Exp, &p.Gold, &p.LuckyCard, &p.DailyAdCount, &p.IsBot, &p.CreatedAt, &p.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return p, err
}

func GetPlayerByUid(uid string) (*model.Player, error) {
	row := DB.QueryRow(`SELECT id, player_uid, nickname, avatar, level, exp, gold, lucky_card, daily_ad_count, is_bot, created_at, updated_at FROM player WHERE player_uid=?`, uid)
	p := &model.Player{}
	err := row.Scan(&p.Id, &p.PlayerUid, &p.Nickname, &p.Avatar, &p.Level, &p.Exp, &p.Gold, &p.LuckyCard, &p.DailyAdCount, &p.IsBot, &p.CreatedAt, &p.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return p, err
}

func UpdatePlayerGold(id int, gold int64) error {
	_, err := DB.Exec(`UPDATE player SET gold=gold+? WHERE id=?`, gold, id)
	return err
}

func AddPlayerLuckyCard(id int, count int) error {
	_, err := DB.Exec(`UPDATE player SET lucky_card=lucky_card+? WHERE id=?`, count, id)
	return err
}

func UpdatePlayerDailyAd(id int) error {
	_, err := DB.Exec(`UPDATE player SET daily_ad_count=daily_ad_count+1 WHERE id=?`, id)
	return err
}

// ================ Car ================

func GetCarsByPlayerId(playerId int) ([]*model.Car, error) {
	rows, err := DB.Query(`SELECT id, player_id, car_level, car_name, status, created_at, updated_at FROM car WHERE player_id=?`, playerId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cars []*model.Car
	for rows.Next() {
		c := &model.Car{}
		if err := rows.Scan(&c.Id, &c.PlayerId, &c.CarLevel, &c.CarName, &c.Status, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		cars = append(cars, c)
	}
	return cars, nil
}

func UpdateCarStatus(carId int, status int8) error {
	_, err := DB.Exec(`UPDATE car SET status=? WHERE id=?`, status, carId)
	return err
}

func InsertCar(car *model.Car) (int64, error) {
	res, err := DB.Exec(`INSERT INTO car (player_id, car_level, car_name, status) VALUES (?,?,?,?)`,
		car.PlayerId, car.CarLevel, car.CarName, car.Status)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func DeleteCar(carId int) error {
	_, err := DB.Exec(`DELETE FROM car WHERE id=?`, carId)
	return err
}

// ================ Space ================

func GetSpacesByPlayerId(playerId int) ([]*model.Space, error) {
	rows, err := DB.Query(`SELECT id, player_id, slot_index, status, created_at, updated_at FROM space WHERE player_id=? ORDER BY slot_index`, playerId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var spaces []*model.Space
	for rows.Next() {
		s := &model.Space{}
		if err := rows.Scan(&s.Id, &s.PlayerId, &s.SlotIndex, &s.Status, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		spaces = append(spaces, s)
	}
	return spaces, nil
}

func UpdateSpaceStatus(spaceId int, status int8) error {
	_, err := DB.Exec(`UPDATE space SET status=? WHERE id=?`, status, spaceId)
	return err
}

// 拿一个全局随机空闲车位（非自己）
func GetRandomFreeSpace(excludePlayerId int) (*model.Space, *model.Player, error) {
	row := DB.QueryRow(`SELECT s.id, s.player_id, s.slot_index, s.status FROM space s WHERE s.status=0 AND s.player_id!=? ORDER BY RAND() LIMIT 1`, excludePlayerId)
	s := &model.Space{}
	err := row.Scan(&s.Id, &s.PlayerId, &s.SlotIndex, &s.Status)
	if err != nil {
		return nil, nil, err
	}
	p, _ := GetPlayerById(s.PlayerId)
	return s, p, nil
}

// 获取指定玩家的空闲车位
func GetFreeSpaceByPlayerId(playerId int) (*model.Space, error) {
	row := DB.QueryRow(`SELECT id, player_id, slot_index, status FROM space WHERE player_id=? AND status=0 LIMIT 1`, playerId)
	s := &model.Space{}
	err := row.Scan(&s.Id, &s.PlayerId, &s.SlotIndex, &s.Status)
	if err != nil {
		return nil, err
	}
	return s, nil
}

// ================ ParkRecord ================

func InsertParkRecord(r *model.ParkRecord) (int64, error) {
	res, err := DB.Exec(`INSERT INTO park_record (car_id, space_id, car_owner_id, space_owner_id, start_time, status) VALUES (?,?,?,?,?,?)`,
		r.CarId, r.SpaceId, r.CarOwnerId, r.SpaceOwnerId, r.StartTime, r.Status)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func GetActiveParkRecordByCarId(carId int) (*model.ParkRecord, error) {
	row := DB.QueryRow(`SELECT id, car_id, space_id, car_owner_id, space_owner_id, start_time, end_time, status, settle_type, total_gold FROM park_record WHERE car_id=? AND status=0`, carId)
	r := &model.ParkRecord{}
	err := row.Scan(&r.Id, &r.CarId, &r.SpaceId, &r.CarOwnerId, &r.SpaceOwnerId, &r.StartTime, &r.EndTime, &r.Status, &r.SettleType, &r.TotalGold)
	if err != nil {
		return nil, err
	}
	return r, nil
}

func GetOccupiedRecordsBySpaceOwner(spaceOwnerId int) ([]*model.ParkRecord, error) {
	rows, err := DB.Query(`SELECT id, car_id, space_id, car_owner_id, space_owner_id, start_time, end_time, status, settle_type, total_gold FROM park_record WHERE space_owner_id=? AND status=0`, spaceOwnerId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []*model.ParkRecord
	for rows.Next() {
		r := &model.ParkRecord{}
		if err := rows.Scan(&r.Id, &r.CarId, &r.SpaceId, &r.CarOwnerId, &r.SpaceOwnerId, &r.StartTime, &r.EndTime, &r.Status, &r.SettleType, &r.TotalGold); err != nil {
			return nil, err
		}
		records = append(records, r)
	}
	return records, nil
}

func SettleParkRecord(id int, settleType int8, totalGold int64) error {
	now := time.Now()
	_, err := DB.Exec(`UPDATE park_record SET end_time=?, status=1, settle_type=?, total_gold=?, updated_at=? WHERE id=?`,
		now, settleType, totalGold, now, id)
	return err
}

// ================ Social ================

func GetFriendList(playerId int) ([]*model.Player, error) {
	rows, err := DB.Query(`SELECT p.id, p.player_uid, p.nickname, p.avatar, p.level, p.exp, p.gold, p.lucky_card, p.daily_ad_count, p.is_bot, p.created_at, p.updated_at FROM social_relation sr JOIN player p ON sr.target_id=p.id WHERE sr.player_id=? AND sr.rel_type=1 ORDER BY p.level DESC`, playerId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var players []*model.Player
	for rows.Next() {
		p := &model.Player{}
		if err := rows.Scan(&p.Id, &p.PlayerUid, &p.Nickname, &p.Avatar, &p.Level, &p.Exp, &p.Gold, &p.LuckyCard, &p.DailyAdCount, &p.IsBot, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		players = append(players, p)
	}
	return players, nil
}

func GetEnemyList(playerId int) ([]*model.Player, error) {
	rows, err := DB.Query(`SELECT p.id, p.player_uid, p.nickname, p.avatar, p.level, p.exp, p.gold, p.lucky_card, p.daily_ad_count, p.is_bot, p.created_at, p.updated_at FROM social_relation sr JOIN player p ON sr.target_id=p.id WHERE sr.player_id=? AND sr.rel_type=2 ORDER BY sr.hate_count DESC`, playerId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var players []*model.Player
	for rows.Next() {
		p := &model.Player{}
		if err := rows.Scan(&p.Id, &p.PlayerUid, &p.Nickname, &p.Avatar, &p.Level, &p.Exp, &p.Gold, &p.LuckyCard, &p.DailyAdCount, &p.IsBot, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		players = append(players, p)
	}
	return players, nil
}

func UpsertSocialRelation(playerId int, targetId int, relType int8) error {
	_, err := DB.Exec(`INSERT INTO social_relation (player_id, target_id, rel_type) VALUES (?,?,?) ON DUPLICATE KEY UPDATE rel_type=?`,
		playerId, targetId, relType, relType)
	return err
}

func IncHateCount(playerId int, targetId int) error {
	_, err := DB.Exec(`UPDATE social_relation SET hate_count=hate_count+1 WHERE player_id=? AND target_id=? AND rel_type=2`, playerId, targetId)
	return err
}

// ================ VisitorLog ================

func InsertVisitorLog(log *model.VisitorLog) (int64, error) {
	res, err := DB.Exec(`INSERT INTO visitor_log (player_id, visitor_id, event_type, car_level, car_name, gold_income) VALUES (?,?,?,?,?,?)`,
		log.PlayerId, log.VisitorId, log.EventType, log.CarLevel, log.CarName, log.GoldIncome)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func GetVisitorLogs(playerId int, hours int) ([]*model.VisitorLog, error) {
	rows, err := DB.Query(`SELECT id, player_id, visitor_id, event_type, car_level, car_name, gold_income, created_at FROM visitor_log WHERE player_id=? AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR) ORDER BY created_at DESC`, playerId, hours)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*model.VisitorLog
	for rows.Next() {
		l := &model.VisitorLog{}
		if err := rows.Scan(&l.Id, &l.PlayerId, &l.VisitorId, &l.EventType, &l.CarLevel, &l.CarName, &l.GoldIncome, &l.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, nil
}

// ================ SignRecord ================

func GetTodaySignRecord(playerId int, signDate string) (*model.SignRecord, error) {
	row := DB.QueryRow(`SELECT id, player_id, sign_date, sign_type, created_at FROM sign_record WHERE player_id=? AND sign_date=?`, playerId, signDate)
	r := &model.SignRecord{}
	err := row.Scan(&r.Id, &r.PlayerId, &r.SignDate, &r.SignType, &r.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return r, err
}

func InsertSignRecord(r *model.SignRecord) (int64, error) {
	res, err := DB.Exec(`INSERT INTO sign_record (player_id, sign_date, sign_type) VALUES (?,?,?)`,
		r.PlayerId, r.SignDate, r.SignType)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

// ================ CarConfig ================

type CarConfigRow struct {
	CarLevel      int    `json:"car_level"`
	CarName       string `json:"car_name"`
	BuyPrice      int64  `json:"buy_price"`
	SellPrice     int64  `json:"sell_price"`
	OutputPerHour int    `json:"output_per_hour"`
	OutputFull    int    `json:"output_full"`
}

func GetCarConfigByLevel(level int) (*CarConfigRow, error) {
	row := DB.QueryRow(`SELECT car_level, car_name, buy_price, sell_price, output_per_hour, output_full FROM car_config WHERE car_level=?`, level)
	c := &CarConfigRow{}
	err := row.Scan(&c.CarLevel, &c.CarName, &c.BuyPrice, &c.SellPrice, &c.OutputPerHour, &c.OutputFull)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func GetAllCarConfigs() ([]*CarConfigRow, error) {
	rows, err := DB.Query(`SELECT car_level, car_name, buy_price, sell_price, output_per_hour, output_full FROM car_config ORDER BY car_level`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var configs []*CarConfigRow
	for rows.Next() {
		c := &CarConfigRow{}
		if err := rows.Scan(&c.CarLevel, &c.CarName, &c.BuyPrice, &c.SellPrice, &c.OutputPerHour, &c.OutputFull); err != nil {
			return nil, err
		}
		configs = append(configs, c)
	}
	return configs, nil
}
