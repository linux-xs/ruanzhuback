package api

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strings"

	"tstc/internal/repo"
	"tstc/internal/service"
)

// 接口统一用「data 或 error」两种形态，客户端只看 ok 字段决定走哪条分支。
type reply struct {
	OK    bool        `json:"ok"`
	Data  interface{} `json:"data,omitempty"`
	Error *failure    `json:"error,omitempty"`
}

// failure 是结构化错误，code 供前端做分支，text 直接展示给玩家。
type failure struct {
	Code string `json:"code"`
	Text string `json:"text"`
}

// errNoSession 表示请求没有经过身份中间件，通常是路由配置写错了。
var errNoSession = errors.New("缺少登录态")

// errBadPath 表示路径里的数字 ID 不合法。
var errBadPath = errors.New("路径参数不合法")

// writeJSON 输出 JSON 响应，写失败只记日志（此时连接通常已断）。
func writeJSON(w http.ResponseWriter, status int, body reply) {
	buf, err := json.Marshal(body)
	if err != nil {
		http.Error(w, `{"ok":false,"error":{"code":"encode","text":"响应编码失败"}}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	if _, err := w.Write(buf); err != nil {
		log.Printf("响应写入失败: %v", err)
	}
}

// ok 输出成功响应。
func ok(w http.ResponseWriter, data interface{}) {
	writeJSON(w, http.StatusOK, reply{OK: true, Data: data})
}

// fail 输出失败响应。
func fail(w http.ResponseWriter, status int, code, text string) {
	writeJSON(w, status, reply{OK: false, Error: &failure{Code: code, Text: text}})
}

// statusOf 把业务错误映射成 HTTP 状态与错误码。
// 三处信息必须同时给到前端：能不能重试、要不要引导玩家去做什么、文案是什么。
func statusOf(err error) (int, string, string) {
	switch {
	case err == nil:
		return http.StatusOK, "", ""
	case errors.Is(err, service.ErrBadInput):
		return http.StatusBadRequest, "bad_input", "参数不正确，请检查后再试"
	case errors.Is(err, service.ErrNoPlayer):
		return http.StatusNotFound, "no_player", "找不到这个玩家"
	case errors.Is(err, service.ErrNoCoin):
		return http.StatusConflict, "no_coin", "金币不足，先去停车攒一点"
	case errors.Is(err, service.ErrNoCard):
		return http.StatusConflict, "no_card", "幸运卡不足，到首页点「获取」领一张"
	case errors.Is(err, service.ErrNoFreeLot):
		return http.StatusConflict, "no_lot", "眼下没有空车位，稍后再试"
	case errors.Is(err, service.ErrSlotFull):
		return http.StatusConflict, "slot_full", "额度已满，先卖掉一辆车"
	case errors.Is(err, service.ErrOccupied):
		return http.StatusConflict, "busy", "这辆车或车位刚刚被别人动过，刷新看看"
	case errors.Is(err, service.ErrNotYours):
		return http.StatusForbidden, "not_yours", "这不是你的资产"
	case errors.Is(err, service.ErrSelf):
		return http.StatusBadRequest, "self", "不能对自己做这个操作"
	case errors.Is(err, service.ErrLevelLocked):
		return http.StatusForbidden, "locked", "等级不够，这辆车还没解锁"
	case errors.Is(err, service.ErrSigned):
		return http.StatusConflict, "signed", "今天已经签到过了"
	case errors.Is(err, service.ErrAdExhausted):
		return http.StatusConflict, "ad_limit", "今天的幸运卡已经领完，明天再来"
	case errors.Is(err, repo.ErrNoRow):
		return http.StatusNotFound, "no_row", "数据不存在"
	default:
		log.Printf("未预期的错误: %v", err)
		return http.StatusInternalServerError, "internal", "服务开小差了，请稍后重试"
	}
}

// replyErr 统一出口：任何 handler 只要把错误传进来即可。
func replyErr(w http.ResponseWriter, err error) {
	status, code, text := statusOf(err)
	fail(w, status, code, text)
}

// maxBody 限制请求体大小，防止超大 JSON 占满内存。
const maxBody = 1 << 20

// decode 解析请求体，并拒绝未知字段之外的空体。
func decode(r *http.Request, dst interface{}) error {
	if r.Body == nil {
		return service.ErrBadInput
	}
	limited := io.LimitReader(r.Body, maxBody)
	dec := json.NewDecoder(limited)
	if err := dec.Decode(dst); err != nil {
		if errors.Is(err, io.EOF) {
			return service.ErrBadInput
		}
		return service.ErrBadInput
	}
	return nil
}

// pathID 从路径里取出数字 ID，非法值返回零。
func pathID(r *http.Request, name string) int64 {
	raw := r.PathValue(name)
	var id int64
	for _, ch := range raw {
		if ch < '0' || ch > '9' {
			return 0
		}
		id = id*10 + int64(ch-'0')
		if id > 1<<62 {
			return 0
		}
	}
	return id
}

// headerUID 读客户端携带的玩家短号。
// 优先读请求头，调试期允许从查询串取，方便直接用浏览器点接口。
func headerUID(r *http.Request, allowQuery bool) string {
	if v := r.Header.Get("X-Player-UID"); v != "" {
		return strings.ToUpper(strings.TrimSpace(v))
	}
	if allowQuery {
		if v := r.URL.Query().Get("uid"); v != "" {
			return strings.ToUpper(strings.TrimSpace(v))
		}
	}
	return ""
}
