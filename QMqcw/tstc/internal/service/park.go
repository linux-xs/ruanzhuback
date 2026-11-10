package service

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"tstc/internal/gameplay"
	"tstc/internal/repo"
)

// row 是一次结算需要的全部事实：租约、三方等级、起始时刻。
// 把散落在各表的字段先集中到这一个结构，后面的判定与落账都只依赖它。
type row struct {
	LeaseID   int64
	VehicleID int64
	CellID    int64
	ParkerID  int64
	HostID    int64
	BeganAt   time.Time
	VehicleLv int
	ParkerLv  int
	HostLv    int
}

// ParkResult 是停车成功的回执，界面用它弹出「盲盒」提示。
type ParkResult struct {
	VehicleID int64     `json:"vehicle_id"`
	HostID    int64     `json:"host_id"`
	HostUID   string    `json:"host_uid"`
	HostNick  string    `json:"host_nick"`
	HostLevel int       `json:"host_level"`
	CellSeq   int       `json:"cell_seq"`
	Rate      string    `json:"rate"`
	Note      string    `json:"note"`
	Hourly    string    `json:"hourly"`
	FullPay   string    `json:"full_pay"`
	Stage     StageView `json:"stage"`
}

// SettleResult 是任何一种结算方式的结果回执。
type SettleResult struct {
	Kind      string `json:"kind"`
	KindLabel string `json:"kind_label"`
	Minutes   int    `json:"minutes"`
	Rate      string `json:"rate"`
	Gross     string `json:"gross"`
	ParkerPay string `json:"parker_pay"`
	HostPay   string `json:"host_pay"`
	Reason    string `json:"reason"`
	Summary   string `json:"summary"`
	Exp       int    `json:"exp"`
	Level     int    `json:"level"`
	Coin      string `json:"coin"`
}

// Park 把一辆空闲车派出去。
//
// targetUID 为空表示一键停车（全服随机），否则按短号精准停到对方空位上。
// 整个流程在一个事务里：车 → 车位 → 租约 → 动态，任一步失败都回滚，
// 不会留下「车状态变成停车中但没租约」这种脏数据。
func (s *Service) Park(ctx context.Context, parkerID, vehicleID int64, targetUID string) (ParkResult, error) {
	parker, err := s.store.PlayerByID(ctx, parkerID)
	if err != nil {
		return ParkResult{}, mapRepoErr(err)
	}
	var out ParkResult
	err = s.store.InTx(ctx, func(tx *sql.Tx) error {
		vehicle, err := s.store.VehicleIn(ctx, tx, vehicleID)
		if err != nil {
			return ErrBadInput
		}
		if vehicle.OwnerID != parkerID {
			return ErrNotYours
		}
		spec, ok := gameplay.VehicleAt(vehicle.Level)
		if !ok {
			return ErrBadInput
		}
		// 先锁定车辆状态，同一辆车被连点两次时只有一次能成功。
		if err := s.store.TakeVehicle(ctx, tx, vehicleID, parkerID,
			gameplay.VehicleIdle, gameplay.VehicleLeased); err != nil {
			return ErrOccupied
		}

		cell, host, err := s.pickCell(ctx, tx, parkerID, targetUID)
		if err != nil {
			return err
		}
		if err := s.store.BookCell(ctx, tx, cell.ID); err != nil {
			return ErrOccupied
		}
		now := s.clock()
		if _, err := s.store.InsertLease(ctx, tx, vehicleID, cell.ID, parkerID, host.ID, now); err != nil {
			return err
		}
		quote := gameplay.QuoteFor(parker.Level, host.Level)
		out = ParkResult{
			VehicleID: vehicleID,
			HostID:    host.ID,
			HostUID:   host.UID,
			HostNick:  host.Nick,
			HostLevel: host.Level,
			CellSeq:   cell.Seq,
			Rate:      quote.Text(),
			Note:      quote.Note(),
			Hourly:    spec.Hourly.String(),
			FullPay:   spec.FullIncome(s.policy, quote.Ratio).String(),
			Stage:     s.stageView(now),
		}
		return s.store.AddFeed(ctx, tx, host.ID, parkerID, repo.FeedParked, vehicle.Level, spec.Name, 0)
	})
	if err != nil {
		return ParkResult{}, err
	}
	return out, nil
}

