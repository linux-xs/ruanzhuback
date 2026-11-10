# -*- coding: utf-8 -*-
"""用 Word 排版源码鉴别材料，目标：60 页、每页恰好 50 行、长行不折行。

步骤：
  1. 按「显示列宽」挑字号（中文算 2 列、西文算 1 列），保证最长一行不折行；
  2. 逐档试行距，用 Word 自己分页，命中 60 页即停（不折行前提下 60 页 = 每页 50 行）；
  3. 导出 PDF 后用 pypdf 回读每页行数复验。
"""
import io
import os
import sys
import unicodedata

import win32com.client as win32
from pypdf import PdfReader

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

SRC_TXT = "TSTC_源程序鉴别材料.txt"
OUT_DOCX = "偷偷停个车游戏软件源码-V1.0-修订版.docx"
OUT_PDF = "偷偷停个车游戏软件源码-V1.0-修订版.pdf"

HEADER_TEXT = "偷偷停个车游戏软件 V1.0"
FONT_SIZE_MAX = 9.0
A4_W, A4_H = 595.3, 841.9
MARGIN = 28.35            # 1 cm
USABLE_W = A4_W - 2 * MARGIN
# Consolas 的西文字宽约为 0.55 em，中文为 1 em
ASCII_EM = 0.55


def wide(ch):
    return unicodedata.east_asian_width(ch) in ("W", "F", "A") and ord(ch) > 0x2E80


def line_em(line):
    """估算一行需要的 em 宽度：西文 0.55，中文 1.0。"""
    em = 0.0
    for ch in line:
        em += 1.0 if wide(ch) else ASCII_EM
    return em


def pick_font_size(lines):
    need = max(line_em(l) for l in lines)
    size = USABLE_W / need
    size = min(FONT_SIZE_MAX, size)
    # 留 4% 余量并向下取到 0.5 磅
    size = int((size * 0.96) * 2) / 2.0
    return max(5.0, size), need


def body_only(raw):
    """去掉开头的 /* ... */ 材料说明块，只留 3000 行正文。

    说明书里已经写明提取规则，正文必须是 3000 行才能正好 60 页 × 50 行；
    多出 26 行说明文字会把末页压成十几行。
    """
    lines = raw.splitlines()
    start = 0
    if lines and lines[0].lstrip().startswith("/*"):
        for i, line in enumerate(lines[:60]):
            if "*/" in line:
                start = i + 1
                break
    kept = [l for l in lines[start:] if l.strip() or True]
    while kept and not kept[0].strip():
        kept.pop(0)
    return "\n".join(kept)


def build(word, text, size, pitch):
    doc = word.Documents.Add()
    ps = doc.PageSetup
    ps.PageWidth = A4_W
    ps.PageHeight = A4_H
    ps.TopMargin = MARGIN
    ps.BottomMargin = MARGIN
    ps.LeftMargin = MARGIN
    ps.RightMargin = MARGIN
    ps.HeaderDistance = 14
    ps.FooterDistance = 14

    doc.Content.Text = text

    content = doc.Content
    content.Font.Name = "Consolas"
    content.Font.NameFarEast = "宋体"
    content.Font.Size = size
    content.NoProofing = True

    pf = content.ParagraphFormat
    pf.LineSpacingRule = 4          # 固定行距
    pf.LineSpacing = pitch
    pf.SpaceBefore = 0
    pf.SpaceAfter = 0
    pf.WidowControl = False
    pf.KeepWithNext = False
    pf.KeepTogether = False
    pf.Alignment = 0

    head = doc.Sections(1).Headers(1).Range
    head.Text = HEADER_TEXT
    head.Font.Name = "宋体"
    head.Font.Size = 9
    head.ParagraphFormat.Alignment = 1

    foot = doc.Sections(1).Footers(1)
    foot.Range.Fields.Add(foot.Range, 33)

    doc.Repaginate()
    pages = doc.ComputeStatistics(2)
    lines_total = doc.ComputeStatistics(1)
    return doc, pages, lines_total


def main():
    raw = io.open(SRC_TXT, encoding="utf-8").read()
    body = body_only(raw)
    lines = body.splitlines()
    src_lines = len([l for l in lines if l.strip()])
    size, need_em = pick_font_size(lines)
    print("材料行数 %d，最长一行需要 %.0f em；选定字号 %.1f 磅" % (src_lines, need_em, size))

    text = body.replace("\r\n", "\n").replace("\n", "\r")
    word = win32.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    # 关掉「中文与西文之间自动加空格」，否则 "城市紧凑SUV" 会被印成 "城市紧凑 SUV"
    for opt in ("AutoAdjustSpaceBetweenAsianAndLatinText",
                "AutoAdjustSpaceBetweenAsianAndLatinNumbers"):
        try:
            setattr(word.Options, opt, False)
        except Exception:
            pass

    chosen = None
    for pitch in [15.6, 15.5, 15.4, 15.3, 15.2, 15.1]:
        doc, pages, wrapped = build(word, text, size, pitch)
        status = "%d 页，Word 计行 %d" % (pages, wrapped)
        if pages != 60:
            print("  行距 %.1f 磅 → %s，跳过" % (pitch, status))
            doc.Close(0)
            continue
        # 页数对了还要看每页行数：导出 PDF 用 pypdf 复验
        tmp = os.path.abspath("_tmp_pitch_%.1f.pdf" % pitch)
        doc.ExportAsFixedFormat(tmp, 17)
        reader = PdfReader(tmp)
        counts = [len([l for l in (p.extract_text() or "").splitlines() if l.strip()])
                  for p in reader.pages]
        print("  行距 %.1f 磅 → %s，每页行数最少 %d / 最多 %d"
              % (pitch, status, min(counts), max(counts)))
        os.remove(tmp)
        if min(counts) >= 50:
            chosen = (doc, pitch)
            break
        doc.Close(0)

    if chosen is None:
        print("没有命中 60 页，请手工微调")
        word.Quit()
        return 1

    doc, pitch = chosen
    docx_path = os.path.abspath(OUT_DOCX)
    pdf_path = os.path.abspath(OUT_PDF)
    doc.SaveAs2(docx_path, 12)   # wdFormatXMLDocument = 真 docx（16 会存成 .doc）
    doc.ExportAsFixedFormat(pdf_path, 17)
    doc.Close(0)
    word.Quit()

    reader = PdfReader(pdf_path)
    counts = []
    for page in reader.pages:
        got = (page.extract_text() or "").splitlines()
        counts.append(len([l for l in got if l.strip()]))
    print("-" * 60)
    print("字号 %.1f 磅，行距 %.1f 磅，页边距 1 cm" % (size, pitch))
    print("PDF: %d 页；每页行数 最少 %d / 最多 %d / 合计 %d"
          % (len(reader.pages), min(counts), max(counts), sum(counts)))
    print("输出: %s" % OUT_DOCX)
    print("输出: %s" % OUT_PDF)
    ok = len(reader.pages) == 60 and min(counts) >= 50
    print("结论: %s" % ("60 页且每页不少于 50 行 ✅" if ok else "需要再调"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
