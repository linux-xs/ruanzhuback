/* 图鉴视图：1 到 100 级车型一览，可购买 / 已拥有 / 未解锁三种状态 */
(function (global) {
  'use strict';

  var Fmt = global.Fmt;
  var Store = global.Store;
  var Api = global.Api;

  function row(item, state) {
    var owned = state.vehicles.some(function (v) {
      return v.level === item.level;
    });
    var action;
    if (!item.unlocked) {
      action = '<button type="button" class="btn small ghost" disabled>等级不够</button>';
    } else if (!item.affordable) {
      action = '<button type="button" class="btn small ghost" disabled>金币不够</button>';
    } else {
      action = '<button type="button" class="btn small warm" data-buy="' +
        item.level + '">购买</button>';
    }
    return '' +
      '<div class="person">' +
      '  <div class="person-main">' +
      '    <div class="person-name">Lv.' + item.level + ' ' + Fmt.esc(item.name) + '</div>' +
      '    <div class="person-sub">' +
      '      价格 ' + Fmt.num(item.price) +
      ' · 产出 ' + Fmt.num(item.hourly) + '/时' +
      ' · 满额 ' + Fmt.num(item.full_pay) +
      ' · 卖价 ' + Fmt.num(item.trade_in) +
      (owned ? ' · <em>已拥有</em>' : '') +
      '    </div>' +
      '  </div>' +
      '  <div class="person-acts">' + action + '</div>' +
      '</div>';
  }

  function paint(state) {
    var box = document.getElementById('catalogList');
    var hint = document.getElementById('catalogHint');
    if (!box) {
      return;
    }
    if (hint && state.me) {
      hint.textContent = '当前等级 Lv.' + state.me.level + '，可购买到 Lv.' + state.me.max_buy_level;
    }
    if (!state.catalog.length) {
      box.innerHTML = '<div class="empty">图鉴加载中</div>';
      return;
    }
    // 只展示当前等级附近的一段，避免一次渲染 100 行
    var limit = state.me ? state.me.max_buy_level + 3 : 10;
    var list = state.catalog.filter(function (item) {
      return item.level <= limit;
    });
    box.innerHTML = list.map(function (item) {
      return row(item, state);
    }).join('');
  }

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest ? ev.target.closest('button[data-buy]') : null;
    if (!btn) {
      return;
    }
    var level = Number(btn.getAttribute('data-buy'));
    Api.buy(level).then(function (data) {
      Store.toast('买到 ' + data.name + '，余额 ' + Fmt.num(data.coin));
      return global.App.reload();
    }).catch(function (err) {
      Store.toast(err.message, true);
    });
  });

  Store.onPaint(paint);
})(window);
