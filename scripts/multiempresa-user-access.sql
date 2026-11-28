-- Multiempresa + vínculo usuário-empresa
-- Execute no SQL Editor do Supabase.

CREATE TABLE IF NOT EXISTS usuario_empresas (
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  principal BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, empresa_id)
);

CREATE INDEX IF NOT EXISTS idx_usuario_empresas_usuario
  ON usuario_empresas(usuario_id, ativo);
CREATE INDEX IF NOT EXISTS idx_usuario_empresas_empresa
  ON usuario_empresas(empresa_id, ativo);

ALTER TABLE usuario_empresas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages usuario_empresas" ON usuario_empresas;
CREATE POLICY "Service role manages usuario_empresas"
  ON usuario_empresas
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Retrocompatibilidade: cria vínculos a partir da empresa principal atual.
INSERT INTO usuario_empresas (usuario_id, empresa_id, principal, ativo)
SELECT id, empresa_id, true, ativo
FROM usuarios
WHERE empresa_id IS NOT NULL
ON CONFLICT (usuario_id, empresa_id)
DO UPDATE SET principal = EXCLUDED.principal,
              ativo = EXCLUDED.ativo;

-- Garante apenas uma empresa principal por usuário quando a vinculação já existe.
WITH ranked AS (
  SELECT usuario_id,
         empresa_id,
         ROW_NUMBER() OVER (
           PARTITION BY usuario_id
           ORDER BY principal DESC, empresa_id ASC
         ) AS rn
  FROM usuario_empresas
  WHERE ativo = true
)
UPDATE usuario_empresas ue
SET principal = (ranked.rn = 1)
FROM ranked
WHERE ue.usuario_id = ranked.usuario_id
  AND ue.empresa_id = ranked.empresa_id;
