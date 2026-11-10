package gameplay

import (
	"math"
	"sync"

	"tstc/internal/money"
)

// Vehicle 是一档车型的图鉴条目。
type Vehicle struct {
	Level  int
	Name   string
	Price  money.Coin
	Hourly money.Coin
}

// FullIncome 返回该车型在指定倍率下停满满额时长的收入。
func (v Vehicle) FullIncome(p Policy, r money.Ratio) money.Coin {
	return v.Hourly.Scale(r).MulDiv(int64(p.FullHours), 1)
}

// TradeIn 返回按回收比例折算后的卖车价。
func (v Vehicle) TradeIn(permille int64) money.Coin {
	return v.Price.MulDiv(permille, 1000)
}

// anchor 是图鉴的锚点数据：只写关键等级，中间等级由生成器插值补齐。
type anchor struct {
	Level  int
	Name   string
	Price  int64
	Hourly int64
}

// anchors 对应数值表里的关键档位，价格指数增长、产出线性增长。
var anchors = []anchor{
	{1, "破旧拖拉机", 100, 100},
	{2, "二八大杠自行车", 500, 150},
	{3, "破烂三轮车", 1_500, 250},
	{4, "报废奥拓", 4_000, 400},
	{5, "宏光面包车", 10_000, 600},
	{6, "经济型代步车", 25_000, 850},
	{7, "城市紧凑SUV", 60_000, 1_150},
	{8, "雅阁商务车", 120_000, 1_500},
	{9, "猛禽皮卡", 250_000, 2_000},
	{10, "宝马3系轿跑", 500_000, 2_800},
	{20, "保时捷718", 4_000_000, 8_000},
	{30, "迈巴赫S级", 20_000_000, 18_000},
	{40, "玛莎拉蒂总裁", 80_000_000, 35_000},
	{50, "劳斯莱斯幻影", 300_000_000, 60_000},
	{60, "蝙蝠车", 1_000_000_000, 100_000},
	{70, "纯金重型坦克", 4_000_000_000, 180_000},
	{80, "阿帕奇武装直升机", 15_000_000_000, 300_000},
	{90, "歼十战斗机", 50_000_000_000, 500_000},
	{100, "赛博悬浮UFO", 150_000_000_000, 800_000},
}

// filler 是插值生成等级时使用的中性名称前缀，避免大量重复的动物名。
var filler = []string{"家用型", "改装型", "竞速型", "越野型", "收藏级", "限定版", "实验型", "概念型", "典藏版", "传奇版"}

var (
	catalogOnce sync.Once
	catalogList []Vehicle
)

// Catalog 返回 1 到 100 级的完整图鉴，首次调用时生成并缓存。
func Catalog() []Vehicle {
	catalogOnce.Do(func() {
		catalogList = buildCatalog()
	})
	return catalogList
}

// VehicleAt 按等级取图鉴条目，等级越界时返回 false。
func VehicleAt(level int) (Vehicle, bool) {
	if level < 1 || level > 100 {
		return Vehicle{}, false
	}
	list := Catalog()
	return list[level-1], true
}

// buildCatalog 把锚点之间的空档用等比插值补齐。
//
// 价格在两级锚点之间按等比数列递增（复利式膨胀），产出按等差数列递增，
// 这样既能保留数值表的关键档位，又能让每一级都有可购买的具体车型。
func buildCatalog() []Vehicle {
	out := make([]Vehicle, 0, 100)
	for i := 0; i < len(anchors)-1; i++ {
		from, to := anchors[i], anchors[i+1]
		gap := to.Level - from.Level
		priceStep := math.Pow(float64(to.Price)/float64(from.Price), 1/float64(gap))
		hourlyStep := float64(to.Hourly-from.Hourly) / float64(gap)

		for step := 0; step < gap; step++ {
			level := from.Level + step
			name := from.Name
			if step > 0 {
				name = filler[(level+step)%len(filler)] + from.Name
			}
			price := float64(from.Price) * math.Pow(priceStep, float64(step))
			hourly := float64(from.Hourly) + hourlyStep*float64(step)
			out = append(out, Vehicle{
				Level:  level,
				Name:   name,
				Price:  money.Coin(roundTo(price, 10)),
				Hourly: money.Coin(roundTo(hourly, 10)),
			})
		}
	}
	last := anchors[len(anchors)-1]
	out = append(out, Vehicle{
		Level:  last.Level,
		Name:   last.Name,
		Price:  money.Coin(last.Price),
		Hourly: money.Coin(last.Hourly),
	})
	return out
}

// roundTo 把浮点结果对齐到给定的步长，让图鉴价格读起来是整数。
func roundTo(v float64, step float64) float64 {
	if step <= 0 {
		return math.Round(v)
	}
	return math.Round(v/step) * step
}

// ResalePermille 是卖车回收比例（千分数）。
const ResalePermille int64 = 850

// UnlockMaxLevel 返回玩家当前可购买的车型等级上限。
func UnlockMaxLevel(playerLevel int) int {
	if playerLevel < 1 {
		return 1
	}
	if playerLevel > 100 {
		return 100
	}
	return playerLevel
}
