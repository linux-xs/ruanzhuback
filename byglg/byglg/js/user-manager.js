/**
 * 用户管理模块
 * 处理用户信息、体力系统、免广告次数等
 */

const storage = require('./storage.js');
const { ENERGY_CONFIG, STORAGE_KEYS } = require('./config.js');

class UserManager {
  constructor() {
    this.userInfo = null;
    this.energy = null;
    this.freeAdQuota = {};
  }

  /**
   * 初始化用户数据
   * @param {string} openid - 用户openid
   * @returns {object} 用户数据
   */
  initUser(openid) {
    // 检查是否已有用户数据
    this.userInfo = storage.getUserInfo();
    
    if (!this.userInfo) {
      // 新用户初始化
      this.userInfo = {
        userId: openid || 'guest_' + Date.now(),
        nickName: '新玩家',
        avatarUrl: '',
        createTime: Date.now(),
        lastLoginTime: Date.now(),
        totalGamesPlayed: 0,
        totalAdsWatched: 0,
        isNewUser: true
      };
      storage.setUserInfo(this.userInfo);
      
      // 初始化体力
      this.initEnergy();
      
      // 初始化免广告次数
      this.initFreeAdQuota();
    } else {
      // 老用户更新登录时间
      this.userInfo.lastLoginTime = Date.now();
      this.userInfo.isNewUser = false;
      storage.setUserInfo(this.userInfo);
      
      // 加载体力数据
      this.energy = storage.getEnergy();
      this.recoverEnergy();
      
      // 加载免广告次数
      this.freeAdQuota = storage.getFreeAdQuota();
      this.checkAndResetFreeAdQuota();
    }
    
    return this.getUserData();
  }

  /**
   * 初始化体力
   */
  initEnergy() {
    this.energy = {
      current: ENERGY_CONFIG.max,
      max: ENERGY_CONFIG.max,
      lastRecoverTime: Date.now(),
      recoverInterval: ENERGY_CONFIG.recoverInterval,
      recoverAmount: ENERGY_CONFIG.recoverAmount
    };
    storage.setEnergy(this.energy);
  }

  /**
   * 恢复体力
   * @returns {object} 恢复后的体力数据
   */
  recoverEnergy() {
    if (!this.energy) return this.energy;
    
    const now = Date.now();
    const lastRecover = this.energy.lastRecoverTime;
    const interval = this.energy.recoverInterval * 1000;
    const elapsed = now - lastRecover;
    
    // 计算恢复次数
    const recoverTimes = Math.floor(elapsed / interval);
    
    if (recoverTimes > 0) {
      const recoverAmount = recoverTimes * this.energy.recoverAmount;
      const newEnergy = Math.min(
        this.energy.current + recoverAmount,
        this.energy.max
      );
      
      this.energy.current = newEnergy;
      this.energy.lastRecoverTime = lastRecover + recoverTimes * interval;
      storage.setEnergy(this.energy);
    }
    
    return this.energy;
  }

  /**
   * 消耗体力
   * @param {number} amount - 消耗数量
   * @returns {boolean} 是否成功
   */
  consumeEnergy(amount) {
    if (!this.energy || this.energy.current < amount) {
      return false;
    }
    
    this.energy.current -= amount;
    storage.setEnergy(this.energy);
    return true;
  }

  /**
   * 获取体力恢复倒计时
   * @returns {string} 倒计时字符串 (mm:ss)
   */
  getEnergyRecoverTimer() {
    if (!this.energy) return '00:00';
    
    if (this.energy.current >= this.energy.max) {
      return '已满';
    }
    
    const now = Date.now();
    const lastRecover = this.energy.lastRecoverTime;
    const interval = this.energy.recoverInterval * 1000;
    const nextRecover = lastRecover + interval;
    const remaining = Math.max(0, nextRecover - now);
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  /**
   * 初始化免广告次数
   */
  initFreeAdQuota() {
    const { GAMES_CONFIG } = require('./config.js');
    const today = new Date().toDateString();
    
    GAMES_CONFIG.forEach(game => {
      if (game.adType === 'free' || game.adType === 'video') {
        this.freeAdQuota[game.id] = {
          freeCount: 0,
          maxFreeCount: game.adCount ? game.adCount.max : 2,
          resetDate: today
        };
      }
    });
    
    storage.setFreeAdQuota(this.freeAdQuota);
  }

  /**
   * 检查并重置免广告次数
   */
  checkAndResetFreeAdQuota() {
    const today = new Date().toDateString();
    let needUpdate = false;
    
    for (const gameId in this.freeAdQuota) {
      if (this.freeAdQuota[gameId].resetDate !== today) {
        this.freeAdQuota[gameId].freeCount = 0;
        this.freeAdQuota[gameId].resetDate = today;
        needUpdate = true;
      }
    }
    
    if (needUpdate) {
      storage.setFreeAdQuota(this.freeAdQuota);
    }
  }

  /**
   * 使用免广告次数
   * @param {string} gameId - 游戏ID
   * @returns {boolean} 是否成功
   */
  useFreeAd(gameId) {
    if (!this.freeAdQuota[gameId]) return false;
    
    const quota = this.freeAdQuota[gameId];
    if (quota.freeCount >= quota.maxFreeCount) {
      return false;
    }
    
    quota.freeCount++;
    storage.updateFreeAdQuota(gameId, quota);
    return true;
  }

  /**
   * 获取免广告剩余次数
   * @param {string} gameId - 游戏ID
   * @returns {object} 免广告次数信息
   */
  getFreeAdRemaining(gameId) {
    if (!this.freeAdQuota[gameId]) {
      return { remaining: 0, max: 0 };
    }
    
    const quota = this.freeAdQuota[gameId];
    return {
      remaining: quota.maxFreeCount - quota.freeCount,
      max: quota.maxFreeCount,
      used: quota.freeCount
    };
  }

  /**
   * 更新游戏进度
   * @param {string} gameId - 游戏ID
   * @param {object} progress - 进度数据
   */
  updateGameProgress(gameId, progress) {
    storage.updateGameProgress(gameId, progress);
    
    // 更新总游戏次数
    if (this.userInfo) {
      this.userInfo.totalGamesPlayed++;
      storage.setUserInfo(this.userInfo);
    }
  }

  /**
   * 获取用户数据
   * @returns {object} 用户数据
   */
  getUserData() {
    return {
      userInfo: this.userInfo,
      energy: this.energy,
      freeAdQuota: this.freeAdQuota
    };
  }

  /**
   * 更新用户信息
   * @param {object} info - 用户信息
   */
  updateUserInfo(info) {
    this.userInfo = { ...this.userInfo, ...info };
    storage.setUserInfo(this.userInfo);
  }
}

// 导出单例
module.exports = new UserManager();
