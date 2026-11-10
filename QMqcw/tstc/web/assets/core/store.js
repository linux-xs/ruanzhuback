/* 前端状态中心：一份数据 + 一组渲染回调。
   任何一次接口返回都只改 state，然后调用 refresh() 让各视图自己重画，
   视图之间不互相调用，避免数据流变成一团乱麻 */
(function (global) {
  'use strict';

  var state = {
    me: null,
    vehicles: [],
    lots: [],
    feed: [],
    bonds: [],
    recommend: [],
    catalog: [],
    bondKind: 'friend'
  };

  var painters = [];
  var toastTimer = 0;

  function onPaint(fn) {
    painters.push(fn);
  }

  function refresh() {
    for (var i = 0; i < painters.length; i++) {
      try {
        painters[i](state);
      } catch (err) {
        // 单个视图渲染失败不应该拖垮整页
        if (global.console) {
          console.error('视图渲染出错', err);
        }
      }
    }
  }

  function patch(next) {
    for (var key in next) {
      if (Object.prototype.hasOwnProperty.call(next, key)) {
        state[key] = next[key];
      }
    }
  }

  function get(key) {
    return state[key];
  }

  // 轻提示：默认 2 秒后自动消失
  function toast(text, bad) {
    var box = document.getElementById('toast');
    if (!box) {
      return;
    }
    box.textContent = text;
    box.className = bad ? 'toast bad' : 'toast';
    box.hidden = false;
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      box.hidden = true;
      toastTimer = 0;
    }, bad ? 3200 : 2000);
  }

  // 弹窗：rows 是 [标签, 值] 的数组，actions 是 [文案, 回调, 是否主按钮]
  function modal(title, rows, actions) {
    var mask = document.getElementById('modalMask');
    var head = document.getElementById('modalTitle');
    var body = document.getElementById('modalBody');
    var foot = document.getElementById('modalFoot');
    if (!mask || !head || !body || !foot) {
      return;
    }
    head.textContent = title;
    body.innerHTML = rows.map(function (pair) {
      return '<div class="kv"><span>' + global.Fmt.esc(pair[0]) + '</span><b>' +
        global.Fmt.esc(pair[1]) + '</b></div>';
    }).join('');

    foot.innerHTML = '';
    (actions || []).forEach(function (action) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn ' + (action[2] ? 'solid' : 'ghost');
      btn.textContent = action[0];
      btn.addEventListener('click', function () {
        closeModal();
        if (typeof action[1] === 'function') {
          action[1]();
        }
      });
      foot.appendChild(btn);
    });
    mask.hidden = false;
  }

  function closeModal() {
    var mask = document.getElementById('modalMask');
    if (mask) {
      mask.hidden = true;
    }
  }

  global.Store = {
    onPaint: onPaint,
    refresh: refresh,
    patch: patch,
    get: get,
    toast: toast,
    modal: modal,
    closeModal: closeModal
  };

  // 点击遮罩关闭弹窗，点内容区不关闭
  document.addEventListener('click', function (ev) {
    if (ev.target && ev.target.id === 'modalMask') {
      closeModal();
    }
  });
})(window);
