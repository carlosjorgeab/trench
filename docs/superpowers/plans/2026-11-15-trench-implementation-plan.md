# Plano de Implementacao - TRENCH

## Visao Geral
Implementar app de Financas Corporativas: Next.js + Docker + Supabase + MUI.

## Estrutura
- /web: Next.js 14+ (React + TypeScript + MUI) - frontend e backend em um unico servico
- /docker: Dockerfile + docker-compose.yml
- Supabase: banco de dados (projeto msrpgopzmmntyigbcaug)

## Modulos (Ordem de Implementacao)
1. Ambiente Docker (docker-compose com web)
2. Frontend Next.js (estrutura base + tema MUI)
3. Banco Supabase (tabelas base)
4. Autenticacao Supabase (email/senha + Google + Apple OAuth)
5. Cadastros (Empresas, Clientes, Fornecedores, Contas, Cidades, FormasPagamento, CentrosCustos, PlanoContas)
6. Lancamentos Financeiros (com anexos)
7. Prestacao de Contas
8. Cotacao de Moedas (ExchangeRate API - tier gratuito)
9. Configuracao de Tema (Dark/Claro + cores)
10. Gestao de Acesso (Multi-Empresa + permissoes por modulo)

## Tecnologias
- Frontend: Next.js 14+, React 18+, TypeScript 5+, MUI 5+, React Router
- Banco: Supabase (PostgreSQL, tempo real, storage, auth)
- Container: Docker 24+, docker-compose
- API de Cotacao: ExchangeRate API (gratuita)

## Tabelas Supabase
Empresas, Lancamentos, Contas, Cidades, FormasPagamento, CentrosCustos, PlanoContas, Clientes, Fornecedores, Profiles, Permissoes, Configuracoes, CotacaoMoedas, AnexosLancamento

## Status
- [x] PRD aprovado
- [x] Plano criado
- [x] Migracao AppWrite -> Supabase
- [x] Estrutura base Next.js
- [x] Componentes UI (sidebar, button, card, stat-card, table, currency, input, label, select)
- [x] API de cotacao (/api/cotacao)
- [x] Autenticacao Supabase (contexto + provedor)
- [ ] Banco de dados Supabase (schema SQL)
- [ ] Cadastros (Empresas, Clientes, Fornecedores, etc.)
- [ ] Lancamentos Financeiros
- [ ] Prestacao de Contas
- [ ] Cotacao de Moedas
- [ ] Configuracao de Tema
- [ ] Gestao de Acesso