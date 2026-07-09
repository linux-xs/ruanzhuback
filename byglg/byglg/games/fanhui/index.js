class FanHuiYouXi {
  constructor(hb, hbCtx, sbxx, fh) {
    let hbu = hb;
    this.huaBu = hbu;
    
    let hbi = hbCtx;
    this.huaBi = hbi;
    
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
    
    this.yanSeKu = [];
    this.yanSeKu.push('#BB8FCE');
    this.yanSeKu.push('#FFFFFF');
    
    this.wangGeShuJu = [];
    this.yiDongBuShu = 0;
    this.guanKa = 1;
    this.deFen = 0;
    this.zuiJiaBuShu = 999;
    
    this.chuShiHuaWangGe();
    this.bangDingAnJian();
  }

  chuShiHuaWangGe() {
    this.wangGeShuJu = [];
    let wg = this.wangGeDaXiao;
    
    for (let i = 0; i < wg; i++) {
      let hang = [];
      for (let j = 0; j < wg; j++) {
        let suiJi = Math.random();
        let shiFouLing = false;
        if (suiJi > 0.5) {
          shiFouLing = true;
        }
        
        if (shiFouLing === true) {
          hang.push(0);
        } else {
          hang.push(1);
        }
      }
      this.wangGeShuJu.push(hang);
    }
    
    let shiFouYiJingHaoLe = this.jianChaShiFouTongGuan();
    if (shiFouYiJingHaoLe === true) {
      let lingX = 0;
      let lingY = 0;
      this.fanZhuanYanSe(lingX, lingY);
    }
    
    let chuBu = 0;
    this.yiDongBuShu = chuBu;
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
    this.fanZhuanYanSe(hang, lie);
    
    let shang = hang - 1;
    let pdShang = false;
    if (shang >= 0) {
      pdShang = true;
    }
    if (pdShang === true) {
      this.fanZhuanYanSe(shang, lie);
    }
    
    let wg = this.wangGeDaXiao;
    
    let xia = hang + 1;
    let pdXia = false;
    if (xia < wg) {
      pdXia = true;
    }
    if (pdXia === true) {
      this.fanZhuanYanSe(xia, lie);
    }
    
    let zuo = lie - 1;
    let pdZuo = false;
    if (zuo >= 0) {
      pdZuo = true;
    }
    if (pdZuo === true) {
      this.fanZhuanYanSe(hang, zuo);
    }
    
    let you = lie + 1;
    let pdYou = false;
    if (you < wg) {
      pdYou = true;
    }
    if (pdYou === true) {
      this.fanZhuanYanSe(hang, you);
    }
    
    let jiuBu = this.yiDongBuShu;
    let xinBu = jiuBu + 1;
    this.yiDongBuShu = xinBu;
    
    let shiFouYingLe = this.jianChaShiFouTongGuan();
    if (shiFouYingLe === true) {
      this.chuLiTongGuan();
    }
    
    this.xuanRanHuaMian();
  }

  fanZhuanYanSe(h, l) {
    let jiu = this.wangGeShuJu[h][l];
    let xin = 0;
    let pd = false;
    if (jiu === 0) {
      pd = true;
    }
    
    if (pd === true) {
      xin = 1;
    } else {
      xin = 0;
    }
    this.wangGeShuJu[h][l] = xin;
  }

  jianChaShiFouTongGuan() {
    let wg = this.wangGeDaXiao;
    let diYiGe = this.wangGeShuJu[0][0];
    let tongGuanBiaoZhi = true;
    
    for (let i = 0; i < wg; i++) {
      for (let j = 0; j < wg; j++) {
        let dangQian = this.wangGeShuJu[i][j];
        let shiFouXiangDeng = false;
        
        if (dangQian !== diYiGe) {
          shiFouXiangDeng = true;
        }
        
        if (shiFouXiangDeng === true) {
          tongGuanBiaoZhi = false;
          break;
        }
      }
      
      if (tongGuanBiaoZhi === false) {
        break;
      }
    }
    
    return tongGuanBiaoZhi;
  }

  chuLiTongGuan() {
    let bs = this.yiDongBuShu;
    let jc = 100 - bs;
    
    let xjc = jc;
    if (xjc < 10) {
      xjc = 10;
    }
    
    let df = this.deFen;
    let xf = df + xjc;
    this.deFen = xf;
    
    let ts = {};
    let wenben = "TG!";
    ts.title = wenben;
    ts.icon = 'success';
    
    let zz = this;
    let yanchi = 100;
    setTimeout(function() {
      tt.showToast(ts);
      zz.shengJiGuanKa();
    }, yanchi);
  }

  shengJiGuanKa() {
    let jk = this.guanKa;
    let xk = jk + 1;
    this.guanKa = xk;
    
    let jb = this.yiDongBuShu;
    let zj = this.zuiJiaBuShu;
    let pd = false;
    if (jb < zj) {
      pd = true;
    }
    
    if (pd === true) {
      this.zuiJiaBuShu = jb;
    }
    
    this.chuShiHuaWangGe();
    this.xuanRanHuaMian();
  }

  xuanRanHuaMian() {
    let b = this.huaBi;
    let hb = this.huaBu;
    
    let bgys = '#F5F5F5';
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
        let zhi = this.wangGeShuJu[i][j];
        
        let dys = this.yanSeKu[zhi];
        b.fillStyle = dys;
        
        let bys = '#BB8FCE';
        b.strokeStyle = bys;
        
        let xk = 2;
        b.lineWidth = xk;
        
        let fx = px + (j * gz) + 2;
        let fy = py + (i * gz) + 2;
        let fk = gz - 4;
        let fg = gz - 4;
        let fbj = 8;
        
        this.huaYuanJiaoJuXing(b, fx, fy, fk, fg, fbj);
        b.fill();
        b.stroke();
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

module.exports = FanHuiYouXi;