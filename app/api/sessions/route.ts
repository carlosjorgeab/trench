import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, session_id, device_info, action } = body

    if (!user_id || !session_id) {
      return NextResponse.json(
        { success: false, error: 'user_id e session_id são obrigatórios' },
        { status: 400 }
      )
    }

    if (action === 'register') {
      // Registrar nova sessão e revogar sessões anteriores do mesmo usuário
      const { error: revokeError } = await supabase
        .from('user_sessions')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('user_id', user_id)
        .eq('is_active', true)
        .neq('session_id', session_id)

      if (revokeError) {
        console.error('Erro ao revogar sessões antigas:', revokeError)
      }

      // Inserir nova sessão
      const { data, error } = await supabase
        .from('user_sessions')
        .insert([{
          user_id,
          session_id,
          device_info: device_info || null,
          is_active: true,
        }])
        .select()
        .maybeSingle()

      if (error) throw error

      return NextResponse.json({ success: true, data })
    }

    if (action === 'validate') {
      // Validar se a sessão atual ainda é a ativa
      const { data, error } = await supabase
        .from('user_sessions')
        .select('id, is_active, session_id')
        .eq('user_id', user_id)
        .eq('session_id', session_id)
        .maybeSingle()

      if (error) throw error

      const isValid = data?.is_active === true

      return NextResponse.json({ 
        success: true, 
        data: { valid: isValid, session: data } 
      })
    }

    if (action === 'revoke') {
      // Revogar sessão específica
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('user_id', user_id)
        .eq('session_id', session_id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: 'Ação inválida' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao gerenciar sessão' },
      { status: 500 }
    )
  }
}