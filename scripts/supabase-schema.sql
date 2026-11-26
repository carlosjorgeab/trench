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

-- Tabela de Plano de Contas
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

-- Tabela de Permissões
CREATE TABLE IF NOT EXISTS permissoes (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    modulo VARCHAR(100) NOT NULL,
    criar BOOLEAN DEFAULT false,
    alterar BOOLEAN DEFAULT false,
    deletar BOOLEAN DEFAULT false,
    visualizar BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
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
