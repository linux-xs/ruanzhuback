/**
 * 游戏大厅主模块
 */

const { GAMES_CONFIG, COLORS, LAYOUT, ENERGY_CONFIG } = require('./config.js');
const Storage = require('./storage.js');

class GameHall {
  constructor(gameModules) {
    this.gameModules = gameModules;
    this.canvas = null;
    this.ctx = null;
    this.systemInfo = null;
    this.gameCards = [];
    this.buttons = {};
    this.currentScene = 'hall'; // 'hall', 'game', 'settings', 'leaderboard'
    this.currentGame = null;
    this.scrollY = 0;
    this.maxScroll = 0;
    this.isScrolling = false;
    
    // 体力系统
    this.energy = ENERGY_CONFIG.max;
    this.lastRecoverTime = Date.now();
    this.energyTimer = null;
    
    // 设置
    this.settings = {
      theme: 'purple', // 'purple', 'blue', 'green'
      musicEnabled: true,
      soundEnabled: true
    };
    
    // 排行榜数据
    this.leaderboardData = [
      { rank: 1, name: '玩家1', score: 9999, avatar: '👑' },
      { rank: 2, name: '玩家2', score: 8888, avatar: '🥈' },
      { rank: 3, name: '玩家3', score: 7777, avatar: '🥉' },
      { rank: 4, name: '玩家4', score: 6666, avatar: '🎮' },
      { rank: 5, name: '玩家5', score: 5555, avatar: '🎮' },
      { rank: 6, name: '玩家6', score: 4444, avatar: '🎮' },
      { rank: 7, name: '玩家7', score: 3333, avatar: '🎮' },
      { rank: 8, name: '玩家8', score: 2222, avatar: '🎮' },
      { rank: 9, name: '玩家9', score: 1111, avatar: '🎮' },
      { rank: 10, name: '玩家10', score: 1000, avatar: '🎮' }
    ];
    
    // 设置页面按钮
    this.settingsButtons = {};
    this.leaderboardScroll = 0;
  }

  init() {
    console.log('大厅初始化开始');
    this.systemInfo = tt.getSystemInfoSync();
    this.canvas = tt.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.systemInfo.windowWidth;
    this.canvas.height = this.systemInfo.windowHeight;
    
    // 初始化体力系统
    this.initEnergy();
    
    this.initLayout();
    this.bindEvents();
    this.startEnergyRecovery();
    this.renderLoop();
    console.log('大厅初始化完成');
  }
  
  /**
   * 初始化体力
   */
  initEnergy() {
    const savedEnergy = Storage.getEnergy();
    if (savedEnergy) {
      this.energy = savedEnergy.current;
      this.lastRecoverTime = savedEnergy.lastRecoverTime || Date.now();
    } else {
      this.energy = ENERGY_CONFIG.max;
      this.lastRecoverTime = Date.now();
      this.saveEnergy();
    }
  }
  
  /**
   * 保存体力数据
   */
  saveEnergy() {
    Storage.setEnergy({
      current: this.energy,
      lastRecoverTime: this.lastRecoverTime
    });
  }
  
  /**
   * 开始体力恢复计时器
   */
  startEnergyRecovery() {
    const self = this;
    this.energyTimer = setInterval(function() {
      if (self.energy < ENERGY_CONFIG.max) {
        const now = Date.now();
        const elapsed = Math.floor((now - self.lastRecoverTime) / 1000);
        if (elapsed >= ENERGY_CONFIG.recoverInterval) {
          const recoverCount = Math.floor(elapsed / ENERGY_CONFIG.recoverInterval);
          self.energy = Math.min(ENERGY_CONFIG.max, self.energy + recoverCount * ENERGY_CONFIG.recoverAmount);
          self.lastRecoverTime = now;
          self.saveEnergy();
          self.updateEnergyButton();
        }
      }
    }, 1000);
  }
  
  /**
   * 消耗体力
   */
  consumeEnergy(amount) {
    if (this.energy >= amount) {
      this.energy -= amount;
      this.saveEnergy();
      this.updateEnergyButton();
      return true;
    }
    return false;
  }
  
