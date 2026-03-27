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
import logoExbe from "./assets/Logo_Exbe.png";

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
          <img src={logoExbe} alt="Logo" style={{ height: "38px", objectFit: "contain", mixBlendMode: "screen" }} />
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
