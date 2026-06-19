import test from "node:test";
import assert from "node:assert/strict";

import { mapearDuplasImportadas } from "./importDuplasApi.js";

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
