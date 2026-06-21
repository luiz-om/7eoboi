import { memo, useEffect, useState } from "react";
import ArenaScreenTiraBoi from "./ArenaScreenTiraBoi";
import { useTelaoFullscreen } from "./hooks/useTelaoFullscreen";

export default function ArenaScreen(props) {
  const { precisaClique, entrarFullscreen } = useTelaoFullscreen(true);

  if (props.isTiraBoi) {
    return (
      <ArenaScreenTiraBoi
        {...props}
        precisaClique={precisaClique}
        entrarFullscreen={entrarFullscreen}
      />
    );
  }
  return (
    <ArenaScreenPadrao
      {...props}
      precisaClique={precisaClique}
      entrarFullscreen={entrarFullscreen}
    />
  );
}

function BoiStrip({ rodadaIniciada, boiAtual, boisUsados, parciais, timerRodando, tempo }) {
  if (!rodadaIniciada && !(parciais?.length > 0)) return null;

  const primeiroBoi = boisUsados?.[0] ?? boiAtual;
  if (primeiroBoi == null) return null;

  const seq = Array.from({ length: 10 }, (_, i) => (primeiroBoi + i) % 10);

  return (
    <div className="arena-boi-strip">
      <div className="arena-boi-strip-label">Ordem dos bois</div>
      <div className="arena-boi-strip-row">
        {seq.map((b) => {
          const usado = boisUsados?.includes(b) && b !== boiAtual;
          const atual = b === boiAtual;
          const parcial = parciais?.find((p) => p.boi === b);
          return (
            <div key={b} className="arena-boi-cell-wrap">
              <span className={`arena-boi-cell${atual ? " atual" : ""}${usado ? " usado" : ""}`}>{b}</span>
              {parcial ? (
                <span className="arena-boi-parcial">{parcial.tempo}</span>
              ) : atual && timerRodando ? (
                <span className="arena-boi-parcial live">{tempo}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ArenaScreenPadrao = memo(function ArenaScreenPadrao({
  duplas,
  ranking,
  tempo,
  timerRodando = false,
  nomeProva = "Ranch Sorting",
  provaFinalizada = false,
  boiAtual = null,
  contadorBois = 0,
  tempoFinalizado = false,
  boisFinalizados = 0,
  rodadaIniciada = false,
  parciais = [],
  boisUsados = [],
  precisaClique = false,
  entrarFullscreen,
}) {
  const [animacoes, setAnimacoes] = useState(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimacoes(new Set(ranking.slice(0, 10).map((_, i) => i)));
    }, 100);
    return () => clearTimeout(timer);
  }, [ranking]);

  const proximaDupla = duplas.find((d) => d.status === "PENDENTE");
  const pendentes = duplas.filter((d) => d.status === "PENDENTE");
  const proximaDupla2 = pendentes[1] ?? null;
  const top10 = ranking.slice(0, 10);
  const medalhas = ["🥇", "🥈", "🥉"];
  const temPendentes = duplas.some((d) => d.status === "PENDENTE");
  const provaEncerrada = provaFinalizada || !temPendentes;
  const fmt = (t) => (t == null ? "—" : `${t.toFixed(3)}s`);
  const mostraBoi = boiAtual !== null || tempoFinalizado;

  return (
    <div className="arena-screen">
      <header className="arena-header">
        <div className="arena-title">🐄 Ranch Sorting 🐴</div>
        <div className="arena-subtitle">{nomeProva}</div>
      </header>

      {provaEncerrada && top10.length > 0 ? (
        <div className="arena-final-screen">
          <div className="arena-final-title">🏆 RESULTADO FINAL 🏆</div>
          <div className="arena-final-grid">
            {top10.map((dp, i) => (
              <div
                key={dp.id}
                className={`arena-final-row${i < 3 ? " arena-final-podium" : ""} ${animacoes.has(i) ? "arena-rank-animated" : ""}`}
                style={{ animationDelay: animacoes.has(i) ? `${i * 0.08}s` : "0s" }}
              >
                <div className="arena-final-pos">{i < 3 ? medalhas[i] : i + 1}</div>
                <div className="arena-final-info">
                  <div className="arena-final-name" title={`${dp.cavaleiro1} & ${dp.cavaleiro2}`}>
                    {dp.cavaleiro1} & {dp.cavaleiro2}
                  </div>
                  <div className="arena-final-horses" title={`${dp.cavalo1} • ${dp.cavalo2}`}>
                    🐴 {dp.cavalo1} • {dp.cavalo2}
                  </div>
                </div>
                <div className="arena-final-stats">
                  <div className="arena-final-bois">{dp.bois} 🐄</div>
                  <div className="arena-final-time">{fmt(dp.tempo)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="arena-body">
          <section className="arena-stage">
            <div className="arena-timer-block">
              <div className="arena-timer-row">
                <div className={`arena-timer${timerRodando ? " running" : tempoFinalizado ? " done" : ""}`}>
                  {tempo}
                </div>
                {mostraBoi ? (
                  <div className={`arena-boi-box${tempoFinalizado ? " done" : ""}`}>
                    <div className="arena-boi-box-label">
                      {tempoFinalizado ? "Total" : "Boi"}
                    </div>
                    <div className="arena-boi-box-num">
                      {tempoFinalizado ? boisFinalizados : boiAtual}
                    </div>
                    {!tempoFinalizado && contadorBois > 0 ? (
                      <div className="arena-boi-box-count">{contadorBois}/10</div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="arena-timer-label">
                {timerRodando ? (
                  <span className="arena-live">● AO VIVO</span>
                ) : tempoFinalizado ? (
                  <span className="arena-done">✔ TEMPO FINAL · {boisFinalizados} {boisFinalizados === 1 ? "BOI" : "BOIS"}</span>
                ) : (
                  "AGUARDANDO INÍCIO"
                )}
              </div>
            </div>

            {temPendentes && proximaDupla ? (
              <div className="arena-pairs">
                <div className="arena-pair current">
                  <div className="arena-pair-label">🐴 Dupla Atual</div>
                  <div className="arena-pair-riders" title={`${proximaDupla.cavaleiro1} & ${proximaDupla.cavaleiro2}`}>
                    {proximaDupla.cavaleiro1} <span>&</span> {proximaDupla.cavaleiro2}
                  </div>
                  <div className="arena-pair-horses" title={`${proximaDupla.cavalo1} • ${proximaDupla.cavalo2}`}>
                    🐴 {proximaDupla.cavalo1} • {proximaDupla.cavalo2}
                  </div>
                </div>
                {pendentes.length > 1 ? (
                  <div className="arena-pair next">
                    <div className="arena-pair-label">➡️ Próxima</div>
                    <div className="arena-pair-riders" title={`${proximaDupla2?.cavaleiro1} & ${proximaDupla2?.cavaleiro2}`}>
                      {proximaDupla2?.cavaleiro1} <span>&</span> {proximaDupla2?.cavaleiro2}
                    </div>
                    <div className="arena-pair-horses" title={`${proximaDupla2?.cavalo1} · ${proximaDupla2?.cavalo2}`}>
                      🐴 {proximaDupla2?.cavalo1} · {proximaDupla2?.cavalo2}
                    </div>
                  </div>
                ) : (
                  <div className="arena-pair next empty">
                    <div className="arena-pair-label">Última dupla</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="arena-pair current solo">
                <div className="arena-pair-label">⏳ Aguardando</div>
                <div className="arena-wait-msg">Aguardando início da prova.</div>
              </div>
            )}

            <BoiStrip
              rodadaIniciada={rodadaIniciada}
              boiAtual={boiAtual}
              boisUsados={boisUsados}
              parciais={parciais}
              timerRodando={timerRodando}
              tempo={tempo}
            />
          </section>

          <aside className="arena-ranking">
            <div className="arena-ranking-head">🏆 Top 10</div>
            <div className="arena-ranking-list">
              {top10.length === 0 ? (
                <div className="arena-ranking-empty">Nenhum resultado ainda</div>
              ) : (
                top10.map((dp, i) => (
                  <div
                    key={dp.id}
                    className={`arena-rank-row ${animacoes.has(i) ? "arena-rank-animated" : ""}`}
                    style={{ animationDelay: animacoes.has(i) ? `${i * 0.06}s` : "0s" }}
                  >
                    <div className="arena-rank-pos">{i < 3 ? medalhas[i] : i + 1}</div>
                    <div className="arena-rank-info">
                      <div className="arena-rank-name" title={`${dp.cavaleiro1} & ${dp.cavaleiro2}`}>
                        {dp.cavaleiro1} & {dp.cavaleiro2}
                      </div>
                      <div className="arena-rank-horses" title={`${dp.cavalo1} • ${dp.cavalo2}`}>
                        🐴 {dp.cavalo1} • {dp.cavalo2}
                      </div>
                    </div>
                    <div className="arena-rank-stats">
                      <div className="arena-rank-bois">{dp.bois} 🐄</div>
                      <div className="arena-rank-time">{fmt(dp.tempo)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {precisaClique ? (
        <button type="button" className="arena-fs-btn" onClick={entrarFullscreen}>
          ⛶ Clique para tela cheia
        </button>
      ) : null}

      <button type="button" onClick={() => window.close()} className="arena-exit-btn" title="Fechar telão">
        ✕
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700;800&display=swap');

        .arena-screen {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          background: #070707;
          color: #E8E8E8;
          font-family: 'Oswald', sans-serif;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9999;
        }

        .arena-header {
          flex-shrink: 0;
          text-align: center;
          padding: clamp(6px, 1.2vh, 14px) clamp(12px, 2vw, 24px);
          background: linear-gradient(180deg, #161616 0%, #0a0a0a 100%);
          border-bottom: 3px solid #F4C542;
        }
        .arena-title {
          font-size: clamp(18px, 3.2vw, 48px);
          font-weight: 700;
          color: #F4C542;
          letter-spacing: clamp(1px, 0.4vw, 4px);
          text-transform: uppercase;
          line-height: 1.05;
        }
        .arena-subtitle {
          font-size: clamp(10px, 1.4vw, 20px);
          color: #C98A2E;
          letter-spacing: clamp(1px, 0.25vw, 3px);
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 2px;
        }

        .arena-body {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr auto;
        }
        @media (min-width: 1100px) {
          .arena-body {
            grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
            grid-template-rows: 1fr;
          }
        }

        .arena-stage {
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(8px, 1.5vh, 20px);
          padding: clamp(8px, 1.5vh, 20px) clamp(12px, 2.5vw, 36px);
        }

        .arena-timer-block { text-align: center; flex-shrink: 0; }
        .arena-timer-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(12px, 2.5vw, 40px);
          flex-wrap: wrap;
        }
        .arena-timer {
          font-family: 'Courier New', monospace;
          font-size: clamp(52px, 11vw, 160px);
          font-weight: 800;
          color: #22C55E;
          letter-spacing: -3px;
          line-height: 1;
          text-shadow: 0 0 40px rgba(34,197,94,0.35);
        }
        .arena-timer.running {
          color: #EF4444;
          text-shadow: 0 0 50px rgba(239,68,68,0.45);
          animation: arenaPulse 1.2s ease-in-out infinite;
        }
        .arena-timer.done {
          color: #F4C542;
          text-shadow: 0 0 40px rgba(244,197,66,0.45);
        }
        .arena-boi-box {
          background: linear-gradient(160deg, #1A1000, #2A1800);
          border: 3px solid #F4C542;
          border-radius: clamp(10px, 1.2vw, 18px);
          padding: clamp(6px, 1vw, 14px) clamp(14px, 2vw, 32px);
          min-width: clamp(72px, 10vw, 140px);
          text-align: center;
          box-shadow: 0 0 30px rgba(244,197,66,0.2);
        }
        .arena-boi-box.done { animation: arenaPulse 1.4s ease-in-out infinite; }
        .arena-boi-box-label {
          font-size: clamp(9px, 1vw, 14px);
          color: #C98A2E;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .arena-boi-box-num {
          font-size: clamp(40px, 8vw, 110px);
          font-weight: 900;
          color: #F4C542;
          line-height: 0.95;
        }
        .arena-boi-box-count {
          font-size: clamp(10px, 1.1vw, 16px);
          color: #888;
          margin-top: 2px;
        }
        .arena-timer-label {
          margin-top: clamp(4px, 0.8vh, 10px);
          font-size: clamp(10px, 1.2vw, 18px);
          color: #666;
          letter-spacing: 3px;
          text-transform: uppercase;
        }
        .arena-live { color: #EF4444; font-weight: 700; }
        .arena-done { color: #F4C542; font-weight: 700; }

        .arena-pairs {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(8px, 1.2vh, 14px);
          min-width: 0;
        }
        @media (min-width: 700px) {
          .arena-pairs { grid-template-columns: 1.4fr 1fr; }
        }
        .arena-pair {
          border-radius: clamp(10px, 1vw, 16px);
          padding: clamp(10px, 1.4vh, 18px) clamp(12px, 1.8vw, 24px);
          min-width: 0;
        }
        .arena-pair.current {
          background: linear-gradient(135deg, #0F2F0F, #1A4A1A);
          border: 2px solid #22C55E;
          box-shadow: 0 0 30px rgba(34,197,94,0.15);
        }
        .arena-pair.next {
          background: linear-gradient(135deg, #1F1F0F, #2A2A15);
          border: 2px solid #C98A2E;
        }
        .arena-pair.next.empty {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #C98A2E;
          font-size: clamp(12px, 1.2vw, 16px);
        }
        .arena-pair.solo { text-align: center; }
        .arena-pair-label {
          font-size: clamp(10px, 1.1vw, 16px);
          font-weight: 700;
          color: #22C55E;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: clamp(4px, 0.8vh, 10px);
        }
        .arena-pair.next .arena-pair-label { color: #C98A2E; }
        .arena-pair-riders {
          font-size: clamp(16px, 2.2vw, 38px);
          font-weight: 700;
          color: #F5F5F5;
          line-height: 1.1;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .arena-pair.next .arena-pair-riders {
          font-size: clamp(14px, 1.6vw, 28px);
          color: #C98A2E;
        }
        .arena-pair-riders span { color: #666; margin: 0 0.25em; }
        .arena-pair-horses {
          margin-top: clamp(2px, 0.5vh, 6px);
          font-size: clamp(10px, 1.1vw, 18px);
          color: #888;
          overflow-wrap: anywhere;
        }
        .arena-wait-msg {
          margin-top: 6px;
          font-size: clamp(12px, 1.2vw, 16px);
          color: #22C55E;
        }

        .arena-boi-strip {
          flex-shrink: 0;
          background: #111;
          border: 1px solid #2A2A2A;
          border-radius: 12px;
          padding: clamp(8px, 1vh, 12px) clamp(10px, 1.5vw, 16px);
        }
        .arena-boi-strip-label {
          font-size: clamp(8px, 0.9vw, 11px);
          color: #555;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .arena-boi-strip-row {
          display: flex;
          flex-wrap: wrap;
          gap: clamp(4px, 0.8vw, 8px);
          justify-content: center;
        }
        .arena-boi-cell-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .arena-boi-cell {
          width: clamp(28px, 3.5vw, 44px);
          height: clamp(28px, 3.5vw, 44px);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(12px, 1.4vw, 18px);
          font-weight: 700;
          background: #1A1A1A;
          color: #444;
          border: 1px solid #333;
        }
        .arena-boi-cell.atual {
          background: #F4C542;
          color: #000;
          border-color: #F4C542;
          box-shadow: 0 0 16px rgba(244,197,66,0.45);
          transform: scale(1.08);
        }
        .arena-boi-cell.usado {
          background: #1A3A1A;
          color: #22C55E;
          border-color: #22C55E55;
        }
        .arena-boi-parcial {
          font-family: 'Courier New', monospace;
          font-size: clamp(8px, 0.85vw, 11px);
          color: #22C55E;
          font-weight: 700;
          white-space: nowrap;
        }
        .arena-boi-parcial.live { color: #EF4444; }

        .arena-ranking {
          min-height: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #101010, #080808);
          border-top: 3px solid #F4C542;
          padding: clamp(6px, 1vh, 12px) clamp(10px, 1.5vw, 20px);
        }
        @media (min-width: 1100px) {
          .arena-ranking {
            border-top: none;
            border-left: 3px solid #F4C542;
          }
        }
        .arena-ranking-head {
          flex-shrink: 0;
          text-align: center;
          font-size: clamp(11px, 1.3vw, 20px);
          font-weight: 700;
          color: #F4C542;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: clamp(4px, 0.6vh, 8px);
        }
        .arena-ranking-list {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: clamp(3px, 0.5vh, 6px);
        }
        .arena-ranking-empty {
          text-align: center;
          color: #555;
          padding: 16px;
          font-size: clamp(12px, 1.2vw, 16px);
        }
        .arena-rank-row {
          display: grid;
          grid-template-columns: clamp(28px, 4vw, 52px) minmax(0, 1fr) auto;
          gap: clamp(6px, 1vw, 12px);
          align-items: center;
          background: #151515;
          border: 1px solid #262626;
          border-radius: 10px;
          padding: clamp(5px, 0.7vh, 10px) clamp(8px, 1vw, 14px);
          opacity: 0;
          transform: translateX(-12px);
        }
        .arena-rank-animated { animation: arenaSlide 0.45s ease-out forwards; }
        .arena-rank-pos {
          font-size: clamp(16px, 1.8vw, 28px);
          font-weight: 700;
          color: #F4C542;
          text-align: center;
        }
        .arena-rank-info { min-width: 0; }
        .arena-rank-name {
          font-size: clamp(11px, 1.15vw, 18px);
          font-weight: 700;
          color: #F0F0F0;
          line-height: 1.15;
          overflow-wrap: anywhere;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .arena-rank-horses {
          font-size: clamp(9px, 0.85vw, 13px);
          color: #666;
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .arena-rank-stats { text-align: right; flex-shrink: 0; }
        .arena-rank-bois {
          font-size: clamp(14px, 1.5vw, 24px);
          font-weight: 800;
          color: #22C55E;
          line-height: 1;
        }
        .arena-rank-time {
          font-size: clamp(9px, 0.9vw, 13px);
          color: #777;
          margin-top: 2px;
        }

        .arena-final-screen {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          padding: clamp(10px, 2vh, 24px) clamp(12px, 2.5vw, 36px);
        }
        .arena-final-title {
          flex-shrink: 0;
          text-align: center;
          font-size: clamp(18px, 2.8vw, 44px);
          font-weight: 800;
          color: #F4C542;
          letter-spacing: 3px;
          margin-bottom: clamp(8px, 1.5vh, 16px);
        }
        .arena-final-grid {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr));
          gap: clamp(4px, 0.8vh, 8px);
          align-content: start;
        }
        .arena-final-row {
          display: grid;
          grid-template-columns: clamp(32px, 4vw, 56px) minmax(0, 1fr) auto;
          gap: clamp(6px, 1vw, 12px);
          align-items: center;
          background: #151515;
          border: 1px solid #2A2A2A;
          border-radius: 10px;
          padding: clamp(6px, 0.9vh, 12px) clamp(10px, 1.2vw, 16px);
          opacity: 0;
          transform: translateX(-12px);
        }
        .arena-final-podium {
          background: linear-gradient(135deg, #1A1400, #231C00);
          border-color: rgba(244,197,66,0.45);
        }
        .arena-final-pos {
          font-size: clamp(18px, 2vw, 32px);
          font-weight: 700;
          color: #F4C542;
          text-align: center;
        }
        .arena-final-name {
          font-size: clamp(13px, 1.4vw, 22px);
          font-weight: 700;
          overflow-wrap: anywhere;
        }
        .arena-final-horses {
          font-size: clamp(10px, 0.95vw, 14px);
          color: #666;
          margin-top: 2px;
        }
        .arena-final-bois {
          font-size: clamp(16px, 1.6vw, 26px);
          font-weight: 800;
          color: #22C55E;
          text-align: right;
        }
        .arena-final-time {
          font-size: clamp(10px, 0.9vw, 13px);
          color: #777;
          text-align: right;
        }

        .arena-fs-btn {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10001;
          background: rgba(244,197,66,0.95);
          color: #000;
          border: none;
          border-radius: 999px;
          padding: 12px 24px;
          font-family: 'Oswald', sans-serif;
          font-size: clamp(13px, 1.2vw, 16px);
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .arena-exit-btn {
          position: fixed;
          top: clamp(8px, 1.5vh, 16px);
          right: clamp(8px, 1.5vw, 16px);
          width: clamp(32px, 4vw, 44px);
          height: clamp(32px, 4vw, 44px);
          border-radius: 50%;
          border: none;
          background: rgba(239,68,68,0.85);
          color: #fff;
          font-size: clamp(14px, 1.5vw, 20px);
          cursor: pointer;
          z-index: 10000;
          opacity: 0.35;
          transition: opacity 0.2s;
        }
        .arena-exit-btn:hover { opacity: 1; }

        @keyframes arenaSlide { to { opacity: 1; transform: translateX(0); } }
        @keyframes arenaPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.75; } }

        @media (max-width: 1099px) {
          .arena-ranking {
            max-height: clamp(140px, 28dvh, 280px);
          }
        }
      `}</style>
    </div>
  );
});
