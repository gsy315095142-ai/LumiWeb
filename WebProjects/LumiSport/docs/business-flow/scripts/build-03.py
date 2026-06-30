#!/usr/bin/env python3
"""Rebuild 03 HTML from partials."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTIALS = ROOT / "partials" / "03"
OUTPUT = ROOT / "03-用户兑换奖品流程.html"

PARTS = ("head", "flow-steps", "role-matrix", "foot")


def main() -> None:
    content = "".join((PARTIALS / f"{name}.html").read_text(encoding="utf-8") for name in PARTS)
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Rebuilt {OUTPUT.name}")


if __name__ == "__main__":
    main()
