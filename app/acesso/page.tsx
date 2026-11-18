'use client'

import { useState } from 'react'
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
  useTheme,
  alpha,
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
  CheckCircle2,
  Lock,
  Unlock,
  Check,
  Sliders,
  Sparkles,
} from 'lucide-react'
import { useThemeConfig } from '../lib/theme-config-context'

interface UserItem {
  id: string
  name: string
  email: string
  role: 'admin' | 'gestor' | 'analista' | 'operador' | 'leitor'
  companies: string[]
  active: boolean
  lastLogin: string
}

interface ModulePermission {
  id: string
  name: string
  description: string
  visualizar: boolean
  criar: boolean
  editar: boolean
  excluir: boolean
  exportar: boolean
}

const initialUsers: UserItem[] = [
  {
    id: '1',
    name: 'Carlos Jorge',
    email: 'carlos.jorge@trench.com.br',
    role: 'admin',
    companies: ['Trench Holding S/A', 'Filial São Paulo', 'Filial Rio de Janeiro'],
    active: true,
    lastLogin: 'Hoje, 14:32',
  },
  {
    id: '2',
    name: 'Mariana Silveira',
    email: 'mariana.silveira@trench.com.br',
    role: 'gestor',
    companies: ['Trench Holding S/A', 'Filial São Paulo'],
    active: true,
    lastLogin: 'Ontem, 18:20',
  },
  {
    id: '3',
    name: 'Rodrigo Andrade',
    email: 'rodrigo.andrade@trench.com.br',
    role: 'analista',
    companies: ['Filial São Paulo'],
    active: true,
    lastLogin: '14/11/2026',
  },
  {
    id: '4',
    name: 'Aline Pires',
    email: 'aline.pires@trench.com.br',
    role: 'operador',
    companies: ['Filial Rio de Janeiro'],
    active: true,
    lastLogin: '10/11/2026',
  },
  {
    id: '5',
    name: 'Auditoria Externa Santos',
    email: 'auditoria@santos.adv.br',
    role: 'leitor',
    companies: ['Trench Holding S/A'],
    active: false,
    lastLogin: '01/11/2026',
  },
]

const initialModules: ModulePermission[] = [
  {
    id: 'dashboard',
    name: 'Dashboard Geral',
    description: 'Acesso a métricas consolidadas e gráficos executivos',
    visualizar: true,
    criar: false,
    editar: false,
    excluir: false,
    exportar: true,
  },
  {
    id: 'financeiro',
    name: 'Financeiro & Lançamentos',
    description: 'Entradas, saídas, anexos e conciliação bancária',
    visualizar: true,
    criar: true,
    editar: true,
    excluir: false,
    exportar: true,
  },
  {
    id: 'prestacao',
    name: 'Prestação de Contas',
    description: 'Relatórios de prestação e auditoria contábil',
    visualizar: true,
    criar: true,
    editar: true,
    excluir: false,
    exportar: true,
  },
  {
    id: 'cotacao',
    name: 'Cotação de Moedas',
    description: 'Taxas cambiais, histórico de USD/EUR e índices',
    visualizar: true,
    criar: false,
    editar: false,
    excluir: false,
    exportar: false,
  },
  {
    id: 'cadastros',
    name: 'Cadastros Mestres',
    description: 'Clientes, fornecedores, contas e plano contábil',
    visualizar: true,
    criar: true,
    editar: true,
    excluir: false,
    exportar: true,
  },
  {
    id: 'acesso',
    name: 'Gestão de Usuários & Permissões',
    description: 'Administração de acessos e concessão de privilégios',
    visualizar: false,
    criar: false,
    editar: false,
    excluir: false,
    exportar: false,
  },
  {
    id: 'configuracao',
    name: 'Configurações do Sistema',
    description: 'Personalização visual de temas, cores e tipografia',
    visualizar: true,
    criar: false,
    editar: true,
    excluir: false,
    exportar: false,
  },
]

const companyOptions = [
  'Trench Holding S/A',
  'Filial São Paulo',
  'Filial Rio de Janeiro',
  'Filial Curitiba',
]

