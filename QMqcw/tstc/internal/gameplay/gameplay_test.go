package gameplay

import (
	"errors"
	"testing"
	"time"

	"tstc/internal/money"
)

// 固定一个基准时刻，避免用 time.Now 让用例随运行时间漂移。
var base = time.Date(2026, 3, 1, 8, 0, 0, 0, time.Local)

func at(minutes int) time.Time { return base.Add(time.Duration(minutes) * time.Minute) }

func TestStageOfBoundaries(t *testing.T) {
	tl := DefaultTimeline()
	cases := []struct {
		minutes int
		want    Stage
	}{
		{0, StageLock},
		{59, StageLock},
		{60, StageEscape},
		{119, StageEscape},
		{120, StageHunt},
		{479, StageHunt},
		{480, StageMature},
		{600, StageMature},
	}
	for _, c := range cases {
		got := tl.StageOf(base, at(c.minutes))
		if got != c.want {
			t.Fatalf("停放 %d 分钟应为 %s，实际 %s", c.minutes, c.want.Label(), got.Label())
		}
	}
}

func TestAllowedActionsByStage(t *testing.T) {
	if Allowed(StageLock, ActRecall) {
		t.Fatal("锁定期不应当允许召回")
	}
	if Allowed(StageLock, ActTicket) {
		t.Fatal("锁定期不应当允许贴条")
	}
	if !Allowed(StageLock, ActCard) {
		t.Fatal("锁定期应当允许幸运卡结算")
	}
	if Allowed(StageEscape, ActTicket) {
		t.Fatal("观察期不应当允许贴条")
	}
	if !Allowed(StageHunt, ActTicket) {
		t.Fatal("争夺期应当允许贴条")
	}
	if Allowed(StageMature, ActCard) {
		t.Fatal("期满后不再需要幸运卡")
	}
}

func TestQuoteForLevelGap(t *testing.T) {
	if got := QuoteFor(50, 10).Ratio.Text(); got != "1倍" {
		t.Fatalf("等级更高应为 1 倍，实际 %s", got)
	}
	if got := QuoteFor(20, 20).Ratio.Text(); got != "1.5倍" {
		t.Fatalf("平级应为 1.5 倍，实际 %s", got)
	}
	if got := QuoteFor(20, 60).Ratio.Text(); got != "2倍" {
		t.Fatalf("等级更低应为 2 倍，实际 %s", got)
	}
}

func TestAdjudicateRecall(t *testing.T) {
	p := DefaultPolicy()
	tl := DefaultTimeline()
	quote := QuoteFor(20, 40) // 2 倍
	hourly := money.Coin(8_000)

	// 停放 90 分钟、2 倍：毛收益 8000*2*1.5 = 24000，召回拿 90%
	slip, err := p.Adjudicate(KindRecall, WhoParker, base, at(90), hourly, quote, tl)
	if err != nil {
		t.Fatalf("召回不应当报错: %v", err)
	}
	if slip.Gross != money.Coin(24_000) {
		t.Fatalf("毛收益应为 24000，实际 %d", slip.Gross)
	}
	if slip.ParkerShare != money.Coin(21_600) {
		t.Fatalf("召回应拿 90%% 即 21600，实际 %d", slip.ParkerShare)
	}
	if slip.HostShare != 0 {
		t.Fatalf("召回时车位主人不应当分到钱，实际 %d", slip.HostShare)
	}

	// 锁定期内召回必须被拒绝
	if _, err := p.Adjudicate(KindRecall, WhoParker, base, at(30), hourly, quote, tl); !errors.Is(err, ErrPhaseClosed) {
		t.Fatalf("锁定期召回应返回阶段错误，实际 %v", err)
	}
	// 车位主人不能发起召回
	if _, err := p.Adjudicate(KindRecall, WhoHost, base, at(90), hourly, quote, tl); !errors.Is(err, ErrWrongSide) {
		t.Fatalf("非车主召回应返回权限错误，实际 %v", err)
	}
}

