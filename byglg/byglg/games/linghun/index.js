class LingHunSuiPianYouXi {
  constructor(hb, hbCtx, sbxx, fh) {
    let hbu = hb;
    this.huaBu = hbu;
    
    let hbi = hbCtx;
    this.huaBi = hbi;
    
    let shebei = sbxx;
    this.sheBeiXinXi = shebei;
    
    let fanhui = fh;
    this.fanHuiHuiDiao = fanhui;
    
    let wg = 4;
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
    
    this.yanSeKu = [];
    this.yanSeKu.push('#E94560');
    this.yanSeKu.push('#0F3460');
    this.yanSeKu.push('#16213E');
    this.yanSeKu.push('#1A1A2E');
    this.yanSeKu.push('#533483');
    this.yanSeKu.push('#E94560');
    this.yanSeKu.push('#0F3460');
    this.yanSeKu.push('#16213E');
    
    this.wangGeShuJu = [];
    this.kongBaiZuoBiao = {};
    
    let chushiH = this.wangGeDaXiao - 1;
    let chushiL = this.wangGeDaXiao - 1;
    this.kongBaiZuoBiao.hang = chushiH;
    this.kongBaiZuoBiao.lie = chushiL;
    
    this.yiDongBuShu = 0;
    this.guanKa = 1;
    this.deFen = 0;
    this.zuiJiaBuShu = 999;
    
    this.chuShiHuaWangGe();
    this.daLuanPangMian();
    this.bangDingAnJian();
  }

  chuShiHuaWangGe() {
    let shuZi = 1;
    let wg = this.wangGeDaXiao;
    this.wangGeShuJu = [];
    
    for (let i = 0; i < wg; i++) {
      let hangDuiXiang = [];
      for (let j = 0; j < wg; j++) {
        let shiFouZuiHouHang = false;
        if (i === (wg - 1)) {
          shiFouZuiHouHang = true;
        }
        
        let shiFouZuiHouLie = false;
        if (j === (wg - 1)) {
          shiFouZuiHouLie = true;
        }
        
        let shiFouJiaoLuo = false;
        if (shiFouZuiHouHang === true) {
          if (shiFouZuiHouLie === true) {
            shiFouJiaoLuo = true;
          }
        }
        
        if (shiFouJiaoLuo === true) {
          hangDuiXiang.push(0);
        } else {
          hangDuiXiang.push(shuZi);
          let jiuShuZi = shuZi;
          let xinShuZi = jiuShuZi + 1;
          shuZi = xinShuZi;
        }
      }
      this.wangGeShuJu.push(hangDuiXiang);
    }
  }

  daLuanPangMian() {
    let xunHuanCiShu = 100;
    
    for (let i = 0; i < xunHuanCiShu; i++) {
      let kbHang = this.kongBaiZuoBiao.hang;
      let kbLie = this.kongBaiZuoBiao.lie;
      
      let linJuShuZu = this.huoQuXiangLinGeZi(kbHang, kbLie);
      let linJuShuLiang = linJuShuZu.length;
      
      let suiJiShu = Math.random();
      let cheng = suiJiShu * linJuShuLiang;
      let suiJiSuoYin = Math.floor(cheng);
      
      let xuanZhongLinJu = linJuShuZu[suiJiSuoYin];
      
      let muBiaoHang = xuanZhongLinJu.hang;
      let muBiaoLie = xuanZhongLinJu.lie;
      
      this.jiaoHuanGeZi(kbHang, kbLie, muBiaoHang, muBiaoLie);
      
      this.kongBaiZuoBiao.hang = muBiaoHang;
      this.kongBaiZuoBiao.lie = muBiaoLie;
    }
    
    let chuShiBuShu = 0;
    this.yiDongBuShu = chuShiBuShu;
  }

  huoQuXiangLinGeZi(hang, lie) {
    let jieGuoShuZu = [];
    
    let kShang = false;
    if (hang > 0) {
      kShang = true;
    }
    
    if (kShang === true) {
      let xShang = {};
      xShang.hang = hang - 1;
      xShang.lie = lie;
      jieGuoShuZu.push(xShang);
    }
    
    let kXia = false;
    let bianJieXia = this.wangGeDaXiao - 1;
    if (hang < bianJieXia) {
      kXia = true;
    }
    
    if (kXia === true) {
      let xXia = {};
      xXia.hang = hang + 1;
      xXia.lie = lie;
      jieGuoShuZu.push(xXia);
    }
    
    let kZuo = false;
    if (lie > 0) {
      kZuo = true;
    }
    
    if (kZuo === true) {
      let xZuo = {};
      xZuo.hang = hang;
      xZuo.lie = lie - 1;
      jieGuoShuZu.push(xZuo);
    }
    
    let kYou = false;
    let bianJieYou = this.wangGeDaXiao - 1;
    if (lie < bianJieYou) {
      kYou = true;
    }
    
    if (kYou === true) {
      let xYou = {};
      xYou.hang = hang;
      xYou.lie = lie + 1;
      jieGuoShuZu.push(xYou);
    }
    
    return jieGuoShuZu;
  }

  jiaoHuanGeZi(hang1, lie1, hang2, lie2) {
    let linShiZhi = this.wangGeShuJu[hang1][lie1];
    let muBiaoZhi = this.wangGeShuJu[hang2][lie2];
    
    this.wangGeShuJu[hang1][lie1] = muBiaoZhi;
    this.wangGeShuJu[hang2][lie2] = linShiZhi;
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
    let kbHang = this.kongBaiZuoBiao.hang;
    let kbLie = this.kongBaiZuoBiao.lie;
    
    let hangCha = hang - kbHang;
    let hangJueDui = hangCha;
    if (hangCha < 0) {
      hangJueDui = -hangCha;
    }
    
    let lieCha = lie - kbLie;
    let lieJueDui = lieCha;
    if (lieCha < 0) {
      lieJueDui = -lieCha;
    }
    
    let zongJvLi = hangJueDui + lieJueDui;
    let xiangLinBiaoZhi = false;
    
    if (zongJvLi === 1) {
      xiangLinBiaoZhi = true;
    }
    
    if (xiangLinBiaoZhi === true) {
      this.jiaoHuanGeZi(hang, lie, kbHang, kbLie);
      
      this.kongBaiZuoBiao.hang = hang;
      this.kongBaiZuoBiao.lie = lie;
      
      let jiuBu = this.yiDongBuShu;
      let xinBu = jiuBu + 1;
      this.yiDongBuShu = xinBu;
      
      this.xuanRanHuaMian();
      
      let shiFouYingLe = this.jianChaShiFouTongGuan();
      
      if (shiFouYingLe === true) {
        let jiuFen = this.deFen;
        let chuangGuanJiangLi = 100 - this.yiDongBuShu;
        
        let zuiZhongJiangLi = chuangGuanJiangLi;
        let zuiDiJiangLi = 10;
        
        if (chuangGuanJiangLi < zuiDiJiangLi) {
          zuiZhongJiangLi = zuiDiJiangLi;
        }
        
        let xinFen = jiuFen + zuiZhongJiangLi;
        this.deFen = xinFen;
        
        let dangQianBu = this.yiDongBuShu;
        let zuiJiaBu = this.zuiJiaBuShu;
        let shiFouPoJiLu = false;
        
        if (dangQianBu < zuiJiaBu) {
          shiFouPoJiLu = true;
        }
        
        if (shiFouPoJiLu === true) {
          this.zuiJiaBuShu = dangQianBu;
        }
        
        let zz = this;
        let yanchi = 100;
        
        setTimeout(function() {
          let ts = {};
          let wb1 = "TG!";
          let wb2 = "YongLe:";
          let wb3 = zz.yiDongBuShu;
          let wb4 = "Bu";
          ts.title = wb1 + wb2 + wb3 + wb4;
          ts.icon = 'success';
          
          tt.showToast(ts);
          zz.shengJiGuanKa();
        }, yanchi);
      }
    }
  }

  shengJiGuanKa() {
    let jk = this.guanKa;
    let xk = jk + 1;
    this.guanKa = xk;
    
    let ts = {};
    let wz = "GuanKa" + this.guanKa;
    ts.title = wz;
    ts.icon = 'success';
    tt.showToast(ts);
    
    this.chuShiHuaWangGe();
    this.daLuanPangMian();
  }

  jianChaShiFouTongGuan() {
    let shuZiCheck = 1;
    let wg = this.wangGeDaXiao;
    let tgBiaoZhi = true;
    
    for (let i = 0; i < wg; i++) {
      for (let j = 0; j < wg; j++) {
        let shiFouZuiHouHang = false;
        if (i === (wg - 1)) {
          shiFouZuiHouHang = true;
        }
        
        let shiFouZuiHouLie = false;
        if (j === (wg - 1)) {
          shiFouZuiHouLie = true;
        }
        
        let shiFouJiaoLuo = false;
        if (shiFouZuiHouHang === true) {
          if (shiFouZuiHouLie === true) {
            shiFouJiaoLuo = true;
          }
        }
        
        let dangQianZhi = this.wangGeShuJu[i][j];
        
        if (shiFouJiaoLuo === true) {
          let panDuanKong = false;
          if (dangQianZhi === 0) {
            panDuanKong = true;
          }
          if (panDuanKong === false) {
            return false;
          }
        } else {
          let panDuanZhi = false;
          if (dangQianZhi === shuZiCheck) {
            panDuanZhi = true;
          }
          if (panDuanZhi === false) {
            return false;
          }
          
          let jiuCheck = shuZiCheck;
          shuZiCheck = jiuCheck + 1;
        }
      }
    }
    
    return tgBiaoZhi;
  }

  xuanRanHuaMian() {
    let b = this.huaBi;
    let hb = this.huaBu;
    
    let bgys = '#1A1A2E';
    b.fillStyle = bgys;
    
    let hk = hb.width;
    let hg = hb.height;
    b.fillRect(0, 0, hk, hg);
    
    let ztl = this.zhuangTaiLanGao;
    let dhl = this.daoHangLanGao;
    let bdh = dhl / 2;
    let any = ztl + bdh;
    
    let hbs = 'rgba(255,255,255,0.2)';
    b.fillStyle = hbs;
    
    b.beginPath();
    let anx = 30;
    let anbj = 18;
    b.arc(anx, any, anbj, 0, Math.PI * 2);
    b.fill();
    
    let zys = '#FFF';
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
    
    let bushu = this.yiDongBuShu;
    let bsStr = "BS:" + bushu;
    let bsx = banK;
    b.fillText(bsStr, bsx, any);
    
    let fs = this.deFen;
    let fsStr = "FS:" + fs;
    let fsx = banK + 80;
    b.fillText(fsStr, fsx, any);
    
    let wg = this.wangGeDaXiao;
    let px = this.pianYiX;
    let py = this.pianYiY;
    let gz = this.geZiDaXiao;
    
    for (let i = 0; i < wg; i++) {
      for (let j = 0; j < wg; j++) {
        let gx = px + (j * gz);
        let gy = py + (i * gz);
        
        let zhi = this.wangGeShuJu[i][j];
        
        let pdKong = false;
        if (zhi === 0) {
          pdKong = true;
        }
        
        if (pdKong === true) {
          let kgYs = 'rgba(255,255,255,0.1)';
          b.fillStyle = kgYs;
          
          let kgX = gx + 2;
          let kgY = gy + 2;
          let kgK = gz - 4;
          let kgG = gz - 4;
          let kgBj = 8;
          
          this.huaYuanJiaoJuXing(b, kgX, kgY, kgK, kgG, kgBj);
          b.fill();
        } else {
          let ysLen = this.yanSeKu.length;
          let ysSuoYin = (zhi - 1) % ysLen;
          let sqYs = this.yanSeKu[ysSuoYin];
          
          b.fillStyle = sqYs;
          
          let fkX = gx + 2;
          let fkY = gy + 2;
          let fkK = gz - 4;
          let fkG = gz - 4;
          let fkBj = 8;
          
          this.huaYuanJiaoJuXing(b, fkX, fkY, fkK, fkG, fkBj);
          b.fill();
          
          let wzys = '#FFF';
          b.fillStyle = wzys;
          
          let zih = gz * 0.35;
          let zihao = "bold " + zih + "px Arial";
          b.font = zihao;
          
          let zxdq = 'center';
          b.textAlign = zxdq;
          
          let zxmd = 'middle';
          b.textBaseline = zxmd;
          
          let wzX = gx + (gz / 2);
          let wzY = gy + (gz / 2);
          
          b.fillText(zhi, wzX, wzY);
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

module.exports = LingHunSuiPianYouXi;