package api

import (
	"net/http"
	"strconv"

	"tstc/internal/repo"
)

// markReq 是标记关系的请求体。
type markReq struct {
	TargetUID string `json:"target_uid"`
	Kind      string `json:"kind"`
}

// bonds 返回好友或仇人列表，kind 通过查询串传入。
func (a *API) bonds(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	kind := r.URL.Query().Get("kind")
	if kind == "" {
		kind = repo.BondFriend
	}
	list, err := a.svc.Bonds(r.Context(), self.ID, kind)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, map[string]interface{}{"items": list, "count": len(list), "kind": kind})
}

// mark 把某人标成好友或仇人。
func (a *API) mark(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	var req markReq
	if err := decode(r, &req); err != nil {
		replyErr(w, err)
		return
	}
	if err := a.svc.Mark(r.Context(), self.ID, req.TargetUID, req.Kind); err != nil {
		replyErr(w, err)
		return
	}
	ok(w, map[string]string{"target_uid": req.TargetUID, "kind": req.Kind})
}

// feed 返回访客动态，hours 缺省为 24 小时。
func (a *API) feed(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	hours := 24
	if raw := r.URL.Query().Get("hours"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil {
			hours = n
		}
	}
	list, err := a.svc.Feed(r.Context(), self.ID, hours)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, map[string]interface{}{"items": list, "count": len(list), "hours": hours})
}

// recommend 返回推荐玩家列表。
func (a *API) recommend(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	list, err := a.svc.Recommend(r.Context(), self.ID)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, map[string]interface{}{"items": list, "count": len(list)})
}
