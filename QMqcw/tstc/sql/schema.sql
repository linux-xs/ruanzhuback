-- ============================================================
-- 偷偷停个车 V1.0  数据库结构 (MySQL 8.0)
-- 命名约定：acct_ 账号资产、lot_ 车位与租约、social_/feed_ 社交、day_ 每日记录
-- ============================================================

CREATE DATABASE IF NOT EXISTS `tstc`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `tstc`;

-- 账号表：一个自然人对应一行，机器人用 bot 标记区分
CREATE TABLE IF NOT EXISTS `acct_player` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uid`        VARCHAR(8)      NOT NULL COMMENT '对外展示的五位短号',
  `nick`       VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar`     VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '头像地址',
  `lv`         INT             NOT NULL DEFAULT 1 COMMENT '等级 1-100',
  `exp`        INT             NOT NULL DEFAULT 0 COMMENT '当前等级内经验',
  `coin`       BIGINT          NOT NULL DEFAULT 0 COMMENT '金币余额',
  `card`       INT             NOT NULL DEFAULT 0 COMMENT '幸运卡数量',
  `ad_used`    INT             NOT NULL DEFAULT 0 COMMENT '当日已领取次数',
  `ad_day`     VARCHAR(10)     NOT NULL DEFAULT '' COMMENT 'ad_used 对应的日期',
  `bot`        TINYINT         NOT NULL DEFAULT 0 COMMENT '1 表示系统机器人',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uid` (`uid`),
  KEY `idx_lv` (`lv`),
  KEY `idx_bot` (`bot`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账号表';

-- 车辆表：一辆车一行，state 只允许 0 空闲 / 1 停车中
CREATE TABLE IF NOT EXISTS `acct_vehicle` (
  `id`       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_id` BIGINT UNSIGNED NOT NULL COMMENT '车主',
  `lv`       INT             NOT NULL DEFAULT 1 COMMENT '车型等级 1-100',
  `state`    TINYINT         NOT NULL DEFAULT 0 COMMENT '0 空闲 1 停车中',
  `born_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_owner_state` (`owner_id`, `state`),
  KEY `idx_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆表';

-- 车位表：每个玩家按等级拥有若干格子，state 只允许 0 空闲 / 1 被占用
CREATE TABLE IF NOT EXISTS `lot_cell` (
  `id`       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_id` BIGINT UNSIGNED NOT NULL COMMENT '车位主人',
  `seq`      INT             NOT NULL DEFAULT 1 COMMENT '格子序号 1-10',
  `state`    TINYINT         NOT NULL DEFAULT 0 COMMENT '0 空闲 1 被占用',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_owner_seq` (`owner_id`, `seq`),
  KEY `idx_state_owner` (`state`, `owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车位表';

-- 租约表：一辆车一次外出对应一行，status=0 表示仍在计费
CREATE TABLE IF NOT EXISTS `lot_lease` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `vehicle_id` BIGINT UNSIGNED NOT NULL,
  `cell_id`    BIGINT UNSIGNED NOT NULL,
  `parker_id`  BIGINT UNSIGNED NOT NULL COMMENT '停车方',
  `host_id`    BIGINT UNSIGNED NOT NULL COMMENT '车位主人',
  `began_at`   DATETIME        NOT NULL COMMENT '停入时刻',
  `ended_at`   DATETIME        NULL COMMENT '结算时刻',
  `end_kind`   TINYINT         NOT NULL DEFAULT 0 COMMENT '1 召回 2 贴条 3 期满 4 幸运卡',
  `status`     TINYINT         NOT NULL DEFAULT 0 COMMENT '0 进行中 1 已结算',
  `gross`      BIGINT          NOT NULL DEFAULT 0 COMMENT '毛收益',
  `parker_pay` BIGINT          NOT NULL DEFAULT 0 COMMENT '停车方所得',
  `host_pay`   BIGINT          NOT NULL DEFAULT 0 COMMENT '车位主人所得',
  PRIMARY KEY (`id`),
  KEY `idx_vehicle_status` (`vehicle_id`, `status`),
  KEY `idx_host_status` (`host_id`, `status`),
  KEY `idx_status_began` (`status`, `began_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='停车租约表';

-- 关系表：单向关注，kind 取 friend / foe，同一个人只保留一种关系
CREATE TABLE IF NOT EXISTS `social_bond` (
  `id`        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `holder_id` BIGINT UNSIGNED NOT NULL COMMENT '关系持有者',
  `target_id` BIGINT UNSIGNED NOT NULL COMMENT '被关注者',
  `kind`      VARCHAR(8)      NOT NULL DEFAULT 'friend',
  `heat`      INT             NOT NULL DEFAULT 0 COMMENT '被贴条次数累计',
  `last_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_holder_target` (`holder_id`, `target_id`),
  KEY `idx_holder_kind` (`holder_id`, `kind`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通讯录关系表';

-- 动态表：只保留最近 24 小时，过期由清理任务删除
CREATE TABLE IF NOT EXISTS `feed_note` (
  `id`       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `host_id`  BIGINT UNSIGNED NOT NULL COMMENT '动态归属者（车位主人）',
  `actor_id` BIGINT UNSIGNED NOT NULL COMMENT '触发动作的人',
  `kind`     TINYINT         NOT NULL DEFAULT 1 COMMENT '1 停车 2 离开 3 被贴条',
  `v_level`  INT             NOT NULL DEFAULT 1,
  `v_name`   VARCHAR(64)     NOT NULL DEFAULT '',
  `coin`     BIGINT          NOT NULL DEFAULT 0,
  `at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_host_at` (`host_id`, `at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客动态表';

-- 签到表：唯一键负责「一天一次」的硬约束
CREATE TABLE IF NOT EXISTS `day_sign` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `player_id`  BIGINT UNSIGNED NOT NULL,
  `day`        VARCHAR(10)     NOT NULL COMMENT 'yyyy-MM-dd',
  `way`        VARCHAR(8)      NOT NULL DEFAULT 'plain' COMMENT 'plain 普通 / card 幸运卡',
  `coin`       BIGINT          NOT NULL DEFAULT 0,
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_player_day` (`player_id`, `day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日签到表';
