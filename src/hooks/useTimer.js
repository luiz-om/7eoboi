import { useEffect, useRef, useState } from "react";
import { LIVE_CHANNEL_NAME } from "../lib/ranchSortingUtils";

const TODOS_BOIS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function useTimer({ isTelaoWindow }) {
  const [tempoTelao, setTempoTelao] = useState("00.000");
  const [timerRodando, setTimerRodando] = useState(false);
  const [tempoInicial, setTempoInicial] = useState(null);
  const [boisTelao, setBoisTelao] = useState("");
  const [boisErro, setBoisErro] = useState(false);
  const canalTelaoRef = useRef(null);

  // Sorteio de bois
  const [boisDisponiveis, setBoisDisponiveis] = useState([...TODOS_BOIS]);
  const [boisUsados, setBoisUsados] = useState([]);
  const [boiAtual, setBoiAtual] = useState(null);
  const [contadorBois, setContadorBois] = useState(0);
  const [rodadaIniciada, setRodadaIniciada] = useState(false);
  const [parciais, setParciais] = useState([]);
  const tempoInicialBoiRef = useRef(null);
  const tempoTelaoRef = useRef("00.000");
  const tempoFinalFixadoRef = useRef(null);

  // Mantém a ref sempre atualizada com o valor do estado
  useEffect(() => { tempoTelaoRef.current = tempoTelao; }, [tempoTelao]);

  // Intervalo do cronômetro
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
        if (tempoFinalFixadoRef.current !== null) return tempoFinalFixadoRef.current;
        const agora = Date.now();
        const totalMs = Math.floor(agora - (tempoInicial || agora));
        const seg = Math.floor(totalMs / 1000);
        const ms = totalMs % 1000;
        return `${String(seg).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
      });
    }, 10);
    return () => clearInterval(interval);
  }, [isTelaoWindow, timerRodando, tempoInicial]);

  // BroadcastChannel — receptor (telão) e emissor (controle)
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return undefined;
    const canal = new BroadcastChannel(LIVE_CHANNEL_NAME);
    canalTelaoRef.current = canal;
    canal.onmessage = (event) => {
      if (event.data?.type !== "timer-sync") return;
      if (typeof event.data.tempo === "string") setTempoTelao(event.data.tempo);
      if (typeof event.data.timerRodando === "boolean") setTimerRodando(event.data.timerRodando);
      if (typeof event.data.boiAtual === "number" || event.data.boiAtual === null) setBoiAtual(event.data.boiAtual);
      if (typeof event.data.contadorBois === "number") setContadorBois(event.data.contadorBois);
      if (typeof event.data.boisTelao === "string") setBoisTelao(event.data.boisTelao);
    };
    return () => { canal.close(); canalTelaoRef.current = null; };
  }, []);

  useEffect(() => {
    if (isTelaoWindow || !canalTelaoRef.current) return;
    canalTelaoRef.current.postMessage({
      type: "timer-sync",
      tempo: tempoTelao,
      timerRodando,
      boiAtual,
      contadorBois,
      boisTelao,
    });
  }, [isTelaoWindow, tempoTelao, timerRodando, boiAtual, contadorBois, boisTelao]);

  // ---- Lógica de Sorteio de Bois ----

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
    setBoisUsados(prev => [...prev, novoBoi]);
    setBoiAtual(novoBoi);
    setContadorBois(prev => prev + 1);
    tempoInicialBoiRef.current = Date.now();
  }

  function encerrarRodadaComBois(parciaisFinais) {
    const totalBois = parciaisFinais.length;
    const ultimoParcial = parciaisFinais[parciaisFinais.length - 1];
    const tempoFinalStr = ultimoParcial ? ultimoParcial.tempo : tempoTelaoRef.current;
    tempoFinalFixadoRef.current = tempoFinalStr;
    setTimerRodando(false);
    setRodadaIniciada(false);
    setTempoTelao(tempoFinalStr);
    setBoisTelao(String(totalBois));
    setTimeout(() => { tempoFinalFixadoRef.current = null; }, 100);
  }

  // Gatekeeper de 60s
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
