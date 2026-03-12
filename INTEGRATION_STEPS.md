# Instruções de Integração do Arena Screen

## 📦 Arquivos Modificados / Criados

| Arquivo | Status | Ação |
|---------|--------|------|
| `src/ArenaScreen.jsx` | ✅ NOVO | Copiar para o projeto |
| `src/App.jsx` | ✅ MODIFICADO | Merge de 3 mudanças |

---

## ⚙️ Passo-a-Passo de Integração Manual

### Passo 1: Criar ArenaScreen.jsx
**Arquivo**: `src/ArenaScreen.jsx`

Copie TODO o conteúdo do arquivo `src/ArenaScreen.jsx` fornecido.

### Passo 2: Modificar App.jsx - Import

**Localização**: Linha 1 do `src/App.jsx`

**Adicione**:
```jsx
import ArenaScreen from "./ArenaScreen";
```

**Resultado**:
```jsx
import { useState, useEffect } from "react";
import ArenaScreen from "./ArenaScreen";
```

---

### Passo 3: Adicionar Estados

**Localização**: Dentro de `export default function RanchSortingApp()`, após as declarações de estado existentes

**Procure por**:
```jsx
const [editandoResultadoId, setEditandoResultadoId] = useState(null);
```

**Adicione após**:
```jsx
const [modoTelao, setModoTelao] = useState(false);
const [tempoTelao, setTempoTelao] = useState("00.00");
```

**Contexto completo**:
```jsx
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
  // ↓ ADICIONE ESTAS 2 LINHAS ↓
  const [modoTelao, setModoTelao] = useState(false);
  const [tempoTelao, setTempoTelao] = useState("00.00");
```

---

### Passo 4: Adicionar Renderização Condicional

**Localização**: Após `const tempoBlur = ...` e antes do `if (carregando) return`

**Encontre este trecho**:
```jsx
  const tempoBlur = e => setResultadoForm(p => ({ ...p, tempo: e.target.value.replace(",", ".") }));

  if (carregando) return (
```

**Substitua por**:
```jsx
  const tempoBlur = e => setResultadoForm(p => ({ ...p, tempo: e.target.value.replace(",", ".") }));

  if (carregando) return (
    <div style={{ minHeight: "100vh", background: "#121212", display: "flex", alignItems: "center", justifyContent: "center", color: "#F4C542", fontFamily: "'Oswald',sans-serif", fontSize: "20px", gap: "12px" }}>
      <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: "32px" }}>🐄</span>
      Carregando...
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ─── ARENA SCREEN MODE ───────────────────────────────────────────────────────
  if (modoTelao) {
    return (
      <ArenaScreen
        duplas={duplas}
        ranking={ranking}
        tempo={tempoTelao}
        sair={() => setModoTelao(false)}
      />
    );
  }

  // ─── MAIN APP ────────────────────────────────────────────────────────────────

  return (
```

---

### Passo 5: Adicionar Botão no Header

**Localização**: No JSX do Header, seção "direita"

**Encontre este trecho**:
```jsx
      {/* HEADER */}
      <div style={{ background: "#1A1A1A", borderBottom: "1px solid #2A2A2A", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={LOGO_B64} alt="Logo" style={{ height: "38px", objectFit: "contain", mixBlendMode: "screen" }} />
          <div>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(15px,4vw,20px)", fontWeight: 700, color: "#F4C542", letterSpacing: "2px", textTransform: "uppercase", lineHeight: 1 }}>Ranch Sorting</div>
            <div style={{ fontSize: "10px", color: "#C98A2E", letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px" }}>Manejo Soluções</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E", animation: "pulse 2s infinite" }}></div>
          <span style={{ fontSize: "11px", color: "#22C55E", fontFamily: "'Oswald',sans-serif", letterSpacing: "0.5px" }}>AO VIVO</span>
        </div>
      </div>
```

**Substitua por**:
```jsx
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
          <button onClick={() => setModoTelao(true)} style={{
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
            <span style={{ fontSize: "16px" }}>📺</span>
            Telão
          </button>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E", animation: "pulse 2s infinite" }}></div>
          <span style={{ fontSize: "11px", color: "#22C55E", fontFamily: "'Oswald',sans-serif", letterSpacing: "0.5px" }}>AO VIVO</span>
        </div>
      </div>
```

---

## ✅ Checklist de Integração

- [ ] Arquivo `src/ArenaScreen.jsx` criado
- [ ] Import de `ArenaScreen` adicionado na linha 1
- [ ] Estados `modoTelao` e `tempoTelao` adicionados
- [ ] Bloco condicional `if (modoTelao)` adicionado
- [ ] Botão "📺 Telão" adicionado no header
- [ ] Aplicação recarregada (dev server)
- [ ] Botão "📺 Telão" aparece no header
- [ ] Clique no botão ativa Arena Screen em fullscreen
- [ ] Arena Screen exibe: título, timer, próxima dupla, top 5
- [ ] Clique no botão vermelho (✕) fecha Arena Screen
- [ ] Voltou para a app principal intacta

---

## 🧪 Teste Manual

### Teste 1: Ativar Arena Screen
1. Acesse a aplicação
2. Clique em **"📺 Telão"**
3. ✅ Esperado: Tela fullscreen aparece com Arena Screen

### Teste 2: Verificar Exibição
1. Confirme que exibe:
   - Título "🐄 Ranch Sorting 🐴"
   - Timer gigante em verde (padrão "00.00")
   - Próxima dupla (ou "PROVA CONCLUÍDA" se vazio)
   - Top 5 ranking com animações

### Teste 3: Sair do Arena Screen
1. Clique no botão vermelho **"✕"**
2. ✅ Esperado: Volta para app principal intacta

### Teste 4: Verificar Dados
1. Cadastre 3 duplas
2. Registre resultados para 2 delas
3. Ative Arena Screen
4. ✅ Esperado: Mostra próxima dupla e ranking correto

---

## 🐛 Troubleshooting

### Arena Screen não aparece
- [ ] Verify browser console for import errors
- [ ] Check if `ArenaScreen.jsx` exists in `src/`
- [ ] Verify the import path is correct: `"./ArenaScreen"`

### Botão não funciona
- [ ] Check if `onClick={() => setModoTelao(true)}` is correct
- [ ] Verify `modoTelao` state is properly initialized
- [ ] Check browser console for React errors

### Timer não aparece
- [ ] Verify `tempoTelao` has default value: `"00.00"`
- [ ] Check if ArenaScreen is receiving `tempo` prop
- [ ] Inspect element to see if `.arena-timer` has content

### Ranking vazio em Arena Screen
- [ ] Ensure `ranking` is properly calculated in App.jsx
- [ ] Verify results are being registered (check "Concluídas" count)
- [ ] Check if ranking has data before ArenaScreen render

---

## 📞 Suporte

Para questões sobre integração, verifique:
1. Console do navegador (F12) para erros
2. Se todos os Passos 1-5 foram seguidos
3. Se a aplicação foi recarregada após mudanças
4. Se os arquivos estão no diretório correto

---

**Versão**: 1.0
**Data**: 12 de março de 2026
**Status**: ✅ Ready to integrate
