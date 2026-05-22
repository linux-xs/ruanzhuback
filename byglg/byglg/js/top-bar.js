/**
 * 顶部状态栏组件
 * 显示设置、排行榜、体力值等信息
 */

const { COLORS, LAYOUT } = require('./config.js');

class TopBar {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = LAYOUT.topBarHeight;
    
    // 按钮区域
    this.buttons = {
      setting: { x: 0, y: 0, width: 0, height: 0, text: '设置' },
      rank: { x: 0, y: 0, width: 0, height: 0, text: '方块排行榜' },
      user: { x: 0, y: 0, width: 0, height: 0, text: '' },
      more: { x: 0, y: 0, width: 0, height: 0, text: '...' }
    };
    
    // 体力显示区域
    this.energyArea = { x: 0, y: 0, width: 0, height: 0 };
    
    // 图标缓存
    this.icons = {
      setting: null,
      rank: null,
      energy: null
    };
    this.iconsLoaded = false;
  }

  /**
   * 设置位置和尺寸
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   */
  setBounds(x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.calculateLayout();
  }

  /**
   * 计算布局
   */
  calculateLayout() {
    const { x, y, width, height } = this;
    const padding = 10;
    const btnSize = height * 0.6;
    
    // 左侧按钮
    this.buttons.setting = {
      x: x + padding,
      y: y + (height - btnSize) / 2,
      width: btnSize,
      height: btnSize
    };
    
    this.buttons.rank = {
      x: x + padding * 2 + btnSize,
      y: y + (height - btnSize) / 2,
      width: btnSize * 2,
      height: btnSize
    };
    
    // 右侧按钮
    this.buttons.more = {
      x: x + width - padding - btnSize,
      y: y + (height - btnSize) / 2,
      width: btnSize,
      height: btnSize
    };
    
    this.buttons.user = {
      x: x + width - padding * 2 - btnSize * 2,
      y: y + (height - btnSize) / 2,
      width: btnSize,
      height: btnSize
    };
    
    // 体力区域
    this.energyArea = {
      x: x + padding,
      y: y + height * 0.6,
      width: width * 0.4,
      height: height * 0.35
    };
  }

  /**
   * 加载图标
   */
  loadIcons() {
    if (this.iconsLoaded) return;
    
    // 设置图标
    this.icons.setting = tt.createImage();
    this.icons.setting.src = 'images/ui/setting.png';
    
    // 排行榜图标
    this.icons.rank = tt.createImage();
    this.icons.rank.src = 'images/ui/rank.png';
    
    // 体力图标
    this.icons.energy = tt.createImage();
    this.icons.energy.src = 'images/ui/energy.png';
    
    this.iconsLoaded = true;
  }

  /**
   * 渲染顶部状态栏
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {object} energyData - 体力数据
   */
  render(ctx, energyData) {
    const { x, y, width, height } = this;
    
    // 绘制背景
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x, y, width, height);
    
    // 绘制左侧按钮
    this.renderButton(ctx, this.buttons.setting, '⚙');
    this.renderButton(ctx, this.buttons.rank, '');
    
    // 绘制右侧按钮
    this.renderButton(ctx, this.buttons.user, '');
    this.renderButton(ctx, this.buttons.more, '···');
    
    // 绘制体力显示
    this.renderEnergy(ctx, energyData);
  }

  /**
   * 渲染按钮
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {object} btn - 按钮区域
   * @param {string} icon - 图标文字
   */
  renderButton(ctx, btn, icon) {
    // 绘制按钮背景
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(btn.x + btn.width / 2, btn.y + btn.height / 2, btn.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制图标
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${btn.width * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, btn.x + btn.width / 2, btn.y + btn.height / 2);
    
    // 绘制文字
    if (btn.text) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${btn.height * 0.3}px Arial`;
      ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height + 10);
    }
  }

  /**
   * 渲染体力显示
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {object} energyData - 体力数据
   */
  renderEnergy(ctx, energyData) {
    const { x, y, width, height } = this.energyArea;
    
    if (!energyData) return;
    
    // 绘制体力图标
    ctx.fillStyle = COLORS.energy;
    ctx.font = `${height * 0.8}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', x, y + height / 2);
    
    // 绘制体力数值
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${height * 0.6}px Arial`;
    ctx.textAlign = 'left';
    const energyText = `${energyData.current}/${energyData.max}`;
    ctx.fillText(energyText, x + height, y + height / 2);
    
    // 绘制加号按钮
    const plusSize = height * 0.7;
    const plusX = x + width - plusSize;
    const plusY = y + (height - plusSize) / 2;
    
    ctx.fillStyle = COLORS.energy;
    ctx.beginPath();
    ctx.arc(plusX + plusSize / 2, plusY + plusSize / 2, plusSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${plusSize * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', plusX + plusSize / 2, plusY + plusSize / 2);
    
    // 绘制倒计时
    if (energyData.timer && energyData.current < energyData.max) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = `${height * 0.4}px Arial`;
      ctx.textAlign = 'left';
      ctx.fillText(energyData.timer, x + height, y + height * 1.5);
    }
  }

  /**
   * 检查坐标是否在按钮内
   * @param {number} touchX - 触摸X坐标
   * @param {number} touchY - 触摸Y坐标
   * @returns {string|null} 按钮ID或null
   */
  getButtonAt(touchX, touchY) {
    for (const [id, btn] of Object.entries(this.buttons)) {
      if (touchX >= btn.x && touchX <= btn.x + btn.width &&
          touchY >= btn.y && touchY <= btn.y + btn.height) {
        return id;
      }
    }
    
    // 检查体力加号按钮
    const { x, y, width, height } = this.energyArea;
    const plusSize = height * 0.7;
    const plusX = x + width - plusSize;
    const plusY = y + (height - plusSize) / 2;
    
    if (touchX >= plusX && touchX <= plusX + plusSize &&
        touchY >= plusY && touchY <= plusY + plusSize) {
      return 'energyPlus';
    }
    
    return null;
  }
}

module.exports = TopBar;
