package api

import (
	"net/http"
)

// lots 返回我的车位与停在上面的车。
func (a *API) lots(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	list, err := a.svc.Lots(r.Context(), self.ID)
	if err != nil {
		replyErr(w, err)
		return
	}
	free := 0
	for _, lot := range list {
		if lot.Occupant == nil {
			free++
		}
	}
	ok(w, map[string]interface{}{
		"items": list,
		"free":  free,
		"total": len(list),
	})
}

// ticket 给停在我家车位上的车贴条。
// 路径参数是车辆 ID，与「我的车位」列表里每辆外来车携带的 vehicle_id 对应。
func (a *API) ticket(w http.ResponseWriter, r *http.Request) {
	self, isIn := currentPlayer(r)
	if !isIn {
		replyErr(w, errNoSession)
		return
	}
	vehicleID := pathID(r, "id")
	if vehicleID == 0 {
		replyErr(w, errBadPath)
		return
	}
	result, err := a.svc.Ticket(r.Context(), self.ID, vehicleID)
	if err != nil {
		replyErr(w, err)
		return
	}
	ok(w, result)
}
