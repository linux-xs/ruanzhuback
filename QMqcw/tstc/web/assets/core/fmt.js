/* 文本与数值格式化：所有展示口径集中在这里，避免各视图各写一套 */
(function (global) {
  'use strict';

  // 千分位：1234567 → 1,234,567
  // 允许传入已经带逗号的字符串（服务端金额字段就是这种形态），先去掉再转数字
  function num(value) {
    var raw = value === null || value === undefined ? 0 : value;
    var n = Number(String(raw).replace(/,/g, ''));
    if (!isFinite(n)) {
      return '0';
    }
    var text = String(Math.trunc(Math.abs(n)));
    var out = text.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return n < 0 ? '-' + out : out;
  }

  // 分钟数转成人话：95 → 1 小时 35 分
  function minutes(value) {
    var m = Math.max(0, Math.trunc(Number(value || 0)));
    if (m < 60) {
      return m + ' 分钟';
    }
    var h = Math.floor(m / 60);
    var rest = m % 60;
    return rest === 0 ? h + ' 小时' : h + ' 小时 ' + rest + ' 分';
  }

  // 阶段中文名，与后端 stage.label 保持一致，作为兜底
  var STAGE = {
    lock: '绝对锁定期',
    escape: '逃生观察期',
    hunt: '争夺期',
    mature: '期满'
  };

  function stage(code) {
    return STAGE[code] || '未知阶段';
  }

  // HTML 转义：所有插入 innerHTML 的动态文本都必须先过这里
  function esc(text) {
    return String(text === undefined || text === null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 经验进度条百分比
  function ratio(part, total) {
    if (!total || total <= 0) {
      return 0;
    }
    var p = (Number(part) / Number(total)) * 100;
    if (p < 0) {
      return 0;
    }
    if (p > 100) {
      return 100;
    }
    return Math.round(p);
  }

  global.Fmt = {
    num: num,
    minutes: minutes,
    stage: stage,
    esc: esc,
    ratio: ratio
  };
})(window);
