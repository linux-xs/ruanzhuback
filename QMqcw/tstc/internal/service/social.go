package service

import (
	"context"
	"fmt"
	"time"

	"tstc/internal/gameplay"
	"tstc/internal/repo"
)

// OccupantView 是停在我家车位上那辆车的全部信息。
type OccupantView struct {
	LeaseID           int64     `json:"lease_id"`
	VehicleID         int64     `json:"vehicle_id"`
	VehicleLevel      int       `json:"vehicle_level"`
	VehicleName       string    `json:"vehicle_name"`
	ParkerNick        string    `json:"parker_nick"`
	ParkerLevel       int       `json:"parker_level"`
	Rate              string    `json:"rate"`
	Stage             StageView `json:"stage"`
	Accrued           string    `json:"accrued"`
	ParkerPayIfTicket string    `json:"parker_pay_if_ticket"`
	HostPayIfTicket   string    `json:"host_pay_if_ticket"`
	CanTicket         bool      `json:"can_ticket"`
	WaitFor           int       `json:"wait_for"`
}

// LotView 是我的一个车位。
type LotView struct {
	ID       int64         `json:"id"`
	Seq      int           `json:"seq"`
	State    string        `json:"state"`
	Occupant *OccupantView `json:"occupant,omitempty"`
}

// Lots 返回我的车位列表，被占用的车位带上贴条预览。
func (s *Service) Lots(ctx context.Context, playerID int64) ([]LotView, error) {
	self, err := s.store.PlayerByID(ctx, playerID)
	if err != nil {
		return nil, mapRepoErr(err)
	}
	if err := s.store.EnsureCells(ctx, s.store, playerID, self.Capacity().LotCells); err != nil {
		return nil, err
	}
	cells, err := s.store.CellsOf(ctx, playerID)
	if err != nil {
		return nil, err
	}
	occupancy, err := s.store.OccupancyOf(ctx, playerID)
	if err != nil {
		return nil, err
	}
	byCell := make(map[int64]repo.Occupancy, len(occupancy))
	for _, o := range occupancy {
		byCell[o.CellID] = o
	}

	out := make([]LotView, 0, len(cells))
	for _, c := range cells {
		lot := LotView{ID: c.ID, Seq: c.Seq, State: "free"}
		if o, ok := byCell[c.ID]; ok {
			lot.State = "taken"
			lot.Occupant = s.occupantView(self.Level, o)
		}
		out = append(out, lot)
	}
	return out, nil
}

// occupantView 计算一辆外来车的贴条预览：还能拿多少、什么时候能贴。
func (s *Service) occupantView(hostLevel int, o repo.Occupancy) *OccupantView {
	spec, ok := gameplay.VehicleAt(o.VehicleLv)
	if !ok {
		return nil
	}
	quote := gameplay.QuoteFor(o.ParkerLv, hostLevel)
	stage := s.timeline.StageOf(o.BeganAt, s.clock())
	view := &OccupantView{
		LeaseID:      o.LeaseID,
		VehicleID:    o.VehicleID,
		VehicleLevel: o.VehicleLv,
		VehicleName:  spec.Name,
		ParkerNick:   o.ParkerNick,
		ParkerLevel:  o.ParkerLv,
		Rate:         quote.Text(),
		Stage:        s.stageView(o.BeganAt),
		Accrued:      s.accrue(o.BeganAt, spec.Hourly, quote).String(),
		CanTicket:    gameplay.Allowed(stage, gameplay.ActTicket),
	}
	if !view.CanTicket {
		wait := s.timeline.LockFor + s.timeline.EscapeFor - s.timeline.Elapsed(o.BeganAt, s.clock())
		if wait > 0 {
			view.WaitFor = int(wait.Minutes()) + 1
		}
	}
	if slip, err := s.policy.Adjudicate(gameplay.KindTicket, gameplay.WhoHost,
		o.BeganAt, s.clock(), spec.Hourly, quote, s.timeline); err == nil {
		view.ParkerPayIfTicket = slip.ParkerShare.String()
		view.HostPayIfTicket = slip.HostShare.String()
	}
	return view
}

// BondItem 是通讯录里的一条。
type BondItem struct {
	TargetID   int64  `json:"target_id"`
	UID        string `json:"uid"`
	Nick       string `json:"nick"`
	Level      int    `json:"level"`
	Kind       string `json:"kind"`
	Heat       int    `json:"heat"`
	Free       int    `json:"free"`
	Total      int    `json:"total"`
	Rate       string `json:"rate"`
	LastSeen   string `json:"last_seen"`
}

