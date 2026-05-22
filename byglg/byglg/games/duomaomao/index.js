/**
 * 躲猫猫游戏
 * 点击找出隐藏的猫咪
 */

class DuomaomaoGame {
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
    
    this.catEmojis = ['', '🐈', '', '😸', '😻'];
    this.grid = [];
    this.catPositions = [];
    this.found = [];
    this.score = 0;
    this.level = 1;
    this.timeLeft = 30;
    this.gameOver = false;
    
    this.initGame();
    this.bindEvents();
    this.startTimer();
  }

  initGame() {
    // 初始化网格
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = '📦';
      }
    }
    
    // 随机放置猫咪
    this.catPositions = [];
    const catCount = 5;
    while (this.catPositions.length < catCount) {
      const row = Math.floor(Math.random() * this.gridSize);
      const col = Math.floor(Math.random() * this.gridSize);
      if (!this.catPositions.find(p => p.row === row && p.col === col)) {
        this.catPositions.push({ row, col });
        this.grid[row][col] = this.catEmojis[Math.floor(Math.random() * this.catEmojis.length)];
      }
    }
    this.found = [];
  }

  startTimer() {
    const self = this;
    this.timer = setInterval(function() {
      if (self.timeLeft > 0 && !self.gameOver) {
        self.timeLeft--;
        self.render();
      } else if (self.timeLeft === 0) {
        self.gameOver = true;
        self.render();
      }
    }, 1000);
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
      
      if (self.gameOver) return;
      
      const col = Math.floor((x - self.offsetX) / self.cellSize);
      const row = Math.floor((y - self.offsetY) / self.cellSize);
      
      if (col >= 0 && col < self.gridSize && row >= 0 && row < self.gridSize) {
        self.handleClick(row, col);
      }
    });
  }

  handleClick(row, col) {
    const isCat = this.catPositions.find(p => p.row === row && p.col === col);
    
    if (isCat && !this.found.find(f => f.row === row && f.col === col)) {
      this.found.push({ row, col });
      this.score += 20;
      
      if (this.found.length === this.catPositions.length) {
        this.gameOver = true;
        this.score += this.timeLeft * 2; // 时间奖励
        setTimeout(() => {
          tt.showToast({ title: '恭喜找到所有猫咪!', icon: 'success' });
          this.levelUp();
        }, 100);
      }
    }
    this.render();
  }

  levelUp() {
    this.level++;
    this.timeLeft = Math.max(10, 30 - this.level * 2); // 减少时间
    tt.showToast({ title: `第${this.level}关!`, icon: 'success' });
    this.initGame();
    this.gameOver = false;
  }

  render() {
    const { ctx, canvas } = this;
    
    ctx.fillStyle = '#FFF3E0';
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
    
    // 显示关卡、时间和分数
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`第${this.level}关`, canvas.width / 2 - 80, btnY);
    ctx.fillText(`时间: ${this.timeLeft}s`, canvas.width / 2, btnY);
    ctx.fillText(`分数: ${this.score}`, canvas.width / 2 + 80, btnY);
    
    // 绘制网格
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + j * this.cellSize;
        const y = this.offsetY + i * this.cellSize;
        
        const isFound = this.found.find(f => f.row === i && f.col === j);
        
        // 背景
        ctx.fillStyle = isFound ? '#C8E6C9' : '#FFE0B2';
        this.roundRect(ctx, x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 8);
        ctx.fill();
        
        // 内容
        ctx.font = `${this.cellSize * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isFound ? this.grid[i][j] : '', x + this.cellSize / 2, y + this.cellSize / 2);
      }
    }
    
    // 游戏结束
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 30px Arial';
      ctx.fillText(this.found.length === this.catPositions.length ? '恭喜通关!' : '时间到!', canvas.width / 2, canvas.height / 2);
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

module.exports = DuomaomaoGame;