  /**
   * 更新体力按钮显示
   */
  updateEnergyButton() {
    this.buttons.energy.text = `⚡ ${this.energy}/${ENERGY_CONFIG.max}`;
  }

  initLayout() {
    const { windowWidth, windowHeight } = this.systemInfo;
    const { cardMargin, cardHeightRatio, topBarHeight } = LAYOUT;
    
    // 计算卡片尺寸
    const cardWidth = (windowWidth - cardMargin * 3) / 2;
    const cardHeight = cardWidth * cardHeightRatio;
    
    // 创建游戏卡片布局
    this.gameCards = GAMES_CONFIG.map((config, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = cardMargin + col * (cardWidth + cardMargin);
      const y = topBarHeight + 30 + row * (cardHeight + cardMargin);
      
      return {
        ...config,
        x, y, width: cardWidth, height: cardHeight
      };
    });
    
    // 计算最大滚动距离
    const lastCard = this.gameCards[this.gameCards.length - 1];
    this.maxScroll = Math.max(0, lastCard.y + lastCard.height + 20 - windowHeight);
    
    // 顶部按钮 - 使用状态栏高度，与平台按钮同一排
    this.statusBarHeight = this.systemInfo.statusBarHeight || 20;
    this.navBarHeight = 44;
    this.topBarHeight = this.statusBarHeight + this.navBarHeight;
    
    const btnY = this.statusBarHeight + this.navBarHeight / 2;
    const btnSize = 32;
    const btnSpacing = 10;
    
    // 计算按钮总宽度，居中排列
    const totalBtnWidth = btnSize * 2 + btnSpacing;
    const startX = (windowWidth - totalBtnWidth) / 2;
    
    this.buttons = {
      setting: { x: startX, y: btnY, width: btnSize, height: btnSize, text: '⚙️' },
      rank: { x: startX + btnSize + btnSpacing, y: btnY, width: btnSize, height: btnSize, text: '👑' },
      energy: { x: 15, y: btnY, width: 100, height: 28, text: '⚡ 200/200' }
    };
  }

  bindEvents() {
    const self = this;
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartScroll = 0;
    let touchStartTime = 0;
    
    // 触摸开始
    tt.onTouchStart(function(e) {
      const touch = e.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartScroll = self.scrollY;
      touchStartTime = Date.now();
      self.isScrolling = false;
      console.log('触摸开始:', { x: touchStartX, y: touchStartY });
    });
    
    // 触摸移动
    tt.onTouchMove(function(e) {
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = touchStartY - touch.clientY;
      
      // 如果垂直移动距离超过5像素，认为是滚动
      if (Math.abs(deltaY) > 5 && Math.abs(deltaY) > deltaX) {
        self.isScrolling = true;
      }
      
      self.scrollY = Math.max(0, Math.min(self.maxScroll, touchStartScroll + deltaY));
    });
    
    // 触摸结束
    tt.onTouchEnd(function(e) {
      const touch = e.changedTouches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;
      const touchDuration = Date.now() - touchStartTime;
      
      console.log('=== 调试信息 ===');
      console.log('触摸坐标:', { x: touchX, y: touchY });
      console.log('滚动位置:', self.scrollY);
      console.log('是否滚动:', self.isScrolling);
      console.log('触摸时长:', touchDuration);
      
      // 如果是快速点击（不是滚动），处理点击事件
      if (!self.isScrolling && touchDuration < 300) {
        // 计算相对于滚动内容的坐标
        const contentY = touchY + self.scrollY;
        
        console.log('内容坐标:', { x: touchX, y: contentY });
        
        // 检查按钮点击 - 按钮在固定位置（顶部区域）
        for (const [id, btn] of Object.entries(self.buttons)) {
          console.log('检查按钮:', id, btn);
          let clicked = false;
          
          if (id === 'setting' || id === 'rank') {
            // 圆形按钮 - 使用距离检测
            const centerX = btn.x + btn.width / 2;
            const centerY = btn.y; // y 已经是中心点
            const radius = btn.width / 2;
            const distance = Math.sqrt((touchX - centerX) ** 2 + (touchY - centerY) ** 2);
            clicked = distance <= radius;
          } else {
            // 矩形按钮（体力按钮）
            const btnTop = btn.y - btn.height / 2;
            const btnBottom = btn.y + btn.height / 2;
            clicked = touchX >= btn.x && touchX <= btn.x + btn.width &&
                      touchY >= btnTop && touchY <= btnBottom;
          }
          
          if (clicked) {
            console.log('✓ 点击按钮:', id);
            self.handleButton(id);
            return;
          }
        }
        
        // 检查卡片点击 - 使用原始坐标（因为内容坐标已包含滚动偏移）
        for (const card of self.gameCards) {
          const inX = touchX >= card.x && touchX <= card.x + card.width;
          const inY = contentY >= card.y && contentY <= card.y + card.height;
          console.log('检查卡片:', card.name, { x: card.x, y: card.y, w: card.width, h: card.height }, { inX, inY });
          if (inX && inY) {
            console.log('✓ 点击卡片:', card.name);
            self.enterGame(card.id, card.name);
            return;
          }
        }
        
        console.log('✗ 未检测到点击目标');
      } else {
        console.log('✗ 判定为滚动或超时');
      }
    });
  }

