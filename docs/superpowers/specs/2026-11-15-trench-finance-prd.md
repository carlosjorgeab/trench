# PRD: TRENCH - Sistema Financeiro e Prestacao de Contas

## 1. Visao Geral

O TRENCH e um aplicativo de Financas Corporativas que integra dois sistemas:
- **Sistema Financeiro**: lancamentos de contas de debito e credito com controle completo de valores, datas, vencimentos, pagamentos, juros, acrecimos, cliente/fornecedor, contas, categorias (vinculadas ao Plano de Contas), formas de pagamento e centro de custos.
- **Sistema de Prestacao de Contas**: modulo de protecao e reconciliacao de contas que utiliza os lancamentos do Sistema Financeiro como fonte de dados.

## 2. Arquitetura e Tecnologias

### 2.1 Stack Tecnologica (Node Web em Docker)
- **Backend**: Next.js API Routes + Node.js + TypeScript - API RESTful moderna, executada em Docker
- **Frontend**: Next.js + React + TypeScript + Material-UI (MUI) - segue Google Material Design
- **Banco de Dados**: Supabase (BaaS) - autenticacao, banco de dados, tempo real, storage
- **Container**: Docker - todos os servicos empacotados em containers, orquestraveis com docker-compose
- **Estilo**: UI/UX baseado nas imagens de referencia (Interface-I a Interface-IV) e Google Material Design

### 2.2 Estrutura de Servicos Docker
- Servico `web`: Next.js (frontend + backend em um unico servico)
- Arquivos de configuracao: Dockerfile, docker-compose.yml

### 2.3 Modulos do Sistema
1. Dashboard (Financeiro)
2. Cadastros (Empresas, Clientes, Fornecedores, Contas, Cidades, Formas de Pagamento, Centros de Custos, Plano de Contas, Usuários)
3. Sistema Financeiro (Lancamentos)
4. Prestacao de Contas (Protecao/Reconciliacao)
5. Configuracao (Tema do App - Dark/Claro + cores customizaveis)
6. Gestao de Acesso (Multi-Empresa + Permissoes por modulo)
7. Cotacao de Moedas Estrangeiras (recuperacao automatica em tempo real)

## 3. Requisitos Funcionais

### 3.1 Lancamento Financeiro (Sistema Financeiro)
Cada lancamento deve conter:
- Tipo: Debito ou Credito
- Descricao da Conta
- Observacao
- Valor Principal
- Juros
- Acrecimos
- Data Lancamento
- Data Vencimento
- Data Pagamento
- Cliente (Fornecdor ou Cliente de Cadastro)
- Anexos: arquivos vinculados ao lancamento (comprovantes, contratos, etc.)

Tabelas vinculadas por lancamento:
- Contas (Bancaria, Cartao de Credito)
- Categoria (amarrada ao Plano de Contas)
- Formas de Pagamento
- Centro de Custos

### 3.1.1 Planejamento: Modulo de Contas com Tipagem e Campos de Cartao de Credito

O modulo de **Contas** (`Cadastros > Contas`) devera ser expandido para suportar explicitamente a distincao entre contas bancarias e cartoes de credito, permitindo controle financeiro unificado:

1. **Tipo de Conta (`tipo`)**:
   - Campo obrigatorio do tipo enum/select com as opcoes principais:
     - `bancaria` (**Bancaria** — conta corrente, poupanca, aplicacao ou caixa)
     - `cartao_credito` (**Cartao de Credito**)
2. **Novos Campos na Tabela `contas`**:
   - **Tipo de Conta (`tipo`)**: `VARCHAR(30)` (`'bancaria'` | `'cartao_credito'`), padrao `'bancaria'`.
   - *Para Cartao de Credito*:
     - **Limite do Cartao (`limite_cartao`)**: `DECIMAL(15,2)` — valor maximo de credito disponivel no cartao.
     - **Data / Dia de Vencimento (`dia_vencimento`)**: `INTEGER` (1 a 31) para definir o vencimento mensal da fatura. Opcionalmente incluir **Dia de Fechamento (`dia_fechamento`)**.
   - *Para Conta Bancaria*:
     - **Limite da Conta Bancaria (`limite_conta`)**: `DECIMAL(15,2)` — limite de cheque especial / credito rotativo vinculado a conta corrente.
     - **Taxa de Juros (`taxa_juros_conta`)**: `DECIMAL(6,2)` — percentual de juros mensal (% a.m.) cobrado sobre o uso do limite.
     - **Data de Vencimento do Limite (`data_vencimento_limite`)**: `DATE` — data de vigencia/vencimento do contrato de limite bancario.
