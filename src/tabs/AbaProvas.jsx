import { Btn, EmptyState, Input, TextArea } from "../components/ui";

export default function AbaProvas({
  provas,
  provaAtualId,
  provaForm,
  setProvaForm,
  editandoProvaId,
  salvarProva,
  resetarFormProva,
  selecionarProva,
  editarProva,
  finalizarProva,
  removerProva,
  exportarRankingProva,
  toast,
  formatarData,
  formatarBois,
  duplaSat,
  duplaConcluida,
  gerarListaRankingCompleta,
  gerarRanking,
  medalhas,
  fmt,
}) {
  return (
    <div>
      <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: editandoProvaId ? "1px solid #C98A2E66" : "1px solid #2A2A2A" }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
          {editandoProvaId ? "✏️ Editar Prova" : "＋ Nova Prova"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <Input label="🏁 Nome da Prova" value={provaForm.nome} onChange={e => setProvaForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: 3ª Etapa Rancho Primavera" />
          <Input label="📅 Data" type="date" value={provaForm.data} onChange={e => setProvaForm(p => ({ ...p, data: e.target.value }))} />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <Input label="📍 Local" value={provaForm.local} onChange={e => setProvaForm(p => ({ ...p, local: e.target.value }))} placeholder="Cidade, fazenda ou arena" />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <TextArea label="📝 Observações" value={provaForm.observacoes} onChange={e => setProvaForm(p => ({ ...p, observacoes: e.target.value }))} placeholder="Informações extras da prova" />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Btn variant="primary" size="lg" full onClick={salvarProva}>{editandoProvaId ? "💾 Salvar Prova" : "✅ Cadastrar Prova"}</Btn>
          {editandoProvaId ? <Btn variant="ghost" size="lg" onClick={resetarFormProva}>Cancelar</Btn> : null}
        </div>
      </div>

      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "11px", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
        📚 Histórico de Provas ({provas.length})
      </div>

      {provas.length === 0 ? <EmptyState title="Nenhuma prova cadastrada" text="Cadastre uma prova para liberar as abas de duplas, resultados e ranking." icon="📁" /> : null}

      {provas.map(prova => {
        const rankingProva = gerarRanking(prova.duplas || []);
        const pendentes = (prova.duplas || []).filter(item => !duplaConcluida(item)).length;
        const ativa = prova.id === provaAtualId;
        const finalizada = Boolean(prova.finalizada);
        return (
          <div key={prova.id} onClick={() => selecionarProva(prova.id)} style={{ background: ativa ? "#151D12" : "#1E1E1E", borderRadius: "12px", padding: "16px", marginBottom: "10px", border: `1px solid ${ativa ? "#22C55E55" : "#2A2A2A"}`, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "18px", color: ativa ? "#22C55E" : "#F4C542" }}>{prova.nome}</div>
                  {ativa ? <span style={{ fontSize: "10px", color: "#22C55E", border: "1px solid #22C55E44", borderRadius: "999px", padding: "2px 8px", textTransform: "uppercase", letterSpacing: "1px" }}>Ativa</span> : null}
                  {finalizada ? (
                    <button
                      onClick={e => { e.stopPropagation(); if (exportarRankingProva(prova)) toast(`Ranking da prova "${prova.nome}" baixado.`); }}
                      title="Baixar CSV do ranking"
                      style={{ fontSize: "10px", color: "#F4C542", border: "1px solid #F4C54244", borderRadius: "999px", padding: "2px 8px", textTransform: "uppercase", letterSpacing: "1px", background: "transparent", cursor: "pointer" }}
                    >
                      📥 Histórico
                    </button>
                  ) : null}
                </div>
                <div style={{ fontSize: "12px", color: "#777", marginTop: "4px" }}>
                  {formatarData(prova.data)}{prova.local ? ` • ${prova.local}` : ""}
                </div>
                {prova.observacoes ? <div style={{ fontSize: "12px", color: "#555", marginTop: "8px" }}>{prova.observacoes}</div> : null}
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <Btn variant="secondary" size="sm" onClick={e => { e.stopPropagation(); editarProva(prova); }}>✏️</Btn>
                {!finalizada ? (
                  <Btn variant="amber" size="sm" onClick={e => { e.stopPropagation(); finalizarProva(prova.id); }}>🏁</Btn>
                ) : null}
                <Btn variant="danger" size="sm" onClick={e => { e.stopPropagation(); removerProva(prova.id); }}>🗑️</Btn>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginTop: "14px" }}>
              <div style={{ background: "#181818", border: "1px solid #2A2A2A", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", marginBottom: "4px" }}>Duplas</div>
                <div style={{ fontSize: "18px", color: "#F4C542", fontWeight: 700 }}>{prova.duplas.length}</div>
              </div>
              <div style={{ background: "#181818", border: "1px solid #2A2A2A", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", marginBottom: "4px" }}>Concluídas</div>
                <div style={{ fontSize: "18px", color: "#22C55E", fontWeight: 700 }}>{rankingProva.length}</div>
              </div>
              <div style={{ background: "#181818", border: "1px solid #2A2A2A", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", marginBottom: "4px" }}>Pendentes</div>
                <div style={{ fontSize: "18px", color: "#C98A2E", fontWeight: 700 }}>{pendentes}</div>
              </div>
            </div>
            {finalizada && gerarListaRankingCompleta(prova.duplas || []).length > 0 ? (
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #2A2A2A" }}>
                <div style={{ fontSize: "10px", color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Histórico de Resultados</div>
                {gerarListaRankingCompleta(prova.duplas || []).slice(0, 5).map((dp, index) => (
                  <div key={dp.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "8px 10px", background: "#181818", borderRadius: "8px", marginBottom: "6px" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: "13px", color: "#EAEAEA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {duplaSat(dp) ? "SAT" : (medalhas[index] || `${index + 1}.`)} {dp.cavaleiro1} & {dp.cavaleiro2}
                      </div>
                      <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>🐴 {dp.cavalo1} · {dp.cavalo2}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "12px", color: duplaSat(dp) ? "#F4C542" : "#22C55E", fontWeight: 700 }}>{duplaSat(dp) ? "SAT" : formatarBois(dp)}</div>
                      <div style={{ fontSize: "10px", color: "#666" }}>{duplaSat(dp) ? "" : fmt(dp.tempo)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
