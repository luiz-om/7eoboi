export const TIPOS_PROVA = {
  PADRAO: "PADRAO",
  TIRA_BOI: "TIRA_BOI",
};

export const LABELS_TIPO_PROVA = {
  PADRAO: "Padrão (Ranch Sorting)",
  TIRA_BOI: "Tira Boi",
};

export const MODULOS_POR_TIPO = {
  PADRAO: ["provas", "cadastro", "resultados", "ranking", "certificados", "telao"],
  TIRA_BOI: ["provas", "cadastro", "ranking", "telao"],
};

export function normalizarTipoProva(tipo) {
  return tipo === TIPOS_PROVA.TIRA_BOI ? TIPOS_PROVA.TIRA_BOI : TIPOS_PROVA.PADRAO;
}

const TIPO_OBS_REGEX = /\[TIPO:(PADRAO|TIRA_BOI)\]/i;
const CORTE_OBS_REGEX = /\[CORTE:(\d+)\]/i;

function normalizarTextoTipo(texto = "") {
  return String(texto)
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_]/g, " ");
}

export function inferirTipoProva(provaApi) {
  const texto = normalizarTextoTipo(
    `${provaApi?.categoria || ""} ${provaApi?.observacoes || ""} ${provaApi?.nome || ""} ${provaApi?.evento || ""}`,
  );
  if (/\bTIRA\s*BOI\b/.test(texto) || texto.includes("TIRA BOI")) {
    return TIPOS_PROVA.TIRA_BOI;
  }
  return TIPOS_PROVA.PADRAO;
}

export function resolverTipoImportacao(provaApi, tipoFormulario) {
  const form = normalizarTipoProva(tipoFormulario);
  const detectado = inferirTipoProva(provaApi);
  if (form === TIPOS_PROVA.TIRA_BOI || detectado === TIPOS_PROVA.TIRA_BOI) {
    return TIPOS_PROVA.TIRA_BOI;
  }
  return TIPOS_PROVA.PADRAO;
}

export function extrairTipoDasObservacoes(observacoes = "") {
  const obs = String(observacoes);
  const tipoMatch = obs.match(TIPO_OBS_REGEX);
  const corteMatch = obs.match(CORTE_OBS_REGEX);
  const observacoesLimpa = obs
    .replace(TIPO_OBS_REGEX, "")
    .replace(CORTE_OBS_REGEX, "")
    .replace(/\s•\s•/g, " • ")
    .replace(/(?:^\s*•\s*|\s*•\s*$)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return {
    tipo: tipoMatch ? normalizarTipoProva(tipoMatch[1]) : null,
    duplasCorte: corteMatch ? Number(corteMatch[1]) : null,
    observacoes: observacoesLimpa,
  };
}

export function embutirTipoNasObservacoes(observacoes = "", tipo, duplasCorte) {
  const { observacoes: limpa } = extrairTipoDasObservacoes(observacoes);
  const markers = [`[TIPO:${normalizarTipoProva(tipo)}]`];
  if (duplasCorte != null && Number(duplasCorte) > 0) {
    markers.push(`[CORTE:${Number(duplasCorte)}]`);
  }
  return limpa ? `${limpa} • ${markers.join(" ")}` : markers.join(" ");
}

export function isTiraBoi(prova) {
  return normalizarTipoProva(prova?.tipo) === TIPOS_PROVA.TIRA_BOI;
}

export function getModulosVisiveis(tipo) {
  return MODULOS_POR_TIPO[normalizarTipoProva(tipo)] || MODULOS_POR_TIPO.PADRAO;
}

export function labelTipoProva(tipo) {
  return LABELS_TIPO_PROVA[normalizarTipoProva(tipo)] || LABELS_TIPO_PROVA.PADRAO;
}
