'use client'

import React, { useMemo, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useThemeConfig } from './theme-config-context'

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { config } = useThemeConfig()

  // Injetar variáveis CSS globais para Tailwind, componentes customizados e efeitos de transição
  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    root.setAttribute('data-theme', config.mode)

    // Cores principais
    root.style.setProperty('--md-sys-color-primary', config.primaryColor)
    root.style.setProperty('--md-sys-color-secondary', config.secondaryColor)
    root.style.setProperty('--md-sys-color-background', config.backgroundColor)
    root.style.setProperty('--md-sys-color-surface', config.surfaceColor)
    root.style.setProperty('--md-sys-color-on-background', config.textColor)
    root.style.setProperty('--md-sys-color-on-surface', config.textColor)

    // Variáveis legadas e de compatibilidade
    root.style.setProperty('--accent-primary', config.primaryColor)
    root.style.setProperty('--accent-secondary', config.secondaryColor)
    root.style.setProperty('--accent-background', config.backgroundColor)
    root.style.setProperty('--accent-text', config.textColor)

    // Tipografia e layout
    root.style.setProperty('--app-font-family', config.fontFamily)
    root.style.setProperty('--app-border-radius', `${config.borderRadius}px`)
    root.style.setProperty('--app-spacing-unit', `${config.spacingUnit}px`)
  }, [config])

  const muiTheme = useMemo(() => {
    const isDark = config.mode === 'dark'

    return createTheme({
      palette: {
        mode: config.mode,
        primary: {
          main: config.primaryColor || '#1a73e8',
          contrastText: '#ffffff',
        },
        secondary: {
          main: config.secondaryColor || '#00639b',
          contrastText: '#ffffff',
        },
        background: {
          default: config.backgroundColor || (isDark ? '#0f172a' : '#f8fafc'),
          paper: config.surfaceColor || (isDark ? '#1e293b' : '#ffffff'),
        },
        text: {
          primary: config.textColor || (isDark ? '#f8fafc' : '#1e293b'),
          secondary: isDark ? 'rgba(248, 250, 252, 0.7)' : 'rgba(30, 41, 59, 0.65)',
        },
        divider: config.borderColor || (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'),
      },
      typography: {
        fontFamily: config.fontFamily || 'Roboto, Helvetica, Arial, sans-serif',
        fontSize: config.fontSize || 14,
        h4: {
          fontWeight: 600,
          letterSpacing: '-0.02em',
        },
        h5: {
          fontWeight: 600,
          letterSpacing: '-0.01em',
        },
        h6: {
          fontWeight: 600,
        },
        subtitle1: {
          fontWeight: 500,
        },
        subtitle2: {
          fontWeight: 500,
        },
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: config.borderRadius || 8,
      },
      spacing: (factor: number) => `${(config.spacingUnit || 8) * factor}px`,
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: config.borderRadius || 8,
              boxShadow: 'none',
              padding: '8px 16px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              },
            },
            contained: {
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: (config.borderRadius || 8) + 4,
              border: `1px solid ${config.borderColor || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`,
              backgroundImage: 'none',
              boxShadow: isDark
                ? '0 1px 3px rgba(0,0,0,0.3)'
                : '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: `1px solid ${config.borderColor || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
              backgroundColor: config.surfaceColor || (isDark ? '#1e293b' : '#ffffff'),
              backgroundImage: 'none',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            head: {
              fontWeight: 600,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: config.borderRadius || 8,
              transition: 'background-color 0.15s ease, color 0.15s ease',
            },
          },
        },
      },
    })
  }, [config])

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
