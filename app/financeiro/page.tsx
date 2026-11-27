'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppShell } from '../components/AppShell'
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Alert, AlertTitle, Checkbox, Tabs, Tab, LinearProgress,
} from '@mui/material'
import {
  Search, Filter, Plus, Calendar, Copy, Trash2, Edit, CreditCard, CheckCircle2, Landmark,
} from 'lucide-react'
import FileUpload from '../components/FileUpload'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAppUser } from '../lib/user-context'

interface Lancamento {
  id: number
  empresa_id: number
  tipo: string
  conta_id: number | null
  categoria_id: number | null
  forma_pagamento_id: number | null
  centro_custo_id: number | null
  cliente_id: number | null
  descricao: string
  observacao: string
  valor_principal: number
  juros: number
  acrecimos: number
  data_lancamento: string
  data_vencimento: string
  data_pagamento: string | null
  status: string
  parcela_atual?: number
  total_parcelas?: number
  grupo_parcelamento_id?: string | null
  fatura_referencia?: string | null
  conta_pagamento_id?: number | null
  anexos: string[]
  created_at: string
}

interface Option {
  id: number
  nome: string
}

interface ContaOption extends Option {
  tipo?: string
  limite_cartao?: number | null
  dia_vencimento?: number | null
  dia_fechamento?: number | null
  limite_conta?: number | null
  taxa_juros_conta?: number | null
  data_vencimento_limite?: string | null
}

type PeriodOption = 'hoje' | 'semana' | 'mes' | 'ano' | 'todo' | 'ultimos30' | 'ultimos12meses' | 'personalizado'

const isCartaoTipo = (tipo?: string) => tipo === 'cartao_credito' || tipo === 'cartao'

const formatBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

