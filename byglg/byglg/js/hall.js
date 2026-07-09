let pzwj = require('./config.js');
let yxPz = pzwj.GAMES_CONFIG;
let yB = pzwj.COLORS;
let bJ = pzwj.LAYOUT;
let tL = pzwj.ENERGY_CONFIG;

let ccMk = require('./storage.js');

class YouXiDaTingZhuKong {
  constructor(moKuaiJiHe) {
    let mk = moKuaiJiHe;
    this.youXiMoKuaiBiao = mk;
    
    this.huaBuDuiXiang = null;
    this.huaBiDuiXiang = null;
    this.sheBeiXinXi = null;
    
    this.qiaPianShuZu = [];
    this.kongZhiAnNiu = {};
    
    let cj = 'dating';
    this.dangQianChangJing = cj;
    
    this.zhengZaiWan = null;
    this.gunDongPianYi = 0;
    this.zuiDaGunDong = 0;
    this.shiFouZaiGunDong = false;
    
    let t = tL.max;
    this.wanJiaTiLi = t;
    
    let sj = Date.now();
    this.shangCiHuiFu = sj;
    this.tiLiJiShiQi = null;
    
    this.yongHuSheZhi = {};
    this.yongHuSheZhi.zhuTi = 'ziSe';
    this.yongHuSheZhi.yinYueKai = true;
    this.yongHuSheZhi.yinXiaoKai = true;
    
    this.paiHangShuJu = [];
    for (let i = 0; i < 10; i++) {
      let wj = {};
      wj.mingCi = i + 1;
      wj.mingZi = "WanJia" + (i + 1);
      wj.deFen = 10000 - (i * 1000);
      wj.touXiang = "WJ";
      this.paiHangShuJu.push(wj);
    }
    
    this.sheZhiMianAnNiu = {};
    this.paiHangGunDong = 0;
    
    this.zhuangTaiLanGao = 20;
    this.daoHangLanGao = 44;
    this.zongDingBuGao = 64;
  }

  chuShiHuaDaTing() {
    let xt = tt.getSystemInfoSync();
    this.sheBeiXinXi = xt;
    
    let hb = tt.createCanvas();
    this.huaBuDuiXiang = hb;
    
    let hbCtx = hb.getContext('2d');
    this.huaBiDuiXiang = hbCtx;
    
    let pKuan = this.sheBeiXinXi.windowWidth;
    this.huaBuDuiXiang.width = pKuan;
    
    let pGao = this.sheBeiXinXi.windowHeight;
    this.huaBuDuiXiang.height = pGao;
    
    this.duQuTiLi();
    this.jiSuanDaTingBuJu();
    this.bangDingShiJian();
    this.kaiShiTiLiJiShi();
    this.xunHuanXuanRan();
  }

  duQuTiLi() {
    let cun = ccMk.huoQuTiLiShuJu();
    let panDuan = false;
    if (cun !== null && cun !== undefined) {
      panDuan = true;
    }
    
    if (panDuan === true) {
      let dq = cun.dangQianZhi;
      this.wanJiaTiLi = dq;
      
      let sc = cun.shangCiHuiFu;
      let pd2 = false;
      if (sc !== null && sc !== undefined) {
        pd2 = true;
      }
      if (pd2 === true) {
        this.shangCiHuiFu = sc;
      } else {
        this.shangCiHuiFu = Date.now();
      }
    } else {
      let man = tL.max;
      this.wanJiaTiLi = man;
      this.shangCiHuiFu = Date.now();
      this.baoCunTiLi();
    }
  }

  baoCunTiLi() {
    let bc = {};
    let dq = this.wanJiaTiLi;
    bc.dangQianZhi = dq;
    
    let sc = this.shangCiHuiFu;
    bc.shangCiHuiFu = sc;
    
    ccMk.sheZhiTiLiShuJu(bc);
  }

