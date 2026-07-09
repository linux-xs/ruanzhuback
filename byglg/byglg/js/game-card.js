let peiZhi = require('./config.js');
let yanSeBiao = peiZhi.COLORS;
let buJuPeiZhi = peiZhi.LAYOUT;

class YouXiQiaPianZuJian {
  constructor(canShu, suoYinZhi) {
    let idZhi = canShu.id;
    this.bianHao = idZhi;
    
    let mc = canShu.name;
    this.mingCheng = mc;
    
    let lianJie = canShu.icon;
    this.tuBiaoLianJie = lianJie;
    
    let gg = canShu.adType;
    this.guangGaoLeiXing = gg;
    
    let xh = 0;
    if (canShu.energyCost !== undefined && canShu.energyCost !== null) {
      xh = canShu.energyCost;
    }
    this.tiLiXiaoHao = xh;
    
    let ms = "";
    if (canShu.description !== undefined && canShu.description !== null) {
      ms = canShu.description;
    }
    this.miaoShuWenBen = ms;
    
    let cb = false;
    if (canShu.hasSideBar !== undefined && canShu.hasSideBar !== null) {
      cb = canShu.hasSideBar;
    }
    this.shiFouYouCeBianLan = cb;
    
    this.zuoBiaoX = 0;
    this.zuoBiaoY = 0;
    this.kuanDu = 0;
    this.gaoDu = 0;
    
    this.tuBiaoDuiXiang = null;
    this.shiFouJiaZai = false;
    
    let sy = suoYinZhi;
    this.paiLieSuoYin = sy;
  }

  sheZhiBianJie(x, y, kuan, gao) {
    let nx = x;
    this.zuoBiaoX = nx;
    
    let ny = y;
    this.zuoBiaoY = ny;
    
    let nk = kuan;
    this.kuanDu = nk;
    
    let ng = gao;
    this.gaoDu = ng;
  }

  jiaZaiTuBiao() {
    let zhuangTai = this.shiFouJiaZai;
    if (zhuangTai === true) {
      return;
    }
    
    let xinTuBiao = tt.createImage();
    let luJing = this.tuBiaoLianJie;
    xinTuBiao.src = luJing;
    
    let duiXiangBaoCun = this;
    xinTuBiao.onload = function() {
      duiXiangBaoCun.shiFouJiaZai = true;
    };
    
    xinTuBiao.onerror = function() {
      duiXiangBaoCun.shiFouJiaZai = false;
    };
    
    this.tuBiaoDuiXiang = xinTuBiao;
  }

  xuanRanQiaPian(huaBu) {
    let x = this.zuoBiaoX;
    let y = this.zuoBiaoY;
    let k = this.kuanDu;
    let g = this.gaoDu;
    let banJing = buJuPeiZhi.cardRadius;

    let bjYanSe = yanSeBiao.bgCard;
    huaBu.fillStyle = bjYanSe;
    this.huaYuanJiaoJuXing(huaBu, x, y, k, g, banJing);
    huaBu.fill();

    let bianKuang = 'rgba(255,255,255,0.3)';
    huaBu.strokeStyle = bianKuang;
    
    let xianKuan = 2;
    huaBu.lineWidth = xianKuan;
    this.huaYuanJiaoJuXing(huaBu, x, y, k, g, banJing);
    huaBu.stroke();

    let tbDaxiao = k * 0.6;
    let shengYuKuan = k - tbDaxiao;
    let yiBaan = shengYuKuan / 2;
    let tbX = x + yiBaan;
    let pianYiY = g * 0.15;
    let tbY = y + pianYiY;

    let baiSe = '#FFFFFF';
    huaBu.fillStyle = baiSe;
    
    let xiaoBanJing = 10;
    this.huaYuanJiaoJuXing(huaBu, tbX, tbY, tbDaxiao, tbDaxiao, xiaoBanJing);
    huaBu.fill();

    let jz = this.shiFouJiaZai;
    let tb = this.tuBiaoDuiXiang;
    
    let keyiHua = false;
    if (jz === true) {
      if (tb !== null && tb !== undefined) {
        keyiHua = true;
      }
    }

    if (keyiHua === true) {
      let dx = tbX + 5;
      let dy = tbY + 5;
      let dk = tbDaxiao - 10;
      let dg = tbDaxiao - 10;
      huaBu.drawImage(tb, dx, dy, dk, dg);
    } else {
      let huiSe = '#CCCCCC';
      huaBu.fillStyle = huiSe;
      
      let ziHao = tbDaxiao * 0.4;
      let ziTi = ziHao + "px Arial";
      huaBu.font = ziTi;
      
      let duiQi = 'center';
      huaBu.textAlign = duiQi;
      
      let jiXian = 'middle';
      huaBu.textBaseline = jiXian;
      
      let zhongXinX = tbX + (tbDaxiao / 2);
      let zhongXinY = tbY + (tbDaxiao / 2);
      let wenHao = "?";
      huaBu.fillText(wenHao, zhongXinX, zhongXinY);
    }

    let wenZiYanSe = yanSeBiao.textPrimary;
    huaBu.fillStyle = wenZiYanSe;
    
    let mingChengZiHao = k * 0.14;
    let mingChengZiTi = "bold " + mingChengZiHao + "px Arial";
    huaBu.font = mingChengZiTi;
    
    let mcDuiQi = 'center';
    huaBu.textAlign = mcDuiQi;
    
    let mcJiXian = 'middle';
    huaBu.textBaseline = mcJiXian;
    
    let mcX = x + (k / 2);
    let mcPianYi = g * 0.75;
    let mcY = y + mcPianYi;
    let mcWenZi = this.mingCheng;
    huaBu.fillText(mcWenZi, mcX, mcY);

    this.xuanRanBiaoQian(huaBu);

    let ms = this.miaoShuWenBen;
    let panDuanMs = false;
    if (ms !== "") {
      panDuanMs = true;
    }
    
    if (panDuanMs === true) {
      let msYanSe = yanSeBiao.textSecondary;
      huaBu.fillStyle = msYanSe;
      
      let msZiHao = k * 0.1;
      let msZiTi = msZiHao + "px Arial";
      huaBu.font = msZiTi;
      
      let msY = y + (g * 0.88);
      huaBu.fillText(ms, mcX, msY);
    }
  }

