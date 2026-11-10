package api

import (
	"net/http"
	"time"
)

// registerReq 是建号请求体，昵称可空。
type registerReq struct {
	Nick string `json:"nick"`
}

// register 建号并返回新玩家的完整档案。
// 短号的种子取当前纳秒时间，保证同一毫秒内多次建号也不会撞号。
func (a *API) register(w http.ResponseWriter, r *http.Request) {
	var req registerReq
	if err := decode(r, &req); err != nil {
		replyErr(w, err)
		return
	}
	seed := time.Now().UnixNano()
	result, err := a.svc.Register(r.Context(), req.Nick, seed)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, result)
}

// profile 返回首页需要的资产与规则参数。
func (a *API) profile(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	data, err := a.svc.Profile(r.Context(), self.ID)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, data)
}

// renameReq 是改昵称请求体。
type renameReq struct {
	Nick string `json:"nick"`
}

// rename 修改昵称。
func (a *API) rename(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	var req renameReq
	if err := decode(r, &req); err != nil {
		replyErr(w, err)
		return
	}
	if err := a.svc.Rename(r.Context(), self.ID, req.Nick); err != nil {
		replyErr(w, err)
		return
	}
	ok(w, map[string]string{"nick": req.Nick})
}

// signReq 是签到请求体，way 取 plain 或 card。
type signReq struct {
	Way string `json:"way"`
}

// sign 执行每日签到。
func (a *API) sign(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	var req signReq
	if err := decode(r, &req); err != nil {
		replyErr(w, err)
		return
	}
	if req.Way == "" {
		req.Way = "plain"
	}
	result, err := a.svc.Sign(r.Context(), self.ID, req.Way)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, result)
}

// claimCard 领取一张幸运卡，对应客户端「看完激励内容」的回调。
func (a *API) claimCard(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	result, err := a.svc.ClaimCard(r.Context(), self.ID)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, result)
}

// search 按短号查名片。
func (a *API) search(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	card, err := a.svc.SearchPlayer(r.Context(), self.ID, r.PathValue("uid"))
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, card)
}