function calcularVencimentoFatura(
  dataLancStr: string,
  diaVencimento?: number | null,
  diaFechamento?: number | null
): string {
  if (!dataLancStr || !diaVencimento) return dataLancStr
  const [y, m, d] = dataLancStr.split('-').map(Number)
  if (!y || !m || !d) return dataLancStr

  let monthOffset = 0
  if (diaFechamento) {
    if (d >= diaFechamento) monthOffset += 1
    if (diaVencimento < diaFechamento) monthOffset += 1
  } else if (d > diaVencimento) {
    monthOffset += 1
  }

  const targetMonthIdx = (m - 1) + monthOffset
  const year = y + Math.floor(targetMonthIdx / 12)
  const month = ((targetMonthIdx % 12) + 12) % 12
  const lastDay = new Date(year, month + 1, 0).getDate()
  const day = Math.min(diaVencimento, lastDay)
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function FinanceiroPage() {
  const { appUser } = useAppUser()
  const [activeTab, setActiveTab] = useState<'lancamentos' | 'cartoes' | 'bancos'>('lancamentos')
  const [selectedBancoId, setSelectedBancoId] = useState<string>('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterCategoria, setFilterCategoria] = useState('todos')
  const [filterCentroCusto, setFilterCentroCusto] = useState('todos')
  const [filterPeriodo, setFilterPeriodo] = useState<PeriodOption>('mes')
  const [filterDataInicio, setFilterDataInicio] = useState('')
  const [filterDataFim, setFilterDataFim] = useState('')
  const [filterDescricao, setFilterDescricao] = useState('')
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)

  // Credit card invoice view state
  const [selectedCartaoId, setSelectedCartaoId] = useState<string>('todos')
  const [selectedFaturaMes, setSelectedFaturaMes] = useState<string>(new Date().toISOString().slice(0, 7))
  const [payInvoiceDialog, setPayInvoiceDialog] = useState<{
    open: boolean
    cartaoId: number | null
    cartaoNome: string
    faturaMes: string
    total: number
    ids: number[]
  }>({ open: false, cartaoId: null, cartaoNome: '', faturaMes: '', total: 0, ids: [] })
  const [payContaBancariaId, setPayContaBancariaId] = useState<string>('')
  const [payDataPagamento, setPayDataPagamento] = useState<string>(new Date().toISOString().split('T')[0])
  const [payError, setPayError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    tipo: 'debito',
    conta_id: '',
    categoria_id: '',
    forma_pagamento_id: '',
    centro_custo_id: '',
    cliente_id: '',
    descricao: '',
    observacao: '',
    valor_principal: '',
    juros: '0',
    acrecimos: '0',
    total_parcelas: '1',
    data_lancamento: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    data_pagamento: '',
    status: 'pendente',
  })

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; ids: number[] }>({ open: false, ids: [] })

  const openDeleteConfirm = (ids: number[]) => {
    setDeleteConfirm({ open: true, ids })
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ open: false, ids: [] })
  }

  const executeDelete = async () => {
    const { ids } = deleteConfirm
    if (ids.length === 0) return
    try {
      for (const id of ids) {
        await fetch(`/api/lancamentos?id=${id}`, { method: 'DELETE' })
      }
      setSelectedIds(new Set())
      fetchLancamentos()
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      closeDeleteConfirm()
    }
  }

  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedIds(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLancamentos.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredLancamentos.map(l => l.id)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    openDeleteConfirm(Array.from(selectedIds))
  }

  const handleBulkDuplicate = async () => {
    if (selectedIds.size === 0) return
    if (!appUser?.empresa_id) return
    try {
      const toDuplicate = filteredLancamentos.filter(l => selectedIds.has(l.id))
      for (const lanc of toDuplicate) {
        const body = {
          empresa_id: appUser.empresa_id,
          tipo: lanc.tipo,
          conta_id: lanc.conta_id,
          categoria_id: lanc.categoria_id,
          forma_pagamento_id: lanc.forma_pagamento_id,
          centro_custo_id: lanc.centro_custo_id,
          cliente_id: lanc.cliente_id,
          descricao: `${lanc.descricao} (Cópia)`,
          observacao: lanc.observacao,
          valor_principal: lanc.valor_principal,
          juros: lanc.juros,
          acrecimos: lanc.acrecimos,
          data_lancamento: new Date().toISOString().split('T')[0],
          data_vencimento: new Date(lanc.data_vencimento).toISOString().split('T')[0],
          data_pagamento: null,
          status: 'pendente',
          anexos: [],
        }
        await fetch('/api/lancamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      setSelectedIds(new Set())
      fetchLancamentos()
    } catch (error) {
      console.error('Error bulk duplicating:', error)
    }
  }

  // Options for selects
  const [empresas, setEmpresas] = useState<Option[]>([])
  const [contas, setContas] = useState<ContaOption[]>([])
  const [categorias, setCategorias] = useState<Option[]>([])
  const [formasPagamento, setFormasPagamento] = useState<Option[]>([])
  const [centrosCusto, setCentrosCusto] = useState<Option[]>([])
  const [clientes, setClientes] = useState<Option[]>([])
  const [fornecedores, setFornecedores] = useState<Option[]>([])

  const cartoesCredito = useMemo(() => contas.filter((c) => isCartaoTipo(c.tipo)), [contas])
  const contasBancarias = useMemo(() => contas.filter((c) => !isCartaoTipo(c.tipo)), [contas])

  const contaById = useMemo(() => {
    const map = new Map<number, ContaOption>()
    contas.forEach((c) => map.set(c.id, c))
    return map
  }, [contas])

  const limiteUtilizadoPorCartao = useMemo(() => {
    const map = new Map<number, number>()
    lancamentos.forEach((l) => {
      if (!l.conta_id) return
      const conta = contaById.get(l.conta_id)
      if (!conta || !isCartaoTipo(conta.tipo)) return
      if (l.status === 'pendente' || l.status === 'vencido') {
        const total = Number(l.valor_principal || 0) + Number(l.juros || 0) + Number(l.acrecimos || 0)
        map.set(l.conta_id, (map.get(l.conta_id) || 0) + total)
      }
    })
    return map
  }, [lancamentos, contaById])

  const saldoPorContaBancaria = useMemo(() => {
    const map = new Map<number, number>()
    lancamentos.forEach((l) => {
      if (!l.conta_id) return
      const conta = contaById.get(l.conta_id)
      if (!conta || isCartaoTipo(conta.tipo)) return
      if (l.status === 'pago') {
        const total = Number(l.valor_principal || 0) + Number(l.juros || 0) + Number(l.acrecimos || 0)
        const delta = l.tipo === 'credito' ? total : -total
        map.set(l.conta_id, (map.get(l.conta_id) || 0) + delta)
      }
    })
    return map
  }, [lancamentos, contaById])

  const selectedFormConta = useMemo(
    () => (formData.conta_id ? contaById.get(parseInt(formData.conta_id, 10)) : undefined),
    [formData.conta_id, contaById]
  )
  const isFormCartao = isCartaoTipo(selectedFormConta?.tipo)

  const periodOptions: { value: PeriodOption; label: string }[] = [
    { value: 'hoje', label: 'Hoje' },
    { value: 'semana', label: 'Semana' },
    { value: 'mes', label: 'Mês' },
    { value: 'ano', label: 'Ano' },
    { value: 'todo', label: 'Todo Período' },
    { value: 'ultimos30', label: '30 Últimos Dias' },
    { value: 'ultimos12meses', label: '12 Últimos Meses' },
    { value: 'personalizado', label: 'Personalizado' },
  ]

  const getPeriodLabel = (period: PeriodOption) => {
    const opt = periodOptions.find(o => o.value === period)
    return opt?.label || period
  }

  const getDateRange = (period: PeriodOption) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case 'hoje':
        return { inicio: today.toISOString().split('T')[0], fim: today.toISOString().split('T')[0] }
      case 'semana': {
        const start = new Date(today)
        start.setDate(today.getDate() - today.getDay())
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        return { inicio: start.toISOString().split('T')[0], fim: end.toISOString().split('T')[0] }
      }
      case 'mes': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return { inicio: start.toISOString().split('T')[0], fim: end.toISOString().split('T')[0] }
      }
      case 'ano': {
        const start = new Date(today.getFullYear(), 0, 1)
        const end = new Date(today.getFullYear(), 11, 31)
        return { inicio: start.toISOString().split('T')[0], fim: end.toISOString().split('T')[0] }
      }
      case 'todo':
        return { inicio: '', fim: '' }
      case 'ultimos30': {
        const start = new Date(today)
        start.setDate(today.getDate() - 30)
        return { inicio: start.toISOString().split('T')[0], fim: today.toISOString().split('T')[0] }
      }
      case 'ultimos12meses': {
        const start = new Date(today.getFullYear(), today.getMonth() - 11, 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return { inicio: start.toISOString().split('T')[0], fim: end.toISOString().split('T')[0] }
      }
      case 'personalizado':
        return { inicio: filterDataInicio, fim: filterDataFim }
      default:
        return { inicio: '', fim: '' }
    }
  }

  const { inicio: periodInicio, fim: periodFim } = getDateRange(filterPeriodo)

  const fetchOptions = async () => {
    if (!appUser?.empresa_id) return
    const endpoints = ['empresas', 'contas', 'categorias', 'formas-pagamento', 'centros-custos', 'clientes', 'fornecedores']
    const setters: any[] = [setEmpresas, setContas, setCategorias, setFormasPagamento, setCentrosCusto, setClientes, setFornecedores]

    for (let i = 0; i < endpoints.length; i++) {
      try {
        const res = await fetch(`/api/${endpoints[i]}?empresa_id=${appUser.empresa_id}`)
        const data = await res.json()
        if (data.success) {
          setters[i](data.data || [])
        }
      } catch (error) {
        console.error(`Error fetching ${endpoints[i]}:`, error)
      }
    }
  }

  const fetchLancamentos = async () => {
    if (!appUser?.empresa_id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/lancamentos?empresa_id=${appUser.empresa_id}`)
      const data = await res.json()
      if (data.success) {
        setLancamentos(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching lancamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptions()
    fetchLancamentos()
  }, [appUser?.empresa_id])

  const handleContaChange = (newContaId: string) => {
    const conta = newContaId ? contaById.get(parseInt(newContaId, 10)) : undefined
    if (conta && isCartaoTipo(conta.tipo)) {
      const vencimentoCalculado = calcularVencimentoFatura(
        formData.data_lancamento,
        conta.dia_vencimento,
        conta.dia_fechamento
      )
      setFormData((prev) => ({
        ...prev,
        conta_id: newContaId,
        tipo: editingId ? prev.tipo : 'debito',
        data_vencimento: vencimentoCalculado || prev.data_vencimento,
      }))
    } else {
      setFormData((prev) => ({ ...prev, conta_id: newContaId, total_parcelas: '1' }))
    }
  }

  const handleCreate = async () => {
    setSaveError(null)
    if (!appUser?.empresa_id) {
      setSaveError('Usuário não vinculado a nenhuma empresa. Entre em contato com o administrador.')
      return
    }
    try {
      const valorPrincipal = parseFloat(formData.valor_principal)
      if (isNaN(valorPrincipal) || valorPrincipal <= 0) {
        setSaveError('Informe um valor principal válido.')
        return
      }
      if (!formData.data_lancamento) {
        setSaveError('Informe a data de lançamento.')
        return
      }
      if (!formData.data_vencimento) {
        setSaveError('Informe a data de vencimento.')
        return
      }

      const body = {
        empresa_id: appUser.empresa_id,
        tipo: formData.tipo,
        conta_id: formData.conta_id ? parseInt(formData.conta_id) : null,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        forma_pagamento_id: formData.forma_pagamento_id ? parseInt(formData.forma_pagamento_id) : null,
        centro_custo_id: formData.centro_custo_id ? parseInt(formData.centro_custo_id) : null,
        cliente_id: formData.cliente_id ? parseInt(formData.cliente_id) : null,
        descricao: formData.descricao,
        observacao: formData.observacao,
        valor_principal: valorPrincipal,
        juros: parseFloat(formData.juros) || 0,
        acrecimos: parseFloat(formData.acrecimos) || 0,
        total_parcelas: !editingId && isFormCartao ? parseInt(formData.total_parcelas, 10) || 1 : 1,
        dia_vencimento_cartao: isFormCartao ? selectedFormConta?.dia_vencimento || null : null,
        data_lancamento: formData.data_lancamento,
        data_vencimento: formData.data_vencimento,
        data_pagamento: formData.data_pagamento || null,
        status: formData.status,
        anexos: uploadedUrls,
      }

      const method = editingId ? 'PUT' : 'POST'
      const payload = editingId ? { id: editingId, ...body } : body

      const res = await fetch('/api/lancamentos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setOpenDialog(false)
        setEditingId(null)
        resetForm()
        fetchLancamentos()
      } else {
        setSaveError(data.error || 'Erro ao salvar lançamento')
      }
    } catch (error) {
      console.error('Error saving lancamento:', error)
      setSaveError('Erro de conexão ao salvar lançamento')
    }
  }

  const resetForm = () => {
    setFormData({
      tipo: 'debito',
      conta_id: '',
      categoria_id: '',
      forma_pagamento_id: '',
      centro_custo_id: '',
      cliente_id: '',
      descricao: '',
      observacao: '',
      valor_principal: '',
      juros: '0',
      acrecimos: '0',
      total_parcelas: '1',
      data_lancamento: new Date().toISOString().split('T')[0],
      data_vencimento: new Date().toISOString().split('T')[0],
      data_pagamento: '',
      status: 'pendente',
    })
  }

  const handleEdit = (lanc: Lancamento) => {
    setEditingId(lanc.id)
    setFormData({
      tipo: lanc.tipo,
      conta_id: lanc.conta_id?.toString() || '',
      categoria_id: lanc.categoria_id?.toString() || '',
      forma_pagamento_id: lanc.forma_pagamento_id?.toString() || '',
      centro_custo_id: lanc.centro_custo_id?.toString() || '',
      cliente_id: lanc.cliente_id?.toString() || '',
      descricao: lanc.descricao,
      observacao: lanc.observacao || '',
      valor_principal: lanc.valor_principal?.toString() || '',
      juros: lanc.juros?.toString() || '0',
      acrecimos: lanc.acrecimos?.toString() || '0',
      total_parcelas: lanc.total_parcelas?.toString() || '1',
      data_lancamento: lanc.data_lancamento?.split('T')[0] || '',
      data_vencimento: lanc.data_vencimento?.split('T')[0] || '',
      data_pagamento: lanc.data_pagamento?.split('T')[0] || '',
      status: lanc.status,
    })
    setSaveError(null)
    setOpenDialog(true)
  }

  const totalReceitas = lancamentos
    .filter(l => l.tipo === 'credito')
    .reduce((sum, l) => sum + (l.valor_principal || 0), 0)
  const totalDespesas = lancamentos
    .filter(l => l.tipo === 'debito')
    .reduce((sum, l) => sum + (l.valor_principal || 0), 0)
  const saldo = totalReceitas - totalDespesas

  const stats = [
    { label: 'Total Lançamentos', value: lancamentos.length.toString(), color: 'primary' },
    { label: 'A Receber', value: formatBRL(totalReceitas), color: 'success' },
    { label: 'A Pagar', value: formatBRL(totalDespesas), color: 'error' },
    { label: 'Saldo', value: formatBRL(saldo), color: 'info' },
  ]

  const filteredLancamentos = useMemo(() => {
    return lancamentos.filter((l) => {
      if (filterTipo !== 'todos' && l.tipo !== filterTipo) return false
      if (filterCategoria !== 'todos' && l.categoria_id?.toString() !== filterCategoria) return false
      if (filterCentroCusto !== 'todos' && l.centro_custo_id?.toString() !== filterCentroCusto) return false

      if (filterDescricao && !l.descricao?.toLowerCase().includes(filterDescricao.toLowerCase())) return false

      if (periodInicio && periodFim) {
        const dataLanc = l.data_lancamento?.split('T')[0]
        if (dataLanc && (dataLanc < periodInicio || dataLanc > periodFim)) return false
      }

      return true
    })
  }, [lancamentos, filterTipo, filterCategoria, filterCentroCusto, filterDescricao, periodInicio, periodFim])

  // Credit card invoice items
  const faturaLancamentos = useMemo(() => {
    return lancamentos.filter((l) => {
      if (!l.conta_id) return false
      const conta = contaById.get(l.conta_id)
      if (!conta || !isCartaoTipo(conta.tipo)) return false
      if (selectedCartaoId !== 'todos' && l.conta_id.toString() !== selectedCartaoId) return false
      const fatRef = l.fatura_referencia || l.data_vencimento?.slice(0, 7)
      if (selectedFaturaMes && fatRef !== selectedFaturaMes) return false
      return true
    })
  }, [lancamentos, contaById, selectedCartaoId, selectedFaturaMes])

  const faturaResumo = useMemo(() => {
    let total = 0
    let pendente = 0
    const pendenteIds: number[] = []
    faturaLancamentos.forEach((l) => {
      const val = Number(l.valor_principal || 0) + Number(l.juros || 0) + Number(l.acrecimos || 0)
      total += val
      if (l.status === 'pendente' || l.status === 'vencido') {
        pendente += val
        pendenteIds.push(l.id)
      }
    })
    return { total, pendente, pendenteIds }
  }, [faturaLancamentos])

  const handleOpenPayInvoice = () => {
    const cartao = selectedCartaoId !== 'todos' ? contaById.get(parseInt(selectedCartaoId, 10)) : undefined
    setPayError(null)
    setPayContaBancariaId(contasBancarias[0]?.id?.toString() || '')
    setPayDataPagamento(new Date().toISOString().split('T')[0])
    setPayInvoiceDialog({
      open: true,
      cartaoId: cartao?.id || (faturaLancamentos[0]?.conta_id ?? null),
      cartaoNome: cartao?.nome || 'Cartão de Crédito',
      faturaMes: selectedFaturaMes,
      total: faturaResumo.pendente,
      ids: faturaResumo.pendenteIds,
    })
  }

  const handleConfirmPayInvoice = async () => {
    setPayError(null)
    if (!appUser?.empresa_id || !payInvoiceDialog.cartaoId || !payContaBancariaId) {
      setPayError('Selecione a conta bancária de origem do pagamento.')
      return
    }
    try {
      const res = await fetch('/api/lancamentos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pagar_fatura',
          empresa_id: appUser.empresa_id,
          conta_cartao_id: payInvoiceDialog.cartaoId,
          conta_pagamento_id: parseInt(payContaBancariaId, 10),
          data_pagamento: payDataPagamento,
          ids: payInvoiceDialog.ids,
          cartao_nome: payInvoiceDialog.cartaoNome,
          fatura_label: payInvoiceDialog.faturaMes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPayInvoiceDialog({ open: false, cartaoId: null, cartaoNome: '', faturaMes: '', total: 0, ids: [] })
        fetchLancamentos()
      } else {
        setPayError(data.error || 'Erro ao pagar fatura.')
      }
    } catch {
      setPayError('Erro de conexão ao processar pagamento da fatura.')
    }
  }

  return (
    <AppShell
      title="Sistema Financeiro"
      subtitle="Controle de lançamentos, receitas, despesas, cartões de crédito e conciliação"
      breadcrumbs={[{ label: 'Início', href: '/dashboard' }, { label: 'Financeiro' }]}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingId(null)
            resetForm()
            setSaveError(null)
            setOpenDialog(true)
          }}
        >
          Novo Lançamento
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Grid container spacing={2}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500, mt: 1, color: stat.color + '.main' }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Abas: Todos Lançamentos vs Cartões de Crédito & Faturas */}
        <Paper elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
          >
            <Tab label="Lançamentos Financeiros" value="lancamentos" />
            <Tab
              icon={<CreditCard size={16} />}
              iconPosition="start"
              label={`Cartões de Crédito & Faturas (${cartoesCredito.length})`}
              value="cartoes"
            />
          </Tabs>
        </Paper>

        {activeTab === 'cartoes' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Cards de Limite por Cartão */}
            <Grid container spacing={2}>
              {cartoesCredito.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Nenhum cartão de crédito cadastrado. Acesse <strong>Cadastros &gt; Contas</strong> e crie uma conta do tipo <strong>Cartão de Crédito</strong> informando o limite e o dia de vencimento.
                  </Alert>
                </Grid>
              ) : (
                cartoesCredito.map((cartao) => {
                  const limiteTotal = Number(cartao.limite_cartao || 0)
                  const utilizado = limiteUtilizadoPorCartao.get(cartao.id) || 0
                  const disponivel = Math.max(0, limiteTotal - utilizado)
                  const pct = limiteTotal > 0 ? Math.min(100, (utilizado / limiteTotal) * 100) : 0
                  const barColor = pct >= 90 ? 'error' : pct >= 70 ? 'warning' : 'primary'

                  return (
                    <Grid item xs={12} sm={6} md={4} key={cartao.id}>
                      <Card
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: selectedCartaoId === cartao.id.toString() ? 'primary.main' : 'divider',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedCartaoId(cartao.id.toString())}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CreditCard size={18} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {cartao.nome}
                              </Typography>
                            </Box>
                            {cartao.dia_vencimento && (
                              <Chip label={`Venc. dia ${String(cartao.dia_vencimento).padStart(2, '0')}`} size="small" variant="outlined" />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography variant="caption" color="text.secondary">
                              Utilizado: <strong>{formatBRL(utilizado)}</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Limite: <strong>{formatBRL(limiteTotal)}</strong>
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pct} color={barColor} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                            Disponível: {formatBRL(disponivel)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })
              )}
            </Grid>

            {/* Filtro de Fatura & Baixa Consolidada */}
            {cartoesCredito.length > 0 && (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <FormControl size="small" sx={{ minWidth: 220 }}>
                        <InputLabel>Cartão</InputLabel>
                        <Select
                          value={selectedCartaoId}
                          label="Cartão"
                          onChange={(e) => setSelectedCartaoId(e.target.value)}
                        >
                          <MenuItem value="todos">Todos os Cartões</MenuItem>
                          {cartoesCredito.map((c) => (
                            <MenuItem key={c.id} value={c.id.toString()}>{c.nome}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        label="Mês da Fatura"
                        type="month"
                        value={selectedFaturaMes}
                        onChange={(e) => setSelectedFaturaMes(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Total da Fatura ({selectedFaturaMes})
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: faturaResumo.pendente > 0 ? 'error.main' : 'success.main' }}>
                          {formatBRL(faturaResumo.total)}
                        </Typography>
                      </Box>
                      {faturaResumo.pendenteIds.length > 0 && selectedCartaoId !== 'todos' && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircle2 size={16} />}
                          onClick={handleOpenPayInvoice}
                        >
                          Pagar Fatura ({formatBRL(faturaResumo.pendente)})
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
                    <Table sx={{ minWidth: 720 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Data Compra</TableCell>
                          <TableCell>Cartão</TableCell>
                          <TableCell>Descrição</TableCell>
                          <TableCell>Parcela</TableCell>
                          <TableCell>Vencimento</TableCell>
                          <TableCell>Valor</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {faturaLancamentos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">
                                Nenhum lançamento de cartão encontrado para esta fatura.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          faturaLancamentos.map((lanc) => {
                            const total = (lanc.valor_principal || 0) + (lanc.juros || 0) + (lanc.acrecimos || 0)
                            const cartaoNome = lanc.conta_id ? contaById.get(lanc.conta_id)?.nome || '-' : '-'
                            return (
                              <TableRow key={lanc.id}>
                                <TableCell>{new Date(lanc.data_lancamento).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell>{cartaoNome}</TableCell>
                                <TableCell>{lanc.descricao}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={`${lanc.parcela_atual || 1}/${lanc.total_parcelas || 1}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>{new Date(lanc.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{formatBRL(total)}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={lanc.status}
                                    size="small"
                                    color={lanc.status === 'pago' ? 'success' : lanc.status === 'vencido' ? 'error' : 'warning'}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton size="small" onClick={() => handleEdit(lanc)} aria-label="Editar">
                                    <Edit size={16} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {activeTab === 'lancamentos' && (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Filtros
                </Typography>

                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={12} md={8}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Descrição"
                      placeholder="Buscar por descrição..."
                      value={filterDescricao}
                      onChange={(e) => setFilterDescricao(e.target.value)}
                      InputProps={{
                        startAdornment: <Search size={18} style={{ marginRight: 8, color: '#999' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center', minWidth: 0, justifyContent: 'flex-end' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Período: <strong>{getPeriodLabel(filterPeriodo)}</strong>
                      {filterPeriodo === 'personalizado' && periodInicio && periodFim && (
                        <> ({periodInicio} a {periodFim})</>
                      )}
                      {filterPeriodo !== 'personalizado' && filterPeriodo !== 'todo' && periodInicio && periodFim && (
                        <> ({periodInicio} a {periodFim})</>
                      )}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={filterTipo}
                        label="Tipo"
                        onChange={(e) => setFilterTipo(e.target.value)}
                      >
                        <MenuItem value="todos">Todos</MenuItem>
                        <MenuItem value="debito">Débito</MenuItem>
                        <MenuItem value="credito">Crédito</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Categoria</InputLabel>
                      <Select
                        value={filterCategoria}
                        label="Categoria"
                        onChange={(e) => setFilterCategoria(e.target.value)}
                      >
                        <MenuItem value="todos">Todas</MenuItem>
                        {categorias.map((c) => (
                          <MenuItem key={c.id} value={c.id.toString()}>{c.nome}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Centro de Custo</InputLabel>
                      <Select
                        value={filterCentroCusto}
                        label="Centro de Custo"
                        onChange={(e) => setFilterCentroCusto(e.target.value)}
                      >
                        <MenuItem value="todos">Todos</MenuItem>
                        {centrosCusto.map((c) => (
                          <MenuItem key={c.id} value={c.id.toString()}>{c.nome}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Período</InputLabel>
                      <Select
                        value={filterPeriodo}
                        label="Período"
                        onChange={(e) => setFilterPeriodo(e.target.value as PeriodOption)}
                      >
                        {periodOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {filterPeriodo === 'personalizado' && (
                    <>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Data Inicial"
                          type="date"
                          value={filterDataInicio}
                          onChange={(e) => setFilterDataInicio(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: <Calendar size={18} style={{ marginRight: 8, color: '#999' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Data Final"
                          type="date"
                          value={filterDataFim}
                          onChange={(e) => setFilterDataFim(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: <Calendar size={18} style={{ marginRight: 8, color: '#999' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<Filter size={16} />}
                          onClick={fetchLancamentos}
                          sx={{ mt: 1.5 }}
                        >
                          Filtrar
                        </Button>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                {selectedIds.size > 0 && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                      {selectedIds.size} lançamento(s) selecionado(s)
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<Copy size={16} />} onClick={handleBulkDuplicate}>
                      Duplicar
                    </Button>
                    <Button variant="outlined" size="small" color="error" startIcon={<Trash2 size={16} />} onClick={handleBulkDelete}>
                      Deletar
                    </Button>
                    <Button variant="text" size="small" onClick={() => setSelectedIds(new Set())}>
                      Limpar seleção
                    </Button>
                  </Box>
                )}

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Lançamentos
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
                  <Table sx={{ minWidth: 940 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: 48 }}>
                          <Checkbox
                            checked={selectedIds.size === filteredLancamentos.length && filteredLancamentos.length > 0}
                            indeterminate={selectedIds.size > 0 && selectedIds.size < filteredLancamentos.length}
                            onChange={toggleSelectAll}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Conta</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Valor Principal</TableCell>
                        <TableCell>Juros</TableCell>
                        <TableCell>Acréscimos</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLancamentos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">
                              {loading ? 'Carregando...' : 'Nenhum lançamento encontrado. Clique em "Novo Lançamento" para criar.'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLancamentos.map((lanc) => {
                          const total = (lanc.valor_principal || 0) + (lanc.juros || 0) + (lanc.acrecimos || 0)
                          const isSelected = selectedIds.has(lanc.id)
                          const conta = lanc.conta_id ? contaById.get(lanc.conta_id) : undefined
                          return (
                            <TableRow key={lanc.id} selected={isSelected} sx={{ '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' } }}>
                              <TableCell style={{ width: 48 }}>
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => toggleSelection(lanc.id)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{new Date(lanc.data_lancamento).toLocaleDateString('pt-BR')}</TableCell>
                              <TableCell>
                                <Chip
                                  label={lanc.tipo === 'debito' ? 'Débito' : 'Crédito'}
                                  size="small"
                                  color={lanc.tipo === 'debito' ? 'error' : 'success'}
                                />
                              </TableCell>
                              <TableCell>
                                {conta ? (
                                  <Chip
                                    icon={isCartaoTipo(conta.tipo) ? <CreditCard size={12} /> : undefined}
                                    label={conta.nome}
                                    size="small"
                                    variant="outlined"
                                    color={isCartaoTipo(conta.tipo) ? 'secondary' : 'default'}
                                  />
                                ) : '-'}
                              </TableCell>
                              <TableCell>{lanc.descricao}</TableCell>
                              <TableCell>{formatBRL(lanc.valor_principal)}</TableCell>
                              <TableCell>{formatBRL(lanc.juros || 0)}</TableCell>
                              <TableCell>{formatBRL(lanc.acrecimos || 0)}</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: lanc.tipo === 'debito' ? 'error.main' : 'success.main' }}>
                                {formatBRL(total)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={lanc.status}
                                  size="small"
                                  color={lanc.status === 'pago' ? 'success' : lanc.status === 'vencido' ? 'error' : lanc.status === 'cancelado' ? 'default' : 'warning'}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton size="small" onClick={() => handleEdit(lanc)} edge="end" aria-label="Editar">
                                  <Edit size={18} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}
      </Box>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={closeDeleteConfirm}
        onConfirm={executeDelete}
        title="Confirmar Exclusão"
        message={deleteConfirm.ids.length > 1
          ? `Tem certeza que deseja excluir ${deleteConfirm.ids.length} lançamento(s)? Esta ação não pode ser desfeita.`
          : 'Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.'
        }
        confirmText="Sim, Excluir"
        cancelText="Não"
        variant="danger"
      />

      {/* Dialog Pagar Fatura */}
      <Dialog open={payInvoiceDialog.open} onClose={() => setPayInvoiceDialog({ ...payInvoiceDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle>Pagar Fatura do Cartão</DialogTitle>
        <DialogContent>
          {payError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{payError}</Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Quitar <strong>{payInvoiceDialog.ids.length}</strong> lançamento(s) de <strong>{payInvoiceDialog.cartaoNome}</strong> ({payInvoiceDialog.faturaMes}) no total de <strong>{formatBRL(payInvoiceDialog.total)}</strong>.
            </Alert>
            <FormControl fullWidth size="small">
              <InputLabel>Conta Bancária Pagadora</InputLabel>
              <Select
                value={payContaBancariaId}
                label="Conta Bancária Pagadora"
                onChange={(e) => setPayContaBancariaId(e.target.value)}
              >
                {contasBancarias.map((cb) => (
                  <MenuItem key={cb.id} value={cb.id.toString()}>{cb.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Data do Pagamento"
              type="date"
              value={payDataPagamento}
              onChange={(e) => setPayDataPagamento(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayInvoiceDialog({ ...payInvoiceDialog, open: false })}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleConfirmPayInvoice}>
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for new/edit lancamento */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        <DialogContent>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
              <AlertTitle>Erro ao salvar</AlertTitle>
              {saveError}
            </Alert>
          )}
          {isFormCartao && selectedFormConta && (() => {
            const limiteTotal = Number(selectedFormConta.limite_cartao || 0)
            const utilizado = limiteUtilizadoPorCartao.get(selectedFormConta.id) || 0
            const disponivel = Math.max(0, limiteTotal - utilizado)
            const valorNovo = parseFloat(formData.valor_principal) || 0
            const excedeu = !editingId && limiteTotal > 0 && valorNovo > disponivel
            return (
              <Alert severity={excedeu ? 'warning' : 'info'} sx={{ mb: 2, mt: 1 }}>
                <strong>Cartão selecionado ({selectedFormConta.nome}):</strong>{' '}
                Limite disponível: <strong>{formatBRL(disponivel)}</strong> de {formatBRL(limiteTotal)}
                {selectedFormConta.dia_vencimento ? ` · Vencimento dia ${selectedFormConta.dia_vencimento}` : ''}.
                {excedeu && ' Atenção: o valor informado excede o limite disponível!'}
              </Alert>
            )
          })()}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={formData.tipo}
                    label="Tipo"
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <MenuItem value="debito">Débito</MenuItem>
                    <MenuItem value="credito">Crédito</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Conta (Bancária / Cartão)</InputLabel>
                  <Select
                    value={formData.conta_id}
                    label="Conta (Bancária / Cartão)"
                    onChange={(e) => handleContaChange(e.target.value)}
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {contas.map((c) => (
                      <MenuItem key={c.id} value={c.id.toString()}>
                        {c.nome} {isCartaoTipo(c.tipo) ? '(Cartão)' : '(Bancária)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Descrição da Conta"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={formData.categoria_id}
                    label="Categoria"
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {categorias.map((c) => (
                      <MenuItem key={c.id} value={c.id.toString()}>{c.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Forma de Pagamento</InputLabel>
                  <Select
                    value={formData.forma_pagamento_id}
                    label="Forma de Pagamento"
                    onChange={(e) => setFormData({ ...formData, forma_pagamento_id: e.target.value })}
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {formasPagamento.map((f) => (
                      <MenuItem key={f.id} value={f.id.toString()}>{f.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Centro de Custo</InputLabel>
                  <Select
                    value={formData.centro_custo_id}
                    label="Centro de Custo"
                    onChange={(e) => setFormData({ ...formData, centro_custo_id: e.target.value })}
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {centrosCusto.map((c) => (
                      <MenuItem key={c.id} value={c.id.toString()}>{c.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cliente/Fornecedor</InputLabel>
                  <Select
                    value={formData.cliente_id}
                    label="Cliente/Fornecedor"
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {clientes.map((c) => (
                      <MenuItem key={c.id} value={c.id.toString()}>{c.nome} (Cliente)</MenuItem>
                    ))}
                    {fornecedores.map((f) => (
                      <MenuItem key={f.id} value={f.id.toString()}>{f.nome} (Fornecedor)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="pendente">Pendente</MenuItem>
                    <MenuItem value="pago">Pago</MenuItem>
                    <MenuItem value="vencido">Vencido</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {!editingId && isFormCartao && (
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Parcelas no Cartão</InputLabel>
                    <Select
                      value={formData.total_parcelas}
                      label="Parcelas no Cartão"
                      onChange={(e) => setFormData({ ...formData, total_parcelas: e.target.value })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map((p) => (
                        <MenuItem key={p} value={String(p)}>
                          {p === 1 ? '1x (À vista na fatura)' : `${p}x mensais`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label={!editingId && isFormCartao && Number(formData.total_parcelas) > 1 ? 'Valor Total da Compra' : 'Valor Principal'}
                  type="number"
                  value={formData.valor_principal}
                  onChange={(e) => setFormData({ ...formData, valor_principal: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Juros"
                  type="number"
                  value={formData.juros}
                  onChange={(e) => setFormData({ ...formData, juros: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Acréscimos"
                  type="number"
                  value={formData.acrecimos}
                  onChange={(e) => setFormData({ ...formData, acrecimos: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data de Lançamento"
                  type="date"
                  value={formData.data_lancamento}
                  onChange={(e) => {
                    const novaData = e.target.value
                    setFormData((prev) => ({
                      ...prev,
                      data_lancamento: novaData,
                      data_vencimento:
                        isFormCartao && selectedFormConta
                          ? calcularVencimentoFatura(novaData, selectedFormConta.dia_vencimento, selectedFormConta.dia_fechamento)
                          : prev.data_vencimento,
                    }))
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data de Vencimento"
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data de Pagamento"
                  type="date"
                  value={formData.data_pagamento}
                  onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Observação"
                  multiline
                  rows={3}
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            Anexos
          </Typography>
          <FileUpload
            files={uploadedFiles}
            onFilesChange={setUploadedFiles}
            uploadedUrls={uploadedUrls}
            onUploadedUrlsChange={setUploadedUrls}
          />
        </Box>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); setEditingId(null); resetForm() }}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>
            {editingId ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  )
}
