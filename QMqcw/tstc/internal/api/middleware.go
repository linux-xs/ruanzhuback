package api

import (
	"context"
	"log"
	"net/http"
	"runtime/debug"
	"time"

	"tstc/internal/repo"
)

// middleware 是标准的「进站加工」函数，便于自由组合。
type middleware func(http.Handler) http.Handler

// chain 把中间件按书写顺序套在最终 handler 外层。
func chain(final http.Handler, ms ...middleware) http.Handler {
	for i := len(ms) - 1; i >= 0; i-- {
		final = ms[i](final)
	}
	return final
}

// recoverer 拦住 handler 里的 panic，避免单个坏请求拖垮整个进程。
func recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("接口 panic: %v\n%s", rec, debug.Stack())
				fail(w, http.StatusInternalServerError, "panic", "服务开小差了，请稍后重试")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// logger 记录每次请求的路径、状态码与耗时。
// 用自己包一层 ResponseWriter 的方式拿到状态码，不依赖第三方日志库。
func logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)
		log.Printf("%s %s %d %s", r.Method, r.URL.Path, rec.status, time.Since(start).Round(time.Millisecond))
	})
}

// statusRecorder 记录写出的状态码。
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}

// cors 允许本地页面直接调接口，正式部署时把来源收紧到自己的域名。
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Player-UID")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ctxKey 是本包私有的上下文键类型，避免与其他包的键冲突。
type ctxKey uint8

const playerKey ctxKey = 1

// withPlayer 把当前登录玩家放进上下文。
func withPlayer(ctx context.Context, p repo.Player) context.Context {
	return context.WithValue(ctx, playerKey, p)
}

// currentPlayer 取出当前登录玩家，未登录时返回 false。
func currentPlayer(r *http.Request) (repo.Player, bool) {
	p, ok := r.Context().Value(playerKey).(repo.Player)
	return p, ok
}

// guard 做身份识别：客户端用 X-Player-UID 传玩家短号，
// 服务端查库确认存在后放进上下文，后续 handler 不再关心身份来源。
func guard(store *repo.Store, allowQuery bool) middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			uid := headerUID(r, allowQuery)
			if uid == "" {
				fail(w, http.StatusUnauthorized, "no_uid", "缺少玩家标识，请重新进入")
				return
			}
			player, err := store.PlayerByUID(r.Context(), uid)
			if err != nil {
				fail(w, http.StatusUnauthorized, "bad_uid", "玩家标识无效，请重新进入")
				return
			}
			next.ServeHTTP(w, r.WithContext(withPlayer(r.Context(), player)))
		})
	}
}