// pickCell 选出这次要停进去的车位：精准停车走对方名下，一键停车走全服随机。
func (s *Service) pickCell(ctx context.Context, tx *sql.Tx, parkerID int64, targetUID string) (repo.Cell, repo.Player, error) {
	if targetUID == "" {
		cell, err := s.store.GrabRandomFreeCell(ctx, tx, parkerID)
		if err != nil {
			return repo.Cell{}, repo.Player{}, ErrNoFreeLot
		}
		host, err := s.store.PlayerIn(ctx, tx, cell.OwnerID)
		if err != nil {
			return repo.Cell{}, repo.Player{}, mapRepoErr(err)
		}
		return cell, host, nil
	}
	host, err := s.store.PlayerByUID(ctx, trimUpper(targetUID))
	if err != nil {
		return repo.Cell{}, repo.Player{}, ErrNoPlayer
	}
	if host.ID == parkerID {
		return repo.Cell{}, repo.Player{}, ErrSelf
	}
	cell, err := s.store.GrabFreeCellOfHost(ctx, tx, host.ID)
	if err != nil {
		return repo.Cell{}, repo.Player{}, ErrNoFreeLot
	}
	return cell, host, nil
}

// Recall 车主把车召回，拿 90% 收益。
func (s *Service) Recall(ctx context.Context, parkerID, vehicleID int64) (SettleResult, error) {
	return s.settle(ctx, parkerID, vehicleID, gameplay.KindRecall)
}

// CardSettle 车主用一张幸运卡即时拿满额。
func (s *Service) CardSettle(ctx context.Context, parkerID, vehicleID int64) (SettleResult, error) {
	return s.settle(ctx, parkerID, vehicleID, gameplay.KindCard)
}

// Ticket 车位主人贴条，车主拿 80%、主人拿 20%。
func (s *Service) Ticket(ctx context.Context, hostID, vehicleID int64) (SettleResult, error) {
	return s.settle(ctx, hostID, vehicleID, gameplay.KindTicket)
}

// settle 是三种主动结算方式的公共入口。
func (s *Service) settle(ctx context.Context, actorID, vehicleID int64, kind gameplay.Kind) (SettleResult, error) {
	var out SettleResult
	err := s.store.InTx(ctx, func(tx *sql.Tx) error {
		lease, err := s.store.ActiveLeaseByVehicle(ctx, tx, vehicleID)
		if err != nil {
			return ErrBadInput
		}
		by := gameplay.WhoParker
		switch kind {
		case gameplay.KindTicket:
			if lease.HostID != actorID {
				return ErrNotYours
			}
			by = gameplay.WhoHost
		default:
			if lease.ParkerID != actorID {
				return ErrNotYours
			}
		}

		vehicle, err := s.store.VehicleIn(ctx, tx, vehicleID)
		if err != nil {
			return ErrBadInput
		}
		parker, err := s.store.PlayerIn(ctx, tx, lease.ParkerID)
		if err != nil {
			return mapRepoErr(err)
		}
		host, err := s.store.PlayerIn(ctx, tx, lease.HostID)
		if err != nil {
			return mapRepoErr(err)
		}
		r := row{
			LeaseID:   lease.ID,
			VehicleID: lease.VehicleID,
			CellID:    lease.CellID,
			ParkerID:  lease.ParkerID,
			HostID:    lease.HostID,
			BeganAt:   lease.BeganAt,
			VehicleLv: vehicle.Level,
			ParkerLv:  parker.Level,
			HostLv:    host.Level,
		}

		slip, quote, err := s.adjudicate(r, kind, by)
		if err != nil {
			return err
		}
		if kind == gameplay.KindCard {
			if err := s.store.AddCard(ctx, tx, r.ParkerID, -1); err != nil {
				return ErrNoCard
			}
		}
		exp := gameplay.SettleExp(slip.Minutes, quote)
		if err := s.commit(ctx, tx, r, kind, slip, exp); err != nil {
			return err
		}
		out = SettleResult{
			Kind:      kind.Code(),
			KindLabel: kind.Label(),
			Minutes:   slip.Minutes,
			Rate:      quote.Text(),
			Gross:     slip.Gross.String(),
			ParkerPay: slip.ParkerShare.String(),
			HostPay:   slip.HostShare.String(),
			Reason:    slip.Reason,
			Summary:   slip.Summary(),
			Exp:       exp,
		}
		return nil
	})
	if err != nil {
		return SettleResult{}, err
	}
	if self, err := s.store.PlayerByID(ctx, actorID); err == nil {
		out.Level = self.Level
		out.Coin = self.Coin.String()
	}
	return out, nil
}

