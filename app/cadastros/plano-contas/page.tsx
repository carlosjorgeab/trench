'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '../../components/AppShell'
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material'
import { FileText, Plus, Edit, Trash2, Search } from 'lucide-react'
import { useAppUser } from '../../lib/user-context'

interface Item {
  id: number
  parent_id: number | null
  nivel: number
  codigo: string
  nome: string
  tipo: string
  ativo: boolean
  created_at: string
}

export default function PlanodeContasPage() {
  const { appUser } = useAppUser()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
      parent_id: null as number | null,
      nivel: 1,
      codigo: '',
      nome: '',
      tipo: '',
      ativo: true,
    })

  const fetchItems = async () => {
    if (!appUser?.empresa_id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/plano-contas?empresa_id=${appUser.empresa_id}`)
      const data = await res.json()
      if (data.success) {
        setItems(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching plano-contas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [appUser?.empresa_id])

  const handleCreate = async () => {
    setSaveError(null)
    if (!/^[a-zA-Z0-9]{10,}$/.test(formData.codigo)) {
      setSaveError('Código deve ter pelo menos 10 caracteres alfanuméricos')
      return
    }
    if (!appUser?.empresa_id) {
      setSaveError('Usuário não vinculado a nenhuma empresa.')
      return
    }
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData, empresa_id: appUser.empresa_id } : { ...formData, empresa_id: appUser.empresa_id }
      
      const res = await fetch('/api/plano-contas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setOpenDialog(false)
        setEditingId(null)
        setFormData({
      parent_id: null,
      nivel: 1,
      codigo: '',
      nome: '',
      tipo: '',
      ativo: true,
    })
        fetchItems()
      } else {
        setSaveError(data.error || 'Erro ao salvar plano de contas')
      }
    } catch (error) {
      console.error('Error saving plano-contas:', error)
      setSaveError('Erro de conexão ao salvar')
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setFormData({
      parent_id: item.parent_id || null,
      nivel: item.nivel || 1,
      codigo: item.codigo || '',
      nome: item.nome || '',
      tipo: item.tipo || '',
      ativo: item.ativo !== false,
    })
    setOpenDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar?')) {
      try {
        await fetch(`/api/plano-contas?id=${id}`, { method: 'DELETE' })
        fetchItems()
      } catch (error) {
        console.error('Error deleting plano-contas:', error)
      }
    }
  }

  return (
    <AppShell
      title="Plano de Contas"
      subtitle="Estrutura hierárquica contábil de contas analíticas e sintéticas"
      breadcrumbs={[{ label: 'Início', href: '/dashboard' }, { label: 'Cadastros', href: '/cadastros' }, { label: 'Plano de Contas' }]}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingId(null)
            setFormData({
              parent_id: null,
              nivel: 1,
              codigo: '',
              nome: '',
              tipo: '',
              ativo: true,
            })
            setOpenDialog(true)
          }}
        >
          Novo Plano de Conta
        </Button>
      }
    >
      <Card elevation={0}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Plano de Contas Cadastrados
            </Typography>
            <TextField
              size="small"
              placeholder="Buscar conta contábil..."
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8, color: '#999' }} />,
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Nível</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {loading ? 'Carregando...' : 'Nenhum registro cadastrado. Clique em "Novo" para criar.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.codigo}</TableCell>
                          <TableCell>{item.nome}</TableCell>
                          <TableCell>{item.nivel}</TableCell>
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
        <DialogTitle>{editingId ? 'Editar' : 'Novo'} Plano de Conta</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Código (min. 10 caracteres alfanuméricos)"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Conta Pai</InputLabel>
              <Select
                value={formData.parent_id ?? ''}
                label="Conta Pai"
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
              >
                <MenuItem value="">Nenhuma (nível 1)</MenuItem>
                {items.map((it) => (
                  <MenuItem key={it.id} value={it.id}>{it.codigo} - {it.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Nível"
              type="number"
              value={formData.nivel}
              onChange={(e) => setFormData({ ...formData, nivel: Number(e.target.value) || 1 })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.tipo}
                label="Tipo"
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="passivo">Passivo</MenuItem>
                <MenuItem value="receita">Receita</MenuItem>
                <MenuItem value="despesa">Despesa</MenuItem>
                <MenuItem value="patrimonio">Patrimônio Líquido</MenuItem>
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
      parent_id: null,
      nivel: 1,
      codigo: '',
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
