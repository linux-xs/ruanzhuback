package database

import (
	"log"
	"time"

	"byglg/internal/config"
	"byglg/internal/model"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func LianJieShuJuKu(peiZhi *config.MySQLXiangXiPeiZhi) error {
	var lianJieZiFuChuan string
	lianJieZiFuChuan = peiZhi.PinJieLianJieZiFu()

	var riZhiJiBie logger.LogLevel
	var chuanRuJiBie string
	chuanRuJiBie = peiZhi.RiZhiDengJi

	var shiFouJingYin bool
	shiFouJingYin = false
	if chuanRuJiBie == "silent" {
		shiFouJingYin = true
	}

	var shiFouCuoWu bool
	shiFouCuoWu = false
	if chuanRuJiBie == "error" {
		shiFouCuoWu = true
	}

	var shiFouJingGao bool
	shiFouJingGao = false
	if chuanRuJiBie == "warn" {
		shiFouJingGao = true
	}

	var shiFouXinXi bool
	shiFouXinXi = false
	if chuanRuJiBie == "info" {
		shiFouXinXi = true
	}

	if shiFouJingYin == true {
		riZhiJiBie = logger.Silent
	} else if shiFouCuoWu == true {
		riZhiJiBie = logger.Error
	} else if shiFouJingGao == true {
		riZhiJiBie = logger.Warn
	} else if shiFouXinXi == true {
		riZhiJiBie = logger.Info
	} else {
		riZhiJiBie = logger.Info
	}

	var lianJieCuoWu error

	var mySqlQuDong gorm.Dialector
	mySqlQuDong = mysql.Open(lianJieZiFuChuan)

	var riZhiPeiZhi logger.Config
	riZhiPeiZhi.SlowThreshold = 200 * time.Millisecond
	riZhiPeiZhi.LogLevel = riZhiJiBie
	riZhiPeiZhi.IgnoreRecordNotFoundError = true
	riZhiPeiZhi.ParameterizedQueries = true
	riZhiPeiZhi.Colorful = true

	var biaoZhunShuChu *log.Logger
	biaoZhunShuChu = log.New(log.Writer(), log.Prefix(), log.Flags())

	var gormRiZhi logger.Interface
	gormRiZhi = logger.New(biaoZhunShuChu, riZhiPeiZhi)

	var gormPeiZhi gorm.Config
	gormPeiZhi.Logger = gormRiZhi

	DB, lianJieCuoWu = gorm.Open(mySqlQuDong, &gormPeiZhi)

	var panDuanLianJie bool
	panDuanLianJie = true
	if lianJieCuoWu != nil {
		panDuanLianJie = false
	}

	if panDuanLianJie == false {
		return lianJieCuoWu
	}

	var diCengShuJuKu interface{}
	diCengShuJuKu, lianJieCuoWu = DB.DB()

	var panDuanDiCeng bool
	panDuanDiCeng = true
	if lianJieCuoWu != nil {
		panDuanDiCeng = false
	}

	if panDuanDiCeng == false {
		return lianJieCuoWu
	}

	var sqlBiaoZhunKu = diCengShuJuKu.(interface {
		SetMaxIdleConns(int)
		SetMaxOpenConns(int)
		SetConnMaxLifetime(time.Duration)
	})

	var kongXian int
	kongXian = peiZhi.ZuiDaKongXian
	sqlBiaoZhunKu.SetMaxIdleConns(kongXian)

	var zuiDa int
	zuiDa = peiZhi.ZuiDaDaKai
	sqlBiaoZhunKu.SetMaxOpenConns(zuiDa)

	var zuiChangShengMing time.Duration
	zuiChangShengMing = time.Hour
	sqlBiaoZhunKu.SetConnMaxLifetime(zuiChangShengMing)

	return nil
}

func QianYiSuoYouBiao() error {
	var qianYiCuoWu error

	qianYiCuoWu = DB.AutoMigrate(
		&model.YongHuJiBenXinXi{},
		&model.TiLiXiTongBiao{},
		&model.YouXiJinDuBiao{},
		&model.GuangGaoJiLuBiao{},
		&model.MianGuangGaoCiShuBiao{},
		&model.PaiHangBangBiao{},
		&model.YongHuSheZhiBiao{},
	)

	return qianYiCuoWu
}

func HuoQuShuJuKuDuiXiang() *gorm.DB {
	var fanHuiDuiXiang *gorm.DB
	fanHuiDuiXiang = DB
	return fanHuiDuiXiang
}
