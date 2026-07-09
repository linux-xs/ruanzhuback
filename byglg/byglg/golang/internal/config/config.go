package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

type ZongPeiZhiJieGou struct {
	FuWuQi   FuWuQiPeiZhiJieGou  `mapstructure:"server"`
	ShuJuKu  ShuJuKuPeiZhiJieGou `mapstructure:"database"`
	MiYao    MiYaoPeiZhiJieGou   `mapstructure:"jwt"`
	RiZhiXin RiZhiPeiZhiJieGou   `mapstructure:"log"`
}

type FuWuQiPeiZhiJieGou struct {
	DuanKouHao int    `mapstructure:"port"`
	YunXingMos string `mapstructure:"mode"`
}

type ShuJuKuPeiZhiJieGou struct {
	MySqlPeiZhi MySQLXiangXiPeiZhi `mapstructure:"mysql"`
}

type MySQLXiangXiPeiZhi struct {
	DiZhi         string `mapstructure:"host"`
	DuanKou       int    `mapstructure:"port"`
	ZhangHao      string `mapstructure:"username"`
	MiMa          string `mapstructure:"password"`
	BiaoMing      string `mapstructure:"dbname"`
	ZiFuJi        string `mapstructure:"charset"`
	ZuiDaKongXian int    `mapstructure:"max_idle_conns"`
	ZuiDaDaKai    int    `mapstructure:"max_open_conns"`
	RiZhiDengJi   string `mapstructure:"log_level"`
}

type MiYaoPeiZhiJieGou struct {
	MiMaoZiFu string `mapstructure:"secret"`
	GuoQiShi  int    `mapstructure:"expire"`
}

type RiZhiPeiZhiJieGou struct {
	JiBie    string `mapstructure:"level"`
	GeShi    string `mapstructure:"format"`
	ShuChuDi string `mapstructure:"output"`
}

var QuanJuPeiZhiShiLi *ZongPeiZhiJieGou

func JiaZaiXiTongPeiZhi() error {
	var duQuQi *viper.Viper
	duQuQi = viper.New()

	var wenJianMing string
	wenJianMing = "config"
	duQuQi.SetConfigName(wenJianMing)

	var wenJianLeiXing string
	wenJianLeiXing = "yaml"
	duQuQi.SetConfigType(wenJianLeiXing)

	var luJingYi string
	luJingYi = "./conf"
	duQuQi.AddConfigPath(luJingYi)

	var luJingEr string
	luJingEr = "../conf"
	duQuQi.AddConfigPath(luJingEr)

	var luJingSan string
	luJingSan = "../../conf"
	duQuQi.AddConfigPath(luJingSan)

	var duQuCuoWu error
	duQuCuoWu = duQuQi.ReadInConfig()

	var shiFouDuQuChengGong bool
	shiFouDuQuChengGong = true

	if duQuCuoWu != nil {
		shiFouDuQuChengGong = false
	}

	if shiFouDuQuChengGong == false {
		var cuoWu fanHuiCuoWu
		cuoWu = fmt.Errorf("du qu pei zhi wen jian cuo wu: %w", duQuCuoWu)
		return cuoWu
	}

	var jieXiDuiXiang ZongPeiZhiJieGou
	var jieXiCuoWu error
	jieXiCuoWu = duQuQi.Unmarshal(&jieXiDuiXiang)

	var shiFouJieXiChengGong bool
	shiFouJieXiChengGong = true

	if jieXiCuoWu != nil {
		shiFouJieXiChengGong = false
	}

	if shiFouJieXiChengGong == false {
		var cw fanHuiCuoWu
		cw = fmt.Errorf("jie xi pei zhi cuo wu: %w", jieXiCuoWu)
		return cw
	}

	QuanJuPeiZhiShiLi = &jieXiDuiXiang
	return nil
}

type fanHuiCuoWu error

func (m *MySQLXiangXiPeiZhi) PinJieLianJieZiFu() string {
	var zhangHao string
	zhangHao = m.ZhangHao

	var miMa string
	miMa = m.MiMa

	var diZhi string
	diZhi = m.DiZhi

	var duanKou int
	duanKou = m.DuanKou

	var biaoMing string
	biaoMing = m.DBName

	var ziFuJi string
	ziFuJi = m.Charset

	var moBan string
	moBan = "%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local"

	var zuiZhongLianJie string
	zuiZhongLianJie = fmt.Sprintf(moBan, zhangHao, miMa, diZhi, duanKou, biaoMing, ziFuJi)

	return zuiZhongLianJie
}

func HuoQuHuanJingBianLiangHuoMoRen(jianMing string, moRenZhi string) string {
	var zhi string
	var cunZai bool
	zhi, cunZai = os.LookupEnv(jianMing)

	if cunZai == true {
		return zhi
	} else {
		return moRenZhi
	}
}
