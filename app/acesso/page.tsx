'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '../components/AppShell'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  Tooltip,
  Alert,
  Snackbar,
  Avatar,
  Divider,
  Tabs,
  Tab,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material'
import {
  Users,
  Shield,
  ShieldCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  KeyRound,
  Building,
  Building2,
  UserPlus,
  CheckCircle2,
  Lock,
  Unlock,
  Check,
  Sliders,
  Sparkles,
  Send,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useThemeConfig } from '../lib/theme-config-context'

interface UserItem {
  id: string
  nome: string
  email: string
  perfil: string
  empresa_id: number | null
  empresa_nome: string | null
  ativo: boolean
  created_at: string
}

interface ModulePermission {
  id: string
  nome: string
  descricao: string
  visualizar: boolean
  criar: boolean
  editar: boolean
  excluir: boolean
  exportar: boolean
}

interface CompanyOption {
  id: number
  nome: string
  cnpj: string | null
  email: string | null
  telefone: string | null
  tipo: string | null
  ativo: boolean | null
}

interface CompanyRequest {
  id: number
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  email: string
  telefone: string | null
  responsavel: string
  cargo_responsavel: string | null
  tipo_empresa: string
  mensagem: string | null
  status: 'pendente' | 'aprovado' | 'rejeitado'
  observacao_admin: string | null
  user_id: string | null
  empresa_id: number | null
  created_at: string
  empresas?: { nome: string } | null
}

const initialModules: ModulePermission[] = [
  {
    id: 'dashboard',
    nome: 'Dashboard Geral',
    descricao: 'Acesso a métricas consolidadas e gráficos executivos',
    visualizar: true,
    criar: false,
    editar: false,
    excluir: false,
    exportar: true,
  },
  {
    id: 'financeiro',
    nome: 'Financeiro & Lançamentos',
    descricao: 'Entradas, saídas, anexos e conciliação bancária',
    visualizar: true,
    criar: true,
    editar: true,
    excluir: false,
    exportar: true,
  },
  {
    id: 'prestacao',
    nome: 'Prestação de Contas',
    descricao: 'Relatórios de prestação e auditoria contábil',
    visualizar: true,
    criar: true,
    editar: true,
    excluir: false,
    exportar: true,
  },
  {
    id: 'cotacao',
    nome: 'Cotação de Moedas',
    descricao: 'Taxas cambiais, histórico de USD/EUR e índices',
    visualizar: true,
    criar: false,
    editar: false,
    excluir: false,
    exportar: false,
  },
  {
    id: 'cadastros',
    nome: 'Cadastros Mestres',
    descricao: 'Clientes, fornecedores, contas e plano contábil',
    visualizar: true,
    criar: true,
    editar: true,
    excluir: false,
    exportar: true,
  },
  {
    id: 'acesso',
    nome: 'Gestão de Usuários & Permissões',
    descricao: 'Administração de acessos e concessão de privilégios',
    visualizar: false,
    criar: false,
    editar: false,
    excluir: false,
    exportar: false,
  },
  {
    id: 'configuracao',
    nome: 'Configurações do Sistema',
    descricao: 'Personalização visual de temas, cores e tipografia',
    visualizar: true,
    criar: false,
    editar: true,
    excluir: false,
    exportar: false,
  },
]

const roleLabels: Record<string, { label: string; color: 'primary' | 'secondary' | 'info' | 'warning' | 'default' | 'success' | 'error' }> = {
  admin: { label: 'Administrador', color: 'primary' },
  admin_sistema: { label: 'Admin Sistema', color: 'error' },
  admin_empresa: { label: 'Admin Empresa', color: 'primary' },
  gestor: { label: 'Gestor Financeiro', color: 'info' },
  analista: { label: 'Analista Pleno', color: 'secondary' },
  operador: { label: 'Operador', color: 'warning' },
  usuario: { label: 'Usuário', color: 'default' },
  leitor: { label: 'Somente Leitura', color: 'default' },
}

