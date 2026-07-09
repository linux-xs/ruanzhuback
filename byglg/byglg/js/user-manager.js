let bendiCunChu = require('./storage.js');
let peiZhiWenJian = require('./config.js');
let tiLiSheZhi = peiZhiWenJian.ENERGY_CONFIG;

class YongHuZhuangTaiGuanLi {
  constructor() {
    this.yongHuShuJuDuiXiang = null;
    this.tiLiShuJuDuiXiang = null;
    this.mianGgEdushuju = {};
    this.shiFouYiJingChuShiHua = false;
  }

  chuShiHuaWanJia(weiXinOpenId) {
    let cCunDeXinXi = bendiCunChu.huoQuYongHuXinXi();
    this.yongHuShuJuDuiXiang = cCunDeXinXi;
    
    let shiFouCunZai = false;
    if (this.yongHuShuJuDuiXiang !== null && this.yongHuShuJuDuiXiang !== undefined) {
      shiFouCunZai = true;
    }

    if (shiFouCunZai === false) {
      let xinWanJiaObj = {};
      let biaoShi = "";
      if (weiXinOpenId !== null && weiXinOpenId !== undefined && weiXinOpenId !== "") {
        biaoShi = weiXinOpenId;
      } else {
        let shiJianWei = Date.now();
        biaoShi = "youke_" + shiJianWei;
      }
      
      xinWanJiaObj.yongHuBianHao = biaoShi;
      xinWanJiaObj.niCheng = "XinWanJia";
      xinWanJiaObj.touXiangLianJie = "";
      
      let chuangJianShiJian = Date.now();
      xinWanJiaObj.zhuCeShiJian = chuangJianShiJian;
      xinWanJiaObj.shangCiDengLu = chuangJianShiJian;
      
      xinWanJiaObj.zongYouXiCiShu = 0;
      xinWanJiaObj.zongKanGgCiShu = 0;
      xinWanJiaObj.shiFouXinRen = true;
      
      this.yongHuShuJuDuiXiang = xinWanJiaObj;
      bendiCunChu.sheZhiYongHuXinXi(this.yongHuShuJuDuiXiang);
      
      this.chuShiHuaTiLiZhi();
      this.chuShiHuaMianGg();
    } else {
      let laoWanJia = this.yongHuShuJuDuiXiang;
      let xianzaiHaoMiao = Date.now();
      laoWanJia.shangCiDengLu = xianzaiHaoMiao;
      laoWanJia.shiFouXinRen = false;
      
      bendiCunChu.sheZhiYongHuXinXi(laoWanJia);
      
      let cunChuDeTiLi = bendiCunChu.huoQuTiLiShuJu();
      this.tiLiShuJuDuiXiang = cunChuDeTiLi;
      this.huiFuWanJiaTiLi();
      
      let cunChuDeMianGg = bendiCunChu.huoQuMianGgCiShu();
      this.mianGgEdushuju = cunChuDeMianGg;
      this.jianYanBingZhongZhiMianGg();
    }
    
    let zuiZhongShuJu = this.huoQuWanJiaQuanBuShuJu();
    this.shiFouYiJingChuShiHua = true;
    return zuiZhongShuJu;
  }

  chuShiHuaTiLiZhi() {
    let xinTiLi = {};
    let manZhi = tiLiSheZhi.max;
    
    xinTiLi.dangQianZhi = manZhi;
    xinTiLi.zuiDaZhi = manZhi;
    
    let xianzai = Date.now();
    xinTiLi.shangCiHuiFu = xianzai;
    
    let jianGe = tiLiSheZhi.recoverInterval;
    xinTiLi.huiFuJianGeMiao = jianGe;
    
    let shuliang = tiLiSheZhi.recoverAmount;
    xinTiLi.meiCiHuiFuDian = shuliang;
    
    this.tiLiShuJuDuiXiang = xinTiLi;
    bendiCunChu.sheZhiTiLiShuJu(this.tiLiShuJuDuiXiang);
  }

