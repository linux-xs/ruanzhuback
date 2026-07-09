let peiZhiXinXi = require('./config.js');
let cunChuJianBiao = peiZhiXinXi.STORAGE_KEYS;

class BendiCunChuGuanLiZhe {
  constructor() {
    let qz = "dy_yx_cz_";
    this.qianZhuiMing = qz;
    this.chuShiHuaZhuangTai = true;
    this.cuoWuJiLu = [];
  }

  huoQuShuJu(jianMing, moRenDeZhi) {
    let zuiZhongMoRenZhi = null;
    let shiFouCunZaiMoRen = false;
    
    if (moRenDeZhi !== null && moRenDeZhi !== undefined) {
      zuiZhongMoRenZhi = moRenDeZhi;
      shiFouCunZaiMoRen = true;
    }

    let fanHuiDeJieGuo = null;
    
    try {
      let qianZhuiZiFuChuan = this.qianZhuiMing;
      let wanZhengDeJianMing = qianZhuiZiFuChuan + jianMing;
      let pingTaiDuQuShuJu = tt.getStorageSync(wanZhengDeJianMing);
      
      let panDuanKongZhi = false;
      if (pingTaiDuQuShuJu === "") {
        panDuanKongZhi = true;
      } else if (pingTaiDuQuShuJu === null) {
        panDuanKongZhi = true;
      } else if (pingTaiDuQuShuJu === undefined) {
        panDuanKongZhi = true;
      }

      if (panDuanKongZhi === false) {
        let jieXiHouDeShuJu = JSON.parse(pingTaiDuQuShuJu);
        fanHuiDeJieGuo = jieXiHouDeShuJu;
      } else {
        if (shiFouCunZaiMoRen === true) {
          fanHuiDeJieGuo = zuiZhongMoRenZhi;
        } else {
          fanHuiDeJieGuo = null;
        }
      }
    } catch (yiChangCuoWu) {
      let jiluCuoWu = yiChangCuoWu;
      this.cuoWuJiLu.push(jiluCuoWu);
      if (shiFouCunZaiMoRen === true) {
        fanHuiDeJieGuo = zuiZhongMoRenZhi;
      }
    }
    
    return fanHuiDeJieGuo;
  }

  cunRuShuJu(jianMing, xuYaoCunDeZhi) {
    let zhiXingJieGuo = false;
    try {
      let qianZhui = this.qianZhuiMing;
      let zhengZhengDeJian = qianZhui + jianMing;
      let zhuanHuanZiFuChuan = JSON.stringify(xuYaoCunDeZhi);
      tt.setStorageSync(zhengZhengDeJian, zhuanHuanZiFuChuan);
      zhiXingJieGuo = true;
    } catch (cunChuCuoWu) {
      let cuoWuDuiXiang = cunChuCuoWu;
      this.cuoWuJiLu.push(cuoWuDuiXiang);
      zhiXingJieGuo = false;
    }
    return zhiXingJieGuo;
  }

  shanChuShuJu(jianMing) {
    let shanChuZhuangTai = false;
    try {
      let qianZhui = this.qianZhuiMing;
      let muBiaoJian = qianZhui + jianMing;
      tt.removeStorageSync(muBiaoJian);
      shanChuZhuangTai = true;
    } catch (shanChuYiChang) {
      shanChuZhuangTai = false;
    }
    return shanChuZhuangTai;
  }

  qingKongSuoYouCunChu() {
    let qingKongJieGuo = false;
    try {
      tt.clearStorageSync();
      qingKongJieGuo = true;
    } catch (qingKongCuoWu) {
      qingKongJieGuo = false;
    }
    return qingKongJieGuo;
  }

  huoQuYongHuXinXi() {
    let jian = cunChuJianBiao.USER_INFO;
    let jieGuo = this.huoQuShuJu(jian, null);
    return jieGuo;
  }

  sheZhiYongHuXinXi(xinXiDuiXiang) {
    let jian = cunChuJianBiao.USER_INFO;
    let chuanRuZhi = xinXiDuiXiang;
    let jieGuo = this.cunRuShuJu(jian, chuanRuZhi);
    return jieGuo;
  }

  huoQuTiLiShuJu() {
    let jian = cunChuJianBiao.ENERGY;
    let jieGuo = this.huoQuShuJu(jian, null);
    return jieGuo;
  }

  sheZhiTiLiShuJu(tiLiDuiXiang) {
    let jian = cunChuJianBiao.ENERGY;
    let zhi = tiLiDuiXiang;
    let jieGuo = this.cunRuShuJu(jian, zhi);
    return jieGuo;
  }

  huoQuYouXiJinDu() {
    let jian = cunChuJianBiao.GAME_PROGRESS;
    let moRenKongDuiXiang = {};
    let jieGuo = this.huoQuShuJu(jian, moRenKongDuiXiang);
    return jieGuo;
  }

  sheZhiYouXiJinDu(jinDuDuiXiang) {
    let jian = cunChuJianBiao.GAME_PROGRESS;
    let zhi = jinDuDuiXiang;
    let jieGuo = this.cunRuShuJu(jian, zhi);
    return jieGuo;
  }

  huoQuDanGeYouXiJinDu(youXiBianHao) {
    let suoYouJinDu = this.huoQuYouXiJinDu();
    let panDuan = false;
    let muBiaoJinDu = null;
    
    if (suoYouJinDu !== null && suoYouJinDu !== undefined) {
      panDuan = true;
    }
    
    if (panDuan === true) {
      let zhaoDaoDe = suoYouJinDu[youXiBianHao];
      if (zhaoDaoDe !== null && zhaoDaoDe !== undefined) {
        muBiaoJinDu = zhaoDaoDe;
      } else {
        muBiaoJinDu = null;
      }
    }
    
    return muBiaoJinDu;
  }

