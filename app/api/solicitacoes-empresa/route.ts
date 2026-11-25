import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('solicitacoes_empresa')
      .select('*, empresas(nome)')

    if (status) query = (query as any).eq('status', status)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar solicitações' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('solicitacoes_empresa')
      .insert([{ ...body, status: 'pendente' }])
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao criar solicitação' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, observacao_admin } = body

    const { data, error } = await supabase
      .from('solicitacoes_empresa')
      .update({ status, observacao_admin, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error

    // Se aprovado, verificar se já existe empresa com mesmo CNPJ ou email
    if (status === 'aprovado' && data[0]) {
      const sol = data[0]
      let empresaId: number | null = null

      // 1. Tentar encontrar empresa existente por CNPJ
      if (sol.cnpj) {
        const { data: empresaByCnpj } = await supabase
          .from('empresas')
          .select('id')
          .eq('cnpj', sol.cnpj)
          .maybeSingle()

        if (empresaByCnpj) {
          empresaId = empresaByCnpj.id
        }
      }

      // 2. Se não encontrou por CNPJ, tentar por email
      if (!empresaId && sol.email) {
        const { data: empresaByEmail } = await supabase
          .from('empresas')
          .select('id')
          .eq('email', sol.email)
          .maybeSingle()

        if (empresaByEmail) {
          empresaId = empresaByEmail.id
        }
      }

      // 3. Se ainda não encontrou, criar nova empresa
      if (!empresaId) {
        const { data: empresaData, error: empError } = await supabase
          .from('empresas')
          .insert([{
            nome: sol.razao_social,
            cnpj: sol.cnpj,
            email: sol.email,
            telefone: sol.telefone,
            tipo: sol.tipo_empresa || 'filial',
            ativo: true,
          }])
          .select()

        if (empError) {
          console.error('Erro ao criar empresa após aprovação:', empError)
          return NextResponse.json(
            { success: false, error: 'Erro ao criar empresa' },
            { status: 500 }
          )
        }

        empresaId = empresaData[0].id
      }

      // Atualizar a solicitação com o ID da empresa (existente ou nova)
      await supabase
        .from('solicitacoes_empresa')
        .update({ empresa_id: empresaId })
        .eq('id', id)

      // Se houver user_id na solicitação, atualizar o usuário com a empresa
      if (sol.user_id) {
        await supabase
          .from('usuarios')
          .update({ empresa_id: empresaId })
          .eq('id', sol.user_id)
      }
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao atualizar solicitação' },
      { status: 500 }
    )
  }
}
