# Guia de Configuracao do Supabase

## 1. Acesse o Supabase Console

- Vá para: https://app.supabase/

## 2. Crie um Projeto

- Clique em "New Project"
- Nome: Trench Finance
- Regiao: escolha a proxima de voce
- Senha: crie uma senha forte
- Anote a URL do projeto (ex: `https://msrpgopzmmntyigbcaug.supabase.co`)

## 3. Cole a Chave API

No painel lateral esquerdo, clique em "Settings" > "API":

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Chave publica (Project Settings > API)
- `SUPABASE_SERVICE_KEY`: Chave secreta (Project Settings > API)

Substitua no arquivo `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
SUPABASE_SERVICE_KEY=sua_chave_secreta
```

## 4. Execute o Script de Configuracao

```bash
node scripts/setup-supabase.js
```

Este script:
- Cria todas as tabelas do banco (empresas, usuarios, lancamentos, etc.)
- Configura as politicas de Row Level Security (RLS)

## 5. Configuracao de Autenticacao (OAuth)

No painel lateral, clique em "Authentication" > "Providers":

### Google OAuth
- Habilite "Google"
- Vá em "Google Cloud Console" > "APIs & Services" > "Credentials"
- Crie "OAuth 2.0 Client ID" (aplicacao web)
- Adicione URL de redirecionamento: `http://localhost:3000/auth/callback`
- Cole o Client ID e Client Secret no Supabase

### Apple OAuth (opcional)
- Habilite "Apple"
- Use o Service ID e Key do App Developer

## 6. Estrutura do Banco

Tabelas criadas pelo script:
- `empresas` - Empresas/corporacoes
- `profiles` - Perfis de usuario (1:1 com auth.users)
- `modulos` - Modulos do sistema (Dashboard, Cadastros, etc.)
- `empresa_modulos` - Modulos habilitados por empresa
- `permissoes` - Permissoes de usuario por modulo (Create, Edit, Delete)
- `lancamentos` - Lancamentos financeiros
- `contas` - Contas a pagar/receber
- `cotacoes` - Historico de cotacoes de moedas

## 7. Teste

```bash
npm run dev
```

Acesse: http://localhost:3000

## Arquivos

- `scripts/setup-supabase.js` - Script de configuracao do banco de dados
- `scripts/supabase-schema.sql` - Schema SQL das tabelas
- `app/lib/supabase.ts` - cliente Supabase
- `app/lib/supabase-context.tsx` - Contexto de autenticacao