  xuanRanBiaoQian(huaBu) {
    let x = this.zuoBiaoX;
    let y = this.zuoBiaoY;
    let k = this.kuanDu;
    let g = this.gaoDu;
    
    let bqDx = k * 0.12;
    let bqX = x + k - bqDx - 5;
    let bqY = y + 5;
    
    let lx = this.guangGaoLeiXing;

    if (lx === 'energy') {
      let tlYs = yanSeBiao.energy;
      huaBu.fillStyle = tlYs;
      
      huaBu.beginPath();
      let yuanXinX = bqX + (bqDx / 2);
      let yuanXinY = bqY + (bqDx / 2);
      let yuanBanJing = bqDx / 2;
      huaBu.arc(yuanXinX, yuanXinY, yuanBanJing, 0, Math.PI * 2);
      huaBu.fill();
      
      let bYs = '#FFFFFF';
      huaBu.fillStyle = bYs;
      
      let zHao = bqDx * 0.6;
      let zTi = "bold " + zHao + "px Arial";
      huaBu.font = zTi;
      
      let dQi = 'center';
      huaBu.textAlign = dQi;
      
      let jXian = 'middle';
      huaBu.textBaseline = jXian;
      
      let xh = this.tiLiXiaoHao;
      let wZ = "TL" + xh;
      huaBu.fillText(wZ, yuanXinX, yuanXinY);
      
    } else if (lx === 'free') {
      let mfYs = yanSeBiao.adFree;
      huaBu.fillStyle = mfYs;
      
      let kuanDuB = bqDx * 2.5;
      let bjB = bqDx / 2;
      this.huaYuanJiaoJuXing(huaBu, bqX, bqY, kuanDuB, bqDx, bjB);
      huaBu.fill();
      
      let bYs2 = '#FFFFFF';
      huaBu.fillStyle = bYs2;
      
      let zHao2 = bqDx * 0.5;
      let zTi2 = "bold " + zHao2 + "px Arial";
      huaBu.font = zTi2;
      
      let dQi2 = 'center';
      huaBu.textAlign = dQi2;
      
      let jXian2 = 'middle';
      huaBu.textBaseline = jXian2;
      
      let wZ2 = "MianGg";
      let zxX = bqX + (bqDx * 1.25);
      let zxY = bqY + (bqDx / 2);
      huaBu.fillText(wZ2, zxX, zxY);
      
    } else if (lx === 'video') {
      let spYs = yanSeBiao.ad;
      huaBu.fillStyle = spYs;
      
      huaBu.beginPath();
      let yuanXinX3 = bqX + (bqDx / 2);
      let yuanXinY3 = bqY + (bqDx / 2);
      let yuanBanJing3 = bqDx / 2;
      huaBu.arc(yuanXinX3, yuanXinY3, yuanBanJing3, 0, Math.PI * 2);
      huaBu.fill();
      
      let bYs3 = '#FFFFFF';
      huaBu.fillStyle = bYs3;
      
      let zHao3 = bqDx * 0.6;
      let zTi3 = zHao3 + "px Arial";
      huaBu.font = zTi3;
      
      let dQi3 = 'center';
      huaBu.textAlign = dQi3;
      
      let jXian3 = 'middle';
      huaBu.textBaseline = jXian3;
      
      let wZ3 = "SP";
      huaBu.fillText(wZ3, yuanXinX3, yuanXinY3);
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

  baohanDian(cmX, cmY) {
    let t1 = false;
    if (cmX >= this.zuoBiaoX) {
      if (cmX <= (this.zuoBiaoX + this.kuanDu)) {
        t1 = true;
      }
    }
    
    let t2 = false;
    if (cmY >= this.zuoBiaoY) {
      if (cmY <= (this.zuoBiaoY + this.gaoDu)) {
        t2 = true;
      }
    }
    
    if (t1 === true) {
      if (t2 === true) {
        return true;
      }
    }
    return false;
  }
}

module.exports = YouXiQiaPianZuJian;