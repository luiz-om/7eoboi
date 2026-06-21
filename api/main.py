from urllib.parse import unquote

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from api.import_service import ImportDuplasError, import_pdf_bytes

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
async def import_duplas(
    request: Request,
    file: UploadFile | None = File(None),
) -> dict:
    try:
        if file is not None and (file.filename or file.content_type):
            pdf_bytes = await file.read()
            return import_pdf_bytes(
                pdf_bytes,
                filename=file.filename or "",
                content_type=file.content_type or "",
            )

        content_type = request.headers.get("content-type", "")
        pdf_bytes = await request.body()
        filename = unquote(request.headers.get("x-filename", "upload.pdf"))
        return import_pdf_bytes(pdf_bytes, filename=filename, content_type=content_type)
    except ImportDuplasError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Não foi possível ler o PDF.") from exc