  kaiShiTiLiJiShi() {
    let zhege = this;
    
    let dingShi = setInterval(function() {
      let dangQianTl = zhege.wanJiaTiLi;
      let shangXian = tL.max;
      
      let xuxyao = false;
      if (dangQianTl < shangXian) {
        xuxyao = true;
      }
      
      if (xuxyao === true) {
        let xianzai = Date.now();
        let qian = zhege.shangCiHuiFu;
        let cha = xianzai - qian;
        let chaMiao = Math.floor(cha / 1000);
        
        let jianGe = tL.recoverInterval;
        let keHuiFu = false;
        if (chaMiao >= jianGe) {
          keHuiFu = true;
        }
        
        if (keHuiFu === true) {
          let cishu = Math.floor(chaMiao / jianGe);
          let liang = tL.recoverAmount;
          let zongHuiFu = cishu * liang;
          
          let yuqi = dangQianTl + zongHuiFu;
          let shiji = yuqi;
          if (yuqi > shangXian) {
            shiji = shangXian;
          }
          
          zhege.wanJiaTiLi = shiji;
          zhege.shangCiHuiFu = xianzai;
          zhege.baoCunTiLi();
          zhege.gengXinTiLiXianShi();
        }
      }
    }, 1000);
    
    this.tiLiJiShiQi = dingShi;
  }

  xiaoHaoWanJiaTiLi(xuYao) {
    let dq = this.wanJiaTiLi;
    let xy = xuYao;
    
    let keYi = false;
    if (dq >= xy) {
      keYi = true;
    }
    
    if (keYi === true) {
      let sy = dq - xy;
      this.wanJiaTiLi = sy;
      this.baoCunTiLi();
      this.gengXinTiLiXianShi();
      return true;
    }
    return false;
  }

  gengXinTiLiXianShi() {
    let anNiu = this.kongZhiAnNiu.tiLi;
    let pd = false;
    if (anNiu !== null && anNiu !== undefined) {
      pd = true;
    }
    
    if (pd === true) {
      let zhi = this.wanJiaTiLi;
      let man = tL.max;
      let w = "TL " + zhi + "/" + man;
      anNiu.wenBen = w;
    }
  }

  jiSuanDaTingBuJu() {
    let s = this.sheBeiXinXi;
    let pk = s.windowWidth;
    let pg = s.windowHeight;
    
    let bj = bJ.cardMargin;
    let bl = bJ.cardHeightRatio;
    let dbg = bJ.topBarHeight;
    
    let sheng = pk - (bj * 3);
    let qk = sheng / 2;
    let qg = qk * bl;
    
    this.qiaPianShuZu = [];
    let yxS = yxPz.length;
    
    for (let m = 0; m < yxS; m++) {
      let p = yxPz[m];
      let hang = Math.floor(m / 2);
      let lie = m % 2;
      
      let xZ = bj + (lie * (qk + bj));
      let yZ = dbg + 30 + (hang * (qg + bj));
      
      let q = {};
      q.id = p.id;
      q.mingZi = p.name;
      q.tuBiao = p.icon;
      q.zuoBiaoX = xZ;
      q.zuoBiaoY = yZ;
      q.kuanDu = qk;
      q.gaoDu = qg;
      
      this.qiaPianShuZu.push(q);
    }
    
    let zuiHou = this.qiaPianShuZu[yxS - 1];
    let d = zuiHou.zuoBiaoY + zuiHou.gaoDu + 20 - pg;
    let zd = d;
    if (d < 0) {
      zd = 0;
    }
    this.zuiDaGunDong = zd;
    
    let sbg = s.statusBarHeight;
    let pd = false;
    if (sbg !== null && sbg !== undefined) {
      pd = true;
    }
    
    if (pd === true) {
      this.zhuangTaiLanGao = sbg;
    } else {
      this.zhuangTaiLanGao = 20;
    }
    
    let dhl = 44;
    this.daoHangLanGao = dhl;
    let zong = this.zhuangTaiLanGao + this.daoHangLanGao;
    this.zongDingBuGao = zong;
    
    let ay = this.zhuangTaiLanGao + (this.daoHangLanGao / 2);
    let ad = 32;
    let jg = 10;
    
    let zk = (ad * 2) + jg;
    let ax = (pk - zk) / 2;
    
    let sz = {};
    sz.zuoBiaoX = ax;
    sz.zuoBiaoY = ay;
    sz.kuan = ad;
    sz.gao = ad;
    sz.wenBen = 'SZ';
    this.kongZhiAnNiu.sheZhi = sz;
    
    let ph = {};
    ph.zuoBiaoX = ax + ad + jg;
    ph.zuoBiaoY = ay;
    ph.kuan = ad;
    ph.gao = ad;
    ph.wenBen = 'PH';
    this.kongZhiAnNiu.paiHang = ph;
    
    let tl = {};
    tl.zuoBiaoX = 15;
    tl.zuoBiaoY = ay;
    tl.kuan = 100;
    tl.gao = 28;
    tl.wenBen = 'TL 200/200';
    this.kongZhiAnNiu.tiLi = tl;
  }

