package repo

import (
	"time"

	"tstc/internal/gameplay"
	"tstc/internal/money"
)

// Player 对应 acct_player 一行。
type Player struct {
	ID        int64
	UID       string
	Nick      string
	Avatar    string
	Level     int
	Exp       int
	Coin      money.Coin
	Card      int
	AdUsed    int
	AdDay     string
	Bot       bool
	CreatedAt time.Time
}

// Capacity 返回该玩家当前等级的车库与车位额度。
func (p Player) Capacity() gameplay.Capacity { return gameplay.CapacityFor(p.Level) }

// Vehicle 对应 acct_vehicle 一行。
type Vehicle struct {
	ID      int64
	OwnerID int64
	Level   int
	State   gameplay.VehicleState
	BornAt  time.Time
}

// Cell 对应 lot_cell 一行，是玩家名下的一个车位格子。
type Cell struct {
	ID      int64
	OwnerID int64
	Seq     int
	State   gameplay.CellState
}

// Lease 对应 lot_lease 一行，是一段停车租约。
type Lease struct {
	ID        int64
	VehicleID int64
	CellID    int64
	ParkerID  int64
	HostID    int64
	BeganAt   time.Time
	EndedAt   *time.Time
	EndKind   gameplay.Kind
	Gross     money.Coin
	ParkerPay money.Coin
	HostPay   money.Coin
}

// Bond 对应 social_bond 一行，单向关系。
type Bond struct {
	ID       int64
	HolderID int64
	TargetID int64
	Kind     string
	Heat     int
	LastAt   time.Time
}

// 关系种类常量，写库时用字符串而不是数字，便于人工排查。
const (
	BondFriend = "friend"
	BondFoe    = "foe"
)

// Feed 对应 feed_note 一行，是访客动态里的一条记录。
type Feed struct {
	ID      int64
	HostID  int64
	ActorID int64
	Kind    int
	VLevel  int
	VName   string
	Coin    money.Coin
	At      time.Time
}

// 动态类型常量。
const (
	FeedParked  = 1
	FeedLeft    = 2
	FeedTicketed = 3
)

// VehicleCard 是车库列表里的一辆车的聚合视图：
// 车辆本身的状态 + 它当前挂在哪段租约上（没停就是空租约）。
type VehicleCard struct {
	Vehicle
	HostID    int64
	HostNick  string
	HostLevel int
	BeganAt   *time.Time
}

// Occupancy 是「停在我家车位上的车」的聚合视图。
type Occupancy struct {
	LeaseID    int64
	CellID     int64
	CellSeq    int
	VehicleID  int64
	VehicleLv  int
	ParkerID   int64
	ParkerNick string
	ParkerLv   int
	BeganAt    time.Time
}

// BondCard 是通讯录条目：关系 + 对方名片 + 对方车位空闲数。
type BondCard struct {
	Bond
	TargetNick  string
	TargetLevel int
	TargetUID   string
	FreeCells   int
	TotalCells  int
}

// FeedCard 是动态条目：记录本身 + 触发者名片。
type FeedCard struct {
	Feed
	ActorNick  string
	ActorLevel int
}
