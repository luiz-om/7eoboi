function getImportApiBase() {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_IMPORT_API_URL) {
    return import.meta.env.VITE_IMPORT_API_URL;
  }
  return "";
}

function extrairMensagemErro(data, fallback) {
  if (!data) return fallback;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const primeira = data.detail[0];
    if (typeof primeira === "string") return primeira;
    if (primeira?.msg) return primeira.msg;
  }
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  return fallback;
}

export async function isPdfFile(file) {
  if (!file) return false;

  const nome = String(file.name || "").toLowerCase();
  const mime = String(file.type || "").toLowerCase();
  if (nome.endsWith(".pdf")) return true;
  if (mime === "application/pdf" || mime === "application/x-pdf") return true;

  try {
    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const signature = String.fromCharCode(...header);
    return signature.startsWith("%PDF");
  } catch {
    return false;
  }
}

export async function importDuplasFromPdf(file) {
  if (!(await isPdfFile(file))) {
    throw new Error("Formato de PDF não reconhecido.");
  }

  let response;
  try {
    response = await fetch(`${getImportApiBase()}/api/import-duplas`, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/pdf",
        "X-Filename": encodeURIComponent(file.name || "upload.pdf"),
      },
      body: file,
    });
  } catch {
    throw new Error("Não foi possível ler o PDF.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(extrairMensagemErro(data, "Não foi possível ler o PDF."));
  }

  return data;
}

export function mapearDuplasImportadas(duplasApi) {
  return (duplasApi || []).map((item) => ({
    cavaleiro1: item.competitor1Name,
    cavalo1: "-",
    cavaleiro2: item.competitor2Name,
    cavalo2: "-",
    passada: item.passada,
  }));
}
