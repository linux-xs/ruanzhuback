-- 全民抢车位 数据库初始化脚本 (MySQL 8.0)

CREATE DATABASE IF NOT EXISTS qmqcw DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qmqcw;

-- 玩家表
CREATE TABLE IF NOT EXISTS `player` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_uid` varchar(16) NOT NULL DEFAULT '' COMMENT '玩家唯一短ID',
  `nickname` varchar(64) NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar` varchar(256) NOT NULL DEFAULT '' COMMENT '头像',
  `level` int NOT NULL DEFAULT 1 COMMENT '等级 1-100',
  `exp` bigint NOT NULL DEFAULT 0 COMMENT '经验值',
  `gold` bigint NOT NULL DEFAULT 0 COMMENT '金币',
  `lucky_card` int NOT NULL DEFAULT 0 COMMENT '幸运卡数量',
  `daily_ad_count` int NOT NULL DEFAULT 0 COMMENT '当日已看广告次数',
  `is_bot` tinyint NOT NULL DEFAULT 0 COMMENT '是否机器人 0否1是',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uid` (`player_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='玩家表';

-- 车辆表
CREATE TABLE IF NOT EXISTS `car` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL DEFAULT 0 COMMENT '所属玩家ID',
  `car_level` int NOT NULL DEFAULT 1 COMMENT '车辆等级 1-100',
  `car_name` varchar(64) NOT NULL DEFAULT '' COMMENT '车辆名称',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '0空闲 1停车中',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_player` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆表';

-- 车位表
CREATE TABLE IF NOT EXISTS `space` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL DEFAULT 0 COMMENT '所属玩家ID',
  `slot_index` int NOT NULL DEFAULT 1 COMMENT '车位序号 1-10',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '0空闲 1被占用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_player` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车位表';

-- 停车记录表
CREATE TABLE IF NOT EXISTS `park_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `car_id` int NOT NULL DEFAULT 0 COMMENT '车辆ID',
  `space_id` int NOT NULL DEFAULT 0 COMMENT '车位ID',
  `car_owner_id` int NOT NULL DEFAULT 0 COMMENT '车主ID',
  `space_owner_id` int NOT NULL DEFAULT 0 COMMENT '车位主人ID',
  `start_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '停车开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '停车结束时间',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '0停车中 1已结算',
  `settle_type` tinyint NOT NULL DEFAULT 0 COMMENT '结算方式 0无 1召回 2贴条 3自然满 4幸运卡',
  `total_gold` bigint NOT NULL DEFAULT 0 COMMENT '结算总金币',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_car_owner` (`car_owner_id`),
  KEY `idx_space_owner` (`space_owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='停车记录表';

-- 社交关系表
CREATE TABLE IF NOT EXISTS `social_relation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL DEFAULT 0 COMMENT '玩家ID',
  `target_id` int NOT NULL DEFAULT 0 COMMENT '目标玩家ID',
  `rel_type` tinyint NOT NULL DEFAULT 1 COMMENT '1好友 2仇人',
  `hate_count` int NOT NULL DEFAULT 0 COMMENT '互贴次数',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_player_target` (`player_id`,`target_id`),
  KEY `idx_player` (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社交关系表';

-- 访客动态表
CREATE TABLE IF NOT EXISTS `visitor_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL DEFAULT 0 COMMENT '被访问者ID',
  `visitor_id` int NOT NULL DEFAULT 0 COMMENT '访客ID',
  `event_type` tinyint NOT NULL DEFAULT 1 COMMENT '1停车 2自然离开 3被贴条',
  `car_level` int NOT NULL DEFAULT 1 COMMENT '车辆等级',
  `car_name` varchar(64) NOT NULL DEFAULT '' COMMENT '车辆名称',
  `gold_income` bigint NOT NULL DEFAULT 0 COMMENT '收益金币',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_player_time` (`player_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客动态表';

-- 签到记录表
CREATE TABLE IF NOT EXISTS `sign_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL DEFAULT 0 COMMENT '玩家ID',
  `sign_date` varchar(10) NOT NULL DEFAULT '' COMMENT '签到日期 yyyy-MM-dd',
  `sign_type` tinyint NOT NULL DEFAULT 1 COMMENT '1普通 2幸运卡',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_player_date` (`player_id`,`sign_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到记录表';

-- 车辆图鉴配置表
CREATE TABLE IF NOT EXISTS `car_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `car_level` int NOT NULL DEFAULT 1 COMMENT '车辆等级',
  `car_name` varchar(64) NOT NULL DEFAULT '' COMMENT '车辆名称',
  `buy_price` bigint NOT NULL DEFAULT 0 COMMENT '购买价格',
  `sell_price` bigint NOT NULL DEFAULT 0 COMMENT '卖出价格(85%)',
  `output_per_hour` int NOT NULL DEFAULT 0 COMMENT '基础产出/小时',
  `output_full` int NOT NULL DEFAULT 0 COMMENT '8小时满额产出',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_level` (`car_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆图鉴配置表';
