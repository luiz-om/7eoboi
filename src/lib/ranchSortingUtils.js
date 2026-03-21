export function escaparCsv(valor) {
  return `"${String(valor).replace(/"/g, '""')}"`;
}

export function formatarData(valor) {
  if (!valor) return "Sem data";
  const data = new Date(`${valor}T12:00:00`);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleDateString("pt-BR");
}

export function gerarRanking(duplas = []) {
  return [...duplas]
    .filter((item) => item.status === "VALIDO")
    .sort((a, b) => (b.bois !== a.bois ? b.bois - a.bois : a.tempo - b.tempo));
}

export function gerarListaRankingCompleta(duplas = []) {
  const ranking = gerarRanking(duplas);
  const sat = duplas.filter((item) => item.status === "SAT");
  return [...ranking, ...sat];
}

export function duplaConcluida(dupla) {
  return dupla?.status === "VALIDO" || dupla?.status === "SAT";
}

export function duplaSat(dupla) {
  return dupla?.status === "SAT";
}

export function formatarBois(dupla) {
  return duplaSat(dupla) ? "SAT" : `${dupla.bois} 🐄`;
}

const PREMIACAO_CAVALOS = [
  { colocacao: 1, titulo: "Campeao", medalha: "🥇", pontos: 5, cor: "#F4C542" },
  { colocacao: 2, titulo: "Vice-campeao", medalha: "🥈", pontos: 3, cor: "#C0C0C0" },
  { colocacao: 3, titulo: "3º Lugar", medalha: "🥉", pontos: 1, cor: "#CD7F32" },
];

export const LIVE_CHANNEL_NAME = "ranch-sorting-live";

export function listarCavalosPremiados(prova) {
  if (!prova) return [];
  return gerarRanking(prova.duplas || [])
    .slice(0, 3)
    .flatMap((dupla, index) => {
      const premio = PREMIACAO_CAVALOS[index];
      if (!premio) return [];
      return [
        {
          id: `${dupla.id}-c1`,
          cavalo: dupla.cavalo1,
          cavaleiro: dupla.cavaleiro1,
          dupla,
          ...premio,
        },
        {
          id: `${dupla.id}-c2`,
          cavalo: dupla.cavalo2,
          cavaleiro: dupla.cavaleiro2,
          dupla,
          ...premio,
        },
      ];
    });
}

export function gerarRankingCavalos(
  provas = [],
  { provaId = null, apenasFinalizadas = false } = {},
) {
  const mapa = new Map();
  provas
    .filter((prova) => (provaId ? prova.id === provaId : true))
    .filter((prova) => (apenasFinalizadas ? prova.finalizada : true))
    .forEach((prova) => {
      listarCavalosPremiados(prova).forEach((item) => {
        const chave = item.cavalo.trim().toLowerCase();
        const atual = mapa.get(chave) || {
          cavalo: item.cavalo,
          pontos: 0,
          ouro: 0,
          prata: 0,
          bronze: 0,
          premiacoes: 0,
          provas: new Set(),
        };
        atual.pontos += item.pontos;
        atual.premiacoes += 1;
        atual.provas.add(prova.id);
        if (item.colocacao === 1) atual.ouro += 1;
        if (item.colocacao === 2) atual.prata += 1;
        if (item.colocacao === 3) atual.bronze += 1;
        mapa.set(chave, atual);
      });
    });

  return [...mapa.values()]
    .map((item) => ({ ...item, provas: item.provas.size }))
    .sort(
      (a, b) =>
        b.pontos - a.pontos ||
        b.ouro - a.ouro ||
        b.prata - a.prata ||
        b.bronze - a.bronze ||
        a.cavalo.localeCompare(b.cavalo, "pt-BR"),
    );
}
