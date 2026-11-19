-- Script para remover foreign key constraint com tipos incompatíveis
-- Execute no SQL Editor do Supabase

-- 1. Remover foreign key constraint existente
ALTER TABLE permissoes 
DROP CONSTRAINT IF EXISTS permissoes_usuario_id_fkey;

-- 2. Verificar se a constraint foi removida
SELECT 
  conname,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conname = 'permissoes_usuario_id_fkey';

-- 3. Opcional: Recriar a constraint com tipos compatíveis
-- Se permissoes.usuario_id for UUID e usuarios.id for BIGINT, 
-- a constraint não pode ser criada diretamente.
-- Opções:
-- a) Alterar permissoes.usuario_id para BIGINT
-- b) Alterar usuarios.id para UUID
-- c) Não usar foreign key (apenas integridade lógica)

-- Exemplo para opção a) - alterar permissoes.usuario_id para BIGINT:
-- ALTER TABLE permissoes ALTER COLUMN usuario_id TYPE BIGINT USING usuario_id::text::bigint;
-- ALTER TABLE permissoes ADD CONSTRAINT permissoes_usuario_id_fkey 
--   FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

-- 4. Verificar tipos atuais das colunas
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('permissoes', 'usuarios')
  AND column_name IN ('usuario_id', 'id')
ORDER BY table_name, column_name;
