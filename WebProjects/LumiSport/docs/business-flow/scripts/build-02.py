#!/usr/bin/env python3
"""Rebuild 02 HTML from partials."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTIALS = ROOT / "partials" / "02"
OUTPUT = ROOT / "02-选手报名与观众竞猜流程.html"

PARTS = ("head", "flow-steps", "role-matrix", "foot")


def main() -> None:
    content = "".join((PARTIALS / f"{name}.html").read_text(encoding="utf-8") for name in PARTS)
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Rebuilt {OUTPUT.name}")


if __name__ == "__main__":
    main()
