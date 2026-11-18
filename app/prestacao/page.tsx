'use client'

import { useState } from 'react'
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
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { FileText, AlertTriangle, CheckCircle, Clock, Download, Filter } from 'lucide-react'

export default function PrestacaoPage() {
  const [filterStatus, setFilterStatus] = useState('todos')

  return (
    <AppShell
      title="Prestação de Contas"
      subtitle="Relatórios consolidados, conciliação e auditoria fiscal"
      breadcrumbs={[{ label: 'Início', href: '/dashboard' }, { label: 'Prestação de Contas' }]}
      actions={
        <Button variant="contained" size="small" startIcon={<Download size={16} />}>
          Exportar Relatório
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Grid container spacing={2}>
          {[
            { label: 'Pendentes', value: '8', icon: <Clock size={24} />, color: 'warning' },
            { label: 'Vencidas', value: '2', icon: <AlertTriangle size={24} />, color: 'error' },
            { label: 'Reconciliadas', value: '45', icon: <CheckCircle size={24} />, color: 'success' },
            { label: 'Total', value: '55', icon: <FileText size={24} />, color: 'primary' },
          ].map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Contas para Prestação
                  </Typography>
                  <Button variant="outlined" size="small" startIcon={<Filter size={16} />}>
                    Filtrar
                  </Button>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Empresa</TableCell>
                        <TableCell>Conta</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Vencimento</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            Nenhuma pendência crítica de prestação encontrada para o período atual.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Resumo do Período
                </Typography>
                <List disablePadding>
                  <ListItem disableGutters sx={{ py: 1.25 }}>
                    <ListItemText primary="Total a Pagar" />
                    <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 600 }}>
                      R$ 34.120,00
                    </Typography>
                  </ListItem>
                  <Divider />
                  <ListItem disableGutters sx={{ py: 1.25 }}>
                    <ListItemText primary="Total a Receber" />
                    <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 600 }}>
                      R$ 112.500,00
                    </Typography>
                  </ListItem>
                  <Divider />
                  <ListItem disableGutters sx={{ py: 1.25 }}>
                    <ListItemText primary="Superávit Projetado" />
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      R$ 78.380,00
                    </Typography>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AppShell>
  )
}
