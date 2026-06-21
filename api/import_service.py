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


PDF_MIME_TYPES = {
    "application/pdf",
    "application/x-pdf",
    "application/octet-stream",
    "binary/octet-stream",
}


def is_pdf_bytes(data: bytes) -> bool:
    if not data:
        return False
    return data.lstrip()[:4] == b"%PDF"


def is_pdf_upload(filename: str, content_type: str, pdf_bytes: bytes | None = None) -> bool:
    if pdf_bytes is not None and is_pdf_bytes(pdf_bytes):
        return True

    name = (filename or "").lower()
    mime = (content_type or "").lower().split(";")[0].strip()

    if name.endswith(".pdf"):
        return True
    if mime in PDF_MIME_TYPES:
        return True
    return False


def import_pdf_bytes(pdf_bytes: bytes, filename: str = "", content_type: str = "") -> dict:
    if not pdf_bytes:
        raise ImportDuplasError("Não foi possível ler o PDF.")

    if not is_pdf_upload(filename, content_type, pdf_bytes):
        raise ImportDuplasError("Formato de PDF não reconhecido.")

    try:
        parsed = parse_duplas_pdf(pdf_bytes)
    except Exception as exc:
        raise ImportDuplasError("Não foi possível ler o PDF.") from exc

    duplas = parsed.get("duplas") or []
    prova = parsed.get("prova") or {}
    warnings = list(parsed.get("warnings") or [])

    if not prova.get("nome"):
        raise ImportDuplasError("Cabeçalho da prova não encontrado no PDF.")

    if not duplas:
        raise ImportDuplasError("Nenhuma dupla encontrada no PDF.")

    return {
        "success": True,
        "total": len(duplas),
        "prova": prova,
        "duplas": duplas,
        "warnings": warnings,
    }
