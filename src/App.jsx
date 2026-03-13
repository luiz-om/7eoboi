import { useEffect, useRef, useState } from "react";
import ArenaScreen from "./ArenaScreen";
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
} from "./lib/ranchSortingApi";
import AuthScreen from "./components/auth/AuthScreen";
import { Btn, EmptyState, Input, ModernTab, Select, StatCard, TextArea } from "./components/ui";
import {
  LIVE_CHANNEL_NAME,
  duplaConcluida,
  duplaSat,
  escaparCsv,
  formatarBois,
  formatarData,
  gerarListaRankingCompleta,
  gerarRanking,
  gerarRankingCavalos,
  listarCavalosPremiados,
} from "./lib/ranchSortingUtils";
import { supabase } from "./lib/supabase";

function usePWA() {
  useEffect(() => {
    const manifest = { name: "Ranch Sorting - Manejo Soluções", short_name: "Ranch Sorting", start_url: "/", display: "standalone", background_color: "#121212", theme_color: "#C98A2E" };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    let link = document.querySelector("link[rel='manifest']");
    if (!link) { link = document.createElement("link"); link.rel = "manifest"; document.head.appendChild(link); }
    link.href = url;
    let meta = document.querySelector("meta[name='theme-color']");
    if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.appendChild(meta); }
    meta.content = "#C98A2E";
    return () => URL.revokeObjectURL(url);
  }, []);
}

const LOGO_B64 = "data:image/png;base64,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";