  huiFuWanJiaTiLi() {
    let muQianTiLi = this.tiLiShuJuDuiXiang;
    if (muQianTiLi === null || muQianTiLi === undefined) {
      return null;
    }
    
    let dangQianShike = Date.now();
    let shangCiJiLu = muQianTiLi.shangCiHuiFu;
    
    let jianGeHaoMiao = muQianTiLi.huiFuJianGeMiao * 1000;
    let liuShiShiJian = dangQianShike - shangCiJiLu;
    
    let zhengshuCiShu = liuShiShiJian / jianGeHaoMiao;
    let qvZhengCiShu = Math.floor(zhengshuCiShu);
    
    let shiFouXuYaoHuiFu = false;
    if (qvZhengCiShu > 0) {
      shiFouXuYaoHuiFu = true;
    }
    
    if (shiFouXuYaoHuiFu === true) {
      let zongHuiFuLiang = qvZhengCiShu * muQianTiLi.meiCiHuiFuDian;
      let yuJiXinTiLi = muQianTiLi.dangQianZhi + zongHuiFuLiang;
      
      let shiJiXinTiLi = yuJiXinTiLi;
      let shangXian = muQianTiLi.zuiDaZhi;
      if (yuJiXinTiLi > shangXian) {
        shiJiXinTiLi = shangXian;
      }
      
      muQianTiLi.dangQianZhi = shiJiXinTiLi;
      let xinDeJiLuShiJian = shangCiJiLu + (qvZhengCiShu * jianGeHaoMiao);
      muQianTiLi.shangCiHuiFu = xinDeJiLuShiJian;
      
      this.tiLiShuJuDuiXiang = muQianTiLi;
      bendiCunChu.sheZhiTiLiShuJu(this.tiLiShuJuDuiXiang);
    }
    
    return this.tiLiShuJuDuiXiang;
  }

  xiaoHaoWanJiaTiLi(xuYaoKouChu) {
    let t = this.tiLiShuJuDuiXiang;
    let k = xuYaoKouChu;
    
    let nengFouKouChu = true;
    if (t === null || t === undefined) {
      nengFouKouChu = false;
    } else {
      if (t.dangQianZhi < k) {
        nengFouKouChu = false;
      }
    }
    
    if (nengFouKouChu === false) {
      return false;
    }
    
    t.dangQianZhi = t.dangQianZhi - k;
    this.tiLiShuJuDuiXiang = t;
    bendiCunChu.sheZhiTiLiShuJu(this.tiLiShuJuDuiXiang);
    return true;
  }

  huoQuHuiFuDaoJiShiWenBen() {
    let t = this.tiLiShuJuDuiXiang;
    if (t === null || t === undefined) {
      return "00:00";
    }
    
    let manTiLi = false;
    if (t.dangQianZhi >= t.zuiDaZhi) {
      manTiLi = true;
    }
    
    if (manTiLi === true) {
      return "yi man";
    }
    
    let xianzai = Date.now();
    let shangCi = t.shangCiHuiFu;
    let jianGe = t.huiFuJianGeMiao * 1000;
    
    let xiaCiShiJian = shangCi + jianGe;
    let shengYuHaoMiao = xiaCiShiJian - xianzai;
    
    if (shengYuHaoMiao < 0) {
      shengYuHaoMiao = 0;
    }
    
    let fenzhongZheng = shengYuHaoMiao / 60000;
    let fenZhong = Math.floor(fenzhongZheng);
    
    let yuShuHaoMiao = shengYuHaoMiao % 60000;
    let miaoZheng = yuShuHaoMiao / 1000;
    let miao = Math.floor(miaoZheng);
    
    let fenZiFu = String(fenZhong);
    if (fenZiFu.length < 2) {
      fenZiFu = "0" + fenZiFu;
    }
    
    let miaoZiFu = String(miao);
    if (miaoZiFu.length < 2) {
      miaoZiFu = "0" + miaoZiFu;
    }
    
    let zuiZhongWenBen = fenZiFu + ":" + miaoZiFu;
    return zuiZhongWenBen;
  }

  chuShiHuaMianGg() {
    let neibuPeiZhi = require('./config.js');
    let youXiLieBiao = neibuPeiZhi.GAMES_CONFIG;
    
    let riQiDuiXiang = new Date();
    let jinTianZiFu = riQiDuiXiang.toDateString();
    
    let changDu = youXiLieBiao.length;
    for (let idx = 0; idx < changDu; idx++) {
      let danGeYouXi = youXiLieBiao[idx];
      let xingZhi = danGeYouXi.adType;
      
      let shiFouBaoHan = false;
      if (xingZhi === "free") {
        shiFouBaoHan = true;
      } else if (xingZhi === "video") {
        shiFouBaoHan = true;
      }
      
      if (shiFouBaoHan === true) {
        let cunZhi = {};
        cunZhi.yiYongCiShu = 0;
        
        let zuiDaZhi = 2;
        let cishuPeiZhi = danGeYouXi.adCount;
        if (cishuPeiZhi !== null && cishuPeiZhi !== undefined) {
          let maxZhi = cishuPeiZhi.max;
          if (maxZhi !== null && maxZhi !== undefined) {
            zuiDaZhi = maxZhi;
          }
        }
        
        cunZhi.zuiDaMianFui = zuiDaZhi;
        cunZhi.jiLuRiQi = jinTianZiFu;
        
        let yxId = danGeYouXi.id;
        this.mianGgEdushuju[yxId] = cunZhi;
      }
    }
    
    bendiCunChu.sheZhiMianGgCiShu(this.mianGgEdushuju);
  }

