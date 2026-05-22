/* ============ 全民抢车位 - 主交互逻辑 ============ */

/* 当前页面全局状态 */
var currentTab = "tabHome";
var currentSubTab = "friends";
// 后端接口地址(前端用假数据，接口调用代码注释)
// var API_BASE = "http://127.0.0.1:8081/api";

/* ============================== 初始化 ============================== */
document.addEventListener("DOMContentLoaded", function() {
  bindTopBar();
  bindNavTabs();
  bindSubTabs();
  bindSearch();
  bindSignButtons();
  bindGetLuckyCard();
  renderAll();
});

/* ============================== 顶部状态栏 ============================== */
function bindTopBar() {
  document.getElementById("topNickname").textContent = MOCK_PLAYER.nickname;
  document.getElementById("topLevel").textContent = "Lv." + MOCK_PLAYER.level;
  document.getElementById("topGold").textContent = fmtGold(MOCK_PLAYER.gold);
  document.getElementById("topLuckyCard").textContent = MOCK_PLAYER.lucky_card;
}

function updateTopBar() {
  document.getElementById("topGold").textContent = fmtGold(MOCK_PLAYER.gold);
  document.getElementById("topLuckyCard").textContent = MOCK_PLAYER.lucky_card;
}

function bindGetLuckyCard() {
  document.getElementById("btnGetLucky").addEventListener("click", function() {
    if (MOCK_PLAYER.daily_ad_count >= 10) {
      showToast("今日广告次数已用完(10/10)");
      return;
    }
    MOCK_PLAYER.daily_ad_count++;
    MOCK_PLAYER.lucky_card++;
    updateTopBar();
    showToast("观看广告完成！幸运卡 +1，今日已看" + MOCK_PLAYER.daily_ad_count + "/10");
  });
}

/* ============================== 底部导航 ============================== */
function bindNavTabs() {
  var navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      var tabId = this.getAttribute("data-tab");
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  currentTab = tabId;
  // 切换页面
  document.querySelectorAll(".tab-page").forEach(function(p) { p.classList.remove("active"); });
  var targetPage = document.getElementById(tabId);
  if (targetPage) targetPage.classList.add("active");
  // 切换导航样式
  document.querySelectorAll(".nav-btn").forEach(function(b) { b.classList.remove("active"); });
  var navBtn = document.querySelector('[data-tab="' + tabId + '"]');
  if (navBtn) navBtn.classList.add("active");
  // 渲染对应页面
  renderTab(tabId);
}

function renderTab(tabId) {
  switch (tabId) {
    case "tabHome": renderHome(); break;
    case "tabGarage": renderGarage(); break;
    case "tabSpace": renderSpace(); break;
    case "tabContact": renderContact(); break;
    case "tabShop": renderShop(); break;
  }
}

/* ============================== 渲染所有 ============================== */
function renderAll() {
  renderHome();
}

/* ============================== 首页 ============================== */
function renderHome() {
  renderHomeCars();
  renderHomeSpaces();
  renderHomeVisitors();
}

function renderHomeCars() {
  var container = document.getElementById("homeCarList");
  var idle = 0, parking = 0;
  MOCK_MY_CARS.forEach(function(c) {
    if (c.status === 0) idle++; else parking++;
  });
  document.getElementById("carSummary").textContent = MOCK_MY_CARS.length + "/" + Math.min(MOCK_PLAYER.level, 10) + " 辆";

  var html = "";
  MOCK_MY_CARS.forEach(function(c) {
    html += '<div class="car-mini-item">';
    html += '<span class="car-icon">' + getCarIcon(c.car_level) + '</span>';
    html += '<span>' + c.car_name + '</span>';
    if (c.status === 0) {
      html += '<span class="status-idle">● 空闲</span>';
    } else {
      html += '<span class="status-parking">● 停车中</span>';
    }
    html += '</div>';
  });
  container.innerHTML = html;
}

function renderHomeSpaces() {
  var container = document.getElementById("homeSpaceList");
  var free = 0, occupied = 0;
  MOCK_MY_SPACES.forEach(function(s) {
    if (s.status === 0) free++; else occupied++;
  });
  document.getElementById("spaceSummary").textContent = MOCK_MY_SPACES.length + "/" + Math.min(MOCK_PLAYER.level, 10) + " 个";

  var html = "";
  MOCK_MY_SPACES.forEach(function(s) {
    html += '<div class="space-mini-item">';
    html += '<span class="space-icon">🅿️</span>';
    html += '<span>车位' + s.slot_index + '</span>';
    if (s.status === 0) {
      html += '<span class="status-empty">空闲</span>';
    } else {
      html += '<span class="status-occupied">被占</span>';
    }
    html += '</div>';
  });
  container.innerHTML = html;
}

