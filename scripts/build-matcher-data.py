import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UNI_PATH = ROOT / "data" / "universities.json"
MAJORS_DIR = ROOT / "data" / "majors"
OUT_PATH = ROOT / "data" / "matcher-data.json"

SKIP_NOTE = ("chất lượng cao", "lien ket", "liên kết", "cơ sở khác", "co so khac")


def skip_note(note):
    text = (note or "").lower()
    return any(s in text for s in SKIP_NOTE)


def main():
    uni_file = json.loads(UNI_PATH.read_text(encoding="utf-8"))
    unis = {u["code"]: u for u in uni_file["universities"]}
    rows = []
    school_codes = set()

    for path in sorted(MAJORS_DIR.glob("*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        code = payload["code"]
        uni = unis.get(code)
        if not uni:
            continue
        for major in payload.get("majors", []):
            if major.get("scale") != 30 or major.get("method") != "thpt":
                continue
            if skip_note(major.get("note")):
                continue
            for combo in major.get("combos", []):
                scores = combo.get("scores") or {}
                if not scores:
                    continue
                school_codes.add(code)
                rows.append({
                    "schoolCode": code,
                    "schoolName": uni["name"],
                    "city": uni["city"],
                    "majorCode": major["majorCode"],
                    "majorName": major["name"],
                    "group": major.get("group") or "",
                    "combo": combo["combo"],
                    "scores": scores,
                    "source": payload.get("source", "")
                })

    out = {
        "source": "generated-from-majors",
        "schoolCount": len(school_codes),
        "rows": rows
    }
    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(rows)} rows from {len(school_codes)} schools -> {OUT_PATH}")


if __name__ == "__main__":
    main()
