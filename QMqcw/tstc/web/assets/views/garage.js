/* 车库视图：每辆车一张卡，按状态给出可用操作 */
(function (global) {
  'use strict';

  var Fmt = global.Fmt;
  var Store = global.Store;
  var Api = global.Api;

  // 阶段进度条：四段，点亮到当前阶段
  function stageBar(code) {
    var order = ['lock', 'escape', 'hunt', 'mature'];
    var at = order.indexOf(code);
    var parts = order.map(function (name, i) {
      return '<i class="' + (i <= at ? 'on' : '') + '"></i>';
    });
    return '<div class="stage-bar">' + parts.join('') + '</div>';
  }

  function parkedInfo(v) {
    var p = v.parked;
    return '' +
      '<div class="vrow">停在 <em>' + Fmt.esc(p.host_nick) + '</em>（Lv.' + p.host_level +
      '）· 倍率 <em>' + Fmt.esc(p.rate) + '</em></div>' +
      '<div class="vrow">' + stageBar(p.stage.code) + '</div>' +
      '<div class="vrow">已停 <em>' + Fmt.minutes(p.stage.minutes) + '</em> · 累计 <em>' +
      Fmt.num(p.accrued) + '</em> 金币</div>' +
      '<div class="vrow">' + Fmt.esc(p.stage.label) + ' · ' + Fmt.esc(p.stage.hint) + '</div>';
  }

  function idleInfo(v) {
    return '' +
      '<div class="vrow">基础产出 <em>' + Fmt.num(v.hourly) + '</em> / 小时 · 卖价 <em>' +
      Fmt.num(v.trade_in) + '</em></div>';
  }

  function actions(v) {
    var list = [];
    if (v.state === 'parked') {
      list.push(btn('recall', v.id, '召回', v.parked.can_recall, false));
      list.push(btn('card', v.id, '幸运卡秒结', v.parked.can_card, true));
    } else {
      list.push(btn('park', v.id, '一键停车', true, true));
      list.push(btn('parkTo', v.id, '选人停车', true, false));
      list.push(btn('sell', v.id, '卖掉', true, false));
    }
    return list.join('');
  }

  function btn(action, id, text, enabled, warm) {
    return '<button type="button" class="btn small ' + (warm ? 'warm' : 'ghost') + '" ' +
      (enabled ? '' : 'disabled ') + 'data-act="' + action + '" data-id="' + id + '">' +
      text + '</button>';
  }

  function card(v) {
    var parked = v.state === 'parked';
    var stateText = parked ? '停车中' : '空闲';
    return '' +
      '<article class="vcard ' + (parked ? 'parked' : '') + '">' +
      '  <div class="vcard-top">' +
      '    <div>' +
      '      <div class="vname">' + Fmt.esc(v.name) + '</div>' +
      '      <div class="vmeta">Lv.' + v.level + ' · 购入价 ' + Fmt.num(v.price) + '</div>' +
      '    </div>' +
      '    <span class="vstate ' + (parked ? 'on' : '') + '">' + stateText + '</span>' +
      '  </div>' +
      (parked ? parkedInfo(v) : idleInfo(v)) +
      '  <div class="vacts">' + actions(v) + '</div>' +
      '</article>';
  }

  function paint(state) {
    var box = document.getElementById('garageList');
    if (!box) {
      return;
    }
    if (!state.vehicles.length) {
      box.innerHTML = '<div class="empty">车库里空空如也，去图鉴挑一辆</div>';
      return;
    }
    box.innerHTML = state.vehicles.map(card).join('');
  }

  // 统一处理车库里的按钮点击
  function onAct(ev) {
    var target = ev.target.closest ? ev.target.closest('button[data-act]') : null;
    if (!target) {
      return;
    }
    var id = Number(target.getAttribute('data-id'));
    var act = target.getAttribute('data-act');
    if (act === 'park') {
      busy(Api.park(id, ''), '已经停出去了');
    } else if (act === 'recall') {
      busy(Api.recall(id), '召回成功');
    } else if (act === 'card') {
      busy(Api.cardSettle(id), '幸运卡已结算');
    } else if (act === 'sell') {
      busy(Api.sell(id), '已卖掉');
    } else if (act === 'parkTo') {
      askTarget(id);
    }
  }

  // 选人停车：让玩家输入对方短号，停到指定人的空位上
  function askTarget(vehicleId) {
    var uid = global.prompt ? global.prompt('输入对方五位玩家号，例如 A8K3M') : '';
    if (!uid) {
      return;
    }
    busy(Api.park(vehicleId, uid.trim().toUpperCase()), '已经停到对方车位');
  }

  // 所有写操作走同一条路径：调接口 → 提示 → 刷新全部视图
  function busy(promise, doneText) {
    promise.then(function (data) {
      var rows = [];
      if (data && data.kind_label) {
        rows.push(['结算方式', data.kind_label]);
        rows.push(['停了几分钟', Fmt.minutes(data.minutes)]);
        rows.push(['毛收益', Fmt.num(data.gross)]);
        rows.push(['你拿到', Fmt.num(data.parker_pay)]);
        if (Number(String(data.host_pay).replace(/,/g, '')) > 0) {
          rows.push(['车位主人拿到', Fmt.num(data.host_pay)]);
        }
        rows.push(['获得经验', data.exp]);
        Store.modal('结算完成', rows, [['知道了', null, true]]);
      } else if (data && data.host_nick) {
        rows.push(['停到', data.host_nick + '（Lv.' + data.host_level + '）']);
        rows.push(['车位号', data.cell_seq]);
        rows.push(['倍率', data.rate]);
        rows.push(['满额收入', Fmt.num(data.full_pay)]);
        Store.modal('停车成功', rows, [['知道了', null, true]]);
      } else {
        Store.toast(doneText);
      }
      return global.App.reload();
    }).catch(function (err) {
      Store.toast(err.message, true);
    });
  }

  document.addEventListener('click', function (ev) {
    if (ev.target.closest && ev.target.closest('#garageList')) {
      onAct(ev);
    }
  });

  Store.onPaint(paint);
})(window);
