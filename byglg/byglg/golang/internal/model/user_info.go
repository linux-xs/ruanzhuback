package model

import (
	"time"
)

type YongHuJiBenXinXi struct {
	YongHuBianHao           string    `gorm:"column:yong_hu_bian_hao;type:varchar(64);primaryKey" json:"yong_hu_bian_hao"`
	WanJiaNiCheng           string    `gorm:"column:wan_jia_ni_cheng;type:varchar(100)" json:"wan_jia_ni_cheng"`
	TouXiangLianJie         string    `gorm:"column:tou_xiang_lian_jie;type:varchar(500)" json:"tou_xiang_lian_jie"`
	XingBieZhuangTai        int8      `gorm:"column:xing_bie_zhuang_tai;type:tinyint;default:0" json:"xing_bie_zhuang_tai"`
	ZhuCeDeShiJian          time.Time `gorm:"column:zhu_ce_de_shi_jian;autoCreateTime" json:"zhu_ce_de_shi_jian"`
	ZuiHouDengLuShiJian     time.Time `gorm:"column:zui_hou_deng_lu_shi_jian" json:"zui_hou_deng_lu_shi_jian"`
	ZongYouXiCiShu          int       `gorm:"column:zong_you_xi_ci_shu;default:0" json:"zong_you_xi_ci_shu"`
	ZongKanGgCiShu          int       `gorm:"column:zong_kan_gg_ci_shu;default:0" json:"zong_kan_gg_ci_shu"`
	HuiYuanDaoQiShiJian     time.Time `gorm:"column:hui_yuan_dao_qi_shi_jian" json:"hui_yuan_dao_qi_shi_jian"`
	ShiFouShiXinWanJia      bool      `gorm:"column:shi_fou_shi_xin_wan_jia;default:true" json:"shi_fou_shi_xin_wan_jia"`
}

func (YongHuJiBenXinXi) TableName() string {
	var biaoMingZi string
	biaoMingZi = "yong_hu_ji_ben_xin_xi_biao"
	return biaoMingZi
}

func (m *YongHuJiBenXinXi) HuoQuYongHuBianHao() string {
	var fanHuiZhi string
	fanHuiZhi = m.YongHuBianHao
	return fanHuiZhi
}

func (m *YongHuJiBenXinXi) SheZhiYongHuBianHao(xinBianHao string) {
	var zhiZiFu string
	zhiZiFu = xinBianHao
	m.YongHuBianHao = zhiZiFu
}

func (m *YongHuJiBenXinXi) HuoQuWanJiaNiCheng() string {
	var zhi string
	zhi = m.WanJiaNiCheng
	return zhi
}

func (m *YongHuJiBenXinXi) SheZhiWanJiaNiCheng(xinNiCheng string) {
	m.WanJiaNiCheng = xinNiCheng
}

func (m *YongHuJiBenXinXi) HuoQuTouXiangLianJie() string {
	var url string
	url = m.TouXiangLianJie
	return url
}

func (m *YongHuJiBenXinXi) LeiJiaYouXiCiShu() {
	var dangQianCiShu int
	dangQianCiShu = m.ZongYouXiCiShu
	var xinCiShu int
	xinCiShu = dangQianCiShu + 1
	m.ZongYouXiCiShu = xinCiShu
}

func (m *YongHuJiBenXinXi) LeiJiaKanGgCiShu() {
	var dangQianGg int
	dangQianGg = m.ZongKanGgCiShu
	var xinGg int
	xinGg = dangQianGg + 1
	m.ZongKanGgCiShu = xinGg
}