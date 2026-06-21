import test from "node:test";
import assert from "node:assert/strict";

import {
  embutirTipoNasObservacoes,
  extrairTipoDasObservacoes,
  inferirTipoProva,
  resolverTipoImportacao,
  TIPOS_PROVA,
} from "./tipoProva.js";

test("inferirTipoProva detecta Tira Boi nas observacoes importadas", () => {
  const tipo = inferirTipoProva({
    observacoes: "Categoria: 3ª COPA APA - TIRA BOI • Etapa: CLASSIFICATÓRIA",
  });
  assert.equal(tipo, TIPOS_PROVA.TIRA_BOI);
});

test("resolverTipoImportacao respeita selecao do formulario", () => {
  assert.equal(
    resolverTipoImportacao({ categoria: "Amador" }, TIPOS_PROVA.TIRA_BOI),
    TIPOS_PROVA.TIRA_BOI,
  );
});

test("extrairTipoDasObservacoes le markers quando colunas nao existem", () => {
  const obs = embutirTipoNasObservacoes("Etapa final", TIPOS_PROVA.TIRA_BOI, 10);
  const extra = extrairTipoDasObservacoes(obs);

  assert.equal(extra.tipo, TIPOS_PROVA.TIRA_BOI);
  assert.equal(extra.duplasCorte, 10);
  assert.equal(extra.observacoes, "Etapa final");
});
