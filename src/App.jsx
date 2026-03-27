import { useState } from "react";
import ArenaScreen from "./ArenaScreen";
import AuthScreen from "./components/auth/AuthScreen";
import { Btn, ConfirmDialog, EmptyState, ModernTab, StatCard } from "./components/ui";
import { useTimer } from "./hooks/useTimer";
import { useProva } from "./hooks/useProva";
import AbaProvas from "./tabs/AbaProvas";
import AbaCadastro from "./tabs/AbaCadastro";
import AbaResultados from "./tabs/AbaResultados";
import AbaRanking from "./tabs/AbaRanking";
import AbaCertificados from "./tabs/AbaCertificados";
import AbaTelao from "./tabs/AbaTelao";

const LOGO_B64 = "data:image/png;base64,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";

export default function RanchSortingApp() {
  const urlParams = new URLSearchParams(window.location.search);
  const isTelaoWindow = urlParams.get("telao") === "true";
  const provaIdTelao = urlParams.get("prova") || "";

  const [aba, setAba] = useState("provas");
  const [mensagem, setMensagem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  function toast(msg, tipo = "ok") { setMensagem({ texto: msg, tipo }); setTimeout(() => setMensagem(null), 3000); }
  function abrirConfirmacao(config) { setConfirmDialog(config); }
  function fecharConfirmacao() { setConfirmDialog(null); setConfirmando(false); }
  async function confirmarAcao() {
    if (!confirmDialog?.onConfirm) return;
    setConfirmando(true);
    try { await confirmDialog.onConfirm(); } finally { fecharConfirmacao(); }
  }

  const timer = useTimer({ isTelaoWindow });
  const prova = useProva({ isTelaoWindow, provaIdTelao, toast, abrirConfirmacao });

  const {
    sessao, authCarregando, authProcessando, authErro, authInfo,
    carregando, erroConexao, provas, provaAtualId,
    form, setForm, resultadoForm, setResultadoForm, provaForm, setProvaForm,
    editandoId, editandoResultadoId, setEditandoResultadoId, editandoProvaId,
    handleSignIn, handleSignUp, handleSignOut,
    resetarFormProva, salvarProva, editarProva, selecionarProva, removerProva, finalizarProva,
    cadastrarDupla, editarDupla, cancelarEdicao, removerDupla,
    salvarResultado, iniciarEdicaoResultado, cancelarEdicaoResultado, limparResultado,
    registrarSAT, finalizarDuplaAtual,
    exportarRankingProva, exportarResultadosExcel, copiarResultadoWhatsApp, imprimirCertificadoCavalo,
    provaAtual, duplas, ranking, semResultado, comResultado, proximaDupla,
    medalhas, fmt, provaFinalizada,
    cavalosPremiadosDaProva, rankingCavalosDaProva, rankingCavalosGeral, rankingCompleto,
    formatarData, formatarBois, duplaConcluida, duplaSat,
    gerarListaRankingCompleta, gerarRanking,
  } = prova;

  const {
    tempoTelao, timerRodando, boisTelao, boisErro,
    boiAtual, contadorBois, rodadaIniciada, boisUsados, parciais,
    setTimerRodando, setTempoInicial, setBoisTelao, setBoisErro,
    resetarRodada, iniciarRodada, proximoBoi, encerrarRodadaComBois,
  } = timer;

  const abrirTelao = () => {
    const params = new URLSearchParams();
    params.set("telao", "true");
    if (provaAtualId) params.set("prova", provaAtualId);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    window.open(url, "telao", "width=1920,height=1080,fullscreen=yes");
  };

  // ─── Loading / Auth / Error screens ────────────────────────────────────────

  if (authCarregando) {
    return (
      <div style={{ minHeight: "100vh", background: "#121212", display: "flex", alignItems: "center", justifyContent: "center", color: "#F4C542", fontFamily: "'Oswald',sans-serif", fontSize: "20px", gap: "12px" }}>
        <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: "32px" }}>🐄</span>
        Verificando sessao...
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!sessao) {
    return (
      <AuthScreen
        loading={authProcessando}
        error={authErro}
        info={authInfo}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
      />
    );
  }

  if (carregando) {
    return (
      <div style={{ minHeight: "100vh", background: "#121212", display: "flex", alignItems: "center", justifyContent: "center", color: "#F4C542", fontFamily: "'Oswald',sans-serif", fontSize: "20px", gap: "12px" }}>
        <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: "32px" }}>🐄</span>
        Carregando dados...
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (erroConexao) {
    return (
      <div style={{ minHeight: "100vh", background: "#121212", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "520px" }}>
          <EmptyState title="Falha na conexao com o Supabase" text={erroConexao} icon="⚠️" />
        </div>
      </div>
    );
  }

  if (isTelaoWindow) {
    return (
      <ArenaScreen
        duplas={duplas}
        ranking={ranking}
        tempo={tempoTelao}
        timerRodando={timerRodando}
        nomeProva={provaAtual?.nome || "Ranch Sorting"}
        provaFinalizada={provaFinalizada}
        boiAtual={boiAtual}
        contadorBois={contadorBois}
        tempoFinalizado={!timerRodando && tempoTelao !== "00.000" && parseInt(boisTelao) > 0}
        boisFinalizados={parseInt(boisTelao) || 0}
      />
    );
  }

  // ─── Tabs ──────────────────────────────────────────────────────────────────

  const tabs = [
    { id: "provas", label: "Provas", icon: "📁" },
    { id: "cadastro", label: "Duplas", icon: "🤠" },
    { id: "resultados", label: "Prova", icon: "⏱️" },
    { id: "ranking", label: "Ranking", icon: "🏆" },
    { id: "certificados", label: "Certificados", icon: "📜" },
    { id: "telao", label: "Controle", icon: "🎬" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#121212", color: "#E0E0E0", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        text={confirmDialog?.text}
        confirmLabel={confirmDialog?.confirmLabel}
        confirmVariant={confirmDialog?.confirmVariant}
        loading={confirmando}
        onCancel={fecharConfirmacao}
        onConfirm={confirmarAcao}
      />

      {mensagem && (
        <div style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 999, background: mensagem.tipo === "erro" ? "#7F1D1D" : "#14532D", border: `1px solid ${mensagem.tipo === "erro" ? "#EF4444" : "#22C55E"}`, color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", animation: "fadeIn 0.2s ease" }}>
          {mensagem.tipo === "erro" ? "❌ " : "✅ "}{mensagem.texto}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#1A1A1A", borderBottom: "1px solid #2A2A2A", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <img src={LOGO_B64} alt="Logo" style={{ height: "38px", objectFit: "contain", mixBlendMode: "screen" }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(15px,4vw,20px)", fontWeight: 700, color: "#F4C542", letterSpacing: "2px", textTransform: "uppercase", lineHeight: 1 }}>Ranch Sorting</div>
            <div style={{ fontSize: "10px", color: "#C98A2E", letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px" }}>
              {provaAtual ? `${provaAtual.nome} • ${formatarData(provaAtual.data)}` : "Selecione ou cadastre uma prova"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={abrirTelao} style={{ background: "linear-gradient(135deg,#D4A017,#A07010)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 14px", fontFamily: "'Oswald',sans-serif", fontSize: "12px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 3px 10px rgba(212, 160, 23, 0.25)" }}>
            <span style={{ fontSize: "16px" }}>🪟</span> Telão
          </button>
          <Btn variant="ghost" size="sm" onClick={handleSignOut}>Sair</Btn>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E", animation: "pulse 2s infinite" }}></div>
          <span style={{ fontSize: "11px", color: "#22C55E", fontFamily: "'Oswald',sans-serif", letterSpacing: "0.5px" }}>AO VIVO</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#161616", borderBottom: "1px solid #2A2A2A", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {[
          { value: provas.length, label: "Provas", color: "#F4C542" },
          { value: duplas.length, label: "Duplas", color: "#22C55E" },
          { value: semResultado.length, label: "Pendentes", color: "#C98A2E" },
        ].map((s, i) => (
          <div key={i} style={{ borderRight: i < 2 ? "1px solid #2A2A2A" : "none" }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Nav Tabs */}
      <div style={{ background: "#1A1A1A", borderBottom: "1px solid #2A2A2A", display: "flex", position: "sticky", top: 0, zIndex: 10 }}>
        {tabs.map(t => <ModernTab key={t.id} {...t} active={aba === t.id} onClick={setAba} />)}
      </div>

      {/* Content */}
      <div style={{ padding: "16px", maxWidth: "760px", margin: "0 auto", paddingBottom: "80px" }}>

        {aba === "provas" && (
          <AbaProvas
            provas={provas} provaAtualId={provaAtualId}
            provaForm={provaForm} setProvaForm={setProvaForm}
            editandoProvaId={editandoProvaId}
            salvarProva={salvarProva} resetarFormProva={resetarFormProva}
            selecionarProva={selecionarProva} editarProva={editarProva}
            finalizarProva={finalizarProva} removerProva={removerProva}
            exportarRankingProva={exportarRankingProva}
            toast={toast} formatarData={formatarData} formatarBois={formatarBois}
            duplaSat={duplaSat} duplaConcluida={duplaConcluida}
            gerarListaRankingCompleta={gerarListaRankingCompleta} gerarRanking={gerarRanking}
            medalhas={medalhas} fmt={fmt}
          />
        )}

        {aba !== "provas" && !provaAtual && (
          <div>
            <EmptyState title="Nenhuma prova ativa" text="Cadastre uma prova primeiro. As abas registram os dados da prova selecionada." icon="🏁" />
            <Btn variant="primary" size="lg" full onClick={() => setAba("provas")} style={{ marginTop: "16px" }}>Cadastrar Prova</Btn>
          </div>
        )}

        {aba === "cadastro" && provaAtual && (
          <AbaCadastro
            provaAtual={provaAtual} duplas={duplas}
            form={form} setForm={setForm}
            editandoId={editandoId} provaFinalizada={provaFinalizada}
            cadastrarDupla={cadastrarDupla} editarDupla={editarDupla}
            cancelarEdicao={cancelarEdicao} removerDupla={removerDupla}
            formatarData={formatarData} formatarBois={formatarBois}
            duplaConcluida={duplaConcluida} duplaSat={duplaSat}
            fmt={fmt} toast={toast}
          />
        )}

        {aba === "resultados" && provaAtual && (
          <AbaResultados
            provaAtual={provaAtual} duplas={duplas}
            comResultado={comResultado} semResultado={semResultado}
            proximaDupla={proximaDupla} provaFinalizada={provaFinalizada}
            resultadoForm={resultadoForm} setResultadoForm={setResultadoForm}
            editandoResultadoId={editandoResultadoId} setEditandoResultadoId={setEditandoResultadoId}
            salvarResultado={salvarResultado}
            iniciarEdicaoResultado={iniciarEdicaoResultado}
            cancelarEdicaoResultado={cancelarEdicaoResultado}
            limparResultado={limparResultado}
            formatarData={formatarData} formatarBois={formatarBois}
            duplaConcluida={duplaConcluida} duplaSat={duplaSat} fmt={fmt}
          />
        )}

        {aba === "ranking" && provaAtual && (
          <AbaRanking
            provaAtual={provaAtual}
            rankingCompleto={rankingCompleto} ranking={ranking}
            semResultado={semResultado} provaFinalizada={provaFinalizada}
            exportarResultadosExcel={exportarResultadosExcel}
            copiarResultadoWhatsApp={() => copiarResultadoWhatsApp({ rankingCompleto, medalhas, fmt })}
            medalhas={medalhas} fmt={fmt}
            formatarData={formatarData} formatarBois={formatarBois}
            duplaSat={duplaSat} toast={toast}
          />
        )}

        {aba === "certificados" && provaAtual && (
          <AbaCertificados
            provaAtual={provaAtual} provaFinalizada={provaFinalizada}
            cavalosPremiadosDaProva={cavalosPremiadosDaProva}
            rankingCavalosDaProva={rankingCavalosDaProva}
            rankingCavalosGeral={rankingCavalosGeral}
            imprimirCertificadoCavalo={imprimirCertificadoCavalo}
            formatarData={formatarData}
          />
        )}

        {aba === "telao" && provaAtual && (
          <AbaTelao
            provaAtual={provaAtual} duplas={duplas}
            comResultado={comResultado} semResultado={semResultado}
            proximaDupla={proximaDupla}
            timerRodando={timerRodando} tempoTelao={tempoTelao}
            boisTelao={boisTelao} boiAtual={boiAtual}
            contadorBois={contadorBois} rodadaIniciada={rodadaIniciada}
            boisUsados={boisUsados} parciais={parciais} provaFinalizada={provaFinalizada}
            iniciarRodada={iniciarRodada} proximoBoi={proximoBoi}
            resetarRodada={resetarRodada}
            finalizarDuplaAtual={() => finalizarDuplaAtual({ tempoTelao, rodadaIniciada, contadorBois, boisTelao, parciais, setBoisErro, resetarRodada, setBoisTelao })}
            registrarSAT={() => registrarSAT({ tempoTelao, setTimerRodando, setTempoInicial, resetarRodada, setBoisTelao, setBoisErro })}
            abrirTelao={abrirTelao}
          />
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        button{touch-action:manipulation}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes fadeIn{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}
      `}</style>
    </div>
  );
}
