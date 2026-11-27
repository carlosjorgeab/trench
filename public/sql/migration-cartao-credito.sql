-- ============================================================
-- TRENCH - Migration: Controle de Cartão de Crédito e Limite Bancário
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Novos campos na tabela de Contas (Cartão de Crédito e Conta Bancária)
ALTER TABLE public.contas ADD COLUMN IF NOT EXISTS limite_cartao DECIMAL(15,2);
ALTER TABLE public.contas ADD COLUMN IF NOT EXISTS dia_vencimento INTEGER CHECK (dia_vencimento BETWEEN 1 AND 31);
ALTER TABLE public.contas ADD COLUMN IF NOT EXISTS dia_fechamento INTEGER CHECK (dia_fechamento BETWEEN 1 AND 31);

-- Campos específicos para Conta Bancária (Cheque Especial / Limite Bancário)
ALTER TABLE public.contas ADD COLUMN IF NOT EXISTS limite_conta DECIMAL(15,2);
ALTER TABLE public.contas ADD COLUMN IF NOT EXISTS taxa_juros_conta DECIMAL(6,2);
ALTER TABLE public.contas ADD COLUMN IF NOT EXISTS data_vencimento_limite DATE;

-- Padronizar tipos legados (opcional)
UPDATE public.contas SET tipo = 'bancaria' WHERE tipo IN ('banco', 'caixa', 'investimento') OR tipo IS NULL;
UPDATE public.contas SET tipo = 'cartao_credito' WHERE tipo = 'cartao';

-- 2. Novos campos na tabela de Lançamentos para parcelamento e faturas de cartão
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS parcela_atual INTEGER DEFAULT 1;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS total_parcelas INTEGER DEFAULT 1;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS grupo_parcelamento_id VARCHAR(64);
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS fatura_referencia VARCHAR(7);
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS conta_pagamento_id INTEGER REFERENCES public.contas(id) ON DELETE SET NULL;

-- 3. Índices para consultas rápidas de faturas e limite utilizado
CREATE INDEX IF NOT EXISTS idx_contas_tipo ON public.contas(tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_conta_status ON public.lancamentos(conta_id, status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_fatura_ref ON public.lancamentos(fatura_referencia);
CREATE INDEX IF NOT EXISTS idx_lancamentos_grupo_parcelamento ON public.lancamentos(grupo_parcelamento_id);
