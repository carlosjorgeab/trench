import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

interface CompanyLinkRow {
  principal: boolean
  ativo: boolean
  empresas: { id: number; nome: string; tipo: string | null; ativo: boolean } | null
}

export async function GET(request: NextRequest) {
  try {
    const usuarioId = new URL(request.url).searchParams.get('usuario_id')
    if (!usuarioId) {
      return NextResponse.json({ success: false, error: 'ID do usuário é obrigatório.' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('id, perfil, ativo, empresa_id')
      .eq('id', usuarioId)
      .maybeSingle()

    if (userError) throw userError
    if (!user || !user.ativo) {
      return NextResponse.json({ success: false, error: 'Usuário inativo ou não encontrado.' }, { status: 403 })
    }

    const isSystemAdmin = user.perfil === 'admin_sistema' || user.perfil === 'admin'
    let companies: Array<{ id: number; nome: string; tipo: string | null; principal: boolean }> = []

    const { data: links, error: linksError } = await supabase
      .from('usuario_empresas')
      .select('principal, ativo, empresas(id, nome, tipo, ativo)')
      .eq('usuario_id', usuarioId)
      .eq('ativo', true)

    if (linksError && linksError.code !== '42P01' && linksError.code !== 'PGRST205') throw linksError

    if (links && !linksError) {
      companies = (links as unknown as CompanyLinkRow[])
        .filter((link) => link.empresas?.ativo !== false)
        .map((link) => ({
          id: link.empresas!.id,
          nome: link.empresas!.nome,
          tipo: link.empresas!.tipo,
          principal: link.principal,
        }))
    }

    if (!companies.length && user.empresa_id) {
      const { data: fallbackCompany } = await supabase
        .from('empresas')
        .select('id, nome, tipo, ativo')
        .eq('id', user.empresa_id)
        .maybeSingle()

      if (fallbackCompany && fallbackCompany.ativo !== false) {
        companies = [{ id: fallbackCompany.id, nome: fallbackCompany.nome, tipo: fallbackCompany.tipo, principal: true }]
      }
    }

    if (isSystemAdmin && !companies.length) {
      const { data: allCompanies } = await supabase
        .from('empresas')
        .select('id, nome, tipo, ativo')
        .eq('ativo', true)
        .order('nome')

      companies = (allCompanies || []).map((company, index) => ({
        id: company.id,
        nome: company.nome,
        tipo: company.tipo,
        principal: index === 0,
      }))
    }

    companies.sort((a, b) => Number(b.principal) - Number(a.principal) || a.nome.localeCompare(b.nome, 'pt-BR'))

    return NextResponse.json({ success: true, data: companies })
  } catch (error: any) {
    console.error('Erro ao buscar empresas do usuário:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao buscar empresas do usuário.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const usuarioId = body.usuario_id as string | undefined
    const empresaIds = body.empresa_ids as number[] | undefined
    const empresaPrincipalId = body.empresa_principal_id as number | undefined

    if (!usuarioId || !Array.isArray(empresaIds) || empresaIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Usuário e pelo menos uma empresa são obrigatórios.' }, { status: 400 })
    }

    const uniqueIds = [...new Set(empresaIds.filter((id) => Number.isInteger(id) && id > 0))]
    if (!uniqueIds.length) {
      return NextResponse.json({ success: false, error: 'Informe empresas válidas.' }, { status: 400 })
    }

    const principalId = empresaPrincipalId && uniqueIds.includes(empresaPrincipalId)
      ? empresaPrincipalId
      : uniqueIds[0]

    const { data: activeCompanies, error: companiesError } = await supabase
      .from('empresas')
      .select('id')
      .eq('ativo', true)
      .in('id', uniqueIds)

    if (companiesError) throw companiesError

    const activeIds = new Set((activeCompanies || []).map((company) => company.id))
    const validIds = uniqueIds.filter((id) => activeIds.has(id))
    if (!validIds.length) {
      return NextResponse.json({ success: false, error: 'Nenhuma empresa selecionada está ativa.' }, { status: 400 })
    }

    const validPrincipalId = validIds.includes(principalId) ? principalId : validIds[0]

    const { error: deleteError } = await supabase
      .from('usuario_empresas')
      .delete()
      .eq('usuario_id', usuarioId)

    if (deleteError) throw deleteError

    const links = validIds.map((empresaId) => ({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      principal: empresaId === validPrincipalId,
      ativo: true,
    }))

    const { error: insertError } = await supabase
      .from('usuario_empresas')
      .insert(links)

    if (insertError) throw insertError

    const { error: legacyError } = await supabase
      .from('usuarios')
      .update({ empresa_id: validPrincipalId })
      .eq('id', usuarioId)

    if (legacyError) throw legacyError

    return NextResponse.json({ success: true, empresa_principal_id: validPrincipalId })
  } catch (error: any) {
    console.error('Erro ao gravar empresas do usuário:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao gravar empresas do usuário.' }, { status: 500 })
  }
}
