package common

import "github.com/gin-gonic/gin"

// 统一响应结构
type Resp struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

// 错误码定义
const (
	CodeSuccess       = 0
	CodeParamErr      = 400
	CodeAuthErr       = 401
	CodeForbidden     = 403
	CodeNotFound      = 404
	CodeServerErr     = 500
	CodeCarNotIdle    = 1001
	CodeSpaceFull     = 1002
	CodeNoLuckyCard   = 1003
	CodeLockPeriod    = 1004
	CodeGoldNotEnough = 1005
	CodeLevelLimit    = 1006
	CodeCarLimit      = 1007
)

func Success(c *gin.Context, data interface{}) {
	c.JSON(200, Resp{Code: CodeSuccess, Msg: "ok", Data: data})
}

func Fail(c *gin.Context, code int, msg string) {
	c.JSON(200, Resp{Code: code, Msg: msg})
}

func Error(c *gin.Context, msg string) {
	c.JSON(200, Resp{Code: CodeServerErr, Msg: msg})
}
