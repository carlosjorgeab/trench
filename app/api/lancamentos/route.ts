import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')

    let query = supabase.from('lancamentos').select('*')

    if (empresaId) {
      query = query.eq('empresa_id', parseInt(empresaId))
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

    const { data, error } = await supabase
      .from('lancamentos')
      .insert([body])
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
    const { id, ...updateData } = body

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
