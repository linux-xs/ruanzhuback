// Package money 提供应用内金币的计量与结算原语。
//
// 设计要点：金币全程以 int64 整数存储与运算，任何地方都不出现 float64，
// 以免大额金币（百亿级）在浮点转换时丢精度，也让倍率与分成的结果可复现。
package money

import (
	"errors"
	"strconv"
	"strings"
)

// Coin 表示金币数量，单位为 1 枚金币。
type Coin int64

// ErrOverflow 表示金额运算越过了安全上限。
var ErrOverflow = errors.New("金额超出上限")

// Ceiling 是单笔金额的安全上限，防止异常数据把库里的数值写到越界。
const Ceiling Coin = 1_000_000_000_000_000

// Ratio 用有理数表达倍率，避免 1.5 这类小数进入浮点。
// 例如 1.5 倍记作 {N: 3, D: 2}，2 倍记作 {N: 2, D: 1}。
type Ratio struct {
	N int64
	D int64
}

// NewRatio 构造倍率，分母非法时退化为 1 倍。
func NewRatio(n, d int64) Ratio {
	if d == 0 {
		return Ratio{N: 1, D: 1}
	}
	return Ratio{N: n, D: d}
}

// Valid 判断倍率是否可用。
func (r Ratio) Valid() bool { return r.D > 0 && r.N > 0 }

// Float 仅供界面与日志展示，不参与记账。
func (r Ratio) Float() float64 {
	if r.D == 0 {
		return 1
	}
	return float64(r.N) / float64(r.D)
}

// Text 输出「1倍」「1.5倍」这类中文倍率文案。
func (r Ratio) Text() string {
	if !r.Valid() {
		return "1倍"
	}
	if r.N%r.D == 0 {
		return strconv.FormatInt(r.N/r.D, 10) + "倍"
	}
	whole := r.N / r.D
	frac := (r.N % r.D) * 10 / r.D
	if frac == 0 {
		return strconv.FormatInt(whole, 10) + "倍"
	}
	return strconv.FormatInt(whole, 10) + "." + strconv.FormatInt(frac, 10) + "倍"
}

// Scale 按倍率放大金额。倍率非法时原样返回，便于调用方把「倍率算错」
// 与「收益为零」区分开。
func (c Coin) Scale(r Ratio) Coin {
	if !r.Valid() {
		return c
	}
	return c.MulDiv(r.N, r.D)
}

// MulDiv 计算 c*n/d，先做乘法再做除法，用一次取整完成比例运算。
func (c Coin) MulDiv(n, d int64) Coin {
	if d == 0 {
		return c
	}
	return Coin(int64(c) * n / d)
}

// PerMinute 把「每小时收益」按已停分钟数折算，不足一分钟的部分不计。
func (c Coin) PerMinute(minutes int) Coin {
	if minutes <= 0 {
		return 0
	}
	return c.MulDiv(int64(minutes), 60)
}

// Split 按千分比把金额切成两份，余数归第一位。
// 保证 a+b 恰好等于原金额，不会出现四舍五入后总额相差一枚金币的情况。
func (c Coin) Split(permille int64) (Coin, Coin) {
	if permille < 0 {
		permille = 0
	}
	if permille > 1000 {
		permille = 1000
	}
	first := c.MulDiv(permille, 1000)
	return first, c - first
}

// Negative 返回相反数，用于扣款表达式。
func (c Coin) Negative() Coin { return -c }

// Positive 保证金额不为负，负值一律归零后再入账。
func (c Coin) Positive() Coin {
	if c < 0 {
		return 0
	}
	return c
}

// String 输出带千分位的金额文案，供接口与日得日志使用。
func (c Coin) String() string {
	neg := c < 0
	digits := strconv.FormatInt(int64(c), 10)
	if neg {
		digits = digits[1:]
	}
	var b strings.Builder
	for i, ch := range digits {
		if i > 0 && (len(digits)-i)%3 == 0 {
			b.WriteByte(',')
		}
		b.WriteRune(ch)
	}
	if neg {
		return "-" + b.String()
	}
	return b.String()
}

// Parse 解析玩家输入或配置文件里的金额文本，允许下划线与千分位逗号。
func Parse(text string) (Coin, error) {
	clean := strings.NewReplacer(",", "", "_", "", " ", "").Replace(text)
	if clean == "" {
		return 0, errors.New("金额为空")
	}
	v, err := strconv.ParseInt(clean, 10, 64)
	if err != nil {
		return 0, err
	}
	return Coin(v), nil
}
