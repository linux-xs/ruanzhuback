// 偷偷停个车服务端入口。
//
// 启动顺序刻意固定：读配置 → 连库 → 装服务 → 起后台任务 → 监听端口。
// 任何一步失败都直接退出，不做「带病启动」，避免线上出现半可用状态。
package main

import (
	"context"
	"errors"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"tstc/internal/api"
	"tstc/internal/boot"
	"tstc/internal/gameplay"
	"tstc/internal/patrol"
	"tstc/internal/repo"
	"tstc/internal/service"
)

// version 与申请表填写的版本号保持一致。
const version = "1.0"

func main() {
	confPath := flag.String("c", "conf/setting.conf", "配置文件路径")
	webDir := flag.String("web", "web", "前端静态目录")
	flag.Parse()

	settings, err := boot.Load(*confPath)
	if err != nil {
		log.Fatalf("读取配置失败: %v", err)
	}
	settings.Env(os.Getenv)
	if err := settings.Validate(); err != nil {
		log.Fatalf("配置校验失败: %v", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	store, err := repo.Open(ctx, settings.DB)
	if err != nil {
		log.Fatalf("连接数据库失败: %v", err)
	}
	defer func() {
		if err := store.Close(); err != nil {
			log.Printf("关闭数据库连接出错: %v", err)
		}
	}()

	policy := gameplay.Policy{
		RecallPermille:       settings.RecallPermille,
		TicketParkerPermille: settings.TicketPermille,
		FullHours:            settings.FullHours,
	}
	timeline := gameplay.Timeline{
		LockFor:   time.Duration(settings.LockMinutes) * time.Minute,
		EscapeFor: time.Duration(settings.EscapeMinutes) * time.Minute,
		HuntFor:   time.Duration(settings.HuntMinutes) * time.Minute,
	}
	svc, err := service.New(service.Options{Store: store, Policy: policy, Timeline: timeline})
	if err != nil {
		log.Fatalf("初始化服务失败: %v", err)
	}

	go sweepLoop(ctx, svc)
	if settings.PatrolOn {
		runner := patrol.New(store, svc, patrol.Config{
			Interval:    settings.PatrolInterval,
			Sample:      settings.PatrolSample,
			TicketAfter: settings.PatrolTicketAfter,
			ParkBatch:   2,
			Upgrade:     true,
		})
		go runner.Run(ctx)
		log.Printf("机器人巡检已启动，间隔 %s", settings.PatrolInterval)
	}

	handler := api.New(svc, store, api.Options{
		AllowQueryUID: settings.AllowQueryUID,
		StaticDir:     *webDir,
		Version:       version,
	}).Handler()

	server := &http.Server{
		Addr:         settings.Addr,
		Handler:      handler,
		ReadTimeout:  settings.ReadTimeout,
		WriteTimeout: settings.WriteTimeout,
	}

	errCh := make(chan error, 1)
	go func() {
		log.Printf("偷偷停个车 V%s 已启动，监听 %s", version, settings.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	select {
	case err := <-errCh:
		log.Fatalf("监听失败: %v", err)
	case <-ctx.Done():
		log.Println("收到退出信号，正在优雅关闭")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), settings.ShutdownGrace)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("关闭 HTTP 服务超时: %v", err)
	}
}

// sweepLoop 定期把停满的车结掉。
// 期满结算不依赖玩家在线，靠这个循环保证数据最终一致。
func sweepLoop(ctx context.Context, svc *service.Service) {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			n, err := svc.SweepMature(ctx, 200)
			if err != nil {
				log.Printf("期满结算扫描失败: %v", err)
				continue
			}
			if n > 0 {
				log.Printf("期满结算完成 %d 笔", n)
			}
		}
	}
}
