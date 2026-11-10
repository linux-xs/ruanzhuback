package service

import (
	"context"
	"database/sql"

	"tstc/internal/gameplay"
	"tstc/internal/money"
	"tstc/internal/repo"
)

// 新手开局资源：一辆免费的车、一点启动金币、一张幸运卡。
const (
	starterCoin   money.Coin = 8_000
	starterCard              = 1
	starterLevel             = 1
	starterVehicleLevel      = 1
)

// RegisterResult 是建号回执，客户端拿到后直接进首页。
type RegisterResult struct {
	Player  Profile `json:"player"`
	Starter string  `json:"starter"`
}

// Register 建立一个新账号。
//
// 建号是一个原子操作：玩家行、新手车、车位格子必须同时成功，
// 否则会出现「有账号没车」或「有车没车位」的残缺数据。
func (s *Service) Register(ctx context.Context, nick string, seed int64) (RegisterResult, error) {
	name := normalizeNick(nick)
	if !validNick(name) {
		name = "新来的车主"
	}
	uid := gameplay.PlayerUID(seed)
	candidate := repo.Player{
		UID:    uid,
		Nick:   name,
		Avatar: "",
		Level:  1,
		Exp:    0,
		Coin:   starterCoin,
		Card:   starterCard,
		AdDay:  s.Today(),
	}

	var playerID int64
	err := s.store.InTx(ctx, func(tx *sql.Tx) error {
		id, err := s.store.InsertPlayer(ctx, tx, candidate)
		if err != nil {
			return err
		}
		playerID = id
		if _, err := s.store.InsertVehicle(ctx, tx, id, starterVehicleLevel); err != nil {
			return err
		}
		cells := gameplay.CapacityFor(starterLevel).LotCells
		return s.store.EnsureCells(ctx, tx, id, cells)
	})
	if err != nil {
		return RegisterResult{}, err
	}

	profile, err := s.Profile(ctx, playerID)
	if err != nil {
		return RegisterResult{}, err
	}
	return RegisterResult{
		Player:  profile,
		Starter: "开局赠送一辆破旧拖拉机与 8,000 金币",
	}, nil
}

// EnsureCells 按当前等级补齐车位，登录时调用一次即可。
func (s *Service) EnsureCells(ctx context.Context, playerID int64) error {
	p, err := s.store.PlayerByID(ctx, playerID)
	if err != nil {
		return mapRepoErr(err)
	}
	return s.store.EnsureCells(ctx, s.store, playerID, p.Capacity().LotCells)
}
