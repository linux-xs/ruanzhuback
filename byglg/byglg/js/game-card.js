/**
 * 游戏卡片组件
 * 负责渲染单个游戏卡片和处理点击事件
 */

const { COLORS, LAYOUT } = require('./config.js');

class GameCard {
  constructor(config, index) {
    this.id = config.id;
    this.name = config.name;
    this.iconPath = config.icon;
    this.adType = config.adType;
    this.energyCost = config.energyCost || 0;
    this.adCount = config.adCount || { current: 0, max: 2 };
    this.description = config.description || '';
    this.hasSideBar = config.hasSideBar || false;
    
    // 位置和尺寸（将在渲染时计算）
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    
    // 图标缓存
    this.icon = null;
    this.iconLoaded = false;
    
    // 索引用于计算位置
    this.index = index;
  }

  /**
   * 设置卡片位置和尺寸
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  setBounds(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * 加载图标
   */
  loadIcon() {
    if (this.iconLoaded) return;
    
    this.icon = tt.createImage();
    this.icon.src = this.iconPath;
    this.icon.onload = () => {
      this.iconLoaded = true;
    };
    this.icon.onerror = () => {
      console.error('图标加载失败:', this.iconPath);
      this.iconLoaded = false;
    };
  }

  /**
   * 渲染卡片
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  render(ctx) {
    const { x, y, width, height } = this;
    const radius = LAYOUT.cardRadius;

    // 绘制卡片背景
    ctx.fillStyle = COLORS.bgCard;
    this.roundRect(ctx, x, y, width, height, radius);
    ctx.fill();

    // 绘制卡片边框
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, width, height, radius);
    ctx.stroke();

    // 绘制图标区域
    const iconSize = width * 0.6;
    const iconX = x + (width - iconSize) / 2;
    const iconY = y + height * 0.15;

    ctx.fillStyle = '#FFFFFF';
    this.roundRect(ctx, iconX, iconY, iconSize, iconSize, 10);
    ctx.fill();

    // 绘制图标
    if (this.iconLoaded && this.icon) {
      ctx.drawImage(this.icon, iconX + 5, iconY + 5, iconSize - 10, iconSize - 10);
    } else {
      // 绘制占位符
      ctx.fillStyle = '#CCCCCC';
      ctx.font = `${iconSize * 0.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', iconX + iconSize / 2, iconY + iconSize / 2);
    }

    // 绘制游戏名称
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = `bold ${width * 0.14}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.name, x + width / 2, y + height * 0.75);

    // 绘制广告标识
    this.renderAdBadge(ctx);

    // 绘制描述（如果有）
    if (this.description) {
      ctx.fillStyle = COLORS.textSecondary;
      ctx.font = `${width * 0.1}px Arial`;
      ctx.fillText(this.description, x + width / 2, y + height * 0.88);
    }
  }

  /**
   * 渲染广告标识
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  renderAdBadge(ctx) {
    const { x, y, width, height } = this;
    const badgeSize = width * 0.12;
    const badgeX = x + width - badgeSize - 5;
    const badgeY = y + 5;

    if (this.adType === 'energy') {
      // 体力消耗标识
      ctx.fillStyle = COLORS.energy;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${badgeSize * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⚡${this.energyCost}`, badgeX + badgeSize / 2, badgeY + badgeSize / 2);
    } else if (this.adType === 'free') {
      // 免广告标识
      ctx.fillStyle = COLORS.adFree;
      this.roundRect(ctx, badgeX, badgeY, badgeSize * 2.5, badgeSize, badgeSize / 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${badgeSize * 0.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('免广告', badgeX + badgeSize * 1.25, badgeY + badgeSize / 2);
    } else if (this.adType === 'video') {
      // 视频广告标识
      ctx.fillStyle = COLORS.ad;
      ctx.beginPath();
      ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${badgeSize * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▶', badgeX + badgeSize / 2, badgeY + badgeSize / 2);
    }

    // 绘制侧边栏标识
    if (this.hasSideBar) {
      const sideBarX = x + width - 5;
      const sideBarY = y + height / 2;
      ctx.fillStyle = '#FF9800';
      ctx.font = `bold ${width * 0.1}px Arial`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('侧边栏', sideBarX, sideBarY);
    }
  }

  /**
   * 绘制圆角矩形
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   */
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

  /**
   * 检查坐标是否在卡片内
   * @param {number} touchX - 触摸X坐标
   * @param {number} touchY - 触摸Y坐标
   * @returns {boolean} 是否在卡片内
   */
  contains(touchX, touchY) {
    return touchX >= this.x && touchX <= this.x + this.width &&
           touchY >= this.y && touchY <= this.y + this.height;
  }
}

module.exports = GameCard;
