-- ============================================================
-- 偷偷停个车 V1.0  初始数据
-- 内容：100 个生态机器人 + 1 个演示账号 + 各自的车辆与车位
-- 短号由昵称与等级做散列生成，避免手工维护时写重
-- ============================================================

USE `tstc`;

-- 机器人账号：等级从 3 到 98 铺开，让不同阶段的玩家都能匹配到合适倍率
INSERT INTO `acct_player`
  (`uid`, `nick`, `avatar`, `lv`, `exp`, `coin`, `card`, `ad_used`, `ad_day`, `bot`)
SELECT UPPER(SUBSTRING(MD5(CONCAT(n.nick, n.lv)), 1, 5)), n.nick, '', n.lv, 0, n.coin, 0, 0, '', 1
FROM (
  SELECT '五环车神' AS nick, 12 AS lv, 6000 AS coin UNION ALL
  SELECT '老张的奥拓', 8, 4200 UNION ALL
  SELECT '城南老王', 31, 38000 UNION ALL
  SELECT '车位钉子户', 44, 96000 UNION ALL
  SELECT '三环夜行者', 19, 9800 UNION ALL
  SELECT '大背头司机', 27, 21000 UNION ALL
  SELECT '修车铺小李', 5, 2600 UNION ALL
  SELECT '十字路口', 63, 410000 UNION ALL
  SELECT '加塞之王', 15, 7300 UNION ALL
  SELECT '只停不挪', 22, 15000 UNION ALL
  SELECT '早高峰', 36, 52000 UNION ALL
  SELECT '晚高峰', 38, 61000 UNION ALL
  SELECT '尾号限行', 9, 4800 UNION ALL
  SELECT '地下二层', 47, 120000 UNION ALL
  SELECT '划线工', 3, 1900 UNION ALL
  SELECT '停车费不给', 11, 5600 UNION ALL
  SELECT '老年代步', 6, 3100 UNION ALL
  SELECT '二手车贩', 52, 180000 UNION ALL
  SELECT '一档起步', 7, 3600 UNION ALL
  SELECT '手动挡情怀', 14, 6800 UNION ALL
  SELECT '压缩机坏了', 4, 2200 UNION ALL
  SELECT '备胎专业户', 17, 8600 UNION ALL
  SELECT '雨刷器', 10, 5100 UNION ALL
  SELECT '喇叭狂魔', 24, 17500 UNION ALL
  SELECT '后视镜战神', 29, 26000 UNION ALL
  SELECT '洗车卡过期', 13, 6200 UNION ALL
  SELECT '满油出发', 33, 42000 UNION ALL
  SELECT '空挡滑行', 21, 13500 UNION ALL
  SELECT '熄火小王子', 16, 7900 UNION ALL
  SELECT '倒车入库难', 18, 9100 UNION ALL
  SELECT '侧方停车王', 71, 780000 UNION ALL
  SELECT '三把方向', 26, 19500 UNION ALL
  SELECT '压线选手', 23, 16000 UNION ALL
  SELECT '白线内', 20, 12000 UNION ALL
  SELECT '车位感应器', 40, 70000 UNION ALL
  SELECT '地锁专家', 34, 46000 UNION ALL
  SELECT '充电桩争夺', 49, 140000 UNION ALL
  SELECT '慢充一族', 28, 23000 UNION ALL
  SELECT '电量焦虑', 30, 32000 UNION ALL
  SELECT '油表见底', 25, 18500 UNION ALL
  SELECT '高速免费日', 55, 230000 UNION ALL
  SELECT '服务区常客', 42, 82000 UNION ALL
  SELECT '堵在桥上', 35, 49000 UNION ALL
  SELECT '变道打灯吗', 32, 40000 UNION ALL
  SELECT '闪远光', 37, 57000 UNION ALL
  SELECT '应急车道', 46, 110000 UNION ALL
  SELECT '拖车师傅', 58, 290000 UNION ALL
  SELECT '交警小号', 66, 480000 UNION ALL
  SELECT '罚单收集者', 41, 76000 UNION ALL
  SELECT '扣三分', 39, 65000 UNION ALL
  SELECT '年检过期', 43, 88000 UNION ALL
  SELECT '保险丝', 2, 1500 UNION ALL
  SELECT '火花塞', 45, 100000 UNION ALL
  SELECT '变速箱', 60, 330000 UNION ALL
  SELECT '离合抬起', 48, 130000 UNION ALL
  SELECT '副驾零食', 50, 150000 UNION ALL
  SELECT '车载香薰', 53, 200000 UNION ALL
  SELECT '后备箱满', 56, 250000 UNION ALL
  SELECT '车顶行李架', 61, 360000 UNION ALL
  SELECT '全景天窗', 64, 430000 UNION ALL
  SELECT '真皮座椅', 67, 500000 UNION ALL
  SELECT '方向盘套', 69, 620000 UNION ALL
  SELECT '行车记录仪', 72, 820000 UNION ALL
  SELECT '倒车影像', 74, 940000 UNION ALL
  SELECT '定速巡航', 76, 1100000 UNION ALL
  SELECT '涡轮迟滞', 78, 1300000 UNION ALL
  SELECT '排气声浪', 80, 1500000 UNION ALL
  SELECT '改装排气管', 82, 1800000 UNION ALL
  SELECT '尾翼党', 84, 2100000 UNION ALL
  SELECT '贴膜小哥', 57, 270000 UNION ALL
  SELECT '镀晶服务', 59, 310000 UNION ALL
  SELECT '打蜡半年', 62, 390000 UNION ALL
  SELECT '划痕一条', 65, 455000 UNION ALL
  SELECT '补漆笔', 68, 545000 UNION ALL
  SELECT '钣金工', 70, 690000 UNION ALL
  SELECT '烤漆房', 73, 880000 UNION ALL
  SELECT '轮胎店', 75, 1020000 UNION ALL
  SELECT '四轮定位', 77, 1200000 UNION ALL
  SELECT '动平衡', 79, 1400000 UNION ALL
  SELECT '换机油', 81, 1650000 UNION ALL
  SELECT '三滤全换', 83, 1950000 UNION ALL
  SELECT '正时皮带', 85, 2300000 UNION ALL
  SELECT '蓄电池亏电', 54, 215000 UNION ALL
  SELECT '搭电求助', 51, 165000 UNION ALL
  SELECT '拖走算了', 86, 2600000 UNION ALL
  SELECT '钥匙忘车里', 87, 2900000 UNION ALL
  SELECT '车窗没关', 88, 3200000 UNION ALL
  SELECT '车门锁不上', 89, 3600000 UNION ALL
  SELECT '遥控失灵', 90, 4000000 UNION ALL
  SELECT '备用钥匙', 91, 4500000 UNION ALL
  SELECT '车库里睡', 92, 5100000 UNION ALL
  SELECT '后座堆货', 93, 5800000 UNION ALL
  SELECT '拉货顺路', 94, 6500000 UNION ALL
  SELECT '顺风车司机', 95, 7300000 UNION ALL
  SELECT '拼车群主', 96, 8200000 UNION ALL
  SELECT '代驾老李', 97, 9200000 UNION ALL
  SELECT '夜间代驾', 98, 10500000 UNION ALL
  SELECT '挪车电话', 1, 1200 UNION ALL
  SELECT '找车位中', 1, 1000
) n;

