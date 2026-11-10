package api

import (
	"net/http"

	"tstc/internal/repo"
	"tstc/internal/service"
)

// Options 是装配 HTTP 层需要的开关。
type Options struct {
	// AllowQueryUID 打开后允许用 ?uid= 调试接口。
	AllowQueryUID bool
	// StaticDir 指向前端目录，为空则不挂静态文件。
	StaticDir string
	// Version 会出现在 ping 响应里，便于确认线上部署的是哪一版。
	Version string
}

// API 持有路由表与服务引用。
type API struct {
	svc     *service.Service
	store   *repo.Store
	opts    Options
	handler http.Handler
}

// New 注册全部路由并套好中间件。
//
// 路由分两层：ping 与注册是公开的，其余接口统一挂在 /api/v1/ 下由 guard 解析身份。
// 由于公开路由的路径更具体，ServeMux 会优先匹配它们，天然绕开鉴权。
func New(svc *service.Service, store *repo.Store, opts Options) *API {
	a := &API{svc: svc, store: store, opts: opts}

	root := http.NewServeMux()
	root.HandleFunc("GET /api/v1/ping", a.ping)
	root.HandleFunc("POST /api/v1/register", a.register)

	guarded := http.NewServeMux()
	a.routes(guarded)
	root.Handle("/api/v1/", guard(store, opts.AllowQueryUID)(guarded))

	if opts.StaticDir != "" {
		root.Handle("/", http.FileServer(http.Dir(opts.StaticDir)))
	}
	a.handler = chain(root, recoverer, logger, cors)
	return a
}

// Handler 返回可以直接交给 http.Server 的处理器。
func (a *API) Handler() http.Handler { return a.handler }

// routes 注册所有需要登录的接口。
func (a *API) routes(m *http.ServeMux) {
	m.HandleFunc("GET /api/v1/me", a.profile)
	m.HandleFunc("PATCH /api/v1/me", a.rename)
	m.HandleFunc("POST /api/v1/me/sign", a.sign)
	m.HandleFunc("POST /api/v1/me/cards", a.claimCard)

	m.HandleFunc("GET /api/v1/vehicles", a.vehicles)
	m.HandleFunc("POST /api/v1/vehicles", a.buy)
	m.HandleFunc("POST /api/v1/vehicles/{id}/sell", a.sell)
	m.HandleFunc("POST /api/v1/vehicles/{id}/park", a.park)
	m.HandleFunc("POST /api/v1/vehicles/{id}/recall", a.recall)
	m.HandleFunc("POST /api/v1/vehicles/{id}/card", a.cardSettle)

	m.HandleFunc("GET /api/v1/lots", a.lots)
	m.HandleFunc("POST /api/v1/lots/{id}/ticket", a.ticket)

	m.HandleFunc("GET /api/v1/bonds", a.bonds)
	m.HandleFunc("POST /api/v1/bonds", a.mark)
	m.HandleFunc("GET /api/v1/feed", a.feed)
	m.HandleFunc("GET /api/v1/recommend", a.recommend)
	m.HandleFunc("GET /api/v1/players/{uid}", a.search)
	m.HandleFunc("GET /api/v1/catalog", a.catalog)
}

// ping 是探活接口，同时暴露服务名与当前时间。
func (a *API) ping(w http.ResponseWriter, r *http.Request) {
	ok(w, map[string]interface{}{
		"service": "偷偷停个车",
		"version": a.opts.Version,
		"now":     a.svc.Now().Format("2006-01-02 15:04:05"),
	})
}
