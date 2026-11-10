/* 通讯录视图：按号找人、好友/仇人/动态/推荐四个页签 */
(function (global) {
  'use strict';

  var Fmt = global.Fmt;
  var Store = global.Store;
  var Api = global.Api;

  // 搜索名片专用的两个标记按钮
  function markButtons(uid) {
    var safe = Fmt.esc(uid);
    return '<button type="button" class="btn small ghost" data-mark="friend" ' +
      'data-uid="' + safe + '">加好友</button>' +
      '<button type="button" class="btn small ghost" data-mark="foe" ' +
      'data-uid="' + safe + '">标仇人</button>';
  }

  function goParkButton(uid) {
    return '<button type="button" class="btn small warm" data-gopark="' +
      Fmt.esc(uid) + '">去停车</button>';
  }

  // 一行人物卡片：昵称 + 一句副标题 + 右侧按钮，search 模式多两个标记按钮
  function personCard(item, mode) {
    var sub = 'Lv.' + item.level + ' · 空位 ' + item.free + ' / ' + item.total +
      ' · 去停能拿 ' + item.rate;
    if (item.heat) {
      sub += ' · 结仇 ' + item.heat + ' 次';
    }
    if (item.note) {
      sub += ' · ' + item.note;
    }
    var acts = (mode === 'search' ? markButtons(item.uid) : '') + goParkButton(item.uid);
    return '' +
      '<div class="person">' +
      '  <div class="person-main">' +
      '    <div class="person-name">' + Fmt.esc(item.nick) + '</div>' +
      '    <div class="person-sub">' + Fmt.esc(sub) + '</div>' +
      '  </div>' +
      '  <div class="person-acts">' + acts + '</div>' +
      '</div>';
  }

  function searchCard(data) {
    var box = document.getElementById('searchCard');
    if (!box) {
      return;
    }
    if (!data) {
      box.innerHTML = '';
      return;
    }
    var relation = data.relation === 'friend' ? '已是好友'
      : data.relation === 'foe' ? '已标记仇人' : '还没关系';
    box.innerHTML = personCard({
      uid: data.uid,
      nick: data.nick,
      level: data.level,
      free: data.cell_free,
      total: data.cell_total,
      rate: data.rate_if_park,
      note: relation
    }, 'search');
  }

  // 动态页签的条目与首页同源，这里展示更完整的字段
  function feedRow(item) {
    var who = Fmt.esc(item.actor_nick) + '（Lv.' + item.actor_level + '）';
    return '' +
      '<div class="person">' +
      '  <div class="person-main">' +
      '    <div class="person-name">' + who + '</div>' +
      '    <div class="person-sub">' + Fmt.esc(item.kind_text) + '</div>' +
      '  </div>' +
      '  <span class="hint">' + Fmt.esc(item.ago) + '</span>' +
      '</div>';
  }

  function paintList(state) {
    var box = document.getElementById('contactList');
    if (!box) {
      return;
    }
    if (state.bondKind === 'feed') {
      box.innerHTML = state.feed.length
        ? state.feed.map(feedRow).join('')
        : '<div class="empty">最近还没有动态</div>';
      return;
    }
    if (state.bondKind === 'near') {
      box.innerHTML = state.recommend.length
        ? state.recommend.map(function (item) {
          return personCard(item, 'near');
        }).join('')
        : '<div class="empty">暂时没有推荐的玩家</div>';
      return;
    }
    if (!state.bonds.length) {
      box.innerHTML = state.bondKind === 'friend'
        ? '<div class="empty">还没有好友，搜个号加一个，去他家薅高倍率</div>'
        : '<div class="empty">还没有仇人，被贴条后会自动记进来</div>';
      return;
    }
    box.innerHTML = state.bonds.map(function (item) {
      return personCard(item, 'list');
    }).join('');
  }

  function loadBonds(kind) {
    Store.patch({ bondKind: kind });
    if (kind === 'feed' || kind === 'near') {
      Store.refresh();
      return;
    }
    Api.bonds(kind).then(function (data) {
      Store.patch({ bonds: data.items || [] });
      Store.refresh();
    }).catch(function (err) {
      Store.toast(err.message, true);
    });
  }

  function bindTabs() {
    var box = document.getElementById('contactTabs');
    if (!box) {
      return;
    }
    box.addEventListener('click', function (ev) {
      var tab = ev.target.closest ? ev.target.closest('.tab') : null;
      if (!tab) {
        return;
      }
      var all = box.querySelectorAll('.tab');
      for (var i = 0; i < all.length; i++) {
        all[i].className = all[i] === tab ? 'tab on' : 'tab';
      }
      loadBonds(tab.getAttribute('data-tab'));
    });
  }

  function bindSearch() {
    var input = document.getElementById('searchInput');
    var button = document.getElementById('searchBtn');
    if (!input || !button) {
      return;
    }
    button.addEventListener('click', function () {
      var uid = (input.value || '').trim().toUpperCase();
      if (uid.length < 4) {
        Store.toast('请输入完整的玩家号', true);
        return;
      }
      Api.search(uid).then(function (data) {
        searchCard(data);
      }).catch(function (err) {
        searchCard(null);
        Store.toast(err.message, true);
      });
    });
  }

  // 好友/仇人标记与「去停车」统一走事件委托
  document.addEventListener('click', function (ev) {
    var markBtn = ev.target.closest ? ev.target.closest('button[data-mark]') : null;
    if (markBtn) {
      var uid = markBtn.getAttribute('data-uid');
      var kind = markBtn.getAttribute('data-mark');
      Api.mark(uid, kind).then(function () {
        Store.toast(kind === 'friend' ? '已加为好友' : '已标记为仇人');
        loadBonds(kind);
      }).catch(function (err) {
        Store.toast(err.message, true);
      });
      return;
    }
    var parkBtn = ev.target.closest ? ev.target.closest('button[data-gopark]') : null;
    if (parkBtn) {
      global.App.parkTo(parkBtn.getAttribute('data-gopark'));
    }
  });

  bindTabs();
  bindSearch();
  Store.onPaint(paintList);
})(window);
