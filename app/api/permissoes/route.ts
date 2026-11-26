import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

// Campos de permissão suportados (conforme tabela permissoes)
export type PermissaoCampos = {
  usuario_id: string
  modulo: string
  visualizar?: boolean
  criar?: boolean
  editar?: boolean
  deletar?: boolean
  exportar?: boolean
}

const PERMISSAO_FIELDS: (keyof PermissaoCampos)[] = [
  'visualizar',
  'criar',
  'editar',
  'deletar',
  'exportar'
]

function montarPermissoes(body: any): PermissaoCampos {
  return {
    usuario_id: body.usuario_id,
    modulo: body.modulo,
    visualizar: body.visualizar ?? false,
    criar: body.criar ?? false,
    editar: body.editar ?? false,
    deletar: body.deletar ?? false,
    exportar: body.exportar ?? false,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuario_id = searchParams.get('usuario_id')
    const modulo = searchParams.get('modulo')
    const matriz = searchParams.get('matriz') === '1'

    let query = supabase
      .from('permissoes')
      .select('*')
      .order('modulo', { ascending: true })

    if (usuario_id) query = (query as any).eq('usuario_id', usuario_id)
    if (modulo) query = (query as any).eq('modulo', modulo)

    const { data, error } = await query
    if (error) throw error

    // Modo matriz: retorna permissões agrupadas por usuario_id
    if (matriz) {
      const agrupado: Record<string, any[]> = {}
      for (const p of (data || [])) {
        if (!agrupado[p.usuario_id]) agrupado[p.usuario_id] = []
        agrupado[p.usuario_id].push(p)
      }
      return NextResponse.json({ success: true, data, matriz: agrupado })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar permissões' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuario_id, modulo } = body

    if (!usuario_id || !modulo) {
      return NextResponse.json(
        { success: false, error: 'usuario_id e modulo são obrigatórios' },
        { status: 400 }
      )
    }

    // Upsert: cria ou atualiza a permissão do usuário para o módulo
    const payload = montarPermissoes(body)
    const { data, error } = await supabase
      .from('permissoes')
      .upsert([payload], { onConflict: 'usuario_id,modulo' })
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao salvar permissão' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const campos: any = {}
    for (const field of PERMISSAO_FIELDS) {
      if (updateData[field] !== undefined) campos[field] = updateData[field]
    }
    campos.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('permissoes')
      .update(campos)
      .eq('id', id)
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao atualizar permissão' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da permissão é obrigatório' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('permissoes')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao excluir permissão' },
      { status: 500 }
    )
  }
}
