/**
 * 抖音小游戏大厅主入口
 */

const GameHall = require('./js/hall.js');

// 预加载所有游戏模块
const GameModules = {
  fangkuai: require('./games/fangkuai/index.js'),
  eluosi: require('./games/eluosi/index.js'),
  lianliankan: require('./games/lianliankan/index.js'),
  jiantou: require('./games/jiantou/index.js'),
  linghun: require('./games/linghun/index.js'),
  duomaomao: require('./games/duomaomao/index.js'),
  tingche: require('./games/tingche/index.js'),
  pintu: require('./games/pintu/index.js'),
  fanhui: require('./games/fanhui/index.js')
};

// 创建游戏大厅实例，传入游戏模块
const hall = new GameHall(GameModules);

// 初始化
hall.init();
