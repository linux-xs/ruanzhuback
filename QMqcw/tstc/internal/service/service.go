// Package service 承载业务编排：校验权限、开事务、调用领域规则、落账。
// 领域规则留在 gameplay，SQL 留在 repo，这里只负责把它们串成一次完整的操作。
package service

import (
	"errors"
	"strings"
	"time"

	"tstc/internal/gameplay"
	"tstc/internal/money"
	"tstc/internal/repo"
)

// 服务层对外暴露的错误，接口层按这些错误给出中文提示与状态码。
var (
	// ErrBadInput 表示请求参数不合法。
	ErrBadInput = errors.New("请求参数不合法")
	// ErrNoPlayer 表示账号不存在。
	ErrNoPlayer = errors.New("账号不存在")
	// ErrNoCoin 表示余额不足。
	ErrNoCoin = errors.New("金币不足")
	// ErrNoCard 表示幸运卡不足。
	ErrNoCard = errors.New("幸运卡不足")
	// ErrNoFreeLot 表示全服暂时没有空车位。
	ErrNoFreeLot = errors.New("当前没有可用的空车位")
	// ErrSlotFull 表示额度已满。
	ErrSlotFull = errors.New("额度已满")
	// ErrOccupied 表示车位已被抢占。
	ErrOccupied = errors.New("手慢了，车位已被别人占走")
	// ErrNotYours 表示操作了不属于自己的资产。
	ErrNotYours = errors.New("这不是你的资产")
	// ErrSelf 表示把自己当成了操作对象。
	ErrSelf = errors.New("不能对自己做这个操作")
	// ErrLevelLocked 表示等级不足，车型还没解锁。
	ErrLevelLocked = errors.New("该车型尚未解锁")
	// ErrSigned 表示今天已经签到过。
	ErrSigned = errors.New("今天已经签到过了")
	// ErrAdExhausted 表示今日领取次数用完。
	ErrAdExhausted = errors.New("今天的幸运卡已经领完了")
)

// Options 是构造服务所需的全部装配参数。
type Options struct {
	Store    *repo.Store
	Policy   gameplay.Policy
	Timeline gameplay.Timeline
	// Clock 允许测试注入固定时间，生产环境用 time.Now。
	Clock func() time.Time
}

// Service 是业务入口，全部方法都要求传入已登录玩家的 ID。
type Service struct {
	store    *repo.Store
	policy   gameplay.Policy
	timeline gameplay.Timeline
	clock    func() time.Time
}

// New 构造服务，缺失的连接或非法策略会直接返回错误。
func New(opt Options) (*Service, error) {
	if opt.Store == nil {
		return nil, errors.New("缺少数据源")
	}
	if err := opt.Policy.Validate(); err != nil {
		return nil, err
	}
	if err := opt.Timeline.Validate(); err != nil {
		return nil, err
	}
	clock := opt.Clock
	if clock == nil {
		clock = time.Now
	}
	return &Service{
		store:    opt.Store,
		policy:   opt.Policy,
		timeline: opt.Timeline,
		clock:    clock,
	}, nil
}

// Now 返回服务当前使用的时间。
func (s *Service) Now() time.Time { return s.clock() }

// Today 返回按本地时区格式化的日期，签到与广告额度都以它为界。
func (s *Service) Today() string { return s.clock().Format("2006-01-02") }

// normalizeNick 去掉首尾空白并把连续空白压成一个空格。
func normalizeNick(raw string) string {
	fields := strings.Fields(raw)
	return strings.Join(fields, " ")
}

// validNick 校验昵称长度，过短或过长都退回默认昵称。
func validNick(nick string) bool {
	n := len([]rune(nick))
	return n >= 2 && n <= 12
}

// StageView 是阶段信息在接口里的表达。
type StageView struct {
	Code      string `json:"code"`
	Label     string `json:"label"`
	Hint      string `json:"hint"`
	Minutes   int    `json:"minutes"`
	Remaining int    `json:"remaining"`
}

// stageView 把阶段、已停分钟数、距下一阶段的剩余分钟数打包。
func (s *Service) stageView(start time.Time) StageView {
	now := s.clock()
	stage := s.timeline.StageOf(start, now)
	return StageView{
		Code:      stage.Code(),
		Label:     stage.Label(),
		Hint:      stage.Hint(),
		Minutes:   int(s.timeline.Elapsed(start, now).Minutes()),
		Remaining: int(s.timeline.Remaining(start, now).Minutes()),
	}
}

// accrue 计算一段租约到目前为止的累计毛收益（未做分成）。
func (s *Service) accrue(start time.Time, hourly money.Coin, quote gameplay.Quote) money.Coin {
	minutes := int(s.timeline.Elapsed(start, s.clock()).Minutes())
	return hourly.Scale(quote.Ratio).PerMinute(minutes)
}

// clampLimit 把分页参数收进合理区间。
func clampLimit(n, def, max int) int {
	if n <= 0 {
		return def
	}
	if n > max {
		return max
	}
	return n
}

// trimUpper 统一玩家短号的写法：去空白并转大写。
// 短号在库里以大写保存，用户输入小写也能找到人。
func trimUpper(raw string) string {
	return strings.ToUpper(strings.TrimSpace(raw))
}