  bangDingShiJian() {
    let zg = this;
    let qdX = 0;
    let qdY = 0;
    let qdG = 0;
    let qdS = 0;
    
    tt.onTouchStart(function(e) {
      let t = e.changedTouches[0];
      let cx = t.clientX;
      let cy = t.clientY;
      qdX = cx;
      qdY = cy;
      
      let dqg = zg.gunDongPianYi;
      qdG = dqg;
      
      let now = Date.now();
      qdS = now;
      
      let f = false;
      zg.shiFouZaiGunDong = f;
    });
    
    tt.onTouchMove(function(e) {
      let t = e.changedTouches[0];
      let cx = t.clientX;
      let cy = t.clientY;
      
      let chax = cx - qdX;
      let chay = cy - qdY;
      
      let absX = chax;
      if (absX < 0) absX = -absX;
      
      let absY = chay;
      if (absY < 0) absY = -absY;
      
      let sfgd = false;
      if (absY > 5) {
        if (absY > absX) {
          sfgd = true;
        }
      }
      
      if (sfgd === true) {
        zg.shiFouZaiGunDong = true;
      }
      
      let yd = qdG - chay;
      let m = zg.zuiDaGunDong;
      
      let zy = yd;
      if (zy < 0) zy = 0;
      if (zy > m) zy = m;
      
      zg.gunDongPianYi = zy;
    });
    
    tt.onTouchEnd(function(e) {
      let t = e.changedTouches[0];
      let cx = t.clientX;
      let cy = t.clientY;
      
      let xianzai = Date.now();
      let shiChang = xianzai - qdS;
      
      let gd = zg.shiFouZaiGunDong;
      let pd1 = false;
      if (gd === false) {
        if (shiChang < 300) {
          pd1 = true;
        }
      }
      
      if (pd1 === true) {
        let ncy = cy + zg.gunDongPianYi;
        
        let anNiuJi = Object.keys(zg.kongZhiAnNiu);
        let changdu = anNiuJi.length;
        
        for (let i = 0; i < changdu; i++) {
          let biaoShi = anNiuJi[i];
          let a = zg.kongZhiAnNiu[biaoShi];
          
          let dj = false;
          if (biaoShi === 'sheZhi' || biaoShi === 'paiHang') {
            let zx = a.zuoBiaoX + (a.kuan / 2);
            let zy = a.zuoBiaoY;
            let bj = a.kuan / 2;
            
            let cx2 = (cx - zx) * (cx - zx);
            let cy2 = (cy - zy) * (cy - zy);
            let jl = Math.sqrt(cx2 + cy2);
            
            if (jl <= bj) {
              dj = true;
            }
          } else {
            let sy = a.zuoBiaoY - (a.gao / 2);
            let xy = a.zuoBiaoY + (a.gao / 2);
            
            let t1 = false;
            if (cx >= a.zuoBiaoX) {
              if (cx <= (a.zuoBiaoX + a.kuan)) {
                t1 = true;
              }
            }
            
            let t2 = false;
            if (cy >= sy) {
              if (cy <= xy) {
                t2 = true;
              }
            }
            
            if (t1 === true && t2 === true) {
              dj = true;
            }
          }
          
          if (dj === true) {
            zg.chuliDianJiAnNiu(biaoShi);
            return;
          }
        }
        
        let qps = zg.qiaPianShuZu.length;
        for (let j = 0; j < qps; j++) {
          let q = zg.qiaPianShuZu[j];
          
          let nx = false;
          if (cx >= q.zuoBiaoX) {
            if (cx <= (q.zuoBiaoX + q.kuanDu)) {
              nx = true;
            }
          }
          
          let ny = false;
          if (ncy >= q.zuoBiaoY) {
            if (ncy <= (q.zuoBiaoY + q.gaoDu)) {
              ny = true;
            }
          }
          
          if (nx === true && ny === true) {
            zg.jinRuYouXi(q.id, q.mingZi);
            return;
          }
        }
      }
    });
  }

