"""Serverless function da Vercel: POST /api/import-duplas"""

from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler

try:
    from api.import_service import ImportDuplasError, import_pdf_bytes
except ImportError:
    from import_service import ImportDuplasError, import_pdf_bytes


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self) -> None:
        self._send_json(200, {"ok": True})

    def do_POST(self) -> None:
        try:
            content_type = self.headers.get("Content-Type", "")
            filename = self.headers.get("X-Filename", "upload.pdf")
            content_length = int(self.headers.get("Content-Length", "0") or 0)
            pdf_bytes = self.rfile.read(content_length) if content_length > 0 else b""

            result = import_pdf_bytes(pdf_bytes, filename=filename, content_type=content_type)
            self._send_json(200, result)
        except ImportDuplasError as exc:
            self._send_json(exc.status_code, {"detail": exc.message})
        except Exception:
            self._send_json(400, {"detail": "Não foi possível ler o PDF."})

    def do_GET(self) -> None:
        self._send_json(405, {"detail": "Use POST para importar o PDF."})

    def log_message(self, format: str, *args) -> None:
        return

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Filename")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
