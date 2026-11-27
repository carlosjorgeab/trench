import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

function sanitizeContaPayload(body: Record<string, any>) {
  const tipo = body.tipo || 'bancaria'
  const isCartao = tipo === 'cartao_credito' || tipo === 'cartao'
  const isBancaria = !isCartao

  const limiteCartao =
    isCartao && body.limite_cartao !== '' && body.limite_cartao !== null && body.limite_cartao !== undefined
      ? Number(body.limite_cartao)
      : null

  const diaVencimento =
    isCartao && body.dia_vencimento !== '' && body.dia_vencimento !== null && body.dia_vencimento !== undefined
      ? Number(body.dia_vencimento)
      : null

  const diaFechamento =
    isCartao && body.dia_fechamento !== '' && body.dia_fechamento !== null && body.dia_fechamento !== undefined
      ? Number(body.dia_fechamento)
      : null

  const limiteConta =
    isBancaria && body.limite_conta !== '' && body.limite_conta !== null && body.limite_conta !== undefined
      ? Number(body.limite_conta)
      : null

  const taxaJurosConta =
    isBancaria && body.taxa_juros_conta !== '' && body.taxa_juros_conta !== null && body.taxa_juros_conta !== undefined
      ? Number(body.taxa_juros_conta)
      : null

  const dataVencimentoLimite =
    isBancaria && body.data_vencimento_limite
      ? String(body.data_vencimento_limite).split('T')[0]
      : null

  if (isCartao && limiteCartao !== null && (Number.isNaN(limiteCartao) || limiteCartao < 0)) {
    throw new Error('Limite do cartão inválido.')
  }
  if (isCartao && diaVencimento !== null && (!Number.isInteger(diaVencimento) || diaVencimento < 1 || diaVencimento > 31)) {
    throw new Error('Dia de vencimento deve estar entre 1 e 31.')
  }
  if (isCartao && diaFechamento !== null && (!Number.isInteger(diaFechamento) || diaFechamento < 1 || diaFechamento > 31)) {
    throw new Error('Dia de fechamento deve estar entre 1 e 31.')
  }
  if (isBancaria && limiteConta !== null && (Number.isNaN(limiteConta) || limiteConta < 0)) {
    throw new Error('Limite da conta bancária inválido.')
  }
  if (isBancaria && taxaJurosConta !== null && (Number.isNaN(taxaJurosConta) || taxaJurosConta < 0)) {
    throw new Error('Taxa de juros da conta bancária inválida.')
  }

  return {
    empresa_id: body.empresa_id,
    nome: body.nome,
    tipo,
    limite_cartao: limiteCartao,
    dia_vencimento: diaVencimento,
    dia_fechamento: diaFechamento,
    limite_conta: limiteConta,
    taxa_juros_conta: taxaJurosConta,
    data_vencimento_limite: dataVencimentoLimite,
    ativo: body.ativo !== false,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')
    const tipo = searchParams.get('tipo')

    let query = supabase.from('contas').select('*')

    if (empresaId) {
      query = query.eq('empresa_id', parseInt(empresaId))
    }
    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching contas:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao buscar contas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = sanitizeContaPayload(body)

    const { data, error } = await supabase
      .from('contas')
      .insert([payload])
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    console.error('Error creating contas:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao criar conta' },
      { status: 400 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    const payload = sanitizeContaPayload(body)

    const { data, error } = await supabase
      .from('contas')
      .update(payload)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    console.error('Error updating contas:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao atualizar conta' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const { error } = await supabase
      .from('contas')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting contas:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao deletar conta' },
      { status: 500 }
    )
  }
}
