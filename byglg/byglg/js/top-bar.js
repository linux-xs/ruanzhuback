letpz = require('./config.js');
letysb = pz.COLORS;
letbj = pz.LAYOUT;

class DingBuZhuangTaiLan {
  constructor() {
    this.zuoBiaoX = 0;
    this.zuoBiaoY = 0;
    this.kuanDu = 0;
    
    let gd = bj.topBarHeight;
    this.gaoDu = gd;
    
    this.anNiuJiHe = {};
    
    let sz = {};
    sz.x = 0;
    sz.y = 0;
    sz.w = 0;
    sz.h = 0;
    sz.t = 'SheZhi';
    this.anNiuJiHe.sheZhi = sz;
    
    let ph = {};
    ph.x = 0;
    ph.y = 0;
    ph.w = 0;
    ph.h = 0;
    ph.t = 'PaiHang';
    this.anNiuJiHe.paiHang = ph;
    
    let yh = {};
    yh.x = 0;
    yh.y = 0;
    yh.w = 0;
    yh.h = 0;
    yh.t = '';
    this.anNiuJiHe.yongHu = yh;
    
    let gd2 = {};
    gd2.x = 0;
    gd2.y = 0;
    gd2.w = 0;
    gd2.h = 0;
    gd2.t = '...';
    this.anNiuJiHe.gengDuo = gd2;
    
    this.tiLiQuYu = {};
    this.tiLiQuYu.x = 0;
    this.tiLiQuYu.y = 0;
    this.tiLiQuYu.w = 0;
    this.tiLiQuYu.h = 0;
    
    this.tuBiaoDuiXiang = {};
    this.tuBiaoDuiXiang.sheZhi = null;
    this.tuBiaoDuiXiang.paiHang = null;
    this.tuBiaoDuiXiang.tiLi = null;
    
    this.shiFouYiJiaZai = false;
  }

  sheZhiFanWei(x, y, k) {
    let nx = x;
    this.zuoBiaoX = nx;
    
    let ny = y;
    this.zuoBiaoY = ny;
    
    let nk = k;
    this.kuanDu = nk;
    
    this.zhongXinJiSuan();
  }

  zhongXinJiSuan() {
    let x = this.zuoBiaoX;
    let y = this.zuoBiaoY;
    let k = this.kuanDu;
    let g = this.gaoDu;
    
    let bianJu = 10;
    let anNiuDaXiao = g * 0.6;
    
    let szX = x + bianJu;
    let szY = y + ((g - anNiuDaXiao) / 2);
    this.anNiuJiHe.sheZhi.x = szX;
    this.anNiuJiHe.sheZhi.y = szY;
    this.anNiuJiHe.sheZhi.w = anNiuDaXiao;
    this.anNiuJiHe.sheZhi.h = anNiuDaXiao;
    
    let phX = x + (bianJu * 2) + anNiuDaXiao;
    let phY = y + ((g - anNiuDaXiao) / 2);
    this.anNiuJiHe.paiHang.x = phX;
    this.anNiuJiHe.paiHang.y = phY;
    this.anNiuJiHe.paiHang.w = (anNiuDaXiao * 2);
    this.anNiuJiHe.paiHang.h = anNiuDaXiao;
    
    let gdX = x + k - bianJu - anNiuDaXiao;
    let gdY = y + ((g - anNiuDaXiao) / 2);
    this.anNiuJiHe.gengDuo.x = gdX;
    this.anNiuJiHe.gengDuo.y = gdY;
    this.anNiuJiHe.gengDuo.w = anNiuDaXiao;
    this.anNiuJiHe.gengDuo.h = anNiuDaXiao;
    
    let yhX = x + k - (bianJu * 2) - (anNiuDaXiao * 2);
    let yhY = y + ((g - anNiuDaXiao) / 2);
    this.anNiuJiHe.yongHu.x = yhX;
    this.anNiuJiHe.yongHu.y = yhY;
    this.anNiuJiHe.yongHu.w = anNiuDaXiao;
    this.anNiuJiHe.yongHu.h = anNiuDaXiao;
    
    let tlX = x + bianJu;
    let tlY = y + (g * 0.6);
    let tlW = k * 0.4;
    let tlH = g * 0.35;
    this.tiLiQuYu.x = tlX;
    this.tiLiQuYu.y = tlY;
    this.tiLiQuYu.w = tlW;
    this.tiLiQuYu.h = tlH;
  }
}
module.exports = DingBuZhuangTaiLan;