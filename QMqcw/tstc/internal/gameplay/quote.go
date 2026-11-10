package gameplay

import "tstc/internal/money"

// Quote 是一次停车能拿到的倍率报价。
// Gap 为停放方等级减车位主人等级，正数是「向下兼容」，负数是「向上攀附」。
type Quote struct {
	Gap   int
	Ratio money.Ratio
}

// 倍率阶梯常量：这些数字同时被说明书与数值表引用，抽出来避免散落。
const (
	permilleDown   = 1000 // 1 倍
	permillePeer   = 1500 // 1.5 倍
	permilleUpward = 2000 // 2 倍
)

// QuoteFor 按双方等级差给出倍率。
// 停放方等级不低于车位主人时按 1 倍，平级 1.5 倍，低一级及以上 2 倍。
func QuoteFor(parkerLevel, hostLevel int) Quote {
	gap := parkerLevel - hostLevel
	switch {
	case gap > 0:
		return Quote{Gap: gap, Ratio: money.NewRatio(permilleDown, 1000)}
	case gap == 0:
		return Quote{Gap: 0, Ratio: money.NewRatio(permillePeer, 1000)}
	default:
		return Quote{Gap: gap, Ratio: money.NewRatio(permilleUpward, 1000)}
	}
}

// Text 返回「2倍」这类展示文案。
func (q Quote) Text() string { return q.Ratio.Text() }

// Note 返回倍率来由的说明，用于停车成功后的提示。
func (q Quote) Note() string {
	switch {
	case q.Gap > 0:
		return "对方等级比你低，按 1 倍结算"
	case q.Gap == 0:
		return "等级相同，按 1.5 倍结算"
	default:
		return "对方等级比你高，按 2 倍结算"
	}
}
