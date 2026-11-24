import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching empresas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar empresas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('empresas')
      .insert([body])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error('Error creating empresas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar empresas' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const { data, error } = await supabase
      .from('empresas')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error('Error updating empresas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar empresas' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting empresas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar empresas' },
      { status: 500 }
    )
  }
}
