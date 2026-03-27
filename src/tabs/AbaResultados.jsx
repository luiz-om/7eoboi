import { Btn, EmptyState, Input, Select } from "../components/ui";

export default function AbaResultados({
  provaAtual,
  duplas,
  comResultado,
  semResultado,
  proximaDupla,
  provaFinalizada,
  resultadoForm,
  setResultadoForm,
  editandoResultadoId,
  setEditandoResultadoId,
  salvarResultado,
  iniciarEdicaoResultado,
  cancelarEdicaoResultado,
  limparResultado,
  formatarData,
  formatarBois,
  duplaConcluida,
  duplaSat,
  fmt,
}) {
  const tempoChange = e => {
    let v = e.target.value.replace(",", ".");
    if (v === "" || v === ".") { setResultadoForm(p => ({ ...p, tempo: e.target.value })); return; }
    if (!/^\d{0,2}([.,]\d{0,3})?$/.test(e.target.value)) return;
    if (!isNaN(parseFloat(v)) && parseFloat(v) > 60) return;
    setResultadoForm(p => ({ ...p, tempo: e.target.value }));
  };

  const tempoBlur = e => setResultadoForm(p => ({ ...p, tempo: e.target.value.replace(",", ".") }));

  return (
    <div>
      {provaFinalizada ? (
        <div style={{ background: "#1A1400", border: "1px solid #F4C54233", borderRadius: "12px", padding: "16px", marginBottom: "16px", color: "#D8C27A", textAlign: "center" }}>
          Prova finalizada. O resultado ficou disponível apenas no histórico.
        </div>
      ) : null}

      {proximaDupla ? (
        <div style={{ background: "#0F1F0F", border: "1px solid #22C55E33", borderRadius: "12px", padding: "16px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "radial-gradient(circle,#22C55E18,transparent)" }} />
          <div style={{ fontSize: "10px", color: "#22C55E", letterSpacing: "2px", fontFamily: "'Oswald',sans-serif", marginBottom: "6px" }}>▶ PRÓXIMA NA ARENA</div>
          <div style={{ fontSize: "clamp(15px,4vw,25px)", fontWeight: 700, color: "#F0F0F0", fontFamily: "'Oswald',sans-serif" }}>
            {proximaDupla.cavaleiro1} <span style={{ color: "#C98A2E" }}>&</span> {proximaDupla.cavaleiro2}
          </div>
          <div style={{ fontSize: "12px", color: "#555", marginTop: "3px" }}>🐴 {proximaDupla.cavalo1} · {proximaDupla.cavalo2}</div>
        </div>
      ) : null}

      {duplas.length === 0 ? <EmptyState title="Cadastre duplas primeiro" text="Esta prova ainda não tem competidores." /> : !provaFinalizada ? (
        <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: editandoResultadoId ? "1px solid #C98A2E66" : "1px solid #2A2A2A" }}>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
            {editandoResultadoId ? "✏️ Editar Resultado" : "⏱️ Registrar Resultado"}
          </div>
          <div style={{ marginBottom: "12px" }}>
            <Select label="🤠 Selecionar Dupla" value={resultadoForm.duplaId} onChange={e => setResultadoForm(p => ({ ...p, duplaId: e.target.value }))} disabled={!!editandoResultadoId}>
              <option value="">Selecione uma dupla...</option>
              {duplas.map((dp, i) => (
                <option key={dp.id} value={dp.id}>
                  #{i + 1} {dp.cavaleiro1} & {dp.cavaleiro2}{duplaConcluida(dp) ? ` ✓ (${duplaSat(dp) ? "SAT" : `${dp.bois} bois`} · ${fmt(dp.tempo)})` : ""}
                </option>
              ))}
            </Select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <Input
              label="🐄 Bois Válidos (0–10)"
              type="number" min="0" max="10"
              value={resultadoForm.bois}
              onChange={e => { const v = e.target.value; if (v === "" || (Number(v) >= 0 && Number(v) <= 10 && Number.isInteger(Number(v)))) setResultadoForm(p => ({ ...p, bois: v })); }}
              placeholder="Ex: 8"
            />
            <Input
              label="⏱️ Tempo (segundos)"
              type="text" inputMode="decimal"
              value={resultadoForm.tempo}
              onChange={tempoChange}
              onBlur={tempoBlur}
              placeholder="Ex: 47.523"
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn variant={editandoResultadoId ? "amber" : "primary"} size="lg" full onClick={salvarResultado}>
              {editandoResultadoId ? "💾 Salvar Alteração" : "✅ Salvar Resultado"}
            </Btn>
            {editandoResultadoId ? <Btn variant="ghost" size="lg" onClick={cancelarEdicaoResultado}>Cancelar</Btn> : null}
          </div>
        </div>
      ) : null}

      {duplas.length > 0 && !provaFinalizada ? (
        <div>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "11px", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
            📋 Ordem de Chamada ({comResultado.length}/{duplas.length} concluídas)
          </div>
          {duplas.map((dp, i) => {
            const concluida = duplaConcluida(dp);
            const eProx = !concluida && duplas.slice(0, i).every(d => duplaConcluida(d));
            const isEd = editandoResultadoId === dp.id;
            return (
              <div key={dp.id} style={{
                background: eProx ? "#0F1F0F" : isEd ? "#1A1600" : "#1E1E1E",
                borderRadius: "10px", padding: "11px 14px", marginBottom: "7px",
                display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s",
                border: isEd ? "1px solid #C98A2E" : eProx ? "1px solid #22C55E44" : concluida ? "1px solid #22C55E18" : "1px solid #2A2A2A"
              }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "6px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, fontFamily: "'Oswald',sans-serif", background: eProx ? "#22C55E22" : concluida ? "#22C55E11" : "#2A2A2A", color: eProx ? "#22C55E" : concluida ? "#22C55E88" : "#555" }}>{concluida ? "✓" : i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: eProx ? "#F0F0F0" : concluida ? "#444" : "#CCC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dp.cavaleiro1} & {dp.cavaleiro2}</div>
                  {eProx ? <div style={{ fontSize: "9px", color: "#22C55E", letterSpacing: "1.5px", fontFamily: "'Oswald',sans-serif", marginTop: "1px" }}>▶ PRÓXIMA</div> : null}
                </div>
                {concluida ? (
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: duplaSat(dp) ? "#F4C542" : "#22C55E" }}>{formatarBois(dp)}</div>
                    <div style={{ fontSize: "10px", color: "#444" }}>{fmt(dp.tempo)}</div>
                  </div>
                ) : null}
                <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                  {concluida ? (
                    <>
                      <Btn variant="secondary" size="sm" onClick={() => iniciarEdicaoResultado(dp)}>✏️</Btn>
                      <Btn variant="danger" size="sm" onClick={() => limparResultado(dp.id)}>🗑️</Btn>
                    </>
                  ) : (
                    <Btn variant={eProx ? "success" : "ghost"} size="sm" style={{ opacity: eProx ? 1 : 0.25 }} onClick={() => {
                      if (!eProx) return;
                      setResultadoForm({ duplaId: dp.id, bois: "", tempo: "" });
                      setEditandoResultadoId(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}>
                      {eProx ? "⏱️ Reg." : "—"}
                    </Btn>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
