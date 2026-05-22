package main

import (
	"fmt"
	"log"

	"byglg/internal/config"
	"byglg/internal/database"
	"byglg/internal/router"
)

func main() {
	// 初始化配置
	if err := config.InitConfig(); err != nil {
		log.Fatalf("Failed to initialize config: %v", err)
	}

	log.Println("Config loaded successfully")

	// 初始化数据库
	if err := database.InitMySQL(&config.GlobalConfig.Database.MySQL); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	log.Println("Database connected successfully")

	// 自动迁移数据库表
	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("Failed to auto migrate database: %v", err)
	}

	log.Println("Database migrated successfully")

	// 设置路由
	r := router.SetupRouter()

	// 启动服务器
	addr := fmt.Sprintf(":%d", config.GlobalConfig.Server.Port)
	log.Printf("Server starting on %s", addr)

	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
