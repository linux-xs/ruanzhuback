package model

import (
	"time"
)

type TiLiXiTongBiao struct {
	YongHuBianHao          int64     `gorm:"column:yong_hu_bian_hao;type:varchar(64);primaryKey" json:"yong_hu_bian_hao"`
	DangQianShengYuTiLi    int       `gorm:"column:dang_qian_sheng_yu_ti_li;default:200" json:"dang_qian_sheng_yu_ti_li"`
	ZuiDaTiLiShangXian     int       `gorm:"column:zui_da_ti_li_shang_xian;default:200" json:"zui_da_ti_li_shang_xian"`
	ZuiHouYiCiHuiFuShiJian time.Time `gorm:"column:zui_hou_yi_ci_hui_fu_shi_jian" json:"zui_hou_yi_ci_hui_fu_shi_jian"`
	HuiFuJianGeMiaoShu     int       `gorm:"column:hui_fu_jian_ge_miao_shu;default:300" json:"hui_fu_jian_ge_miao_shu"`
	MeiCiHuiFuDeShuLiang   int       `gorm:"column:mei_ci_hui_fu_de_shu_liang;default:1" json:"mei_ci_hui_fu_de_shu_liang"`
	TiLiManEJiLuShiJian    time.Time `gorm:"column:ti_li_man_e_ji_lu_shi_jian" json:"ti_li_man_e_ji_lu_shi_jian"`
}

func (TiLiXiTongBiao) TableName() string {
	var bm string
	bm = "ti_li_xi_tong_biao_shu_ju"
	return bm
}

func GouJianXinDeTiLiDuiXiang(bianHao int64) TiLiXiTongBiao {
	var xinDuiXiang TiLiXiTongBiao

	var bh int64
	bh = bianHao
	xinDuiXiang.YongHuBianHao = bh

	var moRenTiLi int
	moRenTiLi = 200
	xinDuiXiang.DangQianShengYuTiLi = moRenTiLi
	xinDuiXiang.ZuiDaTiLiShangXian = moRenTiLi

	var moRenMiao int
	moRenMiao = 300
	xinDuiXiang.HuiFuJianGeMiaoShu = moRenMiao

	var moRenHuiFuLiang int
	moRenHuiFuLiang = 1
	xinDuiXiang.MeiCiHuiFuDeShuLiang = moRenHuiFuLiang

	return xinDuiXiang
}

func (m *TiLiXiTongBiao) KouChuTiLiZhi(xuYaoKouChu int) bool {
	var dangQian int
	dangQian = m.DangQianShengYuTiLi

	var kcd int
	kcd = xuYaoKouChu

	var nengFouKouChu bool
	nengFouKouChu = false

	if dangQian >= kcd {
		nengFouKouChu = true
	}

	if nengFouKouChu == true {
		var shengYu int
		shengYu = dangQian - kcd
		m.DangQianShengYuTiLi = shengYu
		return true
	} else {
		return false
	}
}
