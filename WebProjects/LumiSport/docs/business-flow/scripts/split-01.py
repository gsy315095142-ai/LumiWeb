#!/usr/bin/env python3
"""Split 01 HTML into partials and rebuild the page."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
HTML_FILE = ROOT / "01-客户筹码兑换流程.html"
PARTIALS = ROOT / "partials" / "01"


def split_html(html: str) -> dict[str, str]:
    flow_start = html.index('    <div class="flow-pages">')
    flow_end = html.index("\n\n  <!-- 角色矩阵 -->")
    matrix_start = html.index("  <!-- 角色矩阵 -->")
    matrix_end = html.index("  </div>\n\n</div>\n\n</body>")

    return {
        "head": html[:flow_start],
        "flow-steps": html[flow_start:flow_end] + "\n",
        "role-matrix": html[matrix_start:matrix_end] + "\n",
        "foot": html[matrix_end:],
    }


def replace_svg_with_img(html: str) -> str:
    return re.sub(
        r'<svg class="qr-grid"[^>]*>.*?</svg>',
        '<img src="assets/qr-placeholder.svg" class="qr-grid" alt="" aria-hidden="true">',
        html,
        count=1,
        flags=re.S,
    )


def replace_inline_styles(html: str) -> str:
    html = html.replace(
        '<span class="scene-label" style="left:50%;transform:translateX(-50%);">',
        '<span class="scene-label scene-label--center">',
    )
    html = html.replace(
        '<div style="margin-top:6px;font-size:14px;">▣</div>',
        '<div class="mini-qr-icon">▣</div>',
    )
    return html


def main() -> None:
    html = HTML_FILE.read_text(encoding="utf-8")

    PARTIALS.mkdir(parents=True, exist_ok=True)

    html = replace_svg_with_img(html)
    html = replace_inline_styles(html)
    parts = split_html(html)

    for name, content in parts.items():
        (PARTIALS / f"{name}.html").write_text(content, encoding="utf-8")

    rebuilt = parts["head"] + parts["flow-steps"] + parts["role-matrix"] + parts["foot"]
    HTML_FILE.write_text(rebuilt, encoding="utf-8")

    for name in parts:
        print(f"Wrote {PARTIALS / f'{name}.html'}")
    print(f"Rebuilt {HTML_FILE.name}")


if __name__ == "__main__":
    main()
