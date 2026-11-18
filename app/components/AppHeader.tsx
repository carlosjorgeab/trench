'use client'

import React from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Chip,
  Button,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  Menu,
  Moon,
  Sun,
  Search,
  Bell,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { useThemeConfig } from '../lib/theme-config-context'

interface AppHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
  onMobileMenuOpen?: () => void
}

export function AppHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  onMobileMenuOpen,
}: AppHeaderProps) {
  const theme = useTheme()
  const { config, toggleMode } = useThemeConfig()

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1050,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: { xs: 2, sm: 3 },
        py: 1.75,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        backdropFilter: 'blur(8px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
      }}
    >
      {/* Esquerda: Botão Menu Mobile + Breadcrumb + Título */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
        {onMobileMenuOpen && (
          <IconButton
            onClick={onMobileMenuOpen}
            edge="start"
            aria-label="Abrir menu"
            sx={{
              display: { xs: 'flex', md: 'none' },
              color: 'text.primary',
            }}
          >
            <Menu size={20} />
          </IconButton>
        )}

        <Box sx={{ minWidth: 0 }}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs
              separator={<ChevronRight size={14} />}
              aria-label="breadcrumb"
              sx={{ mb: 0.25, '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}
            >
              {breadcrumbs.map((bc, idx) => (
                <Typography
                  key={idx}
                  variant="caption"
                  color={idx === breadcrumbs.length - 1 ? 'primary.main' : 'text.secondary'}
                  sx={{
                    fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
                    fontSize: '0.75rem',
                  }}
                >
                  {bc.label}
                </Typography>
              ))}
            </Breadcrumbs>
          )}

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              fontSize: { xs: '1.25rem', sm: '1.45rem' },
            }}
            noWrap
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Direita: Busca, Alternador de Tema, Notificações, Ações Customizadas */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, ml: 'auto' }}>
        {/* Alternador Rápido de Tema (Claro / Escuro) */}
        <Tooltip title={config.mode === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}>
          <IconButton
            onClick={toggleMode}
            size="small"
            sx={{
              p: 1,
              borderRadius: `${config.borderRadius}px`,
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {config.mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </IconButton>
        </Tooltip>

        {/* Notificações */}
        <Tooltip title="Notificações">
          <IconButton
            size="small"
            sx={{
              p: 1,
              borderRadius: `${config.borderRadius}px`,
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <Bell size={18} />
          </IconButton>
        </Tooltip>

        {/* Ações Específicas da Página */}
        {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
      </Box>
    </Box>
  )
}
