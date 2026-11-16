'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '../components/sidebar'
import { Box, Grid, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider } from '@mui/material'
import { DollarSign, TrendingUp, RefreshCw, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react'

interface Quote {
  currency: string
  code: string
  rate: number
  lastUpdated: string
}

export default function CotacaoPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  const fetchQuotes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cotacao')
      const data = await res.json()
      if (data.success) {
        setQuotes(data.quotes)
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ ml: { lg: '288px' } }}>
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 1,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Cotação de Moedas
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cotações em tempo real • Atualizado: {lastUpdate || '--:--:--'}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />} onClick={fetchQuotes} disabled={loading}>
            Atualizar
          </Button>
        </Box>

        <Box component="main" sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Moedas', value: quotes.length, icon: <DollarSign size={24} />, color: 'primary' },
              { label: 'Melhor Compra', value: '—', icon: <ArrowUpRight size={24} />, color: 'success' },
              { label: 'Melhor Venda', value: '—', icon: <ArrowDownRight size={24} />, color: 'error' },
            ].map((stat) => (
              <Grid item xs={4} key={stat.label}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {stat.label}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 500, mt: 1 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Box sx={{ color: stat.color + '.main' }}>
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Cotações Atuais
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Moeda</TableCell>
                          <TableCell>Código</TableCell>
                          <TableCell>Taxa (BRL)</TableCell>
                          <TableCell>Atualização</TableCell>
                          <TableCell>Variação</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {quotes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">
                                {loading ? 'Carregando cotações...' : 'Nenhuma cotação disponível'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          quotes.map((q) => (
                            <TableRow key={q.code}>
                              <TableCell sx={{ fontWeight: 500 }}>{q.currency}</TableCell>
                              <TableCell>{q.code}</TableCell>
                              <TableCell>R$ {q.rate.toFixed(4)}</TableCell>
                              <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{q.lastUpdated}</TableCell>
                              <TableCell>
                                <Chip label="+0%" size="small" color="success" />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                      <ArrowLeftRight size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                      Conversor
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>De</InputLabel>
                          <Select label="De" defaultValue="USD">
                            <MenuItem value="USD">USD - Dólar</MenuItem>
                            <MenuItem value="EUR">EUR - Euro</MenuItem>
                            <MenuItem value="GBP">GBP - Libra</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Para</InputLabel>
                          <Select label="Para" defaultValue="BRL">
                            <MenuItem value="BRL">BRL - Real</MenuItem>
                            <MenuItem value="USD">USD - Dólar</MenuItem>
                            <MenuItem value="EUR">EUR - Euro</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <TextField
                      fullWidth
                      size="small"
                      label="Valor"
                      placeholder="0,00"
                      sx={{ mt: 2 }}
                    />
                    <Button variant="contained" fullWidth sx={{ mt: 2 }} startIcon={<TrendingUp size={16} />}>
                      Converter
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                      Histórico
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText primary="Hoje" secondary="4 atualizações" />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText primary="Ontem" secondary="4 atualizações" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}