// adjudicate 取车型与倍率，交给领域层生成结算单。
func (s *Service) adjudicate(r row, kind gameplay.Kind, by gameplay.Who) (gameplay.Slip, gameplay.Quote, error) {
	spec, ok := gameplay.VehicleAt(r.VehicleLv)
	if !ok {
		return gameplay.Slip{}, gameplay.Quote{}, ErrBadInput
	}
	quote := gameplay.QuoteFor(r.ParkerLv, r.HostLv)
	slip, err := s.policy.Adjudicate(kind, by, r.BeganAt, s.clock(), spec.Hourly, quote, s.timeline)
	if err != nil {
		return gameplay.Slip{}, quote, translateSlipErr(err)
	}
	return slip, quote, nil
}

// translateSlipErr 把领域错误翻成面向玩家的提示。
func translateSlipErr(err error) error {
	switch {
	case err == nil:
		return nil
	case errors.Is(err, gameplay.ErrPhaseClosed):
		return ErrBadInput
	case errors.Is(err, gameplay.ErrWrongSide):
		return ErrNotYours
	default:
		return err
	}
}

// commit 落账：关租约、放车位、回车辆、发金币、加经验、记动态。
func (s *Service) commit(ctx context.Context, tx *sql.Tx, r row, kind gameplay.Kind, slip gameplay.Slip, exp int) error {
	if err := s.store.CloseLease(ctx, tx, r.LeaseID, kind, slip.Gross, slip.ParkerShare, slip.HostShare, s.clock()); err != nil {
		return ErrOccupied
	}
	if err := s.store.TakeVehicle(ctx, tx, r.VehicleID, r.ParkerID,
		gameplay.VehicleLeased, gameplay.VehicleIdle); err != nil {
		return ErrOccupied
	}
	if err := s.store.ReleaseCell(ctx, tx, r.CellID); err != nil {
		return err
	}
	if slip.ParkerShare > 0 {
		if err := s.store.AddCoin(ctx, tx, r.ParkerID, slip.ParkerShare); err != nil {
			return err
		}
	}
	if slip.HostShare > 0 {
		if err := s.store.AddCoin(ctx, tx, r.HostID, slip.HostShare); err != nil {
			return err
		}
	}
	if _, _, err := s.store.GainExp(ctx, tx, r.ParkerID, exp); err != nil {
		return err
	}

	feedKind := repo.FeedLeft
	actor := r.ParkerID
	if kind == gameplay.KindTicket {
		feedKind = repo.FeedTicketed
		actor = r.HostID
		// 被贴条的一方自动把对方记进仇人列表，通讯录因此长期有人可打。
		if err := s.store.UpsertBond(ctx, tx, r.ParkerID, r.HostID, repo.BondFoe); err != nil {
			return err
		}
		if err := s.store.BumpHeat(ctx, tx, r.ParkerID, r.HostID); err != nil {
			return err
		}
	}
	spec, _ := gameplay.VehicleAt(r.VehicleLv)
	return s.store.AddFeed(ctx, tx, r.HostID, actor, feedKind, r.VehicleLv, spec.Name, slip.HostShare)
}

// SweepMature 扫描所有停满时长却还没结算的租约，逐条按期满结账。
// 每条租约单独一个事务，避免一次扫描把大批行锁在同一事务里。
func (s *Service) SweepMature(ctx context.Context, limit int) (int, error) {
	limit = clampLimit(limit, 100, 500)
	cutoff := s.clock().Add(-s.timeline.Total())
	rows, err := s.store.MatureCandidates(ctx, cutoff, limit)
	if err != nil {
		return 0, err
	}
	done := 0
	for _, m := range rows {
		r := row{
			LeaseID:   m.LeaseID,
			VehicleID: m.VehicleID,
			CellID:    m.CellID,
			ParkerID:  m.ParkerID,
			HostID:    m.HostID,
			BeganAt:   m.BeganAt,
			VehicleLv: m.VehicleLv,
			ParkerLv:  m.ParkerLv,
			HostLv:    m.HostLv,
		}
		slip, quote, err := s.adjudicate(r, gameplay.KindMature, gameplay.WhoParker)
		if err != nil {
			continue
		}
		exp := gameplay.SettleExp(slip.Minutes, quote)
		err = s.store.InTx(ctx, func(tx *sql.Tx) error {
			return s.commit(ctx, tx, r, gameplay.KindMature, slip, exp)
		})
		if err == nil {
			done++
		}
	}
	return done, nil
}