3. **Comportamento na Interface (`app/cadastros/contas/page.tsx`)**:
   - No formulario de criacao/edicao, exibir seletor de **Tipo de Conta** (`Bancaria` / `Cartao de Credito`).
   - Quando `Cartao de Credito` for selecionado, exibir **Limite do Cartao (R$)**, **Dia de Vencimento** e **Dia de Fechamento**.
   - Quando `Bancaria` for selecionada, exibir **Limite da Conta Bancaria (R$)**, **Taxa de Juros (% a.m.)** e **Data de Vencimento do Limite**.
   - Na tabela de listagem de contas, exibir badges visuais diferenciando `Bancaria` e `Cartao de Credito`, alem de colunas de **Limite / Juros** e **Vencimento**.

### 3.1.2 Planejamento: Controle de Cartao de Credito nos Lancamentos Financeiros

Dentro do modulo **Sistema Financeiro (Lancamentos)**, devera existir um fluxo dedicado para controlar despesas e faturas quando a conta selecionada for do tipo **Cartao de Credito**:

1. **Lancamento Vinculado a Cartao de Credito**:
   - Ao selecionar uma conta com `tipo = 'cartao_credito'` no formulario de lancamento (`/financeiro`):
     - O sistema identifica automaticamente tratar-se de despesa no cartao de credito.
     - Calcula/sugere automaticamente a `data_vencimento` com base no vencimento da fatura do cartao (considerando o ciclo de fechamento/vencimento a partir da `data_lancamento`).
     - Exibe em tempo real o **Limite Disponivel** do cartao selecionado antes da confirmacao.
2. **Suporte a Compras Parceladas no Cartao**:
   - Campos adicionais opcionais no lancamento: `parcelado` (booleano), `total_parcelas` (ex.: 1x a 24x), `parcela_atual`, `grupo_parcelamento_id` (UUID/texto para vincular todas as parcelas da mesma compra).
   - Ao salvar uma compra parcelada (ex.: R$ 1.200,00 em 3x), o sistema gera automaticamente 3 lancamentos mensais consecutivos (R$ 400,00 cada, `Parcela 1/3`, `2/3`, `3/3`), ajustando a `data_vencimento` de cada parcela para as faturas subsequentes.
3. **Controle de Limite (Utilizado vs. Disponivel)**:
   - **Limite Utilizado**: soma de todos os lancamentos com status `pendente` (faturas em aberto/futuras) vinculados ao respectivo `conta_id` do cartao.
   - **Limite Disponivel**: `limite_cartao - limite_utilizado`.
   - Exibicao de barra de progresso de consumo do limite no cabecalho/cards do modulo Financeiro (quando filtrado por cartao) e no Dashboard.
   - Alerta visual quando um novo lancamento ultrapassar o limite disponivel do cartao.
4. **Visao de Faturas & Baixa Consolidada**:
   - Filtro/aba dedicada **"Cartoes de Credito / Faturas"** dentro de `/financeiro`:
     - Agrupamento dos lancamentos por **Cartao** e **Mes/Ano de Vencimento da Fatura**.
     - Status da Fatura: **Aberta** (antes do fechamento), **Fechada / A Pagar** (apos fechamento, aguardando pagamento) e **Paga** (quitada).
   - **Pagamento de Fatura (Baixa em Lote)**:
     - Botao **"Pagar Fatura"** que permite selecionar a **Conta Bancaria** de origem do pagamento e a data de pagamento.
     - Ao confirmar: marca todos os lancamentos daquela fatura como `pago` (preenchendo `data_pagamento`) e registra a saida correspondente na conta bancaria escolhida, mantendo a conciliacao na Prestacao de Contas.
5. **Alteracoes Planejadas de Banco de Dados (Supabase)**:
   - Tabela `contas`: adicionar `limite_cartao DECIMAL(15,2)`, `dia_vencimento INTEGER`, `dia_fechamento INTEGER` (opcional) e padronizar `tipo` (`bancaria`, `cartao_credito`).
   - Tabela `lancamentos`: adicionar `parcela_atual INTEGER DEFAULT 1`, `total_parcelas INTEGER DEFAULT 1`, `grupo_parcelamento_id VARCHAR(64)`, `fatura_referencia VARCHAR(7)` (formato `YYYY-MM` para agrupamento rapido da fatura) e `conta_pagamento_id INTEGER REFERENCES contas(id)` (para rastrear qual conta bancaria quitou a fatura).
