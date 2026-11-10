package money

import "testing"

func TestCoinScaleAndProrate(t *testing.T) {
	c := Coin(8_000)
	if got := c.Scale(NewRatio(3, 2)); got != 12_000 {
		t.Fatalf("8000 按 1.5 倍应为 12000，实际 %d", got)
	}
	if got := c.PerMinute(90); got != 12_000 {
		t.Fatalf("每小时 8000 停 90 分钟应为 12000，实际 %d", got)
	}
	if got := c.PerMinute(0); got != 0 {
		t.Fatalf("零分钟应为零，实际 %d", got)
	}
}

func TestSplitKeepsTotal(t *testing.T) {
	// 除不尽的金额也要保证两份之和等于原值
	for _, total := range []Coin{1, 7, 999, 12_345, 98_765_432} {
		for _, permille := range []int64{1, 333, 800, 900, 999} {
			a, b := total.Split(permille)
			if a+b != total {
				t.Fatalf("%d 按 %d‰ 切分后 %d+%d != %d", total, permille, a, b, total)
			}
			if a < 0 || b < 0 {
				t.Fatalf("切分结果不应为负：%d / %d", a, b)
			}
		}
	}
}

func TestRatioText(t *testing.T) {
	cases := map[string]Ratio{
		"1倍":   NewRatio(1, 1),
		"1.5倍": NewRatio(3, 2),
		"2倍":   NewRatio(2, 1),
	}
	for want, r := range cases {
		if got := r.Text(); got != want {
			t.Fatalf("倍率展示应为 %s，实际 %s", want, got)
		}
	}
}

func TestCoinText(t *testing.T) {
	cases := map[string]Coin{
		"0":            0,
		"999":          999,
		"1,000":        1_000,
		"1,250,000":    1_250_000,
		"-1,500":       -1_500,
	}
	for want, c := range cases {
		if got := c.String(); got != want {
			t.Fatalf("金额展示应为 %s，实际 %s", want, got)
		}
	}
}

func TestParse(t *testing.T) {
	if got, err := Parse("1,250,000"); err != nil || got != 1_250_000 {
		t.Fatalf("解析千分位失败: %v %d", err, got)
	}
	if _, err := Parse(""); err == nil {
		t.Fatal("空串应当返回错误")
	}
	if _, err := Parse("abc"); err == nil {
		t.Fatal("非数字应当返回错误")
	}
}
