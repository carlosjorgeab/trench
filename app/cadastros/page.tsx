'use client'

import { useState } from 'react'
import { Sidebar } from '../components/sidebar'
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material'
import Link from 'next/link'
import { Building2, Users, FileText, DollarSign, TrendingUp, Settings, Plus } from 'lucide-react'

const cadastros = [
  { name: 'Empresas', href: '/cadastros/empresas', icon: Building2, description: 'Cadastro de empresas do grupo', color: 'primary' },
  { name: 'Clientes', href: '/cadastros/clientes', icon: Users, description: 'Cadastro de clientes', color: 'success' },
  { name: 'Fornecedores', href: '/cadastros/fornecedores', icon: Building2, description: 'Cadastro de fornecedores', color: 'secondary' },
  { name: 'Contas', href: '/cadastros/contas', icon: DollarSign, description: 'Contas bancárias e cartões', color: 'info' },
  { name: 'Categorias', href: '/cadastros/categorias', icon: FileText, description: 'Categorias do plano de contas', color: 'warning' },
  { name: 'Formas de Pagamento', href: '/cadastros/formas-pagamento', icon: DollarSign, description: 'Formas de pagamento', color: 'error' },
  { name: 'Centros de Custo', href: '/cadastros/centros-custos', icon: TrendingUp, description: 'Centros de custos', color: 'primary' },
  { name: 'Plano de Contas', href: '/cadastros/plano-contas', icon: FileText, description: 'Plano de contas contábeis', color: 'success' },
]

export default function CadastrosPage() {
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
              Cadastros
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Gerenciamento de dados mestres do sistema
            </Typography>
          </Box>
        </Box>

        <Box component="main" sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {cadastros.map((cadastro) => {
              const Icon = cadastro.icon
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cadastro.name}>
                  <Card
                    component={Link}
                    href={cadastro.href}
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: cadastro.color + '.light',
                            color: cadastro.color + '.main',
                          }}
                        >
                          <Icon size={24} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {cadastro.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cadastro.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}
