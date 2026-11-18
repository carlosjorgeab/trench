'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSupabase } from '../lib/supabase-context'
import { useThemeConfig } from '../lib/theme-config-context'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  Avatar,
  Collapse,
  Badge,
  Chip,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material'
import {
  LayoutDashboard,
  DollarSign,
  FileSpreadsheet,
  TrendingUp,
  Database,
  Users,
  Building2,
  Wallet,
  Tags,
  CreditCard,
  PieChart,
  BookOpen,
  ShieldCheck,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

export const SIDEBAR_WIDTH = 280

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  badge?: string | number
  badgeColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

interface NavGroup {
  title: string
  items: NavItem[]
}

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen: externalMobileOpen, onMobileClose }: SidebarProps) {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)
  const isMobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen
  const closeMobile = onMobileClose || (() => setInternalMobileOpen(false))

  const pathname = usePathname()
  const router = useRouter()
  const { supabase, refreshUser, user } = useSupabase()
  const { config, setMode } = useThemeConfig()
  const theme = useTheme()

  // State for collapsible 'Cadastros' group
  const isCadastrosActive = pathname?.startsWith('/cadastros')
  const [cadastrosOpen, setCadastrosOpen] = useState(true)

  useEffect(() => {
    if (isCadastrosActive) {
      setCadastrosOpen(true)
    }
  }, [isCadastrosActive])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      await refreshUser()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleTheme = () => {
    setMode(config.mode === 'light' ? 'dark' : 'light')
  }

  // Definição dos módulos principais
  const primaryNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
  ]

  const financialNavItems: NavItem[] = [
    {
      label: 'Lançamentos',
      href: '/financeiro',
      icon: <DollarSign size={20} />,
    },
    {
      label: 'Prestação de Contas',
      href: '/prestacao',
      icon: <FileSpreadsheet size={20} />,
    },
    {
      label: 'Cotação de Moedas',
      href: '/cotacao',
      icon: <TrendingUp size={20} />,
    },
  ]

  const cadastrosSubItems: NavItem[] = [
    { label: 'Visão Geral', href: '/cadastros', icon: <Database size={18} /> },
    { label: 'Clientes', href: '/cadastros/clientes', icon: <Users size={18} /> },
    { label: 'Fornecedores', href: '/cadastros/fornecedores', icon: <Building2 size={18} /> },
    { label: 'Contas Bancárias', href: '/cadastros/contas', icon: <Wallet size={18} /> },
    { label: 'Categorias', href: '/cadastros/categorias', icon: <Tags size={18} /> },
    { label: 'Formas de Pagamento', href: '/cadastros/formas-pagamento', icon: <CreditCard size={18} /> },
    { label: 'Centros de Custo', href: '/cadastros/centros-custos', icon: <PieChart size={18} /> },
    { label: 'Empresas', href: '/cadastros/empresas', icon: <Building2 size={18} /> },
    { label: 'Plano de Contas', href: '/cadastros/plano-contas', icon: <BookOpen size={18} /> },
  ]

  const adminNavItems: NavItem[] = [
    {
      label: 'Usuários & Permissões',
      href: '/acesso',
      icon: <ShieldCheck size={20} />,
    },
    {
      label: 'Configurações',
      href: '/configuracao',
      icon: <Settings size={20} />,
      badge: 'Visual',
      badgeColor: 'primary',
    },
  ]

  const isRouteActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/cadastros') return pathname === '/cadastros'
    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  const renderNavItem = (item: NavItem, isSubItem: boolean = false) => {
    const active = isRouteActive(item.href)

    return (
      <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          component={Link}
          href={item.href}
          onClick={closeMobile}
          selected={active}
          sx={{
            py: isSubItem ? 0.75 : 1,
            px: isSubItem ? 2 : 1.75,
            pl: isSubItem ? 4 : 1.75,
            borderRadius: `${config.borderRadius}px`,
            position: 'relative',
            color: active ? 'primary.main' : 'text.primary',
            fontWeight: active ? 600 : 400,
            bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
            '&:hover': {
              bgcolor: active
                ? alpha(theme.palette.primary.main, 0.14)
                : alpha(theme.palette.action.hover, 0.06),
            },
            '&.Mui-selected': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.16),
              },
            },
          }}
        >
          {active && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: '15%',
                bottom: '15%',
                width: 3.5,
                borderRadius: '0 4px 4px 0',
                bgcolor: 'primary.main',
              }}
            />
          )}

          <ListItemIcon
            sx={{
              minWidth: isSubItem ? 32 : 38,
              color: active ? 'primary.main' : 'text.secondary',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {item.icon}
          </ListItemIcon>

          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: isSubItem ? '0.85rem' : '0.9rem',
              fontWeight: active ? 600 : 500,
            }}
          />

          {item.badge && (
            <Chip
              label={item.badge}
              size="small"
              color={item.badgeColor || 'default'}
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
            />
          )}
        </ListItemButton>
      </ListItem>
    )
  }

  const drawerContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.25,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              width: 40,
              height: 40,
              borderRadius: `${config.borderRadius}px`,
              fontWeight: 700,
              boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            T
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                TRENCH
              </Typography>
              <Chip
                label="v1.0"
                size="small"
                variant="outlined"
                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, borderColor: 'divider' }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              Gestão Financeira & Contas
            </Typography>
          </Box>
        </Box>

        {/* Empresa Ativa Selector / Badge */}
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: `${config.borderRadius}px`,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>
              Trench Holding S/A
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
            Matriz
          </Typography>
        </Box>
      </Box>

      {/* Main Navigation List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 1.5,
          py: 1.5,
          '&::-webkit-scrollbar': { width: 5 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.divider, 0.5),
            borderRadius: 4,
          },
        }}
      >
        {/* Módulo Principal */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            px: 1.5,
            py: 0.5,
            display: 'block',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.68rem',
          }}
        >
          Visão Geral
        </Typography>
        <List disablePadding sx={{ mb: 1.5 }}>
          {primaryNavItems.map((item) => renderNavItem(item))}
        </List>

        <Divider sx={{ my: 1, opacity: 0.6 }} />

        {/* Módulo Financeiro */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            px: 1.5,
            py: 0.5,
            display: 'block',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.68rem',
          }}
        >
          Financeiro & Operações
        </Typography>
        <List disablePadding sx={{ mb: 1.5 }}>
          {financialNavItems.map((item) => renderNavItem(item))}
        </List>

        <Divider sx={{ my: 1, opacity: 0.6 }} />

        {/* Módulo Cadastros (Expansível / Colapsável) */}
        <Box sx={{ mb: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 0.5,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.68rem',
              }}
            >
              Cadastros Mestres
            </Typography>
            <Chip
              label="8 entidades"
              size="small"
              sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha(theme.palette.divider, 0.4) }}
            />
          </Box>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => setCadastrosOpen(!cadastrosOpen)}
              selected={isCadastrosActive}
              sx={{
                py: 1,
                px: 1.75,
                borderRadius: `${config.borderRadius}px`,
                bgcolor: isCadastrosActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.06),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: isCadastrosActive ? 'primary.main' : 'text.secondary' }}>
                <Database size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Cadastros"
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isCadastrosActive ? 600 : 500,
                  color: isCadastrosActive ? 'primary.main' : 'text.primary',
                }}
              />
              {cadastrosOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={cadastrosOpen} timeout="auto" unmountOnExit>
            <List disablePadding component="div">
              {cadastrosSubItems.map((item) => renderNavItem(item, true))}
            </List>
          </Collapse>
        </Box>

        <Divider sx={{ my: 1, opacity: 0.6 }} />

        {/* Módulo Sistema & Configurações */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            px: 1.5,
            py: 0.5,
            display: 'block',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.68rem',
          }}
        >
          Administração
        </Typography>
        <List disablePadding>
          {adminNavItems.map((item) => renderNavItem(item))}
        </List>
      </Box>

      {/* Footer Controls */}
      <Divider />
      <Box sx={{ p: 1.75, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Botão de Alternância de Tema */}
        <ListItemButton
          onClick={toggleTheme}
          sx={{
            borderRadius: `${config.borderRadius}px`,
            py: 1,
            px: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
              {config.mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </ListItemIcon>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {config.mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </Typography>
          </Box>
          <Chip
            label={config.mode === 'light' ? 'Claro' : 'Escuro'}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </ListItemButton>

        {/* Perfil de Usuário & Botão Logout */}
        <Box
          sx={{
            pt: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'secondary.main',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                {user?.email?.split('@')[0] || 'Administrador'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                Admin Geral
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Encerrar Sessão">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{
                color: 'error.main',
                bgcolor: alpha(theme.palette.error.main, 0.08),
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.16),
                },
              }}
            >
              <LogOut size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Botão de Menu Flutuante para Dispositivos Móveis (xs / sm) */}
      <IconButton
        onClick={() => setInternalMobileOpen(true)}
        aria-label="Abrir menu de navegação"
        sx={{
          position: 'fixed',
          top: 14,
          left: 14,
          zIndex: 1250,
          display: { xs: 'flex', md: 'none' },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 3,
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'background.paper',
          },
        }}
      >
        <Menu size={20} />
      </IconButton>

      {/* Drawer Móvel / Temporário (< md) */}
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: 1300,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            boxShadow: 8,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer Fixo Permanente no Desktop (>= md / 280px) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'fixed',
            height: '100vh',
            top: 0,
            left: 0,
            zIndex: 1100,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  )
}
