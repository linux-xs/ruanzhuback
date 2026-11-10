/* 首页视图：签到、经验进度、车辆与车位概览、访客动态 */
(function (global) {
  'use strict';

  var Fmt = global.Fmt;
  var Store = global.Store;

  function paintSign(state) {
    var me = state.me;
    if (!me) {
      return;
    }
    var stateText = document.getElementById('signState');
    var plain = document.getElementById('signPlainBtn');
    var card = document.getElementById('signCardBtn');
    if (!stateText || !plain || !card) {
      return;
    }
    stateText.textContent = me.signed_today ? '今天已签到' : '今天还没签';
    plain.disabled = !!me.signed_today;
    card.disabled = !!me.signed_today || me.card < 1;
    card.querySelector('.btn-sub').textContent = me.card < 1
      ? '幸运卡不足，先点右上角获取'
      : '消耗 1 张 · +50,000 金币';
  }

  function paintExp(state) {
    var me = state.me;
    if (!me) {
      return;
    }
    var meter = document.getElementById('expMeter');
    var text = document.getElementById('expText');
    if (!meter || !text) {
      return;
    }
    var need = me.exp_need || 0;
    meter.style.width = need > 0 ? Fmt.ratio(me.exp, need) + '%' : '100%';
    text.textContent = need > 0
      ? '经验 ' + Fmt.num(me.exp) + ' / ' + Fmt.num(need)
      : '已达最高等级';
  }

  // 首页只放概览：车型名 + 状态，点一下跳到车库看细节
  function paintVehicles(state) {
    var box = document.getElementById('homeVehicles');
    var count = document.getElementById('garageCount');
    if (!box || !count) {
      return;
    }
    if (state.me) {
      count.textContent = state.me.vehicle_count + ' / ' + state.me.vehicle_cap;
    }
    if (!state.vehicles.length) {
      box.innerHTML = '<div class="empty">还没有车，去图鉴买一辆</div>';
      return;
    }
    box.innerHTML = state.vehicles.map(function (v) {
      var cls = v.state === 'parked' ? 'busy' : 'free';
      var tip = v.state === 'parked'
        ? '停在 ' + Fmt.esc(v.parked.host_nick) + ' 的车位'
        : '空闲 · ' + Fmt.num(v.hourly) + ' / 小时';
      return '<div class="mini ' + cls + '"><b>' + Fmt.esc(v.name) + '</b><span>' +
        Fmt.esc(tip) + '</span></div>';
    }).join('');
  }

  function paintLots(state) {
    var box = document.getElementById('homeLots');
    var count = document.getElementById('lotCount');
    if (!box || !count) {
      return;
    }
    var free = state.lots.filter(function (l) {
      return !l.occupant;
    }).length;
    count.textContent = free + ' 空 / 共 ' + state.lots.length;
    if (!state.lots.length) {
      box.innerHTML = '<div class="empty">车位还没发放，升级后自动增加</div>';
      return;
    }
    box.innerHTML = state.lots.map(function (lot) {
      if (!lot.occupant) {
        return '<div class="mini free"><b>车位 ' + lot.seq + '</b><span>空着</span></div>';
      }
      return '<div class="mini busy"><b>' + Fmt.esc(lot.occupant.vehicle_name) +
        '</b><span>' + Fmt.esc(lot.occupant.stage.label) + '</span></div>';
    }).join('');
  }

  function paintFeed(state) {
    var box = document.getElementById('homeFeed');
    if (!box) {
      return;
    }
    if (!state.feed.length) {
      box.innerHTML = '<li class="ago">最近还没有人来过</li>';
      return;
    }
    box.innerHTML = state.feed.slice(0, 5).map(function (item) {
      return '<li><span>' + Fmt.esc(item.kind_text) + '</span><span class="ago">' +
        Fmt.esc(item.ago) + '</span></li>';
    }).join('');
  }

  Store.onPaint(function (state) {
    paintSign(state);
    paintExp(state);
    paintVehicles(state);
    paintLots(state);
    paintFeed(state);
  });
})(window);
