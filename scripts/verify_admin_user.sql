-- Script para verificar e corrigir o usuário admin
-- Execute no SQL Editor do Supabase

-- 1. Verificar se o usuário existe em auth.users
SELECT 'auth.users' as tabela, id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'admin@trench.com';

-- 2. Verificar se o perfil existe em usuarios
SELECT 'usuarios' as tabela, id, auth_id, nome, email, empresa_id, ativo, created_at
FROM usuarios 
WHERE email = 'admin@trench.com';

-- 3. Verificar se a empresa 1 existe e está ativa
SELECT 'empresas' as tabela, id, nome, ativo
FROM empresas 
WHERE id = 1;

-- 4. Verificar permissões
SELECT 'permissoes' as tabela, p.id, p.usuario_id, p.modulo, p.criar, p.alterar, p.deletar, p.visualizar
FROM permissoes p
JOIN usuarios u ON p.usuario_id = u.id
WHERE u.email = 'admin@trench.com';

-- 5. Corrigir: garantir que o usuário admin tem empresa_id = 1 e ativo = true
DO $$
DECLARE
  v_auth_id UUID;
  v_user_id BIGINT;
BEGIN
  -- Busca auth_id
  SELECT id INTO v_auth_id FROM auth.users WHERE email = 'admin@trench.com';
  
  IF v_auth_id IS NULL THEN
    RAISE NOTICE 'Usuário não encontrado em auth.users';
    RETURN;
  END IF;
  
  -- Atualiza ou insere perfil
  UPDATE usuarios 
  SET empresa_id = 1, 
      nome = 'Administrador do Sistema', 
      ativo = true
  WHERE auth_id = v_auth_id;
  
  IF NOT FOUND THEN
    INSERT INTO usuarios (auth_id, empresa_id, nome, email, ativo, created_at)
    VALUES (v_auth_id, 1, 'Administrador do Sistema', 'admin@trench.com', true, NOW());
  END IF;
  
  SELECT id INTO v_user_id FROM usuarios WHERE auth_id = v_auth_id;
  RAISE NOTICE 'Usuário admin vinculado à empresa 1. ID: %', v_user_id;
END $$;

-- 6. Verificar resultado final
SELECT 'Resultado final' as status, u.id, u.auth_id, u.nome, u.email, u.empresa_id, u.ativo, e.nome as empresa_nome, e.ativo as empresa_ativa
FROM usuarios u
LEFT JOIN empresas e ON u.empresa_id = e.id
WHERE u.email = 'admin@trench.com';
