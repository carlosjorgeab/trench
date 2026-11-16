// Definicoes de todas as tabelas do Supabase
// Mantido para referencia historica. Use scripts/supabase-schema.sql para o schema SQL.

module.exports = {
  empresas: {
    id: 'empresas',
    name: 'Empresas',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'nome', type: 'varchar(255)', required: true },
      { name: 'cnpj', type: 'varchar(20)' },
      { name: 'email', type: 'varchar(255)' },
      { name: 'imagem', type: 'varchar(500)' },
      { name: 'ativo', type: 'boolean', default: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
    ]
  },
  lancamentos: {
    id: 'lancamentos',
    name: 'Lancamentos',
    columns: [
      { name: 'id', type: 'uuid', pk: true },
      { name: 'empresa_id', type: 'uuid', required: true },
      { name: 'tipo', type: 'varchar(10)', check: "IN ('debito', 'credito')" },
      { name: 'conta_id', type: 'uuid' },
      { name: 'categoria_id', type: 'uuid' },
      { name: 'forma_pagamento_id', type: 'uuid' },
      { name: 'centro_custo_id', type: 'uuid' },
      { name: 'cliente_id', type: 'uuid' },
      { name: 'descricao', type: 'text', required: true },
      { name: 'observacao', type: 'text' },
      { name: 'valor_principal', type: 'decimal(15,2)', required: true },
      { name: 'juros', type: 'decimal(15,2)', default: 0 },
      { name: 'acrecimos', type: 'decimal(15,2)', default: 0 },
      { name: 'data_lancamento', type: 'date', required: true },
      { name: 'data_vencimento', type: 'date', required: true },
      { name: 'data_pagamento', type: 'date' },
      { name: 'status', type: 'varchar(20)', default: 'pendente', check: "IN ('pendente', 'pago', 'vencido', 'cancelado')" },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
    ]
  }
};

// Use scripts/supabase-schema.sql para criar as tabelas no Supabase.