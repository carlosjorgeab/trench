import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const auth_id = searchParams.get('auth_id')
    const empresa_id = searchParams.get('empresa_id')

    let query = supabase
      .from('usuarios')
      .select('*, empresas(nome, tipo)')

    if (auth_id) query = (query as any).eq('auth_id', auth_id)
    if (empresa_id) query = (query as any).eq('empresa_id', empresa_id)

    const { data, error } = await (query as any).order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabase.from('usuarios').insert([body]).select()
    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const { data, error } = await supabase.from('usuarios').update(updateData).eq('id', id).select()
    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao atualizar' },
      { status: 500 }
    )
  }
}
