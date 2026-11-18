'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useThemeConfig } from './theme-config-context'

interface ThemeContextType {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  setColors: (colors: ThemeContextType['colors']) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { config, setMode, toggleMode, updateConfig } = useThemeConfig()

  const value: ThemeContextType = {
    theme: config.mode,
    setTheme: (mode: 'light' | 'dark') => setMode(mode),
    toggleTheme: toggleMode,
    colors: {
      primary: config.primaryColor,
      secondary: config.secondaryColor,
      background: config.backgroundColor,
      text: config.textColor,
    },
    setColors: (colors) => {
      updateConfig({
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        backgroundColor: colors.background,
        textColor: colors.text,
      })
    },
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
