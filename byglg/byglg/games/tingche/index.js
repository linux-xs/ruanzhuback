class TingCheYouXi {
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
    
    this.suoYouGuanKa = [];
    
    let gk1 = [];
    gk1.push([0, 0, 2, 0, 0, 0]);
    gk1.push([0, 0, 2, 0, 3, 3]);
    gk1.push([1, 1, 0, 0, 0, 0]);
    gk1.push([0, 0, 2, 2, 0, 0]);
    gk1.push([0, 0, 0, 0, 0, 3]);
    gk1.push([0, 0, 0, 0, 0, 0]);
    this.suoYouGuanKa.push(gk1);
    
    let gk2 = [];
    gk2.push([0, 2, 0, 3, 0, 0]);
    gk2.push([0, 2, 0, 3, 0, 0]);
    gk2.push([0, 0, 0, 3, 0, 0]);
    gk2.push([1, 1, 2, 0, 0, 2]);
    gk2.push([0, 0, 0, 0, 3, 0]);
    gk2.push([0, 3, 3, 0, 0, 0]);
    this.suoYouGuanKa.push(gk2);
    
    let gk3 = [];
    gk3.push([0, 0, 3, 0, 2, 0]);
    gk3.push([0, 0, 3, 0, 2, 0]);
    gk3.push([1, 1, 0, 0, 0, 3]);
    gk3.push([0, 2, 2, 3, 0, 0]);
    gk3.push([0, 0, 0, 0, 0, 0]);
    gk3.push([3, 0, 0, 2, 2, 0]);
    this.suoYouGuanKa.push(gk3);
    
    this.guanKa = 1;
    this.deFen = 0;
    this.yiDongBuShu = 0;
    this.dangQianXuanZhong = null;
    this.wangGeShuJu = [];
    
    this.jiaZaiGuanKa();
    this.bangDingAnJian();
  }
  
  jiaZaiGuanKa() {
    let dqGk = this.guanKa;
    let jianYi = dqGk - 1;
    let zongShu = this.suoYouGuanKa.length;
    let yuShu = jianYi % zongShu;
    
    let muBiaoGuanKa = this.suoYouGuanKa[yuShu];
    this.wangGeShuJu = [];
    
    let wg = this.wangGeDaXiao;
    for (let i = 0; i < wg; i++) {
      let hang = [];
      for (let j = 0; j < wg; j++) {
        let zhi = muBiaoGuanKa[i][j];
        hang.push(zhi);
      }
      this.wangGeShuJu.push(hang);
    }
    
    let chushi = 0;
    this.yiDongBuShu = chushi;
    this.dangQianXuanZhong = null;
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
        let geZiZhi = zz.wangGeShuJu[hangZ][lieZ];
        let shiFouKong = false;
        if (geZiZhi === 0) {
          shiFouKong = true;
        }
        
        if (shiFouKong === false) {
          zz.chuLiDianJi(hangZ, lieZ);
        }
      }
    });
  }

  chuLiDianJi(hang, lie) {
    let leiXing = this.wangGeShuJu[hang][lie];
    let wg = this.wangGeDaXiao;
    let yiDongBiaoZhi = false;
    
    let shiFouHongChe = false;
    if (leiXing === 1) {
      shiFouHongChe = true;
    }
    
    let shiFouHengChe = false;
    if (leiXing === 2) {
      shiFouHengChe = true;
    }
    
    let shiFouShuChe = false;
    if (leiXing === 3) {
      shiFouShuChe = true;
    }
    
    if (shiFouHongChe === true) {
      let youBianJie = wg;
      let muBiaoLie = lie + 2;
      let nengFouZou = false;
      
      if (muBiaoLie < youBianJie) {
        let qianFangZhi = this.wangGeShuJu[hang][muBiaoLie];
        if (qianFangZhi === 0) {
          nengFouZou = true;
        }
      }
      
      if (nengFouZou === true) {
        this.wangGeShuJu[hang][muBiaoLie] = 1;
        this.wangGeShuJu[hang][lie] = 0;
        yiDongBiaoZhi = true;
        
        let jiuBu = this.yiDongBuShu;
        this.yiDongBuShu = jiuBu + 1;
        
        this.jianChaShengLi();
      }
      
    } else if (shiFouHengChe === true) {
      let zuoBianJie = 0;
      let muBiaoZuo = lie - 1;
      let nengZuoZou = false;
      
      if (lie > zuoBianJie) {
        let zuoFangZhi = this.wangGeShuJu[hang][muBiaoZuo];
        if (zuoFangZhi === 0) {
          nengZuoZou = true;
        }
      }
      
      if (nengZuoZou === true) {
        this.wangGeShuJu[hang][muBiaoZuo] = leiXing;
        this.wangGeShuJu[hang][lie + 1] = 0;
        yiDongBiaoZhi = true;
        
        let jiuBu = this.yiDongBuShu;
        this.yiDongBuShu = jiuBu + 1;
      } else {
        let youBianJie2 = wg;
        let muBiaoYou = lie + 2;
        let nengYouZou = false;
        
        if (muBiaoYou < youBianJie2) {
          let youFangZhi = this.wangGeShuJu[hang][muBiaoYou];
          if (youFangZhi === 0) {
            nengYouZou = true;
          }
        }
        
        if (nengYouZou === true) {
          this.wangGeShuJu[hang][muBiaoYou] = leiXing;
          this.wangGeShuJu[hang][lie] = 0;
          yiDongBiaoZhi = true;
          
          let jiuBu = this.yiDongBuShu;
          this.yiDongBuShu = jiuBu + 1;
        }
      }
      
    } else if (shiFouShuChe === true) {
      let shangBianJie = 0;
      let muBiaoShang = hang - 1;
      let nengShangZou = false;
      
      if (hang > shangBianJie) {
        let shangFangZhi = this.wangGeShuJu[muBiaoShang][lie];
        if (shangFangZhi === 0) {
          nengShangZou = true;
        }
      }
      
      if (nengShangZou === true) {
        this.wangGeShuJu[muBiaoShang][lie] = leiXing;
        this.wangGeShuJu[hang + 1][lie] = 0;
        yiDongBiaoZhi = true;
        
        let jiuBu = this.yiDongBuShu;
        this.yiDongBuShu = jiuBu + 1;
      } else {
        let xiaBianJie = wg;
        let muBiaoXia = hang + 2;
        let nengXiaZou = false;
        
        if (muBiaoXia < xiaBianJie) {
          let xiaFangZhi = this.wangGeShuJu[muBiaoXia][lie];
          if (xiaFangZhi === 0) {
            nengXiaZou = true;
          }
        }
        
        if (nengXiaZou === true) {
          this.wangGeShuJu[muBiaoXia][lie] = leiXing;
          this.wangGeShuJu[hang][lie] = 0;
          yiDongBiaoZhi = true;
          
          let jiuBu = this.yiDongBuShu;
          this.yiDongBuShu = jiuBu + 1;
        }
      }
    }
    
    this.xuanRanHuaMian();
  }

  jianChaShengLi() {
    let wg = this.wangGeDaXiao;
    
    for (let j = 0; j < wg; j++) {
      let cheZhi = this.wangGeShuJu[2][j];
      
      let shiFouShiHongChe = false;
      if (cheZhi === 1) {
        shiFouShiHongChe = true;
      }
      
      if (shiFouShiHongChe === true) {
        let bianJieMubiao = wg - 2;
        let shiFouDaoDa = false;
        if (j === bianJieMubiao) {
          shiFouDaoDa = true;
        }
        
        if (shiFouDaoDa === true) {
          let jiuFen = this.deFen;
          let jiChuFen = 100;
          let bs = this.yiDongBuShu;
          let kouFen = bs * 2;
          
          let yingDeFen = jiChuFen - kouFen;
          let zuiDiFen = 10;
          
          let zuiZhongJiaFen = yingDeFen;
          if (yingDeFen < zuiDiFen) {
            zuiZhongJiaFen = zuiDiFen;
          }
          
          let xinFen = jiuFen + zuiZhongJiaFen;
          this.deFen = xinFen;
          
          let zz = this;
          let yanchi = 100;
          
          setTimeout(function() {
            let ts = {};
            let wb1 = "TG! YongLe:";
            let wb2 = zz.yiDongBuShu;
            let wb3 = "Bu";
            ts.title = wb1 + wb2 + wb3;
            ts.icon = 'success';
            
            tt.showToast(ts);
            zz.shengJiGuanKa();
          }, yanchi);
        }
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
    
    this.jiaZaiGuanKa();
  }

  xuanRanHuaMian() {
    let b = this.huaBi;
    let hb = this.huaBu;
    
    let bgys = '#E0F7FA';
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
        let gx = px + (j * gz);
        let gy = py + (i * gz);
        
        let diYs = '#B2EBF2';
        b.fillStyle = diYs;
        
        let dx = gx + 1;
        let dy = gy + 1;
        let dk = gz - 2;
        let dg = gz - 2;
        b.fillRect(dx, dy, dk, dg);
        
        let leiXing = this.wangGeShuJu[i][j];
        
        let shiFouKong = false;
        if (leiXing === 0) {
          shiFouKong = true;
        }
        
        if (shiFouKong === false) {
          let shiFouHong = false;
          if (leiXing === 1) {
            shiFouHong = true;
          }
          
          let shiFouHeng = false;
          if (leiXing === 2) {
            shiFouHeng = true;
          }
          
          if (shiFouHong === true) {
            let hYs = '#F44336';
            b.fillStyle = hYs;
          } else if (shiFouHeng === true) {
            let hgYs = '#2196F3';
            b.fillStyle = hgYs;
          } else {
            let sYs = '#4CAF50';
            b.fillStyle = sYs;
          }
          
          let cx = gx + 3;
          let cy = gy + 3;
          let ck = gz - 6;
          let cg = gz - 6;
          let cbj = 5;
          
          this.huaYuanJiaoJuXing(b, cx, cy, ck, cg, cbj);
          b.fill();
          
          let wzys = '#FFF';
          b.fillStyle = wzys;
          
          let zih = gz * 0.3;
          let zihao = zih + "px Arial";
          b.font = zihao;
          
          let zxdq = 'center';
          b.textAlign = zxdq;
          
          let zxmd = 'middle';
          b.textBaseline = zxmd;
          
          let wzX = gx + (gz / 2);
          let wzY = gy + (gz / 2);
          
          let wenZ = "";
          if (shiFouHong === true) {
            wenZ = "★";
          } else {
            wenZ = "■";
          }
          
          b.fillText(wenZ, wzX, wzY);
        }
      }
    }
    
    let ckYs = '#FF9800';
    b.fillStyle = ckYs;
    
    let ckZi = '14px Arial';
    b.font = ckZi;
    
    let ckdq = 'left';
    b.textAlign = ckdq;
    
    let ckWz = "ChuKou->";
    let ckX = px + (wg * gz) + 5;
    let ckY = py + (2.5 * gz);
    
    b.fillText(ckWz, ckX, ckY);
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

module.exports = TingCheYouXi;