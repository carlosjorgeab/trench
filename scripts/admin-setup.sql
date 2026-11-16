-- Criar usuário admin no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar usuário de autenticação (substitua pelo seu email/senha real)
-- Nota: Usuários devem ser criados via Supabase Auth API ou Console

-- 2. Inicionar empresa padrão
INSERT INTO empresas (nome, cnpj, email, ativo)
VALUES ('Empresa Padrao', '00.000.000/0000-00', 'admin@trench.com', true)
ON CONFLICT DO NOTHING;

-- 3. Inserir configs iniciais
INSERT INTO configuracoes (empresa_id, tema, cor_primaria, cor_secundaria)
SELECT id, 'light', '#3b82f6', '#14b8a6'
FROM empresas
WHERE nome = 'Empresa Padrao'
ON CONFLICT DO NOTHING;
