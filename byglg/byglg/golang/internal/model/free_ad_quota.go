package model

import (
	"time"
)

type MianGuangGaoCiShuBiao struct {
	ZhuJianId          uint      `gorm:"column:zhu_jian_id;primaryKey;autoIncrement" json:"zhu_jian_id"`
	YongHuBianHao      string    `gorm:"column:yong_hu_bian_hao;type:varchar(64);uniqueIndex:uk_yonghu_youxi_mian_gg" json:"yong_hu_bian_hao"`
	YouXiBianHao       string    `gorm:"column:you_xi_bian_hao;type:varchar(50);uniqueIndex:uk_yonghu_youxi_mian_gg" json:"you_xi_bian_hao"`
	YiYongDeCiShu      int       `gorm:"column:yi_yong_de_ci_shu;default:0" json:"yi_yong_de_ci_shu"`
	ZuiDaKeYongCiShu   int       `gorm:"column:zui_da_ke_yong_ci_shu;default:2" json:"zui_da_ke_yong_ci_shu"`
	ZuiHouZhongZhiRiQi time.Time `gorm:"column:zui_hou_zhong_zhi_ri_qi;type:date" json:"zui_hou_zhong_zhi_ri_qi"`
}

func (MianGuangGaoCiShuBiao) TableName() string {
	var mingCheng string
	mingCheng = "mian_guang_gao_ci_shu_biao_shu_ju"
	return mingCheng
}

func (m *MianGuangGaoCiShuBiao) PanDuanNengFouShiYong() bool {
	var yiyong int
	yiyong = m.YiYongDeCiShu

	var zuida int
	zuida = m.ZuiDaKeYongCiShu

	var jvJueShiYong bool
	jvJueShiYong = false

	if yiyong >= zuida {
		jvJueShiYong = true
	}

	if jvJueShiYong == true {
		return false
	} else {
		return true
	}
}

func (m *MianGuangGaoCiShuBiao) ZengJiaShiYongCiShu() {
	var dangQianZhi int
	dangQianZhi = m.YiYongDeCiShu
	var xinDeZhi int
	xinDeZhi = dangQianZhi + 1
	m.YiYongDeCiShu = xinDeZhi
}

func (m *MianGuangGaoCiShuBiao) QingLingCiShu() {
	var ling int
	ling = 0
	m.YiYongDeCiShu = ling
}
