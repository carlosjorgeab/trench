a-- Script de diagnóstico completo - Execute no Supabase SQL Editor

-- 1. Verificar constraints existentes na tabela usuarios
SELECT conname, contype, pg_get_constraintdef(oid) AS definicao
FROM pg_constraint
WHERE conrelid = 'usuarios'::regclass;

-- 2. Verificar FK específica para empresa_id
SELECT conname, confrelid::regclass AS referencia,
       pg_get_constraintdef(oid) AS definicao
FROM pg_constraint
WHERE conrelid = 'usuarios'::regclass 
  AND contype = 'f'
  AND conname LIKE '%empresa%';

-- 3. Verificar dados órfãos (usuarios com empresa_id inválido)
SELECT u.id, u.nome, u.email, u.empresa_id, u.ativo
FROM usuarios u
LEFT JOIN empresas e ON u.empresa_id = e.id
WHERE u.empresa_id IS NOT NULL AND e.id IS NULL;

-- 4. Verificar TODOS os usuários e suas empresas
SELECT u.id, u.nome, u.email, u.empresa_id, u.ativo as user_ativo,
       e.id as empresa_id, e.nome as empresa_nome, e.ativo as empresa_ativa
FROM usuarios u
LEFT JOIN empresas e ON u.empresa_id = e.id
ORDER BY u.created_at DESC;

-- 5. Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('usuarios', 'empresas');

-- 6. Ver políticas RLS
SELECT * FROM pg_policies WHERE tablename IN ('usuarios', 'empresas');

-- 7. Testar query exata que o app faz (simulando anon key)
-- Substitua 'USER_AUTH_ID_AQUI' pelo ID real do auth.users
-- SELECT id, nome, email, perfil, ativo, empresa_id 
-- FROM usuarios 
-- WHERE id = 'USER_AUTH_ID_AQUI' AND ativo = true;

-- 8. Testar busca de empresa separada
-- SELECT nome, tipo, ativo FROM empresas WHERE id = EMPRESA_ID_AQUI;