  chuliDianJiAnNiu(bs) {
    let pd = bs;
    if (pd === 'sheZhi') {
      this.daKaiSheZhi();
    } else if (pd === 'paiHang') {
      this.daKaiPaiHang();
    } else if (pd === 'tiLi') {
      let ts = {};
      let z1 = this.wanJiaTiLi;
      let z2 = tL.max;
      ts.title = "TL:" + z1 + "/" + z2;
      ts.icon = 'none';
      tt.showToast(ts);
    }
  }

  daKaiSheZhi() {
    let mc = 'shezhi';
    this.dangQianChangJing = mc;
    
    let a1 = {};
    a1.zuoBiaoX = 30;
    a1.zuoBiaoY = this.zhuangTaiLanGao + 22;
    a1.k = 40;
    a1.g = 40;
    a1.w = 'FH';
    this.sheZhiMianAnNiu.fanHui = a1;
    
    tt.offTouchStart();
    tt.offTouchMove();
    tt.offTouchEnd();
    
    this.bangDingSheZhiShiJian();
  }

  bangDingSheZhiShiJian() {
    let z = this;
    tt.onTouchStart(function(e) {
      let t = e.changedTouches[0];
      let cx = t.clientX;
      let cy = t.clientY;
      
      let f = z.sheZhiMianAnNiu.fanHui;
      let p1 = false;
      if (cx >= f.zuoBiaoX) {
        if (cx <= (f.zuoBiaoX + f.k)) {
          p1 = true;
        }
      }
      
      let sy = f.zuoBiaoY - (f.g / 2);
      let xy = f.zuoBiaoY + (f.g / 2);
      
      let p2 = false;
      if (cy >= sy) {
        if (cy <= xy) {
          p2 = true;
        }
      }
      
      if (p1 === true && p2 === true) {
        z.tuiHuiDaTing();
      }
    });
  }

  daKaiPaiHang() {
    let c = 'paihang';
    this.dangQianChangJing = c;
    
    let l = 0;
    this.paiHangGunDong = l;
    
    tt.offTouchStart();
    tt.offTouchMove();
    tt.offTouchEnd();
    
    this.bangDingPaiHangShiJian();
  }
  
  bangDingPaiHangShiJian() {
    let z = this;
    tt.onTouchStart(function(e) {
      let t = e.changedTouches[0];
      let cx = t.clientX;
      let cy = t.clientY;
      
      let x = 30;
      let y = z.zhuangTaiLanGao + 22;
      let k = 40;
      let g = 40;
      
      let p1 = false;
      if (cx >= x) {
        if (cx <= (x + k)) {
          p1 = true;
        }
      }
      
      let sy = y - (g / 2);
      let xy = y + (g / 2);
      
      let p2 = false;
      if (cy >= sy) {
        if (cy <= xy) {
          p2 = true;
        }
      }
      
      if (p1 === true && p2 === true) {
        z.tuiHuiDaTing();
      }
    });
  }

