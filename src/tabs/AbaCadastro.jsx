import { Btn, EmptyState, Input } from "../components/ui";

export default function AbaCadastro({
  provaAtual,
  duplas,
  form,
  setForm,
  editandoId,
  provaFinalizada,
  cadastrarDupla,
  editarDupla,
  cancelarEdicao,
  removerDupla,
  formatarData,
  formatarBois,
  duplaConcluida,
  duplaSat,
  fmt,
  toast,
}) {
  return (
    <div>
      {provaFinalizada ? (
        <div style={{ background: "#1A1400", border: "1px solid #F4C54233", borderRadius: "12px", padding: "16px", marginBottom: "16px", color: "#D8C27A", textAlign: "center" }}>
          Prova finalizada. As duplas ficaram bloqueadas e o resultado está disponível no histórico da aba Provas.
        </div>
      ) : null}
      <div style={{ background: "#131313", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>🏁 Prova Ativa</div>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "20px", color: "#F4C542" }}>{provaAtual.nome}</div>
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>{formatarData(provaAtual.data)}{provaAtual.local ? ` • ${provaAtual.local}` : ""}</div>
      </div>

      <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: editandoId ? "1px solid #C98A2E66" : "1px solid #2A2A2A" }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
          {editandoId ? "✏️ Editar Dupla" : "＋ Nova Dupla"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
          <Input label="🤠 Cavaleiro 1" value={form.cavaleiro1} onChange={e => setForm(p => ({ ...p, cavaleiro1: e.target.value }))} placeholder="Nome do cavaleiro" />
          <Input label="🐴 Cavalo 1" value={form.cavalo1} onChange={e => setForm(p => ({ ...p, cavalo1: e.target.value }))} placeholder="Nome do cavalo" />
          <Input label="🤠 Cavaleiro 2" value={form.cavaleiro2} onChange={e => setForm(p => ({ ...p, cavaleiro2: e.target.value }))} placeholder="Nome do cavaleiro" />
          <Input label="🐴 Cavalo 2" value={form.cavalo2} onChange={e => setForm(p => ({ ...p, cavalo2: e.target.value }))} placeholder="Nome do cavalo" />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Btn variant="primary" size="lg" full onClick={cadastrarDupla} disabled={provaFinalizada} style={{ opacity: provaFinalizada ? 0.5 : 1, cursor: provaFinalizada ? "not-allowed" : "pointer" }}>
            {editandoId ? "💾 Salvar Alteração" : "✅ Cadastrar Dupla"}
          </Btn>
          {editandoId ? <Btn variant="ghost" size="lg" onClick={cancelarEdicao}>Cancelar</Btn> : null}
        </div>
      </div>

      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "11px", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
        🐄 Duplas Cadastradas ({duplas.length})
      </div>

      {duplas.length === 0 ? <EmptyState title="Nenhuma dupla cadastrada" text="Cadastre as duplas desta prova para começar." /> : null}

      {duplas.map((dp, i) => (
        <div key={dp.id} style={{ background: "#1E1E1E", borderRadius: "10px", padding: "12px 14px", marginBottom: "8px", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#C98A2E22", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: "#C98A2E", fontSize: "13px", flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "13px", color: "#F0F0F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>🤠 {dp.cavaleiro1} <span style={{ color: "#C98A2E" }}>✦</span> {dp.cavaleiro2}</div>
            <div style={{ fontSize: "11px", color: "#444", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>🐴 {dp.cavalo1} · {dp.cavalo2}</div>
          </div>
          {duplaConcluida(dp) ? (
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: duplaSat(dp) ? "#F4C542" : "#22C55E" }}>{formatarBois(dp)}</div>
              <div style={{ fontSize: "10px", color: "#444" }}>{fmt(dp.tempo)}</div>
            </div>
          ) : null}
          <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
            <Btn variant="secondary" size="sm" onClick={() => { if (provaFinalizada) return toast("Prova finalizada. Não é permitido alterar duplas.", "erro"); editarDupla(dp); }} disabled={provaFinalizada} style={{ opacity: provaFinalizada ? 0.4 : 1, cursor: provaFinalizada ? "not-allowed" : "pointer" }}>✏️</Btn>
            <Btn variant="danger" size="sm" onClick={() => removerDupla(dp.id)} disabled={provaFinalizada} style={{ opacity: provaFinalizada ? 0.4 : 1, cursor: provaFinalizada ? "not-allowed" : "pointer" }}>🗑️</Btn>
          </div>
        </div>
      ))}
    </div>
  );
}
