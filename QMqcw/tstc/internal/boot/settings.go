// Package boot 负责把配置文件读成结构化参数，并在启动时做一次合法性校验。
// 配置采用极简的「段-键-值」文本格式，避免为一个小服务引入额外的解析依赖。
package boot

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"tstc/internal/repo"
)

// Settings 是服务运行需要的全部配置。
type Settings struct {
	Addr          string
	ReadTimeout   time.Duration
	WriteTimeout  time.Duration
	ShutdownGrace time.Duration
	AllowQueryUID bool

	DB repo.Config

	FullHours      int
	RecallPermille int64
	TicketPermille int64
	LockMinutes    int
	EscapeMinutes  int
	HuntMinutes    int

	PatrolOn           bool
	PatrolInterval     time.Duration
	PatrolSample       int
	PatrolTicketAfter  time.Duration
}

// Default 返回可以直接 run 起来的默认配置（不含数据库口令）。
func Default() Settings {
	var s Settings
	s.Addr = ":8080"
	s.ReadTimeout = 10 * time.Second
	s.WriteTimeout = 20 * time.Second
	s.ShutdownGrace = 8 * time.Second

	s.DB.Host = "127.0.0.1"
	s.DB.Port = 3306
	s.DB.User = "root"
	s.DB.Schema = "tstc"
	s.DB.MaxOpen = 32
	s.DB.MaxIdle = 8
	s.DB.LifeTime = 30 * time.Minute

	s.FullHours = 8
	s.RecallPermille = 900
	s.TicketPermille = 800
	s.LockMinutes = 60
	s.EscapeMinutes = 60
	s.HuntMinutes = 360

	s.PatrolOn = true
	s.PatrolInterval = 10 * time.Minute
	s.PatrolSample = 60
	s.PatrolTicketAfter = 3 * time.Hour
	return s
}

// Load 读取配置文件并叠加到默认值上。
// 文件不存在时返回默认配置，便于本地先跑起来再补配置。
func Load(path string) (Settings, error) {
	s := Default()
	if path == "" {
		return s, nil
	}
	f, err := os.Open(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return s, nil
		}
		return s, err
	}
	defer f.Close()

	section := ""
	scanner := bufio.NewScanner(f)
	line := 0
	for scanner.Scan() {
		line++
		raw := strings.TrimRight(scanner.Text(), "\r")
		text := strings.TrimSpace(stripComment(raw))
		if text == "" {
			continue
		}
		if strings.HasSuffix(text, ":") && !strings.Contains(text, ": ") {
			section = strings.ToLower(strings.TrimSuffix(text, ":"))
			continue
		}
		parts := strings.SplitN(text, ":", 2)
		if len(parts) != 2 {
			return s, fmt.Errorf("第 %d 行格式不正确: %s", line, raw)
		}
		key := strings.ToLower(strings.TrimSpace(parts[0]))
		value := strings.Trim(strings.TrimSpace(parts[1]), `"'`)
		if err := s.apply(section, key, value); err != nil {
			return s, fmt.Errorf("第 %d 行配置无效: %w", line, err)
		}
	}
	if err := scanner.Err(); err != nil {
		return s, err
	}
	return s, s.Validate()
}

// stripComment 去掉行尾注释，允许值里出现 # 号之外的普通字符。
func stripComment(line string) string {
	if i := strings.Index(line, "#"); i >= 0 {
		return line[:i]
	}
	return line
}

