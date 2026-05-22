/**
 * 方块消消乐游戏
 * 点击相同颜色的方块进行消除
 */

class FangkuaiGame {
  constructor(canvas, ctx, systemInfo, onBack) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.systemInfo = systemInfo;
    this.onBack = onBack;
    
    this.gridSize = 6;
    // 获取状态栏高度，将按钮放在与平台按钮同一排
    this.statusBarHeight = this.systemInfo.statusBarHeight || 20;
    this.navBarHeight = 44; // 导航栏高度
    this.topBarHeight = this.statusBarHeight + this.navBarHeight;
    
    const bottomPadding = 40;
    const availableHeight = this.systemInfo.windowHeight - this.topBarHeight - bottomPadding;
    const availableWidth = this.systemInfo.windowWidth - 20;
    
    // 根据可用空间计算单元格大小
    this.cellSize = Math.min(availableWidth / this.gridSize, availableHeight / this.gridSize);
    this.offsetX = (this.systemInfo.windowWidth - this.gridSize * this.cellSize) / 2;
    this.offsetY = this.topBarHeight + (availableHeight - this.gridSize * this.cellSize) / 2;
    
    this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    this.grid = [];
    this.score = 0;
    this.level = 1;
    this.targetScore = 100; // 目标分数
    this.selected = null;
    
    this.initGrid();
    this.bindEvents();
  }

  initGrid() {
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = Math.floor(Math.random() * this.colors.length);
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
      // 检测点击是否在返回按钮区域内
      if (x >= btnX - btnRadius && x <= btnX + btnRadius &&
          y >= btnY - btnRadius && y <= btnY + btnRadius) {
        self.onBack();
        return;
      }
      
      // 点击方块
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
      
      // 检查是否相邻
      if (Math.abs(sr - row) + Math.abs(sc - col) === 1) {
        // 交换
        const temp = this.grid[sr][sc];
        this.grid[sr][sc] = this.grid[row][col];
        this.grid[row][col] = temp;
        
        // 检查是否有匹配
        if (this.checkMatch()) {
          this.score += 10;
          this.removeMatched();
          this.fillEmpty();
          
          // 检查是否过关
          if (this.score >= this.targetScore) {
            this.levelUp();
          }
        } else {
          // 换回来
          this.grid[row][col] = this.grid[sr][sc];
          this.grid[sr][sc] = temp;
        }
      }
      this.selected = null;
    } else {
      this.selected = { row, col };
    }
    this.render();
  }

  checkMatch() {
    // 简化：只要有相同颜色相邻就算匹配
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const color = this.grid[i][j];
        if (color === -1) continue;
        
        // 检查右边
        if (j < this.gridSize - 1 && this.grid[i][j + 1] === color) return true;
        // 检查下边
        if (i < this.gridSize - 1 && this.grid[i + 1][j] === color) return true;
      }
    }
    return false;
  }

  removeMatched() {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const color = this.grid[i][j];
        if (color === -1) continue;
        
        let matched = false;
        if (j < this.gridSize - 1 && this.grid[i][j + 1] === color) matched = true;
        if (i < this.gridSize - 1 && this.grid[i + 1][j] === color) matched = true;
        if (j > 0 && this.grid[i][j - 1] === color) matched = true;
        if (i > 0 && this.grid[i - 1][j] === color) matched = true;
        
        if (matched) {
          this.grid[i][j] = -1;
        }
      }
    }
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
        this.grid[i][j] = Math.floor(Math.random() * this.colors.length);
      }
    }
  }

  levelUp() {
    this.level++;
    this.targetScore = this.level * 100;
    tt.showToast({ title: `第${this.level}关!`, icon: 'success' });
    // 重新初始化棋盘
    this.initGrid();
    this.selected = null;
  }

  render() {
    const { ctx, canvas } = this;
    
    // 背景
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 返回按钮 - 放在导航栏左侧，与平台按钮同一排
    const btnY = this.statusBarHeight + this.navBarHeight / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(30, btnY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('←', 30, btnY);
    
    // 显示关卡和分数
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`第${this.level}关`, canvas.width / 2 - 60, btnY);
    ctx.fillText(`分数: ${this.score}`, canvas.width / 2 + 60, btnY);
    
    // 进度条
    const progressWidth = 100;
    const progressHeight = 6;
    const progressX = canvas.width / 2 - progressWidth / 2;
    const progressY = btnY + 15;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(progressX, progressY, progressWidth * Math.min(1, this.score / this.targetScore), progressHeight);
    
    // 绘制方块
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + j * this.cellSize;
        const y = this.offsetY + i * this.cellSize;
        
        if (this.grid[i][j] === -1) continue;
        
        // 选中效果
        if (this.selected && this.selected.row === i && this.selected.col === j) {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(x - 3, y - 3, this.cellSize + 6, this.cellSize + 6);
        }
        
        // 方块
        ctx.fillStyle = this.colors[this.grid[i][j]];
        this.roundRect(ctx, x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 8);
        ctx.fill();
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

module.exports = FangkuaiGame;