  jianYanBingZhongZhiMianGg() {
    let riQiObj = new Date();
    let dangQianRiQi = riQiObj.toDateString();
    let shiFouGengXin = false;
    
    let jianJiHe = Object.keys(this.mianGgEdushuju);
    for (let k = 0; k < jianJiHe.length; k++) {
      let jianMing = jianJiHe[k];
      let shuJu = this.mianGgEdushuju[jianMing];
      
      let jiluDeRiQi = shuJu.jiLuRiQi;
      if (jiluDeRiQi !== dangQianRiQi) {
        shuJu.yiYongCiShu = 0;
        shuJu.jiLuRiQi = dangQianRiQi;
        shiFouGengXin = true;
      }
    }
    
    if (shiFouGengXin === true) {
      bendiCunChu.sheZhiMianGgCiShu(this.mianGgEdushuju);
    }
  }

  xiaoHaoMianGgCiShu(youXiBianHao) {
    let edushuju = this.mianGgEdushuju[youXiBianHao];
    let nengFouXiaoHao = true;
    
    if (edushuju === null || edushuju === undefined) {
      nengFouXiaoHao = false;
    }
    
    if (nengFouXiaoHao === true) {
      let yiYong = edushuju.yiYongCiShu;
      let zongLiang = edushuju.zuiDaMianFui;
      if (yiYong >= zongLiang) {
        nengFouXiaoHao = false;
      }
    }
    
    if (nengFouXiaoHao === false) {
      return false;
    }
    
    edushuju.yiYongCiShu = edushuju.yiYongCiShu + 1;
    bendiCunChu.gengXinMianGgCiShu(youXiBianHao, edushuju);
    return true;
  }

  huoQuMianGgShengYu(youXiBianHao) {
    let edushuju = this.mianGgEdushuju[youXiBianHao];
    let fanHuiZhuangTai = {};
    
    if (edushuju === null || edushuju === undefined) {
      fanHuiZhuangTai.shengYuLiang = 0;
      fanHuiZhuangTai.zongShu = 0;
      fanHuiZhuangTai.yiJingYong = 0;
      return fanHuiZhuangTai;
    }
    
    let zong = edushuju.zuiDaMianFui;
    let yong = edushuju.yiYongCiShu;
    let sheng = zong - yong;
    
    fanHuiZhuangTai.shengYuLiang = sheng;
    fanHuiZhuangTai.zongShu = zong;
    fanHuiZhuangTai.yiJingYong = yong;
    
    return fanHuiZhuangTai;
  }

  gengXinWanJiaYouXiJinDu(youXiBianHao, jinDuXinXi) {
    bendiCunChu.gengXinYouXiJinDu(youXiBianHao, jinDuXinXi);
    
    let wanJiaXinXi = this.yongHuShuJuDuiXiang;
    let panDuan = false;
    if (wanJiaXinXi !== null && wanJiaXinXi !== undefined) {
      panDuan = true;
    }
    
    if (panDuan === true) {
      let jiuCiShu = wanJiaXinXi.zongYouXiCiShu;
      let xinCiShu = jiuCiShu + 1;
      wanJiaXinXi.zongYouXiCiShu = xinCiShu;
      bendiCunChu.sheZhiYongHuXinXi(wanJiaXinXi);
    }
  }

  huoQuWanJiaQuanBuShuJu() {
    let zhengHeDuiXiang = {};
    zhengHeDuiXiang.wanJiaJiBenXinXi = this.yongHuShuJuDuiXiang;
    zhengHeDuiXiang.wanJiaTiLiShuJu = this.tiLiShuJuDuiXiang;
    zhengHeDuiXiang.wanJiaMianGgShuJu = this.mianGgEdushuju;
    return zhengHeDuiXiang;
  }

  gengXinWanJiaXinXi(gengXinNeiRong) {
    let jiuDe = this.yongHuShuJuDuiXiang;
    let xinZhuangTai = {};
    
    if (jiuDe !== null && jiuDe !== undefined) {
      let keys1 = Object.keys(jiuDe);
      for (let i = 0; i < keys1.length; i++) {
        let k1 = keys1[i];
        xinZhuangTai[k1] = jiuDe[k1];
      }
    }
    
    if (gengXinNeiRong !== null && gengXinNeiRong !== undefined) {
      let keys2 = Object.keys(gengXinNeiRong);
      for (let j = 0; j < keys2.length; j++) {
        let k2 = keys2[j];
        xinZhuangTai[k2] = gengXinNeiRong[k2];
      }
    }
    
    this.yongHuShuJuDuiXiang = xinZhuangTai;
    bendiCunChu.sheZhiYongHuXinXi(this.yongHuShuJuDuiXiang);
  }
}

let quanJuYongHuGuanLi = new YongHuZhuangTaiGuanLi();
module.exports = quanJuYongHuGuanLi;