import { Btn, EmptyState } from "../components/ui";

export default function AbaRanking({
  provaAtual,
  rankingCompleto,
  ranking,
  semResultado,
  provaFinalizada,
  exportarResultadosExcel,
  copiarResultadoWhatsApp,
  medalhas,
  fmt,
  formatarData,
  formatarBois,
  duplaSat,
  toast,
}) {
  if (!provaAtual) return null;

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#141000,#1C1800)", border: "1px solid #F4C54222", borderRadius: "12px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", lineHeight: 1, marginBottom: "6px" }}>🏆</div>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "20px", fontWeight: 700, color: "#F4C542", letterSpacing: "2px", textTransform: "uppercase" }}>{provaAtual.nome}</div>
        <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>Mais bois · menor tempo como desempate</div>
      </div>

      {provaFinalizada && ranking.length > 0 ? (
        <div style={{ background: "linear-gradient(135deg,#0F1F0F,#152A15)", border: "1px solid #22C55E55", borderRadius: "12px", padding: "18px", marginBottom: "16px" }}>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "14px", color: "#22C55E", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>✅ Prova Finalizada</div>
          <div style={{ fontSize: "13px", color: "#B9D9C0", marginBottom: "14px" }}>Use as acoes abaixo para baixar a planilha CSV ou copiar o texto para o WhatsApp.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Btn variant="success" size="lg" onClick={() => { if (exportarResultadosExcel()) toast("Planilha CSV gerada novamente!"); }}>📊 Baixar Planilha</Btn>
            <Btn variant="amber" size="lg" onClick={copiarResultadoWhatsApp}>📱 Copiar p/ WhatsApp</Btn>
          </div>
        </div>
      ) : null}

      {rankingCompleto.length === 0 ? (
        <EmptyState title="Nenhum resultado registrado" text="Os resultados desta prova aparecerao aqui." />
      ) : rankingCompleto.map((dp, i) => {
        const pod = i < 3;
        const podCores = [
          { bg: "#141000", border: "#F4C54244", num: "#F4C542" },
          { bg: "#141414", border: "#C0C0C044", num: "#C0C0C0" },
          { bg: "#120E00", border: "#CD7F3244", num: "#CD7F32" },
        ];
        const c = pod ? podCores[i] : { bg: "#1E1E1E", border: "#2A2A2A", num: "#555" };
        return (
          <div key={dp.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "10px", padding: "14px 16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", border: `2px solid ${duplaSat(dp) ? "#F4C542" : c.num}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: pod ? "22px" : "14px", fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: duplaSat(dp) ? "#F4C542" : c.num, flexShrink: 0 }}>
              {duplaSat(dp) ? "SAT" : (pod ? medalhas[i] : i + 1)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: pod ? "#F0F0F0" : "#888", fontFamily: "'Oswald',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dp.cavaleiro1} & {dp.cavaleiro2}</div>
              <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>🐴 {dp.cavalo1} · {dp.cavalo2}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: duplaSat(dp) ? "#F4C542" : "#22C55E", fontFamily: "'Oswald',sans-serif" }}>{duplaSat(dp) ? "SAT" : formatarBois(dp)}</div>
              <div style={{ fontSize: "12px", color: "#555" }}>{duplaSat(dp) ? "" : `⏱️ ${fmt(dp.tempo)}`}</div>
            </div>
          </div>
        );
      })}

      {semResultado.length > 0 ? (
        <div style={{ marginTop: "16px", padding: "12px", background: "#1A1A1A", borderRadius: "8px", border: "1px dashed #2A2A2A", textAlign: "center", fontSize: "12px", color: "#444" }}>
          ⏳ {semResultado.length} dupla(s) ainda sem resultado
        </div>
      ) : null}
    </div>
  );
}
