'use client'

import { ReactNode } from 'react'
import { SupabaseProvider } from './lib/supabase-context'
import { ThemeConfigProvider } from './lib/theme-config-context'
import { ThemeProvider } from './lib/theme-context'
import { AppThemeProvider } from './lib/app-theme-provider'
import { UserProvider } from './lib/user-context'
import './globals.css'

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TRENCH - Sistema Financeiro e Gestão de Contas</title>
        <meta name="description" content="Sistema Financeiro, Gestão Multi-Empresa e Prestação de Contas" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeConfigProvider>
          <ThemeProvider>
            <AppThemeProvider>
              <SupabaseProvider>
                <UserProvider>
                  {children}
                </UserProvider>
              </SupabaseProvider>
            </AppThemeProvider>
          </ThemeProvider>
        </ThemeConfigProvider>
      </body>
    </html>
  )
}