6. **Plano de Implementacao por Fases**:
   - **Fase 1 (Banco & API de Contas)**: Atualizar schema SQL no Supabase (`contas`), atualizar `/api/contas` para validar e persistir `tipo`, `limite_cartao` e `dia_vencimento`/`data_vencimento`.
   - **Fase 2 (UI de Contas)**: Atualizar `app/cadastros/contas/page.tsx` com seletor de Tipo (`Bancaria` / `Cartao de Credito`) e campos condicionais de limite e vencimento.
   - **Fase 3 (Banco & API de Lancamentos)**: Atualizar schema SQL (`lancamentos`) e `/api/lancamentos` para suportar parcelamento, `fatura_referencia`, calculo de limite utilizado/disponivel e endpoint/acao de pagamento de fatura.
   - **Fase 4 (UI Financeiro & Dashboard)**: Integrar visao de Faturas de Cartao, barra de limite disponivel, geracao de parcelas no modal de lancamento em `/financeiro` e card resumo de cartoes no `/dashboard`.

### 3.2 Sistema de Prestacao de Contas
- Utiliza lancamentos do Sistema Financeiro como fonte de dados
- Protecao de contas: identifica contas pendentes, vencidas, sem pagamento
- Reconciliacao: associa lancamentos a movimentacao bancaria
- Relatorios de prestacao de contas

### 3.3 Multi-Empresa
- Cadastro de Empresas
- Cada modulo do sistema tera como uma das chaves principais a Empresa
- Cadastro de Empresa com dados corporativos

### 3.4 Cadastro de Usuario
- Dados de acesso (email, senha)
- Sistema proprio de autenticacao usando Supabase Auth (email/senha)
- Provedores habilitados: Google e Apple (OAuth)
- Selecao de empresas as quais o usuario tera acesso
- Controle de permissoes por modulo: Criar, Alterar, Deletar
- Cada modulo podera ter permissao individual de acesso

### 3.5 Modulo de Configuracao
- Alteracao de Tema do App: Modo Dark/Claro
- Alteracao de cores gerais do Sistema (tema customizavel)
- Preferencia de tema por usuario com possibilidade de override por administrador

### 3.6 Modulo de Cotacao de Moedas Estrangeiras
- Recuperacao automatica em tempo real das cotacoes das principais moedas do mundo
- Inclui o Real (R$) como moeda base de referencia
- Historico de cotacoes por moeda
- Atualizacao periodica (polling ou webhook) das taxas de cambio
- Conversao entre moedas (ex.: USD -> EUR, EUR -> BRL)
- Moedas suportadas: USD, EUR, GBP, JPY, CAD, AUD, CHF, BRL, ARS, CLP, COP, PEN, CNY, INR, entre outras principais
- Integracao com API de cotacao: ExchangeRate API (https://exchangerate-api.com) - tier gratuito com 1.500 requisicoes/mes, suporte a 150+ moedas
- Chave de API gerada de forma gratuita no site do provedor

### 3.7 Banco de Dados Supabase
- Utiliza Supabase como banco de dados principal (PostgreSQL)
- Tabelas: Empresas, Lancamentos, Contas, Cidades, FormasPagamento, CentrosCustos, PlanoContas, Clientes, Fornecedores, Profiles, Permissoes, Configuracoes, CotacaoMoedas, AnexosLancamento

## 4. Requisitos Nao Funcionais
- Interface responsiva (desktop e tablet)
- Design System Material Design
- Tempo de resposta rapido
- Dados protegidos via autenticacao Supabase
- Multi-idioma (Portugues)

## 5. Interface de Referencia
- As imagens em /images servem de exemplo para a Interface
- Interface-I: Dashboard com graficos e tabelas
- Interface-II: Formulario de lancamento
- Interface-III: Lista de lancamentos com filtros
- Interface-IV: Detalhe de lancamento e prestacao de contas

## 6. Estado Atual
- Repo: trench (git init ja existente)
- README existente: "Sistema Financeiro e Prestacao de Contas"
- Pasta /images com 4 imagens de referencia

## 7. Proximos Passos
1. Aprovar este PRD
2. Criar Roteiro detalhado (Implementation Plan)
3. Implementar modulo por modulo