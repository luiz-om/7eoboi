import test from "node:test";
import assert from "node:assert/strict";

import {
  duplaConcluida,
  duplaSat,
  formatarBois,
  gerarListaRankingCompleta,
  gerarRanking,
  gerarRankingCavalos,
  listarCavalosPremiados,
} from "./ranchSortingUtils.js";

function criarDupla(overrides = {}) {
  return {
    id: "dupla-1",
    cavaleiro1: "Ana",
    cavalo1: "Raio",
    cavaleiro2: "Beto",
    cavalo2: "Trovao",
    status: "PENDENTE",
    bois: null,
    tempo: null,
    ...overrides,
  };
}

function criarProva(overrides = {}) {
  return {
    id: "prova-1",
    finalizada: false,
    duplas: [],
    ...overrides,
  };
}

test("gerarRanking ordena por mais bois e menor tempo, ignorando SAT e pendentes", () => {
  const ranking = gerarRanking([
    criarDupla({ id: "a", status: "VALIDO", bois: 8, tempo: 50.4 }),
    criarDupla({ id: "b", status: "SAT", bois: null, tempo: 40.1 }),
    criarDupla({ id: "c", status: "VALIDO", bois: 9, tempo: 60.2 }),
    criarDupla({ id: "d", status: "PENDENTE", bois: null, tempo: null }),
    criarDupla({ id: "e", status: "VALIDO", bois: 9, tempo: 52.3 }),
  ]);

  assert.deepEqual(
    ranking.map((item) => item.id),
    ["e", "c", "a"],
  );
});

test("gerarListaRankingCompleta adiciona as duplas SAT depois do ranking valido", () => {
  const lista = gerarListaRankingCompleta([
    criarDupla({ id: "a", status: "VALIDO", bois: 10, tempo: 44.8 }),
    criarDupla({ id: "b", status: "SAT", bois: null, tempo: 39.1 }),
    criarDupla({ id: "c", status: "VALIDO", bois: 8, tempo: 41.2 }),
  ]);

  assert.deepEqual(
    lista.map((item) => item.id),
    ["a", "c", "b"],
  );
});

test("duplaConcluida, duplaSat e formatarBois respeitam o novo modelo status + bois", () => {
  const pendente = criarDupla();
  const sat = criarDupla({ status: "SAT", tempo: 37.5 });
  const valida = criarDupla({ status: "VALIDO", bois: 7, tempo: 38.9 });

  assert.equal(duplaConcluida(pendente), false);
  assert.equal(duplaConcluida(sat), true);
  assert.equal(duplaConcluida(valida), true);
  assert.equal(duplaSat(pendente), false);
  assert.equal(duplaSat(sat), true);
  assert.equal(formatarBois(sat), "SAT");
  assert.equal(formatarBois(valida), "7 🐄");
});

test("listarCavalosPremiados retorna os dois cavalos das tres melhores duplas", () => {
  const premiados = listarCavalosPremiados(
    criarProva({
      duplas: [
        criarDupla({ id: "a", cavalo1: "Raio", cavalo2: "Trovão", status: "VALIDO", bois: 10, tempo: 40 }),
        criarDupla({ id: "b", cavalo1: "Flecha", cavalo2: "Brisa", status: "VALIDO", bois: 9, tempo: 42 }),
        criarDupla({ id: "c", cavalo1: "Cometa", cavalo2: "Luar", status: "VALIDO", bois: 8, tempo: 44 }),
        criarDupla({ id: "d", cavalo1: "Extra", cavalo2: "Reserva", status: "VALIDO", bois: 7, tempo: 46 }),
      ],
    }),
  );

  assert.equal(premiados.length, 6);
  assert.deepEqual(
    premiados.map((item) => item.cavalo),
    ["Raio", "Trovão", "Flecha", "Brisa", "Cometa", "Luar"],
  );
  assert.deepEqual(
    premiados.map((item) => item.colocacao),
    [1, 1, 2, 2, 3, 3],
  );
});

test("gerarRankingCavalos agrega pontos e pode filtrar apenas provas finalizadas", () => {
  const provas = [
    criarProva({
      id: "p1",
      finalizada: true,
      duplas: [
        criarDupla({ id: "a", cavalo1: "Raio", cavalo2: "Trovão", status: "VALIDO", bois: 10, tempo: 40 }),
        criarDupla({ id: "b", cavalo1: "Flecha", cavalo2: "Brisa", status: "VALIDO", bois: 9, tempo: 42 }),
        criarDupla({ id: "c", cavalo1: "Cometa", cavalo2: "Luar", status: "VALIDO", bois: 8, tempo: 44 }),
      ],
    }),
    criarProva({
      id: "p2",
      finalizada: false,
      duplas: [
        criarDupla({ id: "d", cavalo1: "Raio", cavalo2: "Nuvem", status: "VALIDO", bois: 10, tempo: 39 }),
        criarDupla({ id: "e", cavalo1: "Brisa", cavalo2: "Sol", status: "VALIDO", bois: 9, tempo: 43 }),
        criarDupla({ id: "f", cavalo1: "Luar", cavalo2: "Orvalho", status: "VALIDO", bois: 8, tempo: 47 }),
      ],
    }),
  ];

  const geral = gerarRankingCavalos(provas);
  const soFinalizadas = gerarRankingCavalos(provas, { apenasFinalizadas: true });

  assert.equal(geral[0].cavalo, "Raio");
  assert.equal(geral[0].pontos, 10);
  assert.equal(geral[0].provas, 2);

  assert.equal(soFinalizadas[0].cavalo, "Raio");
  assert.equal(soFinalizadas[0].pontos, 5);
  assert.equal(soFinalizadas[0].provas, 1);
  assert.equal(soFinalizadas.some((item) => item.cavalo === "Nuvem"), false);
});
