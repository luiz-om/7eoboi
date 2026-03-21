# Documentacao do Sistema

## Visao Geral

Este projeto e um sistema de gerenciamento de provas de Ranch Sorting com:

- autenticacao via Supabase Auth
- persistencia de dados no Supabase Postgres
- controle de provas, duplas e resultados
- ranking em tempo real
- telao em janela separada
- exportacao de ranking
- certificados de cavalos premiados

O frontend e uma aplicacao React com Vite. O backend utilizado pelo cliente e o Supabase.

## Stack Atual

- React 19
- Vite 7
- Supabase JS 2
- Supabase Auth
- Supabase Postgres
- Supabase Realtime
- Node built-in test runner (`node:test`)

## Estrutura Principal

- [src/App.jsx](/Users/luizom/Documents/Projetos/7Eoboi/src/App.jsx): fluxo principal da aplicacao
- [src/ArenaScreen.jsx](/Users/luizom/Documents/Projetos/7Eoboi/src/ArenaScreen.jsx): telao
- [src/components/auth/AuthScreen.jsx](/Users/luizom/Documents/Projetos/7Eoboi/src/components/auth/AuthScreen.jsx): tela de login/cadastro
- [src/components/ui.jsx](/Users/luizom/Documents/Projetos/7Eoboi/src/components/ui.jsx): componentes base de interface
- [src/lib/ranchSortingApi.js](/Users/luizom/Documents/Projetos/7Eoboi/src/lib/ranchSortingApi.js): camada de acesso ao Supabase
- [src/lib/ranchSortingUtils.js](/Users/luizom/Documents/Projetos/7Eoboi/src/lib/ranchSortingUtils.js): regras puras de negocio
- [src/lib/ranchSortingUtils.test.js](/Users/luizom/Documents/Projetos/7Eoboi/src/lib/ranchSortingUtils.test.js): testes unitarios das regras
- [src/lib/supabase.js](/Users/luizom/Documents/Projetos/7Eoboi/src/lib/supabase.js): cliente Supabase
- [supabase/migrations](/Users/luizom/Documents/Projetos/7Eoboi/supabase/migrations): historico de schema e seguranca
- [public/manifest.webmanifest](/Users/luizom/Documents/Projetos/7Eoboi/public/manifest.webmanifest): manifesto estatico

## Funcionalidades Ja Implementadas

### Autenticacao

- cadastro por email e senha
- login por email e senha
- sessao persistida no cliente pelo Supabase Auth
- logout
- isolamento de dados por usuario autenticado

### Provas

- criar prova
- editar prova
- remover prova
- finalizar prova
- selecionar prova ativa
- historico de provas

Cada prova possui:

- nome
- local
- data
- observacoes
- status de finalizacao
- data/hora de finalizacao

### Duplas

- cadastrar dupla
- editar dupla
- remover dupla
- ordem de entrada por prova

Cada dupla possui:

- dois cavaleiros
- dois cavalos
- vinculacao com uma prova
- status de resultado
- quantidade de bois validos
- tempo

### Resultados

O resultado de uma dupla agora usa um modelo explicito:

- `PENDENTE`: ainda nao correu, sem `bois` e sem `tempo`
- `VALIDO`: resultado normal, com `bois` de `0` a `10` e `tempo`
- `SAT`: sem bois validos, com `tempo` e `bois = null`

### Ranking

Regras atuais:

- apenas duplas com `status = VALIDO` entram no ranking competitivo
- ordenacao por mais bois
- desempate por menor tempo
- duplas com `status = SAT` ficam fora do ranking competitivo e aparecem ao final da lista completa

### Ranking de Cavalos

O sistema gera ranking de cavalos com base no podio das provas:

- 1 lugar: 5 pontos
- 2 lugar: 3 pontos
- 3 lugar: 1 ponto

Cada dupla premiada gera premiacao para os dois cavalos.

### Telao

O sistema possui uma visao de telao em janela separada:

- mostra prova ativa
- mostra cronometro
- mostra dupla atual e proxima
- mostra top 5 do ranking
- mostra estado final da prova
- mostra mensagem de espera quando nao ha duplas e a prova nao esta finalizada

Sincronizacao atual:

- `BroadcastChannel` para sincronizar estado do timer na mesma origem
- Supabase Realtime para refletir alteracoes de provas e duplas

### Operacoes auxiliares

- exportacao de ranking em CSV
- texto formatado para WhatsApp
- impressao de certificados dos cavalos premiados
- dialogs de confirmacao consistentes para acoes destrutivas e de encerramento

## Modelo de Dados

### Tabela `public.provas`

Campos principais:

- `id`
- `nome`
- `local`
- `data`
- `observacoes`
- `finalizada`
- `finalizada_em`
- `criada_em`
- `updated_at`
- `owner_id`

### Tabela `public.duplas`

Campos principais:

- `id`
- `prova_id`
- `ordem`
- `cavaleiro1`
- `cavalo1`
- `cavaleiro2`
- `cavalo2`
- `status`
- `bois`
- `tempo`
- `criada_em`
- `updated_at`

### Integridade

Regras de consistencia relevantes:

- `ordem > 0`
- uma dupla nao pode repetir a mesma `ordem` dentro da mesma prova
- `status` deve ser `PENDENTE`, `VALIDO` ou `SAT`
- `tempo` precisa ser maior que zero quando informado
- combinacao de `status`, `bois` e `tempo` precisa ser valida

## Autenticacao e Seguranca

### Estado atual

O modelo final em uso e por usuario autenticado:

- login real com email e senha
- `owner_id` em `public.provas` com `default auth.uid()`
- RLS para cada usuario ver e alterar apenas as proprias provas
- `duplas` acessiveis apenas quando pertencem a uma prova do usuario autenticado

### Importante

Houve migracoes intermediarias para acesso publico e `anon`, mas o estado final do sistema esta no modelo autenticado por usuario.

As migracoes historicas registram essa evolucao:

- criacao inicial do schema
- fase temporaria com acesso `anon`
- endurecimento do RLS
- restauracao do modelo com `owner_id`
- separacao de `status` e `bois`

## Fluxo de Aplicacao

### Inicializacao

1. O cliente verifica a sessao com Supabase Auth.
2. Se nao houver sessao, renderiza a tela de autenticacao.
3. Se houver sessao, carrega provas e duplas.
4. Abre canal de Realtime para `provas` e `duplas`.

### Fluxo de prova

1. Usuario cria ou seleciona uma prova.
2. Usuario cadastra as duplas.
3. Na aba de prova/telao, controla o cronometro.
4. Registra resultado valido ou SAT.
5. Finaliza a prova.
6. Ranking historico e certificados ficam disponiveis.

## Regras de Negocio Ja Codificadas

- duplas de prova finalizada nao podem ser alteradas
- resultados de prova finalizada nao podem ser alterados no fluxo normal
- SAT conta como dupla concluida, mas nao entra no ranking competitivo
- ranking completo concatena classificados validos e SATs
- certificados sao liberados apos a finalizacao da prova
- ranking de cavalos pode ser calculado por prova ou apenas em provas finalizadas

## Testes

Os testes automatizados atuais cobrem as regras puras em [ranchSortingUtils.test.js](/Users/luizom/Documents/Projetos/7Eoboi/src/lib/ranchSortingUtils.test.js):

- ordenacao do ranking
- desempate por tempo
- exclusao de SAT e pendentes do ranking valido
- lista completa com SAT ao final
- estado concluido e formatacao de resultado
- premiacao e ranking de cavalos

## Comandos do Projeto

- `npm run dev`: ambiente local
- `npm run build`: build de producao
- `npm run lint`: lint
- `npm test`: testes unitarios

## Variaveis de Ambiente

Necessarias no frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Referencia:

- [.env.example](/Users/luizom/Documents/Projetos/7Eoboi/.env.example)

## Deploy

O projeto esta preparado para deploy estatico do frontend, por exemplo na Vercel.

Pontos importantes:

- configurar as variaveis `VITE_...` no provedor de deploy
- garantir que o Supabase Auth esteja com o provider de `Email` habilitado
- se `Email Confirmations` estiver ativo, o cadastro pode exigir confirmacao antes da sessao

## Migrations Relevantes

- [20260313_create_ranch_sorting_tables.sql](/Users/luizom/Documents/Projetos/7Eoboi/supabase/migrations/20260313_create_ranch_sorting_tables.sql)
- [20260313_enable_realtime_for_ranch_sorting.sql](/Users/luizom/Documents/Projetos/7Eoboi/supabase/migrations/20260313_enable_realtime_for_ranch_sorting.sql)
- [20260313_harden_ranch_sorting_rls.sql](/Users/luizom/Documents/Projetos/7Eoboi/supabase/migrations/20260313_harden_ranch_sorting_rls.sql)
- [20260313_restore_owner_based_security.sql](/Users/luizom/Documents/Projetos/7Eoboi/supabase/migrations/20260313_restore_owner_based_security.sql)
- [20260313_split_dupla_result_status.sql](/Users/luizom/Documents/Projetos/7Eoboi/supabase/migrations/20260313_split_dupla_result_status.sql)

## Limitacoes e Observacoes Atuais

- `App.jsx` ainda concentra boa parte da orquestracao da interface
- o sistema depende do cliente frontend para as operacoes administrativas
- o telão usa a mesma aplicacao com `query params`
- nao existe ainda tabela de perfil publico do usuario, apenas o `auth.users` do Supabase
- o README raiz ainda e o template padrao do Vite e merece ser substituido por documentacao do produto

## Proximos Melhoramentos Naturais

- quebrar `App.jsx` em hooks e modulos de tela
- criar uma tabela `profiles` se for necessario guardar metadados do usuario
- ampliar a cobertura de testes para fluxos de exportacao e regras de telao
