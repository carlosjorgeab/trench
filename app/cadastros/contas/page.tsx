'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppShell } from '../../components/AppShell'
import {
  Box, Card, CardContent, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Switch,
  FormControlLabel, FormControl, InputLabel, Select, MenuItem, Alert, Grid,
} from '@mui/material'
import { Plus, Edit, Trash2, Search, CreditCard, Landmark } from 'lucide-react'
import { useAppUser } from '../../lib/user-context'

interface Item {
  id: number
  nome: string
  tipo: string
  limite_cartao?: number | null
  dia_vencimento?: number | null
  dia_fechamento?: number | null
  limite_conta?: number | null
  taxa_juros_conta?: number | null
  data_vencimento_limite?: string | null
  ativo: boolean
  created_at: string
}

const emptyForm = {
  nome: '',
  tipo: 'bancaria',
  limite_cartao: '',
  dia_vencimento: '',
  dia_fechamento: '',
  limite_conta: '',
  taxa_juros_conta: '',
  data_vencimento_limite: '',
  ativo: true,
}

const isCartaoTipo = (tipo?: string) => tipo === 'cartao_credito' || tipo === 'cartao'

const formatTipoLabel = (tipo?: string) => {
  if (isCartaoTipo(tipo)) return 'Cartão de Crédito'
  if (tipo === 'bancaria' || tipo === 'banco') return 'Bancária'
  if (tipo === 'caixa') return 'Caixa'
  if (tipo === 'investimento') return 'Investimento'
  return tipo || 'Bancária'
}

const formatBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export default function ContasPage() {
  const { appUser } = useAppUser()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  const fetchItems = async () => {
    if (!appUser?.empresa_id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/contas?empresa_id=${appUser.empresa_id}`)
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
  }, [appUser?.empresa_id])

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items
    const q = searchTerm.toLowerCase()
    return items.filter(
      (i) => i.nome?.toLowerCase().includes(q) || formatTipoLabel(i.tipo).toLowerCase().includes(q)
    )
  }, [items, searchTerm])

  const handleCreate = async () => {
    setSaveError(null)
    if (!appUser?.empresa_id) {
      setSaveError('Usuário não vinculado a nenhuma empresa.')
      return
    }
    if (!formData.nome.trim()) {
      setSaveError('Informe o nome da conta.')
      return
    }
    const isCartao = isCartaoTipo(formData.tipo)
    if (isCartao) {
      const limite = parseFloat(formData.limite_cartao)
      if (isNaN(limite) || limite <= 0) {
        setSaveError('Informe um Limite do Cartão válido (maior que zero).')
        return
      }
      const diaVenc = parseInt(formData.dia_vencimento, 10)
      if (isNaN(diaVenc) || diaVenc < 1 || diaVenc > 31) {
        setSaveError('Informe o Dia de Vencimento da fatura (entre 1 e 31).')
        return
      }
      if (formData.dia_fechamento) {
        const diaFech = parseInt(formData.dia_fechamento, 10)
        if (isNaN(diaFech) || diaFech < 1 || diaFech > 31) {
          setSaveError('Dia de Fechamento deve estar entre 1 e 31.')
          return
        }
      }
    } else {
      if (formData.limite_conta && (isNaN(parseFloat(formData.limite_conta)) || parseFloat(formData.limite_conta) < 0)) {
        setSaveError('Limite da Conta Bancária inválido.')
        return
      }
      if (formData.taxa_juros_conta && (isNaN(parseFloat(formData.taxa_juros_conta)) || parseFloat(formData.taxa_juros_conta) < 0)) {
        setSaveError('Taxa de Juros da Conta Bancária inválida.')
        return
      }
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        empresa_id: appUser.empresa_id,
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        limite_cartao: isCartao && formData.limite_cartao ? parseFloat(formData.limite_cartao) : null,
        dia_vencimento: isCartao && formData.dia_vencimento ? parseInt(formData.dia_vencimento, 10) : null,
        dia_fechamento: isCartao && formData.dia_fechamento ? parseInt(formData.dia_fechamento, 10) : null,
        limite_conta: !isCartao && formData.limite_conta ? parseFloat(formData.limite_conta) : null,
        taxa_juros_conta: !isCartao && formData.taxa_juros_conta ? parseFloat(formData.taxa_juros_conta) : null,
        data_vencimento_limite: !isCartao && formData.data_vencimento_limite ? formData.data_vencimento_limite : null,
        ativo: formData.ativo,
      }

      const res = await fetch('/api/contas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setOpenDialog(false)
        setEditingId(null)
        setFormData(emptyForm)
        fetchItems()
      } else {
        setSaveError(data.error || 'Erro ao salvar conta')
      }
    } catch (error) {
      console.error('Error saving contas:', error)
      setSaveError('Erro de conexão ao salvar')
    }
  }

  const handleEdit = (item: Item) => {
    setSaveError(null)
    setEditingId(item.id)
    setFormData({
      nome: item.nome || '',
      tipo: isCartaoTipo(item.tipo) ? 'cartao_credito' : 'bancaria',
      limite_cartao: item.limite_cartao != null ? String(item.limite_cartao) : '',
      dia_vencimento: item.dia_vencimento != null ? String(item.dia_vencimento) : '',
      dia_fechamento: item.dia_fechamento != null ? String(item.dia_fechamento) : '',
      limite_conta: item.limite_conta != null ? String(item.limite_conta) : '',
      taxa_juros_conta: item.taxa_juros_conta != null ? String(item.taxa_juros_conta) : '',
      data_vencimento_limite: item.data_vencimento_limite ? item.data_vencimento_limite.split('T')[0] : '',
      ativo: item.ativo !== false,
    })
    setOpenDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta conta?')) {
      try {
        await fetch(`/api/contas?id=${id}`, { method: 'DELETE' })
        fetchItems()
      } catch (error) {
        console.error('Error deleting contas:', error)
      }
    }
  }

  const showCartaoFields = isCartaoTipo(formData.tipo)

  return (
    <AppShell
      title="Contas Financeiras"
      subtitle="Contas bancárias e cartões de crédito corporativos com controle de limites, juros e vencimentos"
      breadcrumbs={[{ label: 'Início', href: '/dashboard' }, { label: 'Cadastros', href: '/cadastros' }, { label: 'Contas' }]}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingId(null)
            setSaveError(null)
            setFormData(emptyForm)
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8, color: '#999' }} />,
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Tipo de Conta</TableCell>
                  <TableCell>Limite</TableCell>
                  <TableCell>Taxa de Juros</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {loading ? 'Carregando...' : 'Nenhum registro cadastrado. Clique em "Nova Conta" para criar.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const isCartao = isCartaoTipo(item.tipo)
                    return (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontWeight: 500 }}>{item.nome}</TableCell>
                        <TableCell>
                          <Chip
                            icon={isCartao ? <CreditCard size={14} /> : <Landmark size={14} />}
                            label={formatTipoLabel(item.tipo)}
                            size="small"
                            color={isCartao ? 'secondary' : 'primary'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {isCartao
                            ? (item.limite_cartao != null ? formatBRL(item.limite_cartao) : '—')
                            : (item.limite_conta != null ? formatBRL(item.limite_conta) : '—')}
                        </TableCell>
                        <TableCell>
                          {!isCartao && item.taxa_juros_conta != null
                            ? `${Number(item.taxa_juros_conta).toFixed(2)}% a.m.`
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {isCartao
                            ? (item.dia_vencimento != null
                                ? `Dia ${String(item.dia_vencimento).padStart(2, '0')}${item.dia_fechamento ? ` (Fecha dia ${String(item.dia_fechamento).padStart(2, '0')})` : ''}`
                                : '—')
                            : (item.data_vencimento_limite
                                ? new Date(`${item.data_vencimento_limite.split('T')[0]}T12:00:00`).toLocaleDateString('pt-BR')
                                : '—')}
                        </TableCell>
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
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar' : 'Nova'} Conta</DialogTitle>
        <DialogContent>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }} onClose={() => setSaveError(null)}>
              {saveError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Nome da Conta"
              placeholder={showCartaoFields ? 'Ex: Cartão Itaú Corporativo' : 'Ex: Banco do Brasil - CC 1234-5'}
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
                <MenuItem value="bancaria">Bancária</MenuItem>
                <MenuItem value="cartao_credito">Cartão de Crédito</MenuItem>
              </Select>
            </FormControl>

            {showCartaoFields ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Limite do Cartão (R$)"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    value={formData.limite_cartao}
                    onChange={(e) => setFormData({ ...formData, limite_cartao: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Dia de Vencimento (1 a 31)"
                    type="number"
                    inputProps={{ min: 1, max: 31 }}
                    value={formData.dia_vencimento}
                    onChange={(e) => setFormData({ ...formData, dia_vencimento: e.target.value })}
                    required
                    helperText="Dia do vencimento mensal da fatura"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Dia de Fechamento (opcional)"
                    type="number"
                    inputProps={{ min: 1, max: 31 }}
                    value={formData.dia_fechamento}
                    onChange={(e) => setFormData({ ...formData, dia_fechamento: e.target.value })}
                    helperText="Dia de corte para próxima fatura"
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Limite da Conta Bancária (R$)"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    value={formData.limite_conta}
                    onChange={(e) => setFormData({ ...formData, limite_conta: e.target.value })}
                    helperText="Cheque especial / limite rotativo"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Taxa de Juros (% a.m.)"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    value={formData.taxa_juros_conta}
                    onChange={(e) => setFormData({ ...formData, taxa_juros_conta: e.target.value })}
                    helperText="Juros mensal sobre uso do limite"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Data de Vencimento do Limite"
                    type="date"
                    value={formData.data_vencimento_limite}
                    onChange={(e) => setFormData({ ...formData, data_vencimento_limite: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    helperText="Data de validade/renovação do limite bancário"
                  />
                </Grid>
              </Grid>
            )}

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
          <Button
            onClick={() => {
              setOpenDialog(false)
              setEditingId(null)
              setSaveError(null)
              setFormData(emptyForm)
            }}
          >
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCreate}>
            {editingId ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  )
}
