'use client'

import { ReactNode } from 'react'
import { SupabaseProvider } from './lib/supabase-context'
import { ThemeProvider } from './lib/theme-context'
import { ThemeConfigProvider } from './lib/theme-config-context'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './globals.css'

interface RootLayoutProps {
  children: ReactNode
}

const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8',
    },
    secondary: {
      main: '#00639b',
    },
  },
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
})

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TRENCH - Sistema Financeiro</title>
        <meta name="description" content="Sistema Financeiro e Prestação de Contas" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          <ThemeProvider>
            <ThemeConfigProvider>
              <SupabaseProvider>
                {children}
              </SupabaseProvider>
            </ThemeConfigProvider>
          </ThemeProvider>
        </MuiThemeProvider>
      </body>
    </html>
  )
}
