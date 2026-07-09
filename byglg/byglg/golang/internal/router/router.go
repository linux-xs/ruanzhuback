package router

import (
	"byglg/internal/handler"

	"github.com/gin-gonic/gin"
)

func GouJianQuanJuLuYou() *gin.Engine {
	var luYouYinQing *gin.Engine
	luYouYinQing = gin.Default()

	var jianKangLuJing string
	jianKangLuJing = "/jiankang_jiancha"

	luYouYinQing.GET(jianKangLuJing, func(shangXiaWen *gin.Context) {
		var zhuangTaiMa int
		zhuangTaiMa = 200

		var fanHuiShuJu gin.H
		fanHuiShuJu = gin.H{"zhuang_tai": "zheng_chang"}

		shangXiaWen.JSON(zhuangTaiMa, fanHuiShuJu)
	})

	var yongHuChuliDuiXiang *handler.YongHuChuLiQi
	yongHuChuliDuiXiang = handler.GouJianYongHuChuLiQi()

	var tiLiChuliDuiXiang *handler.TiLiChuLiQi
	tiLiChuliDuiXiang = handler.GouJianTiLiChuLiQi()

	var youXiChuliDuiXiang *handler.YouXiChuLiQi
	youXiChuliDuiXiang = handler.GouJianYouXiChuLiQi()

	var guangGaoChuliDuiXiang *handler.GuangGaoChuLiQi
	guangGaoChuliDuiXiang = handler.GouJianGuangGaoChuLiQi()

	var genLuJing string
	genLuJing = "/jiekou/di_yi_ban"

	var yiJiLuYouZu *gin.RouterGroup
	yiJiLuYouZu = luYouYinQing.Group(genLuJing)
	{
		var yongHuLuJing string
		yongHuLuJing = "/yonghu_mo_kuai"

		var yongHuZu *gin.RouterGroup
		yongHuZu = yiJiLuYouZu.Group(yongHuLuJing)
		{
			var huoQuId string
			huoQuId = "/:bianhao"
			yongHuZu.GET(huoQuId, yongHuChuliDuiXiang.HuoQuYongHuXinXiJieKou)

			var chuangJian string
			chuangJian = "/chuangjian"
			yongHuZu.POST(chuangJian, yongHuChuliDuiXiang.BaoCunYongHuXinXiJieKou)

			var gengXinShiJian string
			gengXinShiJian = "/:bianhao/denglu_shijian"
			yongHuZu.PUT(gengXinShiJian, yongHuChuliDuiXiang.GengXinDengLuShiJianJieKou)
		}

		var tiLiLuJing string
		tiLiLuJing = "/tili_mo_kuai"

		var tiLiZu *gin.RouterGroup
		tiLiZu = yiJiLuYouZu.Group(tiLiLuJing)
		{
			var chaXunTiLi string
			chaXunTiLi = "/:bianhao"
			tiLiZu.GET(chaXunTiLi, tiLiChuliDuiXiang.HuoQuWanJiaTiLiJieKou)

			var chuShiHuaTiLi string
			chuShiHuaTiLi = "/chushihua"
			tiLiZu.POST(chuShiHuaTiLi, tiLiChuliDuiXiang.ChuShiHuaTiLiJieKou)
		}

		var youXiLuJing string
		youXiLuJing = "/youxi_mo_kuai"

		var youXiZu *gin.RouterGroup
		youXiZu = yiJiLuYouZu.Group(youXiLuJing)
		{
			var chaXunJinDu string
			chaXunJinDu = "/:bianhao/jindu/:youxibianhao"
			youXiZu.GET(chaXunJinDu, youXiChuliDuiXiang.HuoQuYouXiJinDuJieKou)

			var baoCunJinDu string
			baoCunJinDu = "/baocun_jindu"
			youXiZu.POST(baoCunJinDu, youXiChuliDuiXiang.GengXinYouXiJinDuJieKou)

			var paiHangBang string
			paiHangBang = "/:youxibianhao/paihangbang"
			youXiZu.GET(paiHangBang, youXiChuliDuiXiang.HuoQuPaiHangBangJieKou)
		}

		var guangGaoLuJing string
		guangGaoLuJing = "/guanggao_mo_kuai"

		var guangGaoZu *gin.RouterGroup
		guangGaoZu = yiJiLuYouZu.Group(guangGaoLuJing)
		{
			var jiLuGuanKan string
			jiLuGuanKan = "/jilu_guankan"
			guangGaoZu.POST(jiLuGuanKan, guangGaoChuliDuiXiang.JiLuGuangGaoGuanKanJieKou)

			var mianGgEdu string
			mianGgEdu = "/mianfei_edu/:bianhao/:youxibianhao"
			guangGaoZu.GET(mianGgEdu, guangGaoChuliDuiXiang.HuoQuMianGgEduJieKou)

			var shiYongMianGg string
			shiYongMianGg = "/shiyong_mianfei/:bianhao/:youxibianhao"
			guangGaoZu.POST(shiYongMianGg, guangGaoChuliDuiXiang.ShiYongMianGgEduJieKou)
		}
	}

	return luYouYinQing
}