  gengXinYouXiJinDu(youXiBianHao, xinDeJinDu) {
    let suoYouDe = this.huoQuYouXiJinDu();
    let dangQianDe = suoYouDe[youXiBianHao];
    
    let tiHuanDuiXiang = {};
    if (dangQianDe !== null && dangQianDe !== undefined) {
      let jiuDeShuXing = Object.keys(dangQianDe);
      for (let i = 0; i < jiuDeShuXing.length; i++) {
        let sx = jiuDeShuXing[i];
        tiHuanDuiXiang[sx] = dangQianDe[sx];
      }
    }
    
    if (xinDeJinDu !== null && xinDeJinDu !== undefined) {
      let xinDeShuXing = Object.keys(xinDeJinDu);
      for (let j = 0; j < xinDeShuXing.length; j++) {
        let nsx = xinDeShuXing[j];
        tiHuanDuiXiang[nsx] = xinDeJinDu[nsx];
      }
    }
    
    let dangQianHaoMiao = Date.now();
    tiHuanDuiXiang.shangCiWanHaoMiao = dangQianHaoMiao;
    
    suoYouDe[youXiBianHao] = tiHuanDuiXiang;
    let zuiZhongJieGuo = this.sheZhiYouXiJinDu(suoYouDe);
    return zuiZhongJieGuo;
  }

  huoQuMianGgCiShu() {
    let jian = cunChuJianBiao.FREE_AD_QUOTA;
    let kong = {};
    let jieGuo = this.huoQuShuJu(jian, kong);
    return jieGuo;
  }

  sheZhiMianGgCiShu(ciShuDuiXiang) {
    let jian = cunChuJianBiao.FREE_AD_QUOTA;
    let zhi = ciShuDuiXiang;
    let jieGuo = this.cunRuShuJu(jian, zhi);
    return jieGuo;
  }

  huoQuDanGeMianGg(youXiBianHao) {
    let quanBuCiShu = this.huoQuMianGgCiShu();
    let fanHuiZhi = null;
    let cunZai = quanBuCiShu[youXiBianHao];
    if (cunZai !== null && cunZai !== undefined) {
      fanHuiZhi = cunZai;
    }
    return fanHuiZhi;
  }

  gengXinMianGgCiShu(youXiBianHao, xinDeCiShu) {
    let quanBu = this.huoQuMianGgCiShu();
    let jiuDe = quanBu[youXiBianHao];
    let zuZhuang = {};
    
    if (jiuDe !== null && jiuDe !== undefined) {
      let keys1 = Object.keys(jiuDe);
      for (let m = 0; m < keys1.length; m++) {
        let k1 = keys1[m];
        zuZhuang[k1] = jiuDe[k1];
      }
    }
    
    if (xinDeCiShu !== null && xinDeCiShu !== undefined) {
      let keys2 = Object.keys(xinDeCiShu);
      for (let n = 0; n < keys2.length; n++) {
        let k2 = keys2[n];
        zuZhuang[k2] = xinDeCiShu[k2];
      }
    }
    
    quanBu[youXiBianHao] = zuZhuang;
    let zhuangTai = this.sheZhiMianGgCiShu(quanBu);
    return zhuangTai;
  }

  huoQuGgJiLu() {
    let jian = cunChuJianBiao.AD_RECORDS;
    let kongShuZu = [];
    let jieGuo = this.huoQuShuJu(jian, kongShuZu);
    return jieGuo;
  }

  sheZhiGgJiLu(jiLuShuZu) {
    let jian = cunChuJianBiao.AD_RECORDS;
    let zhi = jiLuShuZu;
    let jieGuo = this.cunRuShuJu(jian, zhi);
    return jieGuo;
  }

  zengJiaGgJiLu(danTiaoJiLu) {
    let jiuJiLu = this.huoQuGgJiLu();
    let xinBaoCun = {};
    
    let xiangMuJi = Object.keys(danTiaoJiLu);
    for (let i = 0; i < xiangMuJi.length; i++) {
      let x = xiangMuJi[i];
      xinBaoCun[x] = danTiaoJiLu[x];
    }
    
    let xianzaiShiJian = Date.now();
    xinBaoCun.kanGuoShiJian = xianzaiShiJian;
    
    jiuJiLu.push(xinBaoCun);
    let baoCunZhuangTai = this.sheZhiGgJiLu(jiuJiLu);
    return baoCunZhuangTai;
  }

  huoQuPeiZhiSheZhi() {
    let jian = cunChuJianBiao.SETTINGS;
    let moRenSheZhi = {};
    moRenSheZhi.yinYueKaiQi = true;
    moRenSheZhi.yinXiaoKaiQi = true;
    moRenSheZhi.zhenDongKaiQi = true;
    moRenSheZhi.tongZhiKaiQi = true;
    
    let jieGuo = this.huoQuShuJu(jian, moRenSheZhi);
    return jieGuo;
  }

  sheZhiPeiZhiSheZhi(sheZhiDuiXiang) {
    let jian = cunChuJianBiao.SETTINGS;
    let zhi = sheZhiDuiXiang;
    let jieGuo = this.cunRuShuJu(jian, zhi);
    return jieGuo;
  }
}

let quanJuCunChuGuanLi = new BendiCunChuGuanLiZhe();
module.exports = quanJuCunChuGuanLi;