-- Script para criar usuário administrador admin@trench.com
-- Execute este script no SQL Editor do Supabase

-- 1. Criar usuário na autenticação do Supabase (via Dashboard)
-- Dashboard > Authentication > Users > "Create new user"
-- Email: admin@trench.com
-- Password: Cjl@j2326
-- Email Confirm: true

-- 2. Criar empresa padrão se não existir
INSERT INTO empresas (nome, cnpj, email, ativo)
VALUES ('Empresa Administração', '00.000.000/0000-00', 'admin@trench.com', true)
ON CONFLICT (cnpj) DO NOTHING;

-- 3. Obter o ID da empresa padrão
DO $$
DECLARE
  v_auth_id UUID;
  v_empresa_id INTEGER;
  v_user_id UUID;
BEGIN
  -- Obtém o auth_id do usuário recém-criado no auth.users
  SELECT id INTO v_auth_id FROM auth.users WHERE email = 'admin@trench.com';
  
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Usuário admin@trench.com não encontrado em auth.users. Crie primeiro no Dashboard > Authentication.';
  END IF;
  
  -- Obtém o ID da empresa padrão
  SELECT id INTO v_empresa_id FROM empresas WHERE email = 'admin@trench.com' LIMIT 1;
  
  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Empresa padrão não encontrada para admin@trench.com.';
  END IF;
  
  -- Tenta inserir novo usuário
  INSERT INTO usuarios (id, empresa_id, nome, email, ativo, created_at)
  VALUES (v_auth_id, v_empresa_id, 'Administrador do Sistema', 'admin@trench.com', true, NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Se já existia, atualiza
  UPDATE usuarios 
  SET empresa_id = v_empresa_id, 
      nome = 'Administrador do Sistema', 
      email = 'admin@trench.com',
      perfil = 'admin_sistema',
      ativo = true
  WHERE id = v_auth_id;
  
  -- Obtém o ID do usuário para as permissões
  SELECT id INTO v_user_id FROM usuarios WHERE id = v_auth_id;
  
  -- 4. Inserir/atualizar permissões de administrador para todos os módulos
  INSERT INTO permissoes (usuario_id, modulo, criar, alterar, deletar, visualizar)
  SELECT 
    v_user_id,
    m.modulo,
    true, true, true, true
  FROM (
    VALUES 
      ('dashboard'),
      ('financeiro'),
      ('lancamentos'),
      ('prestacao'),
      ('cotacao'),
      ('cadastros'),
      ('configuracao'),
      ('acesso')
  ) AS m(modulo)
  ON CONFLICT (usuario_id, modulo) DO UPDATE SET
    criar = true,
    alterar = true,
    deletar = true,
    visualizar = true;
    
  RAISE NOTICE 'Usuário admin@trench.com configurado com ID: %, Auth ID: %, Empresa: %', v_user_id, v_auth_id, v_empresa_id;
END $$;

-- 5. Verificar se o usuário foi criado corretamente
SELECT 
  u.id,
  u.nome,
  u.email,
  u.perfil,
  u.empresa_id,
  u.ativo,
  e.nome as empresa_nome
FROM usuarios u
LEFT JOIN empresas e ON u.empresa_id = e.id
WHERE u.id = (SELECT id FROM auth.users WHERE email = 'admin@trench.com');
