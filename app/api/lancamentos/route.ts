import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { buildInstallmentSchedule } from '../../lib/installments'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

function getFaturaReferencia(dateStr: string): string {
  return dateStr.slice(0, 7) // YYYY-MM
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')
    const contaId = searchParams.get('conta_id')
    const faturaReferencia = searchParams.get('fatura_referencia')

    let query = supabase.from('lancamentos').select('*')

    if (empresaId) {
      query = query.eq('empresa_id', parseInt(empresaId))
    }
    if (contaId) {
      query = query.eq('conta_id', parseInt(contaId))
    }
    if (faturaReferencia) {
      query = query.eq('fatura_referencia', faturaReferencia)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching lancamentos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar lançamentos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawTotalParcelas = body.total_parcelas ?? 1
    const totalParcelas = Number(rawTotalParcelas)
    const diaVencimentoCartao = body.dia_vencimento_cartao ? Number(body.dia_vencimento_cartao) : null

    // Remover campos auxiliares que não existem na tabela
    const {
      total_parcelas: _tp,
      parcelado: _p,
      dia_vencimento_cartao: _dvc,
      ...baseFields
    } = body

    if (!Number.isInteger(totalParcelas) || totalParcelas < 1 || totalParcelas > 12) {
      return NextResponse.json(
        { success: false, error: 'O número de parcelas deve ser um inteiro entre 1 e 12.' },
        { status: 400 }
      )
    }

    if (totalParcelas > 1) {
      let schedule
      try {
        schedule = buildInstallmentSchedule(
          Number(baseFields.valor_principal),
          totalParcelas,
          baseFields.data_vencimento,
          diaVencimentoCartao
        )
      } catch (error) {
        return NextResponse.json(
          { success: false, error: error instanceof Error ? error.message : 'Dados de parcelamento inválidos.' },
          { status: 400 }
        )
      }

      const grupoId = crypto.randomUUID()
      const rows = schedule.map(({ number, amount, dueDate }) => ({
        ...baseFields,
        descricao: `${baseFields.descricao} (${number}/${totalParcelas})`,
        valor_principal: amount,
        data_vencimento: dueDate,
        parcela_atual: number,
        total_parcelas: totalParcelas,
        grupo_parcelamento_id: grupoId,
        fatura_referencia: getFaturaReferencia(dueDate),
      }))

      const { data, error } = await supabase.from('lancamentos').insert(rows).select()
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, data: data[0], count: data.length })
    }

    const singlePayload = {
      ...baseFields,
      parcela_atual: baseFields.parcela_atual || 1,
      total_parcelas: 1,
      fatura_referencia: baseFields.fatura_referencia || getFaturaReferencia(baseFields.data_vencimento),
    }

    const { data, error } = await supabase
      .from('lancamentos')
      .insert([singlePayload])
      .select()

    if (error) {
      console.error('Error creating lancamento:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    console.error('Error creating lancamento:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao criar lançamento' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      total_parcelas: _tp,
      parcelado: _p,
      dia_vencimento_cartao: _dvc,
      ...updateData
    } = body

    if (updateData.data_vencimento && !updateData.fatura_referencia) {
      updateData.fatura_referencia = getFaturaReferencia(updateData.data_vencimento)
    }

    const { data, error } = await supabase
      .from('lancamentos')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating lancamento:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    console.error('Error updating lancamento:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao atualizar lançamento' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    if (body.action === 'pagar_fatura') {
      const { empresa_id, conta_cartao_id, conta_pagamento_id, data_pagamento, ids, cartao_nome, fatura_label } = body
      if (!empresa_id || !conta_cartao_id || !conta_pagamento_id || !data_pagamento || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Dados incompletos para pagamento da fatura.' },
          { status: 400 }
        )
      }

      // Buscar itens da fatura para calcular o total
      const { data: itensFatura, error: fetchErr } = await supabase
        .from('lancamentos')
        .select('id, valor_principal, juros, acrecimos')
        .in('id', ids)
        .eq('empresa_id', empresa_id)

      if (fetchErr) throw fetchErr

      const totalFatura = (itensFatura || []).reduce(
        (acc, item) => acc + Number(item.valor_principal || 0) + Number(item.juros || 0) + Number(item.acrecimos || 0),
        0
      )

      // 1. Marcar todos os lançamentos da fatura como pagos
      const { error: updErr } = await supabase
        .from('lancamentos')
        .update({
          status: 'pago',
          data_pagamento,
          conta_pagamento_id: Number(conta_pagamento_id),
        })
        .in('id', ids)
        .eq('empresa_id', empresa_id)

      if (updErr) throw updErr

      // 2. Registrar saída consolidada na conta bancária pagadora
      const { error: insErr } = await supabase.from('lancamentos').insert([
        {
          empresa_id,
          tipo: 'debito',
          conta_id: Number(conta_pagamento_id),
          descricao: `Pagamento Fatura ${cartao_nome || 'Cartão'} (${fatura_label || ''})`.trim(),
          observacao: `Baixa consolidada de ${ids.length} lançamento(s) da fatura do cartão.`,
          valor_principal: Number(totalFatura.toFixed(2)),
          juros: 0,
          acrecimos: 0,
          data_lancamento: data_pagamento,
          data_vencimento: data_pagamento,
          data_pagamento,
          status: 'pago',
          parcela_atual: 1,
          total_parcelas: 1,
          anexos: [],
        },
      ])

      if (insErr) throw insErr

      return NextResponse.json({ success: true, total_pago: totalFatura, quantidade: ids.length })
    }

    return NextResponse.json({ success: false, error: 'Ação não suportada.' }, { status: 400 })
  } catch (error: any) {
    console.error('Error patching lancamento:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao processar pagamento da fatura' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const { error } = await supabase
      .from('lancamentos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lancamento:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting lancamento:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao deletar lançamento' },
      { status: 500 }
    )
  }
}
