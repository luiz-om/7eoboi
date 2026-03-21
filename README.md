# Ranch Sorting

Sistema de gerenciamento de provas de Ranch Sorting com:

- autenticacao via Supabase
- cadastro de provas e duplas
- registro de resultados
- ranking em tempo real
- telao em janela separada
- exportacao de ranking e certificados

## Documentacao

A documentacao tecnica e funcional completa esta em:

- [DOCUMENTACAO_SISTEMA.md](/Users/luizom/Documents/Projetos/7Eoboi/DOCUMENTACAO_SISTEMA.md)

## Comandos

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm test`

## Variaveis de ambiente

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Roteiro de demonstracao (demo)

1. **Criar prova** — aba _Provas_ → botão _Nova Prova_ → preencher nome e salvar
2. **Cadastrar duplas** — aba _Duplas_ → adicionar pelo menos 3 duplas com nomes e cavalos
3. **Abrir Telão** — botão _🖥 Telão_ no cabeçalho (ou aba _Controle_) → abre em nova janela
4. **Iniciar cronômetro** — aba _Controle_ → clicar _▶ Iniciar_ → observar **● AO VIVO** piscando no telão e o contador correndo
5. **Parar cronômetro** — clicar _⏸ Parar_ → AO VIVO some, tempo fica congelado no telão
6. **Finalizar dupla** — digitar número de bois (0–10) e clicar _✅ Finalizar Dupla_ → ranking atualiza no telão
7. **Testar SAT** — iniciar timer para a próxima dupla e clicar _SAT_ → dupla marcada, telão avança
8. **Erro de validação** — clicar _✅ Finalizar_ sem digitar bois → campo fica vermelho com destaque
9. **Verificar ranking** — aba _Ranking_ → top 5 aparece no telão em tempo real
10. **Exportar CSV** — aba _Ranking_ → botão _Exportar CSV_

### Dicas para a apresentacao

- Deixe a janela do telão num monitor externo ou projetor (tela cheia com F11)
- O telão atualiza sozinho via BroadcastChannel — sem necessidade de recarregar
- Fontes e layout se adaptam automaticamente de notebook (768 px) a TV 4K (1920 px)

Referencia:

- [.env.example](/Users/luizom/Documents/Projetos/7Eoboi/.env.example)
