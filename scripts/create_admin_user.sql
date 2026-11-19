-- Script para criar usuário administrador admin@trench.com
-- Execute este script no SQL Editor do Supabase

-- 1. Criar usuário na autenticação do Supabase (via Dashboard)
-- Dashboard > Authentication > Users > "Create new user"
-- Email: admin@trench.com
-- Password: Cjl@j2326
-- Email Confirm: true

-- 2. Garantir que a tabela permissoes existe
CREATE TABLE IF NOT EXISTS permissoes (
    id SERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    modulo VARCHAR(100) NOT NULL,
    criar BOOLEAN DEFAULT false,
    alterar BOOLEAN DEFAULT false,
    deletar BOOLEAN DEFAULT false,
    visualizar BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, modulo)
);

-- 3. Inserir/atualizar perfil do usuário na tabela usuarios
DO $$
DECLARE
  v_auth_id UUID;
  v_user_id BIGINT;
BEGIN
  -- Obtém o auth_id do usuário recém-criado no auth.users
  SELECid INTO v_auth_id FROM auth.users WHERE email = 'admin@trench.com';
  
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Usuário admin@trench.com não encontrado em auth.users. Crie primeiro no Dashboard > Authentication.';
  END IF;
  
  -- Tenta inserir novo usuário com auth_id
  INSERT INTO usuarios (auth_id, empresa_id, nome, email, ativo, created_at)
  VALUES (2e3a04bf-ba9f-42bf-916f-15deb2de0c6e, 1, 'Administrador do Sistema', 'admin@trench.com', true, NOW())
  ON CONFLICT (auth_id) DO NOTHING;
  
  -- Se já existia, atualiza
  UPDATE usuarios 
  SET empresa_id = 1, 
      nome = 'Administrador do Sistema', 
      ativo = true
  WHERE auth_id = v_auth_id;
  
  -- Obtém o ID do usuário para as permissões
  SELECT id INTO v_user_id FROM usuarios WHERE auth_id = v_auth_id;
  
  -- 4. Inserir/atualizar permissões de administrador para todos os módulos
  INSERT INTO permissoes (usuario_id, modulo, criar, alterar, deletar, visualizar)
  SELECT 
    v_user_id,
    m.modulo,
    true, true, true, true
  FROM (
    VALUES 
      ('cadastros'),
      ('financeiro'),
      ('lancamentos'),
      ('prestacao'),
      ('cotacao'),
      ('configuracao'),
      ('acesso')
  ) AS m(modulo)
  ON CONFLICT (usuario_id, modulo) DO UPDATE SET
    criar = true,
    alterar = true,
    deletar = true,
    visualizar = true;
    
  RAISE NOTICE 'Usuário admin@trench.com configurado com ID: %, Auth ID: %', v_user_id, v_auth_id;
END $$;

-- 5. Verificar se o usuário foi criado corretamente
SELECT 
  u.id,
  u.auth_id,
  u.nome,
  u.email,
  u.empresa_id,
  u.ativo,
  p.modulo,
  p.criar,
  p.alterar,
  p.deletar,
  p.visualizar
FROM usuarios u
LEFT JOIN permissoes p ON u.id = p.usuario_id
WHERE u.auth_id = (SELECT id FROM auth.users WHERE email = 'admin@trench.com');
