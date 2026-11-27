-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    email VARCHAR(255),
    imagem VARCHAR(500),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Solicitações de Empresa
CREATE TABLE IF NOT EXISTS solicitacoes_empresa (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    responsavel VARCHAR(255) NOT NULL,
    cargo_responsavel VARCHAR(100),
    tipo_empresa VARCHAR(50) DEFAULT 'filial',
    mensagem TEXT,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    observacao_admin TEXT,
    user_id UUID REFERENCES auth.users(id),
    empresa_id INTEGER REFERENCES empresas(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Lancamentos
CREATE TABLE IF NOT EXISTS lancamentos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    tipo VARCHAR(20) CHECK (tipo IN ('debito', 'credito')),
    conta_id INTEGER,
    categoria_id INTEGER,
    forma_pagamento_id INTEGER,
    centro_custo_id INTEGER,
    cliente_id INTEGER,
    observacao TEXT,
    valor_principal DECIMAL(15,2) NOT NULL,
    juros DECIMAL(15,2) DEFAULT 0,
    acrecimos DECIMAL(15,2) DEFAULT 0,
    data_lancamento TIMESTAMP NOT NULL,
    data_vencimento TIMESTAMP NOT NULL,
    data_pagamento TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pendente',
    parcela_atual INTEGER DEFAULT 1,
    total_parcelas INTEGER DEFAULT 1,
    grupo_parcelamento_id VARCHAR(64),
    fatura_referencia VARCHAR(7),
    conta_pagamento_id INTEGER,
    anexos TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    email VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    email VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Contas
CREATE TABLE IF NOT EXISTS contas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'bancaria',
    limite_cartao DECIMAL(15,2),
    dia_vencimento INTEGER,
    dia_fechamento INTEGER,
    limite_conta DECIMAL(15,2),
    taxa_juros_conta DECIMAL(6,2),
    data_vencimento_limite DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Plano de Contas (criada ANTES de categorias pois é referenciada por ela)
CREATE TABLE IF NOT EXISTS plano_contas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    parent_id INTEGER REFERENCES plano_contas(id),
    nivel INTEGER NOT NULL DEFAULT 1,
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('debito', 'credito')),
    plano_conta_id INTEGER REFERENCES plano_contas(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Formas de Pagamento
CREATE TABLE IF NOT EXISTS formas_pagamento (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Centros de Custos
CREATE TABLE IF NOT EXISTS centros_custos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Catálogo de Módulos do Sistema (base da Matriz de Permissões)
-- ============================================================
CREATE TABLE IF NOT EXISTS modulos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sementes dos módulos do sistema (conforme PRD - Módulos do Sistema)
INSERT INTO modulos (nome, slug, descricao, icone, ativo) VALUES
    ('Dashboard Geral', 'dashboard', 'Métricas consolidadas e gráficos executivos', 'LayoutDashboard', true),
    ('Financeiro & Lançamentos', 'financeiro', 'Entradas, saídas, anexos e conciliação bancária', 'DollarSign', true),
    ('Prestação de Contas', 'prestacao', 'Relatórios de prestação e auditoria contábil', 'FileSpreadsheet', true),
    ('Cotação de Moedas', 'cotacao', 'Taxas cambiais e histórico de moedas estrangeiras', 'TrendingUp', true),
    ('Cadastros Mestres', 'cadastros', 'Clientes, fornecedores, contas e plano contábil', 'Database', true),
    ('Gestão de Usuários & Permissões', 'acesso', 'Administração de acessos e concessão de privilégios', 'ShieldCheck', true),
    ('Configurações do Sistema', 'configuracao', 'Personalização visual de temas, cores e tipografia', 'Settings', true)
ON CONFLICT (slug) DO NOTHING;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) DEFAULT 'usuario' CHECK (perfil IN ('admin_sistema', 'admin_empresa', 'gestor', 'analista', 'usuario')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Permissões (Matriz de Permissões Granulares)
-- Uma linha por combinação de usuário + módulo (unique constraint)
CREATE TABLE IF NOT EXISTS permissoes (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    modulo VARCHAR(100) NOT NULL,
    visualizar BOOLEAN DEFAULT false,
    criar BOOLEAN DEFAULT false,
    editar BOOLEAN DEFAULT false,
    deletar BOOLEAN DEFAULT false,
    exportar BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, modulo)
);

-- Tabela de Configurações
CREATE TABLE IF NOT EXISTS configuracoes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    tema VARCHAR(20) DEFAULT 'light',
    cor_primaria VARCHAR(20) DEFAULT '#3b82f6',
    cor_secundaria VARCHAR(20) DEFAULT '#14b8a6',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Cotações de Moedas
CREATE TABLE IF NOT EXISTS cotacao_moedas (
    id SERIAL PRIMARY KEY,
    moeda VARCHAR(10) NOT NULL,
    taxa DECIMAL(15,6) NOT NULL,
    data_hora TIMESTAMP DEFAULT NOW()
);

-- Tabela de Anexos de Lançamento
CREATE TABLE IF NOT EXISTS anexos_lancamento (
    id SERIAL PRIMARY KEY,
    lancamento_id INTEGER REFERENCES lancamentos(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;

-- Módulos: leitura para usuários autenticados
CREATE POLICY "modulos_select_authenticated" ON modulos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Usuários: próprio registro e admin_sistema lê todos
CREATE POLICY "usuarios_select_own" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_select_admin_sistema" ON usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid() AND u.perfil = 'admin_sistema'
    )
  );

CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Empresas: usuário lê sua empresa; admin_sistema lê todas
CREATE POLICY "empresas_select_own" ON empresas
  FOR SELECT USING (
    id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid())
  );

CREATE POLICY "empresas_select_admin_sistema" ON empresas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid() AND u.perfil = 'admin_sistema'
    )
  );

-- Permissões: usuário lê próprias; admin_sistema gerencia tudo
CREATE POLICY "permissoes_select_own" ON permissoes
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "permissoes_select_admin_sistema" ON permissoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid() AND u.perfil = 'admin_sistema'
    )
  );

CREATE POLICY "permissoes_manage_admin_sistema" ON permissoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid() AND u.perfil = 'admin_sistema'
    )
  );