function renderHomeVisitors() {
  var container = document.getElementById("homeVisitorList");
  var html = "";
  MOCK_VISITOR_LOGS.slice(0, 5).forEach(function(v) {
    html += '<div class="visitor-item">';
    html += '<div class="visitor-left">';
    html += '<span class="visitor-name">' + v.visitor_name + '</span> ';
    html += '<span class="visitor-event">' + v.event_text + '</span>';
    html += '</div>';
    html += '<div class="visitor-right">';
    html += '<span class="visitor-time">' + v.time + '</span>';
    html += '<div class="visitor-actions">';
    html += '<span class="btn-mini friend" onclick="quickAddFriend(' + v.visitor_id + ')">加好友</span>';
    html += '<span class="btn-mini enemy" onclick="quickAddEnemy(' + v.visitor_id + ')">标仇人</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  });
  container.innerHTML = html;
}

/* ============================== 车库页 ============================== */
function renderGarage() {
  var container = document.getElementById("garageCarList");
  document.getElementById("garageInfo").textContent = "共" + MOCK_MY_CARS.length + "辆车 | 可拥有 " + Math.min(MOCK_PLAYER.level, 10) + " 辆";

  var html = "";
  MOCK_MY_CARS.forEach(function(c) {
    var cfg = getCarConfig(c.car_level);
    var rateText = "";
    var hostInfo = "";
    var isParking = c.status === 1;

    if (isParking) {
      var parkHost = c.park_host || "?";
      var r = getRateText(MOCK_PLAYER.level, parkHost === "大佬李" ? 68 : parkHost === "小明哥" ? 22 : 30);
      rateText = r.text;
      hostInfo = "停在: " + parkHost + " 家";
    }

    html += '<div class="car-card">';
    html += '<div class="car-card-left">';
    html += '<span class="car-card-icon">' + getCarIcon(c.car_level) + '</span>';
    html += '<div class="car-card-info">';
    html += '<h4>' + c.car_name + ' <span class="car-status-tag ' + (isParking ? "parking" : "idle") + '">' + (isParking ? "停车中" : "空闲") + '</span></h4>';
    html += '<div class="car-stats">产出: ' + (cfg ? cfg.output_per_hour : "?") + '金币/时 | 回收: ' + fmtGold(c.sell_price) + '</div>';
    if (isParking) {
      html += '<div class="car-rate">' + rateText + ' | ' + hostInfo + ' | ' + getPhaseText(c.park_start) + '</div>';
    }
    html += '</div>';
    html += '</div>';
    html += '<div class="car-card-right">';
    if (!isParking) {
      html += '<button class="btn btn-park" onclick="doParkCar(' + c.id + ')">一键停车</button>';
      html += '<button class="btn btn-sell" onclick="doSellCar(' + c.id + ')">出售</button>';
    } else {
      var phase = getTimePhase(c.park_start);
      // 召回按钮: 阶段1禁用，阶段2+可用
      html += '<button class="btn btn-recall" ' + (phase === 1 ? "disabled" : "") + ' onclick="doRecallCar(' + c.id + ')">' + (phase === 1 ? "锁定中" : "召回") + '</button>';
      // 幸运卡秒结
      if (MOCK_PLAYER.lucky_card > 0) {
        html += '<button class="btn btn-lucky-settle" onclick="doLuckySettle(' + c.id + ')">🎫秒结</button>';
      } else {
        html += '<button class="btn btn-lucky-settle" disabled>🎫不足</button>';
      }
    }
    html += '</div>';
    html += '</div>';
  });
  container.innerHTML = html;
}

/* ============================== 车位页 ============================== */
function renderSpace() {
  renderMySpaceGrid();
  renderParkedOnMe();
}

function renderMySpaceGrid() {
  var container = document.getElementById("mySpaceGrid");
  var html = "";
  MOCK_MY_SPACES.forEach(function(s) {
    html += '<div class="space-box ' + (s.status === 0 ? "empty" : "occupied") + '">';
    html += '<div class="space-num">🅿️</div>';
    html += '<div class="space-label">车位 ' + s.slot_index + '</div>';
    if (s.status === 0) {
      html += '<div class="space-status free">空闲</div>';
    } else {
      html += '<div class="space-status busy">被 ' + s.occupied_by + ' 占用</div>';
      html += '<div style="font-size:10px;color:#888;margin-top:2px;">车辆: ' + s.occupied_car + '</div>';
    }
    html += '</div>';
  });
  container.innerHTML = html;
}

function renderParkedOnMe() {
  var container = document.getElementById("parkedOnMeList");
  var parkedSpaces = MOCK_MY_SPACES.filter(function(s) { return s.status === 1; });

  if (parkedSpaces.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无车辆停在你家</div>';
    return;
  }

  var html = "";
  parkedSpaces.forEach(function(s) {
    var phase = getTimePhase(s.occupied_start);
    var canTicket = phase >= 3; // 杀戮时刻才能贴条
    html += '<div class="parked-item">';
    html += '<div>';
    html += '<div style="color:#fff;font-size:13px;">' + s.occupied_by + ' 的 ' + s.occupied_car + '</div>';
    html += '<div class="countdown">' + getPhaseText(s.occupied_start) + '</div>';
    html += '</div>';
    html += '<button class="btn-ticket" ' + (!canTicket ? "disabled" : "") + ' onclick="doTicket(' + s.slot_index + ')">' + (canTicket ? "贴罚单" : "未到时间") + '</button>';
    html += '</div>';
  });
  container.innerHTML = html;
}

/* ============================== 通讯录 ============================== */
function renderContact() {
  renderFriends();
  renderEnemies();
  renderVisitorLogs();
}

function renderFriends() {
  var container = document.getElementById("friendList");
  var html = "";
  MOCK_FRIENDS.forEach(function(f) {
    html += '<div class="contact-item">';
    html += '<div class="contact-left">';
    html += '<div class="contact-avatar">👤</div>';
    html += '<div class="contact-info">';
    html += '<h4>' + f.nickname + ' <span style="color:#ffd700;font-size:11px;">Lv.' + f.level + '</span></h4>';
    html += '<div class="contact-detail">车位: ' + f.free_spaces + '/' + f.total_spaces + ' 空闲 | 倍率: ' + getRateText(MOCK_PLAYER.level, f.level).text + '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="contact-right">';
    html += '<button class="btn btn-park" ' + (f.free_spaces === 0 ? "disabled" : "") + ' onclick="doTargetPark(' + f.id + ')">去停车</button>';
    html += '</div>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function renderEnemies() {
  var container = document.getElementById("enemyList");
  if (MOCK_ENEMIES.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">暂无仇人</div>';
    return;
  }
  var html = "";
  MOCK_ENEMIES.forEach(function(e) {
    html += '<div class="contact-item">';
    html += '<div class="contact-left">';
    html += '<div class="contact-avatar">💀</div>';
    html += '<div class="contact-info">';
    html += '<h4>' + e.nickname + ' <span style="color:#e94560;font-size:11px;">Lv.' + e.level + '</span></h4>';
    html += '<div class="contact-detail">仇恨值: ' + e.hate_count + ' | ' + e.last_event + '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="contact-right">';
    html += '<button class="btn btn-park" ' + (e.free_spaces === 0 ? "disabled" : "") + ' onclick="doTargetPark(' + e.id + ')">报仇停车</button>';
    html += '</div>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function renderVisitorLogs() {
  var container = document.getElementById("visitorLogList");
  var html = "";
  MOCK_VISITOR_LOGS.forEach(function(v) {
    html += '<div class="visitor-item">';
    html += '<div class="visitor-left">';
    html += '<span class="visitor-name">' + v.visitor_name + '</span> ';
    html += '<span class="visitor-event">' + v.event_text + '</span>';
    html += '</div>';
    html += '<div class="visitor-right">';
    html += '<span class="visitor-time">' + v.time + '</span>';
    html += '<div class="visitor-actions">';
    html += '<span class="btn-mini friend" onclick="quickAddFriend(' + v.visitor_id + ')">加好友</span>';
    html += '<span class="btn-mini enemy" onclick="quickAddEnemy(' + v.visitor_id + ')">标仇人</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function bindSubTabs() {
  document.querySelectorAll(".sub-tab").forEach(function(tab) {
    tab.addEventListener("click", function() {
      var subtab = this.getAttribute("data-subtab");
      currentSubTab = subtab;
      document.querySelectorAll(".sub-tab").forEach(function(t) { t.classList.remove("active"); });
      this.classList.add("active");
      document.querySelectorAll(".sub-tab-page").forEach(function(p) { p.classList.remove("active"); });
      var pageMap = { friends: "subFriends", enemies: "subEnemies", visitors: "subVisitors" };
      var pageId = pageMap[subtab];
      if (pageId) document.getElementById(pageId).classList.add("active");
    });
  });
}

/* ============================== 图鉴/商店 ============================== */
function renderShop() {
  var container = document.getElementById("catalogList");
  var html = "";
  // 只显示当前等级可购买的
  MOCK_CAR_CONFIGS.forEach(function(cfg) {
    var owned = MOCK_MY_CARS.some(function(mc) { return mc.car_level === cfg.car_level; });
    var canBuy = cfg.car_level <= MOCK_PLAYER.level;
    var locked = cfg.car_level > MOCK_PLAYER.level;

    html += '<div class="catalog-item">';
    html += '<div class="catalog-left">';
    html += '<span class="catalog-icon">' + getCarIcon(cfg.car_level) + '</span>';
    html += '<div class="catalog-info">';
    html += '<h4>Lv.' + cfg.car_level + ' ' + cfg.car_name + (owned ? ' <span style="color:#4ecca3;">(已拥有)</span>' : '') + '</h4>';
    html += '<div class="catalog-output">💰 产出: ' + cfg.output_per_hour + '金币/时 | 满额: ' + fmtGold(cfg.output_full) + '</div>';
    html += '<div class="catalog-price">购买价: ' + fmtGold(cfg.buy_price) + ' | 回收: ' + fmtGold(cfg.sell_price) + '</div>';
    if (locked) {
      html += '<div class="catalog-locked">🔒 需要等级 ' + cfg.car_level + '</div>';
    }
    html += '</div>';
    html += '</div>';
    html += '<div class="catalog-right">';
    if (owned) {
      html += '<span class="btn-owned">已拥有</span>';
    } else if (locked) {
      html += '<button class="btn-buy" disabled>等级不够</button>';
    } else if (MOCK_PLAYER.gold < cfg.buy_price) {
      html += '<button class="btn-buy" disabled>金币不足</button>';
    } else {
      html += '<button class="btn-buy" onclick="doBuyCar(' + cfg.car_level + ')">购买</button>';
    }
    html += '</div>';
    html += '</div>';
  });
  container.innerHTML = html;
}

/* ============================== 搜索玩家 ============================== */
function bindSearch() {
  document.getElementById("btnSearch").addEventListener("click", function() {
    var uid = document.getElementById("searchUid").value.trim().toUpperCase();
    if (!uid) { showToast("请输入玩家ID"); return; }

    // 模拟搜索结果
    var mockResult = {
      id: 99,
      player_uid: uid,
      nickname: "搜索玩家" + uid,
      avatar: "",
      level: Math.floor(Math.random() * 60) + 10,
      free_spaces: Math.floor(Math.random() * 3),
      total_spaces: Math.floor(Math.random() * 5) + 3
    };

    // 如果是已知好友或仇人ID
    for (var i = 0; i < MOCK_FRIENDS.length; i++) {
      if (MOCK_FRIENDS[i].player_uid === uid) { mockResult = MOCK_FRIENDS[i]; break; }
    }
    for (var i = 0; i < MOCK_ENEMIES.length; i++) {
      if (MOCK_ENEMIES[i].player_uid === uid) { mockResult = MOCK_ENEMIES[i]; break; }
    }

    var card = document.getElementById("searchResultCard");
    card.style.display = "block";

    var infoHtml = '<div class="pc-name">' + mockResult.nickname + ' (ID: ' + mockResult.player_uid + ')</div>';
    infoHtml += '<div class="pc-info">等级: Lv.' + mockResult.level + ' | 车位: ' + mockResult.total_spaces + '个(空闲' + (mockResult.free_spaces || 0) + '个)</div>';
    infoHtml += '<div class="pc-info">' + getRateText(MOCK_PLAYER.level, mockResult.level).text + '</div>';
    document.getElementById("searchPlayerCard").innerHTML = infoHtml;

    var actionHtml = '<button class="btn btn-add-friend" onclick="doAddRelation(' + mockResult.id + ', 1)">➕ 加为好友</button>';
    actionHtml += '<button class="btn btn-add-enemy" onclick="doAddRelation(' + mockResult.id + ', 2)">💀 标记仇人</button>';
    document.getElementById("searchPlayerActions").innerHTML = actionHtml;
  });
}

/* ============================== 快捷操作 ============================== */
function quickAddFriend(vid) {
  showToast("已加为好友（模拟）");
}

function quickAddEnemy(vid) {
  showToast("已标记仇人（模拟）");
}

function doAddRelation(targetId, relType) {
  var label = relType === 1 ? "好友" : "仇人";
  showToast("已添加为" + label + "（模拟）");
}

/* ============================== 停车操作 ============================== */
function doParkCar(carId) {
  // api.post("/park/start", { player_id: MOCK_PLAYER.id, car_id: carId })
  var car = MOCK_MY_CARS.find(function(c) { return c.id === carId; });
  if (!car) return;

  // 模拟随机一个车位
  var randomHosts = ["大佬李", "咸鱼陈", "路人乙", "机器人007", "养老周"];
  var randomLevels = [68, 30, 15, 35, 40];
  var idx = Math.floor(Math.random() * randomHosts.length);

  car.status = 1;
  car.park_host = randomHosts[idx];
  car.park_start = new Date().toISOString().replace("T", " ").substring(0, 16);
  car.rate = getRateText(MOCK_PLAYER.level, randomLevels[idx]).rate;

  var cfg = getCarConfig(car.car_level);
  var r = getRateText(MOCK_PLAYER.level, randomLevels[idx]);
  showToast(car.car_name + " 已停入 " + randomHosts[idx] + "(Lv." + randomLevels[idx] + ") 的车位！倍率: " + r.text);
  
  renderAll();
  if (currentTab === "tabGarage") renderGarage();
}

function doRecallCar(carId) {
  var car = MOCK_MY_CARS.find(function(c) { return c.id === carId; });
  if (!car || car.status !== 1) return;

  var phase = getTimePhase(car.park_start);
  if (phase === 1) {
    showToast("锁定期内不可召回");
    return;
  }

  var cfg = getCarConfig(car.car_level);
  var elapsed = calcElapsedMinutes(car.park_start);
  var totalGold = Math.floor(cfg.output_per_hour * (elapsed / 60) * (car.rate || 1));
  var actualGold = Math.floor(totalGold * 0.9);

  car.status = 0;
  car.park_host = null;
  car.park_start = null;
  car.rate = 0;
  MOCK_PLAYER.gold += actualGold;
  updateTopBar();

  showToast("召回成功！获得 " + fmtGold(actualGold) + " 金币（已扣10%）");
  renderAll();
  if (currentTab === "tabGarage") renderGarage();
}

function doLuckySettle(carId) {
  if (MOCK_PLAYER.lucky_card <= 0) {
    showToast("幸运卡不足，请先去首页获取");
    return;
  }

  var car = MOCK_MY_CARS.find(function(c) { return c.id === carId; });
  if (!car || car.status !== 1) return;

  var cfg = getCarConfig(car.car_level);
  var fullGold = cfg.output_full; // 8小时满额

  MOCK_PLAYER.lucky_card--;
  MOCK_PLAYER.gold += fullGold;
  car.status = 0;
  car.park_host = null;
  car.park_start = null;
  car.rate = 0;
  updateTopBar();

  showToast("🎫 幸运卡秒结！获得满额 " + fmtGold(fullGold) + " 金币");
  renderAll();
  if (currentTab === "tabGarage") renderGarage();
}

function doTicket(slotIndex) {
  var space = MOCK_MY_SPACES.find(function(s) { return s.slot_index === slotIndex; });
  if (!space || space.status !== 1) return;

  var phase = getTimePhase(space.occupied_start);
  if (phase < 3) {
    showToast("未到贴条时间(需满2小时)");
    return;
  }

  // 模拟收益计算
  var elapsed = calcElapsedMinutes(space.occupied_start);
  var cfg = getCarConfig(6); // 假设是经济型代步车
  var rate = getRateText(22, MOCK_PLAYER.level).rate;
  var totalGold = Math.floor(cfg.output_per_hour * (elapsed / 60) * rate);
  var ticketGold = Math.floor(totalGold * 0.2);
  var ownerGold = Math.floor(totalGold * 0.8);

  MOCK_PLAYER.gold += ticketGold;
  space.status = 0;
  space.occupied_by = null;
  space.occupied_car = null;
  space.occupied_start = null;
  updateTopBar();

  showToast("贴条成功！获得罚金 " + fmtGold(ticketGold) + " 金币");
  renderSpace();
}

function doTargetPark(targetId) {
  // 通讯录精准停车
  var idleCar = MOCK_MY_CARS.find(function(c) { return c.status === 0; });
  if (!idleCar) {
    showToast("没有空闲车辆");
    return;
  }

  var targetName = "目标玩家";
  for (var i = 0; i < MOCK_FRIENDS.length; i++) {
    if (MOCK_FRIENDS[i].id === targetId) targetName = MOCK_FRIENDS[i].nickname;
  }
  for (var i = 0; i < MOCK_ENEMIES.length; i++) {
    if (MOCK_ENEMIES[i].id === targetId) targetName = MOCK_ENEMIES[i].nickname;
  }

  idleCar.status = 1;
  idleCar.park_host = targetName;
  idleCar.park_start = new Date().toISOString().replace("T", " ").substring(0, 16);
  idleCar.rate = getRateText(MOCK_PLAYER.level, 35).rate;

  showToast(idleCar.car_name + " 已精准停入 " + targetName + " 的车位！");
  renderAll();
  if (currentTab === "tabGarage") renderGarage();
  if (currentTab === "tabContact") renderContact();
}

function doSellCar(carId) {
  var car = MOCK_MY_CARS.find(function(c) { return c.id === carId; });
  if (!car || car.status !== 0) {
    showToast("该车无法出售");
    return;
  }

  var sellPrice = car.sell_price;
  MOCK_PLAYER.gold += sellPrice;
  MOCK_MY_CARS = MOCK_MY_CARS.filter(function(c) { return c.id !== carId; });
  updateTopBar();
  showToast("出售 " + car.car_name + "，回收 " + fmtGold(sellPrice) + " 金币");
  renderAll();
  if (currentTab === "tabGarage") renderGarage();
}

function doBuyCar(carLevel) {
  var cfg = getCarConfig(carLevel);
  if (!cfg) return;
  if (MOCK_PLAYER.gold < cfg.buy_price) {
    showToast("金币不足");
    return;
  }
  if (MOCK_MY_CARS.length >= Math.min(MOCK_PLAYER.level, 10)) {
    showToast("车辆位已满");
    return;
  }

  MOCK_PLAYER.gold -= cfg.buy_price;
  var newCar = {
    id: 200 + MOCK_MY_CARS.length,
    player_id: 1,
    car_level: cfg.car_level,
    car_name: cfg.car_name,
    status: 0,
    output_per_hour: cfg.output_per_hour,
    buy_price: cfg.buy_price,
    sell_price: cfg.sell_price
  };
  MOCK_MY_CARS.push(newCar);
  updateTopBar();
  showToast("购买 " + cfg.car_name + " 成功！花费 " + fmtGold(cfg.buy_price) + " 金币");
  renderAll();
  if (currentTab === "tabShop") renderShop();
  if (currentTab === "tabGarage") renderGarage();
}

/* ============================== 签到 ============================== */
function bindSignButtons() {
  document.getElementById("btnSignNormal").addEventListener("click", function() {
    MOCK_PLAYER.gold += 5000;
    updateTopBar();
    document.getElementById("signStatus").textContent = "已签到";
    document.getElementById("signStatus").style.color = "#4ecca3";
    showToast("普通签到成功！+5,000金币");
    document.getElementById("btnSignNormal").disabled = true;
    document.getElementById("btnSignLucky").disabled = true;
  });

  document.getElementById("btnSignLucky").addEventListener("click", function() {
    if (MOCK_PLAYER.lucky_card <= 0) {
      showToast("幸运卡不足，请先去首页获取");
      return;
    }
    MOCK_PLAYER.lucky_card--;
    MOCK_PLAYER.gold += 50000;
    updateTopBar();
    document.getElementById("signStatus").textContent = "已签到(豪华)";
    document.getElementById("signStatus").style.color = "#ffd700";
    showToast("🎫 幸运卡签到成功！+50,000金币");
    document.getElementById("btnSignNormal").disabled = true;
    document.getElementById("btnSignLucky").disabled = true;
  });
}

/* ============================== 工具函数 ============================== */
function showToast(msg) {
  var toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function() {
    toast.classList.remove("show");
  }, 2000);
}

// 关闭车辆详情弹窗（预留）
function closeCarDetail() {
  document.getElementById("carDetailModal").classList.remove("show");
}