// apply 按「段.键」把文本值写进结构体，未知键直接报错以免拼写错误被静默忽略。
func (s *Settings) apply(section, key, value string) error {
	switch section + "." + key {
	case "server.addr", "http.addr":
		s.Addr = value
	case "server.read_timeout", "http.read_timeout":
		s.ReadTimeout = seconds(value)
	case "server.write_timeout", "http.write_timeout":
		s.WriteTimeout = seconds(value)
	case "server.grace":
		s.ShutdownGrace = seconds(value)
	case "server.allow_query_uid":
		s.AllowQueryUID = truth(value)

	case "db.host":
		s.DB.Host = value
	case "db.port":
		s.DB.Port = atoi(value, s.DB.Port)
	case "db.user":
		s.DB.User = value
	case "db.secret", "db.password":
		s.DB.Secret = value
	case "db.schema":
		s.DB.Schema = value
	case "db.max_open":
		s.DB.MaxOpen = atoi(value, s.DB.MaxOpen)
	case "db.max_idle":
		s.DB.MaxIdle = atoi(value, s.DB.MaxIdle)

	case "game.full_hours":
		s.FullHours = atoi(value, s.FullHours)
	case "game.recall_permille":
		s.RecallPermille = int64(atoi(value, int(s.RecallPermille)))
	case "game.ticket_permille":
		s.TicketPermille = int64(atoi(value, int(s.TicketPermille)))
	case "game.lock_minutes":
		s.LockMinutes = atoi(value, s.LockMinutes)
	case "game.escape_minutes":
		s.EscapeMinutes = atoi(value, s.EscapeMinutes)
	case "game.hunt_minutes":
		s.HuntMinutes = atoi(value, s.HuntMinutes)

	case "patrol.on":
		s.PatrolOn = truth(value)
	case "patrol.interval_minutes":
		s.PatrolInterval = time.Duration(atoi(value, 10)) * time.Minute
	case "patrol.sample":
		s.PatrolSample = atoi(value, s.PatrolSample)
	case "patrol.ticket_after_minutes":
		s.PatrolTicketAfter = time.Duration(atoi(value, 180)) * time.Minute

	default:
		return fmt.Errorf("未知配置项 %s.%s", section, key)
	}
	return nil
}

// Validate 检查跨字段的约束：时间轴要单调、比例要在区间内、连接参数不能缺。
func (s Settings) Validate() error {
	if s.Addr == "" {
		return errors.New("监听地址不能为空")
	}
	if s.DB.Host == "" || s.DB.Schema == "" || s.DB.User == "" {
		return errors.New("数据库连接参数不完整")
	}
	if s.LockMinutes <= 0 || s.EscapeMinutes <= 0 || s.HuntMinutes <= 0 {
		return errors.New("时间轴各段必须大于零")
	}
	if s.FullHours*60 != s.LockMinutes+s.EscapeMinutes+s.HuntMinutes {
		return errors.New("时间轴总时长必须等于满额小时数")
	}
	if s.RecallPermille <= 0 || s.RecallPermille > 1000 {
		return errors.New("召回比例必须在 1 到 1000 之间")
	}
	if s.TicketPermille <= 0 || s.TicketPermille >= 1000 {
		return errors.New("贴条分成比例必须在 1 到 999 之间")
	}
	return nil
}

// seconds 把秒数文本转成时长，非法值回落到零。
func seconds(v string) time.Duration {
	n, err := strconv.Atoi(strings.TrimSpace(v))
	if err != nil || n < 0 {
		return 0
	}
	return time.Duration(n) * time.Second
}

// atoi 解析整数，失败时保留原值。
func atoi(v string, def int) int {
	n, err := strconv.Atoi(strings.TrimSpace(v))
	if err != nil {
		return def
	}
	return n
}

// truth 把常见的是/否写法转成布尔。
func truth(v string) bool {
	switch strings.ToLower(strings.TrimSpace(v)) {
	case "1", "true", "yes", "on", "开":
		return true
	}
	return false
}

// Env 读取环境变量覆盖敏感项，容器部署时不必把口令写进文件。
func (s *Settings) Env(get func(string) string) {
	if v := get("TSTC_DB_SECRET"); v != "" {
		s.DB.Secret = v
	}
	if v := get("TSTC_DB_HOST"); v != "" {
		s.DB.Host = v
	}
	if v := get("TSTC_ADDR"); v != "" {
		s.Addr = v
	}
}
