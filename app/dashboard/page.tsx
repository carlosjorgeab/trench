'use client'

import { useState } from 'react'
import { Sidebar } from '../components/sidebar'
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar, Divider, List, ListItem, ListItemText, ListItemAvatar, IconButton } from '@mui/material'
import { DollarSign, TrendingUp, AlertTriangle, FileText, ArrowUpRight, ArrowDownRight, Settings, Plus, Bell, Search } from 'lucide-react'

interface DashboardData {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  contasPendentes: number
  contasVencidas: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    contasPendentes: 0,
    contasVencidas: 0,
  })

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ ml: { lg: '288px' } }}>
        {/* Top App Bar */}
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
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton>
              <Search size={20} />
            </IconButton>
            <IconButton>
              <Bell size={20} />
            </IconButton>
            <Button variant="contained" startIcon={<Plus size={16} />}>
              Novo
            </Button>
          </Box>
        </Box>

        <Box component="main" sx={{ p: 3 }}>
          {/* Stats Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Total Receitas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 500, mt: 1 }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalReceitas)}
                      </Typography>
                      <Chip
                        label="+12.5%"
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                      <ArrowUpRight size={24} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Total Despesas
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 500, mt: 1 }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalDespesas)}
                      </Typography>
                      <Chip
                        label="-3.2%"
                        size="small"
                        color="error"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Avatar sx={{ bgcolor: 'error.light', color: 'error.main' }}>
                      <ArrowDownRight size={24} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Saldo Atual
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 500, mt: 1 }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.saldo)}
                      </Typography>
                      <Chip
                        label="+8.1%"
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                      <DollarSign size={24} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Contas Pendentes
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 500, mt: 1 }}>
                        {data.contasPendentes}
                      </Typography>
                      <Chip
                        label="Aguardando pagamento"
                        size="small"
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main' }}>
                      <AlertTriangle size={24} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content Grid */}
          <Grid container spacing={3}>
            {/* Left Column - 2/3 */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                      Resumo Financeiro
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                            <ArrowUpRight size={20} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Receitas do Mês"
                          secondary={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalReceitas)}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.light', color: 'error.main' }}>
                            <ArrowDownRight size={20} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Despesas do Mês"
                          secondary={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalDespesas)}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                            <DollarSign size={20} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Saldo Líquido"
                          secondary={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.saldo)}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                      Últimos Lançamentos
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                            <DollarSign size={20} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Salário"
                          secondary="01/11/2026"
                        />
                        <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 600 }}>
                          +R$ 5.000,00
                        </Typography>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.light', color: 'error.main' }}>
                            <DollarSign size={20} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Aluguel"
                          secondary="05/11/2026"
                        />
                        <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 600 }}>
                          -R$ 1.500,00
                        </Typography>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                            <DollarSign size={20} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Venda de Produto"
                          secondary="10/11/2026"
                        />
                        <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 600 }}>
                          +R$ 2.300,00
                        </Typography>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            {/* Right Column - 1/3 */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                      Ações Rápidas
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                        >
                          <DollarSign size={24} />
                          <Typography variant="caption">Novo Lançamento</Typography>
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                        >
                          <TrendingUp size={24} />
                          <Typography variant="caption">Cotação</Typography>
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                        >
                          <FileText size={24} />
                          <Typography variant="caption">Prestação</Typography>
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                        >
                          <Settings size={24} />
                          <Typography variant="caption">Configurações</Typography>
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                      Contas Pendentes
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Fornecedor A"
                          secondary="Vence em 3 dias"
                        />
                        <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 600 }}>
                          R$ 850,00
                        </Typography>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary="Fornecedor B"
                          secondary="Vence em 5 dias"
                        />
                        <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 600 }}>
                          R$ 1.200,00
                        </Typography>
                      </ListItem>
                    </List>
                    <Button fullWidth sx={{ mt: 1 }}>
                      Ver todas as contas
                    </Button>
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
