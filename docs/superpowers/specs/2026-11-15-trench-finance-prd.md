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
- Contas (Banco, Cartao de Credito, etc.)
- Categoria (amarrada ao Plano de Contas)
- Formas de Pagamento
- Centro de Custos

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