package main

import (
	"fmt"
	"log"

	"qmqcw/conf"
	"qmqcw/dao"
	"qmqcw/router"
)

func main() {
	// 加载配置
	if err := conf.Init(); err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 初始化数据库
	if err := dao.InitMySQL(); err != nil {
		log.Printf("数据库连接失败(前端使用假数据不影响): %v", err)
	} else {
		defer dao.DB.Close()
		log.Println("数据库连接成功")
	}

	// 初始化路由
	r := router.InitRouter()

	// 启动服务
	addr := fmt.Sprintf(":%d", conf.Cfg.Server.Port)
	log.Printf("全民抢车位服务启动: http://127.0.0.1%s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("启动失败: %v", err)
	}
}
