from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from api.pdf_parser import parse_duplas_pdf

app = FastAPI(title="7eoboi Import API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/import-duplas")
async def import_duplas(file: UploadFile = File(...)) -> dict:
    filename = (file.filename or "").lower()
    content_type = (file.content_type or "").lower()

    if not filename.endswith(".pdf") and content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(status_code=400, detail="Formato de PDF não reconhecido.")

    try:
        pdf_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Não foi possível ler o PDF.") from exc

    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Não foi possível ler o PDF.")

    try:
        parsed = parse_duplas_pdf(pdf_bytes)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Não foi possível ler o PDF.") from exc

    duplas = parsed.get("duplas") or []
    if not duplas:
        raise HTTPException(status_code=400, detail="Nenhuma dupla encontrada no PDF.")

    return {
        "success": True,
        "total": len(duplas),
        "duplas": duplas,
        "warnings": parsed.get("warnings") or [],
    }
