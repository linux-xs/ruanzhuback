// Package patrol 是服务端的生态维持脚本：由内置机器人发车、贴条、换车，
// 保证任何真人玩家打开应用时都能找到车位停，也不会对着空池子干等。
package patrol

import (
	"context"
	"math/rand"
	"time"

	"tstc/internal/gameplay"
	"tstc/internal/repo"
	"tstc/internal/service"
)

// Config 是巡检脚本的可调参数。
type Config struct {
	// Interval 是两次巡检的间隔。
	Interval time.Duration
	// Sample 是每轮随机抽样的机器人数量。
	Sample int
	// TicketAfter 是机器人贴条的时间阈值，必须落在争夺期内。
	TicketAfter time.Duration
	// ParkBatch 是每个机器人每轮最多发出的车数。
	ParkBatch int
	// Upgrade 表示是否让机器人按余额自动换车。
	Upgrade bool
}

// DefaultConfig 返回出厂参数：每 10 分钟巡检 60 个机器人，停满 3 小时就贴条。
func DefaultConfig() Config {
	return Config{
		Interval:    10 * time.Minute,
		Sample:      60,
		TicketAfter: 3 * time.Hour,
		ParkBatch:   2,
		Upgrade:     true,
	}
}

// Runner 持有巡检所需的依赖。
type Runner struct {
	store  *repo.Store
	svc    *service.Service
	cfg    Config
	random *rand.Rand
	policy gameplay.Policy
}

// New 构造巡检器，随机源独立于全局，便于复现同一轮抽样的结果。
func New(store *repo.Store, svc *service.Service, cfg Config) *Runner {
	if cfg.Interval <= 0 {
		cfg.Interval = 10 * time.Minute
	}
	if cfg.Sample <= 0 {
		cfg.Sample = 60
	}
	if cfg.ParkBatch <= 0 {
		cfg.ParkBatch = 2
	}
	return &Runner{
		store:  store,
		svc:    svc,
		cfg:    cfg,
		random: rand.New(rand.NewSource(time.Now().UnixNano())),
		policy: gameplay.DefaultPolicy(),
	}
}

// Run 按间隔循环巡检，直到 ctx 被取消。
func (r *Runner) Run(ctx context.Context) {
	ticker := time.NewTicker(r.cfg.Interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			r.Tick(ctx)
		}
	}
}

// Tick 执行一轮巡检，返回本轮完成的动作数量，便于日志与自测。
func (r *Runner) Tick(ctx context.Context) int {
	bots, err := r.store.Bots(ctx, 100)
	if err != nil || len(bots) == 0 {
		return 0
	}
	picked := r.sample(bots)
	actions := 0
	for _, bot := range picked {
		actions += r.ticket(ctx, bot)
		actions += r.park(ctx, bot)
		if r.cfg.Upgrade {
			r.upgrade(ctx, bot)
		}
	}
	return actions
}

// sample 随机抽样，数量超过库存时返回全量。
func (r *Runner) sample(all []repo.Player) []repo.Player {
	n := r.cfg.Sample
	if n > len(all) {
		n = len(all)
	}
	indexes := r.random.Perm(len(all))[:n]
	out := make([]repo.Player, 0, n)
	for _, i := range indexes {
		out = append(out, all[i])
	}
	return out
}

// ticket 让机器人给停在自己车位上的车贴条。
// 只处理已经进入争夺期且超过阈值的租约，避免刚停进来的车被秒踢。
func (r *Runner) ticket(ctx context.Context, bot repo.Player) int {
	cutoff := time.Now().Add(-r.cfg.TicketAfter)
	rows, err := r.store.TicketReadyCandidates(ctx, bot.ID, cutoff, 3)
	if err != nil {
		return 0
	}
	done := 0
	for _, m := range rows {
		if m.ParkerLv > bot.Level+20 {
			// 等级差太大的单子留给真人来贴，机器人不抢残局。
			continue
		}
		if _, err := r.svc.Ticket(ctx, bot.ID, m.VehicleID); err == nil {
			done++
		}
	}
	return done
}

// park 让机器人把空闲车停进全服空位，走与真人完全相同的一键停车入口。
func (r *Runner) park(ctx context.Context, bot repo.Player) int {
	idle, err := r.store.IdleVehiclesOf(ctx, bot.ID, r.cfg.ParkBatch)
	if err != nil || len(idle) == 0 {
		return 0
	}
	done := 0
	for _, v := range idle {
		if _, err := r.svc.Park(ctx, bot.ID, v.ID, ""); err != nil {
			break
		}
		done++
	}
	return done
}

// upgrade 在余额够买下一级车时直接换车：卖掉最旧的一辆，买一辆新的。
func (r *Runner) upgrade(ctx context.Context, bot repo.Player) {
	next := gameplay.UnlockMaxLevel(bot.Level)
	spec, ok := gameplay.VehicleAt(next)
	if !ok || bot.Coin < spec.Price {
		return
	}
	vehicles, err := r.store.VehiclesOf(ctx, bot.ID)
	if err != nil || len(vehicles) == 0 {
		return
	}
	// 找一辆最旧且空闲的车卖掉，腾出额度再买新车。
	for _, v := range vehicles {
		if v.State != gameplay.VehicleIdle {
			continue
		}
		if _, err := r.svc.Sell(ctx, bot.ID, v.ID); err == nil {
			_, _ = r.svc.Buy(ctx, bot.ID, next)
			return
		}
	}
}
