import { useEffect, useState } from "react";

export default function ArenaScreen({
  duplas,
  ranking,
  tempo,
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

  const proximaDupla = duplas.find((d) => d.bois === null);
  const top5 = ranking.slice(0, 5);
  const top3 = ranking.slice(0, 3);
  const medalhas = ["🥇", "🥈", "🥉"];
  const temPendentes = duplas.some((d) => d.bois === null);
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
          <div className="arena-timer">{tempo}</div>
          <div className="arena-timer-label">TEMPO</div>
        </div>

        {temPendentes && proximaDupla ? (
          <div className="arena-competitors-wrapper">
            <div className="arena-next arena-current-highlight">
              <div className="arena-next-label">🐴 DUPLA ATUAL</div>
              <div className="arena-next-riders">
                {proximaDupla.cavaleiro1} <span className="arena-separator">&</span> {proximaDupla.cavaleiro2}
              </div>
              <div className="arena-next-horses">
                🐴 {proximaDupla.cavalo1} • {proximaDupla.cavalo2}
              </div>
            </div>

            {duplas.filter((d) => d.bois === null).length > 1 ? (
              <div className="arena-next arena-upcoming">
                <div className="arena-next-label secondary">➡️ PRÓXIMA</div>
                <div className="arena-next-riders secondary-riders">
                  {duplas.filter((d) => d.bois === null)[1]?.cavaleiro1}
                  <span className="arena-separator">&</span>
                  {duplas.filter((d) => d.bois === null)[1]?.cavaleiro2}
                </div>
                <div className="arena-next-horses">
                  🐴 {duplas.filter((d) => d.bois === null)[1]?.cavalo1} · {duplas.filter((d) => d.bois === null)[1]?.cavalo2}
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
                    Aguadando inicio da prova.
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
                  <div className="arena-rank-name">
                    {dp.cavaleiro1} & {dp.cavaleiro2}
                  </div>
                  <div className="arena-rank-horses">
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
        .arena-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: #0B0B0B;
          color: #E0E0E0;
          font-family: 'Oswald', sans-serif;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 9999;
        }

        .arena-header {
          background: linear-gradient(135deg, #1A1A1A 0%, #0B0B0B 100%);
          border-bottom: 3px solid #F4C542;
          padding: 16px 24px;
          text-align: center;
        }

        .arena-header-content {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .arena-title {
          font-size: clamp(32px, 6vw, 64px);
          font-weight: 700;
          color: #F4C542;
          letter-spacing: 3px;
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 4px;
        }

        .arena-subtitle {
          font-size: clamp(14px, 2.5vw, 24px);
          color: #C98A2E;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .arena-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 24px 32px;
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
        }

        .arena-timer-container {
          text-align: center;
          margin-bottom: 32px;
        }

        .arena-timer {
          font-size: clamp(72px, 16vw, 180px);
          font-family: 'Courier New', monospace;
          font-weight: 800;
          color: #22C55E;
          letter-spacing: -4px;
          line-height: 0.9;
          text-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
        }

        .arena-timer-label {
          font-size: clamp(14px, 2vw, 24px);
          color: #666;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-top: 8px;
        }

        .arena-competitors-wrapper {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          align-items: stretch;
        }

        .arena-next {
          border-radius: 20px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .arena-current-highlight {
          background: linear-gradient(135deg, #0F2F0F 0%, #1A4A1A 100%);
          border: 3px solid #22C55E;
          box-shadow: 0 0 40px rgba(34, 197, 94, 0.2);
        }

        .arena-upcoming {
          background: linear-gradient(135deg, #1F1F0F 0%, #2A2A15 100%);
          border: 2px solid #C98A2E;
        }

        .arena-next-complete {
          background: linear-gradient(135deg, #0F2F0F 0%, #1A4A1A 100%);
          border: 3px solid #22C55E;
          text-align: center;
        }

        .arena-next-label {
          font-size: clamp(18px, 2vw, 28px);
          font-weight: 700;
          color: #22C55E;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .arena-next-label.secondary {
          color: #C98A2E;
          margin-bottom: 16px;
        }

        .arena-next-riders {
          font-size: clamp(28px, 3.5vw, 56px);
          font-weight: 700;
          color: #F0F0F0;
          line-height: 1.1;
          margin-bottom: 12px;
        }

        .secondary-riders {
          font-size: clamp(20px, 2.2vw, 36px);
          color: #C98A2E;
        }

        .arena-separator {
          color: #666;
          margin: 0 8px;
        }

        .arena-next-horses {
          font-size: clamp(16px, 1.8vw, 28px);
          color: #888;
          font-weight: 500;
        }

        .arena-complete-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .arena-podium {
          background: linear-gradient(135deg, #141000 0%, #1C1800 100%);
          border: 2px solid #F4C542;
          border-radius: 20px;
          padding: 28px;
        }

        .arena-podium-title {
          font-size: clamp(24px, 2.5vw, 40px);
          font-weight: 700;
          color: #F4C542;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 24px;
        }

        .arena-podium-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .arena-podium-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(244, 197, 66, 0.2);
          border-radius: 16px;
          padding: 20px 16px;
          text-align: center;
        }

        .arena-podium-medal {
          font-size: clamp(32px, 3vw, 48px);
          margin-bottom: 12px;
        }

        .arena-podium-name {
          font-size: clamp(16px, 1.6vw, 24px);
          font-weight: 700;
          color: #F0F0F0;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .arena-podium-meta {
          font-size: clamp(12px, 1.2vw, 16px);
          color: #C98A2E;
        }

        .arena-ranking {
          background: linear-gradient(180deg, #111111 0%, #0B0B0B 100%);
          border-top: 3px solid #F4C542;
          padding: 20px 32px 24px;
        }

        .arena-ranking-header {
          font-size: clamp(18px, 2vw, 32px);
          font-weight: 700;
          color: #F4C542;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 16px;
        }

        .arena-ranking-list {
          display: grid;
          gap: 8px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .arena-ranking-empty {
          text-align: center;
          color: #555;
          font-size: 18px;
          padding: 20px;
        }

        .arena-rank-row {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          gap: 20px;
          align-items: center;
          background: #1A1A1A;
          border: 1px solid #2A2A2A;
          border-radius: 12px;
          padding: 14px 20px;
          opacity: 0;
          transform: translateX(-20px);
        }

        .arena-rank-animated {
          animation: slideInRank 0.5s ease-out forwards;
        }

        .arena-rank-position {
          font-size: clamp(24px, 2.5vw, 40px);
          font-weight: 700;
          color: #F4C542;
          text-align: center;
        }

        .arena-rank-name {
          font-size: clamp(16px, 1.6vw, 26px);
          font-weight: 700;
          color: #F0F0F0;
          line-height: 1.1;
        }

        .arena-rank-horses {
          font-size: clamp(12px, 1.2vw, 18px);
          color: #666;
          margin-top: 4px;
        }

        .arena-rank-stats {
          text-align: right;
        }

        .arena-rank-bois {
          font-size: clamp(20px, 2vw, 32px);
          font-weight: 800;
          color: #22C55E;
          line-height: 1;
        }

        .arena-rank-time {
          font-size: clamp(12px, 1.2vw, 18px);
          color: #666;
          margin-top: 4px;
        }

        .arena-exit-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          font-size: 24px;
          cursor: pointer;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
        }

        .arena-exit-btn:hover {
          background: #EF4444;
          transform: scale(1.1);
        }

        @keyframes slideInRank {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 1024px) {
          .arena-competitors-wrapper,
          .arena-podium-grid {
            grid-template-columns: 1fr;
          }

          .arena-rank-row {
            grid-template-columns: 56px 1fr auto;
            gap: 12px;
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  );
}
