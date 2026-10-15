"""Serve the static export locally at the real GitHub Pages base path."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse, os

ROOT = Path(__file__).resolve().parents[1] / "out"
BASE = os.environ.get("NEXT_PUBLIC_BASE_PATH", "/WiederCARE-Berlin")

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def translate_path(self, path):
        if path == BASE or path.startswith(BASE + "/"):
            path = path[len(BASE):] or "/"
        return super().translate_path(path)
    def log_message(self, format, *_args):
        pass

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    print(f"Serving {ROOT} at http://127.0.0.1:{args.port}{BASE}/", flush=True)
    ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()
