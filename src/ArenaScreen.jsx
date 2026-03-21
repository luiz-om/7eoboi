import { useEffect, useState } from "react";

export default function ArenaScreen({
  duplas,
  ranking,
  tempo,
  timerRodando = false,
  nomeProva = "Ranch Sorting",
  provaFinalizada = false,
}) {
  const [animacoes, setAnimacoes] = useState(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      const novasAnimacoes = new Set();
      ranking.slice(0, 5).forEach((_, i) => novasAnimacoes.add(i));
      setAnimacoes(novasAnimacoes);
    }, 100);
    return () => clearTimeout(timer);
  }, [ranking]);

  const proximaDupla = duplas.find((d) => d.status === "PENDENTE");
  const pendentes = duplas.filter((d) => d.status === "PENDENTE");
  const proximaDupla2 = pendentes[1] ?? null;
  const top5 = ranking.slice(0, 5);
  const top3 = ranking.slice(0, 3);
  const medalhas = ["🥇", "🥈", "🥉"];
  const temPendentes = duplas.some((d) => d.status === "PENDENTE");
  const semDuplasCadastradas = duplas.length === 0;
  const provaEncerrada = provaFinalizada || !temPendentes;

  const fmt = (t) => (t == null ? "—" : t.toFixed(3) + "s");

  return (
    <div className="arena-screen">
      <div className="arena-header">
        <div className="arena-header-content">
          <div className="arena-title">🐄 Ranch Sorting 🐴</div>
          <div className="arena-subtitle">{nomeProva}</div>
        </div>
      </div>

      <div className="arena-main">
        <div className="arena-timer-container">
          <div className={`arena-timer${timerRodando ? " arena-timer-running" : ""}`}>{tempo}</div>
          <div className="arena-timer-label">
            {timerRodando ? (
              <span className="arena-live-badge">● AO VIVO</span>
            ) : "TEMPO"}
          </div>
        </div>

        {temPendentes && proximaDupla ? (
          <div className="arena-competitors-wrapper">
            <div className="arena-next arena-current-highlight">
              <div className="arena-next-label">🐴 DUPLA ATUAL</div>
              <div
                className="arena-next-riders"
                title={`${proximaDupla.cavaleiro1} & ${proximaDupla.cavaleiro2}`}
              >
                {proximaDupla.cavaleiro1} <span className="arena-separator">&</span> {proximaDupla.cavaleiro2}
              </div>
              <div
                className="arena-next-horses"
                title={`${proximaDupla.cavalo1} • ${proximaDupla.cavalo2}`}
              >
                🐴 {proximaDupla.cavalo1} • {proximaDupla.cavalo2}
              </div>
            </div>

            {pendentes.length > 1 ? (
              <div className="arena-next arena-upcoming">
                <div className="arena-next-label secondary">➡️ PRÓXIMA</div>
                <div
                  className="arena-next-riders secondary-riders"
                  title={`${proximaDupla2?.cavaleiro1} & ${proximaDupla2?.cavaleiro2}`}
                >
                  {proximaDupla2?.cavaleiro1}
                  <span className="arena-separator">&</span>
                  {proximaDupla2?.cavaleiro2}
                </div>
                <div
                  className="arena-next-horses"
                  title={`${proximaDupla2?.cavalo1} · ${proximaDupla2?.cavalo2}`}
                >
                  🐴 {proximaDupla2?.cavalo1} · {proximaDupla2?.cavalo2}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="arena-complete-stack">
            <div className="arena-next arena-next-complete">
              {semDuplasCadastradas && !provaFinalizada ? (
                <>
                  <div className="arena-next-label">⏳ AGUARDANDO</div>
                  <div style={{ marginTop: "8px", fontSize: "14px", color: "#22C55E" }}>
                    Aguardando início da prova.
                  </div>
                </>
              ) : (
                <>
                  <div className="arena-next-label">✅ PROVA CONCLUÍDA</div>
                  <div style={{ marginTop: "8px", fontSize: "14px", color: "#22C55E" }}>
                    {ranking.length} duplas finalizadas
                  </div>
                </>
              )}
            </div>

            {provaEncerrada && top3.length > 0 ? (
              <div className="arena-podium">
                <div className="arena-podium-title">Resultado Final</div>
                <div className="arena-podium-grid">
                  {top3.map((dp, index) => (
                    <div key={dp.id} className="arena-podium-card">
                      <div className="arena-podium-medal">{medalhas[index]}</div>
                      <div className="arena-podium-name">
                        {dp.cavaleiro1} & {dp.cavaleiro2}
                      </div>
                      <div className="arena-podium-meta">
                        {dp.bois} bois • {fmt(dp.tempo)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="arena-ranking">
        <div className="arena-ranking-header">🏆 TOP 5 RANKING 🏆</div>
        <div className="arena-ranking-list">
          {top5.length === 0 ? (
            <div className="arena-ranking-empty">Nenhum resultado registrado</div>
          ) : (
            top5.map((dp, i) => (
              <div
                key={dp.id}
                className={`arena-rank-row ${animacoes.has(i) ? "arena-rank-animated" : ""}`}
                style={{ animationDelay: animacoes.has(i) ? `${i * 0.1}s` : "0s" }}
              >
                <div className="arena-rank-position">{i < 3 ? medalhas[i] : i + 1}</div>
                <div className="arena-rank-team">
                  <div
                    className="arena-rank-name"
                    title={`${dp.cavaleiro1} & ${dp.cavaleiro2}`}
                  >
                    {dp.cavaleiro1} & {dp.cavaleiro2}
                  </div>
                  <div
                    className="arena-rank-horses"
                    title={`${dp.cavalo1} • ${dp.cavalo2}`}
                  >
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
      </div>

      <button onClick={() => window.close()} className="arena-exit-btn" title="Fechar janela do Telão">
        ✕
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700;800&display=swap');

        /* ── BASE ─────────────────────────────────────────── */
        .arena-screen {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100vh;
          background: #0B0B0B;
          color: #E0E0E0;
          font-family: 'Oswald', sans-serif;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 9999;
        }

        /* ── HEADER ───────────────────────────────────────── */
        .arena-header {
          background: linear-gradient(135deg, #1A1A1A 0%, #0B0B0B 100%);
          border-bottom: 3px solid #F4C542;
          padding: clamp(8px, 1.5vh, 18px) 24px;
          text-align: center;
          flex-shrink: 0;
        }
        .arena-header-content { max-width: 1600px; margin: 0 auto; }
        .arena-title {
          font-size: clamp(22px, 5vw, 60px);
          font-weight: 700; color: #F4C542;
          letter-spacing: 3px; text-transform: uppercase;
          line-height: 1; margin-bottom: 2px;
        }
        .arena-subtitle {
          font-size: clamp(11px, 2vw, 22px);
          color: #C98A2E; letter-spacing: 2px;
          text-transform: uppercase; font-weight: 600;
        }

        /* ── MAIN ─────────────────────────────────────────── */
        .arena-main {
          flex: 1; min-height: 0;
          display: flex; flex-direction: column; justify-content: center;
          padding: clamp(10px, 2vh, 28px) clamp(12px, 3vw, 40px);
          max-width: 1600px; width: 100%; margin: 0 auto;
          overflow: hidden;
        }

        /* ── TIMER ────────────────────────────────────────── */
        .arena-timer-container {
          text-align: center;
          margin-bottom: clamp(8px, 2vh, 28px);
          flex-shrink: 0;
        }
        .arena-timer {
          font-size: clamp(52px, 13vw, 180px);
          font-family: 'Courier New', monospace;
          font-weight: 800; color: #22C55E;
          letter-spacing: -4px; line-height: 0.9;
          text-shadow: 0 0 30px rgba(34,197,94,0.3);
          transition: text-shadow 0.3s;
        }
        .arena-timer-running {
          text-shadow: 0 0 60px rgba(34,197,94,0.7), 0 0 20px rgba(34,197,94,0.5);
        }
        .arena-timer-label {
          font-size: clamp(11px, 1.5vw, 22px);
          color: #666; letter-spacing: 4px;
          text-transform: uppercase; margin-top: 6px;
        }
        .arena-live-badge {
          color: #22C55E;
          letter-spacing: 3px;
          animation: pulseLive 1s ease-in-out infinite;
        }

        /* ── DUPLAS ───────────────────────────────────────── */
        .arena-competitors-wrapper {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: clamp(10px, 2vw, 24px);
          align-items: stretch;
          min-width: 0;
        }
        .arena-competitors-wrapper > .arena-next {
          min-width: 0; overflow: hidden;
        }
        .arena-next {
          border-radius: 16px;
          padding: clamp(14px, 2vw, 28px);
          display: flex; flex-direction: column; justify-content: center;
        }
        .arena-current-highlight {
          background: linear-gradient(135deg, #0F2F0F 0%, #1A4A1A 100%);
          border: 3px solid #22C55E;
          box-shadow: 0 0 40px rgba(34,197,94,0.2);
        }
        .arena-upcoming {
          background: linear-gradient(135deg, #1F1F0F 0%, #2A2A15 100%);
          border: 2px solid #C98A2E;
        }
        .arena-next-complete {
          background: linear-gradient(135deg, #0F2F0F 0%, #1A4A1A 100%);
          border: 3px solid #22C55E; text-align: center;
        }
        .arena-next-label {
          font-size: clamp(12px, 1.6vw, 26px);
          font-weight: 700; color: #22C55E;
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: clamp(6px, 1.2vh, 18px);
        }
        .arena-next-label.secondary { color: #C98A2E; }
        .arena-next-riders {
          font-size: clamp(20px, 2.8vw, 52px);
          font-weight: 700; color: #F0F0F0; line-height: 1.2;
          margin-bottom: clamp(4px, 1vh, 12px);
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; text-overflow: ellipsis;
          overflow-wrap: anywhere; word-break: break-word; white-space: normal;
        }
        .secondary-riders {
          font-size: clamp(16px, 2.2vw, 38px);
          color: #C98A2E;
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; text-overflow: ellipsis;
          overflow-wrap: anywhere; word-break: break-word; white-space: normal;
        }
        .arena-separator { color: #555; margin: 0 6px; }
        .arena-next-horses {
          font-size: clamp(11px, 1.4vw, 22px);
          color: #888; font-weight: 500;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* ── CONCLUÍDO / PÓDIO ────────────────────────────── */
        .arena-complete-stack {
          display: flex; flex-direction: column;
          gap: clamp(10px, 2vh, 24px);
        }
        .arena-podium {
          background: linear-gradient(135deg, #141000 0%, #1C1800 100%);
          border: 2px solid #F4C542; border-radius: 16px;
          padding: clamp(14px, 2vw, 28px);
        }
        .arena-podium-title {
          font-size: clamp(18px, 2.2vw, 38px);
          font-weight: 700; color: #F4C542;
          text-align: center; text-transform: uppercase;
          letter-spacing: 2px; margin-bottom: clamp(10px, 2vh, 22px);
        }
        .arena-podium-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: clamp(8px, 1.5vw, 16px);
        }
        .arena-podium-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(244,197,66,0.2);
          border-radius: 12px;
          padding: clamp(10px, 1.5vw, 20px) clamp(8px, 1vw, 16px);
          text-align: center;
        }
        .arena-podium-medal { font-size: clamp(22px, 2.5vw, 44px); margin-bottom: 8px; }
        .arena-podium-name {
          font-size: clamp(13px, 1.4vw, 22px);
          font-weight: 700; color: #F0F0F0;
          margin-bottom: 6px; line-height: 1.2; overflow-wrap: break-word;
        }
        .arena-podium-meta { font-size: clamp(11px, 1vw, 15px); color: #C98A2E; }

        /* ── RANKING ──────────────────────────────────────── */
        .arena-ranking {
          background: linear-gradient(180deg, #111111 0%, #0B0B0B 100%);
          border-top: 3px solid #F4C542;
          padding: clamp(6px, 1vh, 16px) clamp(12px, 3vw, 32px) clamp(8px, 1.5vh, 18px);
          flex-shrink: 0;
          max-height: 38vh;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .arena-ranking-header {
          font-size: clamp(12px, 1.6vw, 26px);
          font-weight: 700; color: #F4C542;
          text-align: center; text-transform: uppercase;
          letter-spacing: 2px; margin-bottom: clamp(4px, 0.8vh, 10px);
          flex-shrink: 0;
        }
        .arena-ranking-list {
          display: grid; gap: clamp(3px, 0.6vh, 7px);
          max-width: 1600px; margin: 0 auto; width: 100%;
          overflow-y: auto;
          flex: 1; min-height: 0;
        }
        .arena-ranking-empty {
          text-align: center; color: #555;
          font-size: clamp(13px, 1.5vw, 18px); padding: 16px;
        }
        .arena-rank-row {
          display: grid;
          grid-template-columns: clamp(36px, 5vw, 72px) 1fr auto;
          gap: clamp(6px, 1.2vw, 16px);
          align-items: center;
          background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 10px;
          padding: clamp(5px, 0.9vh, 11px) clamp(8px, 1.2vw, 16px);
          opacity: 0; transform: translateX(-20px);
          min-width: 0;
        }
        .arena-rank-animated { animation: slideInRank 0.5s ease-out forwards; }
        .arena-rank-position {
          font-size: clamp(18px, 2.2vw, 38px);
          font-weight: 700; color: #F4C542; text-align: center;
        }
        .arena-rank-team { min-width: 0; overflow: hidden; }
        .arena-rank-name {
          font-size: clamp(13px, 1.5vw, 24px);
          font-weight: 700; color: #F0F0F0; line-height: 1.1;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
        }
        .arena-rank-horses {
          font-size: clamp(10px, 1vw, 16px);
          color: #666; margin-top: 3px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
        }
        .arena-rank-stats { text-align: right; flex-shrink: 0; }
        .arena-rank-bois {
          font-size: clamp(16px, 1.8vw, 30px);
          font-weight: 800; color: #22C55E; line-height: 1;
        }
        .arena-rank-time { font-size: clamp(10px, 1vw, 16px); color: #666; margin-top: 3px; }

        /* ── BOTÃO FECHAR ─────────────────────────────────── */
        .arena-exit-btn {
          position: fixed; top: 16px; right: 16px;
          width: clamp(36px, 4vw, 48px); height: clamp(36px, 4vw, 48px);
          border-radius: 50%; border: none;
          background: rgba(239,68,68,0.9); color: white;
          font-size: clamp(16px, 2vw, 24px); cursor: pointer;
          z-index: 10000; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; box-shadow: 0 4px 20px rgba(239,68,68,0.3);
        }
        .arena-exit-btn:hover { background: #EF4444; transform: scale(1.1); }

        /* ── ANIMAÇÕES ────────────────────────────────────── */
        @keyframes slideInRank { to { opacity: 1; transform: translateX(0); } }
        @keyframes pulseLive {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        /* ── TABLET (768px – 1279px) ──────────────────────── */
        @media (max-width: 1279px) {
          .arena-competitors-wrapper { grid-template-columns: 1fr 1fr; }
          .arena-podium-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ── MOBILE (<768px) ──────────────────────────────── */
        @media (max-width: 767px) {
          .arena-header { padding: 8px 12px; }
          .arena-main { padding: 10px 12px; justify-content: flex-start; }
          .arena-timer { font-size: clamp(48px, 18vw, 96px); letter-spacing: -2px; }
          .arena-competitors-wrapper { grid-template-columns: 1fr; gap: 10px; }
          .arena-next { padding: 12px 14px; border-radius: 12px; }
          .arena-podium-grid { grid-template-columns: 1fr; gap: 8px; }
          .arena-ranking { padding: 6px 12px 10px; max-height: 40vh; }
          .arena-rank-row { grid-template-columns: 32px 1fr auto; gap: 6px; padding: 6px 8px; }
        }

        /* ── TV GRANDE (≥1920px) ──────────────────────────── */
        @media (min-width: 1920px) {
          .arena-timer { font-size: clamp(140px, 12vw, 220px); }
          .arena-next-riders { font-size: clamp(40px, 3vw, 72px); }
          .arena-ranking { padding: 20px 48px 24px; max-height: 35vh; }
          .arena-rank-row { padding: 14px 24px; border-radius: 14px; }
        }
      `}</style>
    </div>
  );
}