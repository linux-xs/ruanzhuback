class DuoMaoMaoYouXi {
  constructor(hb, hbCtx, sbxx, fh) {
    let huabu = hb;
    this.huaBu = huabu;
    
    let huabi = hbCtx;
    this.huaBi = huabi;
    
    let shebei = sbxx;
    this.sheBeiXinXi = shebei;
    
    let fanhui = fh;
    this.fanHuiHuiDiao = fanhui;
    
    let wg = 5;
    this.wangGeDaXiao = wg;
    
    let sbg = this.sheBeiXinXi.statusBarHeight;
    let pds = false;
    if (sbg !== null && sbg !== undefined) {
      pds = true;
    }
    
    if (pds === true) {
      this.zhuangTaiLanGao = sbg;
    } else {
      this.zhuangTaiLanGao = 20;
    }
    
    let dhg = 44;
    this.daoHangLanGao = dhg;
    
    let zzt = this.zhuangTaiLanGao;
    let zdh = this.daoHangLanGao;
    let zdb = zzt + zdh;
    this.dingBuLanGao = zdb;
    
    let db = 40;
    let wgGao = this.sheBeiXinXi.windowHeight;
    let shengGao = wgGao - this.dingBuLanGao - db;
    
    let wgKuan = this.sheBeiXinXi.windowWidth;
    let shengKuan = wgKuan - 20;
    
    let jiSuanKuan = shengKuan / this.wangGeDaXiao;
    let jiSuanGao = shengGao / this.wangGeDaXiao;
    
    let zuiZhongGeZi = jiSuanKuan;
    if (jiSuanGao < jiSuanKuan) {
      zuiZhongGeZi = jiSuanGao;
    }
    this.geZiDaXiao = zuiZhongGeZi;
    
    let zongGeZiKuan = this.wangGeDaXiao * this.geZiDaXiao;
    let kuanCha = this.sheBeiXinXi.windowWidth - zongGeZiKuan;
    this.pianYiX = kuanCha / 2;
    
    let zongGeZiGao = this.wangGeDaXiao * this.geZiDaXiao;
    let gaoCha = shengGao - zongGeZiGao;
    this.pianYiY = this.dingBuLanGao + (gaoCha / 2);
    
    this.maoMiBiaoQing = [];
    this.maoMiBiaoQing.push('');
    this.maoMiBiaoQing.push('🐈');
    this.maoMiBiaoQing.push('');
    this.maoMiBiaoQing.push('😸');
    this.maoMiBiaoQing.push('😻');
    
    this.wangGeShuJu = [];
    this.maoMiZuoBiao = [];
    this.yiZhaodao = [];
    
    this.deFen = 0;
    this.guanKa = 1;
    this.shengYuShiJian = 30;
    this.youXiJieShu = false;
    
    this.chuShiHuaYouXi();
    this.bangDingAnJian();
    this.kaiShiJiShiQi();
  }

  chuShiHuaYouXi() {
    let wg = this.wangGeDaXiao;
    this.wangGeShuJu = [];
    
    for (let i = 0; i < wg; i++) {
      let hang = [];
      for (let j = 0; j < wg; j++) {
        let xiangZi = '📦';
        hang.push(xiangZi);
      }
      this.wangGeShuJu.push(hang);
    }
    
    this.maoMiZuoBiao = [];
    let maoShuLiang = 5;
    
    let zunXunBiaoZhi = true;
    while (zunXunBiaoZhi === true) {
      let dangQianShu = this.maoMiZuoBiao.length;
      if (dangQianShu >= maoShuLiang) {
        zunXunBiaoZhi = false;
        break;
      }
      
      let suiJi1 = Math.random();
      let cheng1 = suiJi1 * this.wangGeDaXiao;
      let r = Math.floor(cheng1);
      
      let suiJi2 = Math.random();
      let cheng2 = suiJi2 * this.wangGeDaXiao;
      let c = Math.floor(cheng2);
      
      let shiFouCunZai = false;
      let zhanCunLen = this.maoMiZuoBiao.length;
      for (let m = 0; m < zhanCunLen; m++) {
        let dian = this.maoMiZuoBiao[m];
        let p1 = false;
        if (dian.hang === r) {
          p1 = true;
        }
        let p2 = false;
        if (dian.lie === c) {
          p2 = true;
        }
        if (p1 === true && p2 === true) {
          shiFouCunZai = true;
          break;
        }
      }
      
      if (shiFouCunZai === false) {
        let xinDian = {};
        xinDian.hang = r;
        xinDian.lie = c;
        this.maoMiZuoBiao.push(xinDian);
        
        let bqLen = this.maoMiBiaoQing.length;
        let suiJi3 = Math.random();
        let cheng3 = suiJi3 * bqLen;
        let bqSuoYin = Math.floor(cheng3);
        let bqZiFu = this.maoMiBiaoQing[bqSuoYin];
        
        this.wangGeShuJu[r][c] = bqZiFu;
      }
    }
    
    this.yiZhaodao = [];
  }

  kaiShiJiShiQi() {
    let zg = this;
    
    let jsq = setInterval(function() {
      let sheng = zg.shengYuShiJian;
      let js = zg.youXiJieShu;
      
      let keYiJian = false;
      if (sheng > 0) {
        if (js === false) {
          keYiJian = true;
        }
      }
      
      if (keYiJian === true) {
        let xinSheng = sheng - 1;
        zg.shengYuShiJian = xinSheng;
        zg.xuanRanHuaMian();
      } else {
        let shiFouDaoLing = false;
        if (sheng === 0) {
          shiFouDaoLing = true;
        }
        if (shiFouDaoLing === true) {
          zg.youXiJieShu = true;
          zg.xuanRanHuaMian();
        }
      }
    }, 1000);
    
    this.tiLiJiShiQi = jsq;
  }

  bangDingAnJian() {
    let zz = this;
    
    tt.onTouchStart(function(chumo) {
      let d = chumo.changedTouches[0];
      let cx = d.clientX;
      let cy = d.clientY;
      
      let zt = zz.zhuangTaiLanGao;
      let dh = zz.daoHangLanGao;
      let banDh = dh / 2;
      let anY = zt + banDh;
      let anBj = 18;
      let anX = 30;
      
      let p1 = false;
      if (cx >= (anX - anBj)) {
        if (cx <= (anX + anBj)) {
          p1 = true;
        }
      }
      
      let p2 = false;
      if (cy >= (anY - anBj)) {
        if (cy <= (anY + anBj)) {
          p2 = true;
        }
      }
      
      if (p1 === true && p2 === true) {
        let fhFunc = zz.fanHuiHuiDiao;
        if (fhFunc !== null && fhFunc !== undefined) {
          fhFunc();
        }
        return;
      }
      
      let jsZhuangTai = zz.youXiJieShu;
      if (jsZhuangTai === true) {
        return;
      }
      
      let xKou = cx - zz.pianYiX;
      let yKou = cy - zz.pianYiY;
      
      let lieF = xKou / zz.geZiDaXiao;
      let hangF = yKou / zz.geZiDaXiao;
      
      let lieZ = Math.floor(lieF);
      let hangZ = Math.floor(hangF);
      
      let wg = zz.wangGeDaXiao;
      
      let tj1 = false;
      if (lieZ >= 0) {
        if (lieZ < wg) {
          tj1 = true;
        }
      }
      
      let tj2 = false;
      if (hangZ >= 0) {
        if (hangZ < wg) {
          tj2 = true;
        }
      }
      
      if (tj1 === true && tj2 === true) {
        zz.chuLiDianJi(hangZ, lieZ);
      }
    });
  }

  chuLiDianJi(h, l) {
    let zongMao = this.maoMiZuoBiao;
    let zongChang = zongMao.length;
    let shiFouShiMao = false;
    
    for (let i = 0; i < zongChang; i++) {
      let dian = zongMao[i];
      let t1 = false;
      if (dian.hang === h) {
        t1 = true;
      }
      let t2 = false;
      if (dian.lie === l) {
        t2 = true;
      }
      if (t1 === true && t2 === true) {
        shiFouShiMao = true;
        break;
      }
    }
    
    if (shiFouShiMao === true) {
      let zhaoDaoDe = this.yiZhaodao;
      let zdChang = zhaoDaoDe.length;
      let shiFouZhaoGuo = false;
      
      for (let j = 0; j < zdChang; j++) {
        let zdDian = zhaoDaoDe[j];
        let m1 = false;
        if (zdDian.hang === h) {
          m1 = true;
        }
        let m2 = false;
        if (zdDian.lie === l) {
          m2 = true;
        }
        if (m1 === true && m2 === true) {
          shiFouZhaoGuo = true;
          break;
        }
      }
      
      if (shiFouZhaoGuo === false) {
        let xinZhao = {};
        xinZhao.hang = h;
        xinZhao.lie = l;
        this.yiZhaodao.push(xinZhao);
        
        let jiuFen = this.deFen;
        let xinFen = jiuFen + 20;
        this.deFen = xinFen;
        
        let dangQianShu = this.yiZhaodao.length;
        let xuYaoShu = this.maoMiZuoBiao.length;
        
        let shiFouTongGuan = false;
        if (dangQianShu === xuYaoShu) {
          shiFouTongGuan = true;
        }
        
        if (shiFouTongGuan === true) {
          this.youXiJieShu = true;
          
          let shengYuM = this.shengYuShiJian;
          let jiaCheng = shengYuM * 2;
          
          let df = this.deFen;
          let zongFen = df + jiaCheng;
          this.deFen = zongFen;
          
          let w = this;
          let yanchi = 100;
          setTimeout(function() {
            let ts = {};
            ts.title = 'ZhaoDaoLa';
            ts.icon = 'success';
            tt.showToast(ts);
            w.shengJiGuanKa();
          }, yanchi);
        }
      }
    }
    this.xuanRanHuaMian();
  }

  shengJiGuanKa() {
    let jiuGk = this.guanKa;
    let xinGk = jiuGk + 1;
    this.guanKa = xinGk;
    
    let kouChu = this.guanKa * 2;
    let jiSuanSj = 30 - kouChu;
    
    let zuiZhongSj = jiSuanSj;
    let zuiDiSj = 10;
    if (jiSuanSj < zuiDiSj) {
      zuiZhongSj = zuiDiSj;
    }
    
    this.shengYuShiJian = zuiZhongSj;
    
    let tz = {};
    let wen = "GuanKa" + this.guanKa;
    tz.title = wen;
    tz.icon = 'success';
    tt.showToast(tz);
    
    this.chuShiHuaYouXi();
    this.youXiJieShu = false;
  }

  xuanRanHuaMian() {
    let b = this.huaBi;
    let hb = this.huaBu;
    
    let bgys = '#FFF3E0';
    b.fillStyle = bgys;
    
    let hk = hb.width;
    let hg = hb.height;
    b.fillRect(0, 0, hk, hg);
    
    let ztl = this.zhuangTaiLanGao;
    let dhl = this.daoHangLanGao;
    let bdh = dhl / 2;
    let any = ztl + bdh;
    
    let hbs = 'rgba(0,0,0,0.1)';
    b.fillStyle = hbs;
    
    b.beginPath();
    let anx = 30;
    let anbj = 18;
    b.arc(anx, any, anbj, 0, Math.PI * 2);
    b.fill();
    
    let zys = '#333';
    b.fillStyle = zys;
    
    let ztd = '14px Arial';
    b.font = ztd;
    
    let dq = 'center';
    b.textAlign = dq;
    
    let jx = 'middle';
    b.textBaseline = jx;
    
    let fh = 'FH';
    b.fillText(fh, anx, any);
    
    let jz = 'bold 14px Arial';
    b.font = jz;
    
    let banK = hk / 2;
    
    let gk = this.guanKa;
    let gkStr = "GK:" + gk;
    let gkx = banK - 80;
    b.fillText(gkStr, gkx, any);
    
    let sj = this.shengYuShiJian;
    let sjStr = "SJ:" + sj + "s";
    let sjx = banK;
    b.fillText(sjStr, sjx, any);
    
    let fs = this.deFen;
    let fsStr = "FS:" + fs;
    let fsx = banK + 80;
    b.fillText(fsStr, fsx, any);
    
    let wg = this.wangGeDaXiao;
    let zh = this.yiZhaodao;
    let px = this.pianYiX;
    let py = this.pianYiY;
    let gz = this.geZiDaXiao;
    
    for (let i = 0; i < wg; i++) {
      for (let j = 0; j < wg; j++) {
        let gx = px + (j * gz);
        let gy = py + (i * gz);
        
        let zhaoChang = zh.length;
        let shiFouXianShi = false;
        for (let m = 0; m < zhaoChang; m++) {
          let dian = zh[m];
          let p1 = false;
          if (dian.hang === i) {
            p1 = true;
          }
          let p2 = false;
          if (dian.lie === j) {
            p2 = true;
          }
          if (p1 === true && p2 === true) {
            shiFouXianShi = true;
            break;
          }
        }
        
        if (shiFouXianShi === true) {
          b.fillStyle = '#C8E6C9';
        } else {
          b.fillStyle = '#FFE0B2';
        }
        
        let hx = gx + 2;
        let hy = gy + 2;
        let hk2 = gz - 4;
        let hg2 = gz - 4;
        let hbj = 8;
        
        this.huaYuanJiaoJuXing(b, hx, hy, hk2, hg2, hbj);
        b.fill();
        
        let fHao = gz * 0.5;
        let fTi = fHao + "px Arial";
        b.font = fTi;
        
        let wzX = gx + (gz / 2);
        let wzY = gy + (gz / 2);
        
        if (shiFouXianShi === true) {
          let bq = this.wangGeShuJu[i][j];
          b.fillText(bq, wzX, wzY);
        } else {
          let kq = "";
          b.fillText(kq, wzX, wzY);
        }
      }
    }
    
    let js = this.youXiJieShu;
    if (js === true) {
      let zhezhao = 'rgba(0,0,0,0.5)';
      b.fillStyle = zhezhao;
      b.fillRect(0, 0, hk, hg);
      
      let bys = '#FFF';
      b.fillStyle = bys;
      
      let daZi = 'bold 30px Arial';
      b.font = daZi;
      
      let dzX = hk / 2;
      let dzY = hg / 2;
      
      let dangQianZd = this.yiZhaodao.length;
      let zongZd = this.maoMiZuoBiao.length;
      
      let isWin = false;
      if (dangQianZd === zongZd) {
        isWin = true;
      }
      
      if (isWin === true) {
        let tsW = "TG";
        b.fillText(tsW, dzX, dzY);
      } else {
        let tsL = "SJD";
        b.fillText(tsL, dzX, dzY);
      }
    }
  }

  huaYuanJiaoJuXing(huaBu, x, y, k, g, bj) {
    huaBu.beginPath();
    let qdX = x + bj;
    let qdY = y;
    huaBu.moveTo(qdX, qdY);
    
    let d1X = x + k - bj;
    let d1Y = y;
    huaBu.lineTo(d1X, d1Y);
    
    let kZ1X = x + k;
    let kZ1Y = y;
    let jD1X = x + k;
    let jD1Y = y + bj;
    huaBu.quadraticCurveTo(kZ1X, kZ1Y, jD1X, jD1Y);
    
    let d2X = x + k;
    let d2Y = y + g - bj;
    huaBu.lineTo(d2X, d2Y);
    
    let kZ2X = x + k;
    let kZ2Y = y + g;
    let jD2X = x + k - bj;
    let jD2Y = y + g;
    huaBu.quadraticCurveTo(kZ2X, kZ2Y, jD2X, jD2Y);
    
    let d3X = x + bj;
    let d3Y = y + g;
    huaBu.lineTo(d3X, d3Y);
    
    let kZ3X = x;
    let kZ3Y = y + g;
    let jD3X = x;
    let jD3Y = y + g - bj;
    huaBu.quadraticCurveTo(kZ3X, kZ3Y, jD3X, jD3Y);
    
    let d4X = x;
    let d4Y = y + bj;
    huaBu.lineTo(d4X, d4Y);
    
    let kZ4X = x;
    let kZ4Y = y;
    let jD4X = x + bj;
    let jD4Y = y;
    huaBu.quadraticCurveTo(kZ4X, kZ4Y, jD4X, jD4Y);
    
    huaBu.closePath();
  }
}
module.exports = DuoMaoMaoYouXi;