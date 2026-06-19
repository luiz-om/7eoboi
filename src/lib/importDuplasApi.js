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

export async function importDuplasFromPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  let response;
  try {
    response = await fetch(`${getImportApiBase()}/api/import-duplas`, {
      method: "POST",
      body: formData,
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
