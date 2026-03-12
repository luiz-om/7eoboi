import { useState, useEffect } from "react";
import ArenaScreen from "./ArenaScreen";

function gerarId() { return Math.random().toString(36).substr(2, 9); }

function usePWA() {
  useEffect(() => {
    const manifest = { name: "Ranch Sorting - Manejo Soluções", short_name: "Ranch Sorting", start_url: "/", display: "standalone", background_color: "#121212", theme_color: "#C98A2E" };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    let link = document.querySelector("link[rel='manifest']");
    if (!link) { link = document.createElement("link"); link.rel = "manifest"; document.head.appendChild(link); }
    link.href = url;
    let meta = document.querySelector("meta[name='theme-color']");
    if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.appendChild(meta); }
    meta.content = "#C98A2E";
    return () => URL.revokeObjectURL(url);
  }, []);
}

const LOGO_B64 = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABHANoDASIAAhEBAxEB/8QAHAABAQEBAQEBAQEAAAAAAAAAAAgHBgUEAwEC/8QARhAAAQIFAQMDEAcGBwAAAAAAAQIDAAQFBhEhBxIxCBNBFBgiN1FSVVZhcpGTlLPR0xYXQnF1gdIVIzI2lbKChJKhoqSx/8QAGgEAAwEBAQEAAAAAAAAAAAAAAAQFAwYCAf/EAC8RAAEDAwEFBgYDAAAAAAAAAAEAAgMEERITBSExUYEUFTNBUnEiI2FioeEy0fD/2gAMAwEAAhEDEQA/AIyhCECEhFb8nbsNkdIKex3lPk40yefXGg76+/V6Yky7U03lmPD6/pOso8mh11A8IvjfX36vTE8crY5rNBJ1PU7uv+JMaU20deQMxt1XmWl025XWHQhCKSUSEIQISEdFs7tacvC6pWjSoUltR35l4DPMsgjeV9+uB3SQOmLLo0hKUelS1LprIl5SVbDbTaToAP8A0niSdSSSYRq65tOQLXKYhpzLv4KEoRvnKZv1t1k2TTHw6d5LlScGCE4O8loHu5AUccMJGf4gMDhiCV0rA8i11lIwMdiDdIQjV+S0B9ZLysDKac6Qe4d9uPUsmmwv5L4xuTg1ZRCL4319+r0w319+r0xJ74+z8/pO9h+5QPCLnrdFpFbY5msUyTn0a4Ewyle75QSMg+Uaxg22XY6xR6c9cNpoe6jYSVzUkpRWWkDitBOpSBqQSSNTnGgZg2lHK7EixWUlI5guN6xGEI2XktU6n1Ct1pM/Iys2ESzZSH2kr3eyOcZGkOTSiJhefJYRszcGrGoRcP0atzwBSvY2/hD6NW54ApXsbfwiZ3uz0pvsTuah6EVNt9oVElNldUmZWj0+XfbWwUONSyEqTl5AOCBkaEj84lmKFNUCoZmBZLSxGN2JSEIQwskhCECFW/J57UVG85/37kfPygrmrdrWhJT9Bnuo5hyoJaWvmkLygtuHGFgjiB6I+jk89qKjec/79yP1212bU73tiVpdKmJNh5mdS+pU0tSUlIQtOBupUc5UI5u7BWkv4XKq2JgGPGywH64to/jH/wBKX+XHO3bdlwXW+w/X6gZxyXQUNHmkNhIJydEACNC6328vClv+ve+VDrfby8KW/wCve+VFds9I03aQEiY5juIKyGOw2Tu2gblTI3pTm5iQm8NofW+40JdzOiiUKHYnODnhodADHi3hQJ217jm6DUVsLmpUpC1MqKkHeSFAgkA8FDiBHkw04CRm48eSyBxKrs7Htm40NspH+dmfmRg22PZ5NWpdaG6XKOvUqpOYp4by4oLOMsnp3gT2PHII1J3sa1yd7+TXqKm2qm8TVae1+6Ws6zDIOBr3ycgHpIwdeyxqszKy0yWTMyzL5YcDrRcbCubWAQFJzwVgkZGupiCKmakmLZCSFRMUczLt3LkdkNjs2RbAlFlDlSmSHZ55PAq6EA96kEgd0lR0zgfntlvhqyrXW6wsGrTgU1IowDuq6XCDphOQenJKRjBJHVV+rSNCos3V6k6GpSUbLjitM+QDPEk4AHSSBEa39dM/eFzTFanhub/YMMhW8lhoZ3UA/mSTgZJJwMwUkDqqUyycP9uRPIIWYN4rw33XZh9x991brriita1qKlKUTkkk8ST0x/iEI6FTEjV+S12yJj8Nd/vbjKI1fktdsiY/DXf724Xq/Af7Faw+I33VOTClIl3FpOFJQSPvxEjDa7tFAx9JHPZmf0RXT6C4ytsEAqSQCeGoiaOt9vLwpb/r3vlRH2c+Fodq26p2qEhIwXvbFtrlfq11S9v3K8zOInN5LMyGUtrQ4E5CTugJKTgjhnJGuI3tQCgUqAUDoQRkGMd2UbGHbYuCXr9bqkvNTUsF8zLSyCWwojAWVqwTgFWm6NcHOmDqlwVaRoVGmqvU3gzKSrZW4rpPcA7pJwAOkkCMK3SfKNH8c1pBm1nzFFl4U9mk3bWKVL55mTn35dvJyd1Dikj/AGEeps7vqr2NOTc1SZeRfVNNhtxM0hSgADkEbqknMfCGaret5zH7Pkw9UqrNOvpYSsJG8oqWoZUQAAM6nuR0n1N7SPF0e3S/zI6F7o8cZCOqmtDr3YF73XBXl4Lt/wBQ982Ne2J3nVL3tqbqdVl5Nh5mcUwlMqhSUlIQhWu8pWuVGMD+pvaR4uj26X+ZG4cn22K5atpzsjXpHqOYdn1OoRzyHMoLaBnKFEcQYmVrKYQkx2v9E3TulLxley/flD9qOsecx79ESTFbcoftR1jzmPfoiSY32V4HVZVniJCEIpJVIQhAhVvyee1FRvOf9+5Ha1Sp0ylS6Ziq1KSp7KlbiXJqYQ0kqwTgFRAJwDp5I4rk89qKjec/79yPA5Vv8g078UR7p2OZfEJassPmSqwfhAHDktC+mVneN1vf1Nn9UPpnZ3jdb39TZ/VESwh/uiP1FLdtdyXbbcp+SqW1OsztOm2JuVc5kIeZcC0Kww2k4UNDqCPyjiYR6Fu0eer9blKPTGudm5pwIbT0DpKj3AACSegAmKjQI2AeQShJc6/NdzyfLWqVcvmWqku87KSdKcS+++hWCo/ZaHd3tQRw3d7PEA1dHhWHbMjaNsStEkcKDQ3nntzdL7pxvLI8uNNTgADOkc1tR2n0+yatS6cWhNvvupXOoSMliW1BUNR2ZOoB4hJzjIMc7USOrJrMHDgqcTRBHdybe7VqF02QtFMmHhMSKzNCVSMpmQEnKcDXeAyU+XTGoIkqLzln2ZqWamZZ1DzDyA404hWUrSRkKB6QQc5ib+UXs+FGqJuqjy5FOm14m20DsZd4/a8iV+gKyMjeSIa2ZU4/Jd0/pZVcV/jCxyEIRbU9I0/k0z0lIbQnnp+cl5Vo091IW84EJJ30HGSeOAfRGYQjOWPUYWc16Y7FwKuH6TW34wUn2xv4w+k1t+MFJ9sb+MQ9CJfdDPUnO2u5K8ZSZl5thL8pMNTDKuDjSwpJ/MaRnm3GwKheVJEzTKpNCak0bzNPWsCXeI3s6dDhCiAokjQDQEqE/bIajVKdtGohpTzyFzE40w+hs6OsqWAtKhwIxk68MA6EAxZUJzxOoZQ5put43ioYQQpG2Agt7YaIlwFCgp9JCtCDzDgx9+YrrcX3qvREd7cZSXktq1eZlkgNqfS8QO/cbStf/JRji4pVFGKvGS9tyUin0bttdXxuL71Xoj+EEcQR98QRFL8lH+RKl+Jq903CFTs4QRl+V+iZiqtR2Nl7/KH7UdY85j36IkmK25Q/ajrHnMe/REkw/srwOqWrPESEIRSSqQhCBCrfk89qKjec/wC/cjqLstmiXVT25CvSXVcu06HkI51beFgEZykg8FGMF2Z7ZJC07Mk6BM0SZmXJZTn71t5ICgpal8CNP4sflHSdcPSPFye9ej4Rz81JU6znsHnzCpsni0w1xXX/AFObOPF0+2zH64xvlD2jb9p1OkNUCRMm3MsuKdTzy3AohQwezJI4x2vXD0jxcnvXo+EZptlv6Vvuepz8rT3pNMo0tCg4sKKiog9H3QzSR1bZQZb291jO6Es+DiuBipOT3YblsUFdZqsuWqvUUDsFjC5dniEHpClaKI80EAgxPFhVWk0S6ZOrVmnOVGXlVFxLCFhOXB/ATniAcHHkGcjIO2dcPSPFye9ej4RvXtnkbhGNx4rOmMbTk8rTtoF1SFnWzMVme7NSRuS7AVgvOkHdQD0cMk9ABOvCI2r1Vna5WZur1F4vTc04XHFdGT0DuADAA6AAI6TazfUzfVwInCyuVkZZvm5WWK97czgqUejeUe50BI1xk8bHqhpNBlz/ACK+VE2o7dwXbWptRvC2qK3SKbOs9SNKJaQ6ylZRk5IBPRkk/nH11fbBeVWpc1TKg7IPys00pp1BlU6hQxkdwjiD0EAxn0IYNPEXZYi/sstR9rXSEIRsvCQhCBC9S0pJipXXSKdNBRYmp5lh0JODuqcSk4PRoYp07FNn2c/suYHk6sc+MS7blQTSbhptVU0XUyc21MFsHBUELCsZ6M4jezyh6RnS3J716PhE6ubUOLdFNU5iAOa0e1LCtK15pU3RKM1LzKk7peWtbqwNeBWTu5zrjGemPVuKtU236PMVaqzCWJVhOVKPFR6EpHSo8AIxOq8ohZZcRSrXSl3H7t2Zm95IPlQlIz/qEZPe153DeE6mYrc6XENk8zLtjcaayfsp7uuMnJxjJOIRj2dPK/KY/m5TDqqNjbMXnXNVnq7cVQrMwnccnZhbxRvZCAo5CQe4BgD7o7PYhYtLvmp1KWqs1OMIlWUrR1MpIJJVjUqSdNIzuNF2G31SLHqdSmavLzzzc0yhCOpUIUQQonUKUnTWLE4eIiI+PkkY8S8ZcFqfW+2h4VrvrWvlx3WzyzKbZFIfplMmJt9p6YL6lTKklQJSlOBupGnYxxPXAWT4OuH2Zn5sOuAsnwdcPszPzYiSMrZG4uBI6Kg11O03C9rlD9qOsecx79ESTG5bV9r9s3VY09QqZJVduZmVNFK5hltKAEuJUclLij9nuRhsU9nRPiixeLG6Tqnte+7UhCEPpdIQhAhIQhAhIQhAhIQhAhIQhAhIQhAhIQhAhIQhAhIQhAhIQhAhIQhAhIQhAhIQhAhIQhAhf//Z";