  handleButton(id) {
    switch (id) {
      case 'setting':
        this.openSettings();
        break;
      case 'rank':
        this.openLeaderboard();
        break;
      case 'energy':
        tt.showToast({ title: `体力: ${this.energy}/${ENERGY_CONFIG.max}`, icon: 'none' });
        break;
    }
  }
  
  /**
   * 打开设置页面
   */
  openSettings() {
    this.currentScene = 'settings';
    this.settingsButtons = {
      back: { x: 30, y: this.statusBarHeight + 22, width: 40, height: 40, text: '←' },
      theme: { x: 50, y: 150, width: this.systemInfo.windowWidth - 100, height: 60, text: '主题设置' },
      music: { x: 50, y: 230, width: this.systemInfo.windowWidth - 100, height: 60, text: '音乐' },
      sound: { x: 50, y: 310, width: this.systemInfo.windowWidth - 100, height: 60, text: '音效' }
    };
    
    // 清除大厅事件
    tt.offTouchStart();
    tt.offTouchMove();
    tt.offTouchEnd();
    this.bindSettingsEvents();
  }
  
  /**
   * 打开排行榜页面
   */
  openLeaderboard() {
    this.currentScene = 'leaderboard';
    this.leaderboardScroll = 0;
    
    // 清除大厅事件
    tt.offTouchStart();
    tt.offTouchMove();
    tt.offTouchEnd();
    this.bindLeaderboardEvents();
  }
  
  /**
   * 绑定设置页面事件
   */
  bindSettingsEvents() {
    const self = this;
    tt.onTouchStart(function(e) {
      const touch = e.changedTouches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;
      
      // 检查返回按钮
      const backBtn = self.settingsButtons.back;
      if (touchX >= backBtn.x && touchX <= backBtn.x + backBtn.width &&
          touchY >= backBtn.y - backBtn.height / 2 && touchY <= backBtn.y + backBtn.height / 2) {
        self.backToHall();
        return;
      }
      
      // 检查主题设置
      const themeBtn = self.settingsButtons.theme;
      if (touchX >= themeBtn.x && touchX <= themeBtn.x + themeBtn.width &&
          touchY >= themeBtn.y - themeBtn.height / 2 && touchY <= themeBtn.y + themeBtn.height / 2) {
        // 切换主题
        const themes = ['purple', 'blue', 'green'];
        const currentIndex = themes.indexOf(self.settings.theme);
        self.settings.theme = themes[(currentIndex + 1) % themes.length];
        self.saveSettings();
        return;
      }
      
      // 检查音乐按钮
      const musicBtn = self.settingsButtons.music;
      if (touchX >= musicBtn.x && touchX <= musicBtn.x + musicBtn.width &&
          touchY >= musicBtn.y - musicBtn.height / 2 && touchY <= musicBtn.y + musicBtn.height / 2) {
        self.settings.musicEnabled = !self.settings.musicEnabled;
        self.saveSettings();
        return;
      }
      
      // 检查音效按钮
      const soundBtn = self.settingsButtons.sound;
      if (touchX >= soundBtn.x && touchX <= soundBtn.x + soundBtn.width &&
          touchY >= soundBtn.y - soundBtn.height / 2 && touchY <= soundBtn.y + soundBtn.height / 2) {
        self.settings.soundEnabled = !self.settings.soundEnabled;
        self.saveSettings();
        return;
      }
    });
  }
  
