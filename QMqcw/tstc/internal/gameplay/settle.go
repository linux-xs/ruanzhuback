package gameplay

import (
	"errors"
	"time"

	"tstc/internal/money"
)

// Kind 表示一笔租约以什么方式收尾。
type Kind uint8

const (
	// KindNone 表示租约还在进行中。
	KindNone Kind = iota
	// KindRecall 车主在可召回阶段主动开走。
	KindRecall
	// KindTicket 车位主人贴条把车赶走。
	KindTicket
	// KindMature 停满时长自然期满。
	KindMature
	// KindCard 车主使用幸运卡即时结算。
	KindCard
)

// Code 返回结算方式的英文短码。
func (k Kind) Code() string {
	switch k {
	case KindRecall:
		return "recall"
	case KindTicket:
		return "ticket"
	case KindMature:
		return "mature"
	case KindCard:
		return "card"
	}
	return "none"
}

// Label 返回结算方式的中文名。
func (k Kind) Label() string {
	switch k {
	case KindRecall:
		return "主动召回"
	case KindTicket:
		return "贴条结算"
	case KindMature:
		return "期满结算"
	case KindCard:
		return "幸运卡秒结"
	}
	return ""
}

// Who 表示发起操作的一方，用于校验操作资格。
type Who uint8

const (
	// WhoParker 是停放车辆的一方。
	WhoParker Who = iota + 1
	// WhoHost 是车位的所有权人。
	WhoHost
)

// 结算环节可能返回的错误，接口层统一映射成提示文案。
var (
	// ErrWrongSide 表示操作方没有这项权限。
	ErrWrongSide = errors.New("你没有这项操作权限")
	// ErrPhaseClosed 表示当前阶段不允许该操作。
	ErrPhaseClosed = errors.New("当前阶段不允许该操作")
	// ErrBadAmount 表示金额异常（负数或越过上限）。
	ErrBadAmount = errors.New("收益金额异常")
)

// Policy 收纳一切可调的结算比例。
// 比例用千分数表达：900 即 90%，避免 0.9 之类的浮点进入账目。
type Policy struct {
	RecallPermille      int64
	TicketParkerPermille int64
	FullHours           int
}

// DefaultPolicy 返回出厂结算策略：召回 90%，贴条 80/20，满 8 小时。
func DefaultPolicy() Policy {
	return Policy{
		RecallPermille:       900,
		TicketParkerPermille: 800,
		FullHours:            8,
	}
}

// Validate 检查策略是否落在合理区间，配置错误时启动即失败。
func (p Policy) Validate() error {
	if p.FullHours <= 0 || p.FullHours > 24 {
		return errors.New("满额时长必须在 1 到 24 小时之间")
	}
	if p.RecallPermille <= 0 || p.RecallPermille > 1000 {
		return errors.New("召回比例必须在 0 到 1000 千分之间")
	}
	if p.TicketParkerPermille <= 0 || p.TicketParkerPermille >= 1000 {
		return errors.New("贴条分成比例必须在 0 到 1000 千分之间")
	}
	return nil
}

// Slip 是一张结算单，把一次结算的全部数值固化下来，便于入库与回溯。
type Slip struct {
	Kind        Kind
	SettledAt   time.Time
	Minutes     int
	Hourly      money.Coin
	Rate        money.Ratio
	Gross       money.Coin
	ParkerShare money.Coin
	HostShare   money.Coin
	Reason      string
}

// Total 返回这张单子实际发出去的金币总数。
func (s Slip) Total() money.Coin { return s.ParkerShare + s.HostShare }

// Adjudicate 依据结算方式、时间轴与倍率生成结算单。
//
// 调用方只需给出「谁发起、什么方式、起点在哪」，权限判定与金额计算都在这里完成，
// 上层不需要重复写 if 判断阶段。
func (p Policy) Adjudicate(kind Kind, by Who, start, now time.Time,
	hourly money.Coin, quote Quote, tl Timeline) (Slip, error) {
	if hourly < 0 {
		return Slip{}, ErrBadAmount
	}
	slip := Slip{
		Kind:      kind,
		SettledAt: now,
		Hourly:    hourly,
		Rate:      quote.Ratio,
		Minutes:   int(tl.Elapsed(start, now).Minutes()),
	}
	if slip.Minutes < 0 {
		slip.Minutes = 0
	}
	stage := tl.StageOf(start, now)

	switch kind {
	case KindCard:
		if by != WhoParker {
			return Slip{}, ErrWrongSide
		}
		// 幸运卡随时可用，直接按满额计算，不受当前停留时长影响。
		slip.Gross = hourly.Scale(quote.Ratio).MulDiv(int64(p.FullHours), 1)
		slip.ParkerShare = slip.Gross
		slip.Reason = "幸运卡按满额即时结算"
	case KindRecall:
		if by != WhoParker {
			return Slip{}, ErrWrongSide
		}
		if !Allowed(stage, ActRecall) {
			return Slip{}, ErrPhaseClosed
		}
		slip.Gross = hourly.Scale(quote.Ratio).PerMinute(slip.Minutes)
		slip.ParkerShare, slip.HostShare = slip.Gross.Split(p.RecallPermille)
		slip.HostShare = 0
		slip.Reason = "车主主动召回，扣除部分收益"
	case KindTicket:
		if by != WhoHost {
			return Slip{}, ErrWrongSide
		}
		if !Allowed(stage, ActTicket) {
			return Slip{}, ErrPhaseClosed
		}
		slip.Gross = hourly.Scale(quote.Ratio).PerMinute(slip.Minutes)
		slip.ParkerShare, slip.HostShare = slip.Gross.Split(p.TicketParkerPermille)
		slip.Reason = "车位主人贴条，按比例分成"
	case KindMature:
		// 期满结算不需要任何人发起，只要阶段到了期满就直接成交。
		if stage != StageMature {
			return Slip{}, ErrPhaseClosed
		}
		slip.Gross = hourly.Scale(quote.Ratio).MulDiv(int64(p.FullHours), 1)
		slip.ParkerShare = slip.Gross
		slip.Reason = "停放期满，收益全额归车主"
	default:
		return Slip{}, ErrPhaseClosed
	}

	if slip.ParkerShare < 0 || slip.HostShare < 0 {
		return Slip{}, ErrBadAmount
	}
	if slip.Total() > money.Ceiling {
		return Slip{}, ErrBadAmount
	}
	return slip, nil
}

// Summary 生成一句面向玩家的结算播报。
func (s Slip) Summary() string {
	switch s.Kind {
	case KindRecall:
		return "召回成功，按 " + s.Rate.Text() + " 结算"
	case KindTicket:
		return "车位被贴条，按 " + s.Rate.Text() + " 分账"
	case KindMature:
		return "停满 " + s.Rate.Text() + " 的满额收益已入账"
	case KindCard:
		return "幸运卡秒结，按 " + s.Rate.Text() + " 拿满额"
	}
	return ""
}
