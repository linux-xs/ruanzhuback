/**
 * 停车出库游戏
 * 滑动汽车让红色汽车从出口离开
 */

class TingcheGame {
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
    
    // 关卡布局
    this.levels = [
      // 第1关
      [
        [0, 0, 2, 0, 0, 0],
        [0, 0, 2, 0, 3, 3],
        [1, 1, 0, 0, 0, 0],
        [0, 0, 2, 2, 0, 0],
        [0, 0, 0, 0, 0, 3],
        [0, 0, 0, 0, 0, 0]
      ],
      // 第2关
      [
        [0, 2, 0, 3, 0, 0],
        [0, 2, 0, 3, 0, 0],
        [0, 0, 0, 3, 0, 0],
        [1, 1, 2, 0, 0, 2],
        [0, 0, 0, 0, 3, 0],
        [0, 3, 3, 0, 0, 0]
      ],
      // 第3关
      [
        [0, 0, 3, 0, 2, 0],
        [0, 0, 3, 0, 2, 0],
        [1, 1, 0, 0, 0, 3],
        [0, 2, 2, 3, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [3, 0, 0, 2, 2, 0]
      ]
    ];
    
    this.level = 1;
    this.score = 0;
    this.moves = 0;
    this.selected = null;
    
    this.loadLevel();
    this.bindEvents();
  }
  
  loadLevel() {
    const levelIdx = (this.level - 1) % this.levels.length;
    this.board = this.levels[levelIdx].map(row => [...row]);
    this.moves = 0;
    this.selected = null;
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
      
      if (col >= 0 && col < self.gridSize && row >= 0 && row < self.gridSize && self.board[row][col] !== 0) {
        self.handleClick(row, col);
      }
    });
  }

  handleClick(row, col) {
    const type = this.board[row][col];
    
    if (type === 1) {
      // 红车向右移动
      if (col + 2 < this.gridSize && this.board[row][col + 2] === 0) {
        this.board[row][col + 2] = 1;
        this.board[row][col] = 0;
        this.moves++;
        this.checkWin();
      }
    } else if (type === 2) {
      // 横车左右移动
      if (col > 0 && this.board[row][col - 1] === 0) {
        this.board[row][col - 1] = type;
        this.board[row][col + 1] = 0;
        this.moves++;
      } else if (col + 2 < this.gridSize && this.board[row][col + 2] === 0) {
        this.board[row][col + 2] = type;
        this.board[row][col] = 0;
        this.moves++;
      }
    } else if (type === 3) {
      // 竖车上下移动
      if (row > 0 && this.board[row - 1][col] === 0) {
        this.board[row - 1][col] = type;
        this.board[row + 1][col] = 0;
        this.moves++;
      } else if (row + 2 < this.gridSize && this.board[row + 2][col] === 0) {
        this.board[row + 2][col] = type;
        this.board[row][col] = 0;
        this.moves++;
      }
    }
    this.render();
  }

  checkWin() {
    // 红车到达最右边即胜利
    for (let j = 0; j < this.gridSize; j++) {
      if (this.board[2][j] === 1 && j === this.gridSize - 2) {
        this.score += Math.max(10, 100 - this.moves * 2);
        setTimeout(() => {
          tt.showToast({ title: `恭喜通关! 用了${this.moves}步`, icon: 'success' });
          this.levelUp();
        }, 100);
      }
    }
  }
  
  levelUp() {
    this.level++;
    tt.showToast({ title: `第${this.level}关!`, icon: 'success' });
    this.loadLevel();
  }

  render() {
    const { ctx, canvas } = this;
    
    ctx.fillStyle = '#E0F7FA';
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
    
    // 绘制网格
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + j * this.cellSize;
        const y = this.offsetY + i * this.cellSize;
        
        // 格子背景
        ctx.fillStyle = '#B2EBF2';
        ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        
        const type = this.board[i][j];
        if (type === 0) continue;
        
        // 绘制车辆
        if (type === 1) {
          ctx.fillStyle = '#F44336'; // 红车
        } else if (type === 2) {
          ctx.fillStyle = '#2196F3'; // 横车
        } else {
          ctx.fillStyle = '#4CAF50'; // 竖车
        }
        
        this.roundRect(ctx, x + 3, y + 3, this.cellSize - 6, this.cellSize - 6, 5);
        ctx.fill();
        
        // 车辆标识
        ctx.fillStyle = '#FFF';
        ctx.font = `${this.cellSize * 0.3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(type === 1 ? '★' : '■', x + this.cellSize / 2, y + this.cellSize / 2);
      }
    }
    
    // 出口标记
    ctx.fillStyle = '#FF9800';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('出口→', this.offsetX + this.gridSize * this.cellSize + 5, this.offsetY + 2.5 * this.cellSize);
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

module.exports = TingcheGame;
