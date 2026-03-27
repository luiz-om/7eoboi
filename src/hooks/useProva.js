import { useEffect, useState } from "react";
import {
  createDupla,
  createProva,
  deleteDupla,
  deleteProva,
  getSession,
  listProvasComDuplas,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  updateDupla,
  updateProva,
  updateResultadoDupla,
} from "../lib/ranchSortingApi";
import {
  duplaConcluida,
  duplaSat,
  escaparCsv,
  formatarBois,
  formatarData,
  gerarListaRankingCompleta,
  gerarRanking,
  gerarRankingCavalos,
  listarCavalosPremiados,
} from "../lib/ranchSortingUtils";
import { supabase } from "../lib/supabase";

export function useProva({ isTelaoWindow, provaIdTelao, toast, abrirConfirmacao }) {
  const [sessao, setSessao] = useState(null);
  const [authCarregando, setAuthCarregando] = useState(true);
  const [authProcessando, setAuthProcessando] = useState(false);
  const [authErro, setAuthErro] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [provas, setProvas] = useState([]);
  const [provaAtualId, setProvaAtualId] = useState(provaIdTelao);
  const [form, setForm] = useState({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
  const [resultadoForm, setResultadoForm] = useState({ duplaId: "", bois: "", tempo: "" });
  const [provaForm, setProvaForm] = useState({ nome: "", local: "", data: new Date().toISOString().slice(0, 10), observacoes: "" });
  const [erroConexao, setErroConexao] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoResultadoId, setEditandoResultadoId] = useState(null);
  const [editandoProvaId, setEditandoProvaId] = useState(null);

  // ─── carregarDados ─────────────────────────────────────────────────────────

  async function carregarDados(preferidoId = null) {
    const lista = await listProvasComDuplas();
    setProvas(lista);
    setProvaAtualId((atual) => {
      if (isTelaoWindow && provaIdTelao) return provaIdTelao;
      const alvo = preferidoId || atual;
      if (alvo && lista.some((prova) => prova.id === alvo)) return alvo;
      return lista[0]?.id || "";
    });
  }

  // ─── Auth session ──────────────────────────────────────────────────────────

  useEffect(() => {
    let ativo = true;
    const iniciarSessao = async () => {
      try {
        const session = await getSession();
        if (!ativo) return;
        setSessao(session);
      } catch (error) {
        if (!ativo) return;
        setAuthErro(error?.message || "Nao foi possivel verificar a sessao.");
      } finally {
        if (ativo) setAuthCarregando(false);
      }
    };
    iniciarSessao();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessao(session);
      setAuthCarregando(false);
    });
    return () => { ativo = false; listener.subscription.unsubscribe(); };
  }, []);

  // ─── Dados após login ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!sessao) { setProvas([]); setCarregando(false); return undefined; }
    let ativo = true;
    let timeoutId = null;
    const withTimeout = (promise, ms = 12000) =>
      Promise.race([
        promise,
        new Promise((_, reject) => { timeoutId = window.setTimeout(() => reject(new Error("Tempo excedido ao conectar com o Supabase.")), ms); }),
      ]);
    const iniciar = async () => {
      try {
        setCarregando(true);
        setErroConexao("");
        await withTimeout(carregarDados(isTelaoWindow ? provaIdTelao : null));
      } catch (error) {
        if (!ativo) return;
        const msg = error?.message || "Nao foi possivel conectar ao Supabase.";
        setErroConexao(msg);
        toast(msg, "erro");
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId);
        if (ativo) setCarregando(false);
      }
    };
    iniciar();
    const channel = supabase
      .channel(`db-changes-${isTelaoWindow ? "telao" : "app"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "provas" }, () => { carregarDados(isTelaoWindow ? provaIdTelao : null).catch(() => {}); })
      .on("postgres_changes", { event: "*", schema: "public", table: "duplas" }, () => { carregarDados(isTelaoWindow ? provaIdTelao : null).catch(() => {}); })
      .subscribe();
    return () => { ativo = false; if (timeoutId) window.clearTimeout(timeoutId); supabase.removeChannel(channel); };
  }, [isTelaoWindow, provaIdTelao, sessao]);

  // Auto-selecionar primeira prova
  useEffect(() => {
    if (!provas.length) { setProvaAtualId(""); return; }
    if (!provaAtualId || !provas.some(prova => prova.id === provaAtualId)) {
      setProvaAtualId(provas[0].id);
    }
  }, [provas, provaAtualId]);

  // ─── Auth handlers ─────────────────────────────────────────────────────────

  async function handleSignIn({ email, password }) {
    if (!email.trim() || !password) { setAuthErro("Informe email e senha."); return; }
    try {
      setAuthProcessando(true); setAuthErro(""); setAuthInfo("");
      await signInWithEmail({ email, password });
    } catch (error) {
      setAuthErro(error?.message || "Nao foi possivel entrar.");
    } finally { setAuthProcessando(false); }
  }

  async function handleSignUp({ email, password, confirmPassword }) {
    if (!email.trim() || !password || !confirmPassword) { setAuthErro("Preencha email, senha e confirmacao de senha."); return; }
    if (password.length < 8) { setAuthErro("A senha deve ter no minimo 8 caracteres."); return; }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) { setAuthErro("A senha deve conter letras e numeros."); return; }
    if (password !== confirmPassword) { setAuthErro("As senhas nao coincidem."); return; }
    try {
      setAuthProcessando(true); setAuthErro(""); setAuthInfo("");
      const data = await signUpWithEmail({ email, password });
      if (data.session) { setAuthInfo("Conta criada com sucesso."); }
      else { setAuthInfo("Conta criada. Verifique seu email para confirmar o cadastro."); }
    } catch (error) {
      setAuthErro(error?.message || "Nao foi possivel criar a conta.");
    } finally { setAuthProcessando(false); }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setAuthInfo(""); setAuthErro(""); setErroConexao("");
      setProvas([]); setProvaAtualId(""); 
    } catch (error) {
      toast(error?.message || "Nao foi possivel sair da conta.", "erro");
    }
  }

  // ─── Prova CRUD ────────────────────────────────────────────────────────────

  function resetarFormProva() {
    setProvaForm({ nome: "", local: "", data: new Date().toISOString().slice(0, 10), observacoes: "" });
    setEditandoProvaId(null);
  }

  async function salvarProva() {
    if (!provaForm.nome.trim()) { toast("Informe o nome da prova.", "erro"); return; }
    try {
      if (editandoProvaId) {
        const provaExistente = provas.find((prova) => prova.id === editandoProvaId);
        await updateProva(editandoProvaId, { ...provaForm, finalizada: Boolean(provaExistente?.finalizada), finalizadaEm: provaExistente?.finalizadaEm || null });
        await carregarDados(editandoProvaId);
        toast("Prova atualizada!");
      } else {
        const novaProva = await createProva(provaForm);
        await carregarDados(novaProva.id);
        setProvaAtualId(novaProva.id);
        toast("Prova cadastrada!");
      }
      resetarFormProva();
    } catch (error) { toast(error.message || "Nao foi possivel salvar a prova.", "erro"); }
  }

  function editarProva(prova) {
    setProvaForm({ nome: prova.nome || "", local: prova.local || "", data: prova.data || new Date().toISOString().slice(0, 10), observacoes: prova.observacoes || "" });
    setEditandoProvaId(prova.id);
  }

  function selecionarProva(id) {
    setProvaAtualId(id);
    setEditandoId(null);
    setEditandoResultadoId(null);
    setResultadoForm({ duplaId: "", bois: "", tempo: "" });
    setForm({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
  }

  async function removerProva(id) {
    const prova = provas.find(item => item.id === id);
    if (!prova) return;
    abrirConfirmacao({
      title: "Remover prova",
      text: `A prova "${prova.nome}" e todas as duplas vinculadas serao removidas.`,
      confirmLabel: "Remover",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await deleteProva(id);
          await carregarDados(provaAtualId === id ? null : provaAtualId);
          toast("Prova removida!");
        } catch (error) { toast(error.message || "Nao foi possivel remover a prova.", "erro"); }
      },
    });
  }

  async function finalizarProva(id) {
    try {
      const prova = provas.find((item) => item.id === id);
      if (!prova) return;
      if (prova.finalizada) { toast("Essa prova ja foi finalizada.", "erro"); return; }
      abrirConfirmacao({
        title: "Finalizar prova",
        text: `A prova "${prova.nome}" sera encerrada e as duplas ficarao bloqueadas para edicao.`,
        confirmLabel: "Finalizar",
        confirmVariant: "amber",
        onConfirm: async () => {
          try {
            await updateProva(prova.id, { nome: prova.nome, local: prova.local, data: prova.data, observacoes: prova.observacoes, finalizada: true, finalizadaEm: new Date().toISOString() });
            resetarFormProva();
            setForm({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
            setResultadoForm({ duplaId: "", bois: "", tempo: "" });
            setEditandoId(null);
            setEditandoResultadoId(null);
            await carregarDados(provaAtualId === prova.id ? null : provaAtualId);
            toast(`Prova "${prova.nome}" finalizada.`);
          } catch (error) { toast(error.message || "Nao foi possivel finalizar a prova.", "erro"); }
        },
      });
    } catch (error) { toast(error.message || "Nao foi possivel finalizar a prova.", "erro"); }
  }

  // ─── Dupla CRUD ────────────────────────────────────────────────────────────

  const provaAtual = provas.find(prova => prova.id === provaAtualId) || null;
  const duplas = provaAtual?.duplas || [];
  const provaFinalizada = Boolean(provaAtual?.finalizada);

  async function cadastrarDupla() {
    if (!provaAtual) { toast("Cadastre ou selecione uma prova primeiro.", "erro"); return; }
    const { cavaleiro1, cavalo1, cavaleiro2, cavalo2 } = form;
    if (!cavaleiro1 || !cavalo1 || !cavaleiro2 || !cavalo2) { toast("Preencha todos os campos!", "erro"); return; }
    try {
      if (editandoId) {
        const duplaAtual = duplas.find((dp) => dp.id === editandoId);
        await updateDupla(editandoId, { cavaleiro1, cavalo1, cavaleiro2, cavalo2, status: duplaAtual?.status ?? "PENDENTE", bois: duplaAtual?.bois ?? null, tempo: duplaAtual?.tempo ?? null });
        setEditandoId(null);
        toast("Dupla atualizada!");
      } else {
        const ordem = duplas.reduce((max, dp) => Math.max(max, dp.ordem || 0), 0) + 1;
        await createDupla({ provaId: provaAtual.id, ordem, cavaleiro1, cavalo1, cavaleiro2, cavalo2, status: "PENDENTE", bois: null, tempo: null });
        toast("Dupla cadastrada!");
      }
      setForm({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
      await carregarDados(provaAtual.id);
    } catch (error) { toast(error.message || "Nao foi possivel salvar a dupla.", "erro"); }
  }

  function editarDupla(dp) {
    setForm({ cavaleiro1: dp.cavaleiro1, cavalo1: dp.cavalo1, cavaleiro2: dp.cavaleiro2, cavalo2: dp.cavalo2 });
    setEditandoId(dp.id);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
  }

  async function removerDupla(id) {
    if (provaFinalizada) { toast("Prova finalizada. Nao e permitido alterar duplas.", "erro"); return; }
    abrirConfirmacao({
      title: "Remover dupla",
      text: "Esta dupla sera removida da prova atual.",
      confirmLabel: "Remover",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await deleteDupla(id);
          if (editandoId === id) cancelarEdicao();
          if (editandoResultadoId === id) cancelarEdicaoResultado();
          await carregarDados(provaAtual?.id || null);
          toast("Dupla removida!");
        } catch (error) { toast(error.message || "Nao foi possivel remover a dupla.", "erro"); }
      },
    });
  }

  // ─── Resultado ─────────────────────────────────────────────────────────────

  async function salvarResultado() {
    if (!provaAtual) { toast("Cadastre ou selecione uma prova primeiro.", "erro"); return; }
    if (provaFinalizada && !editandoResultadoId) { toast("Prova finalizada. Consulte o historico da prova.", "erro"); return; }
    const { duplaId, bois, tempo } = resultadoForm;
    if (!duplaId || bois === "" || tempo === "") { toast("Preencha todos os campos!", "erro"); return; }
    const b = parseInt(bois);
    const t = parseFloat(String(tempo).replace(",", "."));
    if (isNaN(b) || b < 0 || b > 10) { toast("Bois validos: 0 a 10", "erro"); return; }
    if (isNaN(t) || t <= 0) { toast("Tempo invalido!", "erro"); return; }
    const era = !!editandoResultadoId;
    try {
      await updateResultadoDupla(duplaId, { status: "VALIDO", bois: b, tempo: t });
      setResultadoForm({ duplaId: "", bois: "", tempo: "" });
      setEditandoResultadoId(null);
      await carregarDados(provaAtual.id);
      toast(era ? "Resultado atualizado!" : "Resultado registrado!");
    } catch (error) { toast(error.message || "Nao foi possivel salvar o resultado.", "erro"); }
  }

  function iniciarEdicaoResultado(dp) {
    setEditandoResultadoId(dp.id);
    setResultadoForm({ duplaId: dp.id, bois: duplaSat(dp) ? "" : String(dp.bois), tempo: dp.tempo == null ? "" : String(dp.tempo) });
  }

  function cancelarEdicaoResultado() {
    setEditandoResultadoId(null);
    setResultadoForm({ duplaId: "", bois: "", tempo: "" });
  }

  async function limparResultado(id) {
    if (provaFinalizada) { toast("Prova finalizada. Nao e permitido alterar resultados.", "erro"); return; }
    abrirConfirmacao({
      title: "Remover resultado",
      text: "O resultado da dupla voltara para o estado pendente.",
      confirmLabel: "Limpar",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await updateResultadoDupla(id, { status: "PENDENTE", bois: null, tempo: null });
          if (editandoResultadoId === id) cancelarEdicaoResultado();
          await carregarDados(provaAtual?.id || null);
          toast("Resultado removido!");
        } catch (error) { toast(error.message || "Nao foi possivel limpar o resultado.", "erro"); }
      },
    });
  }

  async function registrarSAT({ tempoTelao, setTimerRodando, setTempoInicial, resetarRodada, setBoisTelao, setBoisErro }) {
    if (!provaAtual) { toast("Cadastre ou selecione uma prova primeiro.", "erro"); return; }
    const atual = duplas.find(d => !duplaConcluida(d));
    if (!atual) { toast("Nenhuma dupla pendente para marcar SAT.", "erro"); return; }
    const [segundos, milisegundos] = tempoTelao.split(".").map(Number);
    const tempoEmSegundos = (segundos || 0) + ((milisegundos || 0) / 1000);
    setTimerRodando(false);
    setTempoInicial(null);
    try {
      await updateResultadoDupla(atual.id, { status: "SAT", bois: null, tempo: tempoEmSegundos });
      await carregarDados(provaAtual.id);
      toast(`Dupla marcada como SAT: ${atual.cavaleiro1}`);
      resetarRodada();
      setBoisTelao("");
      setBoisErro(false);
    } catch (error) { toast(error.message || "Nao foi possivel marcar SAT.", "erro"); }
  }

  async function finalizarDuplaAtual({ tempoTelao, rodadaIniciada, contadorBois, boisTelao, parciais, setBoisErro, resetarRodada, setBoisTelao }) {
    const atual = duplas.find(d => !duplaConcluida(d));
    if (!atual) { toast("Nenhuma dupla pendente!", "erro"); return; }
    const boisFinais = rodadaIniciada ? contadorBois : parseInt(boisTelao);
    if (!rodadaIniciada && boisTelao === "") { setBoisErro(true); toast("Inicie a rodada ou digite o numero de bois!", "erro"); return; }
    if (!rodadaIniciada && (isNaN(boisFinais) || boisFinais < 0 || boisFinais > 10)) { setBoisErro(true); toast("Bois devem ser entre 0 e 10!", "erro"); return; }
    const ultimoParcial = parciais[parciais.length - 1];
    const tempoFinalStr = ultimoParcial ? ultimoParcial.tempo : tempoTelao;
    const [segundos, milisegundos] = tempoFinalStr.split(".").map(Number);
    const tempoEmSegundos = (segundos || 0) + ((milisegundos || 0) / 1000);
    try {
      await updateResultadoDupla(atual.id, { status: "VALIDO", bois: boisFinais, tempo: tempoEmSegundos });
      await carregarDados(provaAtual?.id || null);
      toast(`Dupla finalizada: ${atual.cavaleiro1} — ${boisFinais} bois em ${tempoFinalStr}s`);
      resetarRodada();
      setBoisTelao("");
      setBoisErro(false);
    } catch (error) { toast(error.message || "Nao foi possivel finalizar a dupla.", "erro"); }
  }

  // ─── Export / Impressão ────────────────────────────────────────────────────

  function gerarNomeArquivoResultados(prova) {
    const base = prova?.nome?.trim() || "prova";
    const slug = base.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const agora = new Date();
    const pad = valor => String(valor).padStart(2, "0");
    return `resultado-${slug || "ranch-sorting"}-${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}_${pad(agora.getHours())}-${pad(agora.getMinutes())}.csv`;
  }

  function baixarArquivo(blob, nomeArquivo) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportarRankingProva(prova) {
    const rankingProva = gerarListaRankingCompleta(prova?.duplas || []);
    if (!prova || rankingProva.length === 0) { toast("Nenhum resultado para exportar.", "erro"); return false; }
    const cabecalho = ["Prova", "Data", "Posicao", "Cavaleiro 1", "Cavalo 1", "Cavaleiro 2", "Cavalo 2", "Bois", "Tempo (s)"].join(";");
    const linhas = rankingProva.map((dp, index) => [
      escaparCsv(prova.nome), escaparCsv(formatarData(prova.data)),
      duplaSat(dp) ? "SAT" : index + 1, escaparCsv(dp.cavaleiro1), escaparCsv(dp.cavalo1),
      escaparCsv(dp.cavaleiro2), escaparCsv(dp.cavalo2),
      duplaSat(dp) ? "SAT" : dp.bois, duplaSat(dp) ? "" : Number(dp.tempo).toFixed(3),
    ].join(";"));
    const csv = `\uFEFF${[cabecalho, ...linhas].join("\n")}`;
    baixarArquivo(new Blob([csv], { type: "text/csv;charset=utf-8;" }), gerarNomeArquivoResultados(prova));
    return true;
  }

  function exportarResultadosExcel() { return exportarRankingProva(provaAtual); }

  async function copiarResultadoWhatsApp({ rankingCompleto, medalhas, fmt }) {
    if (!provaAtual || !rankingCompleto.length) { toast("Nenhum resultado para copiar.", "erro"); return; }
    const dataHora = new Date().toLocaleString("pt-BR");
    let posicaoValida = 0;
    const linhasRanking = rankingCompleto.map((dp) => {
      if (duplaSat(dp)) return `SAT ${dp.cavaleiro1} & ${dp.cavaleiro2} - SAT`;
      const prefixo = medalhas[posicaoValida] || `${posicaoValida + 1}.`;
      posicaoValida += 1;
      return `${prefixo} ${dp.cavaleiro1} & ${dp.cavaleiro2} - ${dp.bois} bois em ${Number(dp.tempo).toFixed(3)}s`;
    });
    const texto = [`*${provaAtual.nome}*`, `${formatarData(provaAtual.data)}${provaAtual.local ? ` • ${provaAtual.local}` : ""}`, `Encerrado em ${dataHora}`, "", ...linhasRanking].join("\n");
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(texto); }
      else {
        const area = document.createElement("textarea");
        area.value = texto; area.setAttribute("readonly", "");
        area.style.position = "absolute"; area.style.left = "-9999px";
        document.body.appendChild(area); area.select(); document.execCommand("copy"); document.body.removeChild(area);
      }
      toast("Resultado copiado para colar no WhatsApp!");
    } catch { toast("Nao foi possivel copiar o resultado.", "erro"); }
  }

  function imprimirCertificadoCavalo(item) {
    if (!provaAtual) return;
    const popup = window.open("", "_blank", "width=1100,height=800");
    if (!popup) { toast("Nao foi possivel abrir a janela do certificado.", "erro"); return; }
    const html = `<html><head><title>Certificado - ${item.cavalo}</title><style>body{margin:0;font-family:Georgia,serif;background:#f2ead3}.sheet{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px;box-sizing:border-box}.cert{width:100%;max-width:960px;background:linear-gradient(135deg,#fff7dd,#f4ead0);border:14px solid #8b5e1a;outline:4px solid #d4a017;padding:56px 64px;box-sizing:border-box;text-align:center}.eyebrow{font-size:16px;letter-spacing:5px;text-transform:uppercase;color:#8b5e1a}.title{font-size:54px;color:#5a3a12;margin:18px 0 24px}.horse{font-size:50px;font-weight:700;color:#2b2112;margin:18px 0}.text{font-size:24px;line-height:1.6;color:#4b3a21}.highlight{color:${item.cor};font-weight:700}.footer{margin-top:42px;font-size:18px;color:#6b5530}</style></head><body><div class="sheet"><div class="cert"><div class="eyebrow">Certificado Oficial</div><div class="title">Ranch Sorting</div><div class="text">Certificamos que o cavalo</div><div class="horse">${item.cavalo}</div><div class="text">montado por <span class="highlight">${item.cavaleiro}</span>, conquistou o <span class="highlight">${item.titulo}</span> na prova <span class="highlight">${provaAtual.nome}</span>.</div><div class="footer">${formatarData(provaAtual.data)}${provaAtual.local ? ` • ${provaAtual.local}` : ""}</div></div></div><script>window.onload=()=>window.print();</script></body></html>`;
    popup.document.open(); popup.document.write(html); popup.document.close();
  }

  // ─── Derivados ─────────────────────────────────────────────────────────────

  const ranking = gerarRanking(duplas);
  const semResultado = duplas.filter(d => !duplaConcluida(d));
  const comResultado = duplas.filter(d => duplaConcluida(d));
  const proximaDupla = duplas.find(d => !duplaConcluida(d)) || null;
  const medalhas = ["🥇", "🥈", "🥉"];
  const fmt = t => t == null ? "—" : t.toFixed(3) + "s";
  const cavalosPremiadosDaProva = listarCavalosPremiados(provaAtual);
  const rankingCavalosDaProva = gerarRankingCavalos(provas, { provaId: provaAtualId });
  const rankingCavalosGeral = gerarRankingCavalos(provas, { apenasFinalizadas: true });
  const rankingCompleto = gerarListaRankingCompleta(duplas);

  return {
    sessao, authCarregando, authProcessando, authErro, authInfo,
    carregando, erroConexao, provas, provaAtualId, setProvaAtualId,
    form, setForm, resultadoForm, setResultadoForm, provaForm, setProvaForm,
    editandoId, setEditandoId, editandoResultadoId, setEditandoResultadoId, editandoProvaId,
    carregarDados,
    handleSignIn, handleSignUp, handleSignOut,
    resetarFormProva, salvarProva, editarProva, selecionarProva, removerProva, finalizarProva,
    cadastrarDupla, editarDupla, cancelarEdicao, removerDupla,
    salvarResultado, iniciarEdicaoResultado, cancelarEdicaoResultado, limparResultado,
    registrarSAT, finalizarDuplaAtual,
    exportarRankingProva, exportarResultadosExcel, copiarResultadoWhatsApp, imprimirCertificadoCavalo,
    provaAtual, duplas, ranking, semResultado, comResultado, proximaDupla,
    medalhas, fmt, provaFinalizada,
    cavalosPremiadosDaProva, rankingCavalosDaProva, rankingCavalosGeral, rankingCompleto,
    // utils
    formatarData, formatarBois, duplaConcluida, duplaSat,
    gerarListaRankingCompleta, gerarRanking,
  };
}