// Bonds 返回好友或仇人列表。
func (s *Service) Bonds(ctx context.Context, playerID int64, kind string) ([]BondItem, error) {
	if kind != repo.BondFriend && kind != repo.BondFoe {
		return nil, ErrBadInput
	}
	self, err := s.store.PlayerByID(ctx, playerID)
	if err != nil {
		return nil, mapRepoErr(err)
	}
	cards, err := s.store.BondsOf(ctx, playerID, kind)
	if err != nil {
		return nil, err
	}
	out := make([]BondItem, 0, len(cards))
	for _, c := range cards {
		out = append(out, BondItem{
			TargetID: c.TargetID,
			UID:      c.TargetUID,
			Nick:     c.TargetNick,
			Level:    c.TargetLevel,
			Kind:     c.Kind,
			Heat:     c.Heat,
			Free:     c.FreeCells,
			Total:    c.TotalCells,
			Rate:     gameplay.QuoteFor(self.Level, c.TargetLevel).Text(),
			LastSeen: agoText(s.clock(), c.LastAt),
		})
	}
	return out, nil
}

// Mark 把某人标成好友或仇人。同一个人只保留一种关系，重复标记即覆盖。
func (s *Service) Mark(ctx context.Context, playerID int64, targetUID, kind string) error {
	if kind != repo.BondFriend && kind != repo.BondFoe {
		return ErrBadInput
	}
	target, err := s.store.PlayerByUID(ctx, trimUpper(targetUID))
	if err != nil {
		return ErrNoPlayer
	}
	if target.ID == playerID {
		return ErrSelf
	}
	return s.store.UpsertBond(ctx, s.store, playerID, target.ID, kind)
}

// FeedItem 是一条访客动态。
type FeedItem struct {
	ID           int64  `json:"id"`
	Kind         int    `json:"kind"`
	KindText     string `json:"kind_text"`
	ActorID      int64  `json:"actor_id"`
	ActorNick    string `json:"actor_nick"`
	ActorLevel   int    `json:"actor_level"`
	VehicleName  string `json:"vehicle_name"`
	VehicleLevel int    `json:"vehicle_level"`
	Coin         string `json:"coin"`
	Ago          string `json:"ago"`
}

// feedText 把动态类型翻成一句话。
func feedText(kind int, actor, vehicle string) string {
	switch kind {
	case repo.FeedParked:
		return fmt.Sprintf("%s 把 %s 停进了你的车位", actor, vehicle)
	case repo.FeedTicketed:
		return fmt.Sprintf("%s 贴了你的单，拿走了一份罚金", actor)
	case repo.FeedLeft:
		return fmt.Sprintf("%s 的 %s 已经开走了", actor, vehicle)
	}
	return actor
}

// Feed 返回最近若干小时的动态，默认 24 小时。
func (s *Service) Feed(ctx context.Context, playerID int64, hours int) ([]FeedItem, error) {
	hours = clampLimit(hours, 24, 72)
	since := s.clock().Add(-time.Duration(hours) * time.Hour)
	cards, err := s.store.FeedOf(ctx, playerID, since, 50)
	if err != nil {
		return nil, err
	}
	out := make([]FeedItem, 0, len(cards))
	for _, c := range cards {
		out = append(out, FeedItem{
			ID:           c.ID,
			Kind:         c.Kind,
			KindText:     feedText(c.Kind, c.ActorNick, c.VName),
			ActorID:      c.ActorID,
			ActorNick:    c.ActorNick,
			ActorLevel:   c.ActorLevel,
			VehicleName:  c.VName,
			VehicleLevel: c.VLevel,
			Coin:         c.Coin.String(),
			Ago:          agoText(s.clock(), c.At),
		})
	}
	return out, nil
}

// Recommend 返回「推荐玩家」：等级高且有空位的人，方便直接去停车。
func (s *Service) Recommend(ctx context.Context, playerID int64) ([]BondItem, error) {
	self, err := s.store.PlayerByID(ctx, playerID)
	if err != nil {
		return nil, mapRepoErr(err)
	}
	cards, err := s.store.TopPlayers(ctx, playerID, 10)
	if err != nil {
		return nil, err
	}
	out := make([]BondItem, 0, len(cards))
	for _, c := range cards {
		out = append(out, BondItem{
			TargetID: c.TargetID,
			UID:      c.TargetUID,
			Nick:     c.TargetNick,
			Level:    c.TargetLevel,
			Free:     c.FreeCells,
			Total:    c.TotalCells,
			Rate:     gameplay.QuoteFor(self.Level, c.TargetLevel).Text(),
		})
	}
	return out, nil
}

// agoText 把时间差写成「刚刚 / 12 分钟前 / 3 小时前」。
func agoText(now, at time.Time) string {
	if at.IsZero() {
		return "还没有记录"
	}
	d := now.Sub(at)
	switch {
	case d < time.Minute:
		return "刚刚"
	case d < time.Hour:
		return fmt.Sprintf("%d 分钟前", int(d.Minutes()))
	case d < 24*time.Hour:
		return fmt.Sprintf("%d 小时前", int(d.Hours()))
	default:
		return fmt.Sprintf("%d 天前", int(d.Hours()/24))
	}
}
