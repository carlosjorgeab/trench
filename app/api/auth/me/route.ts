import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email, perfil, ativo, empresa_id')
      .eq('id', id)
      .eq('ativo', true)
      .maybeSingle()

    if (userError || !userData) {
      return NextResponse.json({ success: false, data: null })
    }

    let empresaNome = null
    let empresaTipo = null
    let empresaAtiva = true

    if (userData.empresa_id) {
      const { data: empresaData } = await supabase
        .from('empresas')
        .select('nome, tipo, ativo')
        .eq('id', userData.empresa_id)
        .maybeSingle()

      if (empresaData) {
        empresaNome = empresaData.nome
        empresaTipo = empresaData.tipo
        empresaAtiva = empresaData.ativo === true
      } else {
        empresaAtiva = false
      }
    } else {
      empresaAtiva = false
    }

    if (!empresaAtiva) {
      return NextResponse.json({ success: false, data: null })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: userData.id,
        auth_id: userData.id,
        nome: userData.nome,
        email: userData.email,
        perfil: userData.perfil || 'usuario',
        empresa_id: userData.empresa_id,
        empresa_nome: empresaNome,
        empresa_tipo: empresaTipo,
        ativo: userData.ativo,
      }
    })
  } catch {
    return NextResponse.json({ success: false, data: null }, { status: 500 })
  }
}
