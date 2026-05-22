/* ============ 全民抢车位 - 假数据层 ============ */

// 当前登录玩家
var MOCK_PLAYER = {
  id: 1,
  player_uid: "88A4C",
  nickname: "老司机王",
  avatar: "",
  level: 25,
  exp: 38400,
  gold: 1250000,
  lucky_card: 5,
  daily_ad_count: 3,
  is_bot: 0
};

// 我的车辆列表
var MOCK_MY_CARS = [
  { id: 101, player_id: 1, car_level: 8, car_name: "雅阁商务车", status: 0, output_per_hour: 1500, buy_price: 120000, sell_price: 102000 },
  { id: 102, player_id: 1, car_level: 5, car_name: "宏光面包车", status: 1, output_per_hour: 600, buy_price: 10000, sell_price: 8500, park_host: "大佬李", park_start: "2026-05-14 10:30", rate: 2.0 },
  { id: 103, player_id: 1, car_level: 3, car_name: "破烂三轮车", status: 0, output_per_hour: 250, buy_price: 1500, sell_price: 1275 }
];

// 我的车位列表
var MOCK_MY_SPACES = [
  { id: 1, player_id: 1, slot_index: 1, status: 0 },
  { id: 2, player_id: 1, slot_index: 2, status: 0 },
  { id: 3, player_id: 1, slot_index: 3, status: 1, occupied_by: "路人甲", occupied_car: "经济型代步车", occupied_start: "2026-05-14 10:05" },
  { id: 4, player_id: 1, slot_index: 4, status: 1, occupied_by: "小明哥", occupied_car: "宝马3系轿跑", occupied_start: "2026-05-14 08:20" },
  { id: 5, player_id: 1, slot_index: 5, status: 0 },
  { id: 6, player_id: 1, slot_index: 6, status: 0 }
];

// 好友列表
var MOCK_FRIENDS = [
  { id: 10, player_uid: "F1A2B", nickname: "大佬李", avatar: "", level: 68, free_spaces: 2, total_spaces: 8 },
  { id: 11, player_uid: "C3D4E", nickname: "肝帝张", avatar: "", level: 52, free_spaces: 1, total_spaces: 7 },
  { id: 12, player_uid: "G5H6I", nickname: "咸鱼陈", avatar: "", level: 30, free_spaces: 4, total_spaces: 5 },
  { id: 13, player_uid: "J7K8L", nickname: "氪佬赵", avatar: "", level: 88, free_spaces: 0, total_spaces: 10 },
  { id: 14, player_uid: "M9N0O", nickname: "养老周", avatar: "", level: 40, free_spaces: 3, total_spaces: 6 }
];

// 仇人列表
var MOCK_ENEMIES = [
  { id: 20, player_uid: "X1Y2Z", nickname: "贴条狂魔", avatar: "", level: 35, hate_count: 5, free_spaces: 1, total_spaces: 5, last_event: "30分钟前贴了你的单" },
  { id: 21, player_uid: "A3B4C", nickname: "偷鸡贼", avatar: "", level: 22, hate_count: 3, free_spaces: 2, total_spaces: 3, last_event: "2小时前贴了你的单" },
  { id: 22, player_uid: "D5E6F", nickname: "夜猫子刘", avatar: "", level: 45, hate_count: 7, free_spaces: 0, total_spaces: 6, last_event: "15分钟前贴了你的单" }
];

// 访客动态
var MOCK_VISITOR_LOGS = [
  { id: 1, visitor_name: "路人甲", visitor_id: 30, event_type: 1, car_name: "经济型代步车", event_text: "停了一辆经济型代步车", time: "5分钟前", car_level: 6, gold_income: 0 },
  { id: 2, visitor_name: "小明哥", visitor_id: 31, event_type: 1, car_name: "宝马3系轿跑", event_text: "停了一辆宝马3系轿跑", time: "2小时前", car_level: 10, gold_income: 0 },
  { id: 3, visitor_name: "咸鱼陈", visitor_id: 12, event_type: 3, car_name: "报废奥拓", event_text: "被你贴了罚单", time: "3小时前", car_level: 4, gold_income: 4600 },
  { id: 4, visitor_name: "养老周", visitor_id: 14, event_type: 2, car_name: "城市紧凑SUV", event_text: "停满8小时开走了", time: "5小时前", car_level: 7, gold_income: 0 },
  { id: 5, visitor_name: "肝帝张", visitor_id: 11, event_type: 1, car_name: "雅阁商务车", event_text: "停了一辆雅阁商务车", time: "8小时前", car_level: 8, gold_income: 0 }
];

