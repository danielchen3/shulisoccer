"""Compare 球员信息统计.xlsx against the players already in D1, then emit
   migrations/0002_update_from_excel.sql + a human-readable analysis report.

Rules (per user decision 2026-05-26):
  - Excel is authoritative: number / position / province / starts / subs / goals
    on EXISTING players get overwritten with Excel values.
  - 10 brand-new players in Excel get INSERTed; filename via pypinyin first
    letters, enName via full pinyin. Conflicts get a numeric suffix.
  - Players in DB but missing from Excel are left untouched.
  - Players matched by name first; if a row's name is absent from DB but its
    (number, birthday) matches an existing DB row, treat as renamed and update
    in-place (keeping the original filename so existing images keep working).
"""
import io
import re
import sys
from pathlib import Path

import openpyxl
from pypinyin import Style, lazy_pinyin

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", newline="")

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "球员信息统计.xlsx"
EXISTING_SQL = ROOT / "database_already_inserted_data.sql"
MIGRATION_OUT = ROOT / "migrations" / "0002_update_from_excel.sql"
REPORT_OUT = ROOT / "scripts" / "migration_report.txt"


# ---------- parse existing players from database_already_inserted_data.sql ----------

# columns order in the INSERT statement
EXISTING_COLS = [
    "positionGroup", "position", "number", "filename", "name", "enName",
    "club", "nationality", "nationalityFlag", "province", "age", "birthday",
    "height", "weight", "foot", "starts", "subs", "goals",
]

def parse_existing_players() -> list[dict]:
    text = EXISTING_SQL.read_text(encoding="utf-8")
    m = re.search(r"INSERT INTO players[^;]*VALUES\s*(.*?);", text, re.DOTALL)
    assert m, "could not find players INSERT block"
    body = m.group(1)
    # iterate character by character, tracking quote state, to split into tuples
    rows = []
    depth = 0
    in_quote = False
    buf = []
    for ch in body:
        if ch == "'" and (not buf or buf[-1] != "\\"):
            in_quote = not in_quote
            buf.append(ch)
        elif ch == "(" and not in_quote:
            depth += 1
            if depth == 1:
                buf = []
                continue
            buf.append(ch)
        elif ch == ")" and not in_quote:
            depth -= 1
            if depth == 0:
                raw = "".join(buf)
                vals = re.findall(r"'(?:[^']|'')*'|NULL|-?\d+", raw)
                assert len(vals) == len(EXISTING_COLS), f"col mismatch: {len(vals)} vs {len(EXISTING_COLS)} -- {raw}"
                rec = {}
                for col, v in zip(EXISTING_COLS, vals):
                    if v == "NULL":
                        rec[col] = None
                    elif v.startswith("'"):
                        rec[col] = v[1:-1].replace("''", "'")
                    else:
                        rec[col] = int(v)
                rows.append(rec)
            else:
                buf.append(ch)
        else:
            if depth >= 1:
                buf.append(ch)
    return rows


# ---------- parse Excel ----------

EXCEL_HEADER = [
    "name", "number", "position", "hometown", "age", "birthday",
    "height", "weight", "totalStarts", "totalSubs", "totalGoals",
]

def parse_excel() -> list[dict]:
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb.active
    rows = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            continue
        if row[0] is None:
            continue
        rec = dict(zip(EXCEL_HEADER, row))
        rec["birthday"] = normalise_birthday(rec["birthday"])
        rows.append(rec)
    return rows


def normalise_birthday(s: str | None) -> str | None:
    """Excel uses '2004.10.22', '2006.5.24', '2007 3 1', '2005.06.16' ... -> ISO."""
    if not s:
        return None
    s = str(s).strip()
    parts = re.split(r"[.\s/-]+", s)
    if len(parts) != 3:
        return s
    y, m, d = parts
    return f"{int(y):04d}-{int(m):02d}-{int(d):02d}"


# ---------- position → positionGroup ----------

POSITION_GROUP = {
    "守门员": "goalkeeper", "门将": "goalkeeper",
    "中后卫": "defender", "左后卫": "defender", "右后卫": "defender", "边后卫": "defender",
    "后腰": "midfield", "中场": "midfield", "前腰": "midfield", "中前卫": "midfield",
    "中锋": "forward", "左边锋": "forward", "右边锋": "forward", "边锋": "forward", "前锋": "forward",
}

