/* 接口层：统一拼地址、带身份、拆信封。
   服务端返回 { ok, data, error }，这里把 error 变成抛出异常，
   让调用方只写 try/catch，不必到处判断 ok 字段 */
(function (global) {
  'use strict';

  var prefix = '/api/v1';
  var playerUID = '';

  function setUid(uid) {
    playerUID = uid || '';
  }

  function getUid() {
    return playerUID;
  }

  // 错误对象带上 code，界面可据此做分支（例如 no_card 引导去领卡）
  function ApiError(code, text, status) {
    this.name = 'ApiError';
    this.code = code || 'unknown';
    this.message = text || '请求失败';
    this.status = status || 0;
  }
  ApiError.prototype = Object.create(Error.prototype);

  function request(method, path, body) {
    var headers = { 'Accept': 'application/json' };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (playerUID) {
      headers['X-Player-UID'] = playerUID;
    }
    return fetch(prefix + path, {
      method: method,
      headers: headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () {
        throw new ApiError('bad_json', '服务返回的内容无法解析', res.status);
      }).then(function (payload) {
        if (!payload) {
          throw new ApiError('empty', '服务没有返回内容', res.status);
        }
        if (payload.ok) {
          return payload.data;
        }
        var err = payload.error || {};
        throw new ApiError(err.code, err.text, res.status);
      });
    }, function () {
      throw new ApiError('offline', '网络不太顺畅，稍后再试');
    });
  }

  function get(path) {
    return request('GET', path);
  }

  function post(path, body) {
    return request('POST', path, body === undefined ? {} : body);
  }

  global.Api = {
    setUid: setUid,
    getUid: getUid,
    ApiError: ApiError,

    register: function (nick) {
      return post('/register', { nick: nick || '' });
    },
    me: function () {
      return get('/me');
    },
    rename: function (nick) {
      return request('PATCH', '/me', { nick: nick });
    },
    sign: function (way) {
      return post('/me/sign', { way: way });
    },
    claimCard: function () {
      return post('/me/cards');
    },
    vehicles: function () {
      return get('/vehicles');
    },
    buy: function (level) {
      return post('/vehicles', { level: level });
    },
    sell: function (id) {
      return post('/vehicles/' + id + '/sell');
    },
    park: function (id, targetUID) {
      return post('/vehicles/' + id + '/park', { target_uid: targetUID || '' });
    },
    recall: function (id) {
      return post('/vehicles/' + id + '/recall');
    },
    cardSettle: function (id) {
      return post('/vehicles/' + id + '/card');
    },
    lots: function () {
      return get('/lots');
    },
    ticket: function (vehicleId) {
      return post('/lots/' + vehicleId + '/ticket');
    },
    bonds: function (kind) {
      return get('/bonds?kind=' + encodeURIComponent(kind));
    },
    mark: function (targetUID, kind) {
      return post('/bonds', { target_uid: targetUID, kind: kind });
    },
    feed: function (hours) {
      return get('/feed?hours=' + (hours || 24));
    },
    recommend: function () {
      return get('/recommend');
    },
    search: function (uid) {
      return get('/players/' + encodeURIComponent(uid));
    },
    catalog: function () {
      return get('/catalog');
    }
  };
})(window);