  /**
   * 绑定排行榜页面事件
   */
  bindLeaderboardEvents() {
    const self = this;
    let touchStartY = 0;
    let touchStartScroll = 0;
    
    tt.onTouchStart(function(e) {
      const touch = e.changedTouches[0];
      touchStartY = touch.clientY;
      touchStartScroll = self.leaderboardScroll;
    });
    
    tt.onTouchMove(function(e) {
      const touch = e.changedTouches[0];
      const deltaY = touchStartY - touch.clientY;
      self.leaderboardScroll = Math.max(0, Math.min(200, touchStartScroll + deltaY));
    });
    
    tt.onTouchEnd(function(e) {
      const touch = e.changedTouches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;
      
      // 检查返回按钮
      const backBtn = { x: 30, y: self.statusBarHeight + 22, width: 40, height: 40 };
      if (touchX >= backBtn.x && touchX <= backBtn.x + backBtn.width &&
          touchY >= backBtn.y - backBtn.height / 2 && touchY <= backBtn.y + backBtn.height / 2) {
        self.backToHall();
        return;
      }
    });
  }
  
  /**
   * 保存设置
   */
  saveSettings() {
    Storage.setSettings(this.settings);
  }

  enterGame(gameId, gameName) {
    console.log('准备进入游戏:', gameId, gameName);
    
    // 检查体力是否足够
    if (this.energy < ENERGY_CONFIG.costPerGame) {
      tt.showToast({ title: '体力不足，请等待恢复', icon: 'none' });
      return;
    }
    
    this.currentScene = 'game';
    
    // 清除大厅的触摸事件
    tt.offTouchStart();
    tt.offTouchMove();
    tt.offTouchEnd();
    
    // 从预加载的模块中获取游戏
    const GameClass = this.gameModules[gameId];
    if (GameClass) {
      this.currentGame = new GameClass(this.canvas, this.ctx, this.systemInfo, () => {
        this.backToHall();
      });
      
      // 游戏开始时扣除体力
      this.consumeEnergy(ENERGY_CONFIG.costPerGame);
    } else {
      console.error('游戏模块未找到:', gameId);
      tt.showToast({ title: '游戏加载失败', icon: 'none' });
      this.backToHall();
    }
  }
  
  backToHall() {
    console.log('返回大厅');
    this.currentScene = 'hall';
    this.currentGame = null;
    this.scrollY = 0;
    
    // 重新绑定大厅事件
    this.bindEvents();
  }

  renderLoop() {
    this.render();
    const self = this;
    setTimeout(function() {
      self.renderLoop();
    }, 16);
  }

  render() {
    const { ctx, systemInfo } = this;
    
    if (this.currentScene === 'game' && this.currentGame) {
      // 渲染游戏
      this.currentGame.render();
    } else if (this.currentScene === 'settings') {
      // 渲染设置页面
      this.renderSettings();
    } else if (this.currentScene === 'leaderboard') {
      // 渲染排行榜页面
      this.renderLeaderboard();
    } else {
      // 渲染大厅
      this.renderHall();
    }
  }
  
  /**
   * 渲染设置页面
   */
  renderSettings() {
    const { ctx, systemInfo } = this;
    
    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, 0, systemInfo.windowHeight);
    gradient.addColorStop(0, COLORS.bgStart);
    gradient.addColorStop(1, COLORS.bgEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, systemInfo.windowWidth, systemInfo.windowHeight);
    
