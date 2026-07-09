class LianLianKanYouXi {
  constructor(hb, hbCtx, sbxx, fh) {
    let hbu = hb;
    this.huaBu = hbu;
    
    let hbi = hbCtx;
    this.huaBi = hbi;
    
    let shebei = sbxx;
    this.sheBeiXinXi = shebei;
    
    let fanhui = fh;
    this.fanHuiHuiDiao = fanhui;
    
    let l = 8;
    this.zongLieShu = l;
    
    let h = 6;
    this.zongHangShu = h;
    
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
    
    let jiSuanKuan = shengKuan / this.zongLieShu;
    let jiSuanGao = shengGao / this.zongHangShu;
    
    let zuiZhongGeZi = jiSuanKuan;
    if (jiSuanGao < jiSuanKuan) {
      zuiZhongGeZi = jiSuanGao;
    }
    this.geZiDaXiao = zuiZhongGeZi;
    
    let zongGeZiKuan = this.zongLieShu * this.geZiDaXiao;
    let kuanCha = this.sheBeiXinXi.windowWidth - zongGeZiKuan;
    this.pianYiX = kuanCha / 2;
    
    let zongGeZiGao = this.zongHangShu * this.geZiDaXiao;
    let gaoCha = shengGao - zongGeZiGao;
    this.pianYiY = this.dingBuLanGao + (gaoCha / 2);
    
    this.tuAnKu = [];
    this.tuAnKu.push('🍎');
    this.tuAnKu.push('🍊');
    this.tuAnKu.push('🍋');
    this.tuAnKu.push('🍉');
    this.tuAnKu.push('🍓');
    this.tuAnKu.push('🍑');
    this.tuAnKu.push('🍒');
    this.tuAnKu.push('🍇');
    
    this.wangGeShuJu = [];
    this.dangQianXuanZhong = null;
    this.deFen = 0;
    this.guanKa = 1;
    this.shengYuDuiShu = 0;
    
    this.chuShiHuaPangMian();
    this.bangDingAnJian();
  }

  chuShiHuaPangMian() {
    let zongGeZi = this.zongLieShu * this.zongHangShu;
    let duiShu = zongGeZi / 2;
    let zhanCunShuZu = [];
    
    let tuAnLen = this.tuAnKu.length;
    
    for (let i = 0; i < duiShu; i++) {
      let yuShu = i % tuAnLen;
      let tu = this.tuAnKu[yuShu];
      
      zhanCunShuZu.push(tu);
      zhanCunShuZu.push(tu);
    }
    
    let chang = zhanCunShuZu.length;
    let qiDian = chang - 1;
    
    for (let j = qiDian; j > 0; j--) {
      let suiJi = Math.random();
      let jiaYi = j + 1;
      let cheng = suiJi * jiaYi;
      let muBiao = Math.floor(cheng);
      
      let linShi1 = zhanCunShuZu[j];
      let linShi2 = zhanCunShuZu[muBiao];
      
      zhanCunShuZu[j] = linShi2;
      zhanCunShuZu[muBiao] = linShi1;
    }
    
    this.wangGeShuJu = [];
    
    for (let r = 0; r < this.zongHangShu; r++) {
      let hangDuiXiang = [];
      for (let c = 0; c < this.zongLieShu; c++) {
        let zongSuoYin = (r * this.zongLieShu) + c;
        let zhi = zhanCunShuZu[zongSuoYin];
        hangDuiXiang.push(zhi);
      }
      this.wangGeShuJu.push(hangDuiXiang);
    }
    
    this.shengYuDuiShu = duiShu;
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
      
      let lMax = zz.zongLieShu;
      let hMax = zz.zongHangShu;
      
      let tj1 = false;
      if (lieZ >= 0) {
        if (lieZ < lMax) {
          tj1 = true;
        }
      }
      
      let tj2 = false;
      if (hangZ >= 0) {
        if (hangZ < hMax) {
          tj2 = true;
        }
      }
      
      if (tj1 === true && tj2 === true) {
        let dangQianZhi = zz.wangGeShuJu[hangZ][lieZ];
        let youZhi = false;
        
        if (dangQianZhi !== null) {
          if (dangQianZhi !== undefined) {
            if (dangQianZhi !== -1) {
              youZhi = true;
            }
          }
        }
        
        if (youZhi === true) {
          zz.chuLiDianJi(hangZ, lieZ);
        }
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
        
        let shiFouXiangDeng = false;
        if (jiuZhi === xinZhi) {
          shiFouXiangDeng = true;
        }
        
        if (shiFouXiangDeng === true) {
          this.wangGeShuJu[jiuHang][jiuLie] = null;
          this.wangGeShuJu[hang][lie] = null;
          
          let jiuFen = this.deFen;
          let xinFen = jiuFen + 10;
          this.deFen = xinFen;
          
          let jiuSheng = this.shengYuDuiShu;
          let xinSheng = jiuSheng - 1;
          this.shengYuDuiShu = xinSheng;
          
          this.dangQianXuanZhong = null;
          
          let shiFouWanCheng = false;
          let sd = this.shengYuDuiShu;
          if (sd === 0) {
            shiFouWanCheng = true;
          }
          
          if (shiFouWanCheng === true) {
            let zz = this;
            let yanchi = 100;
            setTimeout(function() {
              let ts = {};
              let wenben = "TG!";
              ts.title = wenben;
              ts.icon = 'success';
              tt.showToast(ts);
              zz.shengJiGuanKa();
            }, yanchi);
          }
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
    
    let jf = this.deFen;
    let xf = jf + 50;
    this.deFen = xf;
    
    let ts = {};
    let wz = "GuanKa" + this.guanKa;
    ts.title = wz;
    ts.icon = 'success';
    tt.showToast(ts);
    
    this.chuShiHuaPangMian();
    this.dangQianXuanZhong = null;
  }

  xuanRanHuaMian() {
    let b = this.huaBi;
    let hb = this.huaBu;
    
    let bgys = '#F3E5F5';
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
    let gkx = banK - 60;
    b.fillText(gkStr, gkx, any);
    
    let fs = this.deFen;
    let fsStr = "FS:" + fs;
    let fsx = banK + 60;
    b.fillText(fsStr, fsx, any);
    
    let maxH = this.zongHangShu;
    let maxL = this.zongLieShu;
    let px = this.pianYiX;
    let py = this.pianYiY;
    let gz = this.geZiDaXiao;
    
    for (let r = 0; r < maxH; r++) {
      for (let c = 0; c < maxL; c++) {
        let zhi = this.wangGeShuJu[r][c];
        
        let k1 = false;
        if (zhi !== null) {
          if (zhi !== undefined) {
            k1 = true;
          }
        }
        
        if (k1 === true) {
          let gx = px + (c * gz);
          let gy = py + (r * gz);
          
          let xz = this.dangQianXuanZhong;
          let pdXz = false;
          
          if (xz !== null && xz !== undefined) {
            let n1 = false;
            if (xz.hang === r) {
              n1 = true;
            }
            let n2 = false;
            if (xz.lie === c) {
              n2 = true;
            }
            if (n1 === true && n2 === true) {
              pdXz = true;
            }
          }
          
          if (pdXz === true) {
            let xzYs = 'rgba(156,39,176,0.3)';
            b.fillStyle = xzYs;
            
            let xzx = gx - 2;
            let xzy = gy - 2;
            let xzk = gz + 4;
            let xzg = gz + 4;
            b.fillRect(xzx, xzy, xzk, xzg);
          }
          
          let bjs = '#FFF';
          b.fillStyle = bjs;
          
          let bks = '#CE93D8';
          b.strokeStyle = bks;
          
          let bkx = 2;
          b.lineWidth = bkx;
          
          let fqx = gx + 2;
          let fqy = gy + 2;
          let fqk = gz - 4;
          let fqg = gz - 4;
          let fqbj = 8;
          
          this.huaYuanJiaoJuXing(b, fqx, fqy, fqk, fqg, fqbj);
          b.fill();
          b.stroke();
          
          let zh = gz * 0.5;
          let zs = zh + "px Arial";
          b.font = zs;
          
          let dq1 = 'center';
          b.textAlign = dq1;
          
          let dq2 = 'middle';
          b.textBaseline = dq2;
          
          let txtX = gx + (gz / 2);
          let txtY = gy + (gz / 2);
          b.fillText(zhi, txtX, txtY);
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

module.exports = LianLianKanYouXi;