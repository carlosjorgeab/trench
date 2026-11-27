import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

async function getEmpresaId(request: NextRequest): Promise<{ empresaId: number | null; isSystemAdmin: boolean }> {
  const { searchParams } = new URL(request.url)
  const empresaId = searchParams.get('empresa_id')
  if (empresaId) return { empresaId: parseInt(empresaId), isSystemAdmin: false }

  const userId = searchParams.get('user_id')
  if (userId) {
    const { data: user } = await supabase
      .from('usuarios')
      .select('empresa_id, perfil')
      .eq('id', userId)
      .maybeSingle()
    const isSystemAdmin = user?.perfil === 'admin_sistema' || user?.perfil === 'admin'
    return { empresaId: user?.empresa_id || null, isSystemAdmin }
  }
  return { empresaId: null, isSystemAdmin: false }
}

async function getFinancialSummary(empresaId: number) {
  const { data: lancamentos, error } = await supabase
    .from('lancamentos')
    .select('tipo, valor_principal, juros, acrecimos, status, data_lancamento, data_vencimento')
    .eq('empresa_id', empresaId)

  if (error) throw error

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  let saldoTotal = 0
  let receitasMes = 0
  let despesasMes = 0
  let contasPagar = 0
  let contasPagarQtd = 0
  let contasReceber = 0
  let contasReceberQtd = 0
  let inadimplencia = 0

  for (const l of lancamentos || []) {
    const valorTotal = Number(l.valor_principal) + Number(l.juros || 0) + Number(l.acrecimos || 0)
    const dataLanc = new Date(l.data_lancamento)
    const dataVenc = new Date(l.data_vencimento)
    const isCurrentMonth = dataLanc >= startOfMonth && dataLanc <= endOfMonth

    if (l.tipo === 'credito') {
      saldoTotal += valorTotal
      if (isCurrentMonth) receitasMes += valorTotal
      if (l.status === 'pendente' || l.status === 'agendado') {
        contasReceber += valorTotal
        contasReceberQtd++
        if (dataVenc < now && l.status === 'pendente') {
          inadimplencia += valorTotal
        }
      }
    } else {
      saldoTotal -= valorTotal
      if (isCurrentMonth) despesasMes += valorTotal
      if (l.status === 'pendente' || l.status === 'agendado') {
        contasPagar += valorTotal
        contasPagarQtd++
      }
    }
  }

  const lucroLiquido = receitasMes - despesasMes
  const margemLiquida = receitasMes > 0 ? ((lucroLiquido / receitasMes) * 100) : 0
  const inadimplenciaPct = contasReceber > 0 ? ((inadimplencia / contasReceber) * 100) : 0

  return {
    saldoTotal,
    receitasMes,
    despesasMes,
    lucroLiquido,
    margemLiquida: Number(margemLiquida.toFixed(1)),
    contasPagar,
    contasPagarQtd,
    contasReceber,
    contasReceberQtd,
    inadimplencia: Number(inadimplenciaPct.toFixed(1)),
  }
}