export default function RanchSortingApp() {
  usePWA();

  const urlParams = new URLSearchParams(window.location.search);
  const isTelaoWindow = urlParams.get("telao") === "true";
  const provaIdTelao = urlParams.get("prova") || "";

  const [aba, setAba] = useState("provas");
  const [provas, setProvas] = useState([]);
  const [provaAtualId, setProvaAtualId] = useState(provaIdTelao);
  const [sessao, setSessao] = useState(null);
  const [authCarregando, setAuthCarregando] = useState(true);
  const [authProcessando, setAuthProcessando] = useState(false);
  const [authErro, setAuthErro] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
  const [resultadoForm, setResultadoForm] = useState({ duplaId: "", bois: "", tempo: "" });
  const [provaForm, setProvaForm] = useState({ nome: "", local: "", data: new Date().toISOString().slice(0, 10), observacoes: "" });
  const [mensagem, setMensagem] = useState(null);
  const [erroConexao, setErroConexao] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoResultadoId, setEditandoResultadoId] = useState(null);
  const [editandoProvaId, setEditandoProvaId] = useState(null);
  const [tempoTelao, setTempoTelao] = useState("00.000");
  const [timerRodando, setTimerRodando] = useState(false);
  const [tempoInicial, setTempoInicial] = useState(null);
  const [boisTelao, setBoisTelao] = useState("");
  const canalTelaoRef = useRef(null);

  useEffect(() => {
    if (isTelaoWindow || !timerRodando) {
      setTempoInicial(null);
      return;
    }
    if (tempoInicial === null) {
      setTempoInicial(Date.now());
    }
    const interval = setInterval(() => {
      setTempoTelao(() => {
        const agora = Date.now();
        const tempoDecorrido = agora - (tempoInicial || agora);
        const totalMilisegundos = Math.floor(tempoDecorrido);
        const segundos = Math.floor(totalMilisegundos / 1000);
        const milisegundos = totalMilisegundos % 1000;
        return `${String(segundos).padStart(2, "0")}.${String(milisegundos).padStart(3, "0")}`;
      });
    }, 10);
    return () => clearInterval(interval);
  }, [isTelaoWindow, timerRodando, tempoInicial]);

  useEffect(() => {
    if (!provas.length) {
      setProvaAtualId("");
      return;
    }
    if (!provaAtualId || !provas.some(prova => prova.id === provaAtualId)) {
      setProvaAtualId(provas[0].id);
    }
  }, [provas, provaAtualId]);

  function toast(msg, tipo = "ok") { setMensagem({ texto: msg, tipo }); setTimeout(() => setMensagem(null), 3000); }

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

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessao) {
      setProvas([]);
      setCarregando(false);
      return undefined;
    }

    let ativo = true;
    let timeoutId = null;

    const withTimeout = (promise, ms = 12000) =>
      Promise.race([
        promise,
        new Promise((_, reject) => {
          timeoutId = window.setTimeout(() => {
            reject(new Error("Tempo excedido ao conectar com o Supabase."));
          }, ms);
        }),
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
      .on("postgres_changes", { event: "*", schema: "public", table: "provas" }, () => {
        carregarDados(isTelaoWindow ? provaIdTelao : null).catch(() => {});
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "duplas" }, () => {
        carregarDados(isTelaoWindow ? provaIdTelao : null).catch(() => {});
      })
      .subscribe();

    return () => {
      ativo = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [isTelaoWindow, provaIdTelao, sessao]);

  async function handleSignIn({ email, password }) {
    if (!email.trim() || !password) {
      setAuthErro("Informe email e senha.");
      return;
    }

    try {
      setAuthProcessando(true);
      setAuthErro("");
      setAuthInfo("");
      await signInWithEmail({ email, password });
    } catch (error) {
      setAuthErro(error?.message || "Nao foi possivel entrar.");
    } finally {
      setAuthProcessando(false);
    }
  }

  async function handleSignUp({ email, password, confirmPassword }) {
    if (!email.trim() || !password || !confirmPassword) {
      setAuthErro("Preencha email, senha e confirmacao de senha.");
      return;
    }

    if (password !== confirmPassword) {
      setAuthErro("As senhas nao coincidem.");
      return;
    }

    try {
      setAuthProcessando(true);
      setAuthErro("");
      setAuthInfo("");
      const data = await signUpWithEmail({ email, password });
      if (data.session) {
        setAuthInfo("Conta criada com sucesso.");
      } else {
        setAuthInfo("Conta criada. Verifique seu email para confirmar o cadastro.");
      }
    } catch (error) {
      setAuthErro(error?.message || "Nao foi possivel criar a conta.");
    } finally {
      setAuthProcessando(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setAuthInfo("");
      setAuthErro("");
      setErroConexao("");
      setMensagem(null);
      setProvas([]);
      setProvaAtualId("");
      setAba("provas");
    } catch (error) {
      toast(error?.message || "Nao foi possivel sair da conta.", "erro");
    }
  }

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return undefined;

    const canal = new BroadcastChannel(LIVE_CHANNEL_NAME);
    canalTelaoRef.current = canal;

    canal.onmessage = (event) => {
      if (event.data?.type !== "timer-sync") return;
      if (typeof event.data.tempo === "string") setTempoTelao(event.data.tempo);
      if (typeof event.data.timerRodando === "boolean") setTimerRodando(event.data.timerRodando);
    };

    return () => {
      canal.close();
      canalTelaoRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isTelaoWindow || !canalTelaoRef.current) return;
    canalTelaoRef.current.postMessage({
      type: "timer-sync",
      tempo: tempoTelao,
      timerRodando,
    });
  }, [isTelaoWindow, tempoTelao, timerRodando]);

  function resetarFormProva() {
    setProvaForm({ nome: "", local: "", data: new Date().toISOString().slice(0, 10), observacoes: "" });
    setEditandoProvaId(null);
  }

  async function salvarProva() {
    if (!provaForm.nome.trim()) {
      toast("Informe o nome da prova.", "erro");
      return;
    }
    try {
      if (editandoProvaId) {
        const provaExistente = provas.find((prova) => prova.id === editandoProvaId);
        await updateProva(editandoProvaId, {
          ...provaForm,
          finalizada: Boolean(provaExistente?.finalizada),
          finalizadaEm: provaExistente?.finalizadaEm || null,
        });
        await carregarDados(editandoProvaId);
        toast("Prova atualizada!");
      } else {
        const novaProva = await createProva(provaForm);
        await carregarDados(novaProva.id);
        setProvaAtualId(novaProva.id);
        toast("Prova cadastrada!");
      }
      resetarFormProva();
    } catch (error) {
      toast(error.message || "Nao foi possivel salvar a prova.", "erro");
    }
  }

  function editarProva(prova) {
    setProvaForm({
      nome: prova.nome || "",
      local: prova.local || "",
      data: prova.data || new Date().toISOString().slice(0, 10),
      observacoes: prova.observacoes || "",
    });
    setEditandoProvaId(prova.id);
    setAba("provas");
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
    if (!confirm(`Remover a prova "${prova.nome}"?`)) return;
    try {
      await deleteProva(id);
      if (provaAtualId === id) setAba("provas");
      await carregarDados(provaAtualId === id ? null : provaAtualId);
      toast("Prova removida!");
    } catch (error) {
      toast(error.message || "Nao foi possivel remover a prova.", "erro");
    }
  }

  const provaAtual = provas.find(prova => prova.id === provaAtualId) || null;
  const duplas = provaAtual?.duplas || [];
  const ranking = gerarRanking(duplas);
  const semResultado = duplas.filter(d => !duplaConcluida(d));
  const comResultado = duplas.filter(d => duplaConcluida(d));
  const proximaDupla = duplas.find(d => !duplaConcluida(d));
  const medalhas = ["🥇", "🥈", "🥉"];
  const fmt = t => t == null ? "—" : t.toFixed(3) + "s";
  const provaFinalizada = Boolean(provaAtual?.finalizada);
  const cavalosPremiadosDaProva = listarCavalosPremiados(provaAtual);
  const rankingCavalosDaProva = gerarRankingCavalos(provas, { provaId: provaAtualId });
  const rankingCavalosGeral = gerarRankingCavalos(provas, { apenasFinalizadas: true });
  const rankingCompleto = gerarListaRankingCompleta(duplas);

  async function cadastrarDupla() {
    if (!provaAtual) {
      toast("Cadastre ou selecione uma prova primeiro.", "erro");
      setAba("provas");
      return;
    }
    const { cavaleiro1, cavalo1, cavaleiro2, cavalo2 } = form;
    if (!cavaleiro1 || !cavalo1 || !cavaleiro2 || !cavalo2) { toast("Preencha todos os campos!", "erro"); return; }
    try {
      if (editandoId) {
        const duplaAtual = duplas.find((dp) => dp.id === editandoId);
        await updateDupla(editandoId, {
          cavaleiro1,
          cavalo1,
          cavaleiro2,
          cavalo2,
          status: duplaAtual?.status ?? "PENDENTE",
          bois: duplaAtual?.bois ?? null,
          tempo: duplaAtual?.tempo ?? null,
        });
        setEditandoId(null);
        toast("Dupla atualizada!");
      } else {
        const ordem = duplas.reduce((max, dp) => Math.max(max, dp.ordem || 0), 0) + 1;
        await createDupla({
          provaId: provaAtual.id,
          ordem,
          cavaleiro1,
          cavalo1,
          cavaleiro2,
          cavalo2,
          status: "PENDENTE",
          bois: null,
          tempo: null,
        });
        toast("Dupla cadastrada!");
      }
      setForm({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
      await carregarDados(provaAtual.id);
    } catch (error) {
      toast(error.message || "Nao foi possivel salvar a dupla.", "erro");
    }
  }

  function editarDupla(dp) { setForm({ cavaleiro1: dp.cavaleiro1, cavalo1: dp.cavalo1, cavaleiro2: dp.cavaleiro2, cavalo2: dp.cavalo2 }); setEditandoId(dp.id); setAba("cadastro"); }
  function cancelarEdicao() { setEditandoId(null); setForm({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" }); }

  async function removerDupla(id) {
    if (provaFinalizada) {
      toast("Prova finalizada. Nao e permitido alterar duplas.", "erro");
      return;
    }
    if (!confirm("Remover esta dupla?")) return;
    try {
      await deleteDupla(id);
      if (editandoId === id) cancelarEdicao();
      if (editandoResultadoId === id) cancelarEdicaoResultado();
      await carregarDados(provaAtual?.id || null);
      toast("Dupla removida!");
    } catch (error) {
      toast(error.message || "Nao foi possivel remover a dupla.", "erro");
    }
  }

  async function salvarResultado() {
    if (!provaAtual) {
      toast("Cadastre ou selecione uma prova primeiro.", "erro");
      setAba("provas");
      return;
    }
    if (provaFinalizada && !editandoResultadoId) {
      toast("Prova finalizada. Consulte o historico da prova.", "erro");
      setAba("provas");
      return;
    }
    const { duplaId, bois, tempo } = resultadoForm;
    if (!duplaId || bois === "" || tempo === "") { toast("Preencha todos os campos!", "erro"); return; }
    const b = parseInt(bois);
    const t = parseFloat(String(tempo).replace(",", "."));
    if (isNaN(b) || b < 0 || b > 10) { toast("Bois válidos: 0 a 10", "erro"); return; }
    if (isNaN(t) || t <= 0) { toast("Tempo inválido!", "erro"); return; }
    const era = !!editandoResultadoId;
    try {
      await updateResultadoDupla(duplaId, { status: "VALIDO", bois: b, tempo: t });
      setResultadoForm({ duplaId: "", bois: "", tempo: "" });
      setEditandoResultadoId(null);
      await carregarDados(provaAtual.id);
      toast(era ? "Resultado atualizado!" : "Resultado registrado!");
    } catch (error) {
      toast(error.message || "Nao foi possivel salvar o resultado.", "erro");
    }
  }

  function iniciarEdicaoResultado(dp) {
    setEditandoResultadoId(dp.id);
    setResultadoForm({
      duplaId: dp.id,
      bois: duplaSat(dp) ? "" : String(dp.bois),
      tempo: dp.tempo == null ? "" : String(dp.tempo),
    });
  }
  function cancelarEdicaoResultado() { setEditandoResultadoId(null); setResultadoForm({ duplaId: "", bois: "", tempo: "" }); }
  async function limparResultado(id) {
    if (provaFinalizada) {
      toast("Prova finalizada. Nao e permitido alterar resultados.", "erro");
      return;
    }
    if (!confirm("Remover resultado?")) return;
    try {
      await updateResultadoDupla(id, { status: "PENDENTE", bois: null, tempo: null });
      if (editandoResultadoId === id) cancelarEdicaoResultado();
      await carregarDados(provaAtual?.id || null);
      toast("Resultado removido!");
    } catch (error) {
      toast(error.message || "Nao foi possivel limpar o resultado.", "erro");
    }
  }

  async function registrarSAT() {
    if (!provaAtual) {
      toast("Cadastre ou selecione uma prova primeiro.", "erro");
      setAba("provas");
      return;
    }
    const atual = duplas.find(d => !duplaConcluida(d));
    if (!atual) {
      toast("Nenhuma dupla pendente para marcar SAT.", "erro");
      return;
    }
    const [segundos, milisegundos] = tempoTelao.split(".").map(Number);
    const tempoEmSegundos = (segundos || 0) + (((milisegundos || 0)) / 1000);

    setTimerRodando(false);
    setTempoInicial(null);

    try {
      await updateResultadoDupla(atual.id, { status: "SAT", bois: null, tempo: tempoEmSegundos });
      await carregarDados(provaAtual.id);
      toast(`Dupla marcada como SAT: ${atual.cavaleiro1}`);
      setTempoTelao("00.000");
      setBoisTelao("");
    } catch (error) {
      toast(error.message || "Nao foi possivel marcar SAT.", "erro");
    }
  }

  async function finalizarDuplaAtual() {
    const atual = duplas.find(d => !duplaConcluida(d));
    if (!atual) { toast("Nenhuma dupla pendente!", "erro"); return; }
    if (boisTelao === "") { toast("Digite o número de bois!", "erro"); return; }
    const bois = parseInt(boisTelao);
    if (isNaN(bois) || bois < 0 || bois > 10) { toast("Bois devem ser entre 0 e 10!", "erro"); return; }
    const [segundos, milisegundos] = tempoTelao.split(".").map(Number);
    const tempoEmSegundos = (segundos || 0) + ((milisegundos || 0) / 1000);

    setTimerRodando(false);
    setTempoInicial(null);

    try {
      await updateResultadoDupla(atual.id, { status: "VALIDO", bois, tempo: tempoEmSegundos });
      await carregarDados(provaAtual?.id || null);
      toast(`Dupla finalizada: ${atual.cavaleiro1} - ${bois} bois`);
      setTempoTelao("00.000");
      setBoisTelao("");
    } catch (error) {
      toast(error.message || "Nao foi possivel finalizar a dupla.", "erro");
    }
  }

  async function finalizarProva(id) {
    try {
      const prova = provas.find((item) => item.id === id);
      if (!prova) return;
      if (prova.finalizada) {
        toast("Essa prova ja foi finalizada.", "erro");
        return;
      }
      if (!confirm(`Finalizar a prova "${prova.nome}"?`)) return;

      await updateProva(prova.id, {
          nome: prova.nome,
          local: prova.local,
          data: prova.data,
          observacoes: prova.observacoes,
          finalizada: true,
          finalizadaEm: new Date().toISOString(),
      });

      resetarFormProva();
      setForm({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
      setResultadoForm({ duplaId: "", bois: "", tempo: "" });
      setEditandoId(null);
      setEditandoResultadoId(null);
      setAba("provas");
      await carregarDados(provaAtualId === prova.id ? null : provaAtualId);
      toast(`Prova "${prova.nome}" finalizada.`);
    } catch (error) {
      toast(error.message || "Nao foi possivel finalizar a prova.", "erro");
    }
  }

  function gerarNomeArquivoResultados(prova = provaAtual) {
    const base = prova?.nome?.trim() || "prova";
    const slug = base.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const agora = new Date();
    const pad = valor => String(valor).padStart(2, "0");
    return `resultado-${slug || "ranch-sorting"}-${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}_${pad(agora.getHours())}-${pad(agora.getMinutes())}.csv`;
  }

  function baixarArquivo(blob, nomeArquivo) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportarRankingProva(prova) {
    const rankingProva = gerarListaRankingCompleta(prova?.duplas || []);
    if (!prova || rankingProva.length === 0) {
      toast("Nenhum resultado para exportar.", "erro");
      return false;
    }
    const cabecalho = ["Prova", "Data", "Posicao", "Cavaleiro 1", "Cavalo 1", "Cavaleiro 2", "Cavalo 2", "Bois", "Tempo (s)"].join(";");
    const linhas = rankingProva.map((dp, index) => [
      escaparCsv(prova.nome),
      escaparCsv(formatarData(prova.data)),
      duplaSat(dp) ? "SAT" : index + 1,
      escaparCsv(dp.cavaleiro1),
      escaparCsv(dp.cavalo1),
      escaparCsv(dp.cavaleiro2),
      escaparCsv(dp.cavalo2),
      duplaSat(dp) ? "SAT" : dp.bois,
      duplaSat(dp) ? "" : Number(dp.tempo).toFixed(3),
    ].join(";"));
    const csv = `\uFEFF${[cabecalho, ...linhas].join("\n")}`;
    baixarArquivo(new Blob([csv], { type: "text/csv;charset=utf-8;" }), gerarNomeArquivoResultados(prova));
    return true;
  }

  function exportarResultadosExcel() {
    return exportarRankingProva(provaAtual);
  }

  function gerarTextoWhatsApp() {
    if (!provaAtual) return "";
    const dataHora = new Date().toLocaleString("pt-BR");
    let posicaoValida = 0;
    const linhasRanking = rankingCompleto.map((dp) => {
      if (duplaSat(dp)) {
        return `SAT ${dp.cavaleiro1} & ${dp.cavaleiro2} - SAT`;
      }
      const prefixo = medalhas[posicaoValida] || `${posicaoValida + 1}.`;
      posicaoValida += 1;
      return `${prefixo} ${dp.cavaleiro1} & ${dp.cavaleiro2} - ${dp.bois} bois em ${Number(dp.tempo).toFixed(3)}s`;
    });
    return [
      `*${provaAtual.nome}*`,
      `${formatarData(provaAtual.data)}${provaAtual.local ? ` • ${provaAtual.local}` : ""}`,
      `Encerrado em ${dataHora}`,
      "",
      ...linhasRanking,
    ].join("\n");
  }

  async function copiarResultadoWhatsApp() {
    if (!provaAtual || ranking.length === 0) {
      toast("Nenhum resultado para copiar.", "erro");
      return;
    }
    const texto = gerarTextoWhatsApp();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
      } else {
        const area = document.createElement("textarea");
        area.value = texto;
        area.setAttribute("readonly", "");
        area.style.position = "absolute";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      toast("Resultado copiado para colar no WhatsApp!");
    } catch {
      toast("Nao foi possivel copiar o resultado.", "erro");
    }
  }

  function imprimirCertificadoCavalo(item) {
    if (!provaAtual) return;
    const popup = window.open("", "_blank", "width=1100,height=800");
    if (!popup) {
      toast("Nao foi possivel abrir a janela do certificado.", "erro");
      return;
    }
    const html = `
      <html>
        <head>
          <title>Certificado - ${item.cavalo}</title>
          <style>
            body {
              margin: 0;
              font-family: Georgia, serif;
              background: #f2ead3;
            }
            .sheet {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 32px;
              box-sizing: border-box;
            }
            .cert {
              width: 100%;
              max-width: 960px;
              background: linear-gradient(135deg, #fff7dd, #f4ead0);
              border: 14px solid #8b5e1a;
              outline: 4px solid #d4a017;
              padding: 56px 64px;
              box-sizing: border-box;
              text-align: center;
            }
            .eyebrow {
              font-size: 16px;
              letter-spacing: 5px;
              text-transform: uppercase;
              color: #8b5e1a;
            }
            .title {
              font-size: 54px;
              color: #5a3a12;
              margin: 18px 0 24px;
            }
            .horse {
              font-size: 50px;
              font-weight: 700;
              color: #2b2112;
              margin: 18px 0;
            }
            .text {
              font-size: 24px;
              line-height: 1.6;
              color: #4b3a21;
            }
            .highlight {
              color: ${item.cor};
              font-weight: 700;
            }
            .footer {
              margin-top: 42px;
              font-size: 18px;
              color: #6b5530;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="cert">
              <div class="eyebrow">Certificado Oficial</div>
              <div class="title">Ranch Sorting</div>
              <div class="text">Certificamos que o cavalo</div>
              <div class="horse">${item.cavalo}</div>
              <div class="text">
                montado por <span class="highlight">${item.cavaleiro}</span>,
                conquistou o <span class="highlight">${item.titulo}</span>
                na prova <span class="highlight">${provaAtual.nome}</span>.
              </div>
              <div class="footer">
                ${formatarData(provaAtual.data)}${provaAtual.local ? ` • ${provaAtual.local}` : ""}
              </div>
            </div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  }

  const tempoChange = e => {
    let v = e.target.value.replace(",", ".");
    if (v === "" || v === ".") { setResultadoForm(p => ({ ...p, tempo: e.target.value })); return; }
    if (!/^\d{0,2}([.,]\d{0,3})?$/.test(e.target.value)) return;
    if (!isNaN(parseFloat(v)) && parseFloat(v) > 60) return;
    setResultadoForm(p => ({ ...p, tempo: e.target.value }));
  };

  const tempoBlur = e => setResultadoForm(p => ({ ...p, tempo: e.target.value.replace(",", ".") }));

  const abrirTelao = () => {
    const params = new URLSearchParams();
    params.set("telao", "true");
    if (provaAtualId) params.set("prova", provaAtualId);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    window.open(url, "telao", "width=1920,height=1080,fullscreen=yes");
  };

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
    return <ArenaScreen duplas={duplas} ranking={ranking} tempo={tempoTelao} nomeProva={provaAtual?.nome || "Ranch Sorting"} provaFinalizada={provaFinalizada} />;
  }

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

      {mensagem && (
        <div style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 999, background: mensagem.tipo === "erro" ? "#7F1D1D" : "#14532D", border: `1px solid ${mensagem.tipo === "erro" ? "#EF4444" : "#22C55E"}`, color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", animation: "fadeIn 0.2s ease" }}>
          {mensagem.tipo === "erro" ? "❌ " : "✅ "}{mensagem.texto}
        </div>
      )}

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
          <button onClick={abrirTelao} style={{
            background: "linear-gradient(135deg,#D4A017,#A07010)", color: "#fff",
            border: "none", borderRadius: "8px", padding: "10px 14px",
            fontFamily: "'Oswald',sans-serif", fontSize: "12px", fontWeight: 600,
            letterSpacing: "0.8px", textTransform: "uppercase", cursor: "pointer",
            transition: "all 0.15s", display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 3px 10px rgba(212, 160, 23, 0.25)"
          }}>
            <span style={{ fontSize: "16px" }}>🪟</span>
            Telão
          </button>
          <Btn variant="ghost" size="sm" onClick={handleSignOut}>
            Sair
          </Btn>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E", animation: "pulse 2s infinite" }}></div>
          <span style={{ fontSize: "11px", color: "#22C55E", fontFamily: "'Oswald',sans-serif", letterSpacing: "0.5px" }}>AO VIVO</span>
        </div>
      </div>

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

      <div style={{ background: "#1A1A1A", borderBottom: "1px solid #2A2A2A", display: "flex", position: "sticky", top: 0, zIndex: 10 }}>
        {tabs.map(t => <ModernTab key={t.id} {...t} active={aba === t.id} onClick={setAba} />)}
      </div>

      <div style={{ padding: "16px", maxWidth: "760px", margin: "0 auto", paddingBottom: "80px" }}>
        {aba === "provas" && (
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
                            onClick={e => {
                              e.stopPropagation();
                              if (exportarRankingProva(prova)) toast(`Ranking da prova "${prova.nome}" baixado.`);
                            }}
                            title="Baixar CSV do ranking"
                            style={{
                              fontSize: "10px",
                              color: "#F4C542",
                              border: "1px solid #F4C54244",
                              borderRadius: "999px",
                              padding: "2px 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              background: "transparent",
                              cursor: "pointer",
                            }}
                          >
                            📥 Historico
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
                        <Btn variant="amber" size="sm" onClick={e => { e.stopPropagation(); finalizarProva(prova.id); }}>
                          🏁
                        </Btn>
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
                      <div style={{ fontSize: "10px", color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Historico de Resultados</div>
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
        )}

        {aba !== "provas" && !provaAtual && (
          <div>
            <EmptyState title="Nenhuma prova ativa" text="Cadastre uma prova primeiro. As abas registram os dados da prova selecionada." icon="🏁" />
            <Btn variant="primary" size="lg" full onClick={() => setAba("provas")} style={{ marginTop: "16px" }}>Cadastrar Prova</Btn>
          </div>
        )}

        {aba === "cadastro" && provaAtual && (
          <div>
            {provaFinalizada ? (
              <div style={{ background: "#1A1400", border: "1px solid #F4C54233", borderRadius: "12px", padding: "16px", marginBottom: "16px", color: "#D8C27A", textAlign: "center" }}>
                Prova finalizada. As duplas ficaram bloqueadas e o resultado esta disponivel no historico da aba Provas.
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
                <Btn variant="primary" size="lg" full onClick={cadastrarDupla} disabled={provaFinalizada} style={{ opacity: provaFinalizada ? 0.5 : 1, cursor: provaFinalizada ? "not-allowed" : "pointer" }}>{editandoId ? "💾 Salvar Alteração" : "✅ Cadastrar Dupla"}</Btn>
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
                  <Btn variant="secondary" size="sm" onClick={() => { if (provaFinalizada) return toast("Prova finalizada. Nao e permitido alterar duplas.", "erro"); editarDupla(dp); }} disabled={provaFinalizada} style={{ opacity: provaFinalizada ? 0.4 : 1, cursor: provaFinalizada ? "not-allowed" : "pointer" }}>✏️</Btn>
                  <Btn variant="danger" size="sm" onClick={() => removerDupla(dp.id)} disabled={provaFinalizada} style={{ opacity: provaFinalizada ? 0.4 : 1, cursor: provaFinalizada ? "not-allowed" : "pointer" }}>🗑️</Btn>
                </div>
              </div>
            ))}

          </div>
        )}

        {aba === "resultados" && provaAtual && (
          <div>
            {provaFinalizada ? (
              <div style={{ background: "#1A1400", border: "1px solid #F4C54233", borderRadius: "12px", padding: "16px", marginBottom: "16px", color: "#D8C27A", textAlign: "center" }}>
                Prova finalizada. O resultado ficou disponivel apenas no historico.
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
                    {duplas.map((dp, i) => <option key={dp.id} value={dp.id}>#{i + 1} {dp.cavaleiro1} & {dp.cavaleiro2}{duplaConcluida(dp) ? ` ✓ (${duplaSat(dp) ? "SAT" : `${dp.bois} bois`} · ${fmt(dp.tempo)})` : ""}</option>)}
                  </Select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <Input label="🐄 Bois Válidos (0–10)" type="number" min="0" max="10" value={resultadoForm.bois} onChange={e => { const v = e.target.value; if (v === "" || (Number(v) >= 0 && Number(v) <= 10 && Number.isInteger(Number(v)))) setResultadoForm(p => ({ ...p, bois: v })); }} placeholder="Ex: 8" />
                  <Input label="⏱️ Tempo (segundos)" type="text" inputMode="decimal" value={resultadoForm.tempo} onChange={tempoChange} onBlur={tempoBlur} placeholder="Ex: 47.523" />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Btn variant={editandoResultadoId ? "amber" : "primary"} size="lg" full onClick={salvarResultado}>{editandoResultadoId ? "💾 Salvar Alteração" : "✅ Salvar Resultado"}</Btn>
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
                          <Btn variant={eProx ? "success" : "ghost"} size="sm" style={{ opacity: eProx ? 1 : 0.25 }} onClick={() => { if (!eProx) return; setResultadoForm({ duplaId: dp.id, bois: "", tempo: "" }); setEditandoResultadoId(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
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
        )}

        {aba === "ranking" && provaAtual && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#141000,#1C1800)", border: "1px solid #F4C54222", borderRadius: "12px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", lineHeight: 1, marginBottom: "6px" }}>🏆</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "20px", fontWeight: 700, color: "#F4C542", letterSpacing: "2px", textTransform: "uppercase" }}>{provaAtual.nome}</div>
              <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>Mais bois · menor tempo como desempate</div>
            </div>

            {provaFinalizada && ranking.length > 0 ? (
              <div style={{ background: "linear-gradient(135deg,#0F1F0F,#152A15)", border: "1px solid #22C55E55", borderRadius: "12px", padding: "18px", marginBottom: "16px" }}>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "14px", color: "#22C55E", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>✅ Prova Finalizada</div>
                <div style={{ fontSize: "13px", color: "#B9D9C0", marginBottom: "14px" }}>Use as acoes abaixo para baixar a planilha CSV ou copiar o texto para o WhatsApp.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <Btn variant="success" size="lg" onClick={() => { if (exportarResultadosExcel()) toast("Planilha CSV gerada novamente!"); }}>📊 Baixar Planilha</Btn>
                  <Btn variant="amber" size="lg" onClick={copiarResultadoWhatsApp}>📱 Copiar p/ WhatsApp</Btn>
                </div>
              </div>
            ) : null}

            {rankingCompleto.length === 0 ? <EmptyState title="Nenhum resultado registrado" text="Os resultados desta prova aparecerao aqui." /> : rankingCompleto.map((dp, i) => {
              const pod = i < 3;
              const podCores = [
                { bg: "#141000", border: "#F4C54244", num: "#F4C542" },
                { bg: "#141414", border: "#C0C0C044", num: "#C0C0C0" },
                { bg: "#120E00", border: "#CD7F3244", num: "#CD7F32" },
              ];
              const c = pod ? podCores[i] : { bg: "#1E1E1E", border: "#2A2A2A", num: "#555" };
              return (
                <div key={dp.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "10px", padding: "14px 16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", border: `2px solid ${duplaSat(dp) ? "#F4C542" : c.num}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: pod ? "22px" : "14px", fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: duplaSat(dp) ? "#F4C542" : c.num, flexShrink: 0 }}>{duplaSat(dp) ? "SAT" : (pod ? medalhas[i] : i + 1)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: pod ? "#F0F0F0" : "#888", fontFamily: "'Oswald',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dp.cavaleiro1} & {dp.cavaleiro2}</div>
                    <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>🐴 {dp.cavalo1} · {dp.cavalo2}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: duplaSat(dp) ? "#F4C542" : "#22C55E", fontFamily: "'Oswald',sans-serif" }}>{duplaSat(dp) ? "SAT" : formatarBois(dp)}</div>
                    <div style={{ fontSize: "12px", color: "#555" }}>{duplaSat(dp) ? "" : `⏱️ ${fmt(dp.tempo)}`}</div>
                  </div>
                </div>
              );
            })}

            {semResultado.length > 0 ? (
              <div style={{ marginTop: "16px", padding: "12px", background: "#1A1A1A", borderRadius: "8px", border: "1px dashed #2A2A2A", textAlign: "center", fontSize: "12px", color: "#444" }}>
                ⏳ {semResultado.length} dupla(s) ainda sem resultado
              </div>
            ) : null}
          </div>
        )}

        {aba === "certificados" && provaAtual && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1B1404,#2A1E05)", border: "1px solid #F4C54222", borderRadius: "12px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", lineHeight: 1, marginBottom: "6px" }}>📜</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "20px", fontWeight: 700, color: "#F4C542", letterSpacing: "2px", textTransform: "uppercase" }}>Certificados dos Cavalos</div>
              <div style={{ fontSize: "11px", color: "#777", marginTop: "4px" }}>{provaAtual.nome}</div>
            </div>

            {!provaFinalizada ? (
              <div style={{ background: "#1A1400", border: "1px solid #F4C54233", borderRadius: "12px", padding: "16px", marginBottom: "16px", color: "#D8C27A", textAlign: "center" }}>
                Finalize a prova na aba <strong>Provas</strong> para liberar os certificados oficiais dos cavalos ganhadores.
              </div>
            ) : null}

            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "11px", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
              🏅 Cavalos Ganhadores da Prova
            </div>

            {provaFinalizada && cavalosPremiadosDaProva.length > 0 ? (
              <div style={{ display: "grid", gap: "10px", marginBottom: "18px" }}>
                {cavalosPremiadosDaProva.map(item => (
                  <div key={item.id} style={{ background: "#1E1E1E", border: `1px solid ${item.cor}55`, borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "18px", color: item.cor, textTransform: "uppercase" }}>
                          {item.medalha} {item.cavalo}
                        </div>
                        <div style={{ fontSize: "13px", color: "#DDD", marginTop: "4px" }}>
                          {item.titulo} com {item.cavaleiro}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                          {formatarData(provaAtual.data)}{provaAtual.local ? ` • ${provaAtual.local}` : ""}
                        </div>
                      </div>
                      <Btn variant="amber" size="sm" onClick={() => imprimirCertificadoCavalo(item)}>🖨️ Imprimir</Btn>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Nenhum certificado disponivel" text="Os certificados sao gerados para os cavalos do podio apos a prova ser finalizada." icon="📜" />
            )}

            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "11px", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginTop: "18px", marginBottom: "10px" }}>
              🐴 Ranking de Cavalos Mais Premiadas da Prova
            </div>

            {rankingCavalosDaProva.length === 0 ? (
              <EmptyState title="Sem premiacoes por cavalo nesta prova" text="Os cavalos premiados aparecerao aqui com base no podio da prova." icon="🐴" />
            ) : (
              rankingCavalosDaProva.map((item, index) => (
                <div key={`${item.cavalo}-${index}`} style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: "10px", padding: "14px 16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", border: "2px solid #C98A2E", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: "#F4C542", flexShrink: 0 }}>{index + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#F0F0F0", fontFamily: "'Oswald',sans-serif" }}>{item.cavalo}</div>
                    <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{item.ouro} ouro • {item.prata} prata • {item.bronze} bronze</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "22px", color: "#22C55E", fontWeight: 800 }}>{item.pontos}</div>
                    <div style={{ fontSize: "10px", color: "#666" }}>{item.premiacoes} premiacao(oes)</div>
                  </div>
                </div>
              ))
            )}

            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "11px", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginTop: "18px", marginBottom: "10px" }}>
              🌎 Ranking Geral de Cavalos Mais Premiados
            </div>

            {rankingCavalosGeral.length === 0 ? (
              <EmptyState title="Sem historico geral de cavalos premiados" text="Finalize provas para montar o ranking geral." icon="🏇" />
            ) : (
              rankingCavalosGeral.map((item, index) => (
                <div key={`geral-${item.cavalo}-${index}`} style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", padding: "14px 16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", border: "2px solid #22C55E", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: "#22C55E", flexShrink: 0 }}>{index + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#F0F0F0", fontFamily: "'Oswald',sans-serif" }}>{item.cavalo}</div>
                    <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{item.ouro} ouro • {item.prata} prata • {item.bronze} bronze • {item.provas} prova(s)</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "22px", color: "#F4C542", fontWeight: 800 }}>{item.pontos}</div>
                    <div style={{ fontSize: "10px", color: "#666" }}>{item.premiacoes} premiacao(oes)</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {aba === "telao" && provaAtual && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#141000,#1C1800)", border: "1px solid #F4C54222", borderRadius: "12px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", lineHeight: 1, marginBottom: "6px" }}>🎬</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "20px", fontWeight: 700, color: "#F4C542", letterSpacing: "2px", textTransform: "uppercase" }}>Controle do Telão</div>
              <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>{provaAtual.nome}</div>
            </div>

            <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "1px solid #2A2A2A" }}>
              <div style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", fontFamily: "'Oswald',sans-serif" }}>📊 STATUS DA PROVA</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div style={{ background: "#252525", borderRadius: "8px", padding: "12px", textAlign: "center", border: "1px solid #2A2A2A" }}>
                  <div style={{ fontSize: "12px", color: "#555", marginBottom: "4px" }}>DUPLAS</div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#F4C542" }}>{duplas.length}</div>
                </div>
                <div style={{ background: "#252525", borderRadius: "8px", padding: "12px", textAlign: "center", border: "1px solid #2A2A2A" }}>
                  <div style={{ fontSize: "12px", color: "#555", marginBottom: "4px" }}>COMPLETADAS</div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#22C55E" }}>{comResultado.length}</div>
                </div>
                <div style={{ background: "#252525", borderRadius: "8px", padding: "12px", textAlign: "center", border: "1px solid #2A2A2A" }}>
                  <div style={{ fontSize: "12px", color: "#555", marginBottom: "4px" }}>PENDENTES</div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#C98A2E" }}>{semResultado.length}</div>
                </div>
              </div>
            </div>

            {proximaDupla ? (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: "#0F2F0F", borderRadius: "12px", padding: "16px", border: "2px solid #22C55E", boxShadow: "0 0 20px rgba(34, 197, 94, 0.15)" }}>
                  <div style={{ fontSize: "14px", color: "#22C55E", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", fontFamily: "'Oswald',sans-serif", fontWeight: 700 }}>🐴 DUPLA ATUAL</div>
                  <div style={{ background: "#0B0B0B", borderRadius: "8px", padding: "14px", border: "1px solid #22C55E33" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#22C55E", fontFamily: "'Oswald',sans-serif", marginBottom: "8px" }}>{proximaDupla.cavaleiro1} <span style={{ color: "#666" }}>&</span> {proximaDupla.cavaleiro2}</div>
                    <div style={{ fontSize: "13px", color: "#888", fontFamily: "'Oswald',sans-serif" }}>🐴 {proximaDupla.cavalo1} <span style={{ color: "#555" }}>·</span> {proximaDupla.cavalo2}</div>
                  </div>
                </div>

                {semResultado.length > 1 ? (
                  <div style={{ background: "#1F1F0F", borderRadius: "12px", padding: "12px", border: "1px solid #C98A2E", boxShadow: "0 0 15px rgba(201, 138, 46, 0.1)" }}>
                    <div style={{ fontSize: "15px", color: "#C98A2E", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", fontFamily: "'Oswald',sans-serif", fontWeight: 700 }}>➡️ PRÓXIMA</div>
                    <div style={{ background: "#0B0B0B", borderRadius: "6px", padding: "10px", border: "1px solid #C98A2E22" }}>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "#C98A2E", fontFamily: "'Oswald',sans-serif", marginBottom: "4px", lineHeight: 1.2 }}>{semResultado[1]?.cavaleiro1} <span style={{ color: "#555" }}>&</span> {semResultado[1]?.cavaleiro2}</div>
                      <div style={{ fontSize: "10px", color: "#666", fontFamily: "'Oswald',sans-serif", lineHeight: 1.1 }}>🐴 {semResultado[1]?.cavalo1} · {semResultado[1]?.cavalo2}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "#1F0F0F", borderRadius: "12px", padding: "12px", border: "1px dashed #EF4444", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#EF4444", fontWeight: 700 }}>Última dupla</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: "#1F0F0F", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "1px dashed #EF4444", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#EF4444", fontWeight: 700 }}>✅ Todas as duplas foram testadas!</div>
              </div>
            )}

            <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid #2A2A2A" }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>⏱️ CONTROLE DE TIMER</div>

              <div style={{ background: "#0B0B0B", borderRadius: "12px", padding: "24px", textAlign: "center", marginBottom: "16px", border: `2px solid ${timerRodando ? "#EF4444" : "#F4C542"}`, transition: "all 0.3s ease" }}>
                <div style={{ fontSize: "64px", fontWeight: 800, color: timerRodando ? "#EF4444" : "#22C55E", fontFamily: "'Courier New',monospace", letterSpacing: "-2px", marginBottom: "8px" }}>{tempoTelao}</div>
                <div style={{ fontSize: "12px", color: timerRodando ? "#EF4444" : "#555", textTransform: "uppercase", letterSpacing: "1px", fontWeight: timerRodando ? 700 : 400 }}>{timerRodando ? "⏸️ RODANDO" : "Tempo atual"}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <Btn variant="success" size="lg" full onClick={() => { if (!timerRodando) { setTempoTelao("00.000"); setTempoInicial(null); setTimerRodando(true); } }} disabled={timerRodando} style={{ opacity: timerRodando ? 0.5 : 1, cursor: timerRodando ? "not-allowed" : "pointer" }}>▶️ Iniciar</Btn>
                <Btn variant="danger" size="lg" full onClick={() => setTimerRodando(false)} disabled={!timerRodando} style={{ opacity: !timerRodando ? 0.5 : 1, cursor: !timerRodando ? "not-allowed" : "pointer" }}>⏸️ Parar</Btn>
              </div>

              <div style={{ marginBottom: "14px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                <Input label="⏱️ Ajustar Tempo (SS.mmm)" value={tempoTelao} onChange={e => { const v = e.target.value.replace(",", "."); if (v === "" || /^\d{0,2}([.,]\d{0,3})?$/.test(v)) { setTempoTelao(v || "00.000"); setTimerRodando(false); } }} placeholder="00.000" disabled={timerRodando} />
                <Input label="🐄 Bois (0-10)" value={boisTelao} onChange={e => { const v = e.target.value; if (v === "" || /^\d{0,2}$/.test(v)) { const num = parseInt(v); if (v === "" || (num >= 0 && num <= 10)) setBoisTelao(v); } }} placeholder="0" disabled={timerRodando} type="number" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <Btn variant="success" size="lg" full onClick={abrirTelao} style={{ fontSize: "14px" }}>🪟 Abrir Telão</Btn>
                <Btn variant="amber" size="lg" full onClick={finalizarDuplaAtual} style={{ fontSize: "14px" }}>✅ Finalizar Dupla</Btn>
                <Btn variant="danger" size="lg" full onClick={registrarSAT} style={{ fontSize: "14px" }}>SAT</Btn>
              </div>
            </div>

            <div style={{ background: "#0F1F0F", border: "1px solid #22C55E33", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "#22C55E", lineHeight: 1.6 }}>💡 <strong>Dica:</strong> Clique em "Abrir Telão" para exibir em outra janela. O controle considera sempre a prova ativa selecionada na aba de provas.</div>
            </div>
          </div>
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