    // 绘制顶部栏
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 0, systemInfo.windowWidth, this.topBarHeight);
    
    // 绘制返回按钮
    const backBtn = this.settingsButtons.back;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(backBtn.x + backBtn.width / 2, backBtn.y, backBtn.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(backBtn.text, backBtn.x + backBtn.width / 2, backBtn.y);
    
    // 绘制标题
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('设置', systemInfo.windowWidth / 2, this.topBarHeight + 40);
    
    // 绘制主题设置按钮
    const themeBtn = this.settingsButtons.theme;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this.roundRect(ctx, themeBtn.x, themeBtn.y - themeBtn.height / 2, themeBtn.width, themeBtn.height, 12);
    ctx.fill();
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('主题设置', themeBtn.x + 20, themeBtn.y - 8);
    
    // 显示当前主题
    const themeNames = { purple: '紫色', blue: '蓝色', green: '绿色' };
    ctx.fillStyle = COLORS.energy;
    ctx.font = '16px Arial';
    ctx.fillText(`当前: ${themeNames[this.settings.theme]}`, themeBtn.x + 20, themeBtn.y + 16);
    
    // 绘制音乐按钮
    const musicBtn = this.settingsButtons.music;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this.roundRect(ctx, musicBtn.x, musicBtn.y - musicBtn.height / 2, musicBtn.width, musicBtn.height, 12);
    ctx.fill();
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('音乐', musicBtn.x + 20, musicBtn.y - 8);
    ctx.fillStyle = this.settings.musicEnabled ? COLORS.energy : COLORS.textSecondary;
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(this.settings.musicEnabled ? '开启' : '关闭', musicBtn.x + musicBtn.width - 20, musicBtn.y);
    
    // 绘制音效按钮
    const soundBtn = this.settingsButtons.sound;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this.roundRect(ctx, soundBtn.x, soundBtn.y - soundBtn.height / 2, soundBtn.width, soundBtn.height, 12);
    ctx.fill();
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('音效', soundBtn.x + 20, soundBtn.y - 8);
    ctx.fillStyle = this.settings.soundEnabled ? COLORS.energy : COLORS.textSecondary;
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(this.settings.soundEnabled ? '开启' : '关闭', soundBtn.x + soundBtn.width - 20, soundBtn.y);
  }
  
  /**
   * 渲染排行榜页面
   */
  renderLeaderboard() {
    const { ctx, systemInfo } = this;
    
    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, 0, systemInfo.windowHeight);
    gradient.addColorStop(0, COLORS.bgStart);
    gradient.addColorStop(1, COLORS.bgEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, systemInfo.windowWidth, systemInfo.windowHeight);
    
    // 绘制顶部栏
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 0, systemInfo.windowWidth, this.topBarHeight);
    
    // 绘制返回按钮
    const backBtn = { x: 30, y: this.statusBarHeight + 22, width: 40, height: 40 };
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(backBtn.x + backBtn.width / 2, backBtn.y, backBtn.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('←', backBtn.x + backBtn.width / 2, backBtn.y);
    
    // 绘制标题
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('排行榜', systemInfo.windowWidth / 2, this.topBarHeight + 40);
    
    // 绘制排行榜列表
    ctx.save();
    ctx.translate(0, -this.leaderboardScroll);
    
    const startY = this.topBarHeight + 80;
    const itemHeight = 60;
    const itemPadding = 10;
    
    for (let i = 0; i < this.leaderboardData.length; i++) {
      const player = this.leaderboardData[i];
      const y = startY + i * (itemHeight + itemPadding);
      
      // 绘制背景
      ctx.fillStyle = i < 3 ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)';
      this.roundRect(ctx, 20, y, systemInfo.windowWidth - 40, itemHeight, 12);
      ctx.fill();
      
      // 绘制排名
      ctx.fillStyle = COLORS.textWhite;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(player.rank, 50, y + itemHeight / 2);
      
      // 绘制头像
      ctx.font = '28px Arial';
      ctx.fillText(player.avatar, 90, y + itemHeight / 2);
      
      // 绘制名称
      ctx.fillStyle = COLORS.textWhite;
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(player.name, 120, y + itemHeight / 2 - 5);
      
      // 绘制分数
      ctx.fillStyle = COLORS.energy;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(player.score.toString(), systemInfo.windowWidth - 40, y + itemHeight / 2);
    }
    
    ctx.restore();
  }
  
  renderHall() {
    const { ctx, systemInfo } = this;
    
    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, systemInfo.windowHeight);
    gradient.addColorStop(0, COLORS.bgStart);
    gradient.addColorStop(1, COLORS.bgEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, systemInfo.windowWidth, systemInfo.windowHeight);
    
    ctx.save();
    ctx.translate(0, -this.scrollY);
    
    // 绘制装饰圆形
    this.drawDecorations(ctx, systemInfo);
    
    // 绘制顶部栏
    this.drawTopBar(ctx);
    
    // 绘制游戏卡片
    for (const card of this.gameCards) {
      this.drawCard(ctx, card);
    }
    
    ctx.restore();
  }

  drawDecorations(ctx, systemInfo) {
    ctx.globalAlpha = 0.1;
    
    // 左上角大圆
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.fill();
    
    // 右下角大圆
    ctx.beginPath();
    ctx.arc(systemInfo.windowWidth, systemInfo.windowHeight + this.scrollY, 200, 0, Math.PI * 2);
    ctx.fill();
    
    // 中间小圆
    ctx.beginPath();
    ctx.arc(systemInfo.windowWidth * 0.8, 200, 80, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }

  drawTopBar(ctx) {
    const { windowWidth } = this.systemInfo;
    
    // 顶部栏背景 - 使用动态计算的顶部栏高度
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 0, windowWidth, this.topBarHeight);
    
    // 绘制设置按钮 - 圆形
    const settingBtn = this.buttons.setting;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(settingBtn.x + settingBtn.width / 2, settingBtn.y, settingBtn.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(settingBtn.text, settingBtn.x + settingBtn.width / 2, settingBtn.y + 1);
    
    // 绘制排行榜按钮 - 圆形
    const rankBtn = this.buttons.rank;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(rankBtn.x + rankBtn.width / 2, rankBtn.y, rankBtn.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rankBtn.text, rankBtn.x + rankBtn.width / 2, rankBtn.y);
    
    // 绘制体力按钮 - 圆角矩形
    const energyBtn = this.buttons.energy;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    this.roundRect(ctx, energyBtn.x, energyBtn.y - energyBtn.height / 2, energyBtn.width, energyBtn.height, 14);
    ctx.fill();
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(energyBtn.text, energyBtn.x + 8, energyBtn.y);
  }

  drawCard(ctx, card) {
    const { x, y, width, height, color, icon, name } = card;
    
    // 卡片阴影
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    this.roundRect(ctx, x + 3, y + 5, width, height, LAYOUT.cardRadius);
    ctx.fill();
    
    // 卡片背景
    ctx.fillStyle = COLORS.cardBg;
    this.roundRect(ctx, x, y, width, height, LAYOUT.cardRadius);
    ctx.fill();
    
    // 图标区域背景
    const iconSize = width * 0.5;
    const iconX = x + (width - iconSize) / 2;
    const iconY = y + height * 0.12;
    
    // 图标渐变背景
    const iconGradient = ctx.createLinearGradient(iconX, iconY, iconX + iconSize, iconY + iconSize);
    iconGradient.addColorStop(0, color);
    iconGradient.addColorStop(1, this.lightenColor(color, 30));
    ctx.fillStyle = iconGradient;
    this.roundRect(ctx, iconX, iconY, iconSize, iconSize, 12);
    ctx.fill();
    
    // 图标文字
    ctx.font = `${iconSize * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon || '🎮', iconX + iconSize / 2, iconY + iconSize / 2);
    
    // 游戏名称
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `bold ${width * 0.15}px Arial`;
    ctx.fillText(name, x + width / 2, y + height * 0.72);
    
    // 开始游戏按钮
    const btnWidth = width * 0.6;
    const btnHeight = height * 0.12;
    const btnX = x + (width - btnWidth) / 2;
    const btnY = y + height * 0.82;
    
    const btnGradient = ctx.createLinearGradient(btnX, btnY, btnX + btnWidth, btnY);
    btnGradient.addColorStop(0, color);
    btnGradient.addColorStop(1, this.lightenColor(color, 20));
    ctx.fillStyle = btnGradient;
    this.roundRect(ctx, btnX, btnY, btnWidth, btnHeight, btnHeight / 2);
    ctx.fill();
    
    ctx.fillStyle = COLORS.textWhite;
    ctx.font = `bold ${btnHeight * 0.6}px Arial`;
    ctx.fillText('开始游戏', x + width / 2, btnY + btnHeight / 2);
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
}

module.exports = GameHall;
