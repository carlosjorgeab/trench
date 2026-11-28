import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const usuarioId = body.usuario_id as string | undefined
    const empresaId = Number(body.empresa_id)

    if (!usuarioId || !Number.isInteger(empresaId) || empresaId <= 0) {
      return NextResponse.json({ success: false, error: 'Usuário e empresa são obrigatórios.' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('id, perfil, ativo')
      .eq('id', usuarioId)
      .maybeSingle()

    if (userError) throw userError
    if (!user || !user.ativo) {
      return NextResponse.json({ success: false, error: 'Usuário inativo ou não encontrado.' }, { status: 403 })
    }

    const isSystemAdmin = user.perfil === 'admin_sistema' || user.perfil === 'admin'

    if (!isSystemAdmin) {
      const { data: link, error: linkError } = await supabase
        .from('usuario_empresas')
        .select('ativo, principal')
        .eq('usuario_id', usuarioId)
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .maybeSingle()

      if (linkError && linkError.code !== '42P01' && linkError.code !== 'PGRST205') throw linkError

      if (!link) {
        return NextResponse.json({ success: false, error: 'O usuário não possui acesso a esta empresa.' }, { status: 403 })
      }
    }

    const { data: company, error: companyError } = await supabase
      .from('empresas')
      .select('id, nome, tipo, ativo')
      .eq('id', empresaId)
      .eq('ativo', true)
      .maybeSingle()

    if (companyError) throw companyError
    if (!company) {
      return NextResponse.json({ success: false, error: 'Empresa inativa ou não encontrada.' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ empresa_id: empresaId })
      .eq('id', usuarioId)

    if (updateError) throw updateError

    if (!isSystemAdmin) {
      await supabase
        .from('usuario_empresas')
        .update({ principal: false })
        .eq('usuario_id', usuarioId)

      await supabase
        .from('usuario_empresas')
        .update({ principal: true })
        .eq('usuario_id', usuarioId)
        .eq('empresa_id', empresaId)
    }

    return NextResponse.json({
      success: true,
      data: {
        empresa_id: company.id,
        empresa_nome: company.nome,
        empresa_tipo: company.tipo,
      },
    })
  } catch (error: any) {
    console.error('Erro ao trocar empresa ativa:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao trocar empresa ativa.' }, { status: 500 })
  }
}
