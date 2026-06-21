import { memo, useEffect, useState } from "react";

const ArenaScreenTiraBoi = memo(function ArenaScreenTiraBoi({
  duplas,
  ranking,
  tempo,
  timerRodando = false,
  nomeProva = "Tira Boi",
  provaFinalizada = false,
  tempoFinalizado = false,
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

  return (
    <div className="tb-screen">
      <header className="tb-header">
        <div className="tb-title">⏱️ Tira Boi</div>
        <div className="tb-subtitle">{nomeProva}</div>
      </header>

      {provaEncerrada && top10.length > 0 ? (
        <div className="tb-final">
          <div className="tb-final-title">🏆 RESULTADO FINAL 🏆</div>
          <div className="tb-final-grid">
            {top10.map((dp, i) => (
              <div
                key={dp.id}
                className={`tb-final-row${i < 3 ? " tb-final-podium" : ""} ${animacoes.has(i) ? "tb-animate" : ""}`}
                style={{ animationDelay: animacoes.has(i) ? `${i * 0.08}s` : "0s" }}
              >
                <div className="tb-pos">{i < 3 ? medalhas[i] : i + 1}</div>
                <div className="tb-names" title={`${dp.cavaleiro1} & ${dp.cavaleiro2}`}>
                  {dp.cavaleiro1} & {dp.cavaleiro2}
                </div>
                <div className="tb-time">{fmt(dp.tempo)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="tb-body">
          <section className="tb-stage">
            <div className="tb-timer-block">
              <div className={`tb-timer${timerRodando ? " live" : tempoFinalizado ? " done" : ""}`}>
                {tempo}
              </div>
              <div className="tb-timer-label">
                {timerRodando ? (
                  <span className="tb-live">● AO VIVO</span>
                ) : tempoFinalizado ? (
                  <span className="tb-done">✔ TEMPO FINAL</span>
                ) : (
                  "AGUARDANDO INÍCIO"
                )}
              </div>
            </div>

            {temPendentes && proximaDupla ? (
              <div className="tb-pairs">
                <div className="tb-pair current">
                  <div className="tb-pair-label">🤠 Dupla Atual</div>
                  <div className="tb-pair-names" title={`${proximaDupla.cavaleiro1} & ${proximaDupla.cavaleiro2}`}>
                    {proximaDupla.cavaleiro1} <span>&</span> {proximaDupla.cavaleiro2}
                  </div>
                </div>
                {pendentes.length > 1 ? (
                  <div className="tb-pair next">
                    <div className="tb-pair-label">➡️ Próxima</div>
                    <div className="tb-pair-names" title={`${proximaDupla2?.cavaleiro1} & ${proximaDupla2?.cavaleiro2}`}>
                      {proximaDupla2?.cavaleiro1} <span>&</span> {proximaDupla2?.cavaleiro2}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="tb-pair current solo">
                <div className="tb-pair-label">⏳ Aguardando</div>
              </div>
            )}
          </section>

          <aside className="tb-ranking">
            <div className="tb-ranking-head">🏆 Top 10</div>
            <div className="tb-ranking-list">
              {top10.length === 0 ? (
                <div className="tb-empty">Nenhum resultado ainda</div>
              ) : (
                top10.map((dp, i) => (
                  <div
                    key={dp.id}
                    className={`tb-rank-row ${animacoes.has(i) ? "tb-animate" : ""}`}
                    style={{ animationDelay: animacoes.has(i) ? `${i * 0.06}s` : "0s" }}
                  >
                    <div className="tb-pos">{i < 3 ? medalhas[i] : i + 1}</div>
                    <div className="tb-names" title={`${dp.cavaleiro1} & ${dp.cavaleiro2}`}>
                      {dp.cavaleiro1} & {dp.cavaleiro2}
                    </div>
                    <div className="tb-time">{fmt(dp.tempo)}</div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {precisaClique ? (
        <button type="button" className="tb-fs-btn" onClick={entrarFullscreen}>
          ⛶ Clique para tela cheia
        </button>
      ) : null}

      <button type="button" onClick={() => window.close()} className="tb-exit" title="Fechar telão">
        ✕
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700;800&display=swap');
        .tb-screen {
          position: fixed; inset: 0;
          width: 100vw; height: 100dvh;
          background: #070707; color: #E8E8E8;
          font-family: 'Oswald', sans-serif;
          display: flex; flex-direction: column;
          overflow: hidden; z-index: 9999;
        }
        .tb-header {
          flex-shrink: 0;
          text-align: center;
          padding: clamp(6px, 1.2vh, 14px) clamp(12px, 2vw, 24px);
          background: linear-gradient(180deg, #101820, #0a0a0a);
          border-bottom: 3px solid #22C55E;
        }
        .tb-title {
          font-size: clamp(18px, 3.2vw, 48px);
          font-weight: 700; color: #22C55E;
          letter-spacing: clamp(1px, 0.4vw, 4px);
          text-transform: uppercase;
        }
        .tb-subtitle {
          font-size: clamp(10px, 1.4vw, 20px);
          color: #8BC4A0;
          letter-spacing: clamp(1px, 0.25vw, 3px);
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 2px;
        }
        .tb-body {
          flex: 1; min-height: 0;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr auto;
        }
        @media (min-width: 1100px) {
          .tb-body {
            grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
            grid-template-rows: 1fr;
          }
        }
        .tb-stage {
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(10px, 1.8vh, 24px);
          padding: clamp(8px, 1.5vh, 20px) clamp(12px, 2.5vw, 36px);
        }
        .tb-timer-block { text-align: center; }
        .tb-timer {
          font-family: 'Courier New', monospace;
          font-size: clamp(56px, 12vw, 180px);
          font-weight: 800; color: #22C55E;
          letter-spacing: -4px; line-height: 1;
          text-shadow: 0 0 40px rgba(34,197,94,0.35);
        }
        .tb-timer.live {
          color: #EF4444;
          text-shadow: 0 0 50px rgba(239,68,68,0.45);
          animation: tbPulse 1.2s ease-in-out infinite;
        }
        .tb-timer.done { color: #F4C542; }
        .tb-timer-label {
          margin-top: clamp(4px, 0.8vh, 10px);
          font-size: clamp(10px, 1.2vw, 18px);
          color: #666;
          letter-spacing: 3px;
          text-transform: uppercase;
        }
        .tb-live { color: #EF4444; font-weight: 700; }
        .tb-done { color: #F4C542; font-weight: 700; }
        .tb-pairs {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(8px, 1.2vh, 14px);
        }
        @media (min-width: 700px) {
          .tb-pairs { grid-template-columns: 1.4fr 1fr; }
        }
        .tb-pair {
          border-radius: clamp(10px, 1vw, 16px);
          padding: clamp(12px, 1.6vh, 22px) clamp(14px, 2vw, 28px);
          min-width: 0;
        }
        .tb-pair.current {
          background: linear-gradient(135deg, #0F2F0F, #1A4A1A);
          border: 2px solid #22C55E;
          box-shadow: 0 0 30px rgba(34,197,94,0.15);
        }
        .tb-pair.next {
          background: linear-gradient(135deg, #1F1F0F, #2A2A15);
          border: 2px solid #C98A2E;
        }
        .tb-pair.solo { text-align: center; }
        .tb-pair-label {
          font-size: clamp(10px, 1.1vw, 16px);
          font-weight: 700; color: #22C55E;
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: clamp(6px, 1vh, 12px);
        }
        .tb-pair.next .tb-pair-label { color: #C98A2E; }
        .tb-pair-names {
          font-size: clamp(18px, 2.6vw, 44px);
          font-weight: 700; color: #F5F5F5;
          line-height: 1.12;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .tb-pair.next .tb-pair-names {
          font-size: clamp(14px, 1.8vw, 30px);
          color: #C98A2E;
        }
        .tb-pair-names span { color: #666; margin: 0 0.25em; }
        .tb-ranking {
          min-height: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #101010, #080808);
          border-top: 3px solid #22C55E;
          padding: clamp(6px, 1vh, 12px) clamp(10px, 1.5vw, 20px);
        }
        @media (min-width: 1100px) {
          .tb-ranking { border-top: none; border-left: 3px solid #22C55E; }
        }
        .tb-ranking-head {
          flex-shrink: 0;
          text-align: center;
          font-size: clamp(11px, 1.3vw, 20px);
          font-weight: 700; color: #22C55E;
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: clamp(4px, 0.6vh, 8px);
        }
        .tb-ranking-list {
          flex: 1; min-height: 0;
          overflow-y: auto;
          display: flex; flex-direction: column;
          gap: clamp(3px, 0.5vh, 6px);
        }
        .tb-rank-row, .tb-final-row {
          display: grid;
          grid-template-columns: clamp(28px, 4vw, 52px) minmax(0, 1fr) auto;
          gap: clamp(6px, 1vw, 12px);
          align-items: center;
          background: #151515;
          border: 1px solid #262626;
          border-radius: 10px;
          padding: clamp(5px, 0.7vh, 10px) clamp(8px, 1vw, 14px);
          opacity: 0; transform: translateX(-12px);
          min-width: 0;
        }
        .tb-animate { animation: tbSlide 0.45s ease-out forwards; }
        .tb-pos {
          font-size: clamp(16px, 1.8vw, 28px);
          font-weight: 700; color: #22C55E;
          text-align: center;
        }
        .tb-names {
          font-size: clamp(12px, 1.2vw, 20px);
          font-weight: 700; color: #F0F0F0;
          line-height: 1.15;
          overflow-wrap: anywhere;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .tb-time {
          font-size: clamp(14px, 1.5vw, 26px);
          font-weight: 800; color: #22C55E;
          text-align: right; flex-shrink: 0;
        }
        .tb-empty { text-align: center; color: #555; padding: 16px; }
        .tb-final {
          flex: 1; min-height: 0;
          display: flex; flex-direction: column;
          padding: clamp(10px, 2vh, 24px) clamp(12px, 2.5vw, 36px);
        }
        .tb-final-title {
          text-align: center;
          font-size: clamp(18px, 2.8vw, 44px);
          font-weight: 800; color: #22C55E;
          letter-spacing: 3px;
          margin-bottom: clamp(8px, 1.5vh, 16px);
        }
        .tb-final-grid {
          flex: 1; min-height: 0;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr));
          gap: clamp(4px, 0.8vh, 8px);
        }
        .tb-final-podium {
          background: linear-gradient(135deg, #0F1A12, #152A18);
          border-color: rgba(34,197,94,0.45);
        }
        .tb-fs-btn {
          position: fixed; bottom: 20px; left: 50%;
          transform: translateX(-50%);
          z-index: 10001;
          background: rgba(34,197,94,0.95);
          color: #000; border: none; border-radius: 999px;
          padding: 12px 24px;
          font-family: 'Oswald', sans-serif;
          font-size: clamp(13px, 1.2vw, 16px);
          font-weight: 700; cursor: pointer;
        }
        .tb-exit {
          position: fixed;
          top: clamp(8px, 1.5vh, 16px);
          right: clamp(8px, 1.5vw, 16px);
          width: clamp(32px, 4vw, 44px);
          height: clamp(32px, 4vw, 44px);
          border-radius: 50%; border: none;
          background: rgba(239,68,68,0.85);
          color: white; cursor: pointer; z-index: 10000;
          opacity: 0.35;
        }
        .tb-exit:hover { opacity: 1; }
        @keyframes tbSlide { to { opacity: 1; transform: translateX(0); } }
        @keyframes tbPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.75; } }
        @media (max-width: 1099px) {
          .tb-ranking { max-height: clamp(140px, 28dvh, 280px); }
        }
      `}</style>
    </div>
  );
});

export default ArenaScreenTiraBoi;
