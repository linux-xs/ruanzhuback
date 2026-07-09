let daTingKongZhiMoKuai = require('./js/hall.js');

let suoYouYouXiBanKuai = {};

let fk = require('./games/fangkuai/index.js');
suoYouYouXiBanKuai.fangkuai = fk;

let els = require('./games/eluosi/index.js');
suoYouYouXiBanKuai.eluosi = els;

let llk = require('./games/lianliankan/index.js');
suoYouYouXiBanKuai.lianliankan = llk;

let jt = require('./games/jiantou/index.js');
suoYouYouXiBanKuai.jiantou = jt;

let lh = require('./games/linghun/index.js');
suoYouYouXiBanKuai.linghun = lh;

let dmm = require('./games/duomaomao/index.js');
suoYouYouXiBanKuai.duomaomao = dmm;

let tc = require('./games/tingche/index.js');
suoYouYouXiBanKuai.tingche = tc;

let pt = require('./games/pintu/index.js');
suoYouYouXiBanKuai.pintu = pt;

let fh = require('./games/fanhui/index.js');
suoYouYouXiBanKuai.fanhui = fh;

let daTingShiLiDuiXiang = new daTingKongZhiMoKuai(suoYouYouXiBanKuai);

let zhiXingJieGuo = daTingShiLiDuiXiang.chuShiHuaDaTing();