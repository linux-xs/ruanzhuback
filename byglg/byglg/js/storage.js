/**
 * 存储管理模块
 * 封装本地存储的读写操作
 */

const { STORAGE_KEYS } = require('./config.js');

class StorageManager {
  constructor() {
    this.prefix = 'douyin_game_';
  }

  /**
   * 获取存储数据
   * @param {string} key - 存储键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 存储的数据
   */
  get(key, defaultValue = null) {
    try {
      const fullKey = this.prefix + key;
      const data = tt.getStorageSync(fullKey);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  }

  /**
   * 设置存储数据
   * @param {string} key - 存储键名
   * @param {*} value - 要存储的数据
   * @returns {boolean} 是否成功
   */
  set(key, value) {
    try {
      const fullKey = this.prefix + key;
      tt.setStorageSync(fullKey, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  }

  /**
   * 删除存储数据
   * @param {string} key - 存储键名
   * @returns {boolean} 是否成功
   */
  remove(key) {
    try {
      const fullKey = this.prefix + key;
      tt.removeStorageSync(fullKey);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  }

  /**
   * 清空所有存储
   * @returns {boolean} 是否成功
   */
  clear() {
    try {
      tt.clearStorageSync();
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  }

  // 用户信息相关方法
  getUserInfo() {
    return this.get(STORAGE_KEYS.USER_INFO);
  }

  setUserInfo(userInfo) {
    return this.set(STORAGE_KEYS.USER_INFO, userInfo);
  }

  // 体力相关方法
  getEnergy() {
    return this.get(STORAGE_KEYS.ENERGY);
  }

  setEnergy(energy) {
    return this.set(STORAGE_KEYS.ENERGY, energy);
  }

  // 游戏进度相关方法
  getGameProgress() {
    return this.get(STORAGE_KEYS.GAME_PROGRESS, {});
  }

  setGameProgress(progress) {
    return this.set(STORAGE_KEYS.GAME_PROGRESS, progress);
  }

  getGameProgressById(gameId) {
    const allProgress = this.getGameProgress();
    return allProgress[gameId] || null;
  }

  updateGameProgress(gameId, progress) {
    const allProgress = this.getGameProgress();
    allProgress[gameId] = { ...allProgress[gameId], ...progress, lastPlayTime: Date.now() };
    return this.setGameProgress(allProgress);
  }

  // 免广告次数相关方法
  getFreeAdQuota() {
    return this.get(STORAGE_KEYS.FREE_AD_QUOTA, {});
  }

  setFreeAdQuota(quota) {
    return this.set(STORAGE_KEYS.FREE_AD_QUOTA, quota);
  }

  getFreeAdQuotaById(gameId) {
    const allQuota = this.getFreeAdQuota();
    return allQuota[gameId] || null;
  }

  updateFreeAdQuota(gameId, quota) {
    const allQuota = this.getFreeAdQuota();
    allQuota[gameId] = { ...allQuota[gameId], ...quota };
    return this.setFreeAdQuota(allQuota);
  }

  // 广告记录相关方法
  getAdRecords() {
    return this.get(STORAGE_KEYS.AD_RECORDS, []);
  }

  setAdRecords(records) {
    return this.set(STORAGE_KEYS.AD_RECORDS, records);
  }

  addAdRecord(record) {
    const records = this.getAdRecords();
    records.push({ ...record, watchTime: Date.now() });
    return this.setAdRecords(records);
  }

  // 设置相关方法
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, {
      musicEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      notificationEnabled: true
    });
  }

  setSettings(settings) {
    return this.set(STORAGE_KEYS.SETTINGS, settings);
  }
}

// 导出单例
module.exports = new StorageManager();
