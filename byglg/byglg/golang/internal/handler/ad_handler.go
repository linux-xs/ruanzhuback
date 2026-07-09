package handler

import (
	"net/http"
	"time"

	"byglg/internal/database"
	"byglg/internal/model"

	"github.com/gin-gonic/gin"
)

type GuangGaoChuLiQi struct{}

func GouJianGuangGaoChuLiQi() *GuangGaoChuLiQi {
	var shili *GuangGaoChuLiQi
	shili = &GuangGaoChuLiQi{}
	return shili
}

func (h *GuangGaoChuLiQi) JiLuGuangGaoGuanKanJieKou(shangXiaWen *gin.Context) {
	type jiluBaoZhuang struct {
		YongHuBianHao        string `json:"yong_hu_bian_hao" binding:"required"`
		YouXiBianHao         string `json:"you_xi_bian_hao" binding:"required"`
		GuangGaoLeiXing      string `json:"guang_gao_lei_xing" binding:"required"`
		GuangGaoWeiBianHao   string `json:"guang_gao_wei_bian_hao"`
		JiangLiDeLeiXing     string `json:"jiang_li_de_lei_xing"`
		ShiFouYiJingWanCheng bool   `json:"shi_fou_yi_jing_wan_cheng"`
	}

	var jieshou jiluBaoZhuang
	var bd error
	bd = shangXiaWen.ShouldBindJSON(&jieshou)

	if bd != nil {
		var m1 int
		m1 = http.StatusBadRequest
		var t1 gin.H
		t1 = gin.H{"cuo_wu_xin_xi": bd.Error()}
		shangXiaWen.JSON(m1, t1)
		return
	}

	var jiLu model.GuangGaoJiLuBiao
	jiLu.YongHuBianHao = jieshou.YongHuBianHao
	jiLu.YouXiBianHao = jieshou.YouXiBianHao
	jiLu.GuangGaoLeiXing = jieshou.GuangGaoLeiXing
	jiLu.GuangGaoWeiBianHao = jieshou.GuangGaoWeiBianHao
	jiLu.JiangLiDeLeiXing = jieshou.JiangLiDeLeiXing

	var shuliang int
	shuliang = 1
	jiLu.JiangLiDeShuLiang = shuliang
	jiLu.ShiFouYiJingWanCheng = jieshou.ShiFouYiJingWanCheng

	var insertErr error
	insertErr = database.DB.Create(&jiLu).Error

	if insertErr != nil {
		var m2 int
		m2 = http.StatusInternalServerError
		var t2 gin.H
		t2 = gin.H{"cuo_wu_xin_xi": "chuang_jian_ji_lu_shi_bai"}
		shangXiaWen.JSON(m2, t2)
		return
	}

	var cg int
	cg = http.StatusCreated
	var fh gin.H
	fh = gin.H{"ti_shi": "ji_lu_cheng_gong"}
	shangXiaWen.JSON(cg, fh)
}

func (h *GuangGaoChuLiQi) HuoQuMianGgEduJieKou(shangXiaWen *gin.Context) {
	var wjBh string
	wjBh = shangXiaWen.Param("bianhao")
	var yxBh string
	yxBh = shangXiaWen.Param("youxibianhao")

	var pd1 bool
	pd1 = false
	if wjBh == "" {
		pd1 = true
	}
	if yxBh == "" {
		pd1 = true
	}

	if pd1 == true {
		var m1 int
		m1 = http.StatusBadRequest
		var t1 gin.H
		t1 = gin.H{"cuo_wu_xin_xi": "can_shu_bu_quan"}
		shangXiaWen.JSON(m1, t1)
		return
	}

	var eduShuJu model.MianGuangGaoCiShuBiao
	var sqlTj string
	sqlTj = "yong_hu_bian_hao = ? AND you_xi_bian_hao = ?"

	var cx error
	cx = database.DB.Where(sqlTj, wjBh, yxBh).First(&eduShuJu).Error

	if cx != nil {
		var m2 int
		m2 = http.StatusNotFound
		var t2 gin.H
		t2 = gin.H{"cuo_wu_xin_xi": "edu_wei_zhao_dao"}
		shangXiaWen.JSON(m2, t2)
		return
	}

	var xianzai time.Time
	xianzai = time.Now()

	var ershisi hours
	var zhengMiao time.Duration
	zhengMiao = 24 * time.Hour

	var jinTian time.Time
	jinTian = xianzai.Truncate(zhengMiao)

	var xuYaoZhongZhi bool
	xuYaoZhongZhi = eduShuJu.ZuiHouZhongZhiRiQi.Before(jinTian)

	if xuYaoZhongZhi == true {
		var gx map[string]interface{}
		gx = make(map[string]interface{})
		gx["yi_yong_de_ci_shu"] = 0
		gx["zui_hou_zhong_zhi_ri_qi"] = jinTian

		database.DB.Model(&eduShuJu).Updates(gx)
		eduShuJu.YiYongDeCiShu = 0
		eduShuJu.ZuiHouZhongZhiRiQi = jinTian
	}

	var cg int
	cg = http.StatusOK
	var fh gin.H
	fh = gin.H{"jie_guo_shu_ju": eduShuJu}
	shangXiaWen.JSON(cg, fh)
}

func (h *GuangGaoChuLiQi) ShiYongMianGgEduJieKou(shangXiaWen *gin.Context) {
	var wjBh string
	wjBh = shangXiaWen.Param("bianhao")
	var yxBh string
	yxBh = shangXiaWen.Param("youxibianhao")

	var pd1 bool
	pd1 = false
	if wjBh == "" {
		pd1 = true
	}
	if yxBh == "" {
		pd1 = true
	}

	if pd1 == true {
		var m1 int
		m1 = http.StatusBadRequest
		var t1 gin.H
		t1 = gin.H{"cuo_wu_xin_xi": "can_shu_bu_quan"}
		shangXiaWen.JSON(m1, t1)
		return
	}

	var eduShuJu model.MianGuangGaoCiShuBiao
	var sqlTj string
	sqlTj = "yong_hu_bian_hao = ? AND you_xi_bian_hao = ?"

	var cx error
	cx = database.DB.Where(sqlTj, wjBh, yxBh).First(&eduShuJu).Error

	if cx != nil {
		var m2 int
		m2 = http.StatusNotFound
		var t2 gin.H
		t2 = gin.H{"cuo_wu_xin_xi": "edu_wei_zhao_dao"}
		shangXiaWen.JSON(m2, t2)
		return
	}

	var keyong bool
	keyong = eduShuJu.PanDuanNengFouShiYong()

	if keyong == false {
		var m3 int
		m3 = http.StatusForbidden
		var t3 gin.H
		t3 = gin.H{"cuo_wu_xin_xi": "ci_shu_yi_yong_wan"}
		shangXiaWen.JSON(m3, t3)
		return
	}

	var jiuCiShu int
	jiuCiShu = eduShuJu.YiYongDeCiShu

	var gx map[string]interface{}
	gx = make(map[string]interface{})
	gx["yi_yong_de_ci_shu"] = jiuCiShu + 1

	database.DB.Model(&eduShuJu).Updates(gx)

	var cg int
	cg = http.StatusOK
	var fh gin.H
	fh = gin.H{"ti_shi": "kou_chu_cheng_gong"}
	shangXiaWen.JSON(cg, fh)
}
