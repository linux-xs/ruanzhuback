package service

import (
	"context"
	"database/sql"
	"time"

	"tstc/internal/gameplay"
	"tstc/internal/money"
	"tstc/internal/repo"
)

// ParkView 是「这辆车现在停在哪、还能拿多少」的完整描述。
type ParkView struct {
	HostID    int64     `json:"host_id"`
	HostNick  string    `json:"host_nick"`
	HostLevel int       `json:"host_level"`
	Rate      string    `json:"rate"`
	Note      string    `json:"note"`
	Stage     StageView `json:"stage"`
	Accrued   string    `json:"accrued"`
	RecallPay string    `json:"recall_pay"`
	CardPay   string    `json:"card_pay"`
	CanRecall bool      `json:"can_recall"`
	CanCard   bool      `json:"can_card"`
}

// VehicleItem 是车库列表里的一项。
type VehicleItem struct {
	ID      int64     `json:"id"`
	Level   int       `json:"level"`
	Name    string    `json:"name"`
	Hourly  string    `json:"hourly"`
	Price   string    `json:"price"`
	TradeIn string    `json:"trade_in"`
	State   string    `json:"state"`
	Parked  *ParkView `json:"parked,omitempty"`
	Actions []string  `json:"actions"`
}

// Garage 返回玩家车库的全部车辆，停在外面的车会带上租约信息。
func (s *Service) Garage(ctx context.Context, playerID int64) ([]VehicleItem, error) {
	self, err := s.store.PlayerByID(ctx, playerID)
	if err != nil {
		return nil, mapRepoErr(err)
	}
	cards, err := s.store.VehiclesWithLease(ctx, playerID)
	if err != nil {
		return nil, err
	}
	out := make([]VehicleItem, 0, len(cards))
	for _, c := range cards {
		spec, ok := gameplay.VehicleAt(c.Level)
		if !ok {
			continue
		}
		item := VehicleItem{
			ID:      c.ID,
			Level:   c.Level,
			Name:    spec.Name,
			Hourly:  spec.Hourly.String(),
			Price:   spec.Price.String(),
			TradeIn: spec.TradeIn(gameplay.ResalePermille).String(),
			State:   "idle",
			Actions: []string{gameplay.ActPark.Code(), gameplay.ActSell.Code()},
		}
		if c.State == gameplay.VehicleLeased && c.BeganAt != nil {
			item.State = "parked"
			view := s.parkView(*c.BeganAt, spec.Hourly, self.Level, c.HostLevel, self.Card)
			view.HostID = c.HostID
			view.HostNick = c.HostNick
			item.Parked = &view
			item.Actions = []string{}
			if view.CanRecall {
				item.Actions = append(item.Actions, gameplay.ActRecall.Code())
			}
			if view.CanCard {
				item.Actions = append(item.Actions, gameplay.ActCard.Code())
			}
		}
		out = append(out, item)
	}
	return out, nil
}

// parkView 计算一辆停车中的车在界面上的全部派生字段。
func (s *Service) parkView(start time.Time, hourly money.Coin,
	parkerLv, hostLv, cardLeft int) ParkView {
	quote := gameplay.QuoteFor(parkerLv, hostLv)
	view := ParkView{
		Rate:     quote.Text(),
		Note:     quote.Note(),
		Stage:    s.stageView(start),
		Accrued:  s.accrue(start, hourly, quote).String(),
		CanCard:  cardLeft > 0,
		CanRecall: gameplay.Allowed(s.timeline.StageOf(start, s.clock()), gameplay.ActRecall),
	}
	if slip, err := s.policy.Adjudicate(gameplay.KindRecall, gameplay.WhoParker,
		start, s.clock(), hourly, quote, s.timeline); err == nil {
		view.RecallPay = slip.ParkerShare.String()
	} else {
		view.RecallPay = "0"
	}
	if slip, err := s.policy.Adjudicate(gameplay.KindCard, gameplay.WhoParker,
		start, s.clock(), hourly, quote, s.timeline); err == nil {
		view.CardPay = slip.ParkerShare.String()
	}
	return view
}

// TradeResult 是买车与卖车的共同回执。
type TradeResult struct {
	Action string `json:"action"`
	Level  int    `json:"level"`
	Name   string `json:"name"`
	Coin   string `json:"coin"`
	Delta  string `json:"delta"`
}

