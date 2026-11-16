'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  setColors: (colors: ThemeContextType['colors']) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const defaultColors = {
  primary: '#3b82f6',
  secondary: '#14b8a6',
  background: '#ffffff',
  text: '#1a1a1a',
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [colors, setColors] = useState(defaultColors)

  useEffect(() => {
    const savedTheme = localStorage.getItem('trench-theme') as 'light' | 'dark' | null
    const savedColors = localStorage.getItem('trench-colors')
    
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
    if (savedColors) {
      setColors(JSON.parse(savedColors))
    }
  }, [])

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('trench-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleSetColors = (newColors: ThemeContextType['colors']) => {
    setColors(newColors)
    localStorage.setItem('trench-colors', JSON.stringify(newColors))
    Object.entries(newColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--accent-${key}`, value)
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, colors, setColors: handleSetColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}