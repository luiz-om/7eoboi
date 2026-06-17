import { useCallback, useEffect, useRef, useState } from "react";
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
  updateDuplaOrdem,
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
import * as XLSX from "xlsx";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

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
  const [provaForm, setProvaForm] = useState({
    nome: "",
    local: "",
    data: new Date().toISOString().slice(0, 10),
    observacoes: "",
  });
  const [erroConexao, setErroConexao] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoResultadoId, setEditandoResultadoId] = useState(null);
  const [editandoProvaId, setEditandoProvaId] = useState(null);
  const [importandoDuplasCsv, setImportandoDuplasCsv] = useState(false);

  // ✅ useRef para timeout evita stale closure
  const timeoutRef = useRef(null);

  // ─── carregarDados ─────────────────────────────────────────────────────────
  // ✅ useCallback estabiliza a referência para uso nos useEffect
  const carregarDados = useCallback(
    async (preferidoId = null) => {
      const lista = await listProvasComDuplas();
      setProvas(lista);
      setProvaAtualId((atual) => {
        if (isTelaoWindow && provaIdTelao) return provaIdTelao;
        const alvo = preferidoId || atual;
        if (alvo && lista.some((prova) => prova.id === alvo)) return alvo;
        return lista[0]?.id || "";
      });
    },
    [isTelaoWindow, provaIdTelao]
  );

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
    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ─── Dados após login ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessao) {
      setProvas([]);
      setCarregando(false);
      return;
    }
    let ativo = true;

    const iniciar = async () => {
      try {
        setCarregando(true);
        setErroConexao("");
        // ✅ useRef para o timeout em vez de variável local
        const promise = carregarDados(isTelaoWindow ? provaIdTelao : null);
        await Promise.race([
          promise,
          new Promise((_, reject) => {
            timeoutRef.current = window.setTimeout(
              () => reject(new Error("Tempo excedido ao conectar com o Supabase.")),
              12000
            );
          }),
        ]);
      } catch (error) {
        if (!ativo) return;
        const msg = error?.message || "Nao foi possivel conectar ao Supabase.";
        setErroConexao(msg);
        toast(msg, "erro");
      } finally {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
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
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      supabase.removeChannel(channel);
    };
    // ✅ carregarDados agora é estável via useCallback
  }, [isTelaoWindow, provaIdTelao, sessao, carregarDados, toast]);

  // Auto-selecionar primeira prova
  useEffect(() => {
    if (!provas.length) {
      setProvaAtualId("");
      return;
    }
    if (!provaAtualId || !provas.some((prova) => prova.id === provaAtualId)) {
      setProvaAtualId(provas[0].id);
    }
  }, [provas, provaAtualId]);

  // ─── Auth handlers ─────────────────────────────────────────────────────────
  const handleSignIn = useCallback(async ({ email, password }) => {
    if (!email.trim() || !password) { setAuthErro("Informe email e senha."); return; }
    try {
      setAuthProcessando(true); setAuthErro(""); setAuthInfo("");
      await signInWithEmail({ email, password });
    } catch (error) {
      setAuthErro(error?.message || "Nao foi possivel entrar.");
    } finally { setAuthProcessando(false); }
  }, []);

  const handleSignUp = useCallback(async ({ email, password, confirmPassword }) => {
    if (!email.trim() || !password || !confirmPassword) { setAuthErro("Preencha email, senha e confirmacao de senha."); return; }
    if (password.length < 8) { setAuthErro("A senha deve ter no minimo 8 caracteres."); return; }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) { setAuthErro("A senha deve conter letras e numeros."); return; }
    if (password !== confirmPassword) { setAuthErro("As senhas nao coincidem."); return; }
    try {
      setAuthProcessando(true); setAuthErro(""); setAuthInfo("");
      const data = await signUpWithEmail({ email, password });
      if (data.session) setAuthInfo("Conta criada com sucesso.");
      else setAuthInfo("Conta criada. Verifique seu email para confirmar o cadastro.");
    } catch (error) {
      setAuthErro(error?.message || "Nao foi possivel criar a conta.");
    } finally { setAuthProcessando(false); }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setAuthInfo(""); setAuthErro(""); setErroConexao("");
      setProvas([]); setProvaAtualId("");
    } catch (error) {
      toast(error?.message || "Nao foi possivel sair da conta.", "erro");
    }
  }, [toast]);

  // ─── Prova CRUD ────────────────────────────────────────────────────────────
  const resetarFormProva = useCallback(() => {
    setProvaForm({ nome: "", local: "", data: new Date().toISOString().slice(0, 10), observacoes: "" });
    setEditandoProvaId(null);
  }, []);

  async function salvarProva() {
    if (!provaForm.nome.trim()) { toast("Informe o nome da prova.", "erro"); return; }
    try {
      if (editandoProvaId) {
        const provaExistente = provas.find((p) => p.id === editandoProvaId);
        await updateProva(editandoProvaId, {
          ...provaForm,
          finalizada: Boolean(provaExistente?.finalizada),
          finalizadaEm: provaExistente?.finalizadaEm ?? null,
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
    } catch (error) { toast(error.message || "Nao foi possivel salvar a prova.", "erro"); }
  }

  function editarProva(prova) {
    if (prova.finalizada) {
      toast("Prova finalizada. Nao e permitido editar.", "erro");
      return;
    }
    setProvaForm({
      nome: prova.nome || "",
      local: prova.local || "",
      data: prova.data || new Date().toISOString().slice(0, 10),
      observacoes: prova.observacoes || "",
    });
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
    const provaAlvo = provas.find((item) => item.id === id);
    if (!provaAlvo) return;
    abrirConfirmacao({
      title: "Remover prova",
      text: `A prova "${provaAlvo.nome}" e todas as duplas vinculadas serao removidas.`,
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
    const provaAlvo = provas.find((item) => item.id === id);
    if (!provaAlvo) return;
    if (provaAlvo.finalizada) { toast("Essa prova ja foi finalizada.", "erro"); return; }
    abrirConfirmacao({
      title: "Finalizar prova",
      text: `A prova "${provaAlvo.nome}" sera encerrada e as duplas ficarao bloqueadas para edicao.`,
      confirmLabel: "Finalizar",
      confirmVariant: "amber",
      onConfirm: async () => {
        try {
          await updateProva(provaAlvo.id, {
            nome: provaAlvo.nome, local: provaAlvo.local, data: provaAlvo.data,
            observacoes: provaAlvo.observacoes, finalizada: true,
            finalizadaEm: new Date().toISOString(),
          });
          resetarFormProva();
          setForm({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
          setResultadoForm({ duplaId: "", bois: "", tempo: "" });
          setEditandoId(null);
          setEditandoResultadoId(null);
          await carregarDados(provaAtualId === provaAlvo.id ? null : provaAtualId);
          toast(`Prova "${provaAlvo.nome}" finalizada.`);
        } catch (error) { toast(error.message || "Nao foi possivel finalizar a prova.", "erro"); }
      },
    });
  }

  function splitLineIntoCompetitors(linha) {
    const normalize = (valor) => String(valor).trim().replace(/^"|"$/g, "");
    const trySplit = (text, splitter) =>
      text
        .split(splitter)
        .map(normalize)
        .filter((valor) => valor.length > 0);

    const candidates = [
      trySplit(linha, /\t/),
      trySplit(linha, /\|/),
      trySplit(linha, / {3,}/),
      trySplit(linha, / {2,}/),
      trySplit(linha, /;/),
      trySplit(linha, /,/),
    ];

    for (const cols of candidates) {
      if (cols.length === 2) return cols;
      if (cols.length > 2) {
        const midpoint = Math.ceil(cols.length / 2);
        const first = cols.slice(0, midpoint).join(" ");
        const second = cols.slice(midpoint).join(" ");
        if (first && second) return [first, second];
      }
    }

    const words = linha.split(/\s+/).map(normalize).filter(Boolean);
    if (words.length >= 2) {
      const half = Math.floor(words.length / 2);
      const first = words.slice(0, half).join(" ");
      const second = words.slice(half).join(" ");
      if (first && second) return [first, second];
    }

    return null;
  }

  function groupPdfLines(content) {
    const items = content.items
      .map((item) => {
        const transform = item.transform || [];
        return {
          str: item.str || "",
          x: transform[4] || 0,
          y: transform[5] || 0,
        };
      })
      .filter((item) => item.str.trim().length > 0);

    const linhas = [];
    items.sort((a, b) => b.y - a.y || a.x - b.x).forEach((item) => {
      const linhaExistente = linhas.find((linha) => Math.abs(linha.y - item.y) < 4);
      if (linhaExistente) {
        linhaExistente.items.push(item);
      } else {
        linhas.push({ y: item.y, items: [item] });
      }
    });

    return linhas
      .sort((a, b) => b.y - a.y)
      .map((linha) => ({
        y: linha.y,
        items: linha.items.sort((a, b) => a.x - b.x),
      }));
  }

  function isValidCompetitorName(value) {
    if (!value || typeof value !== "string") return false;
    const normalized = value.trim();
    if (normalized.length < 6) return false;
    if (!/[A-Za-zÀ-ÿ]/.test(normalized)) return false;
    if (/\d/.test(normalized)) return false;
    if (/[:@#\$%\^&\*\(\)_=\+\[\]\{\};"<>\/\\]/.test(normalized)) return false;
    if (/\b(hora|etapa|copa|evento|data|endereco|cidade|prova|classific|gerenciador|manejo|passada|competidor|cavaleiro|tira boi|tempo|sort\.?|hora:)\b/i.test(normalized)) return false;
    const words = normalized.split(/\s+/);
    if (words.length < 2) return false;
    return words.every((word) => /^[A-Za-zÀ-ÿ'’.\-]+$/.test(word));
  }

  function splitLineColumns(line) {
    const text = String(line ?? "").trim();
    if (!text) return [];

    const splitDelimited = (value) =>
      String(value)
        .split(/[;,](?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
        .map((col) => col.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);

    if (text.includes("\t")) {
      return text.split("\t").map((col) => col.trim()).filter(Boolean);
    }
    if (/[;,]/.test(text)) {
      return splitDelimited(text);
    }
    const spaced = text.split(/ {2,}/).map((col) => col.trim()).filter(Boolean);
    if (spaced.length >= 3) return spaced;
    const match = text.match(/^(\d+)\s+(.+?)\s{2,}(.+)$/);
    if (match) return [match[1].trim(), match[2].trim(), match[3].trim()];
    return text.split(/\s+/).map((col) => col.trim()).filter(Boolean);
  }

  function extractCompetitorsFromPdfLines(lines) {
    const competitors = [];
    const ignorePattern = /^(page\s*\d+|competidor\s*1?|competidor\s*2?|cavaleiro\s*1?|cavaleiro\s*2?|hora|etapa|classific|data|campo grande|ms de ranch sorting|tira boi|3ª copa apa|resultado|nome da equipe|cidade|uf|classifica|obs|observa)/i;

    const headerLineIndex = lines.findIndex((line) => {
      const text = line.items.map((item) => item.str).join(" ");
      const passFound = /passada/i.test(text);
      const competitorCount = line.items.filter((item) => /competidor|cavaleiro/i.test(item.str)).length;
      return passFound && competitorCount >= 2;
    });
    if (headerLineIndex < 0) return [];

    const headerLine = lines[headerLineIndex];
    const sortedHeaders = headerLine.items.sort((a, b) => a.x - b.x);
    const passHeader = sortedHeaders.find((item) => /passada/i.test(item.str));
    const competitorHeaders = sortedHeaders.filter((item) => /competidor|cavaleiro/i.test(item.str));
    if (!passHeader || competitorHeaders.length < 2) return [];

    const comp1Header = competitorHeaders[0];
    const comp2Header = competitorHeaders[1];
    const nextHeader = sortedHeaders.find((item) => item.x > comp2Header.x && !/competidor|cavaleiro|passada/i.test(item.str));

    const passBoundary = (passHeader.x + comp1Header.x) / 2;
    const comp1Boundary = (comp1Header.x + comp2Header.x) / 2;
    const comp2Boundary = nextHeader ? (comp2Header.x + nextHeader.x) / 2 : Infinity;

    let currentRow = null;

    for (let i = headerLineIndex + 1; i < lines.length; i += 1) {
      const line = lines[i];
      const lineText = line.items.map((item) => item.str.trim()).join(" ").trim();
      if (!lineText || ignorePattern.test(lineText)) continue;

      const passMatch = lineText.match(/^\s*(\d+)\s+(.*)$/);
      const passValue = passMatch ? passMatch[1] : "";
      const contentText = passMatch ? passMatch[2].trim() : lineText;
      const cols = splitLineColumns(contentText);
      const comp1 = cols[0] || "";
      const comp2 = cols.slice(1).join(" ").trim();

      const hasPass = Boolean(passValue);
      const comp1IsValid = isValidCompetitorName(comp1);
      const comp2IsValid = isValidCompetitorName(comp2);

      if (hasPass) {
        if (currentRow && currentRow.cavaleiro1 && currentRow.cavaleiro2) {
          competitors.push({ cavaleiro1: currentRow.cavaleiro1, cavaleiro2: currentRow.cavaleiro2 });
        }
        currentRow = {
          passValue,
          cavaleiro1: comp1IsValid ? comp1 : "",
          cavaleiro2: comp2IsValid ? comp2 : "",
        };
        continue;
      }

      if (!currentRow) continue;
      if (!comp1IsValid && !comp2IsValid) continue;
      if (currentRow.cavaleiro1 && currentRow.cavaleiro2) {
        continue;
      }

      const appendFragment = (target, fragment) => {
        if (!fragment || !fragment.trim()) return target;
        if (!target) return fragment.trim();
        return `${target} ${fragment.trim()}`;
      };

      if (!currentRow.cavaleiro1 && comp1IsValid) {
        currentRow.cavaleiro1 = comp1;
      }
      if (!currentRow.cavaleiro2 && comp2IsValid) {
        currentRow.cavaleiro2 = comp2;
      }
    }

    if (currentRow && currentRow.passValue && isValidCompetitorName(currentRow.cavaleiro1) && isValidCompetitorName(currentRow.cavaleiro2)) {
      competitors.push({ cavaleiro1: currentRow.cavaleiro1, cavaleiro2: currentRow.cavaleiro2 });
    }

    return competitors;
  }

  function normalizeCell(value) {
    return String(value ?? "").trim();
  }

  function normalizeHeader(value) {
    return normalizeCell(value).toLowerCase().replace(/\s+/g, " ");
  }

  function parseCompetidoresFromRows(rows) {
    if (!Array.isArray(rows) || !rows.length) return [];

    const normalizedRows = rows.map((row) => (Array.isArray(row) ? row.map(normalizeCell) : []));
    const headerIndex = normalizedRows.findIndex((row) => {
      const headers = row.map(normalizeHeader);
      return (
        headers.filter((cell) => /(competidor|campetidor|cavaleiro|competitor)/i.test(cell)).length >= 2 ||
        headers.some((cell) => /\bpassada\b/i.test(cell) || /\bpass\b/i.test(cell))
      );
    });

    if (headerIndex < 0) return [];

    const headerCells = normalizedRows[headerIndex].map(normalizeHeader);
    const passIndex = headerCells.findIndex((cell) => /\bpassada\b/i.test(cell) || /\bpass\b/i.test(cell));
    const competitorIndexes = headerCells
      .map((cell, index) => (/(competidor|campetidor|cavaleiro|competitor)/i.test(cell) ? index : -1))
      .filter((index) => index >= 0)
      .slice(0, 2);

    if (competitorIndexes.length < 2) {
      // fallback: take first two non-empty columns if header row is not sufficiently labeled
      const nonEmptyIndexes = headerCells.map((cell, index) => (cell ? index : -1)).filter((index) => index >= 0);
      if (nonEmptyIndexes.length >= 2) {
        competitorIndexes.push(nonEmptyIndexes[0], nonEmptyIndexes[1]);
      }
    }

    if (competitorIndexes.length < 2) return [];

    const competitors = [];
    for (let i = headerIndex + 1; i < normalizedRows.length; i += 1) {
      const row = normalizedRows[i];
      if (!row || row.every((item) => !item)) continue;

      const cavaleiro1 = normalizeCell(row[competitorIndexes[0]] ?? "");
      const cavaleiro2 = normalizeCell(row[competitorIndexes[1]] ?? "");
      if (!isValidCompetitorName(cavaleiro1) || !isValidCompetitorName(cavaleiro2)) continue;

      if (passIndex >= 0) {
        const passValue = String(row[passIndex] ?? "").trim();
        if (!/^\d+$/.test(passValue)) continue;
      }

      competitors.push({ cavaleiro1, cavaleiro2 });
    }

    return dedupeCompetidores(competitors);
  }

  function parseCompetidoresTexto(text) {
    const linhas = String(text)
      .split(/\r?\n/)
      .map((linha) => linha.trim())
      .filter((linha) => linha.length > 0 && !/^page\s*\d+$/i.test(linha));

    if (!linhas.length) return [];

    const rows = linhas.map(splitLineColumns).filter((cols) => cols.length > 0);
    const parsedFromRows = parseCompetidoresFromRows(rows);
    if (parsedFromRows.length > 0) {
      return parsedFromRows;
    }

    return parseCompetidoresTextoFromLines(linhas);
  }

  function parseCompetidoresTextoFromLines(linhas) {
    const headerIndex = linhas.findIndex((linha) => /passada|competidor 1|competidor 2|competidor|cavaleiro 1|cavaleiro 2|cavaleiro/i.test(linha));
    if (headerIndex < 0) return [];

    const headerLine = linhas[headerIndex];
    const headerCols = splitLineColumns(headerLine);
    const passIndex = headerCols.findIndex((valor) => /passada/i.test(valor));
    const competitorIndexes = headerCols
      .map((valor, index) => (/competidor|cavaleiro/i.test(valor) ? index : -1))
      .filter((index) => index >= 0)
      .slice(0, 2);

    if (passIndex < 0 || competitorIndexes.length !== 2) return [];

    const rows = [];
    let currentRow = null;

    const pushCurrentRow = () => {
      if (!currentRow) return;
      if (
        currentRow.passValue &&
        isValidCompetitorName(currentRow.cavaleiro1) &&
        isValidCompetitorName(currentRow.cavaleiro2)
      ) {
        rows.push({ cavaleiro1: currentRow.cavaleiro1, cavaleiro2: currentRow.cavaleiro2 });
      }
      currentRow = null;
    };

    const appendFragment = (target, fragment) => {
      if (!fragment || !fragment.trim()) return target;
      if (!target) return fragment.trim();
      return `${target} ${fragment.trim()}`;
    };

    for (let i = headerIndex + 1; i < linhas.length; i += 1) {
      const linha = linhas[i];
      const cols = splitLineColumns(linha);
      const passValue = cols[passIndex] && /^\d+$/.test(cols[passIndex]) ? cols[passIndex] : "";

      if (passValue) {
        pushCurrentRow();
        currentRow = { passValue, cavaleiro1: "", cavaleiro2: "" };
        const cav1 = cols[competitorIndexes[0]] || "";
        const cav2 = cols[competitorIndexes[1]] || "";
        if (isValidCompetidorName(cav1)) currentRow.cavaleiro1 = cav1;
        if (isValidCompetidorName(cav2)) currentRow.cavaleiro2 = cav2;
        continue;
      }

      if (!currentRow) continue;

      if (cols.length === 1) {
        const fragment = cols[0];
        if (!currentRow.cavaleiro2) {
          currentRow.cavaleiro2 = appendFragment(currentRow.cavaleiro2, fragment);
        } else if (!currentRow.cavaleiro1) {
          currentRow.cavaleiro1 = appendFragment(currentRow.cavaleiro1, fragment);
        }
        continue;
      }

      if (cols.length >= 2) {
        const maybeFirst = cols[0];
        const maybeSecond = cols[1];
        if (!currentRow.cavaleiro1 && isValidCompetidorName(maybeFirst)) {
          currentRow.cavaleiro1 = appendFragment(currentRow.cavaleiro1, maybeFirst);
        }
        if (!currentRow.cavaleiro2 && isValidCompetidorName(maybeSecond)) {
          currentRow.cavaleiro2 = appendFragment(currentRow.cavaleiro2, maybeSecond);
        }
      }
    }

    pushCurrentRow();
    return rows;
  }

  function dedupeCompetidores(competitors) {
    const seen = new Set();
    return competitors.filter(({ cavaleiro1, cavaleiro2 }) => {
      const chave = `${String(cavaleiro1).trim().toLowerCase()}|${String(cavaleiro2).trim().toLowerCase()}`;
      if (seen.has(chave)) return false;
      seen.add(chave);
      return true;
    });
  }

  function parseCompetidoresPdf(contents) {
    if (!Array.isArray(contents)) return [];
    const competitors = [];
    for (const content of contents) {
      const lines = groupPdfLines(content);
      competitors.push(...extractCompetitorsFromPdfLines(lines));
    }

    const deduped = dedupeCompetidores(competitors);
    if (deduped.length > 0) return deduped;

    const texto = contents.flatMap((content) => extrairLinhasDoPdf(content)).join("\n");
    return dedupeCompetidores(parseCompetidoresTexto(texto));
  }

  function parseCompetidoresExcel(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" });
    return parseCompetidoresFromRows(rows);
  }

  async function extrairConteudoPdf(arquivo) {
    const arrayBuffer = await arquivo.arrayBuffer();
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content);
    }
    return pages;
  }

  function extrairLinhasDoPdf(content) {
    const items = content.items
      .map((item) => {
        const transform = item.transform || [];
        return {
          str: item.str || "",
          x: transform[4] || 0,
          y: transform[5] || 0,
        };
      })
      .filter((item) => item.str.trim().length > 0);

    const linhas = [];
    items.sort((a, b) => b.y - a.y || a.x - b.x).forEach((item) => {
      const linhaExistente = linhas.find((linha) => Math.abs(linha.y - item.y) < 4);
      if (linhaExistente) {
        linhaExistente.items.push(item);
      } else {
        linhas.push({ y: item.y, items: [item] });
      }
    });

    return linhas
      .sort((a, b) => b.y - a.y)
      .map((linha) => {
        const row = linha.items.sort((a, b) => a.x - b.x);
        return row.reduce((texto, item, index) => {
          const anterior = row[index - 1];
          if (!anterior) return item.str;
          const espaco = item.x - anterior.x > Math.max(anterior.str.length * 4, 18) ? "\t" : " ";
          return `${texto}${espaco}${item.str}`;
        }, "");
      });
  }

  async function extrairTextoPdf(arquivo) {
    const arrayBuffer = await arquivo.arrayBuffer();
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let texto = "";
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const lines = extrairLinhasDoPdf(content);
      texto += `${lines.join("\n")}\n`;
    }
    return texto;
  }

  async function importarDuplasCsv(event) {
    const arquivo = event?.target?.files?.[0];
    if (!arquivo) return;
    event.target.value = "";

    if (!provaAtual) { toast("Cadastre ou selecione uma prova primeiro.", "erro"); return; }
    if (provaFinalizada) { toast("Prova finalizada. Nao e permitido alterar duplas.", "erro"); return; }
    const extensao = arquivo.name.toLowerCase().split(".").pop();
    if (!["csv", "pdf", "xlsx", "xls"].includes(extensao)) { toast("Selecione um arquivo CSV, PDF ou Excel.", "erro"); return; }

    try {
      setImportandoDuplasCsv(true);
      const competidores = extensao === "pdf"
        ? await parseCompetidoresPdf(await extrairConteudoPdf(arquivo))
        : ["xlsx", "xls"].includes(extensao)
          ? parseCompetidoresExcel(await arquivo.arrayBuffer())
          : parseCompetidoresTexto(await arquivo.text());
      if (!competidores.length) {
        toast("Arquivo vazio ou formato invalido. Use duas colunas com os nomes dos competidores.", "erro");
        return;
      }

      const ordemBase = duplas.reduce((max, dp) => Math.max(max, dp.ordem || 0), 0);
      for (let i = 0; i < competidores.length; i += 1) {
        const { cavaleiro1, cavaleiro2 } = competidores[i];
        await createDupla({
          provaId: provaAtual.id,
          ordem: ordemBase + i + 1,
          cavaleiro1,
          cavalo1: "",
          cavaleiro2,
          cavalo2: "",
          status: "PENDENTE",
          bois: null,
          tempo: null,
        });
      }
      await carregarDados(provaAtual.id);
      toast(`${competidores.length} dupla(s) importadas com sucesso!`);
    } catch (error) {
      toast(error?.message || "Nao foi possivel importar as duplas.", "erro");
    } finally {
      setImportandoDuplasCsv(false);
    }
  }

  // ─── Dupla CRUD ────────────────────────────────────────────────────────────

  const provaAtual = provas.find((prova) => prova.id === provaAtualId) ?? null;
  const duplas = provaAtual?.duplas ?? [];
  const provaFinalizada = Boolean(provaAtual?.finalizada);

  // ─── Derivados ─────────────────────────────────────────────────────────────
  const ranking = gerarRanking(duplas);
  const semResultado = duplas.filter((d) => !duplaConcluida(d));
  const comResultado = duplas.filter((d) => duplaConcluida(d));
  const proximaDupla = duplas.find((d) => !duplaConcluida(d)) ?? null;
  const medalhas = ["🥇", "🥈", "🥉"];
  const fmt = (t) => (t == null ? "—" : t.toFixed(3) + "s");
  const cavalosPremiadosDaProva = listarCavalosPremiados(provaAtual);
  const rankingCavalosDaProva = gerarRankingCavalos(provas, { provaId: provaAtualId });
  const rankingCavalosGeral = gerarRankingCavalos(provas, { apenasFinalizadas: true });
  const rankingCompleto = gerarListaRankingCompleta(duplas);

  async function cadastrarDupla() {
    if (!provaAtual) { toast("Cadastre ou selecione uma prova primeiro.", "erro"); return; }
    if (provaFinalizada) { toast("Prova finalizada. Nao e permitido alterar duplas.", "erro"); return; }
    const { cavaleiro1, cavalo1, cavaleiro2, cavalo2 } = form;
    if (!cavaleiro1 || !cavaleiro2) { toast("Informe os dois competidores.", "erro"); return; }
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
    } catch (error) { toast(error.message || "Nao foi possivel salvar a dupla.", "erro"); }
  }

  async function moverDupla(id, direction) {
    if (!provaAtual) { toast("Cadastre ou selecione uma prova primeiro.", "erro"); return; }
    if (provaFinalizada) { toast("Prova finalizada. Nao e permitido alterar a ordem.", "erro"); return; }
    const index = duplas.findIndex((dp) => dp.id === id);
    if (index < 0) return;
    const targetIndex = direction === -1 ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= duplas.length) return;

    const current = duplas[index];
    const target = duplas[targetIndex];
    const currentOrder = current.ordem != null ? current.ordem : index + 1;
    const targetOrder = target.ordem != null ? target.ordem : targetIndex + 1;

    try {
      const tempOrder = Math.max(currentOrder, targetOrder) + 1000;
      await updateDuplaOrdem(target.id, tempOrder);
      await updateDuplaOrdem(current.id, targetOrder);
      await updateDuplaOrdem(target.id, currentOrder);
      await carregarDados(provaAtual.id);
      toast("Ordem da dupla atualizada!");
    } catch (error) {
      toast(error.message || "Nao foi possivel alterar a ordem da dupla.", "erro");
    }
  }

  function editarDupla(dp) {
    if (provaFinalizada) { toast("Prova finalizada. Nao e permitido alterar duplas.", "erro"); return; }
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
    if (provaFinalizada) { toast("Prova finalizada. Nao e permitido alterar resultados.", "erro"); return; }
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
    if (provaFinalizada) { toast("Prova finalizada. Nao e permitido alterar resultados.", "erro"); return; }
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

  return {
    sessao, authCarregando, authProcessando, authErro, authInfo,
    carregando, erroConexao, provas, provaAtualId, setProvaAtualId,
    form, setForm, resultadoForm, setResultadoForm, provaForm, setProvaForm,
    editandoId, setEditandoId, editandoResultadoId, setEditandoResultadoId, editandoProvaId,
    carregarDados,
    handleSignIn, handleSignUp, handleSignOut,
    resetarFormProva, salvarProva, editarProva, selecionarProva, removerProva, finalizarProva,
    cadastrarDupla, editarDupla, cancelarEdicao, removerDupla, moverDupla,
    salvarResultado, iniciarEdicaoResultado, cancelarEdicaoResultado, limparResultado,
    registrarSAT, finalizarDuplaAtual,
    exportarRankingProva, exportarResultadosExcel, copiarResultadoWhatsApp, imprimirCertificadoCavalo,
    provaAtual, duplas, ranking, semResultado, comResultado, proximaDupla,
    medalhas, fmt, provaFinalizada,
    cavalosPremiadosDaProva, rankingCavalosDaProva, rankingCavalosGeral, rankingCompleto,
    formatarData, formatarBois, duplaConcluida, duplaSat,
    importarDuplasCsv,
    gerarRanking, gerarListaRankingCompleta,
  };
}
