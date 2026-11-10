package api

import (
	"net/http"
)

// buyReq 是买车请求体。
type buyReq struct {
	Level int `json:"level"`
}

// parkReq 是停车请求体，TargetUID 为空表示一键停车。
type parkReq struct {
	TargetUID string `json:"target_uid"`
}

// vehicles 返回车库列表。
func (a *API) vehicles(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	list, err := a.svc.Garage(r.Context(), self.ID)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, map[string]interface{}{"items": list, "count": len(list)})
}

// buy 购买车辆。
func (a *API) buy(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	var req buyReq
	if err := decode(r, &req); err != nil {
		replyErr(w, err)
		return
	}
	result, err := a.svc.Buy(r.Context(), self.ID, req.Level)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, result)
}

// sell 卖车。
func (a *API) sell(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	id := pathID(r, "id")
	if id == 0 {
		replyErr(w, errBadPath)
		return
	}
	result, err := a.svc.Sell(r.Context(), self.ID, id)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, result)
}

// park 把车停出去，带目标短号时走精准停车。
func (a *API) park(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	id := pathID(r, "id")
	if id == 0 {
		replyErr(w, errBadPath)
		return
	}
	var req parkReq
	// 一键停车允许空体，只有精准停车才需要 target_uid。
	if r.ContentLength > 0 {
		if err := decode(r, &req); err != nil {
			replyErr(w, err)
			return
		}
	}
	result, err := a.svc.Park(r.Context(), self.ID, id, req.TargetUID)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, result)
}

// recall 召回车辆。
func (a *API) recall(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	id := pathID(r, "id")
	if id == 0 {
		replyErr(w, errBadPath)
		return
	}
	result, err := a.svc.Recall(r.Context(), self.ID, id)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, result)
}

// cardSettle 用幸运卡秒结。
func (a *API) cardSettle(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	id := pathID(r, "id")
	if id == 0 {
		replyErr(w, errBadPath)
		return
	}
	result, err := a.svc.CardSettle(r.Context(), self.ID, id)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, result)
}

// catalog 返回车辆图鉴。
func (a *API) catalog(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	list, err := a.svc.CatalogView(r.Context(), self.ID)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, map[string]interface{}{"items": list, "count": len(list)})
}
