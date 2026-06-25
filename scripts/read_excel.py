"""Dump every sheet of 球员信息统计.xlsx as JSON so we can compare with the DB."""
import io
import json
import sys
from pathlib import Path

import openpyxl

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", newline="")

XLSX = Path(__file__).resolve().parent.parent / "球员信息统计.xlsx"

wb = openpyxl.load_workbook(XLSX, data_only=True)
out = {}
for ws in wb.worksheets:
    rows = []
    for row in ws.iter_rows(values_only=True):
        rows.append(list(row))
    out[ws.title] = rows

json.dump(out, sys.stdout, ensure_ascii=False, indent=2, default=str)
