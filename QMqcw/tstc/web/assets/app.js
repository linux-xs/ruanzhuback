/* 应用入口：恢复身份、拉数据、绑定导航与顶部按钮 */
(function (global) {
  'use strict';

  var Store = global.Store;
  var Api = global.Api;

  var UID_KEY = 'tstc.player.uid';
  var currentView = 'home';
  var ticking = false;

  // 从本地缓存恢复身份，没有就登记一个新号
  function ensureIdentity() {
    var cached = '';
    try {
      cached = global.localStorage.getItem(UID_KEY) || '';
    } catch (err) {
      cached = '';
    }
    if (cached) {
      Api.setUid(cached);
      return Promise.resolve(cached);
    }
    var seed = '车主' + Math.floor(Math.random() * 9000 + 1000);
    return Api.register(seed).then(function (data) {
      var uid = data.player.uid;
      Api.setUid(uid);
      try {
        global.localStorage.setItem(UID_KEY, uid);
      } catch (err) {
        // 隐私模式下写不进缓存也不影响本次会话
      }
      return uid;
    });
  }

  // 顶部资产区：昵称、短号、金币、幸运卡
  function paintTop(state) {
    var me = state.me;
    if (!me) {
      return;
    }
    document.getElementById('nickText').textContent = me.nick + ' · Lv.' + me.level;
    document.getElementById('uidText').textContent = '玩家号 ' + me.uid;
    document.getElementById('coinText').textContent = Fmt.num(me.coin_raw);
    document.getElementById('cardText').textContent = me.card;
    document.getElementById('avatarBadge').textContent = me.nick.slice(0, 1) || '车';
    var claim = document.getElementById('claimCardBtn');
    claim.disabled = me.ad_left <= 0;
    claim.textContent = me.ad_left > 0 ? '获取' : '今日已满';
  }

  var Fmt = global.Fmt;

  // 一次性拉齐首页需要的四份数据，再统一刷新视图
  function reload() {
    return Promise.all([
      Api.me(),
      Api.vehicles(),
      Api.lots(),
      Api.feed(24)
    ]).then(function (all) {
      Store.patch({
        me: all[0],
        vehicles: all[1].items || [],
        lots: all[2].items || [],
        feed: all[3].items || []
      });
      // 通讯录里的好友/仇人按当前页签决定要不要一起刷
      if (currentView === 'contacts') {
        return loadBonds(Store.get('bondKind'));
      }
      return null;
    }).then(function () {
      Store.refresh();
    }).catch(function (err) {
      Store.toast(err.message || '加载失败', true);
    });
  }

  // 通讯录数据按页签懒加载，避免每次刷新都多打两个接口
  function loadBonds(kind) {
    if (kind === 'feed' || kind === 'near') {
      if (kind === 'near') {
        return Api.recommend().then(function (data) {
          Store.patch({ recommend: data.items || [] });
        }).catch(function () {
          Store.patch({ recommend: [] });
        });
      }
      return Promise.resolve(null);
    }
    return Api.bonds(kind).then(function (data) {
      Store.patch({ bonds: data.items || [] });
    }).catch(function () {
      Store.patch({ bonds: [] });
    });
  }

  // 切页签：只切显示 + 补拉该页需要的列表
  function goto(view) {
    currentView = view;
    var sections = document.querySelectorAll('.view');
    for (var i = 0; i < sections.length; i++) {
      sections[i].hidden = sections[i].getAttribute('data-view') !== view;
    }
    var navs = document.querySelectorAll('.nav');
    for (var j = 0; j < navs.length; j++) {
      var on = navs[j].getAttribute('data-goto') === view;
      navs[j].className = on ? 'nav on' : 'nav';
    }
    if (view === 'contacts') {
      loadBonds(Store.get('bondKind')).then(function () {
        Store.refresh();
      });
    } else if (view === 'catalog') {
      Api.catalog().then(function (data) {
        Store.patch({ catalog: data.items || [] });
        Store.refresh();
      }).catch(function (err) {
        Store.toast(err.message, true);
      });
    } else {
      Store.refresh();
    }
  }

  // 「去停车」：挑一辆空闲车停到指定玩家处
  function parkTo(uid) {
    var idle = Store.get('vehicles').filter(function (v) {
      return v.state !== 'parked';
    });
    if (!idle.length) {
      Store.toast('没有空闲的车，先召回一辆', true);
      return;
    }
    var best = idle[0];
    Api.park(best.id, uid).then(function (data) {
      Store.modal('停车成功', [
        ['车', best.name],
        ['停到', data.host_nick + '（Lv.' + data.host_level + '）'],
        ['倍率', data.rate],
        ['满额收入', Fmt.num(data.full_pay)]
      ], [['知道了', null, true]]);
      return reload();
    }).catch(function (err) {
      Store.toast(err.message, true);
    });
  }

  function bindNav() {
    document.addEventListener('click', function (ev) {
      var nav = ev.target.closest ? ev.target.closest('.nav[data-goto]') : null;
      if (nav) {
        goto(nav.getAttribute('data-goto'));
      }
    });
  }

  function bindTopActions() {
    document.getElementById('signPlainBtn').addEventListener('click', function () {
      doSign('plain');
    });
    document.getElementById('signCardBtn').addEventListener('click', function () {
      doSign('card');
    });
    document.getElementById('claimCardBtn').addEventListener('click', function () {
      Api.claimCard().then(function (data) {
        Store.toast('领到 1 张幸运卡，今天还能领 ' + data.left + ' 次');
        return reload();
      }).catch(function (err) {
        if (err.code === 'ad_limit') {
          Store.toast('今天的幸运卡已经领完了，明天再来', true);
          return;
        }
        Store.toast(err.message, true);
      });
    });
  }

  function doSign(way) {
    Api.sign(way).then(function (data) {
      Store.modal('签到成功', [
        ['方式', data.way === 'card' ? '幸运卡签到' : '普通签到'],
        ['金币', Fmt.num(data.coin)],
        ['经验', data.exp],
        ['当前等级', 'Lv.' + data.level],
        ['连续签到', data.streak + ' 天']
      ], [['收下', null, true]]);
      return reload();
    }).catch(function (err) {
      Store.toast(err.message, true);
    });
  }

  // 每分钟轻量刷新一次，让停车计时与阶段提示跟着走
  function startTicker() {
    setInterval(function () {
      if (ticking) {
        return;
      }
      ticking = true;
      reload().then(function () {
        ticking = false;
      }, function () {
        ticking = false;
      });
    }, 60000);
  }

  Store.onPaint(paintTop);

  global.App = {
    reload: reload,
    goto: goto,
    parkTo: parkTo
  };

  bindNav();
  bindTopActions();

  ensureIdentity().then(function () {
    return reload();
  }).then(function () {
    startTicker();
  }).catch(function (err) {
    // 首次进入就连不上服务时给一句明确提示，而不是静默停在空页面
    Store.toast(err && err.message ? err.message : '暂时连不上服务，请稍后重试', true);
  });
})(window);
