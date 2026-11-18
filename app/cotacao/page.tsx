'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '../components/AppShell'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { DollarSign, TrendingUp, RefreshCw, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react'

interface Quote {
  currency: string
  code: string
  rate: number
  lastUpdated: string
}

export default function CotacaoPage() {
  const [quotes, setQuotes] = useState<Quote[]>([
    { currency: 'Dólar Comercial', code: 'USD', rate: 5.742, lastUpdated: 'Tempo Real' },
    { currency: 'Euro', code: 'EUR', rate: 6.084, lastUpdated: 'Tempo Real' },
    { currency: 'Libra Esterlina', code: 'GBP', rate: 7.291, lastUpdated: 'Tempo Real' },
    { currency: 'Iene Japonês', code: 'JPY', rate: 0.037, lastUpdated: 'Tempo Real' },
    { currency: 'Franco Suíço', code: 'CHF', rate: 6.478, lastUpdated: 'Tempo Real' },
  ])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('BRL')
  const [convertValue, setConvertValue] = useState('1000')
  const [convertedResult, setConvertedResult] = useState<number | null>(null)

  const fetchQuotes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cotacao')
      const data = await res.json()
      if (data.success && data.quotes && data.quotes.length > 0) {
        setQuotes(data.quotes)
      }
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    } catch (error) {
      console.error('Error fetching quotes:', error)
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
    fetchQuotes()
  }, [])

  const handleConvert = () => {
    const val = parseFloat(convertValue.replace(',', '.'))
    if (isNaN(val)) return

    let fromRate = 1
    let toRate = 1

    if (fromCurrency === 'USD') fromRate = 5.742
    else if (fromCurrency === 'EUR') fromRate = 6.084
    else if (fromCurrency === 'GBP') fromRate = 7.291

    if (toCurrency === 'USD') toRate = 5.742
    else if (toCurrency === 'EUR') toRate = 6.084
    else if (toCurrency === 'GBP') toRate = 7.291

    const inBrl = val * fromRate
    const result = inBrl / toRate
    setConvertedResult(result)
  }

  return (
    <AppShell
      title="Cotação de Moedas & Câmbio"
      subtitle={`Taxas cambiais em tempo real &bull; Atualizado: ${lastUpdate || '--:--:--'}`}
      breadcrumbs={[{ label: 'Início', href: '/dashboard' }, { label: 'Cotação de Moedas' }]}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
          onClick={fetchQuotes}
          disabled={loading}
        >
          Atualizar Cotações
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Grid container spacing={2}>
          {[
            { label: 'Moedas Monitoradas', value: quotes.length, icon: <DollarSign size={24} />, color: 'primary' },
            { label: 'USD / BRL (Comercial)', value: 'R$ 5,742', icon: <ArrowDownRight size={24} />, color: 'success' },
            { label: 'EUR / BRL (Comercial)', value: 'R$ 6,084', icon: <ArrowUpRight size={24} />, color: 'error' },
          ].map((stat) => (
            <Grid item xs={12} sm={4} key={stat.label}>
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box sx={{ color: stat.color + '.main' }}>{stat.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Cotações Globais
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
                  <Table sx={{ minWidth: 540 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Moeda</TableCell>
                        <TableCell>Código</TableCell>
                        <TableCell>Taxa (BRL)</TableCell>
                        <TableCell>Atualização</TableCell>
                        <TableCell align="right">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quotes.map((q) => (
                        <TableRow key={q.code} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{q.currency}</TableCell>
                          <TableCell>
                            <Chip label={q.code} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                            R$ {typeof q.rate === 'number' ? q.rate.toFixed(4) : q.rate}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{q.lastUpdated}</TableCell>
                          <TableCell align="right">
                            <Chip label="Ativa" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Conversor de Moedas */}
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowLeftRight size={20} />
                    Conversor Rápido
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>De</InputLabel>
                        <Select label="De" value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                          <MenuItem value="USD">USD ($)</MenuItem>
                          <MenuItem value="EUR">EUR (€)</MenuItem>
                          <MenuItem value="GBP">GBP (£)</MenuItem>
                          <MenuItem value="BRL">BRL (R$)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Para</InputLabel>
                        <Select label="Para" value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                          <MenuItem value="BRL">BRL (R$)</MenuItem>
                          <MenuItem value="USD">USD ($)</MenuItem>
                          <MenuItem value="EUR">EUR (€)</MenuItem>
                          <MenuItem value="GBP">GBP (£)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    size="small"
                    label="Valor a Converter"
                    placeholder="1000,00"
                    value={convertValue}
                    onChange={(e) => setConvertValue(e.target.value)}
                    sx={{ mt: 2 }}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    startIcon={<TrendingUp size={16} />}
                    onClick={handleConvert}
                  >
                    Calcular Conversão
                  </Button>

                  {convertedResult !== null && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Resultado Estimado:
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        {toCurrency === 'BRL' ? 'R$ ' : toCurrency === 'USD' ? '$ ' : '€ '}
                        {convertedResult.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Informações de Câmbio & Impostos */}
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Índices de Referência
                  </Typography>
                  <List disablePadding>
                    <ListItem disableGutters sx={{ py: 1 }}>
                      <ListItemText primary="Taxa Selic Over" secondary="Meta COPOM" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        11,25% a.a.
                      </Typography>
                    </ListItem>
                    <Divider />
                    <ListItem disableGutters sx={{ py: 1 }}>
                      <ListItemText primary="Taxa CDI" secondary="B3 Certificados" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        11,15% a.a.
                      </Typography>
                    </ListItem>
                    <Divider />
                    <ListItem disableGutters sx={{ py: 1 }}>
                      <ListItemText primary="IOF Câmbio PJ" secondary="Operações comerciais" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        0,38%
                      </Typography>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </AppShell>
  )
}
