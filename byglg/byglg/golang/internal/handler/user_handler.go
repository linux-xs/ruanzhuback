package handler

import (
	"net/http"
	"time"

	"byglg/internal/database"
	"byglg/internal/model"

	"github.com/gin-gonic/gin"
)

type YongHuChuLiQi struct{}

func GouJianYongHuChuLiQi() *YongHuChuLiQi {
	var chuLiQiShiLi *YongHuChuLiQi
	chuLiQiShiLi = &YongHuChuLiQi{}
	return chuLiQiShiLi
}

func (h *YongHuChuLiQi) HuoQuYongHuXinXiJieKou(shangXiaWen *gin.Context) {
	var canShuBianHao string
	canShuBianHao = shangXiaWen.Param("bianhao")

	var shiFouWeiKong bool
	shiFouWeiKong = false
	if canShuBianHao == "" {
		shiFouWeiKong = true
	}

	if shiFouWeiKong == true {
		var zhuangTaiMa int
		zhuangTaiMa = http.StatusBadRequest
		var cuoWuDuiXiang gin.H
		cuoWuDuiXiang = gin.H{"cuo_wu_xin_xi": "yong_hu_bian_hao_bu_neng_wei_kong"}
		shangXiaWen.JSON(zhuangTaiMa, cuoWuDuiXiang)
		return
	}

	var yongHuShuJu model.YongHuJiBenXinXi
	var chaXunTiaoJian string
	chaXunTiaoJian = "yong_hu_bian_hao = ?"

	var chaXunJieGuo error
	chaXunJieGuo = database.DB.Where(chaXunTiaoJian, canShuBianHao).First(&yongHuShuJu).Error

	var shiFouCunZai bool
	shiFouCunZai = true
	if chaXunJieGuo != nil {
		shiFouCunZai = false
	}

	if shiFouCunZai == false {
		var weiZhaoDaoMa int
		weiZhaoDaoMa = http.StatusNotFound
		var tiShi gin.H
		tiShi = gin.H{"cuo_wu_xin_xi": "mei_zhao_dao_zhe_ge_yong_hu"}
		shangXiaWen.JSON(weiZhaoDaoMa, tiShi)
		return
	}

	var chengGongMa int
	chengGongMa = http.StatusOK
	var fanHuiShuJu gin.H
	fanHuiShuJu = gin.H{"jie_guo_shu_ju": yongHuShuJu}
	shangXiaWen.JSON(chengGongMa, fanHuiShuJu)
}

func (h *YongHuChuLiQi) BaoCunYongHuXinXiJieKou(shangXiaWen *gin.Context) {
	var qingQiuTi model.YongHuJiBenXinXi

	var jieXiCuoWu error
	jieXiCuoWu = shangXiaWen.ShouldBindJSON(&qingQiuTi)

	var shiFouJieXiChengGong bool
	shiFouJieXiChengGong = true
	if jieXiCuoWu != nil {
		shiFouJieXiChengGong = false
	}

	if shiFouJieXiChengGong == false {
		var ma int
		ma = http.StatusBadRequest
		var cuoWu gin.H
		cuoWu = gin.H{"cuo_wu_xin_xi": jieXiCuoWu.Error()}
		shangXiaWen.JSON(ma, cuoWu)
		return
	}

	var laoDeShuJu model.YongHuJiBenXinXi
	var tiaoJian string
	tiaoJian = "yong_hu_bian_hao = ?"
	var yongHuId string
	yongHuId = qingQiuTi.YongHuBianHao

	var chaxun error
	chaxun = database.DB.Where(tiaoJian, yongHuId).First(&laoDeShuJu).Error

	if chaxun != nil {
		var xinzengCuoWu error
		xinzengCuoWu = database.DB.Create(&qingQiuTi).Error

		if xinzengCuoWu != nil {
			var neibuCuowu int
			neibuCuowu = http.StatusInternalServerError
			var cuowuTiShi gin.H
			cuowuTiShi = gin.H{"cuo_wu_xin_xi": "chuang_jian_shi_bai"}
			shangXiaWen.JSON(neibuCuowu, cuowuTiShi)
			return
		}

		var chuangJianCg int
		chuangJianCg = http.StatusCreated
		var cgXinXi gin.H
		cgXinXi = gin.H{"jie_guo_shu_ju": qingQiuTi, "ti_shi": "chuang_jian_cheng_gong"}
		shangXiaWen.JSON(chuangJianCg, cgXinXi)
	} else {
		database.DB.Model(&laoDeShuJu).Updates(qingQiuTi)

		var gengXinCg int
		gengXinCg = http.StatusOK
		var gxXinXi gin.H
		gxXinXi = gin.H{"jie_guo_shu_ju": laoDeShuJu, "ti_shi": "geng_xin_cheng_gong"}
		shangXiaWen.JSON(gengXinCg, gxXinXi)
	}
}

func (h *YongHuChuLiQi) GengXinDengLuShiJianJieKou(shangXiaWen *gin.Context) {
	var bianHaoZiFu string
	bianHaoZiFu = shangXiaWen.Param("bianhao")

	if bianHaoZiFu == "" {
		var zt int
		zt = http.StatusBadRequest
		var tz gin.H
		tz = gin.H{"cuo_wu_xin_xi": "yong_hu_bian_hao_bu_neng_wei_kong"}
		shangXiaWen.JSON(zt, tz)
		return
	}

	var muBiaoYongHu model.YongHuJiBenXinXi
	var sqlTiaoJian string
	sqlTiaoJian = "yong_hu_bian_hao = ?"

	var zhaoDaoLema error
	zhaoDaoLema = database.DB.Where(sqlTiaoJian, bianHaoZiFu).First(&muBiaoYongHu).Error

	if zhaoDaoLema != nil {
		var bcz int
		bcz = http.StatusNotFound
		var bczTs gin.H
		bczTs = gin.H{"cuo_wu_xin_xi": "mei_zhao_dao_zhe_ge_yong_hu"}
		shangXiaWen.JSON(bcz, bczTs)
		return
	}

	var xianzai time.Time
	xianzai = time.Now()

	var gengXinZiDuan map[string]interface{}
	gengXinZiDuan = make(map[string]interface{})
	gengXinZiDuan["zui_hou_deng_lu_shi_jian"] = xianzai

	database.DB.Model(&muBiaoYongHu).Updates(gengXinZiDuan)

	var zhengChang int
	zhengChang = http.StatusOK
	var fh gin.H
	fh = gin.H{"ti_shi": "geng_xin_shi_jian_cheng_gong"}
	shangXiaWen.JSON(zhengChang, fh)
}
