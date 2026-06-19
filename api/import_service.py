from __future__ import annotations

try:
    from api.pdf_parser import parse_duplas_pdf
except ImportError:
    from pdf_parser import parse_duplas_pdf


class ImportDuplasError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def is_pdf_upload(filename: str, content_type: str) -> bool:
    name = (filename or "").lower()
    mime = (content_type or "").lower()
    return name.endswith(".pdf") or mime in {"application/pdf", "application/x-pdf", "binary/octet-stream"}


def import_pdf_bytes(pdf_bytes: bytes, filename: str = "", content_type: str = "") -> dict:
    if not is_pdf_upload(filename, content_type):
        raise ImportDuplasError("Formato de PDF não reconhecido.")

    if not pdf_bytes:
        raise ImportDuplasError("Não foi possível ler o PDF.")

    try:
        parsed = parse_duplas_pdf(pdf_bytes)
    except Exception as exc:
        raise ImportDuplasError("Não foi possível ler o PDF.") from exc

    duplas = parsed.get("duplas") or []
    if not duplas:
        raise ImportDuplasError("Nenhuma dupla encontrada no PDF.")

    return {
        "success": True,
        "total": len(duplas),
        "duplas": duplas,
        "warnings": parsed.get("warnings") or [],
    }