export default function AcessoPage() {
  const theme = useTheme()
  const { config } = useThemeConfig()

  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [modules, setModules] = useState<ModulePermission[]>(initialModules)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('todos')
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<string>('1')

  // User Dialog State
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'analista' as UserItem['role'],
    companies: ['Trench Holding S/A'],
    active: true,
  })

  // Feedback State
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const roleLabels: Record<UserItem['role'], { label: string; color: 'primary' | 'secondary' | 'info' | 'warning' | 'default' }> = {
    admin: { label: 'Administrador', color: 'primary' },
    gestor: { label: 'Gestor Financeiro', color: 'info' },
    analista: { label: 'Analista Pleno', color: 'secondary' },
    operador: { label: 'Operador', color: 'warning' },
    leitor: { label: 'Somente Leitura', color: 'default' },
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRoleFilter === 'todos' || u.role === selectedRoleFilter
    return matchesSearch && matchesRole
  })

  const handleOpenUserDialog = (userToEdit?: UserItem) => {
    if (userToEdit) {
      setEditingUserId(userToEdit.id)
      setUserForm({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        companies: userToEdit.companies,
        active: userToEdit.active,
      })
    } else {
      setEditingUserId(null)
      setUserForm({
        name: '',
        email: '',
        role: 'analista',
        companies: ['Trench Holding S/A'],
        active: true,
      })
    }
    setUserDialogOpen(true)
  }

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) {
      alert('Preencha os campos obrigatórios (Nome e E-mail).')
      return
    }

    if (editingUserId) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUserId ? { ...u, ...userForm } : u))
      )
      setSnackbarMessage('Usuário atualizado com sucesso!')
    } else {
      const newUser: UserItem = {
        id: String(Date.now()),
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        companies: userForm.companies,
        active: userForm.active,
        lastLogin: 'Nunca acessou',
      }
      setUsers((prev) => [newUser, ...prev])
      setSnackbarMessage('Novo usuário cadastrado com sucesso!')
    }

    setUserDialogOpen(false)
    setSnackbarOpen(true)
  }

  const handleToggleUserActive = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    )
    setSnackbarMessage('Status do usuário atualizado!')
    setSnackbarOpen(true)
  }

  const handleDeleteUser = (id: string) => {
    if (confirm('Deseja realmente remover este usuário do sistema?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setSnackbarMessage('Usuário excluído com sucesso.')
      setSnackbarOpen(true)
    }
  }

  // Permission Matrix Handlers
  const handleTogglePermission = (moduleId: string, action: keyof Omit<ModulePermission, 'id' | 'name' | 'description'>) => {
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
    setSnackbarMessage(`Predefinição "${preset.toUpperCase()}" aplicada à matriz!`)
    setSnackbarOpen(true)
  }

  const handleSavePermissions = () => {
    const targetUser = users.find((u) => u.id === selectedUserForPerms)
    setSnackbarMessage(
      `Permissões salvas com sucesso para "${targetUser?.name || 'Perfil selecionado'}"!`
    )
    setSnackbarOpen(true)
  }

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
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => handleOpenUserDialog()}
          size="small"
        >
          Novo Usuário
        </Button>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* KPI Summary Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: `${config.borderRadius}px`,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                USUÁRIOS CADASTRADOS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                {users.length}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                {users.filter((u) => u.active).length} ativos no sistema
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
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                ADMINISTRADORES
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                {users.filter((u) => u.role === 'admin').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Acesso global irrestrito
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
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                MULTI-EMPRESA
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                {companyOptions.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Empresas no grupo
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
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                MÓDULOS DE SEGURANÇA
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
                {modules.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Políticas RLS e RBAC ativas
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabela de Usuários Cadastrados */}
        <Card elevation={0}>
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Usuários do Sistema
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gerencie contas de colaboradores, cargos e atribuição multi-empresa
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 260 }}
              />

              <FormControl size="small" sx={{ width: 180 }}>
                <InputLabel id="filter-role-label">Filtrar por Perfil</InputLabel>
                <Select
                  labelId="filter-role-label"
                  label="Filtrar por Perfil"
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                >
                  <MenuItem value="todos">Todos os Perfis</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="gestor">Gestor Financeiro</MenuItem>
                  <MenuItem value="analista">Analista</MenuItem>
                  <MenuItem value="operador">Operador</MenuItem>
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
                  <TableCell>Perfil / Cargo</TableCell>
                  <TableCell>Empresas Vinculadas</TableCell>
                  <TableCell>Último Acesso</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Nenhum usuário encontrado com os filtros atuais.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const roleInfo = roleLabels[user.role]
                    const isSelected = selectedUserForPerms === user.id
                    return (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{
                          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: 'primary.main',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                              }}
                            >
                              {user.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {user.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={roleInfo.label}
                            size="small"
                            color={roleInfo.color}
                            sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                          />
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {user.companies.map((comp) => (
                              <Chip
                                key={comp}
                                label={comp}
                                size="small"
                                variant="outlined"
                                sx={{ height: 22, fontSize: '0.68rem' }}
                              />
                            ))}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {user.lastLogin}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Switch
                            checked={user.active}
                            size="small"
                            onChange={() => handleToggleUserActive(user.id)}
                            color="success"
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Configurar Permissões na Matriz">
                              <Button
                                size="small"
                                variant={isSelected ? 'contained' : 'outlined'}
                                onClick={() => setSelectedUserForPerms(user.id)}
                                sx={{ fontSize: '0.75rem', py: 0.5 }}
                              >
                                Permissões
                              </Button>
                            </Tooltip>
                            <Tooltip title="Editar Cadastro">
                              <IconButton size="small" onClick={() => handleOpenUserDialog(user)}>
                                <Edit size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir Usuário">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
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

        {/* Matriz Granular de Permissões por Módulo */}
        <Card elevation={0}>
          <Box
            sx={{
              p: 2.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: `${config.borderRadius}px`,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}
              >
                <ShieldCheck size={22} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Matriz de Permissões Granulares
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Usuário em configuração: <strong>{users.find((u) => u.id === selectedUserForPerms)?.name}</strong> ({users.find((u) => u.id === selectedUserForPerms)?.email})
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mr: 0.5 }}>
                Predefinições:
              </Typography>
              <Button size="small" variant="outlined" onClick={() => applyPermissionPreset('admin')}>
                Admin Total
              </Button>
              <Button size="small" variant="outlined" onClick={() => applyPermissionPreset('gestor')}>
                Gestor Financeiro
              </Button>
              <Button size="small" variant="outlined" onClick={() => applyPermissionPreset('leitor')}>
                Somente Leitura
              </Button>
              <Button size="small" variant="outlined" color="inherit" onClick={() => applyPermissionPreset('clear')}>
                Limpar
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSavePermissions}
                sx={{ ml: 1 }}
              >
                Salvar Matriz
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 260 }}>Módulo do Sistema</TableCell>
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {m.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.description}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Checkbox
                        checked={m.visualizar}
                        onChange={() => handleTogglePermission(m.id, 'visualizar')}
                        size="small"
                        color="primary"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Checkbox
                        checked={m.criar}
                        onChange={() => handleTogglePermission(m.id, 'criar')}
                        size="small"
                        color="primary"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Checkbox
                        checked={m.editar}
                        onChange={() => handleTogglePermission(m.id, 'editar')}
                        size="small"
                        color="primary"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Checkbox
                        checked={m.excluir}
                        onChange={() => handleTogglePermission(m.id, 'excluir')}
                        size="small"
                        color="error"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Checkbox
                        checked={m.exportar}
                        onChange={() => handleTogglePermission(m.id, 'exportar')}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* Modal / Dialog de Cadastro e Edição de Usuário */}
      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: `${config.borderRadius}px` } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingUserId ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Nome Completo *"
            placeholder="Ex: João da Silva"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            sx={{ mt: 1 }}
          />

          <TextField
            fullWidth
            size="small"
            label="E-mail Corporativo *"
            type="email"
            placeholder="usuario@trench.com.br"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />

          <FormControl fullWidth size="small">
            <InputLabel id="dialog-role-label">Perfil de Acesso (Cargo)</InputLabel>
            <Select
              labelId="dialog-role-label"
              label="Perfil de Acesso (Cargo)"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserItem['role'] })}
            >
              <MenuItem value="admin">Administrador (Controle Total)</MenuItem>
              <MenuItem value="gestor">Gestor Financeiro</MenuItem>
              <MenuItem value="analista">Analista Financeiro</MenuItem>
              <MenuItem value="operador">Operador de Lançamentos</MenuItem>
              <MenuItem value="leitor">Somente Leitura / Auditoria</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Empresas com Acesso Liberado:
            </Typography>
            <FormGroup sx={{ pl: 0.5 }}>
              {companyOptions.map((comp) => {
                const checked = userForm.companies.includes(comp)
                return (
                  <FormControlLabel
                    key={comp}
                    control={
                      <Checkbox
                        size="small"
                        checked={checked}
                        onChange={() => {
                          const newComps = checked
                            ? userForm.companies.filter((c) => c !== comp)
                            : [...userForm.companies, comp]
                          setUserForm({ ...userForm, companies: newComps })
                        }}
                      />
                    }
                    label={<Typography variant="body2">{comp}</Typography>}
                  />
                )
              })}
            </FormGroup>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={userForm.active}
                onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })}
                color="success"
              />
            }
            label="Usuário Ativo (Pode realizar login)"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setUserDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveUser}>
            {editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de Feedback */}
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
