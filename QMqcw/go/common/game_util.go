package common

import "time"

// 停车场次收益计算
func CalcParkGold(outputPerHour int, elapsedMinutes int, rate float64) int64 {
	hours := float64(elapsedMinutes) / 60.0
	return int64(float64(outputPerHour) * hours * rate)
}

// 计算动态倍率：基于停车双方等级差
func CalcRate(guestLevel int, hostLevel int) float64 {
	if guestLevel > hostLevel {
		return 1.0
	}
	if guestLevel == hostLevel {
		return 1.5
	}
	return 2.0
}

// 判断当前时间轴阶段
// 1=绝对锁定期 2=黄金逃生期 3=杀戮时刻 4=自然圆满
func GetTimePhase(startTime time.Time) int {
	elapsed := int(time.Since(startTime).Minutes())
	if elapsed < 60 {
		return 1
	}
	if elapsed < 120 {
		return 2
	}
	if elapsed < 480 {
		return 3
	}
	return 4
}

// 卖车回收价
func CalcSellPrice(buyPrice int64) int64 {
	return int64(float64(buyPrice) * 0.85)
}
