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
    const empresaId = searchParams.get('empresa_id')

    let query = supabase
      .from('usuarios')
      .select('*, empresas(nome)')

    if (id) query = (query as any).eq('id', id)
    if (empresaId) query = (query as any).eq('empresa_id', empresaId)

    const { data: users, error } = await (query as any).order('created_at', { ascending: false })
    if (error) throw error

    const normalizedUsers = await Promise.all((users || []).map(async (user: any) => {
      const { data: links } = await supabase
        .from('usuario_empresas')
        .select('empresa_id, principal, ativo')
        .eq('usuario_id', user.id)
        .eq('ativo', true)

      const companyIds = (links || []).map((link) => link.empresa_id)
      let companies: Array<{ id: number; nome: string; principal: boolean }> = []

      if (companyIds.length) {
        const { data: linkedCompanies } = await supabase
          .from('empresas')
          .select('id, nome, ativo')
          .in('id', companyIds)
          .eq('ativo', true)

        companies = (linkedCompanies || []).map((company) => {
          const link = (links || []).find((item) => item.empresa_id === company.id)
          return { id: company.id, nome: company.nome, principal: link?.principal === true }
        })
      } else if (user.empresa_id) {
        companies = [{ id: user.empresa_id, nome: user.empresas?.nome || 'Empresa', principal: true }]
      }

      return { ...user, empresas_vinculadas: companies }
    }))

    return NextResponse.json({ success: true, data: normalizedUsers })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      nome,
      empresa_id,
      empresa_ids,
      empresa_principal_id,
      perfil,
      ativo = true,
      permissoes,
    } = body

    if (!email || !password || !nome) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: email, password e nome.' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      )
    }

    const requestedCompanyIds = Array.isArray(empresa_ids)
      ? empresa_ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isInteger(id) && id > 0)
      : [Number(empresa_id)].filter((id: number) => Number.isInteger(id) && id > 0)
    const uniqueCompanyIds = [...new Set(requestedCompanyIds)]

    if (!uniqueCompanyIds.length) {
      return NextResponse.json(
        { success: false, error: 'Selecione pelo menos uma empresa ativa.' },
        { status: 400 }
      )
    }

    const principalCompanyId = Number(empresa_principal_id || empresa_id) || uniqueCompanyIds[0]

    const { data: activeCompanies, error: companiesError } = await supabase
      .from('empresas')
      .select('id')
      .eq('ativo', true)
      .in('id', uniqueCompanyIds)

    if (companiesError) throw companiesError

    const validCompanyIds = (activeCompanies || []).map((company) => company.id)
    if (!validCompanyIds.length) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma empresa selecionada está ativa.' },
        { status: 400 }
      )
    }

    const legacyPrincipalId = validCompanyIds.includes(principalCompanyId)
      ? principalCompanyId
      : validCompanyIds[0]

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
    })

    if (authError) throw authError

    const authUserId = authData.user.id

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .insert([{
        id: authUserId,
        empresa_id: legacyPrincipalId,
        nome,
        email,
        perfil: perfil || 'usuario',
        ativo,
      }])
      .select()

    if (userError) {
      await supabase.auth.admin.deleteUser(authUserId)
      throw userError
    }

    const companyLinks = validCompanyIds.map((companyId) => ({
      usuario_id: authUserId,
      empresa_id: companyId,
      principal: companyId === legacyPrincipalId,
      ativo: true,
    }))

    const { error: linksError } = await supabase
      .from('usuario_empresas')
      .insert(companyLinks)

    if (linksError) {
      await supabase.from('usuarios').delete().eq('id', authUserId)
      await supabase.auth.admin.deleteUser(authUserId)
      throw linksError
    }

    const modulosPermissoes = permissoes || getDefaultPermissions(perfil || 'usuario')
    const permissoesData = modulosPermissoes.map((modulo: string) => ({
      usuario_id: authUserId,
      modulo,
      visualizar: modulo !== 'acesso' || (perfil === 'admin' || perfil === 'admin_sistema'),
      criar: modulo !== 'acesso' && modulo !== 'configuracao',
      editar: modulo !== 'acesso' && modulo !== 'configuracao',
      deletar: (perfil === 'admin' || perfil === 'admin_sistema') && modulo !== 'acesso' && modulo !== 'configuracao',
      exportar: modulo !== 'acesso',
    }))

    const { error: permError } = await supabase
      .from('permissoes')
      .insert(permissoesData)

    if (permError) console.error('Erro ao criar permissões padrão:', permError)

    return NextResponse.json({ success: true, data: userData[0] })
  } catch (error: any) {
    console.error('Erro ao criar usuário no Supabase Auth:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao criar usuário no Supabase Auth' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      permissoes,
      password,
      empresa_ids,
      empresa_principal_id,
      ...updateData
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do usuário é obrigatório.' },
        { status: 400 }
      )
    }

    if (password !== undefined && password !== '') {
      if (typeof password !== 'string' || password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' },
          { status: 400 }
        )
      }

      const { error: passwordError } = await supabase.auth.admin.updateUserById(id, { password })
      if (passwordError) throw passwordError

      const { error: metadataError } = await supabase.auth.admin.updateUserById(id, {
        user_metadata: { nome: updateData.nome },
      })
      if (metadataError) throw metadataError
    }

    if (updateData.empresa_id !== undefined) {
      updateData.empresa_id = parseInt(updateData.empresa_id)
    }

    if (Array.isArray(empresa_ids) && empresa_ids.length) {
      const uniqueCompanyIds = [...new Set(
        empresa_ids
          .map((companyId: unknown) => Number(companyId))
          .filter((companyId: number) => Number.isInteger(companyId) && companyId > 0)
      )]

      const { data: activeCompanies, error: companiesError } = await supabase
        .from('empresas')
        .select('id')
        .eq('ativo', true)
        .in('id', uniqueCompanyIds)

      if (companiesError) throw companiesError

      const validCompanyIds = (activeCompanies || []).map((company) => company.id)
      if (!validCompanyIds.length) {
        return NextResponse.json(
          { success: false, error: 'Nenhuma empresa selecionada está ativa.' },
          { status: 400 }
        )
      }

      const principalId = Number(empresa_principal_id || updateData.empresa_id)
      const legacyPrincipalId = validCompanyIds.includes(principalId)
        ? principalId
        : validCompanyIds[0]

      updateData.empresa_id = legacyPrincipalId

      const { error: deleteLinksError } = await supabase
        .from('usuario_empresas')
        .delete()
        .eq('usuario_id', id)

      if (deleteLinksError) throw deleteLinksError

      const companyLinks = validCompanyIds.map((companyId) => ({
        usuario_id: id,
        empresa_id: companyId,
        principal: companyId === legacyPrincipalId,
        ativo: true,
      }))

      const { error: linksError } = await supabase
        .from('usuario_empresas')
        .insert(companyLinks)

      if (linksError) throw linksError
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error

    if (permissoes && Array.isArray(permissoes)) {
      await supabase.from('permissoes').delete().eq('usuario_id', id)

      if (permissoes.length > 0) {
        const permissoesData = permissoes.map((p: any) => ({
          usuario_id: id,
          modulo: p.modulo,
          visualizar: p.visualizar ?? false,
          criar: p.criar ?? false,
          editar: p.editar ?? false,
          deletar: p.deletar ?? false,
          exportar: p.exportar ?? false,
        }))

        const { error: permissionError } = await supabase
          .from('permissoes')
          .insert(permissoesData)

        if (permissionError) throw permissionError
      }
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao atualizar usuário' },
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
