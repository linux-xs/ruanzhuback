package service

import (
	"context"
	"database/sql"
	"errors"

	"tstc/internal/gameplay"
	"tstc/internal/repo"
)

// mapRepoErr 把仓储层错误翻成服务层语义，未识别的错误原样抛出。
func mapRepoErr(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, repo.ErrNoRow) {
		return ErrNoPlayer
	}
	return err
}

// Profile 是首页顶栏与个人面板需要的全部数字。
type Profile struct {
	ID           int64  `json:"id"`
	UID          string `json:"uid"`
	Nick         string `json:"nick"`
	Level        int    `json:"level"`
	Exp          int    `json:"exp"`
	ExpNeed      int    `json:"exp_need"`
	Coin         string `json:"coin"`
	CoinRaw      int64  `json:"coin_raw"`
	Card         int    `json:"card"`
	AdLeft       int    `json:"ad_left"`
	VehicleCount int    `json:"vehicle_count"`
	VehicleCap   int    `json:"vehicle_cap"`
	CellFree     int    `json:"cell_free"`
	CellTotal    int    `json:"cell_total"`
	MaxBuyLevel  int    `json:"max_buy_level"`
	SignedToday  bool   `json:"signed_today"`
	Streak       int    `json:"streak"`
	FullHours    int    `json:"full_hours"`
	RecallPct    int64  `json:"recall_pct"`
	TicketPct    int64  `json:"ticket_pct"`
	CardQuota    int    `json:"card_quota"`
}

// Profile 汇总当前玩家的资产与规则参数，界面只调这一个接口就能画完顶栏。
func (s *Service) Profile(ctx context.Context, playerID int64) (Profile, error) {
	p, err := s.store.PlayerByID(ctx, playerID)
	if err != nil {
		return Profile{}, mapRepoErr(err)
	}
	cells, err := s.store.CellsOf(ctx, playerID)
	if err != nil {
		return Profile{}, err
	}
	vehicles, err := s.store.CountVehicles(ctx, s.store, playerID)
	if err != nil {
		return Profile{}, err
	}
	signed, err := s.store.SignedToday(ctx, playerID, s.Today())
	if err != nil {
		return Profile{}, err
	}
	streak, err := s.store.SignStreak(ctx, playerID, s.Now())
	if err != nil {
		return Profile{}, err
	}

	limit := p.Capacity()
	free := 0
	for _, c := range cells {
		if c.State == gameplay.CellFree {
			free++
		}
	}
	return Profile{
		ID:           p.ID,
		UID:          p.UID,
		Nick:         p.Nick,
		Level:        p.Level,
		Exp:          p.Exp,
		ExpNeed:      gameplay.LevelUpExp(p.Level),
		Coin:         p.Coin.String(),
		CoinRaw:      int64(p.Coin),
		Card:         p.Card,
		AdLeft:       repo.AdSlot(p, s.Today(), gameplay.DailyCardQuota),
		VehicleCount: vehicles,
		VehicleCap:   limit.VehicleSlots,
		CellFree:     free,
		CellTotal:    len(cells),
		MaxBuyLevel:  gameplay.UnlockMaxLevel(p.Level),
		SignedToday:  signed,
		Streak:       streak,
		FullHours:    s.policy.FullHours,
		RecallPct:    s.policy.RecallPermille / 10,
		TicketPct:    s.policy.TicketParkerPermille / 10,
		CardQuota:    gameplay.DailyCardQuota,
	}, nil
}

// SignResult 是一次签到的回执。
type SignResult struct {
	Way       string `json:"way"`
	Coin      string `json:"coin"`
	Exp       int    `json:"exp"`
	CardSpent int    `json:"card_spent"`
	Level     int    `json:"level"`
	Streak    int    `json:"streak"`
}

