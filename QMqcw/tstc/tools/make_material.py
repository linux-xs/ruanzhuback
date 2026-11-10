# -*- coding: utf-8 -*-
"""生成软著「程序鉴别材料」：前 30 页 + 后 30 页，共 60 页。

规则：
  * 只收业务源码（Go 服务端 / 网页前端 / 数据库脚本），不收构建产物、依赖与素材
  * 过滤全部空行，保证每页不少于 50 行
  * 每个源文件前插一行分隔标注，便于审查员对应模块
  * 文件顺序固定：领域规则 → 业务编排 → 数据访问 → 生态任务 → 配置 → 数据库
    → 启动入口 → 接口层 → 前端页面
  * 取前 1500 行 + 后 1500 行；头部说明不计入这 3000 行
输出可复算：同一份源码反复运行，字节级一致（脚本会打印 MD5）
"""
import hashlib
import io
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(ROOT)
OUT = os.path.join(PROJECT, "TSTC_源程序鉴别材料.txt")

HEAD_PAGE = 1500
TAIL_PAGE = 1500
LINES_PER_PAGE = 50

SOFTWARE = "偷偷停个车游戏软件"
SHORT = "偷偷停个车"
VERSION = "V1.0"

# 收录顺序即材料里的出现顺序，刻意按「读代码的人怎么理解这个系统」排
FILES = [
    "internal/money/money.go",
    "internal/gameplay/stage.go",
    "internal/gameplay/quote.go",
    "internal/gameplay/settle.go",
    "internal/gameplay/catalog.go",
    "internal/gameplay/garage.go",
    "internal/service/service.go",
    "internal/service/account.go",
    "internal/service/register.go",
    "internal/service/garage.go",
    "internal/service/park.go",
    "internal/service/social.go",
    "internal/repo/model.go",
    "internal/repo/db.go",
    "internal/repo/player.go",
    "internal/repo/vehicle.go",
    "internal/repo/lot.go",
    "internal/repo/social.go",
    "internal/patrol/bot.go",
    "internal/boot/settings.go",
    "sql/schema.sql",
    "sql/seed.sql",
    "cmd/server/main.go",
    "internal/api/envelope.go",
    "internal/api/middleware.go",
    "internal/api/router.go",
    "internal/api/h_account.go",
    "internal/api/h_vehicle.go",
    "internal/api/h_lot.go",
    "internal/api/h_social.go",
    "web/index.html",
    "web/assets/core/fmt.js",
    "web/assets/core/api.js",
    "web/assets/core/store.js",
    "web/assets/views/home.js",
    "web/assets/views/garage.js",
    "web/assets/views/lot.js",
    "web/assets/views/contacts.js",
    "web/assets/views/catalog.js",
    "web/assets/app.js",
]


def read_lines(rel):
    path = os.path.join(PROJECT, rel)
    with io.open(path, encoding="utf-8") as fp:
        text = fp.read().replace("\r\n", "\n").replace("\r", "\n")
    return [line.rstrip() for line in text.split("\n") if line.strip()]


def build_header(total_lines, code_lines, taken_head, taken_tail, covered):
    return [
        "/* " + "=" * 66,
        " * 软件全称：%s" % SOFTWARE,
        " * 软件简称：%s" % SHORT,
        " * 版本号：%s" % VERSION,
        " * 申请材料：程序鉴别材料（源程序）",
        " *" ,
        " * 一、收录范围",
        " *   服务端 Go 源码（cmd/、internal/ 共 28 个文件）",
        " *   网页前端源码（web/ 共 10 个文件：HTML 与 JavaScript）",
        " *   数据库脚本（sql/ 共 2 个文件：结构脚本与初始数据脚本）",
        " *   不含依赖包、构建产物、样式表与图片素材",
        " *",
        " * 二、编排规则",
        " *   1. 过滤全部空行，每页不少于 %d 行；" % LINES_PER_PAGE,
        " *   2. 每个源文件之前有一行分隔标注，格式为「==== 源文件: 相对路径 ====」；",
        " *   3. 文件顺序固定为：领域规则 → 业务编排 → 数据访问 → 生态任务 → 运行配置",
        " *      → 数据库脚本 → 启动入口 → 接口层 → 前端页面；",
        " *   4. 收录 %d 个源文件，去空行共 %d 行（约 %d 页），连同文件标注共 %d 行；"
        "本材料取前 %d 行与后 %d 行，共 %d 行、%d 页。"
        % (covered, code_lines, code_lines // LINES_PER_PAGE, total_lines,
           taken_head, taken_tail,
           taken_head + taken_tail, (taken_head + taken_tail) // LINES_PER_PAGE),
        " *",
        " * 三、中段说明",
        " *   源码总量超过 60 页时，中间部分按规则不进入本材料，这是「前 30 页 + 后 30 页」",
        " *   交存规则的必然结果。全部源码文件清单及其职责见《软件说明书》第六章。",
        " *",
        " * 四、完整性校验",
        " *   收录源文件 %d 个，MD5 见生成日志，可随时复算比对。" % covered,
        " * " + "=" * 66 + " */",
    ]


def main():
    chunks = []
    for rel in FILES:
        lines = read_lines(rel)
        if not lines:
            print("[WARN] 空文件，已跳过: %s" % rel)
            continue
        chunks.append("// ==== 源文件: %s ==== " % rel)
        chunks.extend(lines)

    total = len(chunks)
    code_lines = sum(1 for line in chunks if not line.startswith("// ==== 源文件:"))
    head = chunks[:HEAD_PAGE]
    tail = chunks[-TAIL_PAGE:]
    body = head + tail

    header = build_header(total, code_lines, len(head), len(tail), len(FILES))
    out_lines = header + body
    raw = "\n".join(out_lines) + "\n"
    with io.open(OUT, "w", encoding="utf-8", newline="\n") as fp:
        fp.write(raw)

    md5 = hashlib.md5(raw.encode("utf-8")).hexdigest()
    print("输出文件    %s" % OUT)
    print("收录源文件  %d 个" % len(FILES))
    print("源码正文    %d 行（去空行，约 %d 页），加 %d 行文件标注共 %d 行"
          % (code_lines, code_lines // LINES_PER_PAGE, len(FILES), total))
    print("材料正文    %d 行 = 前 %d + 后 %d" % (len(body), len(head), len(tail)))
    print("材料页数    %d 页（每页 %d 行）" % (len(body) // LINES_PER_PAGE, LINES_PER_PAGE))
    print("空行数      %d" % sum(1 for l in out_lines if not l.strip()))
    print("MD5         %s" % md5)
    print("最长行      %d 字符" % max(len(l) for l in out_lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
