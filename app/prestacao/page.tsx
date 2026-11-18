'use client'

import { useState } from 'react'
import { Sidebar } from '../components/sidebar'
import { Box, Grid, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, List, ListItem, ListItemText, Divider } from '@mui/material'
import { FileText, AlertTriangle, CheckCircle, Clock, Download, Filter } from 'lucide-react'

export default function PrestacaoPage() {
  const [filterStatus, setFilterStatus] = useState('todos')

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ ml: { xs: 0, md: '280px' } }}>
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
            Prestação de Contas
          </Typography>
          <Button variant="contained" startIcon={<Download size={16} />}>
            Exportar Relatório
          </Button>
        </Box>

        <Box component="main" sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Pendentes', value: '0', icon: <Clock size={24} />, color: 'warning' },
              { label: 'Vencidas', value: '0', icon: <AlertTriangle size={24} />, color: 'error' },
              { label: 'Reconciliadas', value: '0', icon: <CheckCircle size={24} />, color: 'success' },
              { label: 'Total', value: '0', icon: <FileText size={24} />, color: 'primary' },
            ].map((stat) => (
              <Grid item xs={6} sm={3} key={stat.label}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Contas para Prestação
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<Filter size={16} />}>
                      Filtrar
                    </Button>
                  </Box>
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Empresa</TableCell>
                          <TableCell>Conta</TableCell>
                          <TableCell>Valor</TableCell>
                          <TableCell>Vencimento</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">
                              Nenhuma conta encontrada.
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
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Resumo do Período
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Total a Pagar" />
                      <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 600 }}>
                        R$ 0,00
                      </Typography>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Total a Receber" />
                      <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 600 }}>
                        R$ 0,00
                      </Typography>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Saldo Líquido" />
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        R$ 0,00
                      </Typography>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}