// ─── UI Components ──────────────────────────────────────────────────────────

function StatCard({ value, label, color }) {
  return (
    <div style={{ textAlign: "center", padding: "12px 6px" }}>
      <div style={{ fontSize: "clamp(20px,5vw,30px)", fontWeight: 700, color, fontFamily: "'Oswald',sans-serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "10px", color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginTop: "3px" }}>{label}</div>
    </div>
  );
}

function ModernTab({ id, label, icon, active, onClick }) {
  return (
    <button onClick={() => onClick(id)} style={{
      flex: 1, padding: "13px 6px", border: "none", cursor: "pointer", background: "transparent",
      fontFamily: "'Oswald',sans-serif", fontSize: "clamp(11px,3vw,13px)", fontWeight: 500,
      letterSpacing: "0.5px", textTransform: "uppercase", transition: "all 0.2s", touchAction: "manipulation",
      color: active ? "#F4C542" : "#555", borderBottom: active ? "2px solid #C98A2E" : "2px solid transparent",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "3px"
    }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      {label}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label style={{ display: "block", fontSize: "11px", color: "#666", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "'Oswald',sans-serif" }}>{label}</label>}
      <input {...props} style={{
        width: "100%", padding: "13px 12px", borderRadius: "8px",
        border: "1px solid #2A2A2A", background: "#252525", color: "#F0F0F0",
        fontSize: "16px", fontFamily: "inherit", boxSizing: "border-box", outline: "none", ...props.style
      }}
        onFocus={e => e.target.style.borderColor = "#C98A2E"}
        onBlur={e => { e.target.style.borderColor = "#2A2A2A"; props.onBlur && props.onBlur(e); }}
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label style={{ display: "block", fontSize: "11px", color: "#666", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "'Oswald',sans-serif" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <select {...props} style={{
          width: "100%", padding: "13px 36px 13px 12px", borderRadius: "8px",
          border: "1px solid #2A2A2A", background: "#252525", color: props.value ? "#F0F0F0" : "#555",
          fontSize: "16px", fontFamily: "inherit", boxSizing: "border-box", outline: "none",
          appearance: "none", WebkitAppearance: "none"
        }}>{children}</select>
        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none", fontSize: "12px" }}>▼</span>
      </div>
    </div>
  );
}

function Btn({ children, variant = "primary", size = "md", full, style: s = {}, ...props }) {
  const sizes = { sm: { padding: "9px 12px", fontSize: "12px" }, md: { padding: "14px 18px", fontSize: "13px" }, lg: { padding: "17px 22px", fontSize: "15px" } };
  const variants = {
    primary: { background: "linear-gradient(135deg,#C98A2E,#8B5E1A)", color: "#fff", boxShadow: "0 3px 10px rgba(201,138,46,0.25)", border: "none" },
    success: { background: "linear-gradient(135deg,#22C55E,#16A34A)", color: "#fff", boxShadow: "0 3px 10px rgba(34,197,94,0.25)", border: "none" },
    secondary: { background: "#252525", color: "#C98A2E", border: "1px solid #C98A2E33" },
    danger: { background: "transparent", color: "#EF4444", border: "1px solid #EF444430" },
    ghost: { background: "transparent", color: "#666", border: "1px solid #2A2A2A" },
    amber: { background: "linear-gradient(135deg,#D4A017,#A07010)", color: "#fff", border: "none" },
  };
  return (
    <button style={{
      ...sizes[size], ...variants[variant], borderRadius: "8px", cursor: "pointer",
      fontFamily: "'Oswald',sans-serif", fontWeight: 600, letterSpacing: "0.8px",
      textTransform: "uppercase", transition: "all 0.15s", touchAction: "manipulation",
      width: full ? "100%" : "auto", ...s
    }} {...props}>{children}</button>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function RanchSortingApp() {
  usePWA();
  const [aba, setAba] = useState("cadastro");
  const [duplas, setDuplas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
  const [resultadoForm, setResultadoForm] = useState({ duplaId: "", bois: "", tempo: "" });
  const [mensagem, setMensagem] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editandoResultadoId, setEditandoResultadoId] = useState(null);
  const [modoTelao, setModoTelao] = useState(false);
  const [tempoTelao, setTempoTelao] = useState("00.000");
  const [timerRodando, setTimerRodando] = useState(false);
  const [tempoInicial, setTempoInicial] = useState(null); // Track start time
  const [boisTelao, setBoisTelao] = useState(""); // Número de bois para controle do telão

  useEffect(() => {
    try { const d = localStorage.getItem("duplas"); if (d) setDuplas(JSON.parse(d)); } catch {}
    try { const t = localStorage.getItem("tempoTelao"); if (t) setTempoTelao(t); } catch {}
    try { const r = localStorage.getItem("timerRodando"); if (r) setTimerRodando(r === "true"); } catch {}
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (carregando) return;
    try { localStorage.setItem("duplas", JSON.stringify(duplas)); } catch {}
  }, [duplas, carregando]);

  // useEffect para incrementar o timer quando rodando
  useEffect(() => {
    if (!timerRodando) {
      setTempoInicial(null);
      return;
    }

    // Se iniciando agora, marca o tempo inicial
    if (tempoInicial === null) {
      setTempoInicial(Date.now());
    }

    const interval = setInterval(() => {
      setTempoTelao(prev => {
        const agora = Date.now();
        const tempoDecorrido = agora - (tempoInicial || agora);
        const totalMilisegundos = Math.floor(tempoDecorrido); // Milissegundos
        
        const segundos = Math.floor(totalMilisegundos / 1000);
        const milisegundos = totalMilisegundos % 1000;
        
        const novoTempo = `${String(segundos).padStart(2, '0')}.${String(milisegundos).padStart(3, '0')}`;
        try { localStorage.setItem("tempoTelao", novoTempo); } catch {}
        return novoTempo;
      });
    }, 10); // Atualiza a cada 10ms para milisegundos

    return () => clearInterval(interval);
  }, [timerRodando, tempoInicial]);

  // Salva tempo em localStorage apenas quando não está rodando
  useEffect(() => {
    if (timerRodando) return;
    try { localStorage.setItem("tempoTelao", tempoTelao); } catch {}
  }, [tempoTelao, timerRodando]);

  useEffect(() => {
    try { localStorage.setItem("timerRodando", timerRodando); } catch {}
  }, [timerRodando]);

  function toast(msg, tipo = "ok") { setMensagem({ texto: msg, tipo }); setTimeout(() => setMensagem(null), 3000); }

  function cadastrarDupla() {
    const { cavaleiro1, cavalo1, cavaleiro2, cavalo2 } = form;
    if (!cavaleiro1 || !cavalo1 || !cavaleiro2 || !cavalo2) { toast("Preencha todos os campos!", "erro"); return; }
    if (editandoId) {
      setDuplas(d => d.map(dp => dp.id === editandoId ? { ...dp, cavaleiro1, cavalo1, cavaleiro2, cavalo2 } : dp));
      setEditandoId(null); toast("Dupla atualizada!");
    } else {
      setDuplas(d => [...d, { id: gerarId(), cavaleiro1, cavalo1, cavaleiro2, cavalo2, bois: null, tempo: null }]);
      toast("Dupla cadastrada!");
    }
    setForm({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" });
  }

  function editarDupla(dp) { setForm({ cavaleiro1: dp.cavaleiro1, cavalo1: dp.cavalo1, cavaleiro2: dp.cavaleiro2, cavalo2: dp.cavalo2 }); setEditandoId(dp.id); setAba("cadastro"); }
  function cancelarEdicao() { setEditandoId(null); setForm({ cavaleiro1: "", cavalo1: "", cavaleiro2: "", cavalo2: "" }); }
  function removerDupla(id) { if (!confirm("Remover esta dupla?")) return; setDuplas(d => d.filter(dp => dp.id !== id)); toast("Dupla removida!"); }

  function salvarResultado() {
    const { duplaId, bois, tempo } = resultadoForm;
    if (!duplaId || bois === "" || tempo === "") { toast("Preencha todos os campos!", "erro"); return; }
    const b = parseInt(bois), t = parseFloat(String(tempo).replace(",", "."));
    if (isNaN(b) || b < 0 || b > 10) { toast("Bois válidos: 0 a 10", "erro"); return; }
    if (isNaN(t) || t <= 0) { toast("Tempo inválido!", "erro"); return; }
    const era = !!editandoResultadoId;
    setDuplas(d => d.map(dp => dp.id === duplaId ? { ...dp, bois: b, tempo: t } : dp));
    setResultadoForm({ duplaId: "", bois: "", tempo: "" }); setEditandoResultadoId(null);
    toast(era ? "Resultado atualizado!" : "Resultado registrado!");
  }

  function iniciarEdicaoResultado(dp) { setEditandoResultadoId(dp.id); setResultadoForm({ duplaId: dp.id, bois: String(dp.bois), tempo: String(dp.tempo) }); }
  function cancelarEdicaoResultado() { setEditandoResultadoId(null); setResultadoForm({ duplaId: "", bois: "", tempo: "" }); }
  function limparResultado(id) { if (!confirm("Remover resultado?")) return; setDuplas(d => d.map(dp => dp.id === id ? { ...dp, bois: null, tempo: null } : dp)); if (editandoResultadoId === id) cancelarEdicaoResultado(); toast("Resultado removido!"); }

  const ranking = [...duplas].filter(d => d.bois !== null).sort((a, b) => b.bois !== a.bois ? b.bois - a.bois : a.tempo - b.tempo);
  const semResultado = duplas.filter(d => d.bois === null);
  const comResultado = duplas.filter(d => d.bois !== null);
  const proximaDupla = duplas.find(d => d.bois === null);
  const medalhas = ["🥇", "🥈", "🥉"];
  const fmt = t => t == null ? "—" : t.toFixed(3) + "s";

  const tempoChange = e => {
    let v = e.target.value.replace(",", ".");
    if (v === "" || v === ".") { setResultadoForm(p => ({ ...p, tempo: e.target.value })); return; }
    if (!/^\d{0,2}([.,]\d{0,3})?$/.test(e.target.value)) return;
    if (!isNaN(parseFloat(v)) && parseFloat(v) > 60) return;
    setResultadoForm(p => ({ ...p, tempo: e.target.value }));
  };
  const tempoBlur = e => setResultadoForm(p => ({ ...p, tempo: e.target.value.replace(",", ".") }));

  // Abrir Telão em nova janela
  const abrirTelao = () => {
    const url = `${window.location.origin}${window.location.pathname}?telao=true`;
    window.open(url, "telao", "width=1920,height=1080,fullscreen=yes");
  };

  // Se URL contém ?telao=true, renderizar apenas Arena Screen
  const urlParams = new URLSearchParams(window.location.search);
  const isTelaoWindow = urlParams.get("telao") === "true";

  if (isTelaoWindow) {
    return (
      <ArenaScreen
        duplas={duplas}
        ranking={ranking}
        tempo={tempoTelao}
      />
    );
  }

  if (carregando) return (
    <div style={{ minHeight: "100vh", background: "#121212", display: "flex", alignItems: "center", justifyContent: "center", color: "#F4C542", fontFamily: "'Oswald',sans-serif", fontSize: "20px", gap: "12px" }}>
      <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: "32px" }}>🐄</span>
      Carregando...
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ─── MAIN APP ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#121212", color: "#E0E0E0", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Toast */}
      {mensagem && (
        <div style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 999, background: mensagem.tipo === "erro" ? "#7F1D1D" : "#14532D", border: `1px solid ${mensagem.tipo === "erro" ? "#EF4444" : "#22C55E"}`, color: "#fff", padding: "12px 20px", borderRadius: "10px", fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", animation: "fadeIn 0.2s ease" }}>
          {mensagem.tipo === "erro" ? "❌ " : "✅ "}{mensagem.texto}
        </div>
      )}

      {/* HEADER */}
      <div style={{ background: "#1A1A1A", borderBottom: "1px solid #2A2A2A", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={LOGO_B64} alt="Logo" style={{ height: "38px", objectFit: "contain", mixBlendMode: "screen" }} />
          <div>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(15px,4vw,20px)", fontWeight: 700, color: "#F4C542", letterSpacing: "2px", textTransform: "uppercase", lineHeight: 1 }}>Ranch Sorting</div>
            <div style={{ fontSize: "10px", color: "#C98A2E", letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px" }}>Manejo Soluções</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={abrirTelao} style={{
            background: "linear-gradient(135deg,#D4A017,#A07010)", color: "#fff",
            border: "none", borderRadius: "8px", padding: "10px 14px",
            fontFamily: "'Oswald',sans-serif", fontSize: "12px", fontWeight: 600,
            letterSpacing: "0.8px", textTransform: "uppercase", cursor: "pointer",
            transition: "all 0.15s", display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 3px 10px rgba(212, 160, 23, 0.25)"
          }}
            onMouseEnter={e => e.target.style.boxShadow = "0 4px 14px rgba(212, 160, 23, 0.35)"}
            onMouseLeave={e => e.target.style.boxShadow = "0 3px 10px rgba(212, 160, 23, 0.25)"}
          >
            <span style={{ fontSize: "16px" }}>🪟</span>
            Telão
          </button>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E", animation: "pulse 2s infinite" }}></div>
          <span style={{ fontSize: "11px", color: "#22C55E", fontFamily: "'Oswald',sans-serif", letterSpacing: "0.5px" }}>AO VIVO</span>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ background: "#161616", borderBottom: "1px solid #2A2A2A", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {[
          { value: duplas.length, label: "Duplas", color: "#F4C542" },
          { value: comResultado.length, label: "Concluídas", color: "#22C55E" },
          { value: semResultado.length, label: "Pendentes", color: "#C98A2E" },
        ].map((s, i) => (
          <div key={i} style={{ borderRight: i < 2 ? "1px solid #2A2A2A" : "none" }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* NAV TABS */}
      <div style={{ background: "#1A1A1A", borderBottom: "1px solid #2A2A2A", display: "flex", position: "sticky", top: 0, zIndex: 10 }}>
        {[
          { id: "cadastro", label: "Duplas", icon: "🤠" },
          { id: "resultados", label: "Prova", icon: "⏱️" },
          { id: "ranking", label: "Ranking", icon: "🏆" },
          { id: "telao", label: "Controle", icon: "🎬" },
        ].map(t => <ModernTab key={t.id} {...t} active={aba === t.id} onClick={setAba} />)}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "16px", maxWidth: "700px", margin: "0 auto", paddingBottom: "80px" }}>

        {/* ── DUPLAS ── */}
        {aba === "cadastro" && (
          <div>
            <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: editandoId ? "1px solid #C98A2E66" : "1px solid #2A2A2A" }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
                {editandoId ? "✏️ Editar Dupla" : "＋ Nova Dupla"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <Input label="🤠 Cavaleiro 1" value={form.cavaleiro1} onChange={e => setForm(p => ({ ...p, cavaleiro1: e.target.value }))} placeholder="Nome do cavaleiro" />
                <Input label="🐴 Cavalo 1" value={form.cavalo1} onChange={e => setForm(p => ({ ...p, cavalo1: e.target.value }))} placeholder="Nome do cavalo" />
                <Input label="🤠 Cavaleiro 2" value={form.cavaleiro2} onChange={e => setForm(p => ({ ...p, cavaleiro2: e.target.value }))} placeholder="Nome do cavaleiro" />
                <Input label="🐴 Cavalo 2" value={form.cavalo2} onChange={e => setForm(p => ({ ...p, cavalo2: e.target.value }))} placeholder="Nome do cavalo" />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Btn variant="primary" size="lg" full onClick={cadastrarDupla}>{editandoId ? "💾 Salvar Alteração" : "✅ Cadastrar Dupla"}</Btn>
                {editandoId && <Btn variant="ghost" size="lg" onClick={cancelarEdicao}>Cancelar</Btn>}
              </div>
            </div>

            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "11px", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
              🐄 Duplas Cadastradas ({duplas.length})
            </div>
            {duplas.length === 0 && (
              <div style={{ textAlign: "center", color: "#333", padding: "40px 16px", border: "1px dashed #2A2A2A", borderRadius: "12px" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>🐄</div>
                <div style={{ fontFamily: "'Oswald',sans-serif", color: "#444" }}>Nenhuma dupla cadastrada</div>
              </div>
            )}
            {duplas.map((dp, i) => (
              <div key={dp.id} style={{ background: "#1E1E1E", borderRadius: "10px", padding: "12px 14px", marginBottom: "8px", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#C98A2E22", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: "#C98A2E", fontSize: "13px", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#F0F0F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>🤠 {dp.cavaleiro1} <span style={{ color: "#C98A2E" }}>✦</span> {dp.cavaleiro2}</div>
                  <div style={{ fontSize: "11px", color: "#444", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>🐴 {dp.cavalo1} · {dp.cavalo2}</div>
                </div>
                {dp.bois !== null && (
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#22C55E" }}>{dp.bois} 🐄</div>
                    <div style={{ fontSize: "10px", color: "#444" }}>{fmt(dp.tempo)}</div>
                  </div>
                )}
                <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                  <Btn variant="secondary" size="sm" onClick={() => editarDupla(dp)}>✏️</Btn>
                  <Btn variant="danger" size="sm" onClick={() => removerDupla(dp.id)}>🗑️</Btn>
                </div>
              </div>
            ))}

            {duplas.length > 0 && (
              <Btn 
                variant="danger" 
                size="lg" 
                full 
                onClick={() => {
                  if (!confirm("Apagar todos os dados?")) return;
                  setDuplas([]);
                  toast("🗑️ Todos os dados foram apagados!");
                }}
                style={{ marginTop: "16px" }}
              >
                🔄 Iniciar Nova Prova
              </Btn>
            )}
          </div>
        )}

        {/* ── PROVA ── */}
        {aba === "resultados" && (
          <div>
            {proximaDupla && (
              <div style={{ background: "#0F1F0F", border: "1px solid #22C55E33", borderRadius: "12px", padding: "16px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "radial-gradient(circle,#22C55E18,transparent)" }} />
                <div style={{ fontSize: "10px", color: "#22C55E", letterSpacing: "2px", fontFamily: "'Oswald',sans-serif", marginBottom: "6px" }}>▶ PRÓXIMA NA ARENA</div>
                <div style={{ fontSize: "clamp(15px,4vw,25px)", fontWeight: 700, color: "#F0F0F0", fontFamily: "'Oswald',sans-serif" }}>
                  {proximaDupla.cavaleiro1} <span style={{ color: "#C98A2E" }}>&</span> {proximaDupla.cavaleiro2}
                </div>
                <div style={{ fontSize: "12px", color: "#555", marginTop: "3px" }}>🐴 {proximaDupla.cavalo1} · {proximaDupla.cavalo2}</div>
              </div>
            )}

            {duplas.length === 0 ? (
              <div style={{ textAlign: "center", color: "#333", padding: "40px 16px", border: "1px dashed #2A2A2A", borderRadius: "12px", marginBottom: "16px" }}>
                <div style={{ fontFamily: "'Oswald',sans-serif", color: "#444" }}>Cadastre duplas primeiro!</div>
              </div>
            ) : (
              <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: editandoResultadoId ? "1px solid #C98A2E66" : "1px solid #2A2A2A" }}>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
                  {editandoResultadoId ? "✏️ Editar Resultado" : "⏱️ Registrar Resultado"}
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <Select label="🤠 Selecionar Dupla" value={resultadoForm.duplaId} onChange={e => setResultadoForm(p => ({ ...p, duplaId: e.target.value }))} disabled={!!editandoResultadoId}>
                    <option value="">Selecione uma dupla...</option>
                    {duplas.map((dp, i) => <option key={dp.id} value={dp.id}>#{i + 1} {dp.cavaleiro1} & {dp.cavaleiro2}{dp.bois !== null ? ` ✓ (${dp.bois} bois · ${fmt(dp.tempo)})` : ""}</option>)}
                  </Select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <Input label="🐄 Bois Válidos (0–10)" type="number" min="0" max="10" value={resultadoForm.bois}
                    onChange={e => { const v = e.target.value; if (v === "" || (Number(v) >= 0 && Number(v) <= 10 && Number.isInteger(Number(v)))) setResultadoForm(p => ({ ...p, bois: v })); }}
                    placeholder="Ex: 8" />
                  <Input label="⏱️ Tempo (segundos)" type="text" inputMode="decimal" value={resultadoForm.tempo} onChange={tempoChange} onBlur={tempoBlur} placeholder="Ex: 47.523" />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Btn variant={editandoResultadoId ? "amber" : "primary"} size="lg" full onClick={salvarResultado}>
                    {editandoResultadoId ? "💾 Salvar Alteração" : "✅ Salvar Resultado"}
                  </Btn>
                  {editandoResultadoId && <Btn variant="ghost" size="lg" onClick={cancelarEdicaoResultado}>Cancelar</Btn>}
                </div>
              </div>
            )}

            {duplas.length > 0 && (
              <div>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "11px", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                  📋 Ordem de Chamada ({comResultado.length}/{duplas.length} concluídas)
                </div>
                {duplas.map((dp, i) => {
                  const concluida = dp.bois !== null;
                  const eProx = !concluida && duplas.slice(0, i).every(d => d.bois !== null);
                  const isEd = editandoResultadoId === dp.id;
                  return (
                    <div key={dp.id} style={{
                      background: eProx ? "#0F1F0F" : isEd ? "#1A1600" : "#1E1E1E",
                      borderRadius: "10px", padding: "11px 14px", marginBottom: "7px",
                      display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s",
                      border: isEd ? "1px solid #C98A2E" : eProx ? "1px solid #22C55E44" : concluida ? "1px solid #22C55E18" : "1px solid #2A2A2A"
                    }}>
                      <div style={{ width: "26px", height: "26px", borderRadius: "6px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, fontFamily: "'Oswald',sans-serif", background: eProx ? "#22C55E22" : concluida ? "#22C55E11" : "#2A2A2A", color: eProx ? "#22C55E" : concluida ? "#22C55E88" : "#555" }}>
                        {concluida ? "✓" : i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: eProx ? "#F0F0F0" : concluida ? "#444" : "#CCC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {dp.cavaleiro1} & {dp.cavaleiro2}
                        </div>
                        {eProx && <div style={{ fontSize: "9px", color: "#22C55E", letterSpacing: "1.5px", fontFamily: "'Oswald',sans-serif", marginTop: "1px" }}>▶ PRÓXIMA</div>}
                      </div>
                      {concluida && (
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#22C55E" }}>{dp.bois} 🐄</div>
                          <div style={{ fontSize: "10px", color: "#444" }}>{fmt(dp.tempo)}</div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                        {concluida ? (
                          <>
                            <Btn variant="secondary" size="sm" onClick={() => iniciarEdicaoResultado(dp)}>✏️</Btn>
                            <Btn variant="danger" size="sm" onClick={() => limparResultado(dp.id)}>🗑️</Btn>
                          </>
                        ) : (
                          <Btn variant={eProx ? "success" : "ghost"} size="sm"
                            style={{ opacity: eProx ? 1 : 0.25 }}
                            onClick={() => { if (!eProx) return; setResultadoForm({ duplaId: dp.id, bois: "", tempo: "" }); setEditandoResultadoId(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                            {eProx ? "⏱️ Reg." : "—"}
                          </Btn>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── RANKING ── */}
        {aba === "ranking" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#141000,#1C1800)", border: "1px solid #F4C54222", borderRadius: "12px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", lineHeight: 1, marginBottom: "6px" }}>🏆</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "20px", fontWeight: 700, color: "#F4C542", letterSpacing: "2px", textTransform: "uppercase" }}>Classificação Geral</div>
              <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>Mais bois · menor tempo como desempate</div>
            </div>

            {ranking.length === 0 ? (
              <div style={{ textAlign: "center", color: "#333", padding: "48px 16px", border: "1px dashed #2A2A2A", borderRadius: "12px" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>🐄</div>
                <div style={{ fontFamily: "'Oswald',sans-serif", color: "#444" }}>Nenhum resultado registrado</div>
              </div>
            ) : (
              ranking.map((dp, i) => {
                const pod = i < 3;
                const podCores = [
                  { bg: "#141000", border: "#F4C54244", num: "#F4C542" },
                  { bg: "#141414", border: "#C0C0C044", num: "#C0C0C0" },
                  { bg: "#120E00", border: "#CD7F3244", num: "#CD7F32" },
                ];
                const c = pod ? podCores[i] : { bg: "#1E1E1E", border: "#2A2A2A", num: "#555" };
                return (
                  <div key={dp.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "10px", padding: "14px 16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", border: `2px solid ${c.num}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: pod ? "22px" : "14px", fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: c.num, flexShrink: 0 }}>
                      {pod ? medalhas[i] : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: pod ? "#F0F0F0" : "#888", fontFamily: "'Oswald',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dp.cavaleiro1} & {dp.cavaleiro2}</div>
                      <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>🐴 {dp.cavalo1} · {dp.cavalo2}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "#22C55E", fontFamily: "'Oswald',sans-serif" }}>{dp.bois} 🐄</div>
                      <div style={{ fontSize: "12px", color: "#555" }}>⏱️ {fmt(dp.tempo)}</div>
                    </div>
                  </div>
                );
              })
            )}

            {semResultado.length > 0 && (
              <div style={{ marginTop: "16px", padding: "12px", background: "#1A1A1A", borderRadius: "8px", border: "1px dashed #2A2A2A", textAlign: "center", fontSize: "12px", color: "#444" }}>
                ⏳ {semResultado.length} dupla(s) ainda sem resultado
              </div>
            )}
          </div>
        )}

        {/* ── CONTROLE DO TELÃO ── */}
        {aba === "telao" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#141000,#1C1800)", border: "1px solid #F4C54222", borderRadius: "12px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", lineHeight: 1, marginBottom: "6px" }}>🎬</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "20px", fontWeight: 700, color: "#F4C542", letterSpacing: "2px", textTransform: "uppercase" }}>Controle do Telão</div>
              <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>Controle de timer e status da prova em tempo real</div>
            </div>

            {/* Status */}
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

            {/* Dupla Atual e Próxima */}
            {proximaDupla ? (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "16px" }}>
                {/* DUPLA ATUAL */}
                <div style={{ background: "#0F2F0F", borderRadius: "12px", padding: "16px", border: "2px solid #22C55E", boxShadow: "0 0 20px rgba(34, 197, 94, 0.15)" }}>
                  <div style={{ fontSize: "14px", color: "#22C55E", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", fontFamily: "'Oswald',sans-serif", fontWeight: 700 }}>🐴 DUPLA ATUAL</div>
                  <div style={{ background: "#0B0B0B", borderRadius: "8px", padding: "14px", border: "1px solid #22C55E33" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#22C55E", fontFamily: "'Oswald',sans-serif", marginBottom: "8px" }}>
                      {proximaDupla.cavaleiro1} <span style={{ color: "#666" }}>&</span> {proximaDupla.cavaleiro2}
                    </div>
                    <div style={{ fontSize: "13px", color: "#888", fontFamily: "'Oswald',sans-serif" }}>
                      🐴 {proximaDupla.cavalo1} <span style={{ color: "#555" }}>·</span> {proximaDupla.cavalo2}
                    </div>
                  </div>
                </div>

                {/* PRÓXIMA DUPLA */}
                {semResultado.length > 1 ? (
                  <div style={{ background: "#1F1F0F", borderRadius: "12px", padding: "12px", border: "1px solid #C98A2E", boxShadow: "0 0 15px rgba(201, 138, 46, 0.1)" }}>
                    <div style={{ fontSize: "15px", color: "#C98A2E", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", fontFamily: "'Oswald',sans-serif", fontWeight: 700 }}>➡️ PRÓXIMA</div>
                    <div style={{ background: "#0B0B0B", borderRadius: "6px", padding: "10px", border: "1px solid #C98A2E22" }}>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "#C98A2E", fontFamily: "'Oswald',sans-serif", marginBottom: "4px", lineHeight: 1.2 }}>
                        {semResultado[1]?.cavaleiro1} <span style={{ color: "#555" }}>&</span> {semResultado[1]?.cavaleiro2}
                      </div>
                      <div style={{ fontSize: "10px", color: "#666", fontFamily: "'Oswald',sans-serif", lineHeight: 1.1 }}>
                        🐴 {semResultado[1]?.cavalo1} · {semResultado[1]?.cavalo2}
                      </div>
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

            {/* Timer Control */}
            <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid #2A2A2A" }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
                ⏱️ CONTROLE DE TIMER
              </div>

              {/* Display Timer Grande */}
              <div style={{ background: "#0B0B0B", borderRadius: "12px", padding: "24px", textAlign: "center", marginBottom: "16px", border: `2px solid ${timerRodando ? "#EF4444" : "#F4C542"}`, transition: "all 0.3s ease" }}>
                <div style={{ fontSize: "64px", fontWeight: 800, color: timerRodando ? "#EF4444" : "#22C55E", fontFamily: "'Courier New',monospace", letterSpacing: "-2px", marginBottom: "8px" }}>
                  {tempoTelao}
                </div>
                <div style={{ fontSize: "12px", color: timerRodando ? "#EF4444" : "#555", textTransform: "uppercase", letterSpacing: "1px", fontWeight: timerRodando ? 700 : 400 }}>
                  {timerRodando ? "⏸️ RODANDO" : "Tempo atual"}
                </div>
              </div>

              {/* Botões de Iniciar/Parar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <Btn 
                  variant="success" 
                  size="lg" 
                  full 
                  onClick={() => {
                    if (!timerRodando) {
                      setTempoTelao("00.000");
                      setTempoInicial(null);
                      setTimerRodando(true);
                    }
                  }}
                  disabled={timerRodando}
                  style={{ opacity: timerRodando ? 0.5 : 1, cursor: timerRodando ? "not-allowed" : "pointer" }}
                >
                  ▶️ Iniciar
                </Btn>
                <Btn 
                  variant="danger" 
                  size="lg" 
                  full 
                  onClick={() => setTimerRodando(false)}
                  disabled={!timerRodando}
                  style={{ opacity: !timerRodando ? 0.5 : 1, cursor: !timerRodando ? "not-allowed" : "pointer" }}
                >
                  ⏸️ Parar
                </Btn>
              </div>

              {/* Input Timer */}
              <div style={{ marginBottom: "14px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                <div>
                  <Input 
                    label="⏱️ Ajustar Tempo (MM.mmm)"
                    value={tempoTelao}
                    onChange={e => {
                      let v = e.target.value.replace(",", ".");
                      if (v === "" || /^\d{0,2}([.,]\d{0,3})?$/.test(v)) {
                        setTempoTelao(v || "00.000");
                        setTimerRodando(false);
                      }
                    }}
                    placeholder="00.000"
                    disabled={timerRodando}
                  />
                </div>
                <div>
                  <Input 
                    label="🐄 Bois (0-10)"
                    value={boisTelao}
                    onChange={e => {
                      let v = e.target.value;
                      if (v === "" || /^\d{0,2}$/.test(v)) {
                        const num = parseInt(v);
                        if (v === "" || (num >= 0 && num <= 10)) {
                          setBoisTelao(v);
                        }
                      }
                    }}
                    placeholder="0"
                    disabled={timerRodando}
                    type="number"
                  />
                </div>
              </div>

              {/* Botões de Controle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <Btn 
                  variant="primary" 
                  size="lg" 
                  full 
                  onClick={() => {
                    setTempoTelao("00.000");
                    setTimerRodando(false);
                  }}
                  disabled={timerRodando}
                >
                  🔄 Resetar
                </Btn>
                <Btn 
                  variant="success" 
                  size="lg" 
                  full 
                  onClick={() => {
                    const [m, s] = tempoTelao.split('.').map(Number);
                    const novoS = (s + 1) % 60;
                    const novoM = m + (novoS === 0 && s === 59 ? 1 : 0);
                    setTempoTelao(`${String(novoM).padStart(2, '0')}.${String(novoS).padStart(2, '0')}`);
                  }}
                  disabled={timerRodando}
                >
                  ➕ +1s
                </Btn>
                <Btn 
                  variant="danger" 
                  size="lg" 
                  full 
                  onClick={() => {
                    const [m, s] = tempoTelao.split('.').map(Number);
                    const novoS = s > 0 ? s - 1 : 59;
                    const novoM = s > 0 ? m : Math.max(0, m - 1);
                    setTempoTelao(`${String(novoM).padStart(2, '0')}.${String(novoS).padStart(2, '0')}`);
                  }}
                  disabled={timerRodando}
                >
                  ➖ -1s
                </Btn>
              </div>

              {/* Botões Principais */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Btn 
                  variant="success" 
                  size="lg" 
                  full 
                  onClick={abrirTelao}
                  style={{ fontSize: "14px" }}
                >
                  🪟 Abrir Telão
                </Btn>
                <Btn 
                  variant="amber" 
                  size="lg" 
                  full 
                  onClick={() => {
                    const proximaDupla = duplas.find(d => d.bois === null);
                    if (!proximaDupla) {
                      toast("❌ Nenhuma dupla sem tempo!");
                      return;
                    }
                    
                    if (boisTelao === "") {
                      toast("❌ Digite o número de bois!", "erro");
                      return;
                    }
                    
                    const bois = parseInt(boisTelao);
                    if (isNaN(bois) || bois < 0 || bois > 10) {
                      toast("❌ Bois devem ser entre 0 e 10!", "erro");
                      return;
                    }
                    
                    // Converte tempo de formato "MM.mmm" para segundos decimal
                    const [segundos, milisegundos] = tempoTelao.split('.').map(Number);
                    const tempoEmSegundos = segundos + (milisegundos / 1000);
                    
                    // Atualiza a dupla com tempo E bois
                    setDuplas(duplas.map(d => 
                      d.id === proximaDupla.id 
                        ? { ...d, tempo: tempoEmSegundos, bois: bois }
                        : d
                    ));
                    
                    toast("✅ Dupla finalizada: " + proximaDupla.cavaleiro1 + " - " + bois + " bois");
                    
                    // Reseta os campos
                    setTempoTelao("00.000");
                    setBoisTelao("");
                    setTimerRodando(false);
                  }}
                  style={{ fontSize: "14px" }}
                >
                  ✅ Finalizar Dupla
                </Btn>
              </div>
            </div>

            {/* Info */}
            <div style={{ background: "#0F1F0F", border: "1px solid #22C55E33", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "#22C55E", lineHeight: 1.6 }}>
                💡 <strong>Dica:</strong> Clique em "Abrir Telão" para exibir em outra janela. Controle o timer aqui e os dados serão atualizados em tempo real no telão.
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        button{touch-action:manipulation}
        input::placeholder{color:#333}
        select option{background:#252525;color:#F0F0F0}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>
    </div>
  );
}