func TestAdjudicateTicketSplitsExactly(t *testing.T) {
	p := DefaultPolicy()
	tl := DefaultTimeline()
	quote := QuoteFor(10, 30) // 2 倍
	hourly := money.Coin(1_150)

	slip, err := p.Adjudicate(KindTicket, WhoHost, base, at(200), hourly, quote, tl)
	if err != nil {
		t.Fatalf("贴条不应当报错: %v", err)
	}
	// 200 分钟、2 倍：1150*2=2300/小时 → 2300*200/60 = 7666（向下取整）
	if slip.Gross != money.Coin(7_666) {
		t.Fatalf("毛收益应为 7666，实际 %d", slip.Gross)
	}
	if slip.ParkerShare+slip.HostShare != slip.Gross {
		t.Fatalf("分成之和应等于毛收益：%d + %d != %d", slip.ParkerShare, slip.HostShare, slip.Gross)
	}
	if slip.HostShare < money.Coin(1_500) {
		t.Fatalf("车位主人分成偏低：%d", slip.HostShare)
	}
	// 观察期内贴条必须被拒绝
	if _, err := p.Adjudicate(KindTicket, WhoHost, base, at(100), hourly, quote, tl); !errors.Is(err, ErrPhaseClosed) {
		t.Fatalf("观察期贴条应返回阶段错误，实际 %v", err)
	}
}

func TestAdjudicateCardAndMature(t *testing.T) {
	p := DefaultPolicy()
	tl := DefaultTimeline()
	quote := QuoteFor(5, 50) // 2 倍
	hourly := money.Coin(600)

	// 幸运卡不受停留时长影响，直接按 8 小时满额
	card, err := p.Adjudicate(KindCard, WhoParker, base, at(1), hourly, quote, tl)
	if err != nil {
		t.Fatalf("幸运卡结算不应当报错: %v", err)
	}
	if card.Gross != money.Coin(9_600) {
		t.Fatalf("满额应为 600*2*8=9600，实际 %d", card.Gross)
	}
	if card.ParkerShare != card.Gross {
		t.Fatal("幸运卡结算应全额归车主")
	}

	// 期满结算：只有真到 8 小时才成立
	if _, err := p.Adjudicate(KindMature, WhoParker, base, at(400), hourly, quote, tl); !errors.Is(err, ErrPhaseClosed) {
		t.Fatalf("未满 8 小时不应期满结算，实际 %v", err)
	}
	mature, err := p.Adjudicate(KindMature, WhoParker, base, at(480), hourly, quote, tl)
	if err != nil {
		t.Fatalf("期满结算不应当报错: %v", err)
	}
	if mature.ParkerShare != money.Coin(9_600) {
		t.Fatalf("期满应拿满额 9600，实际 %d", mature.ParkerShare)
	}
}

func TestTimelineRemaining(t *testing.T) {
	tl := DefaultTimeline()
	if got := tl.Remaining(base, at(30)); got != 30*time.Minute {
		t.Fatalf("锁定期还剩 30 分钟，实际 %s", got)
	}
	if got := tl.Remaining(base, at(90)); got != 30*time.Minute {
		t.Fatalf("观察期还剩 30 分钟，实际 %s", got)
	}
	if got := tl.Remaining(base, at(500)); got != 0 {
		t.Fatalf("期满后剩余应为零，实际 %s", got)
	}
}

func TestCapacityCeiling(t *testing.T) {
	if c := CapacityFor(1); c.LotCells != 1 || c.VehicleSlots != 3 {
		t.Fatalf("1 级应有 1 个车位 3 个车库位，实际 %+v", c)
	}
	if c := CapacityFor(100); c.LotCells != 10 || c.VehicleSlots != 10 {
		t.Fatalf("满级应双封顶 10，实际 %+v", c)
	}
}

func TestCatalogIntegrity(t *testing.T) {
	list := Catalog()
	if len(list) != 100 {
		t.Fatalf("图鉴应有 100 级，实际 %d", len(list))
	}
	for i, v := range list {
		if v.Level != i+1 {
			t.Fatalf("第 %d 项等级应为 %d，实际 %d", i, i+1, v.Level)
		}
		if v.Price <= 0 || v.Hourly <= 0 {
			t.Fatalf("等级 %d 的价格或产出不合法: %d / %d", v.Level, v.Price, v.Hourly)
		}
		if i > 0 && v.Price < list[i-1].Price {
			t.Fatalf("等级 %d 的价格低于上一级", v.Level)
		}
	}
	first, _ := VehicleAt(1)
	if first.Name != "破旧拖拉机" {
		t.Fatalf("1 级车型应为破旧拖拉机，实际 %s", first.Name)
	}
	last, _ := VehicleAt(100)
	if last.Name != "赛博悬浮UFO" {
		t.Fatalf("100 级车型应为赛博悬浮UFO，实际 %s", last.Name)
	}
}