  jinRuYouXi(bh, mc) {
    let n = this.wanJiaTiLi;
    let x = tL.costPerGame;
    
    let buzu = false;
    if (n < x) {
      buzu = true;
    }
    
    if (buzu === true) {
      let ts = {};
      ts.title = 'TL BuZu';
      ts.icon = 'none';
      tt.showToast(ts);
      return;
    }
    
    let c = 'youxi';
    this.dangQianChangJing = c;
    
    tt.offTouchStart();
    tt.offTouchMove();
    tt.offTouchEnd();
    
    let mk = this.youXiMoKuaiBiao[bh];
    let pd = false;
    if (mk !== null && mk !== undefined) {
      pd = true;
    }
    
    if (pd === true) {
      let sl = new mk(this.huaBuDuiXiang, this.huaBiDuiXiang, this.sheBeiXinXi, function() {
        this.tuiHuiDaTing();
      }.bind(this));
      
      this.zhengZaiWan = sl;
      this.xiaoHaoWanJiaTiLi(x);
    } else {
      this.tuiHuiDaTing();
    }
  }

  tuiHuiDaTing() {
    let c = 'dating';
    this.dangQianChangJing = c;
    
    let n = null;
    this.zhengZaiWan = n;
    
    let l = 0;
    this.gunDongPianYi = l;
    
    this.bangDingShiJian();
  }

  xunHuanXuanRan() {
    this.zhuXuanRan();
    let zg = this;
    
    let dly = 16;
    setTimeout(function() {
      zg.xunHuanXuanRan();
    }, dly);
  }

  zhuXuanRan() {
    let c = this.dangQianChangJing;
    
    let p1 = false;
    if (c === 'youxi') {
      let z = this.zhengZaiWan;
      if (z !== null && z !== undefined) {
        p1 = true;
      }
    }
    
    if (p1 === true) {
      this.zhengZaiWan.render();
      return;
    }
    
    let p2 = false;
    if (c === 'shezhi') {
      p2 = true;
    }
    
    if (p2 === true) {
      this.huaSheZhi();
      return;
    }
    
    let p3 = false;
    if (c === 'paihang') {
      p3 = true;
    }
    
    if (p3 === true) {
      this.huaPaiHang();
      return;
    }
    
    this.huaDaTing();
  }
  
  huaSheZhi() {
    let b = this.huaBiDuiXiang;
    let s = this.sheBeiXinXi;
    
    let bk = s.windowWidth;
    let bg = s.windowHeight;
    
    b.fillStyle = '#1A1A2E';
    b.fillRect(0, 0, bk, bg);
    
    let a = this.sheZhiMianAnNiu.fanHui;
    b.fillStyle = '#FFFFFF';
    b.font = '24px Arial';
    b.fillText('Fanhui', a.zuoBiaoX, a.zuoBiaoY);
  }
  
  huaPaiHang() {
    let b = this.huaBiDuiXiang;
    let s = this.sheBeiXinXi;
    
    let bk = s.windowWidth;
    let bg = s.windowHeight;
    
    b.fillStyle = '#2A1A2E';
    b.fillRect(0, 0, bk, bg);
    
    b.fillStyle = '#FFFFFF';
    b.font = '24px Arial';
    b.fillText('PaiHangBang', bk/2, 100);
  }

  huaDaTing() {
    let b = this.huaBiDuiXiang;
    let s = this.sheBeiXinXi;
    
    let bk = s.windowWidth;
    let bg = s.windowHeight;
    
    let ys1 = yB.bgStart;
    let ys2 = yB.bgEnd;
    
    let jb = b.createLinearGradient(0, 0, 0, bg);
    jb.addColorStop(0, ys1);
    jb.addColorStop(1, ys2);
    
    b.fillStyle = jb;
    b.fillRect(0, 0, bk, bg);
    
    b.save();
    let p = this.gunDongPianYi;
    let fp = -p;
    b.translate(0, fp);
    
    let a = this.qiaPianShuZu;
    let l = a.length;
    for (let i = 0; i < l; i++) {
      let q = a[i];
      b.fillStyle = '#FFFFFF';
      b.fillRect(q.zuoBiaoX, q.zuoBiaoY, q.kuanDu, q.gaoDu);
      b.fillStyle = '#000000';
      b.fillText(q.mingZi, q.zuoBiaoX + 10, q.zuoBiaoY + 20);
    }
    
    b.restore();
    
    b.fillStyle = 'rgba(255,255,255,0.1)';
    let d = this.zongDingBuGao;
    b.fillRect(0, 0, bk, d);
  }
}
module.exports = YouXiDaTingZhuKong;