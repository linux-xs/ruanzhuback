package model

type YongHuSheZhiBiao struct {
	YongHuBianHao       string `gorm:"column:yong_hu_bian_hao;type:varchar(64);primaryKey" json:"yong_hu_bian_hao"`
	YinYueShiFouDaKai   bool   `gorm:"column:yin_yue_shi_fou_da_kai;default:true" json:"yin_yue_shi_fou_da_kai"`
	YinXiaoShiFouDaKai  bool   `gorm:"column:yin_xiao_shi_fou_da_kai;default:true" json:"yin_xiao_shi_fou_da_kai"`
	ZhenDongShiFouDaKai bool   `gorm:"column:zhen_dong_shi_fou_da_kai;default:true" json:"zhen_dong_shi_fou_da_kai"`
	TongZhiShiFouDaKai  bool   `gorm:"column:tong_zhi_shi_fou_da_kai;default:true" json:"tong_zhi_shi_fou_da_kai"`
	XiTongYuYan         string `gorm:"column:xi_tong_yu_yan;type:varchar(10);default:'zh-CN'" json:"xi_tong_yu_yan"`
}

func (YongHuSheZhiBiao) TableName() string {
	var tabName string
	tabName = "yong_hu_she_zhi_biao_shu_ju"
	return tabName
}

func ChuangJianMoRenSheZhi(bianHao string) YongHuSheZhiBiao {
	var moRen YongHuSheZhiBiao

	var bh string
	bh = bianHao
	moRen.YongHuBianHao = bh

	var kai bool
	kai = true
	moRen.YinYueShiFouDaKai = kai
	moRen.YinXiaoShiFouDaKai = kai
	moRen.ZhenDongShiFouDaKai = kai
	moRen.TongZhiShiFouDaKai = kai

	var yuYan string
	yuYan = "zh-CN"
	moRen.XiTongYuYan = yuYan

	return moRen
}

func (m *YongHuSheZhiBiao) GuanBiYinYue() {
	var zhuangTai bool
	zhuangTai = false
	m.YinYueShiFouDaKai = zhuangTai
}

func (m *YongHuSheZhiBiao) DaKaiYinYue() {
	var zhuangTai bool
	zhuangTai = true
	m.YinYueShiFouDaKai = zhuangTai
}

func (m *YongHuSheZhiBiao) GuanBiYinXiao() {
	var zhuangTai bool
	zhuangTai = false
	m.YinXiaoShiFouDaKai = zhuangTai
}

func (m *YongHuSheZhiBiao) DaKaiYinXiao() {
	var zhuangTai bool
	zhuangTai = true
	m.YinXiaoShiFouDaKai = zhuangTai
}
