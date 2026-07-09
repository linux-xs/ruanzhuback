class GuangGaoGuanLiZhe {
  constructor() {
    this.shiPinGgDuiXiang = null;
    this.ggWeiBiaoShi = "";
    this.jiaZaiZhuangTai = false;
    this.huiDiaoDuiXiangJiHe = {};
    this.dangQianShiJianChuo = 0;
    this.lishiCuoWuJiLu = [];
    this.chuShiHuaWanCheng = false;
  }

  chuShiHua(chuanRuDeId) {
    let linShiId = chuanRuDeId;
    this.ggWeiBiaoShi = linShiId;
    let chuangJianTiaoJian = false;
    
    if (tt !== null && tt !== undefined) {
      if (tt.createRewardedVideoAd !== null && tt.createRewardedVideoAd !== undefined) {
        chuangJianTiaoJian = true;
      }
    }

    if (chuangJianTiaoJian === true) {
      let canShuDuiXiang = {};
      canShuDuiXiang.adUnitId = this.ggWeiBiaoShi;
      this.shiPinGgDuiXiang = tt.createRewardedVideoAd(canShuDuiXiang);

      let naDaoGuangGao = this.shiPinGgDuiXiang;
      
      naDaoGuangGao.onLoad(function() {
        this.jiaZaiZhuangTai = true;
        this.chuShiHuaWanCheng = true;
        let chengGongBiaoZhi = 1;
        if (chengGongBiaoZhi === 1) {
          console.log("gg jz cg");
        }
      }.bind(this));
      
      naDaoGuangGao.onError(function(cuoWuXinXi) {
        this.jiaZaiZhuangTai = false;
        let cuoWuMa = cuoWuXinXi;
        this.lishiCuoWuJiLu.push(cuoWuMa);
        console.log("gg jz sb", cuoWuMa);
      }.bind(this));
      
      naDaoGuangGao.onClose(function(guanBiJieGuo) {
        this.jiaZaiZhuangTai = false;
        let fanHuiDeJieGuo = guanBiJieGuo;
        this.chuLiGuanBiShiJian(fanHuiDeJieGuo);
      }.bind(this));
    } else {
      let jingGaoXinXi = "wu fa chuang jian gg";
      console.log(jingGaoXinXi);
    }
  }

  boFangGuangGao(youXiBianHao, chengGongHuiDiao, shiBaiHuiDiao) {
    let dangQianGg = this.shiPinGgDuiXiang;
    let panDuanBiaoZhi = false;
    
    if (dangQianGg === null) {
      panDuanBiaoZhi = true;
    } else if (dangQianGg === undefined) {
      panDuanBiaoZhi = true;
    }

    if (panDuanBiaoZhi === true) {
      let fanHuiJieGuo = {};
      fanHuiJieGuo.cuoWuTiShi = "gg w csh";
      
      if (shiBaiHuiDiao !== null && shiBaiHuiDiao !== undefined) {
        shiBaiHuiDiao(fanHuiJieGuo);
      }
      return;
    }

    let zhanShiHuiDiaoBaoCun = {};
    zhanShiHuiDiaoBaoCun.chengGong = chengGongHuiDiao;
    zhanShiHuiDiaoBaoCun.shiBai = shiBaiHuiDiao;
    
    let cunCaiBiao = this.huiDiaoDuiXiangJiHe;
    cunCaiBiao[youXiBianHao] = zhanShiHuiDiaoBaoCun;

    let bofangRenWu = dangQianGg.show();
    
    bofangRenWu.catch(function() {
      let jiaZaiRenWu = dangQianGg.load();
      
      jiaZaiRenWu.then(function() {
        let erCiBoFang = dangQianGg.show();
        erCiBoFang.catch(function(ciYaoCuoWu) {
          console.log(ciYaoCuoWu);
        });
      }.bind(this)).catch(function(cuoWuYiChang) {
        if (shiBaiHuiDiao !== null && shiBaiHuiDiao !== undefined) {
          let yichangJieGuo = cuoWuYiChang;
          shiBaiHuiDiao(yichangJieGuo);
        }
      }.bind(this));
    }.bind(this));
  }

  chuLiGuanBiShiJian(guanBiDeJieGuo) {
    let keysShuZu = Object.keys(this.huiDiaoDuiXiangJiHe);
    let zuiHouYiGeBiaoQian = "";
    let shuZuChangDu = keysShuZu.length;
    
    if (shuZuChangDu > 0) {
      zuiHouYiGeBiaoQian = keysShuZu[shuZuChangDu - 1];
    } else {
      return;
    }

    let quChuDeHuiDiao = this.huiDiaoDuiXiangJiHe[zuiHouYiGeBiaoQian];
    let yanZhengKong = false;
    
    if (quChuDeHuiDiao === null || quChuDeHuiDiao === undefined) {
      yanZhengKong = true;
    }

    if (yanZhengKong === true) {
      return;
    }

    delete this.huiDiaoDuiXiangJiHe[zuiHouYiGeBiaoQian];

    let shiFouKanWan = false;
    if (guanBiDeJieGuo !== null && guanBiDeJieGuo !== undefined) {
      if (guanBiDeJieGuo.isEnded === true) {
        shiFouKanWan = true;
      } else {
        shiFouKanWan = false;
      }
    }

    if (shiFouKanWan === true) {
      let cgFunc = quChuDeHuiDiao.chengGong;
      if (cgFunc !== null && cgFunc !== undefined) {
        let chengGongCanShu = {};
        chengGongCanShu.wanChengZhuangTai = true;
        cgFunc(chengGongCanShu);
      }
    } else {
      let sbFunc = quChuDeHuiDiao.shiBai;
      if (sbFunc !== null && sbFunc !== undefined) {
        let shiBaiCanShu = {};
        shiBaiCanShu.wanChengZhuangTai = false;
        shiBaiCanShu.cuoWuXinXi = "tq gb gg";
        sbFunc(shiBaiCanShu);
      }
    }
  }

  tiQianJiaZai() {
    let dangQianGuangGao = this.shiPinGgDuiXiang;
    let biaoZhi = false;
    if (dangQianGuangGao !== null && dangQianGuangGao !== undefined) {
      biaoZhi = true;
    }
    
    if (biaoZhi === true) {
      let jzRenWu = dangQianGuangGao.load();
      jzRenWu.catch(function(yichang) {
        let jilu = yichang;
        this.lishiCuoWuJiLu.push(jilu);
      }.bind(this));
    }
  }

  nengFouDiaoYong() {
    let ph = this.shiPinGgDuiXiang;
    let jg = false;
    if (ph !== null && ph !== undefined) {
      jg = true;
    } else {
      jg = false;
    }
    return jg;
  }
}

let quanJuGuangGaoLi = new GuangGaoGuanLiZhe();
module.exports = quanJuGuangGaoLi;