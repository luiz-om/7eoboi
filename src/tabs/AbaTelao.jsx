import { useEffect, useMemo, useState } from "react";
import { Btn } from "../components/ui";

const ATALHO_STORAGE_KEY = "ranchsorting_atalho_tecla";

function labelFromCode(code) {
  if (!code) return "Espaco";
  if (code === "Space") return "Espaco";
  if (code === "Enter") return "Enter";
  if (code.startsWith("Key")) return code.replace("Key", "");
  if (code.startsWith("Digit")) return code.replace("Digit", "");
  return code;
}

export default function AbaTelao({
  provaAtual,
  duplas,
  comResultado,
  semResultado,
  proximaDupla,
  timerRodando,
  tempoTelao,
  boisTelao,
  boiAtual,
  contadorBois,
  rodadaIniciada,
  boisUsados,
  parciais,
  provaFinalizada,
  iniciarRodada,
  proximoBoi,
  resetarRodada,
  finalizarDuplaAtual,
  registrarSAT,
  abrirTelao,
}) {
  if (!provaAtual) return null;

  const [atalhoCode, setAtalhoCode] = useState("Space");
  const atalhoLabel = useMemo(() => labelFromCode(atalhoCode), [atalhoCode]);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(ATALHO_STORAGE_KEY);
      if (salvo) setAtalhoCode(salvo);
    } catch {
      // Sem persistencia disponivel
    }
  }, []);

  useEffect(() => {
    function isEditableTarget(target) {
      if (!target) return false;
      const tag = target.tagName?.toLowerCase?.();
      return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
    }

    function handleKeydown(event) {
      if (event.repeat) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;
      if (event.code !== atalhoCode) return;
      event.preventDefault();
      const bloqueioProximoBoi = !rodadaIniciada && !timerRodando && boisTelao !== "";
      if (!rodadaIniciada) {
        if (bloqueioProximoBoi) return;
        if (proximaDupla) iniciarRodada();
        return;
      }
      if (timerRodando) proximoBoi();
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [atalhoCode, iniciarRodada, proximaDupla, proximoBoi, rodadaIniciada, timerRodando]);

  function capturarAtalho(event) {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const code = event.code || "";
    if (!code) return;
    setAtalhoCode(code);
    try {
      window.localStorage.setItem(ATALHO_STORAGE_KEY, code);
    } catch {
      // Sem persistencia disponivel
    }
  }

  const tempoFinalizado = !timerRodando && tempoTelao !== "00.000" && parseInt(boisTelao) > 0;
  const bloqueioProximoBoi = !rodadaIniciada && !timerRodando && boisTelao !== "";
  const corTempo = timerRodando ? "#EF4444" : tempoFinalizado ? "#F4C542" : "#22C55E";
  const bordaCor = timerRodando ? "#EF4444" : tempoFinalizado ? "#F4C542" : "#2A2A2A";
  const label = timerRodando ? "● RODANDO" : tempoFinalizado ? `✔ TEMPO FINAL — ${boisTelao} BOIS` : "Aguardando";
  const labelCor = timerRodando ? "#EF4444" : tempoFinalizado ? "#F4C542" : "#555";

  return (
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
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>⏱️ CONTROLE DE PROVA</div>

        {/* Cronômetro + Boi Atual */}
        <div style={{ background: "#0B0B0B", borderRadius: "12px", padding: "20px 24px", textAlign: "center", marginBottom: "12px", border: `2px solid ${bordaCor}`, transition: "border-color 0.3s ease", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "64px", fontWeight: 800, color: corTempo, fontFamily: "'Courier New',monospace", letterSpacing: "-2px", lineHeight: 1 }}>{tempoTelao}</div>
            <div style={{ fontSize: "11px", color: labelCor, textTransform: "uppercase", letterSpacing: "1px", fontWeight: timerRodando || tempoFinalizado ? 700 : 400, marginTop: "6px" }}>{label}</div>
          </div>
          {(rodadaIniciada && boiAtual !== null) ? (
            <div style={{ background: "#1A1000", border: "2px solid #F4C542", borderRadius: "12px", padding: "10px 18px", textAlign: "center", minWidth: "80px" }}>
              <div style={{ fontSize: "11px", color: "#C98A2E", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Oswald',sans-serif", marginBottom: "4px" }}>BOI</div>
              <div style={{ fontSize: "44px", fontWeight: 900, color: "#F4C542", fontFamily: "'Oswald',sans-serif", lineHeight: 1 }}>{boiAtual}</div>
              <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>{contadorBois}/10</div>
            </div>
          ) : tempoFinalizado ? (
            <div style={{ background: "#2A1800", border: "2px solid #F4C542", borderRadius: "12px", padding: "10px 18px", textAlign: "center", minWidth: "80px" }}>
              <div style={{ fontSize: "11px", color: "#C98A2E", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Oswald',sans-serif", marginBottom: "4px" }}>BOIS</div>
              <div style={{ fontSize: "44px", fontWeight: 900, color: "#F4C542", fontFamily: "'Oswald',sans-serif", lineHeight: 1 }}>{boisTelao}</div>
            </div>
          ) : (
            <div style={{ background: "#111", border: "2px dashed #333", borderRadius: "12px", padding: "10px 18px", textAlign: "center", minWidth: "80px" }}>
              <div style={{ fontSize: "11px", color: "#444", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Oswald',sans-serif", marginBottom: "4px" }}>BOI</div>
              <div style={{ fontSize: "36px", color: "#333", fontFamily: "'Oswald',sans-serif", lineHeight: 1 }}>—</div>
            </div>
          )}
        </div>

        {/* Bois usados / progresso */}
        {rodadaIniciada && boiAtual !== null && (
          // Wrapper com ordem à esquerda e quadro vermelho à direita
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
            <div style={{ background: "#111", borderRadius: "8px", padding: "10px 12px", display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", flex: 1 }}>
              <span style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginRight: "4px" }}>Ordem:</span>
              {(() => {
                const primeiroBoiDaRodada = boisUsados[0] ?? boiAtual;
                const seq = Array.from({ length: 10 }, (_, i) => (primeiroBoiDaRodada + i) % 10);
                return seq.map((b, i) => {
                  const usado = boisUsados.includes(b) && b !== boiAtual;
                  const atual = b === boiAtual;
                  const parcial = parciais?.find(p => p.boi === b);
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                      <span style={{ width: "28px", height: "28px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, fontFamily: "'Oswald',sans-serif", background: atual ? "#F4C542" : usado ? "#1A3A1A" : "#1E1E1E", color: atual ? "#000" : usado ? "#22C55E" : "#333", border: atual ? "2px solid #F4C542" : usado ? "1px solid #22C55E44" : "1px solid #2A2A2A", transition: "all 0.2s" }}>{b}</span>
                      {parcial && (
                        <span style={{ fontSize: "8px", color: "#22C55E", fontFamily: "'Courier New',monospace", whiteSpace: "nowrap" }}>{parcial.tempo}</span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Quadro vermelho à direita: tempo do boi atual ao vivo */}
            <div style={{ minWidth: "120px", background: "transparent", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <div style={{ fontSize: "9px", color: "#EF444488", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Oswald',sans-serif" }}>TEMPO BOI</div>
              <div style={{ width: "120px", height: "44px", border: "2px solid #EF4444", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "#070707", boxShadow: timerRodando ? "0 0 10px rgba(239,68,68,0.3)" : "none" }}>
                <div style={{ fontFamily: "'Courier New',monospace", fontSize: "18px", color: "#EF4444", fontWeight: 700, letterSpacing: "-1px" }}>
                  {tempoTelao}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bois finalizados com tempos — exibido após rodada encerrar */}
        {!rodadaIniciada && parciais?.length > 0 && (
          <div style={{ background: "#111", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Tempos por boi:</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "flex-start" }}>
              {parciais.map((p, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, fontFamily: "'Oswald',sans-serif", background: "#1A3A1A", color: "#22C55E", border: "1px solid #22C55E44" }}>{p.boi}</span>
                  <span style={{ fontSize: "8px", color: "#22C55E", fontFamily: "'Courier New',monospace", whiteSpace: "nowrap" }}>{p.tempo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão principal: Iniciar / Próximo Boi */}
        <div style={{ marginBottom: "10px" }}>
          {!rodadaIniciada ? (
            <Btn
              variant="success"
              size="lg"
              full
              onClick={iniciarRodada}
              disabled={!proximaDupla || bloqueioProximoBoi}
              style={{ fontSize: "18px", letterSpacing: "2px", opacity: (!proximaDupla || bloqueioProximoBoi) ? 0.5 : 1, cursor: (!proximaDupla || bloqueioProximoBoi) ? "not-allowed" : "pointer" }}
            >
              ▶ INICIAR
            </Btn>
          ) : (
            <Btn
              variant="primary"
              size="lg"
              full
              onClick={proximoBoi}
              disabled={!timerRodando}
              style={{ fontSize: "18px", letterSpacing: "2px", background: "linear-gradient(135deg,#1D6FD1,#1050A0)", opacity: !timerRodando ? 0.5 : 1 }}
            >
              🐄 PRÓXIMO BOI ({contadorBois}/10)
            </Btn>
          )}
        </div>

        {/* Atalho de teclado */}
        <div style={{ background: "#111", borderRadius: "10px", padding: "12px", border: "1px solid #2A2A2A", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Oswald',sans-serif" }}>Atalho</div>
            <div style={{ fontSize: "13px", color: "#C98A2E", marginTop: "4px" }}>Pressione a tecla para configurar</div>
          </div>
          <input
            aria-label="Tecla de atalho"
            value={atalhoLabel}
            readOnly
            onKeyDown={capturarAtalho}
            onFocus={(e) => e.target.select()}
            style={{ minWidth: "120px", textAlign: "center", background: "#0B0B0B", color: "#F4C542", border: "1px solid #C98A2E55", borderRadius: "8px", padding: "10px 12px", fontFamily: "'Oswald',sans-serif", fontSize: "14px", letterSpacing: "1px", outline: "none" }}
          />
        </div>

        {/* Ações finais */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <Btn variant="success" size="lg" full onClick={abrirTelao} style={{ fontSize: "13px" }}>🪟 Telão</Btn>
          <Btn variant="amber" size="lg" full onClick={finalizarDuplaAtual} disabled={!rodadaIniciada && boisTelao === ""} style={{ fontSize: "13px", opacity: (!rodadaIniciada && boisTelao === "") ? 0.5 : 1 }}>✅ Finalizar</Btn>
          <Btn variant="danger" size="lg" full onClick={registrarSAT} disabled={!timerRodando && tempoTelao === "00.000"} style={{ fontSize: "13px", opacity: (!timerRodando && tempoTelao === "00.000") ? 0.5 : 1 }}>SAT</Btn>
        </div>

        {/* Reset manual */}
        {(rodadaIniciada || tempoFinalizado) && (
          <Btn variant="ghost" size="md" full onClick={resetarRodada} style={{ fontSize: "12px", color: "#EF4444", borderColor: "#EF444430" }}>
            ↺ Resetar Rodada
          </Btn>
        )}
      </div>

      <div style={{ background: "#0F1F0F", border: "1px solid #22C55E33", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
        <div style={{ fontSize: "12px", color: "#22C55E", lineHeight: 1.6 }}>
          💡 <strong>Dica:</strong> Clique em "Iniciar" para sortear o primeiro boi e disparar o cronômetro. Clique em "Próximo Boi" a cada boi passado. O resultado é salvo ao clicar em "Finalizar". Atalho atual: <strong>{atalhoLabel}</strong>.
        </div>
      </div>
    </div>
  );
}
