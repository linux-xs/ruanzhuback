package gameplay

import (
	"hash/fnv"
	"strings"

	"tstc/internal/money"
)

// 车库与车位的容量规则：随等级增长，最终都封顶 10 个。
const (
	CapCeiling      = 10
	lotsBase        = 1
	lotsPerLevels   = 11
	garageBase      = 3
	garagePerLevels = 9
)

// Capacity 描述一个玩家的车库与车位额度。
type Capacity struct {
	VehicleSlots int
	LotCells     int
}

// CapacityFor 按等级算额度：车位每 11 级加一个，车库每 9 级加一个，均不超过 10。
func CapacityFor(level int) Capacity {
	if level < 1 {
		level = 1
	}
	cells := lotsBase + level/lotsPerLevels
	if cells > CapCeiling {
		cells = CapCeiling
	}
	slots := garageBase + level/garagePerLevels
	if slots > CapCeiling {
		slots = CapCeiling
	}
	return Capacity{VehicleSlots: slots, LotCells: cells}
}

// 签到档位：普通签到给保底金币，幸运卡签到给豪华金币并附带经验。
const (
	PlainSignCoin  money.Coin = 5_000
	CardSignCoin   money.Coin = 50_000
	CardSignExp               = 20
	CardSignCost              = 1
)

// DailyCardQuota 是每日通过观看激励内容可获得的幸运卡上限。
const DailyCardQuota = 10

// SignWay 表示签到方式。
type SignWay string

const (
	// SignPlain 是免费签到。
	SignPlain SignWay = "plain"
	// SignCard 是消耗一张幸运卡的豪华签到。
	SignCard SignWay = "card"
)

// ParseSignWay 把外部传入的字符串转成签到方式，未知值按非法处理。
func ParseSignWay(raw string) (SignWay, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "plain", "normal", "free":
		return SignPlain, true
	case "card", "lucky":
		return SignCard, true
	}
	return "", false
}

// SignReward 是一次签到的产出。
type SignReward struct {
	Way  SignWay
	Coin money.Coin
	Exp  int
	Cost int
}

// RewardOf 返回该签到方式对应的奖励，供服务层直接入账。
func RewardOf(way SignWay) SignReward {
	if way == SignCard {
		return SignReward{Way: SignCard, Coin: CardSignCoin, Exp: CardSignExp, Cost: CardSignCost}
	}
	return SignReward{Way: SignPlain, Coin: PlainSignCoin}
}

// LevelUpExp 返回从当前等级升到下一级所需经验（1 级到 100 级）。
// 采用平方根式增长：前期升级快，后期靠高频停车累积。
func LevelUpExp(level int) int {
	if level < 1 {
		level = 1
	}
	if level >= 100 {
		return 0
	}
	base := 120 + level*level*3
	return base
}

// SettleExp 返回一次结算能获得的经验。
// 经验只和停放时长、倍率有关，与金币数额脱钩，避免高等级车型刷经验。
func SettleExp(minutes int, quote Quote) int {
	if minutes <= 0 {
		return 0
	}
	raw := int(int64(minutes) * quote.Ratio.N / quote.Ratio.D / 2)
	if raw > 240 {
		return 240
	}
	return raw
}

// PlayerUID 生成玩家对外展示的短号：五位大写字母加数字，避开易混字符。
func PlayerUID(seed int64) string {
	const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
	h := fnv.New64a()
	var buf [8]byte
	for i := 0; i < 8; i++ {
		buf[i] = byte(seed >> (8 * i))
	}
	_, _ = h.Write(buf[:])
	sum := h.Sum64()
	out := make([]byte, 5)
	for i := 0; i < 5; i++ {
		out[i] = alphabet[sum%uint64(len(alphabet))]
		sum /= uint64(len(alphabet))
	}
	return string(out)
}
