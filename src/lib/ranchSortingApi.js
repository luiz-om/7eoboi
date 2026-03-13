import { supabase } from "./supabase";

const PROVAS_COLUMNS = "id, nome, local, data, observacoes, finalizada, finalizada_em, criada_em, updated_at, owner_id";
const DUPLAS_COLUMNS = "id, prova_id, ordem, cavaleiro1, cavalo1, cavaleiro2, cavalo2, bois, tempo, criada_em, updated_at";

function normalizarBois(valor) {
  if (valor === null || valor === undefined) return null;
  if (valor === "SAT") return "SAT";
  const numero = Number(valor);
  return Number.isNaN(numero) ? null : numero;
}

function mapearBoisParaBanco(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  if (valor === "SAT") return "SAT";
  return String(valor);
}

function normalizarDupla(row) {
  return {
    id: row.id,
    provaId: row.prova_id,
    ordem: row.ordem,
    cavaleiro1: row.cavaleiro1,
    cavalo1: row.cavalo1,
    cavaleiro2: row.cavaleiro2,
    cavalo2: row.cavalo2,
    bois: normalizarBois(row.bois),
    tempo: row.tempo === null ? null : Number(row.tempo),
    criadaEm: row.criada_em,
    updatedAt: row.updated_at,
  };
}

function normalizarProva(row, duplas = []) {
  return {
    id: row.id,
    nome: row.nome,
    local: row.local ?? "",
    data: row.data,
    observacoes: row.observacoes ?? "",
    criadaEm: row.criada_em,
    updatedAt: row.updated_at,
    finalizada: Boolean(row.finalizada),
    finalizadaEm: row.finalizada_em,
    ownerId: row.owner_id,
    duplas: [...duplas].sort((a, b) => a.ordem - b.ordem),
  };
}

function tratarErro(error, fallback) {
  if (!error) return new Error(fallback);
  return new Error(error.message || fallback);
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw tratarErro(error, "Nao foi possivel verificar a sessao.");
  return session;
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw tratarErro(error, "Nao foi possivel entrar com email e senha.");
  return data.session;
}

export async function signUpWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  if (error) throw tratarErro(error, "Nao foi possivel criar a conta.");
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw tratarErro(error, "Nao foi possivel encerrar a sessao.");
}

export async function listProvasComDuplas() {
  const [{ data: provasRows, error: provasError }, { data: duplasRows, error: duplasError }] = await Promise.all([
    supabase.from("provas").select(PROVAS_COLUMNS).order("data", { ascending: false }).order("criada_em", { ascending: false }),
    supabase.from("duplas").select(DUPLAS_COLUMNS).order("ordem", { ascending: true }),
  ]);

  if (provasError) throw tratarErro(provasError, "Nao foi possivel carregar as provas.");
  if (duplasError) throw tratarErro(duplasError, "Nao foi possivel carregar as duplas.");

  const duplasPorProva = new Map();
  (duplasRows || []).forEach((row) => {
    const item = normalizarDupla(row);
    const lista = duplasPorProva.get(item.provaId) || [];
    lista.push(item);
    duplasPorProva.set(item.provaId, lista);
  });

  return (provasRows || []).map((row) => normalizarProva(row, duplasPorProva.get(row.id) || []));
}

export async function createProva(payload) {
  const { data, error } = await supabase
    .from("provas")
    .insert({
      nome: payload.nome,
      local: payload.local,
      data: payload.data,
      observacoes: payload.observacoes,
    })
    .select(PROVAS_COLUMNS)
    .single();

  if (error) throw tratarErro(error, "Nao foi possivel criar a prova.");
  return normalizarProva(data, []);
}

export async function updateProva(id, payload) {
  const { data, error } = await supabase
    .from("provas")
    .update({
      nome: payload.nome,
      local: payload.local,
      data: payload.data,
      observacoes: payload.observacoes,
      finalizada: payload.finalizada,
      finalizada_em: payload.finalizadaEm,
    })
    .eq("id", id)
    .select(PROVAS_COLUMNS)
    .single();

  if (error) throw tratarErro(error, "Nao foi possivel atualizar a prova.");
  return normalizarProva(data, []);
}

export async function deleteProva(id) {
  const { error } = await supabase.from("provas").delete().eq("id", id);
  if (error) throw tratarErro(error, "Nao foi possivel remover a prova.");
}

export async function createDupla(payload) {
  const { data, error } = await supabase
    .from("duplas")
    .insert({
      prova_id: payload.provaId,
      ordem: payload.ordem,
      cavaleiro1: payload.cavaleiro1,
      cavalo1: payload.cavalo1,
      cavaleiro2: payload.cavaleiro2,
      cavalo2: payload.cavalo2,
      bois: mapearBoisParaBanco(payload.bois),
      tempo: payload.tempo,
    })
    .select(DUPLAS_COLUMNS)
    .single();

  if (error) throw tratarErro(error, "Nao foi possivel cadastrar a dupla.");
  return normalizarDupla(data);
}

export async function updateDupla(id, payload) {
  const { data, error } = await supabase
    .from("duplas")
    .update({
      cavaleiro1: payload.cavaleiro1,
      cavalo1: payload.cavalo1,
      cavaleiro2: payload.cavaleiro2,
      cavalo2: payload.cavalo2,
      bois: mapearBoisParaBanco(payload.bois),
      tempo: payload.tempo,
    })
    .eq("id", id)
    .select(DUPLAS_COLUMNS)
    .single();

  if (error) throw tratarErro(error, "Nao foi possivel atualizar a dupla.");
  return normalizarDupla(data);
}

export async function deleteDupla(id) {
  const { error } = await supabase.from("duplas").delete().eq("id", id);
  if (error) throw tratarErro(error, "Nao foi possivel remover a dupla.");
}

export async function updateResultadoDupla(id, payload) {
  const { data, error } = await supabase
    .from("duplas")
    .update({
      bois: mapearBoisParaBanco(payload.bois),
      tempo: payload.tempo,
    })
    .eq("id", id)
    .select(DUPLAS_COLUMNS)
    .single();

  if (error) throw tratarErro(error, "Nao foi possivel salvar o resultado.");
  return normalizarDupla(data);
}
