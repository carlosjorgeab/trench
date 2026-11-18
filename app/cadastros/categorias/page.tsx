'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '../../components/AppShell'
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { FileText, Plus, Edit, Trash2, Search } from 'lucide-react'

interface Item {
  id: number
  nome: string
  tipo: string
  plano_conta_id: number | null
  ativo: boolean
  created_at: string
}

export default function CategoriasPage() {
  const [items, setItems] = useState<Item[]>([])
  const [planoContas, setPlanoContas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
      nome: '',
      tipo: 'debito',
      plano_conta_id: null as number | null,
      ativo: true,
    })

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categorias')
      const data = await res.json()
      if (data.success) {
        setItems(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
    fetchPlanoContas()
  }, [])

  const fetchPlanoContas = async () => {
    try {
      const res = await fetch('/api/plano-contas')
      const data = await res.json()
      if (data.success) {
        setPlanoContas(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching plano-contas:', error)
    }
  }

  const handleCreate = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData } : formData
      
      const res = await fetch('/api/categorias', {
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
      tipo: 'debito',
      plano_conta_id: null,
      ativo: true,
    })
        fetchItems()
      }
    } catch (error) {
      console.error('Error saving categorias:', error)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setFormData({
      nome: item.nome || '',
      tipo: item.tipo || 'debito',
      plano_conta_id: item.plano_conta_id || null,
      ativo: item.ativo !== false,
    })
    setOpenDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar?')) {
      try {
        await fetch(`/api/categorias?id=${id}`, { method: 'DELETE' })
        fetchItems()
      } catch (error) {
        console.error('Error deleting categorias:', error)
      }
    }
  }

  return (
    <AppShell
      title="Categorias Financeiras"
      subtitle="Classificação gerencial de despesas fixas, variáveis e receitas"
      breadcrumbs={[{ label: 'Início', href: '/dashboard' }, { label: 'Cadastros', href: '/cadastros' }, { label: 'Categorias' }]}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingId(null)
            setFormData({
              nome: '',
              tipo: 'debito',
              plano_conta_id: null,
              ativo: true,
            })
            setOpenDialog(true)
          }}
        >
          Nova Categoria
        </Button>
      }
    >
      <Card elevation={0}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Categorias Cadastradas
            </Typography>
            <TextField
              size="small"
              placeholder="Buscar categoria..."
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
                      <TableCell>Tipo</TableCell>
                      <TableCell>Plano de Conta</TableCell>
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
                          <TableCell>{item.tipo === 'debito' ? 'Débito' : 'Crédito'}</TableCell>
                          <TableCell>{planoContas.find((pc) => pc.id === item.plano_conta_id)?.nome || '-'}</TableCell>
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
        <DialogTitle>{editingId ? 'Editar' : 'Novo'} Categoria</DialogTitle>
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
              <InputLabel>Tipo de Conta</InputLabel>
              <Select
                value={formData.tipo}
                label="Tipo de Conta"
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <MenuItem value="debito">Débito</MenuItem>
                <MenuItem value="credito">Crédito</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Plano de Conta (último nível)</InputLabel>
              <Select
                value={formData.plano_conta_id ?? ''}
                label="Plano de Conta (último nível)"
                onChange={(e) => setFormData({ ...formData, plano_conta_id: e.target.value ? Number(e.target.value) : null })}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {planoContas.map((pc) => (
                  <MenuItem key={pc.id} value={pc.id}>{pc.codigo} - {pc.nome} (Nível {pc.nivel})</MenuItem>
                ))}
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
      tipo: 'debito',
      plano_conta_id: null,
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
