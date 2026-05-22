/**
 * 连连看游戏
 * 点击两个相同的图案进行消除
 */

class LianliankanGame {
  constructor(canvas, ctx, systemInfo, onBack) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.systemInfo = systemInfo;
    this.onBack = onBack;
    
    this.cols = 8;
    this.rows = 6;
    this.statusBarHeight = this.systemInfo.statusBarHeight || 20;
    this.navBarHeight = 44;
    this.topBarHeight = this.statusBarHeight + this.navBarHeight;
    
    const bottomPadding = 40;
    const availableHeight = this.systemInfo.windowHeight - this.topBarHeight - bottomPadding;
    const availableWidth = this.systemInfo.windowWidth - 20;
    this.cellSize = Math.min(availableWidth / this.cols, availableHeight / this.rows);
    this.offsetX = (this.systemInfo.windowWidth - this.cols * this.cellSize) / 2;
    this.offsetY = this.topBarHeight + (availableHeight - this.rows * this.cellSize) / 2;
    
    this.emojis = ['🍎', '🍊', '🍋', '', '🍉', '🍓', '🍑', '🍒'];
    this.board = [];
    this.selected = null;
    this.score = 0;
    this.level = 1;
    this.pairs = 0;
    
    this.initBoard();
    this.bindEvents();
  }

  initBoard() {
    const totalCells = this.cols * this.rows;
    const pairs = totalCells / 2;
    let values = [];
    
    for (let i = 0; i < pairs; i++) {
      const emoji = this.emojis[i % this.emojis.length];
      values.push(emoji, emoji);
    }
    
    // 打乱
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    
    for (let r = 0; r < this.rows; r++) {
      this.board[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.board[r][c] = values[r * this.cols + c];
      }
    }
    this.pairs = pairs;
  }

  bindEvents() {
    const self = this;
    tt.onTouchStart(function(touch) {
      const x = touch.changedTouches[0].clientX;
      const y = touch.changedTouches[0].clientY;
      
      // 返回按钮 - 使用与渲染相同的按钮位置
      const btnY = self.statusBarHeight + self.navBarHeight / 2;
      const btnRadius = 18;
      const btnX = 30;
      if (x >= btnX - btnRadius && x <= btnX + btnRadius &&
          y >= btnY - btnRadius && y <= btnY + btnRadius) {
        self.onBack();
        return;
      }
      
      const col = Math.floor((x - self.offsetX) / self.cellSize);
      const row = Math.floor((y - self.offsetY) / self.cellSize);
      
      if (col >= 0 && col < self.cols && row >= 0 && row < self.rows && self.board[row][col]) {
        self.handleClick(row, col);
      }
    });
  }

  handleClick(row, col) {
    if (this.selected) {
      const { row: sr, col: sc } = this.selected;
      
      if (sr === row && sc === col) {
        this.selected = null;
      } else if (this.board[sr][sc] === this.board[row][col]) {
        // 匹配成功
        this.board[sr][sc] = null;
        this.board[row][col] = null;
        this.score += 10;
        this.pairs--;
        this.selected = null;
        
        if (this.pairs === 0) {
          setTimeout(() => {
            tt.showToast({ title: '恭喜通关!', icon: 'success' });
            this.levelUp();
          }, 100);
        }
      } else {
        this.selected = { row, col };
      }
    } else {
      this.selected = { row, col };
    }
    this.render();
  }

  levelUp() {
    this.level++;
    this.score += 50;
    tt.showToast({ title: `第${this.level}关!`, icon: 'success' });
    this.initBoard();
    this.selected = null;
  }

  render() {
    const { ctx, canvas } = this;
    
    ctx.fillStyle = '#F3E5F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 返回按钮 - 放在导航栏左侧，与平台按钮同一排
    const btnY = this.statusBarHeight + this.navBarHeight / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.arc(30, btnY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('←', 30, btnY);
    
    // 显示关卡和分数
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`第${this.level}关`, canvas.width / 2 - 60, btnY);
    ctx.fillText(`分数: ${this.score}`, canvas.width / 2 + 60, btnY);
    
    // 绘制方块
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.offsetX + c * this.cellSize;
        const y = this.offsetY + r * this.cellSize;
        
        if (!this.board[r][c]) continue;
        
        // 选中效果
        if (this.selected && this.selected.row === r && this.selected.col === c) {
          ctx.fillStyle = 'rgba(156,39,176,0.3)';
          ctx.fillRect(x - 2, y - 2, this.cellSize + 4, this.cellSize + 4);
        }
        
        // 方块背景
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#CE93D8';
        ctx.lineWidth = 2;
        this.roundRect(ctx, x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 8);
        ctx.fill();
        ctx.stroke();
        
        // 图案
        ctx.font = `${this.cellSize * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.board[r][c], x + this.cellSize / 2, y + this.cellSize / 2);
      }
    }
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
}

module.exports = LianliankanGame;