def to_group(pos: str) -> str:
    # try exact, then any contained keyword
    if pos in POSITION_GROUP:
        return POSITION_GROUP[pos]
    for k, v in POSITION_GROUP.items():
        if k in pos:
            return v
    raise ValueError(f"unknown position: {pos}")


# ---------- pypinyin helpers ----------

def gen_filename(name: str, taken: set[str]) -> str:
    base = "".join(lazy_pinyin(name, style=Style.FIRST_LETTER))
    if base not in taken:
        taken.add(base)
        return base
    i = 2
    while f"{base}{i}" in taken:
        i += 1
    taken.add(f"{base}{i}")
    return f"{base}{i}"

def gen_enname(name: str) -> str:
    parts = lazy_pinyin(name)
    if not parts:
        return ""
    # Chinese name convention: surname (1 char) + given name (1-2 chars joined)
    # Heuristic: first pinyin = surname; rest joined as one given-name word.
    surname = parts[0].capitalize()
    given = "".join(p.capitalize() if i == 0 else p for i, p in enumerate(parts[1:]))
    return f"{surname} {given}" if given else surname


# ---------- SQL emitter ----------

def sql_str(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


# ---------- main ----------

# Manual rename overrides: existing filename → new filename (for DB rows whose
# real-world identity changed and whose image file should be renamed too).
RENAME_FILENAMES = {
    "zjz2": "zxa",  # 周俊哲 → 周玹安
}


def main():
    existing = parse_existing_players()
    excel = parse_excel()

    by_name = {p["name"].replace("(C)", "").strip(): p for p in existing}
    # also build (number, birthday) index for rename detection
    by_nb = {(p["number"], p["birthday"]): p for p in existing}

    taken_filenames = {p["filename"] for p in existing}

    updates = []   # (existing_record, excel_record, reason)
    inserts = []   # excel_record (no DB match)

    for ex in excel:
        name_clean = ex["name"].strip()
        if name_clean in by_name:
            updates.append((by_name[name_clean], ex, "name_match"))
            continue
        key = (ex["number"], ex["birthday"])
        if key in by_nb:
            updates.append((by_nb[key], ex, "renamed (same number+birthday)"))
            continue
        inserts.append(ex)

    # ---------- report ----------
    rep = []
    rep.append("=" * 70)
    rep.append("MIGRATION REPORT  (generated by scripts/generate_migration.py)")
    rep.append("=" * 70)
    rep.append(f"\nExisting players in DB: {len(existing)}")
    rep.append(f"Players in Excel:       {len(excel)}")
    rep.append(f"  → UPDATE:             {len(updates)}")
    rep.append(f"  → INSERT (new):       {len(inserts)}")

    db_names = {p["name"].replace("(C)", "").strip() for p in existing}
    excel_names = {p["name"].strip() for p in excel}
    excel_match_names = {p["name"].strip() for _, p, _ in updates}
    # players in DB but absent from Excel (renamed updates already removed via by_nb)
    rename_targets = {u[0]["name"] for u in updates}
    untouched = [p for p in existing if p["name"] not in rename_targets and p["name"].replace("(C)", "").strip() not in excel_names]
    rep.append(f"  DB rows untouched:    {len(untouched)}  (in DB, not in Excel)")

    rep.append("\n----- UPDATES -----")
    for old, ex, reason in updates:
        diffs = []
        for excel_field, db_field in [
            ("number", "number"), ("position", "position"),
            ("hometown", "province"), ("age", "age"),
            ("birthday", "birthday"), ("height", "height"),
            ("weight", "weight"), ("totalStarts", "starts"),
            ("totalSubs", "subs"), ("totalGoals", "goals"),
        ]:
            ov = old.get(db_field)
            nv = ex.get(excel_field)
            if str(ov) != str(nv) and not (ov is None and nv is None):
                diffs.append(f"{db_field}: {ov!r} → {nv!r}")
        rep.append(f"  {old['filename']:<6} {old['name']:<10}  [{reason}]")
        if diffs:
            for d in diffs:
                rep.append(f"      {d}")
        else:
            rep.append("      (no field changes)")

    rep.append("\n----- INSERTS -----")
    new_records = []
    for ex in inserts:
        fn = gen_filename(ex["name"], taken_filenames)
        en = gen_enname(ex["name"])
        new_records.append((fn, en, ex))
        rep.append(f"  {fn:<6} {ex['name']:<10}  enName={en}  #{ex['number']} {ex['position']} {ex['hometown']}")

    rep.append("\n----- UNTOUCHED (DB has, Excel doesn't) -----")
    for p in untouched:
        rep.append(f"  {p['filename']:<6} {p['name']:<10}  #{p['number']} {p['position']}")

    REPORT_OUT.write_text("\n".join(rep) + "\n", encoding="utf-8")

    # ---------- SQL ----------
    out = []
    out.append("-- ============================================================")
    out.append("-- 0002_update_from_excel.sql")
    out.append("-- Source: 球员信息统计.xlsx (2026-05-26)")
    out.append("-- Generated by scripts/generate_migration.py — DO NOT hand-edit.")
    out.append("-- See scripts/migration_report.txt for the full diff.")
    out.append("-- ============================================================")
    out.append("")

    out.append("-- ---------- UPDATE existing players ----------")
    for old, ex, _ in updates:
        sets = [
            f"number = {sql_str(ex['number'])}",
            f"position = {sql_str(ex['position'])}",
            f"positionGroup = {sql_str(to_group(ex['position']))}",
            f"province = {sql_str(ex['hometown'])}",
            f"age = {sql_str(ex['age'])}",
            f"birthday = {sql_str(ex['birthday'])}",
            f"height = {sql_str(ex['height'])}",
            f"weight = {sql_str(ex['weight'])}",
            f"starts = {sql_str(ex['totalStarts'])}",
            f"subs = {sql_str(ex['totalSubs'])}",
            f"goals = {sql_str(ex['totalGoals'])}",
            # also overwrite the name in case it changed (rename case)
            f"name = {sql_str(ex['name'])}" if ex["name"].strip() != old["name"].replace("(C)", "").strip() else None,
            # rename filename if user told us to (manual override)
            f"filename = {sql_str(RENAME_FILENAMES[old['filename']])}" if old["filename"] in RENAME_FILENAMES else None,
        ]
        sets = [s for s in sets if s]
        out.append(
            f"UPDATE players SET {', '.join(sets)} WHERE filename = {sql_str(old['filename'])};"
        )
    out.append("")

    out.append("-- ---------- INSERT new players ----------")
    out.append("INSERT INTO players (positionGroup, position, number, filename, name, enName, club, nationality, nationalityFlag, province, age, birthday, height, weight, foot, starts, subs, goals) VALUES")
    insert_lines = []
    for fn, en, ex in new_records:
        insert_lines.append(
            "  ("
            + ", ".join([
                sql_str(to_group(ex["position"])),
                sql_str(ex["position"]),
                sql_str(ex["number"]),
                sql_str(fn),
                sql_str(ex["name"]),
                sql_str(en),
                sql_str("树礼书院"),
                sql_str("中国"),
                sql_str("🇨🇳"),
                sql_str(ex["hometown"]),
                sql_str(ex["age"]),
                sql_str(ex["birthday"]),
                sql_str(ex["height"]),
                sql_str(ex["weight"]),
                "NULL",  # foot unknown
                sql_str(ex["totalStarts"]),
                sql_str(ex["totalSubs"]),
                sql_str(ex["totalGoals"]),
            ])
            + ")"
        )
    out.append(",\n".join(insert_lines) + ";")
    out.append("")

    out.append("-- ---------- Manual fixes: keep topScorers in sync with renames ----------")
    out.append("UPDATE topScorers SET name = '周玹安' WHERE name = '周俊哲';")
    out.append("")

    MIGRATION_OUT.write_text("\n".join(out), encoding="utf-8")

    print(f"Wrote {MIGRATION_OUT}")
    print(f"Wrote {REPORT_OUT}")
    print("\n--- Summary ---")
    print(f"Updates: {len(updates)}")
    print(f"Inserts: {len(inserts)}")
    print(f"Untouched in DB: {len(untouched)}")


if __name__ == "__main__":
    main()
