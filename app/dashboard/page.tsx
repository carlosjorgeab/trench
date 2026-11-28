'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '../components/AppShell'
import Link from 'next/link'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Plus,
  Bell,
  Search,
  Eye,
  EyeOff,
  Wallet,
  Calendar,
  Filter,
  Download,
  CheckCircle2,
  PieChart,
  BarChart3,
  Clock,
  Layers,
  Globe,
  ChevronRight,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { useThemeConfig } from '../lib/theme-config-context'
import { useAppUser } from '../lib/user-context'

interface FinancialSummary {
  saldoTotal: number
  receitasMes: number
  despesasMes: number
  lucroLiquido: number
  margemLiquida: number
  contasPagar: number
  contasPagarQtd: number
  contasReceber: number
  contasReceberQtd: number
  inadimplencia: number
}

interface Currency {
  code: string
  name: string
  value: number
  variation: number | null
  unit: string
  category: 'Brasil' | 'Forex' | 'Commodities'
  source: string
  updatedAt: string
}

interface FilterOption {
  id: number
  name: string
}

interface BankAccount {
  id: string
  name: string
  type: string
  agency: string
  account: string
  balance: number
  limiteCartao?: number | null
  diaVencimento?: number | null
  limiteConta?: number | null
  taxaJurosConta?: number | null
  dataVencimentoLimite?: string | null
  color: string
  badge: string
}

interface CashFlowItem {
  mes: string
  receitas: number
  despesas: number
}

interface CategoryExpense {
  name: string
  valor: number
  percentual: number
  color: string
}

interface Transaction {
  id: number
  descricao: string
  categoria: string
  conta: string
  data: string
  valor: number
  tipo: 'receita' | 'despesa'
  status: string
}