// 车辆图鉴
var MOCK_CAR_CONFIGS = [
  { car_level: 1, car_name: "破旧拖拉机", buy_price: 100, sell_price: 85, output_per_hour: 100, output_full: 800 },
  { car_level: 2, car_name: "二八大杠自行车", buy_price: 500, sell_price: 425, output_per_hour: 150, output_full: 1200 },
  { car_level: 3, car_name: "破烂三轮车", buy_price: 1500, sell_price: 1275, output_per_hour: 250, output_full: 2000 },
  { car_level: 4, car_name: "报废奥拓", buy_price: 4000, sell_price: 3400, output_per_hour: 400, output_full: 3200 },
  { car_level: 5, car_name: "宏光面包车", buy_price: 10000, sell_price: 8500, output_per_hour: 600, output_full: 4800 },
  { car_level: 6, car_name: "经济型代步车", buy_price: 25000, sell_price: 21250, output_per_hour: 850, output_full: 6800 },
  { car_level: 7, car_name: "城市紧凑SUV", buy_price: 60000, sell_price: 51000, output_per_hour: 1150, output_full: 9200 },
  { car_level: 8, car_name: "雅阁商务车", buy_price: 120000, sell_price: 102000, output_per_hour: 1500, output_full: 12000 },
  { car_level: 9, car_name: "猛禽皮卡", buy_price: 250000, sell_price: 212500, output_per_hour: 2000, output_full: 16000 },
  { car_level: 10, car_name: "宝马3系轿跑", buy_price: 500000, sell_price: 425000, output_per_hour: 2800, output_full: 22400 },
  { car_level: 11, car_name: "奥迪A6L", buy_price: 975000, sell_price: 828750, output_per_hour: 3400, output_full: 27200 },
  { car_level: 12, car_name: "奔驰E级", buy_price: 1620000, sell_price: 1377000, output_per_hour: 4100, output_full: 32800 },
  { car_level: 15, car_name: "特斯拉Model S", buy_price: 2500000, sell_price: 2125000, output_per_hour: 5800, output_full: 46400 },
  { car_level: 20, car_name: "保时捷718", buy_price: 4000000, sell_price: 3400000, output_per_hour: 8000, output_full: 64000 },
  { car_level: 25, car_name: "法拉利488", buy_price: 8000000, sell_price: 6800000, output_per_hour: 12000, output_full: 96000 },
  { car_level: 30, car_name: "迈巴赫S级", buy_price: 20000000, sell_price: 17000000, output_per_hour: 18000, output_full: 144000 },
  { car_level: 40, car_name: "玛莎拉蒂总裁", buy_price: 80000000, sell_price: 68000000, output_per_hour: 35000, output_full: 280000 },
  { car_level: 50, car_name: "劳斯莱斯幻影", buy_price: 300000000, sell_price: 255000000, output_per_hour: 60000, output_full: 480000 },
  { car_level: 60, car_name: "蝙蝠侠战车", buy_price: 1000000000, sell_price: 850000000, output_per_hour: 100000, output_full: 800000 },
  { car_level: 70, car_name: "纯金重型坦克", buy_price: 4000000000, sell_price: 3400000000, output_per_hour: 180000, output_full: 1440000 },
  { car_level: 80, car_name: "阿帕奇武装直升机", buy_price: 15000000000, sell_price: 12750000000, output_per_hour: 300000, output_full: 2400000 },
  { car_level: 90, car_name: "歼十战斗机", buy_price: 50000000000, sell_price: 42500000000, output_per_hour: 500000, output_full: 4000000 },
  { car_level: 100, car_name: "赛博悬浮UFO", buy_price: 150000000000, sell_price: 127500000000, output_per_hour: 800000, output_full: 6400000 }
];

// 车辆图标映射
var CAR_ICONS = {
  1: "🚜", 2: "🚲", 3: "🛻", 4: "🚗", 5: "🚐",
  6: "🚙", 7: "🚘", 8: "🚖", 9: "🛻", 10: "🏎️",
  11: "🚗", 12: "🚙", 15: "🔋", 20: "🏎️", 25: "🏎️",
  30: "🚘", 40: "🚗", 50: "🚙", 60: "🦇", 70: "🪖",
  80: "🚁", 90: "✈️", 100: "🛸"
};

// 格式化金币
function fmtGold(n) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + "亿";
  if (n >= 10000) return (n / 10000).toFixed(0) + "万";
  return n.toLocaleString();
}

// 格式化时间
function fmtTime(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  var h = d.getHours().toString().padStart(2, "0");
  var m = d.getMinutes().toString().padStart(2, "0");
  return h + ":" + m;
}

// 计算停车已过分钟
function calcElapsedMinutes(startStr) {
  var d = new Date(startStr.replace(" ", "T"));
  return Math.floor((new Date() - d) / 60000);
}

// 获取时间阶段
function getTimePhase(startStr) {
  var m = calcElapsedMinutes(startStr);
  if (m < 60) return 1;   // 锁定期
  if (m < 120) return 2;  // 黄金逃生
  if (m < 480) return 3;  // 杀戮时刻
  return 4;               // 自然满
}

function getPhaseText(startStr) {
  var p = getTimePhase(startStr);
  var m = calcElapsedMinutes(startStr);
  if (p === 1) return "锁定期(" + (60-m) + "分后解锁)";
  if (p === 2) return "逃生期(可召回)";
  if (p === 3) return "杀戮时刻(可被贴条)";
  if (p === 4) return "已满8小时";
}

// 获取车辆图鉴信息
function getCarConfig(level) {
  for (var i = 0; i < MOCK_CAR_CONFIGS.length; i++) {
    if (MOCK_CAR_CONFIGS[i].car_level === level) return MOCK_CAR_CONFIGS[i];
  }
  return null;
}

// 获取车辆图标
function getCarIcon(level) {
  return CAR_ICONS[level] || "🚗";
}

// 获取倍率文本
function getRateText(myLevel, hostLevel) {
  if (myLevel > hostLevel) return { rate: 1.0, text: "1倍 (向下兼容)" };
  if (myLevel === hostLevel) return { rate: 1.5, text: "1.5倍 (平级切磋)" };
  return { rate: 2.0, text: "2倍 (向上攀附)" };
}
