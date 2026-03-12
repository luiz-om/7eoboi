# 🎬 Telão - Janela Separada com Controle de Timer

## ✨ Novo Fluxo de Trabalho

### Antes (fullscreen na mesma janela)
```
❌ Arena Screen reemplazava a interface principal
❌ Dificultava controle simultâneo
```

### Agora (nova janela + aba de controle) ✅
```
✅ Telão abre em nova janela/aba
✅ Controle permanece na aba "Controle"
✅ Timer sincronizado em tempo real
```

---

## 🎯 Como Usar

### 1. Acessar Controle do Telão
- Na aplicação principal, clique na **aba "🎬 Controle"**

### 2. Abrir Telão em Nova Janela
- Clique no botão **"🪟 Abrir Telão"**
- Uma nova janela/aba se abrirá com o Arena Screen fullscreen

### 3. Controlar o Timer
Na aba "Controle", você pode:

| Ação | Como Fazer |
|------|-----------|
| **Ajustar Timer** | Digite no input "MM.SS" |
| **Resetar** | Clique "🔄 Resetar" |
| **Incrementar** | Clique "➕ +1s" |
| **Decrementar** | Clique "➖ -1s" |
| **Finalizar Prova** | Clique "✅ Finalizar Prova" |

### 4. Visualizar no Telão
- O timer é exibido **em tempo real** na janela do Telão
- Qualquer alteração no timer aparece imediatamente

### 5. Fechar Telão
- Clique no **"✕"** vermelho no canto do Telão
- Ou feche a janela normalmente

---

## 📊 Layout da Aba "Controle do Telão"

```
┌────────────────────────────────────────────┐
│  🎬 Controle do Telão                      │
│  Controle de timer e status da prova       │
├────────────────────────────────────────────┤
│                                            │
│  📊 STATUS DA PROVA                        │
│  ┌──────────┬──────────┬──────────┐        │
│  │ DUPLAS   │COMPLETADAS│PENDENTES│        │
│  │   10     │    6      │   4     │        │
│  └──────────┴──────────┴──────────┘        │
│                                            │
│  ⏱️ CONTROLE DE TIMER                      │
│  ┌────────────────────────────────┐        │
│  │         0 0 . 0 0              │  ← Grande
│  │      Tempo atual               │        │
│  └────────────────────────────────┘        │
│                                            │
│  Input: [________] (MM.SS)                 │
│                                            │
│  [🔄 Resetar] [➕ +1s] [➖ -1s]            │
│  [🪟 Abrir Telão] [✅ Finalizar]           │
│                                            │
│  💡 Dica: Clique em "Abrir Telão"...      │
└────────────────────────────────────────────┘
```

---

## 🔄 Sincronização em Tempo Real

### Como Funciona

```
┌──────────────────┐
│  App Principal   │
├──────────────────┤
│ Aba "Controle"   │
│ └─ Timer control │
│   └─ localStorage │
└────────┬─────────┘
         │ Atualiza localStorage
         │
┌────────▼─────────┐
│  Nova Janela     │
├──────────────────┤
│  Telão Fullscreen│
│  └─ Lê timer     │
│    a cada render │
└──────────────────┘
```

### Storage

- **localStorage.tempoTelao** - Armazena tempo atual
- **localStorage.duplas** - Armazena dados da prova
- Sincroniza automaticamente entre abas/janelas

---

## 📱 Responsive Design

### Desktop
```
┌──────────────────────────────────────────┐
│  App com 3 abas + Controle               │
│  Janela Telão: 1920x1080                 │
└──────────────────────────────────────────┘
```

### Tablet/Mobile
```
┌──────────────────┐
│  App compacta    │
│  Abas em scroll  │
│  Controle adapta │
└──────────────────┘
```

---

## ⚙️ Funcionalidades Técnicas

### Timer com Validação
```jsx
// Formatos aceitos:
00.00  ✅ Válido
12.34  ✅ Válido
12,34  ✅ Válido (converte para ponto)
12     ❌ Inválido
```

### localStorage Persistence
```js
// Ao abrir app novamente:
- Timer retorna ao último valor salvo
- Duplas mantêm histórico
- Sincronizado entre janelas
```

### Window.open() API
```js
const url = `${baseURL}?telao=true`;
window.open(url, "telao", "width=1920,height=1080,fullscreen=yes");
```

---

## 🎬 Arena Screen (Nova Janela)

### Características
- ✅ Fullscreen automático
- ✅ Sem barra de navegação
- ✅ Sem scroll
- ✅ Atualiza timer em tempo real
- ✅ Exibe próxima dupla
- ✅ Exibe top 5 ranking
- ✅ Botão ✕ para fechar

### Parâmetros de URL
```
?telao=true  → Renderiza apenas Arena Screen
            → Carrega dados do localStorage
```

---

## 📋 Fluxo de Dados

