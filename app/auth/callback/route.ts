import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      const authUser = session.user
      
      // Check if user exists in usuarios table
      const { data: existingUser } = await supabaseAdmin
        .from('usuarios')
        .select('id, empresa_id, perfil, ativo')
        .eq('id', authUser.id)
        .maybeSingle()

      if (existingUser) {
        // User exists, check if active
        if (!existingUser.ativo) {
          return NextResponse.redirect(new URL('/auth/login?error=conta_inativa', request.url))
        }
        
        // If user has no empresa_id, check for approved solicitacao
        if (!existingUser.empresa_id) {
          const { data: solicitation } = await supabaseAdmin
            .from('solicitacoes_empresa')
            .select('id, empresa_id, status')
            .eq('user_id', authUser.id)
            .eq('status', 'aprovado')
            .maybeSingle()
          
          if (solicitation?.empresa_id) {
            // Update user with empresa_id from approved solicitation
            await supabaseAdmin
              .from('usuarios')
              .update({ empresa_id: solicitation.empresa_id })
              .eq('id', authUser.id)
          }
        }
        
        return NextResponse.redirect(new URL(next, request.url))
      }

      // User doesn't exist in usuarios table - check for pending/approved solicitacao
      const { data: solicitation } = await supabaseAdmin
        .from('solicitacoes_empresa')
        .select('id, empresa_id, status, email, razao_social, responsavel')
        .eq('email', authUser.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (solicitation) {
        if (solicitation.status === 'aprovado' && solicitation.empresa_id) {
          // Create user linked to approved company
          await supabaseAdmin
            .from('usuarios')
            .insert([{
              id: authUser.id,
              email: authUser.email,
              nome: authUser.user_metadata?.full_name || authUser.user_metadata?.name || solicitation.responsavel,
              empresa_id: solicitation.empresa_id,
              perfil: 'usuario',
              ativo: true,
            }])

          // Update solicitation with user_id
          await supabaseAdmin
            .from('solicitacoes_empresa')
            .update({ user_id: authUser.id })
            .eq('id', solicitation.id)

          return NextResponse.redirect(new URL(next, request.url))
        } else if (solicitation.status === 'pendente') {
          // Update solicitation with user_id for tracking
          await supabaseAdmin
            .from('solicitacoes_empresa')
            .update({ user_id: authUser.id })
            .eq('id', solicitation.id)

          // Redirect to login with info message
          return NextResponse.redirect(new URL('/auth/login?info=solicitacao_pendente', request.url))
        } else if (solicitation.status === 'rejeitado') {
          return NextResponse.redirect(new URL('/auth/login?error=solicitacao_rejeitada', request.url))
        }
      }

      // No solicitation exists - create a pre-registration (solicitacao_empresa)
      const { data: newSolicitation } = await supabaseAdmin
        .from('solicitacoes_empresa')
        .insert([{
          razao_social: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Empresa',
          email: authUser.email,
          responsavel: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Responsável',
          tipo_empresa: 'filial',
          status: 'pendente',
          user_id: authUser.id,
        }])
        .select()
        .maybeSingle()

      return NextResponse.redirect(new URL('/auth/login?info=solicitacao_criada', request.url))
    }
  }

  // Error or no code - redirect to login
  return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', request.url))
}