-- ============================================================
-- TRENCH - Migration: Pre-registro de Empresas e Usuarios
-- Execute no Supabase: Dashboard > SQL Editor > New Query
-- ============================================================

-- ⚠ IMPORTANTE: Execute cada bloco separadamente se houver erros

-- -------------------------------------------------------
-- 1. Adicionar colunas na tabela empresas (caso existam)
-- -------------------------------------------------------
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS tipo     text DEFAULT 'filial';
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS cnpj     text;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS email    text;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS telefone text;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ativo    boolean DEFAULT true;

-- -------------------------------------------------------
-- 2. Tabela de Solicitacoes de Cadastro de Empresa
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.solicitacoes_empresa (
  id                bigserial PRIMARY KEY,
  razao_social      text NOT NULL,
  nome_fantasia     text,
  cnpj              text,
  email             text NOT NULL,
  telefone          text,
  responsavel       text NOT NULL,
  cargo_responsavel text,
  tipo_empresa      text DEFAULT 'filial',
  mensagem          text,
  status            text NOT NULL DEFAULT 'pendente'
                      CHECK (status IN ('pendente','aprovado','rejeitado')),
  observacao_admin  text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- -------------------------------------------------------
-- 3. Tabela de Usuarios do sistema
--    Vincula auth.users (Supabase Auth) ao perfil do app
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usuarios (
  id          bigserial PRIMARY KEY,
  auth_id     uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        text NOT NULL,
  email       text NOT NULL,
  perfil      text NOT NULL DEFAULT 'usuario'
                CHECK (perfil IN ('admin_sistema','admin_empresa','gestor','analista','usuario')),
  empresa_id  bigint REFERENCES public.empresas(id) ON DELETE SET NULL,
  ativo       boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- -------------------------------------------------------
-- 4. Indices para performance
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id    ON public.usuarios(auth_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON public.usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sol_status          ON public.solicitacoes_empresa(status);
CREATE INDEX IF NOT EXISTS idx_sol_email           ON public.solicitacoes_empresa(email);

-- -------------------------------------------------------
-- 5. Row Level Security (RLS)
-- -------------------------------------------------------
ALTER TABLE public.usuarios             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_empresa ENABLE ROW LEVEL SECURITY;

-- Drop políticas existentes para recriar
DROP POLICY IF EXISTS "admin_sistema_usuarios"  ON public.usuarios;
DROP POLICY IF EXISTS "usuario_self"            ON public.usuarios;
DROP POLICY IF EXISTS "insert_sol"              ON public.solicitacoes_empresa;
DROP POLICY IF EXISTS "admin_sol_select"        ON public.solicitacoes_empresa;
DROP POLICY IF EXISTS "admin_sol_update"        ON public.solicitacoes_empresa;

-- Policy: admin_sistema vê e edita todos os usuários
CREATE POLICY "admin_sistema_usuarios" ON public.usuarios
  USING (
    auth.uid() IN (
      SELECT auth_id FROM public.usuarios WHERE perfil = 'admin_sistema' AND ativo = true
    )
  );

-- Policy: cada usuário vê apenas seu próprio registro
CREATE POLICY "usuario_self" ON public.usuarios
  FOR SELECT USING (auth_id = auth.uid());

-- Policy: qualquer um pode enviar solicitação (pré-cadastro público)
CREATE POLICY "insert_sol" ON public.solicitacoes_empresa
  FOR INSERT WITH CHECK (true);

-- Policy: apenas admin_sistema vê e aprova solicitações
CREATE POLICY "admin_sol_select" ON public.solicitacoes_empresa
  FOR SELECT USING (
    auth.uid() IN (
      SELECT auth_id FROM public.usuarios WHERE perfil = 'admin_sistema' AND ativo = true
    )
  );

CREATE POLICY "admin_sol_update" ON public.solicitacoes_empresa
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT auth_id FROM public.usuarios WHERE perfil = 'admin_sistema' AND ativo = true
    )
  );

-- -------------------------------------------------------
-- 6. Para tornar um usuario admin_sistema:
--    1. Crie o usuario no Supabase Auth (Dashboard > Auth)
--    2. Insira o registro abaixo substituindo os valores
-- -------------------------------------------------------
-- INSERT INTO public.usuarios (auth_id, nome, email, perfil, empresa_id, ativo)
-- VALUES (
--   '<UUID do usuario no Supabase Auth>',
--   'Administrador TRENCH',
--   'admin@trench.com.br',
--   'admin_sistema',
--   NULL,  -- admin_sistema nao precisa de empresa
--   true
-- );

-- -------------------------------------------------------
-- 7. Verificar estrutura criada
-- -------------------------------------------------------
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('usuarios', 'solicitacoes_empresa', 'empresas')
ORDER BY table_name;
