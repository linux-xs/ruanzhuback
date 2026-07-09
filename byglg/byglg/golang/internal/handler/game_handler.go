package handler

import (
	"net/http"
	"time"

	"byglg/internal/database"
	"byglg/internal/model"

	"github.com/gin-gonic/gin"
)

type YouXiChuLiQi struct{}

func GouJianYouXiChuLiQi() *YouXiChuLiQi {
	var shili *YouXiChuLiQi
	shili = &YouXiChuLiQi{}
	return shili
}

func (h *YouXiChuLiQi) HuoQuYouXiJinDuJieKou(shangXiaWen *gin.Context) {
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

	var jinDuShuJu model.YouXiJinDuBiao
	var sqlTj string
	sqlTj = "yong_hu_bian_hao = ? AND you_xi_bian_hao = ?"

	var chx error
	chx = database.DB.Where(sqlTj, wjBh, yxBh).First(&jinDuShuJu).Error

	if chx != nil {
		var m2 int
		m2 = http.StatusNotFound
		var t2 gin.H
		t2 = gin.H{"cuo_wu_xin_xi": "mei_zhao_dao_jin_du"}
		shangXiaWen.JSON(m2, t2)
		return
	}

	var cg int
	cg = http.StatusOK
	var fh gin.H
	fh = gin.H{"jie_guo_shu_ju": jinDuShuJu}
	shangXiaWen.JSON(cg, fh)
}

func (h *YouXiChuLiQi) GengXinYouXiJinDuJieKou(shangXiaWen *gin.Context) {
	type baoZhuangQingQiu struct {
		YongHuBianHao  string `json:"yong_hu_bian_hao" binding:"required"`
		YouXiBianHao   string `json:"you_xi_bian_hao" binding:"required"`
		DangQianGuanKa int    `json:"dang_qian_guan_ka"`
		ZuiGaoFenShu   int    `json:"zui_gao_fen_shu"`
		YouWanMiaoShu  int    `json:"you_wan_miao_shu"`
	}

	var jieshou baoZhuangQingQiu
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

	var laoJinDu model.YouXiJinDuBiao
	var sql string
	sql = "yong_hu_bian_hao = ? AND you_xi_bian_hao = ?"
	var cx error
	cx = database.DB.Where(sql, jieshou.YongHuBianHao, jieshou.YouXiBianHao).First(&laoJinDu).Error

	if cx != nil {
		var xinJinDu model.YouXiJinDuBiao
		xinJinDu.YongHuBianHao = jieshou.YongHuBianHao
		xinJinDu.YouXiBianHao = jieshou.YouXiBianHao
		xinJinDu.DangQianGuanKa = jieshou.DangQianGuanKa
		xinJinDu.ZuiGaoGuanKaJiLu = jieshou.DangQianGuanKa
		xinJinDu.LiShiZuiGaoFenShu = jieshou.ZuiGaoFenShu
		xinJinDu.ZongYouWanMiaoShu = jieshou.YouWanMiaoShu
		xinJinDu.YouXiBoFangCiShu = 1

		var xianzai time.Time
		xianzai = time.Now()
		xinJinDu.ShangCiWanDeShiJian = xianzai

		var zq error
		zq = database.DB.Create(&xinJinDu).Error
		if zq != nil {
			var m2 int
			m2 = http.StatusInternalServerError
			var t2 gin.H
			t2 = gin.H{"cuo_wu_xin_xi": "chuang_jian_jin_du_shi_bai"}
			shangXiaWen.JSON(m2, t2)
			return
		}

		var cg int
		cg = http.StatusOK
		var fh gin.H
		fh = gin.H{"jie_guo_shu_ju": xinJinDu, "ti_shi": "jin_du_chuang_jian_cg"}
		shangXiaWen.JSON(cg, fh)
	} else {
		var gengXin map[string]interface{}
		gengXin = make(map[string]interface{})

		var xz time.Time
		xz = time.Now()
		gengXin["shang_ci_wan_de_shi_jian"] = xz

		var jiuCiShu int
		jiuCiShu = laoJinDu.YouXiBoFangCiShu
		gengXin["you_xi_bo_fang_ci_shu"] = jiuCiShu + 1

		var jiuMiao int
		jiuMiao = laoJinDu.ZongYouWanMiaoShu
		gengXin["zong_you_wan_miao_shu"] = jiuMiao + jieshou.YouWanMiaoShu

		if jieshou.DangQianGuanKa > laoJinDu.ZuiGaoGuanKaJiLu {
			gengXin["zui_gao_guan_ka_ji_lu"] = jieshou.DangQianGuanKa
			gengXin["dang_qian_guan_ka"] = jieshou.DangQianGuanKa
		}

		if jieshou.ZuiGaoFenShu > laoJinDu.LiShiZuiGaoFenShu {
			gengXin["li_shi_zui_gao_fen_shu"] = jieshou.ZuiGaoFenShu
		}

		database.DB.Model(&laoJinDu).Updates(gengXin)

		var cg int
		cg = http.StatusOK
		var fh gin.H
		fh = gin.H{"jie_guo_shu_ju": laoJinDu, "ti_shi": "jin_du_geng_xin_cg"}
		shangXiaWen.JSON(cg, fh)
	}
}

func (h *YouXiChuLiQi) HuoQuPaiHangBangJieKou(shangXiaWen *gin.Context) {
	var yxBh string
	yxBh = shangXiaWen.Param("youxibianhao")

	if yxBh == "" {
		var m1 int
		m1 = http.StatusBadRequest
		var t1 gin.H
		t1 = gin.H{"cuo_wu_xin_xi": "you_xi_bian_hao_kong"}
		shangXiaWen.JSON(m1, t1)
		return
	}

	var paiHangShuZu []model.PaiHangBangBiao
	var sqlTj string
	sqlTj = "you_xi_bian_hao = ?"

	var paiXu string
	paiXu = "you_xi_de_fen_shu desc"

	var shianZhi int
	shianZhi = 100

	database.DB.Where(sqlTj, yxBh).Order(paiXu).Limit(shianZhi).Find(&paiHangShuZu)

	var cg int
	cg = http.StatusOK
	var fh gin.H
	fh = gin.H{"jie_guo_shu_ju": paiHangShuZu}
	shangXiaWen.JSON(cg, fh)
}
