/**
 * 俄罗斯方块游戏
 */

class EluosiGame {
  constructor(canvas, ctx, systemInfo, onBack) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.systemInfo = systemInfo;
    this.onBack = onBack;
    
    this.cols = 10;
    this.rows = 20;
    this.statusBarHeight = this.systemInfo.statusBarHeight || 20;
    this.navBarHeight = 44;
    this.topBarHeight = this.statusBarHeight + this.navBarHeight;
    
    const bottomPadding = 40;
    const availableHeight = this.systemInfo.windowHeight - this.topBarHeight - bottomPadding;
    const availableWidth = this.systemInfo.windowWidth - 20;
    this.cellSize = Math.min(availableWidth / this.cols, availableHeight / this.rows);
    this.offsetX = (this.systemInfo.windowWidth - this.cols * this.cellSize) / 2;
    this.offsetY = this.topBarHeight + (availableHeight - this.rows * this.cellSize) / 2;
    
    this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.gameOver = false;
    
    this.shapes = [
      [[1,1,1,1]],
      [[1,1],[1,1]],
      [[0,1,0],[1,1,1]],
      [[1,0,0],[1,1,1]],
      [[0,0,1],[1,1,1]],
      [[1,1,0],[0,1,1]],
      [[0,1,1],[1,1,0]]
    ];
    this.colors = ['#00f0f0', '#f0f000', '#a000f0', '#0000f0', '#f0a000', '#00f000', '#f00000'];
    
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;
    this.currentColor = 0;
    
    this.spawnPiece();
    this.bindEvents();
    this.startGameLoop();
  }

  spawnPiece() {
    const idx = Math.floor(Math.random() * this.shapes.length);
    this.currentPiece = this.shapes[idx].map(row => [...row]);
    this.currentColor = this.colors[idx];
    this.currentX = Math.floor((this.cols - this.currentPiece[0].length) / 2);
    this.currentY = 0;
    
    if (this.collides()) {
      this.gameOver = true;
    }
  }

  collides() {
    for (let r = 0; r < this.currentPiece.length; r++) {
      for (let c = 0; c < this.currentPiece[r].length; c++) {
        if (this.currentPiece[r][c]) {
          const newX = this.currentX + c;
          const newY = this.currentY + r;
          if (newX < 0 || newX >= this.cols || newY >= this.rows) return true;
          if (newY >= 0 && this.board[newY][newX]) return true;
        }
      }
    }
    return false;
  }

  merge() {
    for (let r = 0; r < this.currentPiece.length; r++) {
      for (let c = 0; c < this.currentPiece[r].length; c++) {
        if (this.currentPiece[r][c]) {
          this.board[this.currentY + r][this.currentX + c] = this.currentColor;
        }
      }
    }
  }

  clearLines() {
    let linesCleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.board[r].every(cell => cell !== 0)) {
        this.board.splice(r, 1);
        this.board.unshift(Array(this.cols).fill(0));
        linesCleared++;
        r++;
      }
    }
    if (linesCleared > 0) {
      this.score += linesCleared * 100;
      this.linesCleared += linesCleared;
      // 每消除10行升一级
      const newLevel = Math.floor(this.linesCleared / 10) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        tt.showToast({ title: `第${this.level}关!`, icon: 'success' });
        // 加速
        clearInterval(this.gameInterval);
        this.startGameLoop();
      }
    }
  }

  rotate() {
    const rotated = this.currentPiece[0].map((_, i) => 
      this.currentPiece.map(row => row[i]).reverse()
    );
    const oldPiece = this.currentPiece;
    this.currentPiece = rotated;
    if (this.collides()) {
      this.currentPiece = oldPiece;
    }
  }

  moveDown() {
    this.currentY++;
    if (this.collides()) {
      this.currentY--;
      this.merge();
      this.clearLines();
      this.spawnPiece();
    }
  }

  moveLeft() {
    this.currentX--;
    if (this.collides()) this.currentX++;
  }

  moveRight() {
    this.currentX++;
    if (this.collides()) this.currentX--;
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
      
      const centerX = self.systemInfo.windowWidth / 2;
      const centerY = self.systemInfo.windowHeight / 2;
      
      if (y < self.offsetY) {
        self.rotate();
      } else if (x < centerX - 50) {
        self.moveLeft();
      } else if (x > centerX + 50) {
        self.moveRight();
      } else {
        self.moveDown();
      }
      self.render();
    });
  }

  startGameLoop() {
    const self = this;
    const speed = Math.max(100, 500 - (this.level - 1) * 50);
    this.gameInterval = setInterval(function() {
      if (!self.gameOver) {
        self.moveDown();
        self.render();
      }
    }, speed);
  }

  render() {
    const { ctx, canvas } = this;
    
    ctx.fillStyle = '#1A237E';
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
    
    // 显示关卡、分数和行数
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`第${this.level}关`, canvas.width / 2 - 80, btnY);
    ctx.fillText(`分数: ${this.score}`, canvas.width / 2, btnY);
    ctx.fillText(`行数: ${this.linesCleared}`, canvas.width / 2 + 80, btnY);
    
    // 绘制游戏区域边框
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.offsetX, this.offsetY, this.cols * this.cellSize, this.rows * this.cellSize);
    
    // 绘制已固定的方块
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c]) {
          ctx.fillStyle = this.board[r][c];
          ctx.fillRect(this.offsetX + c * this.cellSize + 1, this.offsetY + r * this.cellSize + 1, this.cellSize - 2, this.cellSize - 2);
        }
      }
    }
    
    // 绘制当前方块
    if (this.currentPiece) {
      ctx.fillStyle = this.currentColor;
      for (let r = 0; r < this.currentPiece.length; r++) {
        for (let c = 0; c < this.currentPiece[r].length; c++) {
          if (this.currentPiece[r][c]) {
            ctx.fillRect(
              this.offsetX + (this.currentX + c) * this.cellSize + 1,
              this.offsetY + (this.currentY + r) * this.cellSize + 1,
              this.cellSize - 2, this.cellSize - 2
            );
          }
        }
      }
    }
    
    // 游戏结束
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 30px Arial';
      ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = '20px Arial';
      ctx.fillText(`最终分数: ${this.score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
  }
}

module.exports = EluosiGame;