// Buy 购买一辆指定等级的车辆。
// 校验顺序刻意按「等级解锁 → 额度 → 余额」排，让玩家先看到最该解决的问题。
func (s *Service) Buy(ctx context.Context, playerID int64, level int) (TradeResult, error) {
	spec, ok := gameplay.VehicleAt(level)
	if !ok {
		return TradeResult{}, ErrBadInput
	}
	p, err := s.store.PlayerByID(ctx, playerID)
	if err != nil {
		return TradeResult{}, mapRepoErr(err)
	}
	if level > gameplay.UnlockMaxLevel(p.Level) {
		return TradeResult{}, ErrLevelLocked
	}
	if p.Coin < spec.Price {
		return TradeResult{}, ErrNoCoin
	}
	count, err := s.store.CountVehicles(ctx, s.store, playerID)
	if err != nil {
		return TradeResult{}, err
	}
	if count >= p.Capacity().VehicleSlots {
		return TradeResult{}, ErrSlotFull
	}
	err = s.store.InTx(ctx, func(tx *sql.Tx) error {
		if err := s.store.AddCoin(ctx, tx, playerID, spec.Price.Negative()); err != nil {
			return ErrNoCoin
		}
		if _, err := s.store.InsertVehicle(ctx, tx, playerID, level); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return TradeResult{}, err
	}
	return TradeResult{
		Action: "buy",
		Level:  level,
		Name:   spec.Name,
		Coin:   (p.Coin - spec.Price).String(),
		Delta:  "-" + spec.Price.String(),
	}, nil
}

// Sell 卖掉一辆空闲车辆，按 85% 回收。
func (s *Service) Sell(ctx context.Context, playerID, vehicleID int64) (TradeResult, error) {
	var out TradeResult
	err := s.store.InTx(ctx, func(tx *sql.Tx) error {
		v, err := s.store.VehicleIn(ctx, tx, vehicleID)
		if err != nil {
			return ErrBadInput
		}
		if v.OwnerID != playerID {
			return ErrNotYours
		}
		if v.State != gameplay.VehicleIdle {
			return ErrOccupied
		}
		spec, ok := gameplay.VehicleAt(v.Level)
		if !ok {
			return ErrBadInput
		}
		refund := spec.TradeIn(gameplay.ResalePermille)
		if err := s.store.RemoveVehicle(ctx, tx, playerID, vehicleID); err != nil {
			return ErrOccupied
		}
		if err := s.store.AddCoin(ctx, tx, playerID, refund); err != nil {
			return err
		}
		p, err := s.store.PlayerIn(ctx, tx, playerID)
		if err != nil {
			return mapRepoErr(err)
		}
		out = TradeResult{
			Action: "sell",
			Level:  v.Level,
			Name:   spec.Name,
			Coin:   p.Coin.String(),
			Delta:  "+" + refund.String(),
		}
		return nil
	})
	if err != nil {
		return TradeResult{}, err
	}
	return out, nil
}

// CatalogItem 是图鉴里的一行。
type CatalogItem struct {
	Level     int    `json:"level"`
	Name      string `json:"name"`
	Price     string `json:"price"`
	TradeIn   string `json:"trade_in"`
	Hourly    string `json:"hourly"`
	FullPay   string `json:"full_pay"`
	Unlocked  bool   `json:"unlocked"`
	Affordable bool  `json:"affordable"`
}

// CatalogView 返回图鉴列表，附带「是否解锁」「是否买得起」两个即时判断。
func (s *Service) CatalogView(ctx context.Context, playerID int64) ([]CatalogItem, error) {
	p, err := s.store.PlayerByID(ctx, playerID)
	if err != nil {
		return nil, mapRepoErr(err)
	}
	list := gameplay.Catalog()
	limit := gameplay.UnlockMaxLevel(p.Level)
	out := make([]CatalogItem, 0, len(list))
	for _, v := range list {
		out = append(out, CatalogItem{
			Level:      v.Level,
			Name:       v.Name,
			Price:      v.Price.String(),
			TradeIn:    v.TradeIn(gameplay.ResalePermille).String(),
			Hourly:     v.Hourly.String(),
			FullPay:    v.FullIncome(s.policy, money.NewRatio(1, 1)).String(),
			Unlocked:   v.Level <= limit,
			Affordable: p.Coin >= v.Price,
		})
	}
	return out, nil
}

// 引用 repo 包的类型别名，便于在跨包结构里直接书写。
var _ = repo.BondFriend
