/**
 * 灵魂碎片游戏
 * 点击碎片进行拼图还原
 */

class LinghunGame {
  constructor(canvas, ctx, systemInfo, onBack) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.systemInfo = systemInfo;
    this.onBack = onBack;
    
    this.gridSize = 4;
    this.statusBarHeight = this.systemInfo.statusBarHeight || 20;
    this.navBarHeight = 44;
    this.topBarHeight = this.statusBarHeight + this.navBarHeight;
    
    const bottomPadding = 40;
    const availableHeight = this.systemInfo.windowHeight - this.topBarHeight - bottomPadding;
    const availableWidth = this.systemInfo.windowWidth - 20;
    this.cellSize = Math.min(availableWidth / this.gridSize, availableHeight / this.gridSize);
    this.offsetX = (this.systemInfo.windowWidth - this.gridSize * this.cellSize) / 2;
    this.offsetY = this.topBarHeight + (availableHeight - this.gridSize * this.cellSize) / 2;
    
    this.colors = ['#E94560', '#0F3460', '#16213E', '#1A1A2E', '#533483', '#E94560', '#0F3460', '#16213E'];
    this.grid = [];
    this.emptyPos = { row: this.gridSize - 1, col: this.gridSize - 1 };
    this.moves = 0;
    this.level = 1;
    this.score = 0;
    this.bestMoves = 999;
    
    this.initGrid();
    this.shuffle();
    this.bindEvents();
  }

  initGrid() {
    let num = 1;
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        if (i === this.gridSize - 1 && j === this.gridSize - 1) {
          this.grid[i][j] = 0;
        } else {
          this.grid[i][j] = num++;
        }
      }
    }
  }

  shuffle() {
    for (let i = 0; i < 100; i++) {
      const neighbors = this.getNeighbors(this.emptyPos.row, this.emptyPos.col);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      this.swap(this.emptyPos.row, this.emptyPos.col, randomNeighbor.row, randomNeighbor.col);
      this.emptyPos = randomNeighbor;
    }
    this.moves = 0;
  }

  getNeighbors(row, col) {
    const neighbors = [];
    if (row > 0) neighbors.push({ row: row - 1, col });
    if (row < this.gridSize - 1) neighbors.push({ row: row + 1, col });
    if (col > 0) neighbors.push({ row, col: col - 1 });
    if (col < this.gridSize - 1) neighbors.push({ row, col: col + 1 });
    return neighbors;
  }

  swap(r1, c1, r2, c2) {
    const temp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = temp;
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
    // 检查是否与空位相邻
    if (Math.abs(row - this.emptyPos.row) + Math.abs(col - this.emptyPos.col) === 1) {
      this.swap(row, col, this.emptyPos.row, this.emptyPos.col);
      this.emptyPos = { row, col };
      this.moves++;
      this.render();
      
      // 检查是否完成
      if (this.checkWin()) {
        this.score += Math.max(10, 100 - this.moves);
        if (this.moves < this.bestMoves) {
          this.bestMoves = this.moves;
        }
        setTimeout(() => {
          tt.showToast({ title: `恭喜完成! 用了${this.moves}步`, icon: 'success' });
          this.levelUp();
        }, 100);
      }
    }
  }

  levelUp() {
    this.level++;
    tt.showToast({ title: `第${this.level}关!`, icon: 'success' });
    this.initGrid();
    this.shuffle();
  }

  checkWin() {
    let num = 1;
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (i === this.gridSize - 1 && j === this.gridSize - 1) {
          return this.grid[i][j] === 0;
        }
        if (this.grid[i][j] !== num++) return false;
      }
    }
    return true;
  }

  render() {
    const { ctx, canvas } = this;
    
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
    
    // 显示关卡、步数和分数
    ctx.fillStyle = '#FFF';
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
        
        if (this.grid[i][j] === 0) {
          // 空位
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          this.roundRect(ctx, x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 8);
          ctx.fill();
          continue;
        }
        
        // 方块
        const colorIdx = (this.grid[i][j] - 1) % this.colors.length;
        ctx.fillStyle = this.colors[colorIdx];
        this.roundRect(ctx, x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 8);
        ctx.fill();
        
        // 数字
        ctx.fillStyle = '#FFF';
        ctx.font = `bold ${this.cellSize * 0.35}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.grid[i][j], x + this.cellSize / 2, y + this.cellSize / 2);
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

module.exports = LinghunGame;
