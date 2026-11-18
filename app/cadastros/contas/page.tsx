'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '../../components/AppShell'
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { DollarSign, Plus, Edit, Trash2, Search } from 'lucide-react'

interface Item {
  id: number
    nome: string
  tipo: string
  ativo: boolean
  created_at: string
}

export default function ContasPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
      nome: '',
      tipo: '',
      ativo: true,
    })

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contas')
      const data = await res.json()
      if (data.success) {
        setItems(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching contas:', error)
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
      
      const res = await fetch('/api/contas', {
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
      tipo: '',
      ativo: true,
    })
        fetchItems()
      }
    } catch (error) {
      console.error('Error saving contas:', error)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setFormData({
      nome: item.nome || '',
      tipo: item.tipo || '',
      ativo: item.ativo !== false,
    })
    setOpenDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar?')) {
      try {
        await fetch(`/api/contas?id=${id}`, { method: 'DELETE' })
        fetchItems()
      } catch (error) {
        console.error('Error deleting contas:', error)
      }
    }
  }

  return (
    <AppShell
      title="Contas Bancárias"
      subtitle="Contas correntes, aplicações bancárias, caixas e cartões corporativos"
      breadcrumbs={[{ label: 'Início', href: '/dashboard' }, { label: 'Cadastros', href: '/cadastros' }, { label: 'Contas' }]}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingId(null)
            setFormData({
              nome: '',
              tipo: '',
              ativo: true,
            })
            setOpenDialog(true)
          }}
        >
          Nova Conta
        </Button>
      }
    >
      <Card elevation={0}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Contas Cadastradas
            </Typography>
            <TextField
              size="small"
              placeholder="Buscar conta..."
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8, color: '#999' }} />,
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 540 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {loading ? 'Carregando...' : 'Nenhum registro cadastrado. Clique em "Novo" para criar.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell sx={{ fontWeight: 500 }}>{item.nome}</TableCell>
                          <TableCell>{item.tipo || "-"}</TableCell>
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
        <DialogTitle>{editingId ? 'Editar' : 'Novo'} Conta</DialogTitle>
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
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.tipo}
                label="Tipo"
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <MenuItem value="banco">Banco</MenuItem>
                <MenuItem value="cartao">Cartão de Crédito</MenuItem>
                <MenuItem value="caixa">Caixa</MenuItem>
                <MenuItem value="investimento">Investimento</MenuItem>
              </Select>
            </FormControl>
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
      tipo: '',
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
