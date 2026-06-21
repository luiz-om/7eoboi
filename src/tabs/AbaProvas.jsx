import { Btn, EmptyState, Input, TextArea } from "../components/ui";
import { LABELS_TIPO_PROVA, TIPOS_PROVA, labelTipoProva, isTiraBoi, normalizarTipoProva } from "../lib/tipoProva";
import { gerarListaRankingCompletaPorTipo, gerarRankingPorTipo } from "../lib/ranchSortingUtils";

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
  importarProvaPdf,
  importandoProvaPdf,
  toast,
  formatarData,
  formatarBois,
  duplaSat,
  duplaConcluida,
  gerarListaRankingCompletaPorTipo,
  medalhas,
  fmt,
}) {
  const tipoSelecionado = normalizarTipoProva(provaForm.tipo);
  const isTiraBoiForm = tipoSelecionado === TIPOS_PROVA.TIRA_BOI;
  const provasFiltradas = provas.filter(
    (prova) => normalizarTipoProva(prova.tipo) === tipoSelecionado,
  );

  function trocarTipoProva(valor) {
    setProvaForm((p) => ({
      ...p,
      tipo: valor,
      duplasCorte: valor === TIPOS_PROVA.TIRA_BOI ? p.duplasCorte : "",
    }));
  }

  const provaEmExecucao = provas.find((prova) => prova.id === provaAtualId) ?? null;

  return (
    <div>
      <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: editandoProvaId ? "1px solid #C98A2E66" : "1px solid #2A2A2A" }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
          {editandoProvaId ? "✏️ Editar Prova" : "＋ Nova Prova"}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Tipo de prova</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {Object.entries(LABELS_TIPO_PROVA).map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                onClick={() => trocarTipoProva(valor)}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: `1px solid ${provaForm.tipo === valor ? "#22C55E" : "#2A2A2A"}`,
                  background: provaForm.tipo === valor ? "#152A15" : "#181818",
                  color: provaForm.tipo === valor ? "#22C55E" : "#AAA",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <Input label="🏁 Nome da Prova" value={provaForm.nome} onChange={e => setProvaForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: 3ª Etapa Rancho Primavera" />
          <Input label="📅 Data" type="date" value={provaForm.data} onChange={e => setProvaForm(p => ({ ...p, data: e.target.value }))} />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <Input label="📍 Local" value={provaForm.local} onChange={e => setProvaForm(p => ({ ...p, local: e.target.value }))} placeholder="Cidade, fazenda ou arena" />
        </div>
        {isTiraBoiForm ? (
          <div style={{ marginBottom: "12px" }}>
            <Input
              label="✂️ Duplas para o corte"
              type="number"
              min="1"
              value={provaForm.duplasCorte}
              onChange={e => setProvaForm(p => ({ ...p, duplasCorte: e.target.value }))}
              placeholder="Ex: 10"
            />
            <div style={{ fontSize: "11px", color: "#777", marginTop: "6px" }}>
              Somente as primeiras duplas no ranking por tempo avançam para a segunda etapa.
            </div>
          </div>
        ) : null}
        <div style={{ marginBottom: "16px" }}>
          <TextArea label="📝 Observações" value={provaForm.observacoes} onChange={e => setProvaForm(p => ({ ...p, observacoes: e.target.value }))} placeholder="Informações extras da prova" />
        </div>
        <div style={{ fontSize: "12px", color: "#B9D9C0", marginBottom: "12px" }}>
          Importe um PDF da prova para criar automaticamente o evento com base no cabeçalho (Evento, Data, Local, Categoria, Etapa) e cadastrar todas as duplas. PDFs com categoria Tira Boi são detectados automaticamente.
        </div>
        <div style={{ marginBottom: "16px" }}>
          <input
            id="import-prova-pdf"
            type="file"
            accept=".pdf,application/pdf"
            onChange={importarProvaPdf}
            disabled={importandoProvaPdf}
            style={{ display: "none" }}
          />
          <label
            htmlFor="import-prova-pdf"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: "48px",
              borderRadius: "12px",
              background: importandoProvaPdf ? "#2A2A2A" : "#22C55E",
              color: "#fff",
              fontWeight: 700,
              cursor: importandoProvaPdf ? "not-allowed" : "pointer",
              border: "1px solid #2A2A2A",
              textAlign: "center",
              opacity: importandoProvaPdf ? 0.85 : 1,
            }}
          >
            {importandoProvaPdf ? "⏳ Lendo PDF e criando prova..." : "📁 Importar PDF da prova"}
          </label>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Btn variant="primary" size="lg" full onClick={salvarProva}>{editandoProvaId ? "💾 Salvar Prova" : "✅ Cadastrar Prova"}</Btn>
          {editandoProvaId ? <Btn variant="ghost" size="lg" onClick={resetarFormProva}>Cancelar</Btn> : null}
        </div>
      </div>

      <div style={{ background: provaEmExecucao ? "linear-gradient(135deg,#0F2F0F,#152A15)" : "#1A1A1A", border: `1px solid ${provaEmExecucao ? "#22C55E66" : "#2A2A2A"}`, borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", color: provaEmExecucao ? "#22C55E" : "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontFamily: "'Oswald',sans-serif" }}>
          🎯 Prova em execução
        </div>
        {provaEmExecucao ? (
          <>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "20px", color: "#F4C542", marginBottom: "4px" }}>{provaEmExecucao.nome}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              {labelTipoProva(provaEmExecucao.tipo)} • {formatarData(provaEmExecucao.data)}
              {provaEmExecucao.local ? ` • ${provaEmExecucao.local}` : ""}
              {provaEmExecucao.duplasCorte ? ` • Corte: ${provaEmExecucao.duplasCorte}` : ""}
            </div>
            <div style={{ fontSize: "11px", color: "#6B9B7A", marginTop: "8px" }}>
              Duplas, ranking, controle e telão usam esta prova. Clique em outra no histórico para trocar.
            </div>
          </>
        ) : (
          <div style={{ fontSize: "13px", color: "#777" }}>
            Nenhuma prova fixada. Clique em uma prova no histórico abaixo para iniciar.
          </div>
        )}
      </div>

      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "11px", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
        📚 Histórico de Provas — {labelTipoProva(tipoSelecionado)} ({provasFiltradas.length})
      </div>

      {provasFiltradas.length === 0 ? (
        <EmptyState
          title={`Nenhuma prova ${labelTipoProva(tipoSelecionado).toLowerCase()} cadastrada`}
          text="Cadastre ou importe uma prova deste tipo para liberar as abas de duplas e ranking."
          icon="📁"
        />
      ) : null}

      {provasFiltradas.map(prova => {
        const rankingProva = gerarRankingPorTipo(prova.duplas || [], prova.tipo);
        const pendentes = (prova.duplas || []).filter(item => !duplaConcluida(item)).length;
        const ativa = prova.id === provaAtualId;
        const finalizada = Boolean(prova.finalizada);
        const emExecucao = ativa;
        return (
          <div key={prova.id} onClick={() => selecionarProva(prova.id)} style={{ background: emExecucao ? "#151D12" : "#1E1E1E", borderRadius: "12px", padding: "16px", marginBottom: "10px", border: `1px solid ${emExecucao ? "#22C55E55" : "#2A2A2A"}`, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "18px", color: emExecucao ? "#22C55E" : "#F4C542" }}>{prova.nome}</div>
                  <span style={{ fontSize: "10px", color: "#C98A2E", border: "1px solid #C98A2E44", borderRadius: "999px", padding: "2px 8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {labelTipoProva(prova.tipo)}
                  </span>
                  {emExecucao ? <span style={{ fontSize: "10px", color: "#22C55E", border: "1px solid #22C55E44", borderRadius: "999px", padding: "2px 8px", textTransform: "uppercase", letterSpacing: "1px" }}>Em execução</span> : null}
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
                  {prova.duplasCorte ? ` • Corte: ${prova.duplasCorte} duplas` : ""}
                </div>
                {prova.observacoes ? <div style={{ fontSize: "12px", color: "#555", marginTop: "8px" }}>{prova.observacoes}</div> : null}
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                {!finalizada ? (
                  <Btn variant="secondary" size="sm" onClick={e => { e.stopPropagation(); editarProva(prova); }}>✏️</Btn>
                ) : null}
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
            {finalizada && gerarListaRankingCompletaPorTipo(prova.duplas || [], prova.tipo).length > 0 ? (
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #2A2A2A" }}>
                <div style={{ fontSize: "10px", color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Histórico de Resultados</div>
                {gerarListaRankingCompletaPorTipo(prova.duplas || [], prova.tipo).slice(0, 5).map((dp, index) => (
                  <div key={dp.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "8px 10px", background: "#181818", borderRadius: "8px", marginBottom: "6px" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: "13px", color: "#EAEAEA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {duplaSat(dp) ? "SAT" : (medalhas[index] || `${index + 1}.`)} {dp.cavaleiro1} & {dp.cavaleiro2}
                      </div>
                      <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>🐴 {dp.cavalo1} · {dp.cavalo2}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {isTiraBoi(prova) ? (
                        <>
                          <div style={{ fontSize: "12px", color: duplaSat(dp) ? "#F4C542" : "#22C55E", fontWeight: 700 }}>{duplaSat(dp) ? "SAT" : fmt(dp.tempo)}</div>
                          {!duplaSat(dp) && dp.bois != null ? <div style={{ fontSize: "10px", color: "#666" }}>{formatarBois(dp)}</div> : null}
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: "12px", color: duplaSat(dp) ? "#F4C542" : "#22C55E", fontWeight: 700 }}>{duplaSat(dp) ? "SAT" : formatarBois(dp)}</div>
                          <div style={{ fontSize: "10px", color: "#666" }}>{duplaSat(dp) ? "" : fmt(dp.tempo)}</div>
                        </>
                      )}
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
