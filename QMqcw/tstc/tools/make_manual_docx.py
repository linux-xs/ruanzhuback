# -*- coding: utf-8 -*-
"""把 TSTC_软件说明书.md 排成 docx（纯文字 + 表格，不含任何截图）。

用 python-docx 生成结构，再用 Word 导出 PDF 并数页数。
排版：A4、页边距 2 cm、正文宋体五号(10.5pt)、行距 1.3、表格 9pt 加边框、
      页眉「软件全称 + 版本」、页脚页码。
"""
import io
import os
import re
import sys

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

SRC = "TSTC_软件说明书.md"
OUT_DOCX = "偷偷停个车游戏软件操作手册-V1.0-纯文字版.docx"
OUT_PDF = "偷偷停个车游戏软件操作手册-V1.0-纯文字版.pdf"
HEADER = "偷偷停个车游戏软件 V1.0"

EA_FONT = "宋体"
WEST_FONT = "Times New Roman"
CODE_FONT = "Consolas"


# ---------- markdown 解析 ----------

def parse(path):
    lines = io.open(path, encoding="utf-8").read().splitlines()
    blocks, i = [], 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue
        if line.startswith("```"):
            buf = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                buf.append(lines[i])
                i += 1
            i += 1
            blocks.append(("code", buf))
            continue
        m = re.match(r"^(#{1,3})\s+(.*)$", line)
        if m:
            blocks.append(("h%d" % len(m.group(1)), m.group(2).strip()))
            i += 1
            continue
        if line.startswith("|") and i + 1 < len(lines) and \
                set(lines[i + 1].replace("|", "").strip()) <= set("-: "):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not set("".join(cells)) <= set("-: "):
                    rows.append(cells)
                i += 1
            blocks.append(("table", rows))
            continue
        if re.match(r"^[-*]\s+", line):
            blocks.append(("li", re.sub(r"^[-*]\s+", "", line).strip()))
            i += 1
            continue
        if re.match(r"^\d+\.\s+", line):
            blocks.append(("li", line.strip()))
            i += 1
            continue
        if line.startswith(">"):
            blocks.append(("quote", line.lstrip("> ").strip()))
            i += 1
            continue
        if line.strip() in ("---", "***"):
            i += 1
            continue
        blocks.append(("p", line.strip()))
        i += 1
    return blocks


def clean(text):
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"`(.+?)`", r"\1", text)
    text = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", text)
    return text.strip()


# ---------- 排版工具 ----------

def setup_styles(doc):
    normal = doc.styles["Normal"]
    normal.font.name = WEST_FONT
    normal.font.size = Pt(10.5)
    normal.element.rPr.rFonts.set(qn("w:eastAsia"), EA_FONT)
    normal.paragraph_format.space_after = Pt(4)
    normal.paragraph_format.line_spacing = 1.3


def set_run_font(run, size, bold=False, west=WEST_FONT, ea=EA_FONT, color=None):
    run.font.name = west
    run.font.size = Pt(size)
    run.font.bold = bold
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    rfonts.set(qn("w:eastAsia"), ea)
    if color:
        run.font.color.rgb = color


def add_page_number(paragraph):
    run = paragraph.add_run()
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._element.append(fld_begin)
    run._element.append(instr)
    run._element.append(fld_end)
    set_run_font(run, 9)


def add_table(doc, rows, usable_width_cm):
    cols = max(len(r) for r in rows)
    table = doc.add_table(rows=len(rows), cols=cols)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # 按各列最长文字估算列宽，避免长单元格把表格挤成一列很窄
    weights = []
    for ci in range(cols):
        longest = max(len(rows[ri][ci]) if ci < len(rows[ri]) else 0 for ri in range(len(rows)))
        weights.append(max(longest, 6))
    total = float(sum(weights))
    widths = [usable_width_cm * w / total for w in weights]

    for ci, width in enumerate(widths):
        for row in table.rows:
            row.cells[ci].width = Cm(max(width, 1.6))

    for ri, row in enumerate(rows):
        for ci in range(cols):
            cell = table.cell(ri, ci)
            cell.text = ""
            para = cell.paragraphs[0]
            para.paragraph_format.space_after = Pt(2)
            para.paragraph_format.line_spacing = 1.15
            text = clean(row[ci]) if ci < len(row) else ""
            run = para.add_run(text)
            set_run_font(run, 9, bold=(ri == 0))
    doc.add_paragraph()
    return table


def main():
    blocks = parse(SRC)
    tables = sum(1 for k, _ in blocks if k == "table")
    print("解析块 %d 个，其中表格 %d 个" % (len(blocks), tables))

    doc = Document()
    setup_styles(doc)

    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.0)
    section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(2.0)
    section.right_margin = Cm(2.0)
    usable = 21 - 4

    # 页眉页码
    header_para = section.header.paragraphs[0]
    header_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_run_font(header_para.add_run(HEADER), 9)
    footer_para = section.footer.paragraphs[0]
    footer_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_page_number(footer_para)

    for kind, payload in blocks:
        if kind == "h1":
            para = doc.add_paragraph()
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            para.paragraph_format.space_before = Pt(12)
            para.paragraph_format.space_after = Pt(10)
            set_run_font(para.add_run(clean(payload)), 16, bold=True)
        elif kind in ("h2", "h3"):
            para = doc.add_paragraph()
            para.paragraph_format.space_before = Pt(10)
            para.paragraph_format.space_after = Pt(6)
            set_run_font(para.add_run(clean(payload)), 13 if kind == "h2" else 11.5, bold=True)
        elif kind == "p":
            para = doc.add_paragraph()
            para.paragraph_format.first_line_indent = Pt(21)
            set_run_font(para.add_run(clean(payload)), 10.5)
        elif kind == "li":
            para = doc.add_paragraph()
            para.paragraph_format.left_indent = Pt(14)
            para.paragraph_format.first_line_indent = Pt(0)
            set_run_font(para.add_run(clean(payload)), 10.5)
        elif kind == "quote":
            para = doc.add_paragraph()
            para.paragraph_format.left_indent = Pt(18)
            set_run_font(para.add_run(clean(payload)), 10, color=None)
        elif kind == "code":
            for line in payload:
                para = doc.add_paragraph()
                para.paragraph_format.space_after = Pt(0)
                para.paragraph_format.line_spacing = 1.0
                set_run_font(para.add_run(line), 9, west=CODE_FONT, ea=CODE_FONT)
        elif kind == "table":
            add_table(doc, payload, usable)

    docx_path = os.path.abspath(OUT_DOCX)
    pdf_path = os.path.abspath(OUT_PDF)
    doc.save(docx_path)

    # 用 Word 导出 PDF 并统计页数
    import win32com.client as win32
    word = win32.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    wdoc = word.Documents.Open(docx_path)
    wdoc.Repaginate()
    pages = wdoc.ComputeStatistics(2)
    chars = wdoc.ComputeStatistics(3)
    wdoc.ExportAsFixedFormat(pdf_path, 17)
    wdoc.Close(0)
    word.Quit()

    print("页数 %d，字符 %d" % (pages, chars))
    print("输出: %s" % OUT_DOCX)
    print("输出: %s" % OUT_PDF)
    return 0


if __name__ == "__main__":
    sys.exit(main())
