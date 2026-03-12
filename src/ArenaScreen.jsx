import { useState, useEffect } from "react";

export default function ArenaScreen({ duplas, ranking, tempo }) {
  const [animacoes, setAnimacoes] = useState(new Set());
  const [tempoAtualizado, setTempoAtualizado] = useState(tempo);
  const [duplasAtualizado, setDuplasAtualizado] = useState(() => {
    try {
      const saved = localStorage.getItem("duplas");
      return saved ? JSON.parse(saved) : duplas;
    } catch {
      return duplas;
    }
  });
  const [rankingAtualizado, setRankingAtualizado] = useState(() => {
    try {
      const saved = localStorage.getItem("duplas");
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...parsed]
          .filter(d => d.bois !== null)
          .sort((a, b) => b.bois !== a.bois ? b.bois - a.bois : a.tempo - b.tempo);
      }
      return ranking;
    } catch {
      return ranking;
    }
  });

  // Sincroniza tempo com localStorage
  useEffect(() => {
    setTempoAtualizado(tempo);
  }, [tempo]);

  // Listener para mudanças em localStorage (tempo, duplas, ranking)
  useEffect(() => {
    const handleStorageChange = () => {
      const novoTempo = localStorage.getItem("tempoTelao");
      if (novoTempo) {
        setTempoAtualizado(novoTempo);
      }
      
      const novasDuplas = localStorage.getItem("duplas");
      if (novasDuplas) {
        try {
          const duplasParsed = JSON.parse(novasDuplas);
          setDuplasAtualizado(duplasParsed);
          
          // Recalcula ranking
          const novoRanking = [...duplasParsed]
            .filter(d => d.bois !== null)
            .sort((a, b) => b.bois !== a.bois ? b.bois - a.bois : a.tempo - b.tempo);
          setRankingAtualizado(novoRanking);
        } catch (e) {
          console.error("Erro ao parsear duplas:", e);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Animar ranking quando renderizar
  useEffect(() => {
    const timer = setTimeout(() => {
      const novasAnimacoes = new Set();
      rankingAtualizado.slice(0, 5).forEach((_, i) => novasAnimacoes.add(i));
      setAnimacoes(novasAnimacoes);
    }, 100);
    return () => clearTimeout(timer);
  }, [rankingAtualizado]);

  const proximaDupla = duplasAtualizado.find(d => d.bois === null);
  const top5 = rankingAtualizado.slice(0, 5);
  const medalhas = ["🥇", "🥈", "🥉"];
  const temPendentes = duplasAtualizado.some(d => d.bois === null);

  const fmt = t => t == null ? "—" : t.toFixed(3) + "s";

  return (
    <div className="arena-screen">
      {/* HEADER */}
      <div className="arena-header">
        <div className="arena-header-content">
          <div className="arena-title">🐄 Ranch Sorting 🐴</div>
          <div className="arena-subtitle">Manejo Soluções</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="arena-main">
        {/* TIMER */}
        <div className="arena-timer-container">
          <div className="arena-timer">{tempoAtualizado}</div>
          <div className="arena-timer-label">TEMPO</div>
        </div>

        {/* DUPLA ATUAL E PRÓXIMA */}
        {temPendentes && proximaDupla ? (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "80px", width: "100%", "@media (max-width: 1024px)": { gap: "40px" }, "@media (max-width: 768px)": { gap: "20px", gridTemplateColumns: "1fr" } }}>
            {/* DUPLA ATUAL */}
            <div className="arena-next">
              <div className="arena-next-label">🐴 DUPLA ATUAL</div>
              <div className="arena-next-riders">
                {proximaDupla.cavaleiro1} <span className="arena-separator">&</span> {proximaDupla.cavaleiro2}
              </div>
              <div className="arena-next-horses">
                🐴 {proximaDupla.cavalo1} • {proximaDupla.cavalo2}
              </div>
            </div>

            {/* PRÓXIMA DUPLA */}
            {duplasAtualizado.filter(d => d.bois === null).length > 1 ? (
              <div className="arena-next" style={{ fontSize: "1em", border: "2px solid #C98A2E", padding: "8px", maxWidth: "200px", width: "100%", overflow: "hidden", minWidth: "0", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                <div className="arena-next-label" style={{ fontSize: "15px", color: "#C98A2E", marginBottom: "4px", fontWeight: 700 }}>➡️ PRÓXIMA</div>
                <div className="arena-next-riders" style={{ fontSize: "30px", marginBottom: "2px", lineHeight: 1, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {duplasAtualizado.filter(d => d.bois === null)[1]?.cavaleiro1} <span className="arena-separator">&</span> {duplasAtualizado.filter(d => d.bois === null)[1]?.cavaleiro2}
                </div>
                <div className="arena-next-horses" style={{ fontSize: "25px", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  🐴 {duplasAtualizado.filter(d => d.bois === null)[1]?.cavalo1} · {duplasAtualizado.filter(d => d.bois === null)[1]?.cavalo2}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="arena-next arena-next-complete">
            <div className="arena-next-label">✅ PROVA CONCLUÍDA</div>
            <div style={{ marginTop: "8px", fontSize: "14px", color: "#22C55E" }}>
              {rankingAtualizado.length} duplas finalizadas
            </div>
          </div>
        )}
      </div>

      {/* RANKING BOTTOM */}
      <div className="arena-ranking">
        <div className="arena-ranking-header">🏆 TOP 5 RANKING 🏆</div>
        <div className="arena-ranking-list">
          {top5.length === 0 ? (
            <div className="arena-ranking-empty">
              Nenhum resultado registrado
            </div>
          ) : (
            top5.map((dp, i) => (
              <div
                key={dp.id}
                className={`arena-rank-row ${animacoes.has(i) ? "arena-rank-animated" : ""}`}
                style={{
                  animationDelay: animacoes.has(i) ? `${i * 0.1}s` : "0s",
                }}
              >
                <div className="arena-rank-position">
                  {i < 3 ? medalhas[i] : i + 1}
                </div>
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

      {/* EXIT BUTTON */}
      <button 
        onClick={() => window.close()} 
        className="arena-exit-btn" 
        title="Fechar janela do Telão"
      >
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
          align-items: center;
          justify-content: center;
          gap: 80px;
          padding: 60px 24px;
          position: relative;
        }

        .arena-timer-container {
          text-align: center;
        }

        .arena-timer {
          font-size: clamp(80px, 15vw, 220px);
          font-weight: 800;
          color: #22C55E;
          line-height: 1;
          text-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
          letter-spacing: -2px;
          font-family: 'Courier New', monospace;
          font-weight: 700;
        }

        .arena-timer-label {
          font-size: clamp(16px, 3vw, 32px);
          color: #F4C542;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-top: 8px;
          font-weight: 700;
        }

        .arena-next {
          background: linear-gradient(135deg, #1A1A1A 0%, #242424 100%);
          border: 3px solid #F4C542;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          max-width: 800px;
          width: 100%;
        }

        .arena-next-complete {
          border-color: #22C55E;
          background: linear-gradient(135deg, #0F1F0F 0%, #1A2A1A 100%);
        }

        .arena-next-label {
          font-size: clamp(12px, 2vw, 20px);
          color: #F4C542;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .arena-next-complete .arena-next-label {
          color: #22C55E;
        }

        .arena-next-riders {
          font-size: clamp(28px, 6vw, 56px);
          font-weight: 700;
          color: #F0F0F0;
          line-height: 1.1;
          margin-bottom: 12px;
        }

        .arena-separator {
          color: #C98A2E;
          margin: 0 8px;
        }

        .arena-next-horses {
          font-size: clamp(16px, 3vw, 28px);
          color: #22C55E;
          font-weight: 600;
        }

        .arena-ranking {
          background: linear-gradient(135deg, #1A1A1A 0%, #161616 100%);
          border-top: 3px solid #F4C542;
          padding: 20px 24px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .arena-ranking-header {
          font-size: clamp(16px, 3vw, 28px);
          font-weight: 700;
          color: #F4C542;
          text-align: center;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .arena-ranking-list {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .arena-ranking-empty {
          text-align: center;
          color: #555;
          font-size: 16px;
          padding: 16px;
        }

        .arena-rank-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #242424;
          border: 1px solid #2A2A2A;
          border-radius: 12px;
          padding: 12px 16px;
          flex: 1;
          min-width: 200px;
          max-width: 280px;
        }

        .arena-rank-row.arena-rank-animated {
          animation: arenaRankSlideUp 0.5s ease-out forwards;
          opacity: 0;
        }

        @keyframes arenaRankSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .arena-rank-position {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 700;
          flex-shrink: 0;
        }

        .arena-rank-team {
          flex: 1;
          min-width: 0;
        }

        .arena-rank-name {
          font-size: clamp(13px, 2vw, 16px);
          font-weight: 700;
          color: #F0F0F0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .arena-rank-horses {
          font-size: clamp(11px, 1.5vw, 13px);
          color: #555;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .arena-rank-stats {
          text-align: right;
          flex-shrink: 0;
        }

        .arena-rank-bois {
          font-size: clamp(18px, 3vw, 24px);
          font-weight: 800;
          color: #22C55E;
        }

        .arena-rank-time {
          font-size: clamp(11px, 1.5vw, 14px);
          color: #555;
          margin-top: 2px;
        }

        .arena-exit-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #EF4444;
          border: none;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          z-index: 10000;
        }

        .arena-exit-btn:hover {
          background: #DC2626;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
          transform: scale(1.05);
        }

        .arena-exit-btn:active {
          transform: scale(0.95);
        }

        /* Responsivo para telas grandes */
        @media (min-width: 1600px) {
          .arena-main {
            gap: 48px;
          }

          .arena-ranking-list {
            gap: 16px;
          }

          .arena-rank-row {
            max-width: 320px;
          }
        }

        /* Responsivo para telas pequenas */
        @media (max-width: 1024px) {
          .arena-main {
            gap: 40px;
            padding: 40px 16px;
          }

          .arena-timer {
            font-size: clamp(60px, 12vw, 120px) !important;
          }

          .arena-next {
            max-width: 100%;
            padding: 16px;
          }

          .arena-next-riders {
            font-size: clamp(18px, 4vw, 40px);
          }

          .arena-ranking-list {
            gap: 8px;
            flex-direction: column;
          }

          .arena-rank-row {
            min-width: auto;
            max-width: none;
          }

          .arena-exit-btn {
            bottom: 16px;
            right: 16px;
            width: 48px;
            height: 48px;
            font-size: 24px;
          }
        }

        @media (max-width: 768px) {
          .arena-main {
            gap: 30px;
            padding: 30px 12px;
          }

          .arena-timer {
            font-size: clamp(48px, 10vw, 80px) !important;
          }

          .arena-timer-label {
            font-size: 14px;
          }

          .arena-next {
            max-width: 100%;
            padding: 12px;
            border-width: 2px;
          }

          .arena-next-label {
            font-size: clamp(10px, 2.5vw, 16px);
          }

          .arena-next-riders {
            font-size: clamp(14px, 3.5vw, 32px);
            margin-bottom: 6px;
          }

          .arena-next-horses {
            font-size: clamp(10px, 2vw, 14px);
          }

          .arena-ranking {
            padding: 16px 12px;
          }

          .arena-ranking-header {
            font-size: clamp(14px, 3vw, 20px);
          }

          .arena-rank-row {
            padding: clamp(8px, 2vw, 14px);
            gap: 8px;
          }

          .arena-rank-num {
            font-size: clamp(16px, 3vw, 24px);
            width: 36px;
            height: 36px;
          }

          .arena-exit-btn {
            bottom: 12px;
            right: 12px;
            width: 44px;
            height: 44px;
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .arena-screen {
            padding: 0;
          }

          .arena-header {
            padding: 12px;
          }

          .arena-title {
            font-size: clamp(18px, 5vw, 28px);
          }

          .arena-subtitle {
            font-size: clamp(10px, 2vw, 16px);
          }

          .arena-main {
            gap: 20px;
            padding: 20px 8px;
          }

          .arena-timer {
            font-size: clamp(40px, 8vw, 64px) !important;
          }

          .arena-next {
            padding: 10px;
            border-width: 1px;
          }

          .arena-next-riders {
            font-size: clamp(12px, 3vw, 24px);
          }

          .arena-ranking {
            padding: 12px 8px;
          }
        }
      `}</style>
    </div>
  );
}
