package model

import (
	"time"
)

type GuangGaoJiLuBiao struct {
	ZhuJianId            uint      `gorm:"column:zhu_jian_id;primaryKey;autoIncrement" json:"zhu_jian_id"`
	YongHuBianHao        string    `gorm:"column:yong_hu_bian_hao;type:varchar(64)" json:"yong_hu_bian_hao"`
	YouXiBianHao         string    `gorm:"column:you_xi_bian_hao;type:varchar(50)" json:"you_xi_bian_hao"`
	GuangGaoLeiXing      string    `gorm:"column:guang_gao_lei_xing;type:varchar(20)" json:"guang_gao_lei_xing"`
	GuanKanDeShiJian     time.Time `gorm:"column:guan_kan_de_shi_jian;autoCreateTime" json:"guan_kan_de_shi_jian"`
	GuangGaoWeiBianHao   string    `gorm:"column:guang_gao_wei_bian_hao;type:varchar(100)" json:"guang_gao_wei_bian_hao"`
	JiangLiDeLeiXing     string    `gorm:"column:jiang_li_de_lei_xing;type:varchar(20)" json:"jiang_li_de_lei_xing"`
	JiangLiDeShuLiang    int       `gorm:"column:jiang_li_de_shu_liang;default:1" json:"jiang_li_de_shu_liang"`
	ShiFouYiJingWanCheng bool      `gorm:"column:shi_fou_yi_jing_wan_cheng;default:true" json:"shi_fou_yi_jing_wan_cheng"`
}

func (GuangGaoJiLuBiao) TableName() string {
	var biaoMing string
	biaoMing = "guang_gao_ji_lu_biao_shu_ju"
	return biaoMing
}

func GouJianXinDeGuangGaoJiLu(yHao string, yxHao string) GuangGaoJiLuBiao {
	var xinJiLu GuangGaoJiLuBiao

	var yongHu string
	yongHu = yHao
	xinJiLu.YongHuBianHao = yongHu

	var youXi string
	youXi = yxHao
	xinJiLu.YouXiBianHao = youXi

	var zhuangTai bool
	zhuangTai = false
	xinJiLu.ShiFouYiJingWanCheng = zhuangTai

	var moRenJiangLi int
	moRenJiangLi = 1
	xinJiLu.JiangLiDeShuLiang = moRenJiangLi

	return xinJiLu
}

func (m *GuangGaoJiLuBiao) SheZhiWeiWanChengZhuangTai() {
	var wczt bool
	wczt = true
	m.ShiFouYiJingWanCheng = wczt
}

func (m *GuangGaoJiLuBiao) GengXinJiangLiXinXi(lx string, sl int) {
	var leiXingZiFu string
	leiXingZiFu = lx
	m.JiangLiDeLeiXing = leiXingZiFu

	var shuLiangZhi int
	shuLiangZhi = sl
	m.JiangLiDeShuLiang = shuLiangZhi
}