export default function DashboardPage() {
  const theme = useTheme()
  const { config } = useThemeConfig()
  const { appUser, loadingAppUser } = useAppUser()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    saldoTotal: 0,
    receitasMes: 0,
    despesasMes: 0,
    lucroLiquido: 0,
    margemLiquida: 0,
    contasPagar: 0,
    contasPagarQtd: 0,
    contasReceber: 0,
    contasReceberQtd: 0,
    inadimplencia: 0,
  })
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [marketUpdatedAt, setMarketUpdatedAt] = useState<string | null>(null)
  const [marketWarning, setMarketWarning] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [accountOptions, setAccountOptions] = useState<FilterOption[]>([])
  const [costCenterOptions, setCostCenterOptions] = useState<FilterOption[]>([])
  const [cashFlowHistory, setCashFlowHistory] = useState<CashFlowItem[]>([])
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)

  const [hideValues, setHideValues] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('mes')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [selectedCostCenterId, setSelectedCostCenterId] = useState('')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const formatMoney = (value: number) => {
    if (hideValues) return 'R$ ••••••••'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const fetchDashboardData = async () => {
    const isSystemAdmin = appUser?.perfil === 'admin_sistema' || appUser?.perfil === 'admin'
    if (!appUser?.empresa_id && !isSystemAdmin) {
      setError('Empresa não vinculada ao usuário')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ user_id: appUser.id, period: selectedPeriod })
      if (selectedAccountId) params.set('conta_id', selectedAccountId)
      if (selectedCostCenterId) params.set('centro_custo_id', selectedCostCenterId)
      const response = await fetch(`/api/dashboard?${params.toString()}`, { cache: 'no-store' })
      const result = await response.json()
      if (result.success && result.data) {
        setFinancialData(result.data.financialSummary)
        setBankAccounts(result.data.bankAccounts)
        setCashFlowHistory(result.data.cashFlowHistory)
        setCategoryExpenses(result.data.categoryExpenses)
        setRecentTransactions(result.data.recentTransactions)
        setLastUpdated(result.data.lastUpdated || new Date().toISOString())
      } else {
        setError(result.error || 'Erro ao carregar dashboard')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/mercado', { cache: 'no-store' })
      const result = await response.json()
      setCurrencies(result.quotes || [])
      setMarketUpdatedAt(result.updatedAt || new Date().toISOString())
      setMarketWarning(Boolean(result.failedSources))
    } catch {
      setCurrencies([])
      setMarketUpdatedAt(null)
      setMarketWarning(true)
    }
  }

  const fetchFilterOptions = async () => {
    if (!appUser?.empresa_id) return
    try {
      const [accountsResponse, centersResponse] = await Promise.all([
        fetch(`/api/contas?empresa_id=${appUser.empresa_id}`, { cache: 'no-store' }),
        fetch(`/api/centros-custos?empresa_id=${appUser.empresa_id}`, { cache: 'no-store' }),
      ])
      const [accountsResult, centersResult] = await Promise.all([accountsResponse.json(), centersResponse.json()])
      if (accountsResult.success) {
        setAccountOptions((accountsResult.data || [])
          .filter((account: any) => account.ativo !== false)
          .map((account: any) => ({ id: account.id, name: account.nome })))
      }
      if (centersResult.success) {
        setCostCenterOptions((centersResult.data || [])
          .filter((center: any) => center.ativo !== false)
          .map((center: any) => ({ id: center.id, name: center.nome })))
      }
    } catch (fetchError) {
      console.error('Erro ao carregar filtros do dashboard:', fetchError)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
    fetchMarketData()
  }

  const formatMarketQuote = (quote: Currency) => {
    if (quote.code === 'IBOV') return `${Math.round(quote.value).toLocaleString('pt-BR')} pts`
    if (quote.unit === '% a.a.' || quote.unit === '%') return `${quote.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${quote.unit}`
    if (quote.unit === 'R$/un.') return `R$ ${quote.value.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
    return `${quote.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${quote.unit}`
  }

  useEffect(() => {
    if (!loadingAppUser) {
      fetchDashboardData()
    }
  }, [appUser, loadingAppUser, selectedPeriod, selectedAccountId, selectedCostCenterId])

  useEffect(() => {
    if (!loadingAppUser && appUser?.empresa_id) fetchFilterOptions()
  }, [appUser?.empresa_id, loadingAppUser])

  useEffect(() => {
    fetchMarketData()
    const marketInterval = window.setInterval(fetchMarketData, 5 * 60 * 1000)
    return () => window.clearInterval(marketInterval)
  }, [])

  useEffect(() => {
    if (loadingAppUser || !appUser) return
    const refreshInterval = window.setInterval(fetchDashboardData, 60 * 1000)
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchDashboardData()
    }
    window.addEventListener('focus', refreshWhenVisible)
    return () => {
      window.clearInterval(refreshInterval)
      window.removeEventListener('focus', refreshWhenVisible)
    }
  }, [appUser, loadingAppUser, selectedPeriod, selectedAccountId, selectedCostCenterId])

  const maxCashValue = cashFlowHistory.length > 0
    ? Math.max(...cashFlowHistory.map((c) => Math.max(c.receitas, c.despesas)))
    : 1

  // Loading user session
  if (loadingAppUser) {
    return (
      <AppShell
        title="Painel Financeiro Executivo"
        subtitle="Verificando sessão do usuário..."
        breadcrumbs={[{ label: 'Início' }, { label: 'Dashboard' }]}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} item xs={12} sm={6} lg={3}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: `${config.borderRadius}px`, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={32} />
                  <Skeleton variant="text" width="80%" height={16} />
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="rectangular" height={280} />
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card elevation={0}>
                <Skeleton variant="rectangular" height={280} />
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={4}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <Skeleton variant="rectangular" height={320} />
              </Card>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <Skeleton variant="rectangular" height={320} />
              </Card>
            </Grid>
          </Grid>
        </Box>
      </AppShell>
    )
  }

  // No user or no empresa linked
  if (!appUser) {
    return (
      <AppShell
        title="Painel Financeiro Executivo"
        subtitle="Sessão não encontrada"
        breadcrumbs={[{ label: 'Início' }, { label: 'Dashboard' }]}
      >
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: `${config.borderRadius}px`, border: '1px solid', borderColor: 'warning.main', bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
          <Box sx={{ mb: 2 }}>
            <AlertTriangle size={48} color="warning.main" />
          </Box>
          <Typography variant="h6" sx={{ mb: 1, color: 'warning.main' }}>
            Usuário não autenticado
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Faça login para acessar o dashboard financeiro.
          </Typography>
        </Paper>
      </AppShell>
    )
  }

  const isSystemAdmin = appUser?.perfil === 'admin_sistema' || appUser?.perfil === 'admin'

  if (!appUser.empresa_id && !isSystemAdmin) {
    return (
      <AppShell
        title="Painel Financeiro Executivo"
        subtitle="Empresa não vinculada"
        breadcrumbs={[{ label: 'Início' }, { label: 'Dashboard' }]}
      >
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: `${config.borderRadius}px`, border: '1px solid', borderColor: 'warning.main', bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
          <Box sx={{ mb: 2 }}>
            <AlertTriangle size={48} color="warning.main" />
          </Box>
          <Typography variant="h6" sx={{ mb: 1, color: 'warning.main' }}>
            Nenhuma empresa vinculada ao seu usuário
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Entre em contato com o administrador do sistema para vincular sua conta a uma empresa.
          </Typography>
        </Paper>
      </AppShell>
    )
  }

  if (loading) {
    return (
      <AppShell
        title="Painel Financeiro Executivo"
        subtitle="Carregando dados do banco de dados..."
        breadcrumbs={[{ label: 'Início' }, { label: 'Dashboard' }]}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} item xs={12} sm={6} lg={3}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: `${config.borderRadius}px`, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={32} />
                  <Skeleton variant="text" width="80%" height={16} />
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="rectangular" height={280} />
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card elevation={0}>
                <Skeleton variant="rectangular" height={280} />
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={4}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <Skeleton variant="rectangular" height={320} />
              </Card>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <Skeleton variant="rectangular" height={320} />
              </Card>
            </Grid>
          </Grid>
        </Box>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell
        title="Painel Financeiro Executivo"
        subtitle="Erro ao carregar dados"
        breadcrumbs={[{ label: 'Início' }, { label: 'Dashboard' }]}
        actions={
          <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshCw size={16} />}>
            Tentar Novamente
          </Button>
        }
      >
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: `${config.borderRadius}px`, border: '1px solid', borderColor: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.05) }}>
          <Box sx={{ mb: 2 }}>
              <AlertTriangle size={48} color="error.main" />
            </Box>
          <Typography variant="h6" sx={{ mb: 1, color: 'error.main' }}>
            Não foi possível carregar os dados do dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshCw size={16} />}>
            Tentar Novamente
          </Button>
        </Paper>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Painel Financeiro Executivo"
      subtitle="Visão consolidada de caixa, contas bancárias, conciliação e indicadores econômicos"
      breadcrumbs={[{ label: 'Início' }, { label: 'Dashboard' }]}
      actions={
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={hideValues ? 'Mostrar Valores' : 'Ocultar Valores (Privacidade)'}>
            <IconButton
              size="small"
              onClick={() => setHideValues(!hideValues)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: `${config.borderRadius}px`,
                p: 1,
              }}
            >
              {hideValues ? <EyeOff size={18} /> : <Eye size={18} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Atualizar dados">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: `${config.borderRadius}px`,
                p: 1,
              }}
            >
              <RefreshCw size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper
          elevation={0}
          aria-label="Cotações de mercado"
          sx={{
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: `${config.borderRadius}px`,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Globe size={16} color={theme.palette.primary.main} />
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Mercados</Typography>
              <Typography variant="caption" color="text.secondary">Brasil · Forex · Commodities</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {marketUpdatedAt ? `Atualizado ${new Date(marketUpdatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Cotações indisponíveis'}
              {marketWarning ? ' · dados parciais' : ''}
            </Typography>
          </Box>
          {currencies.length > 0 ? (
            <Box className="market-ticker-viewport">
              <Box className="market-ticker-track">
                {[0, 1].flatMap((copy) => currencies.map((quote) => (
                  <Box key={`${copy}-${quote.code}`} className="market-ticker-item" aria-hidden={copy === 1} title={`${quote.name} · fonte: ${quote.source}${quote.updatedAt ? ` · ${quote.updatedAt}` : ''}`}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{quote.code}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{formatMarketQuote(quote)}</Typography>
                    {quote.variation !== null && (
                      <Typography variant="caption" sx={{ color: quote.variation >= 0 ? 'success.main' : 'error.main', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {quote.variation > 0 ? '+' : ''}{quote.variation.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%
                      </Typography>
                    )}
                    <Chip label={quote.category} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.62rem' }} />
                  </Box>
                )))}
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
              Não foi possível carregar as cotações agora. Atualização automática em 5 minutos.
            </Typography>
          )}
        </Paper>

        {/* Barra Superior de Filtros e Seletores Globais */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: `${config.borderRadius}px`,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          {/* Seletor de Período */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={18} color={theme.palette.text.secondary} />
            <Box sx={{ display: 'flex', gap: 0.5, bgcolor: alpha(theme.palette.divider, 0.25), p: 0.5, borderRadius: `${config.borderRadius}px` }}>
              {[
                { key: 'hoje', label: 'Hoje' },
                { key: '7d', label: '7D' },
                { key: 'mes', label: 'Este Mês' },
                { key: 'trimestre', label: 'Trimestre' },
                { key: 'ano', label: 'Este Ano' },
              ].map((p) => (
                <Chip
                  key={p.key}
                  label={p.label}
                  size="small"
                  clickable
                  color={selectedPeriod === p.key ? 'primary' : 'default'}
                  variant={selectedPeriod === p.key ? 'filled' : 'outlined'}
                  onClick={() => setSelectedPeriod(p.key)}
                  sx={{
                    height: 26,
                    fontSize: '0.75rem',
                    fontWeight: selectedPeriod === p.key ? 700 : 500,
                    border: 'none',
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', lg: 'block' } }} />

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 190 } }}>
            <InputLabel id="dashboard-account-filter-label">Conta bancária</InputLabel>
            <Select
              labelId="dashboard-account-filter-label"
              value={selectedAccountId}
              label="Conta bancária"
              onChange={(event) => setSelectedAccountId(event.target.value)}
            >
              <MenuItem value="">Todas as contas</MenuItem>
              {accountOptions.map((account) => <MenuItem key={account.id} value={String(account.id)}>{account.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 210 } }}>
            <InputLabel id="dashboard-cost-center-filter-label">Centro de custo</InputLabel>
            <Select
              labelId="dashboard-cost-center-filter-label"
              value={selectedCostCenterId}
              label="Centro de custo"
              onChange={(event) => setSelectedCostCenterId(event.target.value)}
            >
              <MenuItem value="">Todos os centros</MenuItem>
              {costCenterOptions.map((center) => <MenuItem key={center.id} value={String(center.id)}>{center.name}</MenuItem>)}
            </Select>
          </FormControl>

          {lastUpdated && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: 'auto' }, whiteSpace: 'nowrap' }}>
              Financeiro atualizado {new Date(lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          )}
        </Paper>

        {/* Banner Hero Executivo Elegante */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: `${config.borderRadius + 2}px`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 3,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.25)}`,
          }}
        >
          {/* Decoração de fundo sutil */}
          <Box
            sx={{
              position: 'absolute',
              right: -30,
              bottom: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              pointerEvents: 'none',
            }}
          />

          <Box sx={{ zIndex: 1, minWidth: 260 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="overline" sx={{ letterSpacing: '0.1em', fontWeight: 600, opacity: 0.85 }}>
                RESULTADO LÍQUIDO REALIZADO NO PERÍODO
              </Typography>
              <Chip
                label={refreshing ? 'Atualizando...' : 'Atualizado'}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                }}
              />
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              {formatMoney(financialData.saldoTotal)}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowUpRight size={18} color="#86efac" />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#86efac' }}>
                  {selectedPeriod === 'hoje' ? 'Hoje' : selectedPeriod === '7d' ? 'Últimos 7 dias' : selectedPeriod === 'trimestre' ? 'Este trimestre' : selectedPeriod === 'ano' ? 'Este ano' : 'Este mês'}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                &bull;
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Margem Operacional Líquida: <strong>{financialData.margemLiquida}%</strong>
              </Typography>
            </Box>
          </Box>

          {/* Botões de Ação Direta no Banner */}
          <Box sx={{ display: 'flex', gap: 1.5, zIndex: 1, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/financeiro"
              variant="contained"
              sx={{
                bgcolor: '#ffffff',
                color: theme.palette.primary.main,
                fontWeight: 700,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                boxShadow: 2,
              }}
              startIcon={<Plus size={16} />}
            >
              Lançamentos
            </Button>
            <Button
              component={Link}
              href="/prestacao"
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,255,255,0.6)',
                color: '#ffffff',
                fontWeight: 600,
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              startIcon={<FileText size={16} />}
            >
              Prestação Contas
            </Button>
            <Button
              component={Link}
              href="/cotacao"
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,255,255,0.6)',
                color: '#ffffff',
                fontWeight: 600,
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              startIcon={<TrendingUp size={16} />}
            >
              Câmbio
            </Button>
          </Box>
        </Paper>

        {/* Grade de 4 Métricas Principais (Cards de Alta Densidade) */}
        <Grid container spacing={2.5}>
          {/* Card 1: Receitas */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: `${config.borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Receitas Realizadas
                </Typography>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    color: 'success.main',
                  }}
                >
                  <ArrowUpRight size={20} />
                </Avatar>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', mb: 0.5 }}>
                {formatMoney(financialData.receitasMes)}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                  label="Período filtrado"
                  size="small"
                  color="success"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Recebimentos concluídos
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Card 2: Despesas */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: `${config.borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Despesas Operacionais
                </Typography>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: alpha(theme.palette.error.main, 0.12),
                    color: 'error.main',
                  }}
                >
                  <ArrowDownRight size={20} />
                </Avatar>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', mb: 0.5 }}>
                {formatMoney(financialData.despesasMes)}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                  label="Período filtrado"
                  size="small"
                  color="success"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Pagamentos concluídos
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Card 3: Contas a Pagar */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: `${config.borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Contas a Pagar
                </Typography>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: alpha(theme.palette.warning.main, 0.12),
                    color: 'warning.main',
                  }}
                >
                  <AlertTriangle size={20} />
                </Avatar>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', mb: 0.5 }}>
                {formatMoney(financialData.contasPagar)}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                  label={`${financialData.contasPagarQtd} títulos`}
                  size="small"
                  color="warning"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                />
                <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                  {financialData.contasPagarQtd > 0 ? `${financialData.contasPagarQtd} pendentes` : 'Todas em dia'}
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Card 4: Contas a Receber */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: `${config.borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Contas a Receber
                </Typography>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: alpha(theme.palette.info.main, 0.12),
                    color: 'info.main',
                  }}
                >
                  <DollarSign size={20} />
                </Avatar>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', mb: 0.5 }}>
                {formatMoney(financialData.contasReceber)}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                  label={`${financialData.contasReceberQtd} recebíveis`}
                  size="small"
                  color="info"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                />
                <Typography variant="caption" color={financialData.inadimplencia > 2 ? 'error.main' : 'success.main'} sx={{ fontWeight: 600 }}>
                  Inadimplência {financialData.inadimplencia}%
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Seção Central: Fluxo de Caixa Mensal (Visual SVG) & Distribuição de Despesas */}
        <Grid container spacing={3}>
          {/* Gráfico Visual de Fluxo de Caixa (2/3 da largura) */}
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  p: 2.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Fluxo de Caixa ({selectedPeriod === 'hoje' ? 'Hoje' : selectedPeriod === '7d' ? 'Últimos 7 dias' : selectedPeriod === 'trimestre' ? 'Este trimestre' : selectedPeriod === 'ano' ? 'Este ano' : 'Este mês'})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Entradas e saídas dentro do período e dos filtros selecionados
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: theme.palette.primary.main }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Receitas
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: theme.palette.error.main }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Despesas
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {/* Visualizador de Barras Proporcionais em SVG / Flex */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: 220,
                    pt: 2,
                    pb: 1,
                    gap: { xs: 1, sm: 2 },
                  }}
                >
                  {cashFlowHistory.length > 0 ? cashFlowHistory.map((item, index) => {
                    const receitaH = Math.round((item.receitas / maxCashValue) * 180)
                    const despesaH = Math.round((item.despesas / maxCashValue) * 180)

                    return (
                      <Box
                        key={item.mes}
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, width: '100%', justifyContent: 'center' }}>
                          {/* Barra de Receitas */}
                          <Tooltip title={`Receitas: ${formatMoney(item.receitas)}`}>
                            <Box
                              sx={{
                                width: { xs: 14, sm: 22 },
                                height: `${receitaH}px`,
                                borderRadius: '4px 4px 0 0',
                                bgcolor: theme.palette.primary.main,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: theme.palette.primary.dark,
                                  transform: 'scaleY(1.05)',
                                },
                              }}
                            />
                          </Tooltip>

                          {/* Barra de Despesas */}
                          <Tooltip title={`Despesas: ${formatMoney(item.despesas)}`}>
                            <Box
                              sx={{
                                width: { xs: 14, sm: 22 },
                                height: `${despesaH}px`,
                                borderRadius: '4px 4px 0 0',
                                bgcolor: theme.palette.error.main,
                                opacity: 0.85,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                  opacity: 1,
                                  transform: 'scaleY(1.05)',
                                },
                              }}
                            />
                          </Tooltip>
                        </Box>

                        <Typography variant="caption" sx={{ mt: 1, fontWeight: 700, color: 'text.secondary' }}>
                          {item.mes}
                        </Typography>
                      </Box>
                    )
                  }) : (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                      <Typography variant="body2">Sem dados de fluxo de caixa</Typography>
                    </Box>
                  )}
                </Box>

                <Box
                  sx={{
                    pt: 2,
                    borderTop: '1px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Saldo Acumulado no Período: <strong>{formatMoney(financialData.lucroLiquido)}</strong>
                  </Typography>
                  <Button component={Link} href="/financeiro" size="small" endIcon={<ChevronRight size={14} />}>
                    Ver Fluxo Detalhado
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribuição de Despesas (1/3 da largura) */}
          <Grid item xs={12} lg={4}>
            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Despesas por Centro de Custo
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Participação percentual no período filtrado
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {categoryExpenses.length > 0 ? categoryExpenses.map((cat) => (
                    <Box key={cat.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {cat.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatMoney(cat.valor)}{' '}
                          <Typography component="span" variant="caption" color="text.secondary">
                            ({cat.percentual}%)
                          </Typography>
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={cat.percentual}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(cat.color, 0.15),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: cat.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  )) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Typography variant="body2">Sem dados de despesas por categoria</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Seção Inferior: Contas Bancárias & Últimos Lançamentos Auditados */}
        <Grid container spacing={3}>
          {/* Contas Bancárias Cadastradas */}
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ height: '100%' }}>
              <Box
                sx={{
                  p: 2.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Contas & Caixas
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Saldos conciliados por instituição financeira
                  </Typography>
                </Box>
                <Button component={Link} href="/cadastros/contas" size="small">
                  Gerenciar
                </Button>
              </Box>

              <CardContent sx={{ p: 2 }}>
                <List disablePadding>
                  {bankAccounts.length > 0 ? bankAccounts.map((banco, index) => (
                    <Box key={banco.id}>
                      <ListItem sx={{ px: 1, py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: alpha(banco.color, 0.12), color: banco.color, fontWeight: 700 }}>
                            <Wallet size={20} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {banco.name}
                              </Typography>
                              <Chip
                                label={banco.badge}
                                size="small"
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                              />
                            </Box>
                          }
                          secondary={
                            banco.type === 'cartao_credito' || banco.type === 'cartao'
                              ? `Limite: ${formatMoney(banco.limiteCartao || 0)}${banco.diaVencimento ? ` • Venc. dia ${String(banco.diaVencimento).padStart(2, '0')}` : ''}`
                              : banco.limiteConta != null && banco.limiteConta > 0
                                ? `Limite: ${formatMoney(banco.limiteConta)}${banco.taxaJurosConta != null ? ` (${banco.taxaJurosConta}% a.m.)` : ''}${banco.dataVencimentoLimite ? ` • Venc. ${new Date(`${banco.dataVencimentoLimite.split('T')[0]}T12:00:00`).toLocaleDateString('pt-BR')}` : ''}`
                                : banco.agency || banco.account
                                  ? `Ag: ${banco.agency} • CC: ${banco.account}`
                                  : 'Conta Bancária Ativa'
                          }
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                          {formatMoney(banco.balance)}
                        </Typography>
                      </ListItem>
                      {index < bankAccounts.length - 1 && <Divider />}
                    </Box>
                  )) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Typography variant="body2">Nenhuma conta bancária cadastrada</Typography>
                    </Box>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Últimos Lançamentos Auditados */}
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ height: '100%' }}>
              <Box
                sx={{
                  p: 2.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Últimas Transações Financeiras
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Lançamentos recentes sincronizados com o razão contábil
                  </Typography>
                </Box>
                <Button component={Link} href="/financeiro" size="small" endIcon={<ArrowRight size={16} />}>
                  Ver Todos
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Transação</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Conta</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {tx.descricao}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tx.data}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={tx.categoria}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {tx.conta}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={tx.status}
                            size="small"
                            color={tx.status === 'Concluído' ? 'success' : tx.status === 'Agendado' ? 'info' : 'warning'}
                            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              fontVariantNumeric: 'tabular-nums',
                              color: tx.tipo === 'receita' ? 'success.main' : 'text.primary',
                            }}
                          >
                            {tx.tipo === 'receita' ? '+' : '-'}
                            {formatMoney(tx.valor)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          Nenhuma transação recente
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>

      </Box>
    </AppShell>
  )
}