export default function AcessoPage() {
  const theme = useTheme()
  const { config } = useThemeConfig()

  // State
  const [users, setUsers] = useState<UserItem[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [modules, setModules] = useState<ModulePermission[]>(initialModules)
  const [companyRequests, setCompanyRequests] = useState<CompanyRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('todos')
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)

  // Dialog permissions granular state (per module, per action)
  const [dialogPermissions, setDialogPermissions] = useState<Record<string, ModulePermission>>({})

  // Status colors for chips
  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    pendente: 'warning',
    aprovado: 'success',
    rejeitado: 'error',
  }

  // User Dialog State
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [userForm, setUserForm] = useState({
    nome: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    perfil: 'usuario',
    empresa_id: '',
    ativo: true,
  })
  const [showUserPassword, setShowUserPassword] = useState(false)

  // Company Request Dialog State
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<CompanyRequest | null>(null)

  // Feedback State
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  // Fetch data
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/usuarios')
      const json = await res.json()
      if (json.success) {
        setUsers(json.data.map((u: any) => ({
          id: u.id,
          nome: u.nome,
          email: u.email,
          perfil: u.perfil || 'usuario',
          empresa_id: u.empresa_id,
          empresa_nome: u.empresas?.nome || null,
          ativo: u.ativo,
          created_at: u.created_at,
        })))
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/empresas')
      const json = await res.json()
      if (json.success) {
        setCompanies(json.data.map((c: any) => ({
          id: c.id,
          nome: c.nome,
          cnpj: c.cnpj || null,
          email: c.email || null,
          telefone: c.telefone || null,
          tipo: c.tipo || null,
          ativo: c.ativo,
        })))
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
    }
  }

  const fetchCompanyRequests = async () => {
    try {
      const res = await fetch('/api/solicitacoes-empresa')
      const json = await res.json()
      if (json.success) {
        setCompanyRequests(json.data)
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchCompanies()
    fetchCompanyRequests()
  }, [])

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }

  const handleOpenUserDialog = async (userToEdit?: UserItem) => {
    if (userToEdit) {
      setEditingUserId(userToEdit.id)
      setUserForm({
        nome: userToEdit.nome,
        email: userToEdit.email,
        password: '',
        passwordConfirmation: '',
        perfil: userToEdit.perfil,
        empresa_id: userToEdit.empresa_id?.toString() || '',
        ativo: userToEdit.ativo,
      })

      // Carregar permissões existentes do usuário
      try {
        const res = await fetch(`/api/permissoes?usuario_id=${userToEdit.id}`)
        const json = await res.json()
        if (json.success) {
          const perms: Record<string, ModulePermission> = {}
          json.data.forEach((p: any) => {
            perms[p.modulo] = {
              id: p.modulo,
              nome: p.modulo,
              descricao: '',
              visualizar: p.visualizar,
              criar: p.criar,
              editar: p.editar,
              excluir: p.deletar,
              exportar: p.exportar,
            }
          })
          // Garantir que todos os módulos apareçam mesmo sem permissão salva
          initialModules.forEach((m) => {
            if (!perms[m.id]) {
              perms[m.id] = { ...m, visualizar: false, criar: false, editar: false, excluir: false, exportar: false }
            }
          })
          setDialogPermissions(perms)
        }
      } catch (error) {
        console.error('Erro ao carregar permissões:', error)
        applyDialogPermissionPreset('clear')
      }
    } else {
      setEditingUserId(null)
      setUserForm({
        nome: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        perfil: 'usuario',
        empresa_id: companies[0]?.id?.toString() || '',
        ativo: true,
      })
      // Inicializar com presets de "Usuário Padrão"
      applyDialogPermissionPreset('leitor')
    }
    setUserDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!userForm.nome || !userForm.email || !userForm.empresa_id) {
      showSnackbar('Preencha os campos obrigatórios (Nome, E-mail, Empresa).', 'error')
      return
    }
    if (!editingUserId && !userForm.password) {
      showSnackbar('Senha é obrigatória para novo usuário.', 'error')
      return
    }
    if (userForm.password && userForm.password.length < 6) {
      showSnackbar('A senha deve ter pelo menos 6 caracteres.', 'error')
      return
    }
    if (userForm.password !== userForm.passwordConfirmation) {
      showSnackbar('A confirmação da senha não confere.', 'error')
      return
    }

    setLoading(true)
    try {
      const body = {
        nome: userForm.nome,
        email: userForm.email,
        empresa_id: parseInt(userForm.empresa_id),
        perfil: userForm.perfil,
        ativo: userForm.ativo,
        ...(userForm.password && { password: userForm.password }),
        ...(editingUserId && { id: editingUserId }),
      }

      const method = editingUserId ? 'PUT' : 'POST'
      const res = await fetch('/api/usuarios', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (json.success) {
        showSnackbar(editingUserId ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!')

        // Salvar permissões granulares por módulo
        const userId = editingUserId || json.data?.id
        if (userId && dialogPermissions) {
          const permissaoPromises = Object.values(dialogPermissions).map((perm) =>
            fetch('/api/permissoes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                usuario_id: userId,
                modulo: perm.id,
                visualizar: perm.visualizar,
                criar: perm.criar,
                editar: perm.editar,
                deletar: perm.excluir,
                exportar: perm.exportar,
              }),
            })
          )
          await Promise.all(permissaoPromises)
        }

        setUserDialogOpen(false)
        setUserForm((current) => ({ ...current, password: '', passwordConfirmation: '' }))
        fetchUsers()
      } else {
        showSnackbar(json.error || 'Erro ao salvar usuário', 'error')
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      showSnackbar('Erro de conexão ao salvar usuário', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ativo: !currentActive }),
      })
      const json = await res.json()
      if (json.success) {
        showSnackbar('Status do usuário atualizado!')
        fetchUsers()
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Deseja realmente remover este usuário do sistema?')) return
    try {
      const res = await fetch(`/api/usuarios?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        showSnackbar('Usuário excluído com sucesso.')
        fetchUsers()
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
    }
  }

  const applyDialogPermissionPreset = (preset: 'admin' | 'gestor' | 'leitor' | 'clear') => {
    const newPerms: Record<string, ModulePermission> = {}
    initialModules.forEach((m) => {
      let perms = { ...m }
      if (preset === 'admin') {
        perms = { ...m, visualizar: true, criar: true, editar: true, excluir: true, exportar: true }
      } else if (preset === 'gestor') {
        const isSecurity = m.id === 'acesso'
        perms = { ...m, visualizar: true, criar: !isSecurity, editar: !isSecurity, excluir: false, exportar: true }
      } else if (preset === 'leitor') {
        perms = { ...m, visualizar: true, criar: false, editar: false, excluir: false, exportar: false }
      } else {
        perms = { ...m, visualizar: false, criar: false, editar: false, excluir: false, exportar: false }
      }
      newPerms[m.id] = perms
    })
    setDialogPermissions(newPerms)
  }

  const handleTogglePermission = (moduleId: string, action: keyof Omit<ModulePermission, 'id' | 'nome' | 'descricao'>) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === moduleId) {
          return { ...m, [action]: !m[action] }
        }
        return m
      })
    )
  }

  const applyPermissionPreset = (preset: 'admin' | 'gestor' | 'leitor' | 'clear') => {
    setModules((prev) =>
      prev.map((m) => {
        if (preset === 'admin') {
          return { ...m, visualizar: true, criar: true, editar: true, excluir: true, exportar: true }
        }
        if (preset === 'gestor') {
          const isSecurity = m.id === 'acesso'
          return {
            ...m,
            visualizar: true,
            criar: !isSecurity,
            editar: !isSecurity,
            excluir: false,
            exportar: true,
          }
        }
        if (preset === 'leitor') {
          return { ...m, visualizar: true, criar: false, editar: false, excluir: false, exportar: false }
        }
        return { ...m, visualizar: false, criar: false, editar: false, excluir: false, exportar: false }
      })
    )
    showSnackbar(`Predefinição "${preset.toUpperCase()}" aplicada à matriz!`)
  }

  const handleSavePermissions = async () => {
    if (!selectedUserForPerms) return
    try {
      // Salvar permissões para o usuário selecionado
      for (const m of modules) {
        await fetch('/api/permissoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: selectedUserForPerms,
            modulo: m.id,
            visualizar: m.visualizar,
            criar: m.criar,
            editar: m.editar,
            deletar: m.excluir,
            exportar: m.exportar,
          }),
        })
      }
      showSnackbar('Permissões salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar permissões:', error)
      showSnackbar('Erro ao salvar permissões', 'error')
    }
  }

  const handleApproveRequest = async (requestId: number) => {
    try {
      const res = await fetch('/api/solicitacoes-empresa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status: 'aprovado' }),
      })
      const json = await res.json()
      if (json.success) {
        showSnackbar('Solicitação aprovada e empresa criada!')
        fetchCompanyRequests()
        fetchCompanies()
        fetchUsers()
      } else {
        showSnackbar(json.error || 'Erro ao aprovar', 'error')
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      showSnackbar('Erro ao aprovar solicitação', 'error')
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    try {
      const res = await fetch('/api/solicitacoes-empresa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status: 'rejeitado' }),
      })
      const json = await res.json()
      if (json.success) {
        showSnackbar('Solicitação rejeitada.')
        fetchCompanyRequests()
      } else {
        showSnackbar(json.error || 'Erro ao rejeitar', 'error')
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
      showSnackbar('Erro ao rejeitar solicitação', 'error')
    }
  }

  const openRequestDialog = (request: CompanyRequest) => {
    setSelectedRequest(request)
    setRequestDialogOpen(true)
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRoleFilter === 'todos' || u.perfil === selectedRoleFilter
    return matchesSearch && matchesRole
  })

  const selectedUser = users.find((u) => u.id === selectedUserForPerms)

  return (
    <AppShell
      title="Gestão de Usuários & Permissões"
      subtitle="Controle de acessos, multi-empresa e matriz de permissões granulares por módulo"
      breadcrumbs={[
        { label: 'Início', href: '/dashboard' },
        { label: 'Administração' },
        { label: 'Usuários & Permissões' },
      ]}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Send size={16} />}
            onClick={() => setActiveTab(2)}
            size="small"
          >
            Solicitações ({companyRequests.filter(r => r.status === 'pendente').length})
          </Button>
          <Button
            variant="contained"
            startIcon={<UserPlus size={16} />}
            onClick={() => handleOpenUserDialog()}
            size="small"
          >
            Novo Usuário
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Tabs */}
        <Paper elevation={0} sx={{ bgcolor: alpha(theme.palette.divider, 0.2), p: 0.5, borderRadius: `${config.borderRadius}px`, mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="fullWidth"
            sx={{ minHeight: 42, '& .MuiTab-root': { minHeight: 42, py: 1, fontWeight: 600, fontSize: '0.88rem', borderRadius: `${config.borderRadius - 2}px`, textTransform: 'none' } }}
          >
            <Tab icon={<Users />} label="Usuários" />
            <Tab icon={<Building2 />} label="Empresas" />
            <Tab icon={<Send />} label="Solicitações de Empresa" />
          </Tabs>
        </Paper>

        {/* Tab 0: Usuários */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* KPI Summary Cards */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: `${config.borderRadius}px`, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>USUÁRIOS CADASTRADOS</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>{users.length}</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>{users.filter((u) => u.ativo).length} ativos</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: `${config.borderRadius}px`, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>ADMINISTRADORES</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>{users.filter((u) => u.perfil === 'admin' || u.perfil === 'admin_sistema').length}</Typography>
                  <Typography variant="caption" color="text.secondary">Acesso global irrestrito</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: `${config.borderRadius}px`, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>EMPRESAS</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>{companies.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Empresas no grupo</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: `${config.borderRadius}px`, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>SOLICITAÇÕES PENDENTES</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>{companyRequests.filter(r => r.status === 'pendente').length}</Typography>
                  <Typography variant="caption" color="text.secondary">Aguardando aprovação</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Tabela de Usuários */}
            <Card elevation={0}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Usuários do Sistema</Typography>
                  <Typography variant="caption" color="text.secondary">Gerencie contas de colaboradores, cargos e atribuição multi-empresa</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <TextField size="small" placeholder="Buscar por nome ou e-mail..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }} sx={{ width: 260 }} />
                  <FormControl size="small" sx={{ width: 180 }}>
                    <InputLabel id="filter-role-label">Filtrar por Perfil</InputLabel>
                    <Select labelId="filter-role-label" label="Filtrar por Perfil" value={selectedRoleFilter} onChange={(e) => setSelectedRoleFilter(e.target.value)}>
                      <MenuItem value="todos">Todos os Perfis</MenuItem>
                      <MenuItem value="admin_sistema">Admin Sistema</MenuItem>
                      <MenuItem value="admin_empresa">Admin Empresa</MenuItem>
                      <MenuItem value="admin">Administrador</MenuItem>
                      <MenuItem value="gestor">Gestor Financeiro</MenuItem>
                      <MenuItem value="analista">Analista</MenuItem>
                      <MenuItem value="operador">Operador</MenuItem>
                      <MenuItem value="usuario">Usuário</MenuItem>
                      <MenuItem value="leitor">Somente Leitura</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Empresa</TableCell>
                      <TableCell>Perfil</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Permissões</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">Nenhum usuário encontrado.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => {
                        const roleInfo = roleLabels[user.perfil] || { label: user.perfil, color: 'default' }
                        const isSelected = selectedUserForPerms === user.id
                        return (
                          <TableRow key={user.id} hover sx={{ bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'inherit' }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 700, fontSize: '0.85rem' }}>{user.nome.charAt(0)}</Avatar>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user.nome}</Typography>
                                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color={user.empresa_nome ? 'text.primary' : 'text.secondary'}>
                                {user.empresa_nome || 'Não vinculada'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={roleInfo.label} size="small" color={roleInfo.color} sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                            </TableCell>
                            <TableCell>
                              <Switch checked={user.ativo} size="small" onChange={() => handleToggleUserActive(user.id, user.ativo)} color="success" />
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                variant={isSelected ? 'contained' : 'outlined'}
                                onClick={() => setSelectedUserForPerms(user.id)}
                                sx={{ fontSize: '0.75rem', py: 0.5 }}
                              >
                                Configurar
                              </Button>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                <Tooltip title="Editar">
                                  <IconButton size="small" onClick={() => handleOpenUserDialog(user)}><Edit size={16} /></IconButton>
                                </Tooltip>
                                <Tooltip title="Excluir">
                                  <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}><Trash2 size={16} /></IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            {/* Matriz de Permissões */}
            {selectedUser && (
              <Card elevation={0}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: `${config.borderRadius}px`, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}><ShieldCheck size={22} /></Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Matriz de Permissões Granulares</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Usuário: <strong>{selectedUser.nome}</strong> ({selectedUser.email})
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mr: 0.5 }}>Predefinições:</Typography>
                    <Button size="small" variant="outlined" onClick={() => applyPermissionPreset('admin')}>Admin Total</Button>
                    <Button size="small" variant="outlined" onClick={() => applyPermissionPreset('gestor')}>Gestor</Button>
                    <Button size="small" variant="outlined" onClick={() => applyPermissionPreset('leitor')}>Somente Leitura</Button>
                    <Button size="small" variant="outlined" color="inherit" onClick={() => applyPermissionPreset('clear')}>Limpar</Button>
                    <Button size="small" variant="contained" onClick={handleSavePermissions} sx={{ ml: 1 }}>Salvar Matriz</Button>
                  </Box>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 260 }}>Módulo</TableCell>
                        <TableCell align="center">Visualizar</TableCell>
                        <TableCell align="center">Criar</TableCell>
                        <TableCell align="center">Editar</TableCell>
                        <TableCell align="center">Excluir</TableCell>
                        <TableCell align="center">Exportar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {modules.map((m) => (
                        <TableRow key={m.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{m.nome}</Typography>
                            <Typography variant="caption" color="text.secondary">{m.descricao}</Typography>
                          </TableCell>
                          <TableCell align="center"><Checkbox checked={m.visualizar} onChange={() => handleTogglePermission(m.id, 'visualizar')} size="small" color="primary" /></TableCell>
                          <TableCell align="center"><Checkbox checked={m.criar} onChange={() => handleTogglePermission(m.id, 'criar')} size="small" color="primary" /></TableCell>
                          <TableCell align="center"><Checkbox checked={m.editar} onChange={() => handleTogglePermission(m.id, 'editar')} size="small" color="primary" /></TableCell>
                          <TableCell align="center"><Checkbox checked={m.excluir} onChange={() => handleTogglePermission(m.id, 'excluir')} size="small" color="error" /></TableCell>
                          <TableCell align="center"><Checkbox checked={m.exportar} onChange={() => handleTogglePermission(m.id, 'exportar')} size="small" color="primary" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            {!selectedUser && activeTab === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Selecione um usuário na tabela acima para configurar suas permissões.
              </Alert>
            )}
          </Box>
        )}

        {/* Tab 1: Empresas */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card elevation={0}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Empresas do Grupo</Typography>
                  <Typography variant="caption" color="text.secondary">Empresas cadastradas e vinculadas aos usuários</Typography>
                </Box>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Empresa</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>E-mail</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Usuários</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companies.map((comp) => {
                      const userCount = users.filter(u => u.empresa_id === comp.id).length
                      return (
                        <TableRow key={comp.id} hover>
                          <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{comp.nome}</Typography></TableCell>
                          <TableCell>{comp.cnpj || '-'}</TableCell>
                          <TableCell>{comp.email || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={comp.ativo ? 'Ativa' : 'Inativa'}
                              size="small"
                              color={comp.ativo ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right"><Typography variant="body2">{userCount} usuário(s)</Typography></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        )}

        {/* Tab 2: Solicitações de Empresa */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card elevation={0}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Solicitações de Nova Empresa</Typography>
                  <Typography variant="caption" color="text.secondary">Gerencie solicitações de cadastro de novas empresas no grupo</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label="Pendentes" color="warning" size="small" icon={<RefreshCw />} />
                  <Chip label="Aprovadas" color="success" size="small" icon={<CheckCircle2 />} />
                  <Chip label="Rejeitadas" color="error" size="small" icon={<Lock />} />
                </Box>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Empresa Solicitada</TableCell>
                      <TableCell>Responsável</TableCell>
                      <TableCell>E-mail</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companyRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">Nenhuma solicitação encontrada.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      companyRequests.map((req) => {
                        return (
                          <TableRow key={req.id} hover>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{req.razao_social}</Typography>
                              {req.nome_fantasia && <Typography variant="caption" color="text.secondary">{req.nome_fantasia}</Typography>}
                            </TableCell>
                            <TableCell>{req.responsavel}</TableCell>
                            <TableCell>{req.email}</TableCell>
                            <TableCell><Chip label={req.tipo_empresa} size="small" variant="outlined" /></TableCell>
                            <TableCell>
                              <Chip label={req.status} size="small" color={statusColors[req.status] || 'default'} />
                            </TableCell>
                            <TableCell>{new Date(req.created_at).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                <Tooltip title="Ver detalhes">
                                  <IconButton size="small" onClick={() => openRequestDialog(req)}><Edit size={16} /></IconButton>
                                </Tooltip>
                                {req.status === 'pendente' && (
                                  <>
                                    <Tooltip title="Aprovar">
                                      <IconButton size="small" color="success" onClick={() => handleApproveRequest(req.id)}><CheckCircle2 size={16} /></IconButton>
                                    </Tooltip>
                                    <Tooltip title="Rejeitar">
                                      <IconButton size="small" color="error" onClick={() => handleRejectRequest(req.id)}><Lock size={16} /></IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        )}

        {/* Dialog Novo/Editar Usuário */}
        <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: `${config.borderRadius}px` } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>{editingUserId ? 'Editar Usuário' : 'Novo Usuário do Sistema'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5, pb: 0 }}>
            <TextField fullWidth size="small" label="Nome Completo *" placeholder="Ex: João da Silva" value={userForm.nome} onChange={(e) => setUserForm({ ...userForm, nome: e.target.value })} sx={{ mt: 1 }} />
            <TextField fullWidth size="small" label="E-mail Corporativo *" type="email" placeholder="usuario@empresa.com.br" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
            <TextField
              fullWidth
              size="small"
              label={editingUserId ? 'Nova senha (opcional)' : 'Senha inicial *'}
              type={showUserPassword ? 'text' : 'password'}
              placeholder="Mínimo de 6 caracteres"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              autoComplete="new-password"
              helperText={editingUserId ? 'Deixe em branco para manter a senha atual.' : 'A senha será armazenada somente no Supabase Auth.'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showUserPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowUserPassword((visible) => !visible)}
                      edge="end"
                      size="small"
                    >
                      {showUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              size="small"
              label={editingUserId ? 'Confirmar nova senha' : 'Confirmar senha *'}
              type={showUserPassword ? 'text' : 'password'}
              placeholder="Digite a senha novamente"
              value={userForm.passwordConfirmation}
              onChange={(e) => setUserForm({ ...userForm, passwordConfirmation: e.target.value })}
              autoComplete="new-password"
              disabled={!userForm.password}
              error={Boolean(userForm.passwordConfirmation && userForm.password !== userForm.passwordConfirmation)}
              helperText={userForm.passwordConfirmation && userForm.password !== userForm.passwordConfirmation ? 'As senhas não conferem.' : ' '}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="dialog-role-label">Perfil de Acesso</InputLabel>
              <Select labelId="dialog-role-label" label="Perfil de Acesso" value={userForm.perfil} onChange={(e) => {
                const novoPerfil = e.target.value
                setUserForm({ ...userForm, perfil: novoPerfil })
                // Aplicar preset baseado no perfil selecionado
                if (novoPerfil === 'admin_sistema' || novoPerfil === 'admin') applyDialogPermissionPreset('admin')
                else if (novoPerfil === 'gestor') applyDialogPermissionPreset('gestor')
                else if (novoPerfil === 'leitor') applyDialogPermissionPreset('leitor')
                else applyDialogPermissionPreset('clear')
              }}>
                <MenuItem value="admin_sistema">Admin Sistema</MenuItem>
                <MenuItem value="admin_empresa">Admin Empresa</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="gestor">Gestor Financeiro</MenuItem>
                <MenuItem value="analista">Analista Financeiro</MenuItem>
                <MenuItem value="operador">Operador de Lançamentos</MenuItem>
                <MenuItem value="usuario">Usuário Padrão</MenuItem>
                <MenuItem value="leitor">Somente Leitura / Auditoria</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, mb: 1 }}>
              <Button size="small" variant="outlined" onClick={() => applyDialogPermissionPreset('admin')}>Admin Total</Button>
              <Button size="small" variant="outlined" onClick={() => applyDialogPermissionPreset('gestor')}>Gestor</Button>
              <Button size="small" variant="outlined" onClick={() => applyDialogPermissionPreset('leitor')}>Leitor</Button>
              <Button size="small" variant="outlined" onClick={() => applyDialogPermissionPreset('clear')}>Limpar</Button>
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel id="dialog-company-label">Empresa *</InputLabel>
              <Select labelId="dialog-company-label" label="Empresa" value={userForm.empresa_id} onChange={(e) => setUserForm({ ...userForm, empresa_id: e.target.value })}>
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id.toString()}>{c.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel control={<Switch checked={userForm.ativo} onChange={(e) => setUserForm({ ...userForm, ativo: e.target.checked })} color="success" />} label="Usuário Ativo (Pode realizar login)" />

            {/* Matriz de Permissões Granulares */}
            <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>Permissões por Módulo</Typography>
              <TableContainer sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 200, fontWeight: 600 }}>Módulo</TableCell>
                      <TableCell sx={{ width: 80, align: 'center' }}>Visualizar</TableCell>
                      <TableCell sx={{ width: 80, align: 'center' }}>Criar</TableCell>
                      <TableCell sx={{ width: 80, align: 'center' }}>Editar</TableCell>
                      <TableCell sx={{ width: 80, align: 'center' }}>Excluir</TableCell>
                      <TableCell sx={{ width: 80, align: 'center' }}>Exportar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {initialModules.map((mod) => {
                      const p = dialogPermissions[mod.id] || { ...mod, visualizar: false, criar: false, editar: false, excluir: false, exportar: false }
                      return (
                        <TableRow key={mod.id} hover>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ShieldCheck size={14} color={p.visualizar ? 'primary' : 'default'} />
                              <Typography variant="body2" sx={{ fontWeight: p.visualizar ? 600 : 400 }}>{mod.nome}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center"><Checkbox size="small" checked={p.visualizar} onChange={() => setDialogPermissions({ ...dialogPermissions, [mod.id]: { ...p, visualizar: !p.visualizar } })} /></TableCell>
                          <TableCell align="center"><Checkbox size="small" checked={p.criar} onChange={() => setDialogPermissions({ ...dialogPermissions, [mod.id]: { ...p, criar: !p.criar } })} /></TableCell>
                          <TableCell align="center"><Checkbox size="small" checked={p.editar} onChange={() => setDialogPermissions({ ...dialogPermissions, [mod.id]: { ...p, editar: !p.editar } })} /></TableCell>
                          <TableCell align="center"><Checkbox size="small" checked={p.excluir} onChange={() => setDialogPermissions({ ...dialogPermissions, [mod.id]: { ...p, excluir: !p.excluir } })} /></TableCell>
                          <TableCell align="center"><Checkbox size="small" checked={p.exportar} onChange={() => setDialogPermissions({ ...dialogPermissions, [mod.id]: { ...p, exportar: !p.exportar } })} /></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setUserDialogOpen(false)} disabled={loading}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveUser} disabled={loading}>
              {loading ? <CircularProgress size={16} color="inherit" /> : (editingUserId ? 'Salvar Alterações' : 'Criar Usuário')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Detalhes da Solicitação */}
        <Dialog open={requestDialogOpen} onClose={() => { setRequestDialogOpen(false); setSelectedRequest(null) }} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: `${config.borderRadius}px` } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Detalhes da Solicitação</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            {selectedRequest && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Razão Social</Typography><Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedRequest.razao_social}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Nome Fantasia</Typography><Typography variant="body1">{selectedRequest.nome_fantasia || '-'}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">CNPJ</Typography><Typography variant="body1">{selectedRequest.cnpj || '-'}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">E-mail</Typography><Typography variant="body1">{selectedRequest.email}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Telefone</Typography><Typography variant="body1">{selectedRequest.telefone || '-'}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Responsável</Typography><Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedRequest.responsavel}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Cargo</Typography><Typography variant="body1">{selectedRequest.cargo_responsavel || '-'}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Tipo</Typography><Typography variant="body1"><Chip label={selectedRequest.tipo_empresa} size="small" /></Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">Status</Typography><Typography variant="body1"><Chip label={selectedRequest.status} size="small" color={statusColors[selectedRequest.status] || 'default'} /></Typography></Grid>
                  <Grid item xs={12}><Typography variant="caption" color="text.secondary">Mensagem</Typography><Typography variant="body2">{selectedRequest.mensagem || 'Sem mensagem'}</Typography></Grid>
                  {selectedRequest.observacao_admin && (
                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Observação do Admin</Typography><Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>{selectedRequest.observacao_admin}</Typography></Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => { setRequestDialogOpen(false); setSelectedRequest(null) }}>Fechar</Button>
            {selectedRequest?.status === 'pendente' && (
              <>
                <Button variant="outlined" color="error" onClick={() => handleRejectRequest(selectedRequest!.id)}>Rejeitar</Button>
                <Button variant="contained" color="success" onClick={() => handleApproveRequest(selectedRequest!.id)}>Aprovar</Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%', fontWeight: 500 }}>{snackbarMessage}</Alert>
        </Snackbar>
      </Box>
    </AppShell>
  )
}