// Sign 执行每日签到。
//
// 同一账号同一天只允许一次：先查一次用于给出友好提示，真正的防重由
// day_sign 的唯一键承担，即使两个请求同时到达也只有一条能写进去。
func (s *Service) Sign(ctx context.Context, playerID int64, rawWay string) (SignResult, error) {
	way, ok := gameplay.ParseSignWay(rawWay)
	if !ok {
		return SignResult{}, ErrBadInput
	}
	reward := gameplay.RewardOf(way)
	day := s.Today()

	var out SignResult
	err := s.store.InTx(ctx, func(tx *sql.Tx) error {
		p, err := s.store.LockPlayer(ctx, tx, playerID)
		if err != nil {
			return mapRepoErr(err)
		}
		signed, err := s.store.SignedToday(ctx, playerID, day)
		if err != nil {
			return err
		}
		if signed {
			return ErrSigned
		}
		if reward.Cost > 0 && p.Card < reward.Cost {
			return ErrNoCard
		}
		if err := s.store.RecordSign(ctx, tx, playerID, day, way, reward.Coin); err != nil {
			if errors.Is(err, repo.ErrDuplicate) {
				return ErrSigned
			}
			return err
		}
		if reward.Cost > 0 {
			if err := s.store.AddCard(ctx, tx, playerID, -reward.Cost); err != nil {
				return ErrNoCard
			}
		}
		if err := s.store.AddCoin(ctx, tx, playerID, reward.Coin); err != nil {
			return err
		}
		level, _, err := s.store.GainExp(ctx, tx, playerID, reward.Exp)
		if err != nil {
			return err
		}
		streak, err := s.store.SignStreak(ctx, playerID, s.Now())
		if err != nil {
			return err
		}
		out = SignResult{
			Way:       string(way),
			Coin:      reward.Coin.String(),
			Exp:       reward.Exp,
			CardSpent: reward.Cost,
			Level:     level,
			Streak:    streak,
		}
		return nil
	})
	if err != nil {
		return SignResult{}, err
	}
	return out, nil
}

// CardClaim 是领取幸运卡的回执。
type CardClaim struct {
	Card    int `json:"card"`
	Used    int `json:"used"`
	Left    int `json:"left"`
	Quota   int `json:"quota"`
}

// ClaimCard 处理「看完激励内容领一张幸运卡」。
// 次数按自然日重置，用到的额度记在玩家行的 ad_used / ad_day 两个字段上。
func (s *Service) ClaimCard(ctx context.Context, playerID int64) (CardClaim, error) {
	day := s.Today()
	var out CardClaim
	err := s.store.InTx(ctx, func(tx *sql.Tx) error {
		card, used, err := s.store.ClaimAdCard(ctx, tx, playerID, day, gameplay.DailyCardQuota)
		if err != nil {
			if errors.Is(err, repo.ErrConflict) {
				return ErrAdExhausted
			}
			return mapRepoErr(err)
		}
		out = CardClaim{
			Card:  card,
			Used:  used,
			Left:  gameplay.DailyCardQuota - used,
			Quota: gameplay.DailyCardQuota,
		}
		return nil
	})
	if err != nil {
		return CardClaim{}, err
	}
	return out, nil
}

// NameCard 是搜索玩家时弹出的名片。
type NameCard struct {
	ID         int64  `json:"id"`
	UID        string `json:"uid"`
	Nick       string `json:"nick"`
	Level      int    `json:"level"`
	CellFree   int    `json:"cell_free"`
	CellTotal  int    `json:"cell_total"`
	Relation   string `json:"relation"`
	RateIfPark string `json:"rate_if_park"`
}

// SearchPlayer 按短号找人，顺带给出「去他家停能拿几倍」的即时判断。
func (s *Service) SearchPlayer(ctx context.Context, selfID int64, uid string) (NameCard, error) {
	uid = trimUpper(uid)
	if len(uid) != 5 {
		return NameCard{}, ErrBadInput
	}
	target, err := s.store.SearchByUID(ctx, uid)
	if err != nil {
		return NameCard{}, mapRepoErr(err)
	}
	if target.ID == selfID {
		return NameCard{}, ErrSelf
	}
	cells, err := s.store.CellsOf(ctx, target.ID)
	if err != nil {
		return NameCard{}, err
	}
	free := 0
	for _, c := range cells {
		if c.State == gameplay.CellFree {
			free++
		}
	}
	self, err := s.store.PlayerByID(ctx, selfID)
	if err != nil {
		return NameCard{}, mapRepoErr(err)
	}
	relation, err := s.store.RelationKinds(ctx, s.store, selfID, target.ID)
	if err != nil {
		return NameCard{}, err
	}
	return NameCard{
		ID:         target.ID,
		UID:        target.UID,
		Nick:       target.Nick,
		Level:      target.Level,
		CellFree:   free,
		CellTotal:  len(cells),
		Relation:   relation,
		RateIfPark: gameplay.QuoteFor(self.Level, target.Level).Text(),
	}, nil
}

// Rename 修改昵称，长度不合规时退回原昵称并返回参数错误。
func (s *Service) Rename(ctx context.Context, playerID int64, nick string) error {
	clean := normalizeNick(nick)
	if !validNick(clean) {
		return ErrBadInput
	}
	return s.store.BumpNick(ctx, playerID, clean)
}
