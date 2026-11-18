'use client'

import { useState } from 'react'
import { AppShell } from '../components/AppShell'
import Link from 'next/link'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material'
import {
  Building2,
  Users,
  Wallet,
  Tags,
  CreditCard,
  PieChart,
  BookOpen,
  Plus,
  Search,
  ArrowRight,
  Database,
  Building,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { useThemeConfig } from '../lib/theme-config-context'

interface CadastroEntity {
  id: string
  name: string
  href: string
  icon: any
  description: string
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
  count: number
  category: 'Entidades' | 'Financeiro' | 'Contábil'
}

const cadastrosList: CadastroEntity[] = [
  {
    id: 'clientes',
    name: 'Clientes',
    href: '/cadastros/clientes',
    icon: Users,
    description: 'Gestão da carteira de clientes, dados cadastrais, CNPJ/CPF e contatos',
    color: 'primary',
    count: 42,
    category: 'Entidades',
  },
  {
    id: 'fornecedores',
    name: 'Fornecedores',
    href: '/cadastros/fornecedores',
    icon: Building2,
    description: 'Cadastro de fornecedores de produtos e prestadores de serviços',
    color: 'secondary',
    count: 28,
    category: 'Entidades',
  },
  {
    id: 'contas',
    name: 'Contas Bancárias & Caixas',
    href: '/cadastros/contas',
    icon: Wallet,
    description: 'Contas correntes, aplicações bancárias, caixas e cartões corporativos',
    color: 'success',
    count: 8,
    category: 'Financeiro',
  },
  {
    id: 'formas-pagamento',
    name: 'Formas de Pagamento',
    href: '/cadastros/formas-pagamento',
    icon: CreditCard,
    description: 'PIX, Boletos bancários, TED, Cartão de Crédito e transferências',
    color: 'info',
    count: 6,
    category: 'Financeiro',
  },
  {
    id: 'categorias',
    name: 'Categorias Financeiras',
    href: '/cadastros/categorias',
    icon: Tags,
    description: 'Classificação gerencial de despesas fixas, variáveis e receitas',
    color: 'warning',
    count: 19,
    category: 'Contábil',
  },
  {
    id: 'centros-custos',
    name: 'Centros de Custos',
    href: '/cadastros/centros-custos',
    icon: PieChart,
    description: 'Departamentos, unidades de negócio, projetos e centros de resultado',
    color: 'primary',
    count: 12,
    category: 'Financeiro',
  },
  {
    id: 'empresas',
    name: 'Empresas do Grupo',
    href: '/cadastros/empresas',
    icon: Building,
    description: 'Estrutura multi-empresa, filiais, matriz e participações',
    color: 'secondary',
    count: 4,
    category: 'Entidades',
  },
  {
    id: 'plano-contas',
    name: 'Plano de Contas Contábil',
    href: '/cadastros/plano-contas',
    icon: BookOpen,
    description: 'Estrutura hierárquica contábil de contas analíticas e sintéticas',
    color: 'success',
    count: 54,
    category: 'Contábil',
  },
]

export default function CadastrosPage() {
  const theme = useTheme()
  const { config } = useThemeConfig()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('todos')
  const [openQuickModal, setOpenQuickModal] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState('clientes')
  const [quickForm, setQuickForm] = useState({
    nome: '',
    documento: '',
    email: '',
    observacao: '',
  })
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const filteredItems = cadastrosList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = filterCategory === 'todos' || item.category === filterCategory
    return matchesSearch && matchesCat
  })

  const handleOpenQuickCreate = (entityId?: string) => {
    if (entityId) setSelectedEntity(entityId)
    setQuickForm({ nome: '', documento: '', email: '', observacao: '' })
    setOpenQuickModal(true)
  }

  const handleSaveQuick = () => {
    if (!quickForm.nome.trim()) {
      alert('Por favor, informe ao menos o nome do cadastro.')
      return
    }
    setOpenQuickModal(false)
    setSnackbarMessage(`Novo cadastro em "${cadastrosList.find(c => c.id === selectedEntity)?.name}" salvo com sucesso!`)
    setSnackbarOpen(true)
  }

  return (
    <AppShell
      title="Controle de Cadastros"
      subtitle="Gerenciamento centralizado de dados mestres, parceiros, contas e estrutura financeira"
      breadcrumbs={[
        { label: 'Início', href: '/dashboard' },
        { label: 'Cadastros' },
      ]}
      actions={
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => handleOpenQuickCreate()}
          size="small"
        >
          Novo Cadastro Rápido
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Métricas e Estatísticas Gerais dos Cadastros */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: `${config.borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                TOTAL DE PARCEIROS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                70
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                42 Clientes &bull; 28 Fornecedores
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: `${config.borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                CONTAS & CAIXAS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                8
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Todas conciliadas ativas
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: `${config.borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                ESTRUTURA CONTÁBIL
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                73
              </Typography>
              <Typography variant="caption" color="text.secondary">
                19 Categorias &bull; 54 Contas
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: `${config.borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                EMPRESAS DO GRUPO
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                4
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Matriz & 3 Filiais
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Barra de Filtros e Busca de Cadastros */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: `${config.borderRadius}px`,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <TextField
            size="small"
            placeholder="Pesquisar módulo de cadastro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 320 } }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['todos', 'Entidades', 'Financeiro', 'Contábil'].map((cat) => (
              <Chip
                key={cat}
                label={cat === 'todos' ? 'Todos os Módulos' : cat}
                clickable
                color={filterCategory === cat ? 'primary' : 'default'}
                variant={filterCategory === cat ? 'filled' : 'outlined'}
                onClick={() => setFilterCategory(cat)}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Box>
        </Paper>

        {/* Grade de Controles de Cada Entidade */}
        <Grid container spacing={2.5}>
          {filteredItems.map((item) => {
            const Icon = item.icon
            return (
              <Grid item xs={12} sm={6} lg={4} key={item.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: `${config.borderRadius}px`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-3px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Top Header do Card com Ícone e Badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: `${config.borderRadius}px`,
                          bgcolor: alpha(theme.palette[item.color].main, 0.1),
                          color: theme.palette[item.color].main,
                          display: 'flex',
                        }}
                      >
                        <Icon size={24} />
                      </Box>

                      <Chip
                        label={`${item.count} ativos`}
                        size="small"
                        color={item.color}
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                      />
                    </Box>

                    {/* Informações da Entidade */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {item.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, flex: 1 }}>
                      {item.description}
                    </Typography>

                    {/* Controles de Ação Direta */}
                    <Box
                      sx={{
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Button
                        component={Link}
                        href={item.href}
                        variant="text"
                        size="small"
                        endIcon={<ArrowRight size={16} />}
                        sx={{ fontWeight: 600, px: 0 }}
                      >
                        Gerenciar
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Plus size={14} />}
                        onClick={() => handleOpenQuickCreate(item.id)}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Novo
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      {/* Modal de Criação Rápida de Cadastro */}
      <Dialog
        open={openQuickModal}
        onClose={() => setOpenQuickModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: `${config.borderRadius}px` } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Novo Cadastro Rápido</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="tipo-cadastro-label">Tipo de Cadastro</InputLabel>
            <Select
              labelId="tipo-cadastro-label"
              label="Tipo de Cadastro"
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
            >
              {cadastrosList.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="Razão Social / Nome Completo *"
            placeholder="Ex: Comercial Souza Ltda"
            value={quickForm.nome}
            onChange={(e) => setQuickForm({ ...quickForm, nome: e.target.value })}
          />

          <TextField
            fullWidth
            size="small"
            label="CNPJ / CPF / Identificador"
            placeholder="00.000.000/0001-00"
            value={quickForm.documento}
            onChange={(e) => setQuickForm({ ...quickForm, documento: e.target.value })}
          />

          <TextField
            fullWidth
            size="small"
            label="E-mail de Contato"
            type="email"
            placeholder="contato@empresa.com.br"
            value={quickForm.email}
            onChange={(e) => setQuickForm({ ...quickForm, email: e.target.value })}
          />

          <TextField
            fullWidth
            size="small"
            label="Observações / Detalhes"
            multiline
            rows={2}
            value={quickForm.observacao}
            onChange={(e) => setQuickForm({ ...quickForm, observacao: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenQuickModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveQuick}>
            Salvar Cadastro
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de Sucesso */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: 500 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AppShell>
  )
}
