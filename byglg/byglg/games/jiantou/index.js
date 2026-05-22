/**
 * 箭头消消消游戏
 * 点击相同方向的箭头进行消除
 */

class JiantouGame {
  constructor(canvas, ctx, systemInfo, onBack) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.systemInfo = systemInfo;
    this.onBack = onBack;
    
    this.gridSize = 6;
    this.statusBarHeight = this.systemInfo.statusBarHeight || 20;
    this.navBarHeight = 44;
    this.topBarHeight = this.statusBarHeight + this.navBarHeight;
    
    const bottomPadding = 40;
    const availableHeight = this.systemInfo.windowHeight - this.topBarHeight - bottomPadding;
    const availableWidth = this.systemInfo.windowWidth - 20;
    this.cellSize = Math.min(availableWidth / this.gridSize, availableHeight / this.gridSize);
    this.offsetX = (this.systemInfo.windowWidth - this.gridSize * this.cellSize) / 2;
    this.offsetY = this.topBarHeight + (availableHeight - this.gridSize * this.cellSize) / 2;
    
    this.arrows = ['↑', '↓', '←', '→', '↖', '↗'];
    this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    this.grid = [];
    this.score = 0;
    this.level = 1;
    this.targetScore = 100;
    this.selected = null;
    
    this.initGrid();
    this.bindEvents();
  }

  initGrid() {
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = Math.floor(Math.random() * this.arrows.length);
      }
    }
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
      
      if (col >= 0 && col < self.gridSize && row >= 0 && row < self.gridSize) {
        self.handleClick(row, col);
      }
    });
  }

  handleClick(row, col) {
    if (this.selected) {
      const { row: sr, col: sc } = this.selected;
      
      if (sr === row && sc === col) {
        this.selected = null;
      } else if (this.grid[sr][sc] === this.grid[row][col]) {
        // 检查是否相邻
        if (Math.abs(sr - row) + Math.abs(sc - col) === 1) {
          this.grid[sr][sc] = -1;
          this.grid[row][col] = -1;
          this.score += 10;
          this.fillEmpty();
          if (this.score >= this.targetScore) {
            this.levelUp();
          }
        }
        this.selected = null;
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
    this.targetScore = this.level * 100;
    tt.showToast({ title: `第${this.level}关!`, icon: 'success' });
    this.initGrid();
    this.selected = null;
  }

  fillEmpty() {
    for (let j = 0; j < this.gridSize; j++) {
      let emptyCount = 0;
      for (let i = this.gridSize - 1; i >= 0; i--) {
        if (this.grid[i][j] === -1) {
          emptyCount++;
        } else if (emptyCount > 0) {
          this.grid[i + emptyCount][j] = this.grid[i][j];
          this.grid[i][j] = -1;
        }
      }
      for (let i = 0; i < emptyCount; i++) {
        this.grid[i][j] = Math.floor(Math.random() * this.arrows.length);
      }
    }
  }

  render() {
    const { ctx, canvas } = this;
    
    ctx.fillStyle = '#E8F5E9';
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
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`第${this.level}关`, canvas.width / 2 - 60, btnY);
    ctx.fillText(`分数: ${this.score}`, canvas.width / 2 + 60, btnY);
    
    // 进度条
    const progressWidth = 100;
    const progressHeight = 6;
    const progressX = canvas.width / 2 - progressWidth / 2;
    const progressY = btnY + 15;
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(progressX, progressY, progressWidth * Math.min(1, this.score / this.targetScore), progressHeight);
    
    // 绘制箭头
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + j * this.cellSize;
        const y = this.offsetY + i * this.cellSize;
        
        if (this.grid[i][j] === -1) continue;
        
        // 选中效果
        if (this.selected && this.selected.row === i && this.selected.col === j) {
          ctx.fillStyle = 'rgba(76,175,80,0.3)';
          ctx.fillRect(x - 3, y - 3, this.cellSize + 6, this.cellSize + 6);
        }
        
        // 箭头背景
        ctx.fillStyle = this.colors[this.grid[i][j]];
        this.roundRect(ctx, x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 8);
        ctx.fill();
        
        // 箭头文字
        ctx.fillStyle = '#FFF';
        ctx.font = `${this.cellSize * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.arrows[this.grid[i][j]], x + this.cellSize / 2, y + this.cellSize / 2);
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

module.exports = JiantouGame;