async function getBankAccounts(empresaId: number) {
  const { data, error } = await supabase
    .from('contas')
    .select('id, nome, tipo, limite_cartao, dia_vencimento, limite_conta, taxa_juros_conta, data_vencimento_limite, ativo, created_at')
    .eq('empresa_id', empresaId)
    .eq('ativo', true)

  if (error) throw error

  // Buscar lançamentos para calcular saldo bancário e limite utilizado dos cartões
  const { data: lancs } = await supabase
    .from('lancamentos')
    .select('conta_id, tipo, valor_principal, juros, acrecimos, status')
    .eq('empresa_id', empresaId)

  const utilizadoCartaoMap = new Map<number, number>()
  const saldoBancarioMap = new Map<number, number>()
  for (const l of lancs || []) {
    if (!l.conta_id) continue
    const v = Number(l.valor_principal || 0) + Number(l.juros || 0) + Number(l.acrecimos || 0)
    if (l.status === 'pendente' || l.status === 'vencido') {
      utilizadoCartaoMap.set(l.conta_id, (utilizadoCartaoMap.get(l.conta_id) || 0) + v)
    }
    if (l.status === 'pago') {
      const delta = l.tipo === 'credito' ? v : -v
      saldoBancarioMap.set(l.conta_id, (saldoBancarioMap.get(l.conta_id) || 0) + delta)
    }
  }

  return (data || []).map((conta, index) => {
    const colors = ['#ea580c', '#dc2626', '#b91c1c', '#0284c7', '#059669', '#7c3aed']
    const isCartao = conta.tipo === 'cartao_credito' || conta.tipo === 'cartao'
    const limiteCartao = Number(conta.limite_cartao || 0)
    const utilizadoCartao = utilizadoCartaoMap.get(conta.id) || 0
    const disponivelCartao = Math.max(0, limiteCartao - utilizadoCartao)
    const saldoBancario = saldoBancarioMap.get(conta.id) || 0

    return {
      id: conta.id,
      name: conta.nome,
      type: conta.tipo || 'bancaria',
      agency: '',
      account: '',
      balance: isCartao ? disponivelCartao : saldoBancario,
      limiteCartao: isCartao ? limiteCartao : null,
      diaVencimento: isCartao ? conta.dia_vencimento : null,
      limiteConta: !isCartao && conta.limite_conta != null ? Number(conta.limite_conta) : null,
      taxaJurosConta: !isCartao && conta.taxa_juros_conta != null ? Number(conta.taxa_juros_conta) : null,
      dataVencimentoLimite: !isCartao ? conta.data_vencimento_limite || null : null,
      color: colors[index % colors.length],
      badge: isCartao ? 'Cartão' : 'Bancária',
    }
  })
}

async function getCashFlowHistory(empresaId: number) {
  const { data: lancamentos, error } = await supabase
    .from('lancamentos')
    .select('tipo, valor_principal, juros, acrecimos, data_lancamento')
    .eq('empresa_id', empresaId)

  if (error) throw error

  const monthlyData: Record<string, { receitas: number; despesas: number }> = {}
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  for (const l of lancamentos || []) {
    const date = new Date(l.data_lancamento)
    const key = `${months[date.getMonth()]}/${date.getFullYear()}`
    const valorTotal = Number(l.valor_principal) + Number(l.juros || 0) + Number(l.acrecimos || 0)

    if (!monthlyData[key]) {
      monthlyData[key] = { receitas: 0, despesas: 0 }
    }

    if (l.tipo === 'credito') {
      monthlyData[key].receitas += valorTotal
    } else {
      monthlyData[key].despesas += valorTotal
    }
  }

  const sortedKeys = Object.keys(monthlyData).sort((a, b) => {
    const [ma, ya] = a.split('/')
    const [mb, yb] = b.split('/')
    return parseInt(ya) * 12 + months.indexOf(ma) - (parseInt(yb) * 12 + months.indexOf(mb))
  })

  return sortedKeys.slice(-6).map((mes) => ({
    mes: mes.split('/')[0],
    receitas: monthlyData[mes].receitas,
    despesas: monthlyData[mes].despesas,
  }))
}

async function getCategoryExpenses(empresaId: number) {
  const { data: lancamentos, error } = await supabase
    .from('lancamentos')
    .select('valor_principal, juros, acrecimos, categoria_id, categorias!inner(nome)')
    .eq('empresa_id', empresaId)
    .eq('tipo', 'debito')

  if (error) throw error

  const categoryMap: Record<string, number> = {}
  let total = 0

  for (const l of lancamentos || []) {
    const valorTotal = Number(l.valor_principal) + Number(l.juros || 0) + Number(l.acrecimos || 0)
    // Access the joined category name
    const catName = (l as any).categorias?.nome || 'Sem Categoria'
    categoryMap[catName] = (categoryMap[catName] || 0) + valorTotal
    total += valorTotal
  }

  const colors = [
    '#3b82f6',
    '#14b8a6',
    '#0284c7', '#d97706', '#dc2626', '#7c3aed', '#ec4899', '#059669'
  ]

  return Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, valor], index) => ({
      name,
      valor,
      percentual: total > 0 ? Number(((valor / total) * 100).toFixed(1)) : 0,
      color: colors[index % colors.length],
    }))
}

