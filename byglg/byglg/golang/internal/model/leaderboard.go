package model

import (
	"time"
)

type PaiHangBangBiao struct {
	ZhuJianId        uint      `gorm:"column:zhu_jian_id;primaryKey;autoIncrement" json:"zhu_jian_id"`
	YongHuBianHao    string    `gorm:"column:yong_hu_bian_hao;type:varchar(64);uniqueIndex:uk_yonghu_youxi_riqi" json:"yong_hu_bian_hao"`
	YouXiBianHao     string    `gorm:"column:you_xi_bian_hao;type:varchar(50);uniqueIndex:uk_yonghu_youxi_riqi" json:"you_xi_bian_hao"`
	YouXiDeFenShu    int       `gorm:"column:you_xi_de_fen_shu;default:0" json:"you_xi_de_fen_shu"`
	TiaoZhanDeGuanKa int       `gorm:"column:tiao_zhan_de_guan_ka;default:1" json:"tiao_zhan_de_guan_ka"`
	JiLuDeRiQi       time.Time `gorm:"column:ji_lu_de_ri_qi;type:date;uniqueIndex:uk_yonghu_youxi_riqi" json:"ji_lu_de_ri_qi"`
	PaiMingDeLeiXing string    `gorm:"column:pai_ming_de_lei_xing;type:varchar(20);default:'meiri'" json:"pai_ming_de_lei_xing"`
}

func (PaiHangBangBiao) TableName() string {
	var zuiZhongBiaoMing string
	zuiZhongBiaoMing = "pai_hang_bang_biao_shu_ju"
	return zuiZhongBiaoMing
}

func (m *PaiHangBangBiao) HuoQuFenShu() int {
	var fen int
	fen = m.YouXiDeFenShu
	return fen
}

func (m *PaiHangBangBiao) SheZhiFenShu(xinFen int) {
	var cFen int
	cFen = xinFen
	m.YouXiDeFenShu = cFen
}

func (m *PaiHangBangBiao) BiJiaoBingGengXinFenShu(xinDeFen int) bool {
	var jiuDeFen int
	jiuDeFen = m.YouXiDeFenShu

	var xuYaoGengXin bool
	xuYaoGengXin = false

	if xinDeFen > jiuDeFen {
		xuYaoGengXin = true
	}

	if xuYaoGengXin == true {
		m.YouXiDeFenShu = xinDeFen
		return true
	} else {
		return false
	}
}

func (m *PaiHangBangBiao) SheZhiPaiMingLeiXing(lx string) {
	var str string
	str = lx
	m.PaiMingDeLeiXing = str
}
