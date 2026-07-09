class JianTouYouXi {
  constructor(hb, hbCtx, sbxx, fh) {
    let hbu = hb;
    this.huaBu = hbu;
    
    let hbi = hbCtx;
    this.huaBi = hbi;
    
    let shebei = sbxx;
    this.sheBeiXinXi = shebei;
    
    let fanhui = fh;
    this.fanHuiHuiDiao = fanhui;
    
    let wg = 6;
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
    
    this.jianTouKu = [];
    this.jianTouKu.push('↑');
    this.jianTouKu.push('↓');
    this.jianTouKu.push('←');
    this.jianTouKu.push('→');
    this.jianTouKu.push('↖');
    this.jianTouKu.push('↗');
    
    this.yanSeKu = [];
    this.yanSeKu.push('#FF6B6B');
    this.yanSeKu.push('#4ECDC4');
    this.yanSeKu.push('#45B7D1');
    this.yanSeKu.push('#96CEB4');
    this.yanSeKu.push('#FFEAA7');
    this.yanSeKu.push('#DDA0DD');
    
    this.wangGeShuJu = [];
    this.deFen = 0;
    this.guanKa = 1;
    this.muBiaoFenShu = 100;
    this.dangQianXuanZhong = null;
    
    this.chuShiHuaWangGe();
    this.bangDingAnJian();
  }

  chuShiHuaWangGe() {
    this.wangGeShuJu = [];
    let wg = this.wangGeDaXiao;
    
    for (let i = 0; i < wg; i++) {
      let hang = [];
      for (let j = 0; j < wg; j++) {
        let jtLen = this.jianTouKu.length;
        let suiJi = Math.random();
        let cheng = suiJi * jtLen;
        let jtSuoYin = Math.floor(cheng);
        hang.push(jtSuoYin);
      }
      this.wangGeShuJu.push(hang);
    }
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

  chuLiDianJi(hang, lie) {
    let xz = this.dangQianXuanZhong;
    let youXz = false;
    if (xz !== null && xz !== undefined) {
      youXz = true;
    }
    
    if (youXz === true) {
      let jiuHang = xz.hang;
      let jiuLie = xz.lie;
      
      let shiFouTongYiGe = false;
      if (jiuHang === hang) {
        if (jiuLie === lie) {
          shiFouTongYiGe = true;
        }
      }
      
      if (shiFouTongYiGe === true) {
        this.dangQianXuanZhong = null;
      } else {
        let jiuZhi = this.wangGeShuJu[jiuHang][jiuLie];
        let xinZhi = this.wangGeShuJu[hang][lie];
        
        let shiFouTongLei = false;
        if (jiuZhi === xinZhi) {
          shiFouTongLei = true;
        }
        
        if (shiFouTongLei === true) {
          let hangCha = jiuHang - hang;
          let lieCha = jiuLie - lie;
          
          let hangJueDui = hangCha;
          if (hangJueDui < 0) {
            hangJueDui = -hangJueDui;
          }
          
          let lieJueDui = lieCha;
          if (lieJueDui < 0) {
            lieJueDui = -lieJueDui;
          }
          
          let zongCha = hangJueDui + lieJueDui;
          let xiangLin = false;
          if (zongCha === 1) {
            xiangLin = true;
          }
          
          if (xiangLin === true) {
            this.wangGeShuJu[jiuHang][jiuLie] = -1;
            this.wangGeShuJu[hang][lie] = -1;
            
            let jiuFen = this.deFen;
            let xinFen = jiuFen + 10;
            this.deFen = xinFen;
            
            this.tianChongKongBai();
            
            let df = this.deFen;
            let mb = this.muBiaoFenShu;
            let daBiao = false;
            if (df >= mb) {
              daBiao = true;
            }
            
            if (daBiao === true) {
              this.shengJiGuanKa();
            }
          }
          this.dangQianXuanZhong = null;
        } else {
          let xinXuan = {};
          xinXuan.hang = hang;
          xinXuan.lie = lie;
          this.dangQianXuanZhong = xinXuan;
        }
      }
    } else {
      let xinXuan2 = {};
      xinXuan2.hang = hang;
      xinXuan2.lie = lie;
      this.dangQianXuanZhong = xinXuan2;
    }
    
    this.xuanRanHuaMian();
  }

  shengJiGuanKa() {
    let jk = this.guanKa;
    let xk = jk + 1;
    this.guanKa = xk;
    
    let xmb = this.guanKa * 100;
    this.muBiaoFenShu = xmb;
    
    let ts = {};
    let wz = "GuanKa" + this.guanKa;
    ts.title = wz;
    ts.icon = 'success';
    tt.showToast(ts);
    
    this.chuShiHuaWangGe();
    this.dangQianXuanZhong = null;
  }

  tianChongKongBai() {
    let wg = this.wangGeDaXiao;
    
    for (let j = 0; j < wg; j++) {
      let kongShu = 0;
      let qiDian = wg - 1;
      
      for (let i = qiDian; i >= 0; i--) {
        let zhi = this.wangGeShuJu[i][j];
        
        let shiFouKong = false;
        if (zhi === -1) {
          shiFouKong = true;
        }
        
        if (shiFouKong === true) {
          let jiuKong = kongShu;
          kongShu = jiuKong + 1;
        } else {
          let youKong = false;
          if (kongShu > 0) {
            youKong = true;
          }
          
          if (youKong === true) {
            let muBiaoHang = i + kongShu;
            this.wangGeShuJu[muBiaoHang][j] = zhi;
            this.wangGeShuJu[i][j] = -1;
          }
        }
      }
      
      for (let k = 0; k < kongShu; k++) {
        let jtLen = this.jianTouKu.length;
        let suiJi = Math.random();
        let cheng = suiJi * jtLen;
        let xinJt = Math.floor(cheng);
        this.wangGeShuJu[k][j] = xinJt;
      }
    }
  }

  xuanRanHuaMian() {
    let b = this.huaBi;
    let hb = this.huaBu;
    
    let bgys = '#E8F5E9';
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
    
    let jz = 'bold 16px Arial';
    b.font = jz;
    
    let banK = hk / 2;
    
    let gk = this.guanKa;
    let gkStr = "GK:" + gk;
    let gkx = banK - 60;
    b.fillText(gkStr, gkx, any);
    
    let fs = this.deFen;
    let fsStr = "FS:" + fs;
    let fsx = banK + 60;
    b.fillText(fsStr, fsx, any);
    
    let jdKuan = 100;
    let jdGao = 6;
    let jdX = banK - (jdKuan / 2);
    let jdY = any + 15;
    
    let jdBg = 'rgba(0,0,0,0.1)';
    b.fillStyle = jdBg;
    b.fillRect(jdX, jdY, jdKuan, jdGao);
    
    let jdYs = '#4ECDC4';
    b.fillStyle = jdYs;
    
    let df = this.deFen;
    let mb = this.muBiaoFenShu;
    let biLi = df / mb;
    
    let zuiZhongBiLi = biLi;
    if (biLi > 1) {
      zuiZhongBiLi = 1;
    }
    
    let xianShiK = jdKuan * zuiZhongBiLi;
    b.fillRect(jdX, jdY, xianShiK, jdGao);
    
    let wg = this.wangGeDaXiao;
    let px = this.pianYiX;
    let py = this.pianYiY;
    let gz = this.geZiDaXiao;
    
    for (let i = 0; i < wg; i++) {
      for (let j = 0; j < wg; j++) {
        let zhi = this.wangGeShuJu[i][j];
        
        let t1 = false;
        if (zhi === -1) {
          t1 = true;
        }
        
        if (t1 === false) {
          let gx = px + (j * gz);
          let gy = py + (i * gz);
          
          let xz = this.dangQianXuanZhong;
          let pdXz = false;
          if (xz !== null && xz !== undefined) {
            let k1 = false;
            if (xz.hang === i) {
              k1 = true;
            }
            let k2 = false;
            if (xz.lie === j) {
              k2 = true;
            }
            if (k1 === true && k2 === true) {
              pdXz = true;
            }
          }
          
          if (pdXz === true) {
            let xzYs = 'rgba(76,175,80,0.3)';
            b.fillStyle = xzYs;
            let xzX = gx - 3;
            let xzY = gy - 3;
            let xzK = gz + 6;
            let xzG = gz + 6;
            b.fillRect(xzX, xzY, xzK, xzG);
          }
          
          let fqYs = this.yanSeKu[zhi];
          b.fillStyle = fqYs;
          
          let fx = gx + 2;
          let fy = gy + 2;
          let fk = gz - 4;
          let fg = gz - 4;
          let fbj = 8;
          
          this.huaYuanJiaoJuXing(b, fx, fy, fk, fg, fbj);
          b.fill();
          
          let wzys = '#FFF';
          b.fillStyle = wzys;
          
          let zih = gz * 0.5;
          let zihao = zih + "px Arial";
          b.font = zihao;
          
          let zxdq = 'center';
          b.textAlign = zxdq;
          
          let zxmd = 'middle';
          b.textBaseline = zxmd;
          
          let wzX = gx + (gz / 2);
          let wzY = gy + (gz / 2);
          
          let jtWz = this.jianTouKu[zhi];
          b.fillText(jtWz, wzX, wzY);
        }
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

module.exports = JianTouYouXi;