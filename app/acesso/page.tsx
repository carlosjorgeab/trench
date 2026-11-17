'use client'

import { useState } from 'react'
import { Sidebar } from '../components/sidebar'
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import { Building2, Users, Shield, Plus } from 'lucide-react'

export default function AcessoPage() {
  const [companies] = useState([
    { id: '1', name: 'Empresa A' },
    { id: '2', name: 'Empresa B' },
  ])

  const modules = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'financeiro', name: 'Financeiro' },
    { id: 'prestacao', name: 'Prestação de Contas' },
    { id: 'cotacao', name: 'Cotação de Moedas' },
    { id: 'cadastros', name: 'Cadastros' },
    { id: 'configuracao', name: 'Configurações' },
  ]

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
              Gestão de Acesso
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Multi-Empresa e permissões por módulo
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Plus size={16} />}>
            Novo Usuário
          </Button>
        </Box>

        <Box component="main" sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Usuários Cadastrados
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Empresas</TableCell>
                          <TableCell>Permissões</TableCell>
                          <TableCell>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">
                              Nenhum usuário encontrado.
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
                    Cadastro de Usuário
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField fullWidth size="small" label="Nome Completo" placeholder="Nome do usuário" />
                    <TextField fullWidth size="small" label="Email" type="email" placeholder="usuario@email.com" />
                    <TextField fullWidth size="small" label="Senha" type="password" placeholder="••••••••" />

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Empresas com Acesso
                      </Typography>
                      <FormGroup>
                        {companies.map((company) => (
                          <FormControlLabel
                            key={company.id}
                            control={<Checkbox defaultChecked />}
                            label={company.name}
                          />
                        ))}
                      </FormGroup>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Permissões por Módulo
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {modules.map((module) => (
                          <Box key={module.id} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                              {module.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <FormControlLabel
                                control={<Checkbox defaultChecked size="small" />}
                                label={<Typography variant="caption">Criar</Typography>}
                              />
                              <FormControlLabel
                                control={<Checkbox defaultChecked size="small" />}
                                label={<Typography variant="caption">Editar</Typography>}
                              />
                              <FormControlLabel
                                control={<Checkbox size="small" />}
                                label={<Typography variant="caption">Deletar</Typography>}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <Button variant="contained" fullWidth startIcon={<Plus size={16} />}>
                      Salvar Usuário
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}
