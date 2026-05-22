/**
 * 广告管理模块
 * 处理激励视频广告和免广告逻辑
 */

class AdManager {
  constructor() {
    this.videoAd = null;
    this.adUnitId = '';  // 需要在抖音开发者后台配置
    this.isLoaded = false;
    this.callbacks = {};
  }

  /**
   * 初始化广告
   * @param {string} adUnitId - 广告位ID
   */
  init(adUnitId) {
    this.adUnitId = adUnitId;
    
    if (tt.createRewardedVideoAd) {
      this.videoAd = tt.createRewardedVideoAd({ adUnitId: this.adUnitId });
      
      // 监听广告加载成功
      this.videoAd.onLoad(() => {
        this.isLoaded = true;
        console.log('激励视频广告加载成功');
      });
      
      // 监听广告加载失败
      this.videoAd.onError((err) => {
        this.isLoaded = false;
        console.error('激励视频广告加载失败:', err);
      });
      
      // 监听广告关闭
      this.videoAd.onClose((res) => {
        this.isLoaded = false;
        this.handleAdClose(res);
      });
    }
  }

  /**
   * 显示广告
   * @param {string} gameId - 游戏ID
   * @param {function} onSuccess - 成功回调
   * @param {function} onFail - 失败回调
   */
  showAd(gameId, onSuccess, onFail) {
    if (!this.videoAd) {
      console.warn('广告未初始化');
      if (onFail) onFail({ errMsg: '广告未初始化' });
      return;
    }

    // 保存回调
    this.callbacks[gameId] = { onSuccess, onFail };

    // 显示广告
    this.videoAd.show().catch(() => {
      // 如果显示失败，尝试重新加载
      this.videoAd.load()
        .then(() => this.videoAd.show())
        .catch((err) => {
          console.error('广告显示失败:', err);
          if (onFail) onFail(err);
        });
    });
  }

  /**
   * 处理广告关闭
   * @param {object} res - 关闭事件参数
   */
  handleAdClose(res) {
    // 获取最后一个请求的游戏ID
    const gameId = Object.keys(this.callbacks).pop();
    const callbacks = this.callbacks[gameId];
    
    if (!callbacks) return;
    
    // 清除回调
    delete this.callbacks[gameId];
    
    if (res && res.isEnded) {
      // 用户完整观看了广告
      console.log('用户完整观看了广告');
      if (callbacks.onSuccess) callbacks.onSuccess({ isCompleted: true });
    } else {
      // 用户提前关闭了广告
      console.log('用户提前关闭了广告');
      if (callbacks.onFail) callbacks.onFail({ isCompleted: false, errMsg: '用户提前关闭广告' });
    }
  }

  /**
   * 预加载广告
   */
  preloadAd() {
    if (this.videoAd) {
      this.videoAd.load().catch((err) => {
        console.error('广告预加载失败:', err);
      });
    }
  }

  /**
   * 检查广告是否可用
   * @returns {boolean} 是否可用
   */
  isAdAvailable() {
    return this.videoAd !== null;
  }
}

// 导出单例
module.exports = new AdManager();
