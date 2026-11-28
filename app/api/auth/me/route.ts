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

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email, perfil, ativo, empresa_id')
      .eq('id', id)
      .eq('ativo', true)
      .maybeSingle()

    if (userError || !userData) {
      return NextResponse.json({ success: false, data: null })
    }

    const isSystemAdmin = userData.perfil === 'admin_sistema' || userData.perfil === 'admin'
    let activeCompanyId = userData.empresa_id as number | null

    const { data: links } = await supabase
      .from('usuario_empresas')
      .select('empresa_id, principal, ativo')
      .eq('usuario_id', id)
      .eq('ativo', true)

    const linkedIds = (links || []).map((link) => link.empresa_id)
    let empresas: Array<{ id: number; nome: string; tipo: string | null; principal: boolean }> = []

    if (linkedIds.length) {
      const { data: linkedCompanies } = await supabase
        .from('empresas')
        .select('id, nome, tipo, ativo')
        .in('id', linkedIds)
        .eq('ativo', true)

      empresas = (linkedCompanies || []).map((company) => {
        const link = (links || []).find((item) => item.empresa_id === company.id)
        return { id: company.id, nome: company.nome, tipo: company.tipo, principal: link?.principal === true }
      }).sort((a, b) => Number(b.principal) - Number(a.principal) || a.nome.localeCompare(b.nome, 'pt-BR'))

      if (!empresas.some((company) => company.id === activeCompanyId) && empresas.length) {
        activeCompanyId = empresas.find((company) => company.principal)?.id || empresas[0].id
        await supabase.from('usuarios').update({ empresa_id: activeCompanyId }).eq('id', id)
      }
    }

    if (!empresas.length && userData.empresa_id) {
      const { data: fallbackCompany } = await supabase
        .from('empresas')
        .select('id, nome, tipo, ativo')
        .eq('id', userData.empresa_id)
        .eq('ativo', true)
        .maybeSingle()

      if (fallbackCompany) {
        empresas = [{ id: fallbackCompany.id, nome: fallbackCompany.nome, tipo: fallbackCompany.tipo, principal: true }]
      }
    }

    if (isSystemAdmin && !empresas.length) {
      const { data: allCompanies } = await supabase
        .from('empresas')
        .select('id, nome, tipo, ativo')
        .eq('ativo', true)
        .order('nome')

      empresas = (allCompanies || []).map((company, index) => ({
        id: company.id,
        nome: company.nome,
        tipo: company.tipo,
        principal: index === 0,
      }))

      if (!activeCompanyId && empresas.length) activeCompanyId = empresas[0].id
    }

    let activeCompany = activeCompanyId
      ? empresas.find((company) => company.id === activeCompanyId)
      : null

    if (!activeCompany && empresas.length) {
      activeCompany = empresas.find((company) => company.principal) || empresas[0]
      activeCompanyId = activeCompany.id
    }

    if (!activeCompany && !isSystemAdmin) {
      return NextResponse.json({ success: false, data: null })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: userData.id,
        auth_id: userData.id,
        nome: userData.nome,
        email: userData.email,
        perfil: userData.perfil || 'usuario',
        empresa_id: activeCompanyId,
        empresa_nome: activeCompany?.nome || null,
        empresa_tipo: activeCompany?.tipo || null,
        empresas,
        ativo: userData.ativo,
        isSystemAdmin,
      }
    })
  } catch (error) {
    console.error('Erro ao carregar usuário autenticado:', error)
    return NextResponse.json({ success: false, data: null }, { status: 500 })
  }
}
