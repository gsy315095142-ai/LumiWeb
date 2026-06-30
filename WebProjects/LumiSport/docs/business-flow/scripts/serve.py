#!/usr/bin/env python3
"""Static file server for LAN access."""

from __future__ import annotations

import http.server
import os
import socket
import sys
import threading
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = 8080


def get_lan_ip() -> str | None:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            return sock.getsockname()[0]
    except OSError:
        return None


def list_html_pages() -> list[str]:
    return sorted(
        p.name for p in ROOT.glob("*.html") if p.name != "index.html"
    )


def print_banner(lan_ip: str | None) -> None:
    pages = list_html_pages()
    print()
    print("=" * 56)
    print("  LumiSport - LAN preview server")
    print("=" * 56)
    print()
    print(f"  Local:   http://127.0.0.1:{PORT}/")
    if lan_ip:
        print(f"  LAN:     http://{lan_ip}:{PORT}/")
    else:
        print("  LAN:     (run ipconfig to find your IPv4 address)")
    print()
    if pages:
        print("  Pages:")
        for name in pages:
            print(f"    - http://127.0.0.1:{PORT}/{name}")
            if lan_ip:
                print(f"      http://{lan_ip}:{PORT}/{name}")
    print()
    print("  Use the LAN URL on other devices in the same network.")
    print("  Allow Windows Firewall if prompted. Press Ctrl+C to stop.")
    print("=" * 56)
    print()


def open_browser_later(url: str) -> None:
    def _open() -> None:
        webbrowser.open(url)

    threading.Timer(0.8, _open).start()


def main() -> int:
    os.chdir(ROOT)

    lan_ip = get_lan_ip()
    print_banner(lan_ip)
    open_browser_later(f"http://127.0.0.1:{PORT}/")

    handler = http.server.SimpleHTTPRequestHandler
    try:
        with http.server.ThreadingHTTPServer(("0.0.0.0", PORT), handler) as httpd:
            httpd.serve_forever()
    except OSError as exc:
        if getattr(exc, "winerror", None) == 10048 or exc.errno in (98, 48):
            print(f"ERROR: Port {PORT} is already in use.", file=sys.stderr)
        else:
            print(f"ERROR: Cannot start server — {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\nServer stopped.")
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
