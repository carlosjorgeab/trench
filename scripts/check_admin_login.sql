-- Verificar dados completos para login do admin

-- 1. Verificar usuário em auth.users
SELECT 'auth.users' as tabela, id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'admin@trench.com';

-- 2. Verificar perfil em usuarios
SELECT 'usuarios' as tabela, id, auth_id, nome, email, perfil, ativo, empresa_id, created_at
FROM usuarios 
WHERE auth_id = (SELECT id FROM auth.users WHERE email = 'admin@trench.com');

-- 3. Verificar empresa 1
SELECT 'empresas' as tabela, id, nome, tipo, ativo, created_at
FROM empresas 
WHERE id = 1;

-- 4. Testar a query exata que o refreshAppUser faz
SELECT 
  u.id, 
  u.auth_id, 
  u.nome, 
  u.email, 
  u.perfil, 
  u.ativo, 
  u.empresa_id,
  e.nome as empresa_nome,
  e.tipo as empresa_tipo,
  e.ativo as empresa_ativa
FROM usuarios u
LEFT JOIN empresas e ON u.empresa_id = e.id
WHERE u.auth_id = (SELECT id FROM auth.users WHERE email = 'admin@trench.com')
  AND u.ativo = true;
