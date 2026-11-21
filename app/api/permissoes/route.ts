import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuario_id = searchParams.get('usuario_id')
    const modulo = searchParams.get('modulo')

    let query = supabase
      .from('permissoes')
      .select('*')

    if (usuario_id) query = (query as any).eq('usuario_id', usuario_id)
    if (modulo) query = (query as any).eq('modulo', modulo)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar permissões' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuario_id, modulo, visualizar, criar, editar, deletar, exportar } = body

    if (!usuario_id || !modulo) {
      return NextResponse.json(
        { success: false, error: 'usuario_id e modulo são obrigatórios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('permissoes')
      .insert([{
        usuario_id,
        modulo,
        visualizar: visualizar ?? false,
        criar: criar ?? false,
        editar: editar ?? false,
        deletar: deletar ?? false,
        exportar: exportar ?? false
      }])
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao criar permissão' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const { data, error } = await supabase
      .from('permissoes')
      .update(updateData)
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