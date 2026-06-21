import test from "node:test";
import assert from "node:assert/strict";

import { mapearDuplasImportadas, mapearProvaImportada } from "./importDuplasApi.js";

test("mapearProvaImportada usa tipo do formulario quando Tira Boi selecionado", () => {
  const prova = mapearProvaImportada({
    nome: "Copa Regional",
    categoria: "Amador",
    observacoes: "Etapa: 1",
    data: "2026-06-06",
    local: "Campo Grande",
  }, { tipo: "TIRA_BOI", duplasCorte: 8 });

  assert.equal(prova.tipo, "TIRA_BOI");
  assert.equal(prova.duplasCorte, 8);
});

test("mapearProvaImportada detecta Tira Boi pela categoria", () => {
  const prova = mapearProvaImportada({
    nome: "3ª COPA APA",
    categoria: "3ª COPA APA - TIRA BOI",
    observacoes: "Etapa: CLASSIFICATÓRIA",
    data: "2026-06-06",
    local: "JCR RANCH - CAMPO GRANDE - MS",
  }, { duplasCorte: 10 });

  assert.equal(prova.tipo, "TIRA_BOI");
  assert.equal(prova.duplasCorte, 10);
});

test("mapearProvaImportada monta dados da prova a partir do cabecalho", () => {
  const prova = mapearProvaImportada({
    nome: "3ª COPA APA MS DE RANCH SORTING - 5ª ETAPA",
    local: "JCR RANCH - CAMPO GRANDE - MS",
    data: "2026-06-06",
    observacoes: "Categoria: 3ª COPA APA - TIRA BOI • Etapa: CLASSIFICATÓRIA • Hora: 15:00:00",
  });

  assert.equal(prova.nome, "3ª COPA APA MS DE RANCH SORTING - 5ª ETAPA");
  assert.equal(prova.local, "JCR RANCH - CAMPO GRANDE - MS");
  assert.equal(prova.data, "2026-06-06");
  assert.match(prova.observacoes, /CLASSIFICATÓRIA/);
});

test("mapearDuplasImportadas preenche cavalos com hifen e mantem passada", () => {
  const duplas = mapearDuplasImportadas([
    {
      passada: 1,
      competitor1Name: "MAURICIO BENITES",
      competitor2Name: "HILARIO ALVES JUNIOR",
    },
    {
      passada: 2,
      competitor1Name: "MONICA MARIA DE SOUZA CARNEIRO",
      competitor2Name: "MARCELO DE MACEDO MONTEIRO",
    },
  ]);

  assert.equal(duplas.length, 2);
  assert.deepEqual(duplas[0], {
    cavaleiro1: "MAURICIO BENITES",
    cavalo1: "-",
    cavaleiro2: "HILARIO ALVES JUNIOR",
    cavalo2: "-",
    passada: 1,
  });
  assert.equal(duplas[1].cavalo1, "-");
  assert.equal(duplas[1].cavalo2, "-");
});
