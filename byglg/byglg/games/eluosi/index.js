class ELuoSiYouXi {
  constructor(hb, hbCtx, sbxx, fh) {
    let huabu = hb;
    this.huaBu = huabu;
    
    let huabi = hbCtx;
    this.huaBi = huabi;
    
    let shebei = sbxx;
    this.sheBeiXinXi = shebei;
    
    let fanhui = fh;
    this.fanHuiHuiDiao = fanhui;
    
    let l = 10;
    this.zongLieShu = l;
    
    let h = 20;
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
    
    this.wangGeShuJu = [];
    for (let i = 0; i < this.zongHangShu; i++) {
      let hangShuZu = [];
      for (let j = 0; j < this.zongLieShu; j++) {
        let kong = 0;
        hangShuZu.push(kong);
      }
      this.wangGeShuJu.push(hangShuZu);
    }
    
    this.deFen = 0;
    this.guanKa = 1;
    this.xiaoChuHangShu = 0;
    this.youXiJieShu = false;
    
    this.zhuangTaiKu = [];
    
    let x1 = [[1,1,1,1]];
    this.zhuangTaiKu.push(x1);
    
    let x2 = [[1,1],[1,1]];
    this.zhuangTaiKu.push(x2);
    
    let x3 = [[0,1,0],[1,1,1]];
    this.zhuangTaiKu.push(x3);
    
    let x4 = [[1,0,0],[1,1,1]];
    this.zhuangTaiKu.push(x4);
    
    let x5 = [[0,0,1],[1,1,1]];
    this.zhuangTaiKu.push(x5);
    
    let x6 = [[1,1,0],[0,1,1]];
    this.zhuangTaiKu.push(x6);
    
    let x7 = [[0,1,1],[1,1,0]];
    this.zhuangTaiKu.push(x7);
    
    this.yanSeKu = [];
    this.yanSeKu.push('#00f0f0');
    this.yanSeKu.push('#f0f000');
    this.yanSeKu.push('#a000f0');
    this.yanSeKu.push('#0000f0');
    this.yanSeKu.push('#f0a000');
    this.yanSeKu.push('#00f000');
    this.yanSeKu.push('#f00000');
    
    this.dangQianFangKuai = null;
    this.dangQianX = 0;
    this.dangQianY = 0;
    this.dangQianYanSe = 0;
    
    this.shengChengFangKuai();
    this.bangDingAnJian();
    this.kaiShiYouXiXunHuan();
  }

  shengChengFangKuai() {
    let zongLen = this.zhuangTaiKu.length;
    let suiJi = Math.random();
    let cheng = suiJi * zongLen;
    let zhengSuoYin = Math.floor(cheng);
    
    let jiuM = this.zhuangTaiKu[zhengSuoYin];
    let xinM = [];
    
    let jLen = jiuM.length;
    for (let r = 0; r < jLen; r++) {
      let h = jiuM[r];
      let xH = [];
      let hLen = h.length;
      for (let c = 0; c < hLen; c++) {
        let z = h[c];
        xH.push(z);
      }
      xinM.push(xH);
    }
    
    this.dangQianFangKuai = xinM;
    
    let y = this.yanSeKu[zhengSuoYin];
    this.dangQianYanSe = y;
    
    let kuan = this.dangQianFangKuai[0].length;
    let sheng = this.zongLieShu - kuan;
    let ban = sheng / 2;
    let chushiX = Math.floor(ban);
    
    this.dangQianX = chushiX;
    this.dangQianY = 0;
    
    let pz = this.pengZhuangJianCe();
    if (pz === true) {
      this.youXiJieShu = true;
    }
  }

  pengZhuangJianCe() {
    let f = this.dangQianFangKuai;
    let rLen = f.length;
    
    for (let r = 0; r < rLen; r++) {
      let cLen = f[r].length;
      for (let c = 0; c < cLen; c++) {
        let zhi = f[r][c];
        let shiFouYouZhi = false;
        
        if (zhi !== 0) {
          if (zhi !== null) {
            if (zhi !== undefined) {
              shiFouYouZhi = true;
            }
          }
        }
        
        if (shiFouYouZhi === true) {
          let xinX = this.dangQianX + c;
          let xinY = this.dangQianY + r;
          
          let p1 = false;
          if (xinX < 0) {
            p1 = true;
          }
          if (xinX >= this.zongLieShu) {
            p1 = true;
          }
          if (xinY >= this.zongHangShu) {
            p1 = true;
          }
          
          if (p1 === true) {
            return true;
          }
          
          let p2 = false;
          if (xinY >= 0) {
            let diBuZhi = this.wangGeShuJu[xinY][xinX];
            if (diBuZhi !== 0) {
              p2 = true;
            }
          }
          
          if (p2 === true) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  heBingFangKuai() {
    let f = this.dangQianFangKuai;
    let rLen = f.length;
    
    for (let r = 0; r < rLen; r++) {
      let cLen = f[r].length;
      for (let c = 0; c < cLen; c++) {
        let zhi = f[r][c];
        let p1 = false;
        if (zhi !== 0) {
          if (zhi !== null) {
            if (zhi !== undefined) {
              p1 = true;
            }
          }
        }
        
        if (p1 === true) {
          let y = this.dangQianY + r;
          let x = this.dangQianX + c;
          this.wangGeShuJu[y][x] = this.dangQianYanSe;
        }
      }
    }
  }

  xiaoChuManHang() {
    let xiaoChuCiShu = 0;
    
    let k = this.zongHangShu - 1;
    let jx = true;
    
    while (jx === true) {
      if (k < 0) {
        jx = false;
        break;
      }
      
      let shiFouMan = true;
      for (let c = 0; c < this.zongLieShu; c++) {
        let gz = this.wangGeShuJu[k][c];
        if (gz === 0) {
          shiFouMan = false;
          break;
        }
      }
      
      if (shiFouMan === true) {
        let jiuCi = xiaoChuCiShu;
        xiaoChuCiShu = jiuCi + 1;
        
        for (let shangH = k; shangH > 0; shangH--) {
          for (let lie = 0; lie < this.zongLieShu; lie++) {
            let shangZhi = this.wangGeShuJu[shangH - 1][lie];
            this.wangGeShuJu[shangH][lie] = shangZhi;
          }
        }
        
        for (let dingLie = 0; dingLie < this.zongLieShu; dingLie++) {
          this.wangGeShuJu[0][dingLie] = 0;
        }
        
      } else {
        k = k - 1;
      }
    }
    
    let pdXC = false;
    if (xiaoChuCiShu > 0) {
      pdXC = true;
    }
    
    if (pdXC === true) {
      let jfs = this.deFen;
      let jiaf = xiaoChuCiShu * 100;
      this.deFen = jfs + jiaf;
      
      let jxc = this.xiaoChuHangShu;
      this.xiaoChuHangShu = jxc + xiaoChuCiShu;
      
      let zong = this.xiaoChuHangShu;
      let chu = zong / 10;
      let zheng = Math.floor(chu);
      let xGk = zheng + 1;
      
      let sfg = false;
      let jGk = this.guanKa;
      if (xGk > jGk) {
        sfg = true;
      }
      
      if (sfg === true) {
        this.guanKa = xGk;
        let ts = {};
        let wz = "GuanKa" + this.guanKa;
        ts.title = wz;
        ts.icon = 'success';
        tt.showToast(ts);
        
        let jsq = this.youXiXunHuanQi;
        clearInterval(jsq);
        this.kaiShiYouXiXunHuan();
      }
    }
  }

  xuanZhuanFangKuai() {
    let jiu = this.dangQianFangKuai;
    let hang = jiu.length;
    let lie = jiu[0].length;
    
    let xin = [];
    for (let c = 0; c < lie; c++) {
      let xH = [];
      for (let r = 0; r < hang; r++) {
        xH.push(0);
      }
      xin.push(xH);
    }
    
    for (let h = 0; h < hang; h++) {
      for (let l = 0; l < lie; l++) {
        let z = jiu[h][l];
        let nH = l;
        let nL = hang - 1 - h;
        xin[nH][nL] = z;
      }
    }
    
    this.dangQianFangKuai = xin;
    
    let pz = this.pengZhuangJianCe();
    if (pz === true) {
      this.dangQianFangKuai = jiu;
    }
  }

  xiangXiaYiDong() {
    let jy = this.dangQianY;
    this.dangQianY = jy + 1;
    
    let pz = this.pengZhuangJianCe();
    if (pz === true) {
      this.dangQianY = jy;
      this.heBingFangKuai();
      this.xiaoChuManHang();
      this.shengChengFangKuai();
    }
  }

  xiangZuoYiDong() {
    let jx = this.dangQianX;
    this.dangQianX = jx - 1;
    
    let pz = this.pengZhuangJianCe();
    if (pz === true) {
      this.dangQianX = jx;
    }
  }

  xiangYouYiDong() {
    let jx = this.dangQianX;
    this.dangQianX = jx + 1;
    
    let pz = this.pengZhuangJianCe();
    if (pz === true) {
      this.dangQianX = jx;
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
      
      let jsZhuangTai = zz.youXiJieShu;
      if (jsZhuangTai === true) {
        return;
      }
      
      let s = zz.sheBeiXinXi;
      let wK = s.windowWidth;
      let wG = s.windowHeight;
      
      let zxX = wK / 2;
      let zxY = wG / 2;
      
      let yP = zz.pianYiY;
      
      let j1 = false;
      if (cy < yP) {
        j1 = true;
      }
      
      let cK = zxX - 50;
      let j2 = false;
      if (cx < cK) {
        j2 = true;
      }
      
      let yK = zxX + 50;
      let j3 = false;
      if (cx > yK) {
        j3 = true;
      }
      
      if (j1 === true) {
        zz.xuanZhuanFangKuai();
      } else if (j2 === true) {
        zz.xiangZuoYiDong();
      } else if (j3 === true) {
        zz.xiangYouYiDong();
      } else {
        zz.xiangXiaYiDong();
      }
      
      zz.xuanRanHuaMian();
    });
  }

  kaiShiYouXiXunHuan() {
    let zg = this;
    let sd = 500;
    
    let gk = this.guanKa;
    let jn = gk - 1;
    let jnd = jn * 50;
    let js = sd - jnd;
    
    let zh = js;
    let zd = 100;
    if (js < zd) {
      zh = zd;
    }
    
    let xhq = setInterval(function() {
      let jszt = zg.youXiJieShu;
      let p1 = false;
      if (jszt === false) {
        p1 = true;
      }
      
      if (p1 === true) {
        zg.xiangXiaYiDong();
        zg.xuanRanHuaMian();
      }
    }, zh);
    
    this.youXiXunHuanQi = xhq;
  }

  xuanRanHuaMian() {
    let b = this.huaBi;
    let hb = this.huaBu;
    
    let bgys = '#1A237E';
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
    
    let fs = this.deFen;
    let fsStr = "FS:" + fs;
    let fsx = banK;
    b.fillText(fsStr, fsx, any);
    
    let hc = this.xiaoChuHangShu;
    let hcStr = "HC:" + hc;
    let hcx = banK + 80;
    b.fillText(hcStr, hcx, any);
    
    let ks = 'rgba(255,255,255,0.3)';
    b.strokeStyle = ks;
    
    let xk = 2;
    b.lineWidth = xk;
    
    let hkuan = this.zongLieShu * this.geZiDaXiao;
    let hgao = this.zongHangShu * this.geZiDaXiao;
    let hpx = this.pianYiX;
    let hpy = this.pianYiY;
    b.strokeRect(hpx, hpy, hkuan, hgao);
    
    let hh = this.zongHangShu;
    let ll = this.zongLieShu;
    
    for (let r = 0; r < hh; r++) {
      for (let c = 0; c < ll; c++) {
        let zhi = this.wangGeShuJu[r][c];
        
        let p1 = false;
        if (zhi !== 0) {
          if (zhi !== null) {
            if (zhi !== undefined) {
              p1 = true;
            }
          }
        }
        
        if (p1 === true) {
          b.fillStyle = zhi;
          let zx = hpx + (c * this.geZiDaXiao) + 1;
          let zy = hpy + (r * this.geZiDaXiao) + 1;
          let kd = this.geZiDaXiao - 2;
          b.fillRect(zx, zy, kd, kd);
        }
      }
    }
    
    let dff = this.dangQianFangKuai;
    let p2 = false;
    if (dff !== null && dff !== undefined) {
      p2 = true;
    }
    
    if (p2 === true) {
      let dys = this.dangQianYanSe;
      b.fillStyle = dys;
      
      let dr = dff.length;
      for (let nr = 0; nr < dr; nr++) {
        let dc = dff[nr].length;
        for (let nc = 0; nc < dc; nc++) {
          let zz = dff[nr][nc];
          
          let p3 = false;
          if (zz !== 0) {
            if (zz !== null) {
              if (zz !== undefined) {
                p3 = true;
              }
            }
          }
          
          if (p3 === true) {
            let rz = this.dangQianX + nc;
            let cz = this.dangQianY + nr;
            
            let dx = hpx + (rz * this.geZiDaXiao) + 1;
            let dy = hpy + (cz * this.geZiDaXiao) + 1;
            let dk = this.geZiDaXiao - 2;
            
            b.fillRect(dx, dy, dk, dk);
          }
        }
      }
    }
    
    let js = this.youXiJieShu;
    if (js === true) {
      let zhezhao = 'rgba(0,0,0,0.7)';
      b.fillStyle = zhezhao;
      b.fillRect(0, 0, hk, hg);
      
      let bys = '#FFF';
      b.fillStyle = bys;
      
      let daZi = 'bold 30px Arial';
      b.font = daZi;
      
      let dzX = hk / 2;
      let dzY = (hg / 2) - 20;
      let tsW = "JieShu";
      b.fillText(tsW, dzX, dzY);
      
      let xz = '20px Arial';
      b.font = xz;
      
      let fsZ = this.deFen;
      let zfStr = "ZongFen:" + fsZ;
      let zfX = hk / 2;
      let zfY = (hg / 2) + 20;
      b.fillText(zfStr, zfX, zfY);
    }
  }
}

module.exports = ELuoSiYouXi;