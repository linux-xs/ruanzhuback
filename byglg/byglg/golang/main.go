package main

import (
	"fmt"
	"log"

	"byglg/internal/config"
	"byglg/internal/database"
	"byglg/internal/router"

	"github.com/gin-gonic/gin"
)

func main() {
	var jiaZaiCuoWu error
	jiaZaiCuoWu = config.JiaZaiXiTongPeiZhi()

	var shiFouJiaZaiChengGong bool
	shiFouJiaZaiChengGong = true
	if jiaZaiCuoWu != nil {
		shiFouJiaZaiChengGong = false
	}

	if shiFouJiaZaiChengGong == false {
		log.Fatalf("pei zhi jia zai shi bai: %v", jiaZaiCuoWu)
	}

	var chengGongTiShi string
	chengGongTiShi = "pei zhi wen jian du qu wan bi"
	log.Println(chengGongTiShi)

	var shuJuKuPeiZhi *config.MySQLXiangXiPeiZhi
	shuJuKuPeiZhi = &config.QuanJuPeiZhiShiLi.ShuJuKu.MySqlPeiZhi

	var lianJieCuoWu error
	lianJieCuoWu = database.LianJieShuJuKu(shuJuKuPeiZhi)

	var shiFouLianJieChengGong bool
	shiFouLianJieChengGong = true
	if lianJieCuoWu != nil {
		shiFouLianJieChengGong = false
	}

	if shiFouLianJieChengGong == false {
		log.Fatalf("shu ju ku lian jie shi bai: %v", lianJieCuoWu)
	}

	var lianJieTiShi string
	lianJieTiShi = "shu ju ku lian jie wan bi"
	log.Println(lianJieTiShi)

	var qianYiCuoWu error
	qianYiCuoWu = database.QianYiSuoYouBiao()

	var shiFouQianYiChengGong bool
	shiFouQianYiChengGong = true
	if qianYiCuoWu != nil {
		shiFouQianYiChengGong = false
	}

	if shiFouQianYiChengGong == false {
		log.Fatalf("jian biao shi bai: %v", qianYiCuoWu)
	}

	var qianYiTiShi string
	qianYiTiShi = "suo you shu ju biao gou jian wan bi"
	log.Println(qianYiTiShi)

	var quanJuLuYou *gin.Engine
	quanJuLuYou = router.GouJianQuanJuLuYou()

	var duanKouHao int
	duanKouHao = config.QuanJuPeiZhiShiLi.FuWuQi.DuanKouHao

	var qiDongDiZhi string
	qiDongDiZhi = fmt.Sprintf(":%d", duanKouHao)

	var qiDongTiShi string
	qiDongTiShi = "fu wu qi zhun bei qi dong, di zhi: "
	log.Printf("%s %s", qiDongTiShi, qiDongDiZhi)

	var yunXingCuoWu error
	yunXingCuoWu = quanJuLuYou.Run(qiDongDiZhi)

	var shiFouYunXingChengGong bool
	shiFouYunXingChengGong = true
	if yunXingCuoWu != nil {
		shiFouYunXingChengGong = false
	}

	if shiFouYunXingChengGong == false {
		log.Fatalf("fu wu qi qi dong yi chang: %v", yunXingCuoWu)
	}
}
