package gameplay

import (
	"errors"
	"time"
)

// Stage 描述一辆车停进车位后所处的时间阶段。
// 阶段是判定操作权限的唯一依据，不依赖调用方自己算分钟数。
type Stage uint8

const (
	// StageLock 绝对锁定期：车主不能召回，车位主人不能贴条。
	StageLock Stage = iota + 1
	// StageEscape 逃生期：车主可召回，车位主人仍不能贴条。
	StageEscape
	// StageHunt 争夺期：车主可召回，车位主人可贴条。
	StageHunt
	// StageMature 期满：收益走满额结算，不再受操作影响。
	StageMature
)

// Code 返回用于接口与素材的英文短码。
func (s Stage) Code() string {
	switch s {
	case StageLock:
		return "lock"
	case StageEscape:
		return "escape"
	case StageHunt:
		return "hunt"
	case StageMature:
		return "mature"
	}
	return "unknown"
}

// Label 返回阶段名称，界面直接展示。
func (s Stage) Label() string {
	switch s {
	case StageLock:
		return "绝对锁定期"
	case StageEscape:
		return "逃生观察期"
	case StageHunt:
		return "争夺期"
	case StageMature:
		return "期满"
	}
	return "未知阶段"
}

// Hint 返回面向玩家的阶段说明，用在卡片浮层里。
func (s Stage) Hint() string {
	switch s {
	case StageLock:
		return "刚停进来，双方都不能动它"
	case StageEscape:
		return "车主可以召回了，车位主人还贴不了条"
	case StageHunt:
		return "车位主人可以贴条了，谁先上手谁占便宜"
	case StageMature:
		return "已经停满，收益按满额算"
	}
	return ""
}

// Act 表示一次针对车辆或车位的操作。
type Act uint8

const (
	// ActPark 把空闲车辆派出去。
	ActPark Act = 1 << iota
	// ActRecall 车主主动召回。
	ActRecall
	// ActTicket 车位主人贴条。
	ActTicket
	// ActCard 车主用幸运卡即时结算。
	ActCard
	// ActSell 车主把车卖掉。
	ActSell
)

// Code 返回操作的英文短码。
func (a Act) Code() string {
	switch a {
	case ActPark:
		return "park"
	case ActRecall:
		return "recall"
	case ActTicket:
		return "ticket"
	case ActCard:
		return "card"
	case ActSell:
		return "sell"
	}
	return "unknown"
}

// ActSet 是操作集合的位图，用来表达「某阶段允许哪些操作」。
type ActSet uint16

// Has 判断集合里是否含有某个操作。
func (s ActSet) Has(a Act) bool { return uint16(s)&uint16(a) != 0 }

// List 以短码数组形式导出集合，便于前端按需渲染按钮。
func (s ActSet) List() []string {
	out := make([]string, 0, 5)
	for _, a := range []Act{ActPark, ActRecall, ActTicket, ActCard, ActSell} {
		if s.Has(a) {
			out = append(out, a.Code())
		}
	}
	return out
}

// stageActs 是「阶段 → 允许操作」的权限表。
// 把规则集中在这一张表里，规则调整只改这里，服务层不需要跟着改判断。
var stageActs = map[Stage]ActSet{
	StageLock:   ActSet(ActCard),
	StageEscape: ActSet(ActRecall | ActCard),
	StageHunt:   ActSet(ActRecall | ActCard | ActTicket),
	StageMature: ActSet(ActRecall | ActTicket),
}

// Allowed 查询某阶段是否允许某操作。
func Allowed(s Stage, a Act) bool {
	set, ok := stageActs[s]
	if !ok {
		return false
	}
	return set.Has(a)
}

// Acts 返回某阶段允许的全部操作。
func Acts(s Stage) ActSet {
	if set, ok := stageActs[s]; ok {
		return set
	}
	return 0
}

// Timeline 描述一段租约的时间轴分段。
// 默认是 1 小时锁定 + 1 小时观察 + 6 小时争夺，期满共 8 小时。
type Timeline struct {
	LockFor   time.Duration
	EscapeFor time.Duration
	HuntFor   time.Duration
}

// DefaultTimeline 返回标准时间轴。
func DefaultTimeline() Timeline {
	return Timeline{
		LockFor:   time.Hour,
		EscapeFor: time.Hour,
		HuntFor:   6 * time.Hour,
	}
}

// Total 返回从停入到自然期满的总时长。
func (t Timeline) Total() time.Duration {
	return t.LockFor + t.EscapeFor + t.HuntFor
}

// Validate 检查时间轴是否单调递增，配置写错时启动即报错。
func (t Timeline) Validate() error {
	if t.LockFor <= 0 || t.EscapeFor <= 0 || t.HuntFor <= 0 {
		return errors.New("时间轴各段必须大于零")
	}
	if t.Total() > 48*time.Hour {
		return errors.New("时间轴总长超过 48 小时，请检查配置")
	}
	return nil
}

// Elapsed 返回已经停放的实际时长，起始时间在未来时按零处理。
func (t Timeline) Elapsed(start, now time.Time) time.Duration {
	if start.After(now) {
		return 0
	}
	return now.Sub(start)
}

// StageOf 按起点与当前时刻判定阶段。
func (t Timeline) StageOf(start, now time.Time) Stage {
	spent := t.Elapsed(start, now)
	switch {
	case spent < t.LockFor:
		return StageLock
	case spent < t.LockFor+t.EscapeFor:
		return StageEscape
	case spent < t.Total():
		return StageHunt
	default:
		return StageMature
	}
}

// Remaining 返回距离下一阶段还差多久，期满后返回零。
func (t Timeline) Remaining(start, now time.Time) time.Duration {
	spent := t.Elapsed(start, now)
	if spent >= t.Total() {
		return 0
	}
	next := t.LockFor
	if spent >= t.LockFor {
		next = t.LockFor + t.EscapeFor
	}
	if spent >= t.LockFor+t.EscapeFor {
		next = t.Total()
	}
	return next - spent
}

// VehicleState 是车辆在租约中的两种状态。
type VehicleState uint8

const (
	// VehicleIdle 车辆停在自家车库。
	VehicleIdle VehicleState = 0
	// VehicleLeased 车辆已被派往他人车位。
	VehicleLeased VehicleState = 1
)

// CellState 是车位的两种状态。
type CellState uint8

const (
	// CellFree 车位空着。
	CellFree CellState = 0
	// CellTaken 车位已被占用。
	CellTaken CellState = 1
)
