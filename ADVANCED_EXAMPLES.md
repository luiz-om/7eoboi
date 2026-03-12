# Arena Screen - Exemplos de Uso Avançado

## 🎯 Casos de Uso

### 1. Controlar o Timer em Tempo Real

Você pode adicionar inputs para controlar o timer do Arena Screen:

```jsx
// No App.jsx, dentro do conteúdo principal
{aba === "telao" && (
  <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
    <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
      ⏱️ Controlar Timer do Telão
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
      <Input 
        label="Tempo (MM.SS)" 
        value={tempoTelao} 
        onChange={e => setTempoTelao(e.target.value)} 
        placeholder="00.00"
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <Btn variant="primary" size="lg" onClick={() => setTempoTelao("00.00")}>
          Reset
        </Btn>
        <Btn variant="success" size="lg" onClick={() => setModoTelao(true)}>
          📺 Preview
        </Btn>
      </div>
    </div>
  </div>
)}
```

**Adicione na barra de tabs**:
```jsx
{ id: "telao", label: "Telão", icon: "📺" },
```

---

### 2. Ativar Arena Screen com Atalho de Teclado

```jsx
// No App.jsx, dentro do useEffect principal
useEffect(() => {
  const handleKeyPress = (e) => {
    // Ctrl+T = Toggle Arena Screen
    if (e.ctrlKey && e.key === 't') {
      e.preventDefault();
      setModoTelao(prev => !prev);
    }
    // F5 = Toggle Arena Screen (em full-screen)
    if (e.key === 'F5') {
      e.preventDefault();
      setModoTelao(prev => !prev);
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

### 3. Timer com Contador Automático

```jsx
// No App.jsx, adicione este useEffect
useEffect(() => {
  if (!modoTelao) return; // Só funciona em Arena Mode

  let interval;
  let [minutos, segundos] = tempoTelao.split('.').map(Number);

  interval = setInterval(() => {
    segundos += 1;
    if (segundos >= 100) {
      segundos = 0;
      minutos += 1;
    }
    const novoTempo = `${String(minutos).padStart(2, '0')}.${String(segundos).padStart(2, '0')}`;
    setTempoTelao(novoTempo);
  }, 10); // Atualiza a cada 10ms (cronômetro mais suave)

  return () => clearInterval(interval);
}, [modoTelao]);
```

---

### 4. Persistir Timer no localStorage

```jsx
// No App.jsx, adicione este useEffect
useEffect(() => {
  try {
    localStorage.setItem("tempoTelao", tempoTelao);
  } catch {}
}, [tempoTelao]);

// E ao carregar, modifique o useEffect inicial:
useEffect(() => {
  try { 
    const d = localStorage.getItem("duplas"); 
    if (d) setDuplas(JSON.parse(d));
    
    const t = localStorage.getItem("tempoTelao");
    if (t) setTempoTelao(t); // ← Adicione isto
  } catch {}
  setCarregando(false);
}, []);
```

---

### 5. Arena Screen com Transição Suave

Modifique `ArenaScreen.jsx` para adicionar fade-in/fade-out:

```jsx
// Na div principal .arena-screen, adicione:
style={{
  ...existingStyles,
  animation: "arenaFadeIn 0.3s ease-out",
}}

// Adicione ao bloco <style>:
@keyframes arenaFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

---

### 6. Arena Screen com Tema Customizável via Props

Modifique `ArenaScreen.jsx` para aceitar tema:

```jsx
export default function ArenaScreen({ 
  duplas, 
  ranking, 
  tempo, 
  sair,
  tema = {
    background: "#0B0B0B",
    acento: "#F4C542",
    sucesso: "#22C55E",
    fontColor: "#F0F0F0"
  }
}) {
  // Use tema.background em vez de #0B0B0B, etc.
  return (
    <div className="arena-screen" style={{ background: tema.background }}>
      {/* resto do código */}
    </div>
  );
}
```

**Uso no App.jsx**:
```jsx
<ArenaScreen
  duplas={duplas}
  ranking={ranking}
  tempo={tempoTelao}
  sair={() => setModoTelao(false)}
  tema={{
    background: "#000",
    acento: "#FFD700",
    sucesso: "#00FF00",
    fontColor: "#FFF"
  }}
/>
```

---

### 7. Detectar Mudanças e Animar Ranking

Adicione ao `ArenaScreen.jsx`:

```jsx
const [prevRanking, setPrevRanking] = useState([]);

useEffect(() => {
  setPrevRanking(ranking);
}, []);

// No JSX, verifique se posição mudou:
const posicaoMudou = ranking[i]?.id !== prevRanking[i]?.id;

<div 
  className={`arena-rank-row ${posicaoMudou ? "arena-rank-mudou" : ""}`}
>
  {/* ... */}
</div>

// No CSS:
@keyframes arenaRankMudou {
  from {
    background: #FFA50030;
    transform: scale(1.05);
  }
  to {
    background: #242424;
    transform: scale(1);
  }
}

.arena-rank-mudou {
  animation: arenaRankMudou 0.6s ease-out;
}
```

---

### 8. Exibir Estatísticas Adicionais

Estenda o ArenaScreen para mostrar mais dados:

```jsx
// Em ArenaScreen.jsx, adicione seção de stats
<div className="arena-stats">
  <div className="arena-stat">
    <span className="arena-stat-value">{duplas.length}</span>
    <span className="arena-stat-label">DUPLAS</span>
  </div>
  <div className="arena-stat">
    <span className="arena-stat-value">{ranking.length}</span>
    <span className="arena-stat-label">COMPLETADAS</span>
  </div>
  <div className="arena-stat">
    <span className="arena-stat-value">{duplas.length - ranking.length}</span>
    <span className="arena-stat-label">PENDENTES</span>
  </div>
</div>

// CSS:
.arena-stats {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 20px 0;
  padding: 20px;
  background: #1A1A1A;
  border-radius: 12px;
  border: 1px solid #2A2A2A;
}

.arena-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.arena-stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #F4C542;
  font-family: 'Oswald', sans-serif;
}

.arena-stat-label {
  font-size: 12px;
  color: #555;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-family: 'Oswald', sans-serif;
}
```

---

### 9. Modo Pausa/Retomada do Timer

```jsx
// No App.jsx, adicione estado
const [timerPausado, setTimerPausado] = useState(false);

// Modifique o useEffect do timer:
useEffect(() => {
  if (!modoTelao || timerPausado) return;
  
  let interval = setInterval(() => {
    setTempoTelao(prev => {
      let [minutos, segundos] = prev.split('.').map(Number);
      segundos += 1;
      if (segundos >= 100) {
        segundos = 0;
        minutos += 1;
      }
      return `${String(minutos).padStart(2, '0')}.${String(segundos).padStart(2, '0')}`;
    });
  }, 10);

  return () => clearInterval(interval);
}, [modoTelao, timerPausado]);

// Adicione botão para pausar no Arena Screen
<button onClick={() => setTimerPausado(!timerPausado)}>
  {timerPausado ? "▶️ Retomar" : "⏸️ Pausar"}
</button>
```

---

### 10. Integração com API ou WebSocket

Para sincronizar timer com servidor:

```jsx
// No App.jsx
import { useEffect } from 'react';

useEffect(() => {
  if (!modoTelao) return;

  // Conectar WebSocket
  const ws = new WebSocket('wss://seu-servidor.com/arena');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.tipo === 'timer') {
      setTempoTelao(data.valor);
    }
    if (data.tipo === 'ranking') {
      setDuplas(data.duplas);
    }
  };

  return () => ws.close();
}, [modoTelao]);
```

---

## 🎬 Exemplo Completo: Gerenciador de Timer

```jsx
// NOVO: Tab no App.jsx
{aba === "timer-control" && (
  <div>
    <div style={{ background: "#1E1E1E", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "13px", color: "#F4C542", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
        ⏱️ CONTROLE DE TIMER
      </div>

      {/* Display do Timer */}
      <div style={{ fontSize: "48px", fontWeight: 800, color: "#22C55E", textAlign: "center", marginBottom: "20px", fontFamily: "'Courier New',monospace" }}>
        {tempoTelao}
      </div>

      {/* Inputs */}
      <Input 
        label="Ajustar Tempo" 
        value={tempoTelao} 
        onChange={e => {
          const v = e.target.value;
          if (/^\d{0,2}[.,]\d{0,2}$/.test(v) || v === "") setTempoTelao(v);
        }}
        placeholder="MM.SS"
      />

      {/* Botões de Controle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "14px" }}>
        <Btn variant="primary" size="lg" full onClick={() => setTempoTelao("00.00")}>
          🔄 Reset
        </Btn>
        <Btn variant="success" size="lg" full onClick={() => {
          const [m, s] = tempoTelao.split('.').map(Number);
          const novo = `${String(m).padStart(2, '0')}.${String((s + 1) % 60).padStart(2, '0')}`;
          setTempoTelao(novo);
        }}>
          ➕ +1s
        </Btn>
        <Btn variant="danger" size="lg" full onClick={() => {
          const [m, s] = tempoTelao.split('.').map(Number);
          const novo = `${String(m).padStart(2, '0')}.${String(Math.max(0, s - 1)).padStart(2, '0')}`;
          setTempoTelao(novo);
        }}>
          ➖ -1s
        </Btn>
      </div>

      {/* Preview */}
      <Btn variant="amber" size="lg" full style={{ marginTop: "14px" }} onClick={() => setModoTelao(true)}>
        📺 VISUALIZAR TELÃO
      </Btn>
    </div>
  </div>
)}
```

---

## 📝 Dicas e Boas Práticas

1. **Performance**: Use `useCallback` para evitar re-renders desnecessários
2. **Acessibilidade**: Adicione `aria-label` aos botões e elementos interativos
3. **Responsividade**: Teste em diferentes resoluções (TV, tablet, mobile)
4. **Sincronização**: Se usar múltiplos dispositivos, use WebSocket para sync
5. **Segurança**: Valide dados antes de exibir no Arena Screen
6. **UX**: Use transições suaves entre modos
7. **Feedback**: Toque/clique deve ter feedback visual

---

**Versão**: 1.0
**Data**: 12 de março de 2026
