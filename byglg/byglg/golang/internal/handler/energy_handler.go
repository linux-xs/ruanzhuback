package handler

import (
	"net/http"
	"time"

	"byglg/internal/database"
	"byglg/internal/model"

	"github.com/gin-gonic/gin"
)

type TiLiChuLiQi struct{}

func GouJianTiLiChuLiQi() *TiLiChuLiQi {
	var shili *TiLiChuLiQi
	shili = &TiLiChuLiQi{}
	return shili
}

func (h *TiLiChuLiQi) HuoQuWanJiaTiLiJieKou(shangXiaWen *gin.Context) {
	var wanJiaBianHao string
	wanJiaBianHao = shangXiaWen.Param("bianhao")

	var kongPanDuan bool
	kongPanDuan = false
	if wanJiaBianHao == "" {
		kongPanDuan = true
	}

	if kongPanDuan == true {
		var ztm int
		ztm = http.StatusBadRequest
		var fhz gin.H
		fhz = gin.H{"cuo_wu_xin_xi": "yong_hu_bian_hao_kong"}
		shangXiaWen.JSON(ztm, fhz)
		return
	}

	var tiLiShuJu model.TiLiXiTongBiao
	var tj string
	tj = "yong_hu_bian_hao = ?"

	var cx error
	cx = database.DB.Where(tj, wanJiaBianHao).First(&tiLiShuJu).Error

	var shiFouCunZai bool
	shiFouCunZai = true
	if cx != nil {
		shiFouCunZai = false
	}

	if shiFouCunZai == false {
		var nf int
		nf = http.StatusNotFound
		var ts gin.H
		ts = gin.H{"cuo_wu_xin_xi": "ti_li_shu_ju_wei_zhao_dao"}
		shangXiaWen.JSON(nf, ts)
		return
	}

	var dangQianShiJian time.Time
	dangQianShiJian = time.Now()

	var shangCi time.Time
	shangCi = tiLiShuJu.ZuiHouYiCiHuiFuShiJian

	var shiJianCha time.Duration
	shiJianCha = dangQianShiJian.Sub(shangCi)

	var miaoShuChaZhi int
	miaoShuChaZhi = int(shiJianCha.Seconds())

	var jianGe int
	jianGe = tiLiShuJu.HuiFuJianGeMiaoShu

	var huiFuCiShu int
	huiFuCiShu = miaoShuChaZhi / jianGe

	var danCiHuiFu int
	danCiHuiFu = tiLiShuJu.MeiCiHuiFuDeShuLiang

	var zongHuiFu int
	zongHuiFu = huiFuCiShu * danCiHuiFu

	var dangQianTiLi int
	dangQianTiLi = tiLiShuJu.DangQianShengYuTiLi

	var xinTiLi int
	xinTiLi = dangQianTiLi + zongHuiFu

	var zuiDaZhi int
	zuiDaZhi = tiLiShuJu.ZuiDaTiLiShangXian

	var shiFouChaoChu bool
	shiFouChaoChu = false
	if xinTiLi > zuiDaZhi {
		shiFouChaoChu = true
	}

	if shiFouChaoChu == true {
		xinTiLi = zuiDaZhi
	}

	var fanHuiTiLi gin.H
	fanHuiTiLi = gin.H{
		"dang_qian_ti_li": xinTiLi,
		"zui_da_ti_li":    zuiDaZhi,
		"shang_ci_hui_fu": shangCi,
		"jian_ge_miao":    jianGe,
		"hui_fu_liang":    danCiHuiFu,
	}

	var cg int
	cg = http.StatusOK
	var zz gin.H
	zz = gin.H{"jie_guo_shu_ju": fanHuiTiLi}
	shangXiaWen.JSON(cg, zz)
}

func (h *TiLiChuLiQi) ChuShiHuaTiLiJieKou(shangXiaWen *gin.Context) {
	type qingQiuBaoZhuang struct {
		YongHuBianHao int64 `json:"yong_hu_bian_hao" binding:"required"`
	}

	var jieshou qingQiuBaoZhuang
	var bdCw error
	bdCw = shangXiaWen.ShouldBindJSON(&jieshou)

	if bdCw != nil {
		var zt int
		zt = http.StatusBadRequest
		var ts gin.H
		ts = gin.H{"cuo_wu_xin_xi": bdCw.Error()}
		shangXiaWen.JSON(zt, ts)
		return
	}

	var gouJianTiLi model.TiLiXiTongBiao
	gouJianTiLi = model.GouJianXinDeTiLiDuiXiang(jieshou.YongHuBianHao)

	var xianzai time.Time
	xianzai = time.Now()
	gouJianTiLi.ZuiHouYiCiHuiFuShiJian = xianzai
	gouJianTiLi.TiLiManEJiLuShiJian = xianzai

	var zqCw error
	zqCw = database.DB.Create(&gouJianTiLi).Error

	var cgTiaoJian bool
	cgTiaoJian = true
	if zqCw != nil {
		cgTiaoJian = false
	}

	if cgTiaoJian == false {
		var nbcw int
		nbcw = http.StatusInternalServerError
		var ts gin.H
		ts = gin.H{"cuo_wu_xin_xi": "chu_shi_hua_shi_bai"}
		shangXiaWen.JSON(nbcw, ts)
		return
	}

	var zcm int
	zcm = http.StatusOK
	var fh gin.H
	fh = gin.H{"jie_guo_shu_ju": gouJianTiLi, "ti_shi": "chu_shi_hua_cheng_gong"}
	shangXiaWen.JSON(zcm, fh)
}
