/* 车位视图：自己的格子 + 停在上面的外来车（可贴条） */
(function (global) {
  'use strict';

  var Fmt = global.Fmt;
  var Store = global.Store;
  var Api = global.Api;

  function cell(lot) {
    if (lot.occupant) {
      return '<div class="cell taken"><b>' + lot.seq + '</b><span>' +
        Fmt.esc(lot.occupant.vehicle_name) + '</span></div>';
    }
    return '<div class="cell"><b>' + lot.seq + '</b><span>空闲</span></div>';
  }

  function occupantCard(lot) {
    var o = lot.occupant;
    var tip = o.can_ticket
      ? '可以贴条，车主拿 ' + Fmt.num(o.parker_pay_if_ticket) + '，你拿 ' + Fmt.num(o.host_pay_if_ticket)
      : '还要等 ' + Fmt.minutes(o.wait_for) + ' 才能贴条';
    return '' +
      '<article class="vcard parked">' +
      '  <div class="vcard-top">' +
      '    <div>' +
      '      <div class="vname">' + Fmt.esc(o.vehicle_name) + '</div>' +
      '      <div class="vmeta">车主 ' + Fmt.esc(o.parker_nick) + '（Lv.' + o.parker_level +
      '）· 车位 ' + lot.seq + '</div>' +
      '    </div>' +
      '    <span class="vstate on">' + Fmt.esc(o.stage.label) + '</span>' +
      '  </div>' +
      '  <div class="vrow">倍率 <em>' + Fmt.esc(o.rate) + '</em> · 已停 <em>' +
      Fmt.minutes(o.stage.minutes) + '</em> · 累计 <em>' + Fmt.num(o.accrued) + '</em></div>' +
      '  <div class="vrow">' + Fmt.esc(tip) + '</div>' +
      '  <div class="vacts">' +
      '    <button type="button" class="btn small warm" data-ticket="' + o.vehicle_id + '" ' +
      (o.can_ticket ? '' : 'disabled ') + '>贴条</button>' +
      '  </div>' +
      '</article>';
  }

  function paint(state) {
    var grid = document.getElementById('lotGrid');
    var list = document.getElementById('lotOccupants');
    if (!grid || !list) {
      return;
    }
    if (!state.lots.length) {
      grid.innerHTML = '<div class="empty">还没有车位</div>';
      list.innerHTML = '';
      return;
    }
    grid.innerHTML = state.lots.map(cell).join('');
    var taken = state.lots.filter(function (l) {
      return !!l.occupant;
    });
    if (!taken.length) {
      list.innerHTML = '<div class="empty">现在没有车停在你家，等别人送上门</div>';
      return;
    }
    list.innerHTML = taken.map(occupantCard).join('');
  }

  function onTicket(ev) {
    var btn = ev.target.closest ? ev.target.closest('button[data-ticket]') : null;
    if (!btn) {
      return;
    }
    var vehicleId = Number(btn.getAttribute('data-ticket'));
    Api.ticket(vehicleId).then(function (data) {
      Store.modal('贴条完成', [
        ['停了几分钟', Fmt.minutes(data.minutes)],
        ['车主拿到', Fmt.num(data.parker_pay)],
        ['你拿到', Fmt.num(data.host_pay)],
        ['获得经验', data.exp]
      ], [['知道了', null, true]]);
      return global.App.reload();
    }).catch(function (err) {
      Store.toast(err.message, true);
    });
  }

  document.addEventListener('click', function (ev) {
    if (ev.target.closest && ev.target.closest('#lotOccupants')) {
      onTicket(ev);
    }
  });

  Store.onPaint(paint);
})(window);
