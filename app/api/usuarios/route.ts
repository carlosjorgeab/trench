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
    const id = searchParams.get('id')
    const empresa_id = searchParams.get('empresa_id')

    let query = supabase
      .from('usuarios')
      .select('*, empresas(nome)')

    if (id) query = (query as any).eq('id', id)
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
    const { email, password, nome, empresa_id, perfil, ativo = true } = body

    if (!email || !password || !nome || !empresa_id) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: email, password, nome, empresa_id' },
        { status: 400 }
      )
    }

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome }
    })

    if (authError) throw authError

    const authUserId = authData.user.id

    // 2. Criar registro na tabela usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .insert([{
        id: authUserId,
        empresa_id: parseInt(empresa_id),
        nome,
        email,
        ativo
      }])
      .select()

    if (userError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUserId)
      throw userError
    }

    // 3. Criar permissões padrão baseadas no perfil
    const defaultPermissions = getDefaultPermissions(perfil || 'usuario')
    const permissoesData = defaultPermissions.map(modulo => ({
      usuario_id: authUserId,
      modulo,
      visualizar: modulo !== 'acesso' || perfil === 'admin',
      criar: modulo !== 'acesso' && modulo !== 'configuracao',
      editar: modulo !== 'acesso' && modulo !== 'configuracao',
      deletar: perfil === 'admin' && modulo !== 'acesso' && modulo !== 'configuracao',
      exportar: modulo !== 'acesso'
    }))

    const { error: permError } = await supabase
      .from('permissoes')
      .insert(permissoesData)

    if (permError) console.error('Erro ao criar permissões padrão:', permError)

    return NextResponse.json({ success: true, data: userData[0] })
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

    // Se está atualizando empresa_id, garantir que é número
    if (updateData.empresa_id !== undefined) {
      updateData.empresa_id = parseInt(updateData.empresa_id)
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao atualizar' },
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
        { success: false, error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // 1. Deletar permissões do usuário
    const { error: permError } = await supabase
      .from('permissoes')
      .delete()
      .eq('usuario_id', id)

    if (permError) console.error('Erro ao deletar permissões:', permError)

    // 2. Deletar usuário da tabela usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (userError) throw userError

    // 3. Deletar usuário do Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) console.error('Erro ao deletar usuário do Auth:', authError)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao excluir usuário' },
      { status: 500 }
    )
  }
}

function getDefaultPermissions(perfil: string) {
  const modules = [
    'dashboard',
    'financeiro',
    'prestacao',
    'cotacao',
    'cadastros',
    'acesso',
    'configuracao'
  ]

  if (perfil === 'admin') return modules
  if (perfil === 'gestor') return modules.filter(m => m !== 'acesso' && m !== 'configuracao')
  if (perfil === 'analista') return ['dashboard', 'financeiro', 'prestacao', 'cotacao', 'cadastros']
  if (perfil === 'operador') return ['financeiro', 'cadastros']
  return ['dashboard', 'cotacao'] // leitor
}