-- 机器人车位：按等级给 1 到 10 个格子，与代码里的容量公式保持一致
INSERT INTO `lot_cell` (`owner_id`, `seq`, `state`)
SELECT p.id, s.seq, 0
FROM `acct_player` p
JOIN (
  SELECT 1 AS seq UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
  UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
) s ON s.seq <= LEAST(10, 1 + p.lv DIV 11)
WHERE p.bot = 1;

-- 机器人车辆：每台机器人配一辆与等级同档的车，保证随时有人来停车
INSERT INTO `acct_vehicle` (`owner_id`, `lv`, `state`, `born_at`)
SELECT p.id, GREATEST(1, LEAST(100, p.lv)), 0, NOW()
FROM `acct_player` p
WHERE p.bot = 1;

-- 演示账号：用于界面截图与功能演示，等级与资产按中期玩家配置
INSERT INTO `acct_player`
  (`uid`, `nick`, `avatar`, `lv`, `exp`, `coin`, `card`, `ad_used`, `ad_day`, `bot`)
VALUES ('A8K3M', '老司机王', '', 25, 380, 1250000, 5, 0, '', 0);

INSERT INTO `lot_cell` (`owner_id`, `seq`, `state`)
SELECT p.id, s.seq, 0
FROM `acct_player` p
JOIN (SELECT 1 AS seq UNION ALL SELECT 2 UNION ALL SELECT 3) s
WHERE p.uid = 'A8K3M' AND s.seq <= 3;

INSERT INTO `acct_vehicle` (`owner_id`, `lv`, `state`, `born_at`)
SELECT p.id, v.lv, 0, NOW()
FROM `acct_player` p
JOIN (SELECT 9 AS lv UNION ALL SELECT 12 UNION ALL SELECT 15) v
WHERE p.uid = 'A8K3M';

-- 演示账号与三位机器人建立关系，让通讯录、仇人列表开箱就有内容
INSERT INTO `social_bond` (`holder_id`, `target_id`, `kind`, `heat`, `last_at`)
SELECT me.id, other.id, 'friend', 0, NOW()
FROM `acct_player` me
JOIN `acct_player` other ON other.nick IN ('侧方停车王', '车位钉子户')
WHERE me.uid = 'A8K3M';

INSERT INTO `social_bond` (`holder_id`, `target_id`, `kind`, `heat`, `last_at`)
SELECT me.id, other.id, 'foe', 3, NOW()
FROM `acct_player` me
JOIN `acct_player` other ON other.nick = '加塞之王'
WHERE me.uid = 'A8K3M';
