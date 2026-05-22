/**
 * 游戏配置文件
 */

// 游戏列表配置
const GAMES_CONFIG = [
  {
    id: 'fangkuai',
    name: '方块消消乐',
    color: '#FF6B6B',
    icon: ''
  },
  {
    id: 'jiantou',
    name: '箭头消消消',
    color: '#4ECDC4',
    icon: '️'
  },
  {
    id: 'linghun',
    name: '灵魂碎片',
    color: '#45B7D1',
    icon: ''
  },
  {
    id: 'duomaomao',
    name: '躲猫猫',
    color: '#96CEB4',
    icon: ''
  },
  {
    id: 'eluosi',
    name: '俄罗斯方块',
    color: '#FFEAA7',
    icon: '🧱'
  },
  {
    id: 'lianliankan',
    name: '连连看',
    color: '#DDA0DD',
    icon: ''
  },
  {
    id: 'tingche',
    name: '停车出库',
    color: '#98D8C8',
    icon: ''
  },
  {
    id: 'pintu',
    name: '拼图游戏',
    color: '#F7DC6F',
    icon: ''
  },
  {
    id: 'fanhui',
    name: '图返原',
    color: '#BB8FCE',
    icon: '🔄'
  }
];

// 颜色配置
const COLORS = {
  // 背景渐变色
  bgStart: '#667eea',
  bgEnd: '#764ba2',
  
  // 卡片颜色
  cardBg: 'rgba(255,255,255,0.95)',
  cardShadow: 'rgba(0,0,0,0.15)',
  
  // 文字颜色
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textWhite: '#FFFFFF',
  
  // 功能颜色
  energy: '#FDCB6E',
  energyText: '#E17055',
  
  // 按钮颜色
  btnSetting: 'rgba(255,255,255,0.2)',
  btnRank: 'rgba(255,255,255,0.2)'
};

// 布局配置
const LAYOUT = {
  topBarHeight: 100,
  cardMargin: 12,
  cardRadius: 16,
  cardHeightRatio: 1.15,
  padding: 15
};

// 存储键名
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  ENERGY: 'energy',
  GAME_PROGRESS: 'gameProgress',
  SETTINGS: 'settings'
};

// 体力配置
const ENERGY_CONFIG = {
  max: 200,
  recoverInterval: 300, // 秒
  recoverAmount: 1,
  costPerGame: 5 // 每局消耗体力
};

module.exports = {
  GAMES_CONFIG,
  COLORS,
  LAYOUT,
  STORAGE_KEYS,
  ENERGY_CONFIG
};