```
1. Usuário clica "🪟 Abrir Telão"
   ↓
2. window.open() abre nova aba com ?telao=true
   ↓
3. ArenaScreen renderiza fullscreen
   ↓
4. Usuário ajusta timer na aba "Controle"
   ↓
5. setTempoTelao() atualiza state
   ↓
6. useEffect salva em localStorage
   ↓
7. Telão (nova janela) detecta mudança via polling/storage event
   ↓
8. ArenaScreen re-renderiza com novo timer
```

---

## 💾 localStorage Keys

| Chave | Tipo | Exemplo |
|-------|------|---------|
| `tempoTelao` | String | "22.541" |
| `duplas` | JSON | `[{id, cavaleiro1, ...}]` |

---

## 🔐 Eventos Sincronizados

### Storage Event (Cross-Tab Sync)
```jsx
// Detecta mudanças em outra aba
window.addEventListener('storage', (e) => {
  if (e.key === 'tempoTelao') {
    // Atualiza timer automaticamente
  }
});
```

---

## 🎯 Casos de Uso

### ✅ Competição em Arena
```
1. Aba Principal: Cadastro e resultados
2. Aba Controle: Timer e status
3. Telão: Exibição para o público (TV/Monitor)

Fluxo:
- Dupla entra na arena
- Juiz clica "Abrir Telão"
- Público vê nome, timer, ranking
- Juiz controla timer e clica "Finalizar"
```

### ✅ Modo Presentador
```
- Apresentador abre Telão em TV grande
- Controla de tablet/notebook via aba "Controle"
- Público acompanha em tempo real
```

### ✅ Múltiplas Telas
```
- TV 1: Telão (exibição)
- Laptop: Aba Controle (gerenciamento)
- Phone: Aba Cadastro (anotações)

Todos sincronizados via localStorage!
```

---

## 📊 Estrutura de Abas

```
┌─────────────────────────────────────────┐
│ [🤠] [⏱️] [🏆] [🎬]                     │
│ Duplas | Prova | Ranking | Controle    │
├─────────────────────────────────────────┤
│                                         │
│  (Conteúdo da aba ativa)                │
│                                         │
│  Aba Controle:                          │
│  - Status (duplas/completadas/pendentes)│
│  - Timer display gigante                │
│  - Input para ajustar                   │
│  - Botões: Reset, +1s, -1s              │
│  - Abrir Telão                          │
│  - Finalizar Prova                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🚀 Atalhos Recomendados

| Ação | Atalho |
|------|--------|
| Abrir Telão | Clique botão "🪟" |
| Ir para Controle | Clique aba "🎬" |
| Ajustar Timer | Digite ou use ±1s |
| Finalizar | "✅ Finalizar Prova" |
| Fechar Telão | Clique ✕ ou Alt+F4 |

---

## 🔧 Customizações

### Mudar Tamanho da Janela Telão
Em `App.jsx`, localize:
```jsx
const url = `${window.location.origin}${window.location.pathname}?telao=true`;
window.open(url, "telao", "width=1920,height=1080,fullscreen=yes");
```

Edite `width` e `height` conforme necessário.

### Adicionar Mais Abas
No array de tabs, adicione novo item:
```jsx
{ id: "sua-aba", label: "Seu Label", icon: "🎯" }
```

### Customizar Timer
Edite o Input ou botões na aba Controle conforme necessário.

---

## ⚡ Performance

- ✅ localStorage é muito rápido
- ✅ Re-renders otimizados
- ✅ Sem lag entre janelas
- ✅ Funciona em conexão lenta

---

## 🐛 Troubleshooting

### Telão não abre em nova janela
- [ ] Verificar se pop-ups estão bloqueados
- [ ] Permitir pop-ups do site
- [ ] Testar em outro navegador

### Timer não sincroniza
- [ ] Verificar localStorage: F12 → Application → localStorage
- [ ] Confirmar que tempoTelao está salvo
- [ ] Recarregar nova janela (F5)

### Dados não aparecem no Telão
- [ ] Registrar resultados primeiro
- [ ] Verificar que duplas foram cadastradas
- [ ] Abrir Telão após cadastrar

### Nova janela fecha automaticamente
- [ ] Desabilitar bloqueador de pop-ups
- [ ] Revisar configurações do navegador
- [ ] Testar com nova janela manual

---

## 📝 Resumo

| Item | Antes | Agora |
|------|-------|-------|
| **Exibição** | Fullscreen mesma janela | Nova janela/aba |
| **Controle** | Não havia | Aba "Controle" dedicada |
| **Timer** | Fixo | Ajustável em tempo real |
| **Sincronização** | Não havia | localStorage automático |
| **Flexibilidade** | Baixa | Alta |

---

**Versão**: 2.0 (Atualizado para Janela Separada)  
**Data**: 12 de março de 2026  
**Status**: ✅ Ready to Use
