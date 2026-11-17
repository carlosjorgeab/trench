'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '../../components/sidebar'
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { FileText, Plus, Edit, Trash2, Search } from 'lucide-react'

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
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
      parent_id: null as number | null,
      nivel: 1,
      codigo: '',
      nome: '',
      tipo: '',
      ativo: true,
    })

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plano-contas')
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
  }, [])

  const handleCreate = async () => {
    if (!/^[a-zA-Z0-9]{10,}$/.test(formData.codigo)) {
      alert('Código deve ter pelo menos 10 caracteres alfanuméricos')
      return
    }
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData } : formData
      
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
      }
    } catch (error) {
      console.error('Error saving plano-contas:', error)
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
    <>
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
              Plano de Contas
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Plano de contas contábeis
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => {
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
          }}>
            Novo Plano de Conta
          </Button>
        </Box>

        <Box component="main" sx={{ p: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Plano de Contas Cadastrados
                </Typography>
                <TextField
                  size="small"
                  placeholder="Buscar..."
                  InputProps={{
                    startAdornment: <Search size={18} style={{ marginRight: 8, color: '#999' }} />,
                  }}
                  sx={{ width: 250 }}
                />
              </Box>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {loading ? 'Carregando...' : 'Nenhum registro cadastrado. Clique em "Novo" para criar.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
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
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar' : 'Novo'} Plano de Conta</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
    </Box>
    </>
  )
}
