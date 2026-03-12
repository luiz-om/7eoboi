# Arena Screen - Guia Visual e Arquitetura

## 📐 Layout do Arena Screen

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ╔══════════════════════════════════════════════════════╗  │
│   ║  🐄 RANCH SORTING 🐴 - MANEJO SOLUÇÕES              ║  │
│   ╚══════════════════════════════════════════════════════╝  │
│   ════════════════════════════════════════════════════════  │
│   (Border ouro #F4C542)                                     │
│                                                              │
│                                                              │
│                       ⏱️ TIMER GIGANTE ⏱️                    │
│                                                              │
│                       2 2 . 5 4 1                           │
│                    (font-size: 120-220px)                   │
│                    (color: #22C55E - verde)                │
│                                                              │
│                    T E M P O                                │
│                   (label ouro)                              │
│                                                              │
│   ┌────────────────────────────────────────────────────┐  │
│   │  ▶ PRÓXIMA DUPLA                                  │  │
│   │  ─────────────────                                 │  │
│   │  João & Pedro                                      │  │
│   │  🐴 Cavalo1 • Cavalo2                             │  │
│   │                                                    │  │
│   │  (Border: #F4C542, texto grande)                  │  │
│   └────────────────────────────────────────────────────┘  │
│                                                              │
│   ════════════════════════════════════════════════════════  │
│   (Border ouro #F4C542)                                     │
│                                                              │
│          🏆 TOP 5 RANKING 🏆                                │
│   ┌──────────────┬────────────────┬───────────┐             │
│   │🥇 João&Pedro│🐄 10  │ 34.221s│           │             │
│   │🥈 Carlos&Tg │🐄  9  │ 36.110s│           │             │
│   │🥉 Marcos&Lu │🐄  9  │ 38.222s│           │             │
│   │ 4 Ana&Bruno │🐄  8  │ 40.333s│           │             │
│   │ 5 Jose&Luis │🐄  8  │ 42.444s│           │             │
│   └──────────────┴────────────────┴───────────┘             │
│                                                              │
│                  [✕] (botão vermelho)                       │
│                 (canto inferior direito)                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Fundo: #0B0B0B (preto escuro)
Position: fixed, fullscreen, z-index: 9999
```

---

## 🎨 Componentes e Cores

### Header
```
┌─────────────────────────────────────────────────────────┐
│  🐄 RANCH SORTING 🐴 - MANEJO SOLUÇÕES                  │
│                                                         │
│  Cor: #F4C542 (ouro)                                    │
│  Font: Oswald, 48px-64px, bold                         │
│  Background: linear-gradient(#1A1A1A → #0B0B0B)       │
│  Border-bottom: 3px solid #F4C542                      │
└─────────────────────────────────────────────────────────┘
```

### Timer
```
2 2 . 5 4 1

Font-size: 120px - 220px (responsivo)
Font-family: 'Courier New', monospace
Color: #22C55E (verde sucesso)
Text-shadow: 0 0 30px rgba(34, 197, 94, 0.4)
Font-weight: 700
Letter-spacing: -2px
```

### Next Team Card
```
┌─────────────────────────────────────────┐
│  ▶ PRÓXIMA DUPLA                        │
│                                         │
│  João & Pedro                           │
│  🐴 Cavalo1 • Cavalo2                   │
│                                         │
│  Border: 3px solid #F4C542             │
│  Background: gradient(#1A1A1A → #242424)│
│  Padding: 24px                          │
│  Border-radius: 16px                    │
└─────────────────────────────────────────┘
```

### Ranking Row
```
🥇   João & Pedro      10 🐄     34.221s
─────────────────────────────────────────

Position: flex, gap 12px
Medal: 32px, centered
Name: 16px bold, #F0F0F0
Horses: 13px, #555
Stats: font-size 24px bold #22C55E

Animation: slide-up + fade-in (0.5s)
Delay: staggered por index
```

### Exit Button
```
    [✕]

Width/Height: 56px
Border-radius: 50%
Background: #EF4444 (vermelho)
Color: #fff
Font-size: 28px
Position: fixed bottom-24 right-24
Box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4)
Hover: scale(1.05), shadow aumenta
Active: scale(0.95)
```

---

## 📊 Estrutura de Props

```jsx
<ArenaScreen
  duplas={[
    { 
      id: "xyz123",
      cavaleiro1: "João",
      cavaleiro2: "Pedro",
      cavalo1: "Cavalo1",
      cavalo2: "Cavalo2",
      bois: 10,           // null se não terminado
      tempo: 34.221
    },
    // ... mais duplas
  ]}
  
  ranking={[
    // Calculado em App.jsx: filter + sort
    // Ordenado por: bois DESC, tempo ASC
  ]}
  
  tempo="22.541"        // String MM.SS ou MM.SSS
  
  sair={() => setModoTelao(false)}  // Callback para saída
/>
```

---

## 🎬 Fluxo de Estados

```
┌──────────────────┐
│  App.jsx State   │
├──────────────────┤
│ [modoTelao]      │ boolean
│ [tempoTelao]     │ "MM.SS"
│ [duplas]         │ array
└──────────────────┘
       ▼
   ┌─────────────────┐
   │ Renderiza?      │
   │ if (modoTelao)  │
   └─────────────────┘
       ▼
    SIM / NÃO
     / \
    /   \
  SIM   NÃO
  │      │
  ▼      ▼
ARENA  MAIN APP
SCREEN  (cadastro,
(full   resultados,
screen) ranking)
```

---

## 🔄 Ciclo de Vida

```
1. App.jsx monta
   └─> [modoTelao] = false (default)
   └─> [tempoTelao] = "00.00" (default)

2. Usuário clica "📺 Telão"
   └─> onClick={() => setModoTelao(true)}
   └─> Re-render App.jsx

3. App.jsx verifica if (modoTelao)
   └─> true → renderiza <ArenaScreen />
   └─> Recebe props: duplas, ranking, tempo, sair

4. ArenaScreen renderiza completo
   └─> Header
   └─> Timer
   └─> Next Team
   └─> Ranking (com animações)
   └─> Exit Button

5. Usuário clica "✕" (vermelho)
   └─> onClick={() => sair()}
   └─> setModoTelao(false)
   └─> Re-render App.jsx

6. if (modoTelao) é agora false
   └─> Renderiza Main App novamente
   └─> Volta para estado anterior
```

---

## 📱 Responsividade

### Mobile (< 768px)
```
┌─────────────┐
│ TITLE S     │  Title: 32px
├─────────────┤
│   TIMER     │  Timer: 80px
│   2 2 . 5 4 │
├─────────────┤
│PRÓXIMA DUPLA│  Next: 28px
│João & Pedro │
├─────────────┤
│🥇João&Pedro │  Ranking: flex-col
│ 10🐄 34.2s  │  Max-width: none
├─────────────┤
│[✕]          │  Button: 48px
└─────────────┘
```

### Tablet (768px - 1200px)
```
┌────────────────────────────┐
│  TITLE COMPLETO            │  Title: 48px
├────────────────────────────┤
│      TIMER GIGANTE         │  Timer: 120px
│      2 2 . 5 4 1           │
├────────────────────────────┤
│  PRÓXIMA DUPLA             │  Next: 40px
│  João & Pedro              │
│  🐴 Cavalo1 • Cavalo2      │
├────────────────────────────┤
│ 🥇João&P. 🥈Carlos&T. ...   │  Ranking: wrap
│ 🥉Marcos&L. 4.Ana&B. ...   │  Width: 280px
└────────────────────────────┘
           [✕]
```

### Desktop (> 1200px)
```
┌───────────────────────────────────────────────────────┐
│     🐄 RANCH SORTING 🐴 - MANEJO SOLUÇÕES             │
├───────────────────────────────────────────────────────┤
│                 TIMER MUITO GRANDE                    │
│                  2 2 . 5 4 1                          │
│                                                       │
│      ┌─────────────────────────────────────┐          │
│      │ ▶ PRÓXIMA DUPLA                     │          │
│      │ João & Pedro                        │          │
│      │ 🐴 Cavalo1 • Cavalo2               │          │
│      └─────────────────────────────────────┘          │
├───────────────────────────────────────────────────────┤
│ 🥇João&P. │ 🥈Carlos&T. │ 🥉Marcos&L. │ 4.Ana&B. │ 5 │
│  10🐄      │   9🐄       │   9🐄       │  8🐄     │   │
│  34.221s   │   36.110s   │   38.222s   │  40.333s │   │
├───────────────────────────────────────────────────────┤
                          [✕]
```

---

## 🎨 Paleta Completa

```
┌─────────────────┬──────────┬────────────────────────────┐
│ Nome            │ Hex      │ Uso                        │
├─────────────────┼──────────┼────────────────────────────┤
│ Fundo Principal │ #0B0B0B  │ Background fullscreen      │
│ Fundo Header    │ #1A1A1A  │ Header/Footer backgrounds  │
│ Acento Ouro     │ #F4C542  │ Títulos, borders, labels   │
│ Acento Bronze   │ #C98A2E  │ Separadores, secundário    │
│ Sucesso Verde   │ #22C55E  │ Timer, positivo            │
│ Texto Principal │ #F0F0F0  │ Nomes, data principal      │
│ Texto Cinza     │ #555     │ Subtítulos, secondary      │
│ Cinza Escuro    │ #2A2A2A  │ Borders, dividers          │
│ Erro Vermelho   │ #EF4444  │ Exit button                │
└─────────────────┴──────────┴────────────────────────────┘
```

---

## 🔤 Tipografia

```
┌──────────────┬──────────────┬─────────┬──────────────┐
│ Elemento     │ Font         │ Size    │ Weight       │
├──────────────┼──────────────┼─────────┼──────────────┤
│ Título       │ Oswald       │ 48-64px │ 700          │
│ Timer        │ Courier New  │ 120-220 │ 700          │
│ Label Timer  │ Oswald       │ 20-32px │ 700          │
│ Next Label   │ Oswald       │ 16-20px │ 700          │
│ Riders Name  │ Oswald       │ 28-56px │ 700          │
│ Horses       │ Inter        │ 14-28px │ 600          │
│ Rank Position│ Oswald       │ 24-32px │ 700          │
│ Rank Name    │ Oswald       │ 13-16px │ 700          │
│ Rank Stats   │ Oswald       │ 18-24px │ 800          │
│ Stats Value  │ Oswald       │ 11-14px │ 400          │
└──────────────┴──────────────┴─────────┴──────────────┘
```

---

## ⚡ Animações

### Ranking Slide-Up
```
0%    25%    50%    75%    100%
│     │      │      │      │
0     ▲      ▲      ▲      ✓
│     │      │      │      │
└─────────────────────────→ 
Time: 0.5s
Easing: ease-out
Delay: 0.1s * index
```

**CSS**:
```css
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

.arena-rank-animated {
  animation: arenaRankSlideUp 0.5s ease-out forwards;
  opacity: 0;
}
```

### Exit Button Hover
```
Normal:    [✕] (scale 1.0, shadow normal)
Hover:     [✕] (scale 1.05, shadow forte)
Active:    [✕] (scale 0.95)
```

---

## 📋 Checklist Visual

- [ ] Header exibe título + logo
- [ ] Border ouro no topo
- [ ] Timer é GIGANTE e legível
- [ ] Próxima dupla em destaque
- [ ] Ranking top 5 aparece
- [ ] Animações suaves
- [ ] Botão vermelho no canto inferior
- [ ] Tudo centralizado
- [ ] Espaçamento amplo (TV-friendly)
- [ ] Sem barras de navegação
- [ ] Sem scroll
- [ ] Tudo em fullscreen

---

## 🖥️ Dispositivos de Teste

```
Desktop (1920x1080)   ✅ Perfeito
Laptop (1366x768)     ✅ Bom
Tablet (768x1024)     ✅ Responsivo
Phone (375x667)       ✅ Mobile-friendly
TV (3840x2160) 4K     ✅ Escalável
TV (1280x720) 720p    ✅ Otimizado
```

---

## 🎯 Métricas de Tamanho

```
Arena Screen
├─ Header: 60px
├─ Main (flex): flex 1
├─ Ranking: auto (120px-160px)
└─ Footer: safe area

Espaçamento
├─ Padding: 24px-32px
├─ Gap: 20px-48px (responsivo)
├─ Border-radius: 12px-16px
└─ Transitions: 0.15s-0.5s
```

---

**Versão**: 1.0  
**Data**: 12 de março de 2026
