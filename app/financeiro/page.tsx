'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '../components/AppShell'
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Autocomplete } from '@mui/material'
import { DollarSign, Search, Filter, Plus, Download, X, Paperclip } from 'lucide-react'
import FileUpload from '../components/FileUpload'

interface Lancamento {
  id: number
  empresa_id: number
  tipo: string
  conta_id: number | null
  categoria_id: number | null
  forma_pagamento_id: number | null
  centro_custo_id: number | null
  cliente_id: number | null
  descricao: string
  observacao: string
  valor_principal: number
  juros: number
  acrecimos: number
  data_lancamento: string
  data_vencimento: string
  data_pagamento: string | null
  status: string
  anexos: string[]
  created_at: string
}

interface Option {
  id: number
  nome: string
}

export default function FinanceiroPage() {
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  // Options for selects
  const [empresas, setEmpresas] = useState<Option[]>([])
  const [contas, setContas] = useState<Option[]>([])
  const [categorias, setCategorias] = useState<Option[]>([])
  const [formasPagamento, setFormasPagamento] = useState<Option[]>([])
  const [centrosCusto, setCentrosCusto] = useState<Option[]>([])
  const [clientes, setClientes] = useState<Option[]>([])
  const [fornecedores, setFornecedores] = useState<Option[]>([])

  const [formData, setFormData] = useState({
    tipo: 'debito',
    conta_id: '',
    categoria_id: '',
    forma_pagamento_id: '',
    centro_custo_id: '',
    cliente_id: '',
    descricao: '',
    observacao: '',
    valor_principal: '',
    juros: '0',
    acrecimos: '0',
    data_lancamento: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    data_pagamento: '',
    status: 'pendente',
  })

  const fetchOptions = async () => {
    const endpoints = ['empresas', 'contas', 'categorias', 'formas-pagamento', 'centros-custos', 'clientes', 'fornecedores']
    const setters = [setEmpresas, setContas, setCategorias, setFormasPagamento, setCentrosCusto, setClientes, setFornecedores]
    
    for (let i = 0; i < endpoints.length; i++) {
      try {
        const res = await fetch(`/api/${endpoints[i]}`)
        const data = await res.json()
        if (data.success) {
          setters[i](data.data || [])
        }
      } catch (error) {
        console.error(`Error fetching ${endpoints[i]}:`, error)
      }
    }
  }

  const fetchLancamentos = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/lancamentos')
      const data = await res.json()
      if (data.success) {
        setLancamentos(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching lancamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptions()
    fetchLancamentos()
  }, [])

  const handleCreate = async () => {
    try {
      const body = {
        empresa_id: 1,
        tipo: formData.tipo,
        conta_id: formData.conta_id ? parseInt(formData.conta_id) : null,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        forma_pagamento_id: formData.forma_pagamento_id ? parseInt(formData.forma_pagamento_id) : null,
        centro_custo_id: formData.centro_custo_id ? parseInt(formData.centro_custo_id) : null,
        cliente_id: formData.cliente_id ? parseInt(formData.cliente_id) : null,
        descricao: formData.descricao,
        observacao: formData.observacao,
        valor_principal: parseFloat(formData.valor_principal),
        juros: parseFloat(formData.juros) || 0,
        acrecimos: parseFloat(formData.acrecimos) || 0,
        data_lancamento: formData.data_lancamento,
        data_vencimento: formData.data_vencimento,
        data_pagamento: formData.data_pagamento || null,
        status: formData.status,
        anexos: uploadedUrls,
      }

      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/lancamentos` : '/api/lancamentos'
      const payload = editingId ? { id: editingId, ...body } : body

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setOpenDialog(false)
        setEditingId(null)
        resetForm()
        fetchLancamentos()
      }
    } catch (error) {
      console.error('Error saving lancamento:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      tipo: 'debito',
      conta_id: '',
      categoria_id: '',
      forma_pagamento_id: '',
      centro_custo_id: '',
      cliente_id: '',
      descricao: '',
      observacao: '',
      valor_principal: '',
      juros: '0',
      acrecimos: '0',
      data_lancamento: new Date().toISOString().split('T')[0],
      data_vencimento: new Date().toISOString().split('T')[0],
      data_pagamento: '',
      status: 'pendente',
    })
  }

  const handleEdit = (lanc: Lancamento) => {
    setEditingId(lanc.id)
    setFormData({
      tipo: lanc.tipo,
      conta_id: lanc.conta_id?.toString() || '',
      categoria_id: lanc.categoria_id?.toString() || '',
      forma_pagamento_id: lanc.forma_pagamento_id?.toString() || '',
      centro_custo_id: lanc.centro_custo_id?.toString() || '',
      cliente_id: lanc.cliente_id?.toString() || '',
      descricao: lanc.descricao,
      observacao: lanc.observacao || '',
      valor_principal: lanc.valor_principal?.toString() || '',
      juros: lanc.juros?.toString() || '0',
      acrecimos: lanc.acrecimos?.toString() || '0',
      data_lancamento: lanc.data_lancamento?.split('T')[0] || '',
      data_vencimento: lanc.data_vencimento?.split('T')[0] || '',
      data_pagamento: lanc.data_pagamento?.split('T')[0] || '',
      status: lanc.status,
    })
    setOpenDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar este lançamento?')) {
      try {
        await fetch(`/api/lancamentos?id=${id}`, { method: 'DELETE' })
        fetchLancamentos()
      } catch (error) {
        console.error('Error deleting lancamento:', error)
      }
    }
  }

  const totalReceitas = lancamentos
    .filter(l => l.tipo === 'credito')
    .reduce((sum, l) => sum + (l.valor_principal || 0), 0)
  const totalDespesas = lancamentos
    .filter(l => l.tipo === 'debito')
    .reduce((sum, l) => sum + (l.valor_principal || 0), 0)
  const saldo = totalReceitas - totalDespesas

  const stats = [
    { label: 'Total Lançamentos', value: lancamentos.length.toString(), color: 'primary' },
    { label: 'A Receber', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceitas), color: 'success' },
    { label: 'A Pagar', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas), color: 'error' },
    { label: 'Saldo', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo), color: 'info' },
  ]

  const filteredLancamentos = lancamentos.filter((l) => {
    if (filterStatus !== 'todos' && l.status !== filterStatus) return false
    if (filterTipo !== 'todos' && l.tipo !== filterTipo) return false
    return true
  })

  return (
    <AppShell
      title="Sistema Financeiro"
      subtitle="Controle de lançamentos, receitas, despesas e conciliação"
      breadcrumbs={[{ label: 'Início', href: '/dashboard' }, { label: 'Financeiro' }]}
      actions={
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingId(null)
            resetForm()
            setOpenDialog(true)
          }}
        >
          Novo Lançamento
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Grid container spacing={2}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500, mt: 1, color: stat.color + '.main' }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Filtros
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      <MenuItem value="pendente">Pendente</MenuItem>
                      <MenuItem value="pago">Pago</MenuItem>
                      <MenuItem value="vencido">Vencido</MenuItem>
                      <MenuItem value="cancelado">Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={filterTipo}
                      label="Tipo"
                      onChange={(e) => setFilterTipo(e.target.value)}
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      <MenuItem value="debito">Débito</MenuItem>
                      <MenuItem value="credito">Crédito</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Busca"
                    placeholder="Descrição..."
                    InputProps={{
                      startAdornment: <Search size={18} style={{ marginRight: 8, color: '#999' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button variant="outlined" fullWidth startIcon={<Filter size={16} />}>
                    Filtrar
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Lançamentos
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Valor Principal</TableCell>
                      <TableCell>Juros</TableCell>
                      <TableCell>Acréscimos</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLancamentos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {loading ? 'Carregando...' : 'Nenhum lançamento encontrado. Clique em "Novo Lançamento" para criar.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLancamentos.map((lanc) => {
                        const total = (lanc.valor_principal || 0) + (lanc.juros || 0) + (lanc.acrecimos || 0)
                        return (
                          <TableRow key={lanc.id}>
                            <TableCell>{new Date(lanc.data_lancamento).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>
                              <Chip
                                label={lanc.tipo === 'debito' ? 'Débito' : 'Crédito'}
                                size="small"
                                color={lanc.tipo === 'debito' ? 'error' : 'success'}
                              />
                            </TableCell>
                            <TableCell>{lanc.descricao}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lanc.valor_principal)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lanc.juros || 0)}
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lanc.acrecimos || 0)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: lanc.tipo === 'debito' ? 'error.main' : 'success.main' }}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={lanc.status}
                                size="small"
                                color={lanc.status === 'pago' ? 'success' : lanc.status === 'vencido' ? 'error' : lanc.status === 'cancelado' ? 'default' : 'warning'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Button size="small" variant="text" onClick={() => handleEdit(lanc)}>Editar</Button>
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
        </Box>

      {/* Dialog for new/edit lancamento */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={formData.tipo}
                    label="Tipo"
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <MenuItem value="debito">Débito</MenuItem>
                    <MenuItem value="credito">Crédito</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Descrição da Conta"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Conta</InputLabel>
                  <Select
                    value={formData.conta_id}
                    label="Conta"
                    onChange={(e) => setFormData({ ...formData, conta_id: e.target.value })}
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {contas.map((c) => (
                      <MenuItem key={c.id} value={c.id.toString()}>{c.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={formData.categoria_id}
                    label="Categoria"
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {categorias.map((c) => (
                      <MenuItem key={c.id} value={c.id.toString()}>{c.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Forma de Pagamento</InputLabel>
                  <Select
                    value={formData.forma_pagamento_id}
                    label="Forma de Pagamento"
                    onChange={(e) => setFormData({ ...formData, forma_pagamento_id: e.target.value })}
                  >
                    <MenuItem value="">Nenhuma</MenuItem>
                    {formasPagamento.map((f) => (
                      <MenuItem key={f.id} value={f.id.toString()}>{f.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Centro de Custo</InputLabel>
                  <Select
                    value={formData.centro_custo_id}
                    label="Centro de Custo"
                    onChange={(e) => setFormData({ ...formData, centro_custo_id: e.target.value })}
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {centrosCusto.map((c) => (
                      <MenuItem key={c.id} value={c.id.toString()}>{c.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cliente/Fornecedor</InputLabel>
                  <Select
                    value={formData.cliente_id}
                    label="Cliente/Fornecedor"
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {clientes.map((c) => (
                      <MenuItem key={c.id} value={c.id.toString()}>{c.nome} (Cliente)</MenuItem>
                    ))}
                    {fornecedores.map((f) => (
                      <MenuItem key={f.id} value={f.id.toString()}>{f.nome} (Fornecedor)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="pendente">Pendente</MenuItem>
                    <MenuItem value="pago">Pago</MenuItem>
                    <MenuItem value="vencido">Vencido</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Valor Principal"
                  type="number"
                  value={formData.valor_principal}
                  onChange={(e) => setFormData({ ...formData, valor_principal: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Juros"
                  type="number"
                  value={formData.juros}
                  onChange={(e) => setFormData({ ...formData, juros: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Acréscimos"
                  type="number"
                  value={formData.acrecimos}
                  onChange={(e) => setFormData({ ...formData, acrecimos: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data de Lançamento"
                  type="date"
                  value={formData.data_lancamento}
                  onChange={(e) => setFormData({ ...formData, data_lancamento: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data de Vencimento"
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data de Pagamento"
                  type="date"
                  value={formData.data_pagamento}
                  onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Observação"
                  multiline
                  rows={3}
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            Anexos
          </Typography>
          <FileUpload
            files={uploadedFiles}
            onFilesChange={setUploadedFiles}
            uploadedUrls={uploadedUrls}
            onUploadedUrlsChange={setUploadedUrls}
          />
        </Box>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); setEditingId(null); resetForm() }}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>
            {editingId ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  )
}