async function getRecentTransactions(empresaId: number, limit = 10) {
  const { data, error } = await supabase
    .from('lancamentos')
    .select(`
      id,
      tipo,
      valor_principal,
      juros,
      acrecimos,
      observacao,
      status,
      data_lancamento,
      categoria_id,
      categorias!inner(nome),
      conta_id,
      contas!inner(nome),
      cliente_id,
      clientes!inner(nome),
      fornecedor_id,
      fornecedores!inner(nome)
    `)
    .eq('empresa_id', empresaId)
    .order('data_lancamento', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map((l) => {
    const valorTotal = Number(l.valor_principal) + Number(l.juros || 0) + Number(l.acrecimos || 0)
    const date = new Date(l.data_lancamento)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    const isYesterday = date.toDateString() === new Date(today.getTime() - 86400000).toDateString()

    let dataStr = ''
    if (isToday) dataStr = `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    else if (isYesterday) dataStr = `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    else dataStr = date.toLocaleDateString('pt-BR')

    const cat = (l as any).categorias?.nome || 'Sem Categoria'
    const conta = (l as any).contas?.nome || 'Conta não informada'
    const cliente = (l as any).clientes?.nome
    const fornecedor = (l as any).fornecedores?.nome

    let descricao = l.observacao || `${l.tipo === 'credito' ? 'Recebimento' : 'Pagamento'}`
    if (cliente) descricao += ` - ${cliente}`
    if (fornecedor) descricao += ` - ${fornecedor}`

    return {
      id: l.id,
      descricao,
      categoria: cat,
      conta,
      data: dataStr,
      valor: valorTotal,
      tipo: l.tipo === 'credito' ? 'receita' : 'despesa',
      status: l.status === 'pago' || l.status === 'recebido' ? 'Concluído' : 
              l.status === 'agendado' ? 'Agendado' : 'Pendente',
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const { empresaId, isSystemAdmin } = await getEmpresaId(request)

    if (!empresaId && !isSystemAdmin) {
      return NextResponse.json(
        { success: false, error: 'Empresa não encontrada' },
        { status: 400 }
      )
    }

    // Se é admin_sistema sem empresa específica, usar empresa_id = 0 para retornar dados vazios/agregados
    const effectiveEmpresaId = empresaId || 0

    // Run each query independently to isolate errors
    const financialSummaryPromise = getFinancialSummary(effectiveEmpresaId).catch((e) => {
      console.error('getFinancialSummary error:', e)
      return null
    })
    const bankAccountsPromise = getBankAccounts(effectiveEmpresaId).catch((e) => {
      console.error('getBankAccounts error:', e)
      return []
    })
    const cashFlowHistoryPromise = getCashFlowHistory(effectiveEmpresaId).catch((e) => {
      console.error('getCashFlowHistory error:', e)
      return []
    })
    const categoryExpensesPromise = getCategoryExpenses(effectiveEmpresaId).catch((e) => {
      console.error('getCategoryExpenses error:', e)
      return []
    })
    const recentTransactionsPromise = getRecentTransactions(effectiveEmpresaId).catch((e) => {
      console.error('getRecentTransactions error:', e)
      return []
    })

    const [financialSummary, bankAccounts, cashFlowHistory, categoryExpenses, recentTransactions] = await Promise.all([
      financialSummaryPromise,
      bankAccountsPromise,
      cashFlowHistoryPromise,
      categoryExpensesPromise,
      recentTransactionsPromise,
    ])

    if (!financialSummary) {
      return NextResponse.json(
        { success: false, error: 'Erro ao calcular resumo financeiro' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        financialSummary,
        bankAccounts: bankAccounts || [],
        cashFlowHistory: cashFlowHistory || [],
        categoryExpenses: categoryExpenses || [],
        recentTransactions: recentTransactions || [],
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados do dashboard', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
