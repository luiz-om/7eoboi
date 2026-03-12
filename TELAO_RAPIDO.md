# ⚡ Guia Rápido - Telão em Nova Janela

## 🎯 O que mudou?

✅ **Telão agora abre em NOVA JANELA** (não mais fullscreen na mesma)  
✅ **Nova aba "🎬 Controle"** para gerenciar timer  
✅ **Sincronização automática** entre janelas  
✅ **Controles fáceis**: Reset, +1s, -1s, Finalizar  

---

## 3️⃣ Passos Simples

### 1. Vá para Aba "Controle"
Clique na **aba "🎬 Controle"** no header

### 2. Clique "Abrir Telão"
Botão **"🪟 Abrir Telão"** abre nova janela com fullscreen

### 3. Controle o Timer
Na aba "Controle":
- **Digite tempo**: MM.SS
- **Ou use botões**: 🔄 Reset | ➕ +1s | ➖ -1s
- **Finalizar**: ✅ Finalizar Prova

---

## 📊 Aba "Controle" - O que tem?

```
┌────────────────────────────────────────┐
│ 📊 STATUS DA PROVA                     │
│ [Duplas: 10] [Completadas: 6] [Pend: 4]
│                                        │
│ ⏱️ TIMER GRANDE (display)               │
│     0 0 . 0 0                          │
│                                        │
│ Input: [_________] (MM.SS)            │
│                                        │
│ Botões:                                │
│ [🔄 Reset] [➕ +1s] [➖ -1s]           │
│ [🪟 Abrir] [✅ Finalizar]              │
│                                        │
└────────────────────────────────────────┘
```

---

## 📺 Janela do Telão

```
Fullscreen, sem navegação
- Header: Ranch Sorting
- Timer GIGANTE em verde
- Próxima dupla
- Top 5 ranking
- Botão ✕ para fechar
```

---

## 🔄 Como Funciona

1. **Você ajusta timer** na aba "Controle"
2. **Salva automaticamente** em localStorage
3. **Telão (nova janela) atualiza** em tempo real
4. **Público vê alterações** imediatamente

---

## ✨ Exemplos

### Cenário 1: Simplesmente exibir
```
1. Aba Controle
2. Botão "🪟 Abrir Telão"
3. Pronto! Telão aparece
```

### Cenário 2: Controlar timer
```
1. Na aba Controle, digite "01.30"
2. Telão mostra "01.30" instantaneamente
3. Clique "➕ +1s" → "01.31"
4. Telão atualiza imediatamente
```

### Cenário 3: Finalizar prova
```
1. Dupla termina
2. Clique "✅ Finalizar Prova" na aba Controle
3. Timer reseta para "00.00"
4. Vai automaticamente para aba Ranking
```

---

## 📱 Múltiplas Janelas/Abas

```
┌─────────────────────────────────────┐
│ Laptop Juiz                         │
│ ├─ Aba: Controle (gerencia timer)  │
│ └─ Aba: Telão (exibição pública)    │
│                                     │
│ TV Arena                            │
│ └─ Mostra Telão (mesma info)        │
│                                     │
│ Smartphone Assistente               │
│ └─ Aba: Cadastro (anotações)        │
│                                     │
│ TUDO SINCRONIZADO! 🔄               │
└─────────────────────────────────────┘
```

---

## 🎮 Controles Principais

| Ação | Onde | Como |
|------|------|------|
| Abrir Telão | Aba Controle | Botão "🪟" |
| Ajustar Timer | Aba Controle | Digitar ou ±1s |
| Ver Status | Aba Controle | Display automático |
| Finalizar | Aba Controle | Botão "✅" |
| Fechar Telão | Janela Telão | Clique ✕ |

---

## 💾 Dados Salvos Automaticamente

- ✅ Timer é salvo no localStorage
- ✅ Duplas mantêm histórico
- ✅ Ao reabrir: dados voltam ao último estado
- ✅ Funciona entre abas e navegadores

---

## 🔧 Dicas

- **Primeiro**: Cadastre duplas (aba Duplas)
- **Depois**: Vá para Controle (aba Controle)
- **Então**: Abra Telão (botão "🪟")
- **Por fim**: Controle o timer e finalize

---

## ✅ Checklist de Uso

- [ ] Aba "🎬 Controle" aparece?
- [ ] Botão "🪟 Abrir Telão" funciona?
- [ ] Nova janela abre com Arena Screen?
- [ ] Timer pode ser ajustado?
- [ ] Alterações aparecem no Telão instantaneamente?
- [ ] "✅ Finalizar" funciona?
- [ ] ✕ fecha o Telão normalmente?

---

## 🎉 Pronto!

Agora você tem:
- ✅ Telão profissional em nova janela
- ✅ Controle total do timer
- ✅ Sincronização automática
- ✅ Múltiplas abas/janelas funcionando

**Aproveite! 🚀**

---

**Mais detalhes**: Veja `TELAO_NOVA_JANELA.md`  
**Data**: 12 de março de 2026
