'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '../../components/AppShell'
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react'

interface Item {
  id: number
    nome: string
  cnpj: string
  email: string
  ativo: boolean
  created_at: string
}

export default function ClientesPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
      nome: '',
      cnpj: '',
      email: '',
      ativo: true,
    })

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clientes')
      const data = await res.json()
      if (data.success) {
        setItems(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleCreate = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData } : formData
      
      const res = await fetch('/api/clientes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setOpenDialog(false)
        setEditingId(null)
        setFormData({
      nome: '',
      cnpj: '',
      email: '',
      ativo: true,
    })
        fetchItems()
      }
    } catch (error) {
      console.error('Error saving clientes:', error)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setFormData({
      nome: item.nome || '',
      cnpj: item.cnpj || '',
      email: item.email || '',
      ativo: item.ativo !== false,
    })
    setOpenDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar?')) {
      try {
        await fetch(`/api/clientes?id=${id}`, { method: 'DELETE' })
        fetchItems()
      } catch (error) {
        console.error('Error deleting clientes:', error)
      }
    }
  }

  return (
    <AppShell
      title="Clientes"
      subtitle="Carteira de clientes, CNPJ/CPF e dados de contato"
      breadcrumbs={[{ label: 'Início', href: '/dashboard' }, { label: 'Cadastros', href: '/cadastros' }, { label: 'Clientes' }]}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingId(null)
            setFormData({
              nome: '',
              cnpj: '',
              email: '',
              ativo: true,
            })
            setOpenDialog(true)
          }}
        >
          Novo Cliente
        </Button>
      }
    >
      <Card elevation={0}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Clientes Cadastrados
            </Typography>
            <TextField
              size="small"
              placeholder="Buscar cliente..."
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8, color: '#999' }} />,
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 620 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {loading ? 'Carregando...' : 'Nenhum registro cadastrado. Clique em "Novo" para criar.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell sx={{ fontWeight: 500 }}>{item.nome}</TableCell>
                          <TableCell>{item.cnpj || "-"}</TableCell>
                          <TableCell>{item.email || "-"}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.ativo !== false ? 'Ativo' : 'Inativo'}
                              size="small"
                              color={item.ativo !== false ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleEdit(item)}>
                              <Edit size={16} />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                              <Trash2 size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar' : 'Novo'} Cliente</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
            <TextField
              fullWidth
              size="small"
              label="CNPJ"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
              }
              label="Ativo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); setEditingId(null); setFormData({
      nome: '',
      cnpj: '',
      email: '',
      ativo: true,
    }); }} >Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>
            {editingId ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  )
}
