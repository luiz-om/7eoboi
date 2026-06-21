import { useCallback, useEffect, useRef, useState } from "react";
import { LIVE_CHANNEL_NAME } from "../lib/ranchSortingUtils";

const TODOS_BOIS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function msParaTempo(totalMs) {
  const clamped = Math.max(0, Math.floor(totalMs));
  const seg = Math.floor(clamped / 1000);
  const ms = clamped % 1000;
  return `${String(seg).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function buildSyncPayload({
  tempoTelao,
  timerRodando,
  tempoInicioMs,
  boiAtual,
  contadorBois,
  boisTelao,
  rodadaIniciada,
  parciais,
  boisUsados,
}) {
  return {
    type: "timer-sync",
    tempo: tempoTelao,
    timerRodando,
    tempoInicioMs: timerRodando && tempoInicioMs ? tempoInicioMs : null,
    boiAtual,
    contadorBois,
    boisTelao,
    rodadaIniciada,
    parciais,
    boisUsados,
  };
}

export function useTimer({ isTelaoWindow }) {
  const [tempoTelao, setTempoTelao] = useState("00.000");
  const [timerRodando, setTimerRodando] = useState(false);
  const [tempoInicial, setTempoInicial] = useState(null);
  const [boisTelao, setBoisTelao] = useState("");
  const [boisErro, setBoisErro] = useState(false);
  const canalTelaoRef = useRef(null);

  const [boisDisponiveis, setBoisDisponiveis] = useState([...TODOS_BOIS]);
  const [boisUsados, setBoisUsados] = useState([]);
  const [boiAtual, setBoiAtual] = useState(null);
  const [contadorBois, setContadorBois] = useState(0);
  const [rodadaIniciada, setRodadaIniciada] = useState(false);
  const [parciais, setParciais] = useState([]);
  const [tempoInicioMs, setTempoInicioMs] = useState(null);

  const tempoInicialBoiRef = useRef(null);
  const tempoTelaoRef = useRef("00.000");
  const tempoFinalFixadoRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => { tempoTelaoRef.current = tempoTelao; }, [tempoTelao]);

  stateRef.current = {
    tempoTelao,
    timerRodando,
    tempoInicioMs: tempoInicioMs ?? tempoInicial,
    boiAtual,
    contadorBois,
    boisTelao,
    rodadaIniciada,
    parciais,
    boisUsados,
  };

  const enviarSync = useCallback(() => {
    if (isTelaoWindow || !canalTelaoRef.current) return;
    canalTelaoRef.current.postMessage(buildSyncPayload(stateRef.current));
  }, [isTelaoWindow]);

  // Cronômetro no controle (janela principal)
  useEffect(() => {
    if (isTelaoWindow || !timerRodando) return;
    if (!tempoInicioMs) {
      const now = Date.now();
      setTempoInicioMs(now);
      setTempoInicial(now);
      return;
    }
    const interval = setInterval(() => {
      setTempoTelao(() => {
        if (tempoFinalFixadoRef.current !== null) return tempoFinalFixadoRef.current;
        return msParaTempo(Date.now() - tempoInicioMs);
      });
    }, 16);
    return () => clearInterval(interval);
  }, [isTelaoWindow, timerRodando, tempoInicioMs]);

  // Cronômetro no telão — calcula localmente a partir do timestamp recebido
  useEffect(() => {
    if (!isTelaoWindow || !timerRodando || !tempoInicioMs) return;
    const tick = () => setTempoTelao(msParaTempo(Date.now() - tempoInicioMs));
    tick();
    const interval = setInterval(tick, 16);
    return () => clearInterval(interval);
  }, [isTelaoWindow, timerRodando, tempoInicioMs]);

  // BroadcastChannel — controle emite, telão recebe
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return undefined;
    const canal = new BroadcastChannel(LIVE_CHANNEL_NAME);
    canalTelaoRef.current = canal;

    canal.onmessage = (event) => {
      if (event.data?.type === "telao-ready" && !isTelaoWindow) {
        enviarSync();
        return;
      }
      if (event.data?.type !== "timer-sync") return;

      if (typeof event.data.tempo === "string") setTempoTelao(event.data.tempo);
      if (typeof event.data.timerRodando === "boolean") setTimerRodando(event.data.timerRodando);
      if (typeof event.data.tempoInicioMs === "number" || event.data.tempoInicioMs === null) {
        setTempoInicioMs(event.data.tempoInicioMs);
      }
      if (typeof event.data.boiAtual === "number" || event.data.boiAtual === null) setBoiAtual(event.data.boiAtual);
      if (typeof event.data.contadorBois === "number") setContadorBois(event.data.contadorBois);
      if (typeof event.data.boisTelao === "string") setBoisTelao(event.data.boisTelao);
      if (typeof event.data.rodadaIniciada === "boolean") setRodadaIniciada(event.data.rodadaIniciada);
      if (Array.isArray(event.data.parciais)) setParciais(event.data.parciais);
      if (Array.isArray(event.data.boisUsados)) setBoisUsados(event.data.boisUsados);
    };

    if (isTelaoWindow) {
      canal.postMessage({ type: "telao-ready" });
    }

    return () => {
      canal.close();
      canalTelaoRef.current = null;
    };
  }, [isTelaoWindow, enviarSync]);

  // Emite estado sempre que algo muda (controle)
  useEffect(() => {
    enviarSync();
  }, [
    enviarSync,
    tempoTelao,
    timerRodando,
    tempoInicioMs,
    tempoInicial,
    boiAtual,
    contadorBois,
    boisTelao,
    rodadaIniciada,
    parciais,
    boisUsados,
  ]);

  // Heartbeat enquanto rodada ativa — garante sync mesmo com aba do controle em background
  useEffect(() => {
    if (isTelaoWindow || !rodadaIniciada) return;
    const interval = setInterval(enviarSync, 400);
    return () => clearInterval(interval);
  }, [isTelaoWindow, rodadaIniciada, enviarSync]);

  function sequenciaCircular(inicio) {
    const seq = [];
    for (let i = 0; i < 10; i++) seq.push((inicio + i) % 10);
    return seq;
  }

  function resetarRodada() {
    tempoFinalFixadoRef.current = null;
    setRodadaIniciada(false);
    setBoiAtual(null);
    setContadorBois(0);
    setBoisDisponiveis([...TODOS_BOIS]);
    setBoisUsados([]);
    setParciais([]);
    tempoInicialBoiRef.current = null;
    setTimerRodando(false);
    setTempoInicial(null);
    setTempoInicioMs(null);
    setTempoTelao("00.000");
    setBoisTelao("");
    setBoisErro(false);
  }

  function iniciarRodada() {
    const idx = Math.floor(Math.random() * 10);
    const boiInicial = TODOS_BOIS[idx];
    const seq = sequenciaCircular(boiInicial);
    setBoisDisponiveis(seq.slice(1));
    setBoisUsados([boiInicial]);
    setBoiAtual(boiInicial);
    setContadorBois(1);
    setParciais([]);
    setRodadaIniciada(true);
    tempoInicialBoiRef.current = Date.now();
    setTempoTelao("00.000");
    setTempoInicial(null);
    setTempoInicioMs(null);
    setTimerRodando(true);
  }

  function proximoBoi() {
    if (!rodadaIniciada) return;
    const tempoNesteClique = tempoTelaoRef.current;
    const novasParciais = [...parciais, { boi: boiAtual, tempo: tempoNesteClique }];
    setParciais(novasParciais);

    if (novasParciais.length >= 10 || boisDisponiveis.length === 0) {
      encerrarRodadaComBois(novasParciais);
      return;
    }
    const novoBoi = boisDisponiveis[0];
    const novaFila = boisDisponiveis.slice(1);
    setBoisDisponiveis(novaFila);
    setBoisUsados((prev) => [...prev, novoBoi]);
    setBoiAtual(novoBoi);
    setContadorBois((prev) => prev + 1);
    tempoInicialBoiRef.current = Date.now();
  }

  function encerrarRodadaComBois(parciaisFinais) {
    const totalBois = parciaisFinais.length;
    const ultimoParcial = parciaisFinais[parciaisFinais.length - 1];
    const tempoFinalStr = ultimoParcial ? ultimoParcial.tempo : tempoTelaoRef.current;
    tempoFinalFixadoRef.current = tempoFinalStr;
    setTimerRodando(false);
    setRodadaIniciada(false);
    setTempoInicial(null);
    setTempoInicioMs(null);
    setTempoTelao(tempoFinalStr);
    setBoisTelao(String(totalBois));
    setTimeout(() => { tempoFinalFixadoRef.current = null; }, 100);
  }

  useEffect(() => {
    if (!timerRodando || !rodadaIniciada) return;
    const [seg] = tempoTelao.split(".").map(Number);
    if ((seg || 0) >= 60) {
      encerrarRodadaComBois(parciais);
    }
  }, [tempoTelao, timerRodando, rodadaIniciada]);

  return {
    tempoTelao, setTempoTelao,
    timerRodando, setTimerRodando,
    tempoInicial, setTempoInicial,
    boisTelao, setBoisTelao,
    boisErro, setBoisErro,
    canalTelaoRef,
    boisDisponiveis,
    boisUsados,
    boiAtual,
    contadorBois,
    rodadaIniciada,
    parciais,
    tempoTelaoRef,
    TODOS_BOIS,
    sequenciaCircular,
    resetarRodada,
    iniciarRodada,
    proximoBoi,
    encerrarRodadaComBois,
  };
}
