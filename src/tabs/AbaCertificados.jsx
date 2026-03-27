import { Btn, EmptyState } from "../components/ui";

export default function AbaCertificados({
  provaAtual,
  provaFinalizada,
  cavalosPremiadosDaProva,
  rankingCavalosDaProva,
  rankingCavalosGeral,
  imprimirCertificadoCavalo,
  formatarData,
}) {
  if (!provaAtual) return null;

  return (
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
  );
}
