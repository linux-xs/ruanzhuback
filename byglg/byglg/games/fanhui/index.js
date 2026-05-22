/**
 * 图返原游戏
 * 点击翻转方块，让所有方块变成同一颜色
 */

class FanhuiGame {
  constructor(canvas, ctx, systemInfo, onBack) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.systemInfo = systemInfo;
    this.onBack = onBack;
    
    this.gridSize = 5;
    this.statusBarHeight = this.systemInfo.statusBarHeight || 20;
    this.navBarHeight = 44;
    this.topBarHeight = this.statusBarHeight + this.navBarHeight;
    
    const bottomPadding = 40;
    const availableHeight = this.systemInfo.windowHeight - this.topBarHeight - bottomPadding;
    const availableWidth = this.systemInfo.windowWidth - 20;
    this.cellSize = Math.min(availableWidth / this.gridSize, availableHeight / this.gridSize);
    this.offsetX = (this.systemInfo.windowWidth - this.gridSize * this.cellSize) / 2;
    this.offsetY = this.topBarHeight + (availableHeight - this.gridSize * this.cellSize) / 2;
    
    this.colors = ['#BB8FCE', '#FFFFFF'];
    this.grid = [];
    this.moves = 0;
    this.level = 1;
    this.score = 0;
    this.bestMoves = 999;
    
    this.initGrid();
    this.bindEvents();
  }

  initGrid() {
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = Math.random() > 0.5 ? 1 : 0;
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
    // 翻转点击的方块和相邻方块
    this.flip(row, col);
    if (row > 0) this.flip(row - 1, col);
    if (row < this.gridSize - 1) this.flip(row + 1, col);
    if (col > 0) this.flip(row, col - 1);
    if (col < this.gridSize - 1) this.flip(row, col + 1);
    
    this.moves++;
    this.render();
    
    if (this.checkWin()) {
      this.score += Math.max(10, 100 - this.moves);
      if (this.moves < this.bestMoves) {
        this.bestMoves = this.moves;
      }
      setTimeout(() => {
        tt.showToast({ title: `恭喜通关! 用了${this.moves}步`, icon: 'success' });
        this.levelUp();
      }, 100);
    }
  }

  levelUp() {
    this.level++;
    tt.showToast({ title: `第${this.level}关!`, icon: 'success' });
    this.initGrid();
    this.moves = 0;
  }

  flip(row, col) {
    this.grid[row][col] = this.grid[row][col] === 0 ? 1 : 0;
  }

  checkWin() {
    const first = this.grid[0][0];
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] !== first) return false;
      }
    }
    return true;
  }

  render() {
    const { ctx, canvas } = this;
    
    ctx.fillStyle = '#FFEBEE';
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
    
    // 显示关卡、步数和分数
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`第${this.level}关`, canvas.width / 2 - 80, btnY);
    ctx.fillText(`步数: ${this.moves}`, canvas.width / 2, btnY);
    ctx.fillText(`分数: ${this.score}`, canvas.width / 2 + 80, btnY);
    
    // 绘制方块
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + j * this.cellSize;
        const y = this.offsetY + i * this.cellSize;
        
        ctx.fillStyle = this.colors[this.grid[i][j]];
        ctx.strokeStyle = '#BB8FCE';
        ctx.lineWidth = 2;
        this.roundRect(ctx, x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 8);
        ctx.fill();
        ctx.stroke();
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

module.exports = FanhuiGame;
