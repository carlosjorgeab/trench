'use client'

import React, { useState } from 'react'
import { Box } from '@mui/material'
import { Sidebar, SIDEBAR_WIDTH } from './sidebar'
import { AppHeader } from './AppHeader'

interface AppShellProps {
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
  children: React.ReactNode
}

export function AppShell({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Barra Lateral Fixa (280px) */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Conteúdo Principal com Recuo Fixo de 280px no Desktop */}
      <Box
        sx={{
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          bgcolor: 'background.default',
          transition: 'margin-left 0.2s ease-in-out',
        }}
      >
        {/* Cabeçalho Superior Fluido e Responsivo */}
        <AppHeader
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          actions={actions}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />

        {/* Área de Conteúdo da Página */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
