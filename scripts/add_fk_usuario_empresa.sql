-- Script para adicionar Foreign Key usuarios.empresa_id -> empresas.id
-- Execute no Supabase SQL Editor

-- 1. Verificar se a FK já existe
SELECT conname, conrelid::regclass AS tabela, confrelid::regclass AS referencia
FROM pg_constraint
WHERE conrelid = 'usuarios'::regclass 
  AND contype = 'f'
  AND conname LIKE '%empresa%';

-- 2. Verificar dados órfãos (usuarios com empresa_id que não existe em empresas)
SELECT u.id, u.nome, u.email, u.empresa_id
FROM usuarios u
LEFT JOIN empresas e ON u.empresa_id = e.id
WHERE u.empresa_id IS NOT NULL AND e.id IS NULL;

-- 3. Se houver dados órfãos, corrigir (opção A: setar NULL, opção B: deletar, opção C: criar empresa)
-- Opção A - Setar NULL para usuários com empresa_id inválido:
-- UPDATE usuarios SET empresa_id = NULL WHERE empresa_id NOT IN (SELECT id FROM empresas);

-- 4. Adicionar a Foreign Key (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'usuarios'::regclass 
        AND contype = 'f' 
        AND conname = 'usuarios_empresa_id_fkey'
    ) THEN
        ALTER TABLE usuarios 
        ADD CONSTRAINT usuarios_empresa_id_fkey 
        FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'FK usuarios_empresa_id_fkey criada com sucesso';
    ELSE
        RAISE NOTICE 'FK usuarios_empresa_id_fkey já existe';
    END IF;
END $$;

-- 5. Verificar se FK foi criada
SELECT conname, conrelid::regclass AS tabela, confrelid::regclass AS referencia,
       pg_get_constraintdef(oid) AS definicao
FROM pg_constraint
WHERE conrelid = 'usuarios'::regclass 
  AND contype = 'f'
  AND conname = 'usuarios_empresa_id_fkey';

-- 6. Testar JOIN após FK
SELECT u.id, u.nome, u.email, u.empresa_id, u.ativo as user_ativo,
       e.id as empresa_id, e.nome as empresa_nome, e.ativo as empresa_ativa
FROM usuarios u
LEFT JOIN empresas e ON u.empresa_id = e.id
WHERE u.ativo = true;