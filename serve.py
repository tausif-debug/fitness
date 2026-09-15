#!/usr/bin/env python3
"""Dev server for FitCalc — static files with no-cache headers,
so the preview always picks up the latest code after a refresh."""
import functools
import http.server

PORT = 8080


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    handler = functools.partial(NoCacheHandler, directory=".")
    server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), handler)
    print(f"Serving on http://0.0.0.0:{PORT} (no-cache)")
    server.serve_forever()
