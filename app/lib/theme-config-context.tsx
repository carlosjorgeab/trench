'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  surfaceColor: string
  borderColor: string
  shadowColor: string
  buttonColor: string
  textColor: string
  panelBg: string
  panelBorder: string
  panelShadow: string
}

interface ThemeConfigContextType {
  config: ThemeConfig
  setConfig: (config: ThemeConfig) => void
  updateConfig: (partial: Partial<ThemeConfig>) => void
  resetToDefault: () => void
}

const defaultConfig: ThemeConfig = {
  primaryColor: '#1a73e8',
  secondaryColor: '#00639b',
  backgroundColor: '#f5f5f7',
  surfaceColor: '#ffffff',
  borderColor: '#e0e0e0',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  buttonColor: '#1a73e8',
  textColor: '#1a1a1a',
  panelBg: '#ffffff',
  panelBorder: '#e0e0e0',
  panelShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}

const ThemeConfigContext = createContext<ThemeConfigContextType | null>(null)

export function ThemeConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig)

  useEffect(() => {
    const saved = localStorage.getItem('trench-theme-config')
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading theme config:', e)
      }
    }
  }, [])

  const updateConfig = (partial: Partial<ThemeConfig>) => {
    const newConfig = { ...config, ...partial }
    setConfig(newConfig)
    localStorage.setItem('trench-theme-config', JSON.stringify(newConfig))
  }

  const resetToDefault = () => {
    setConfig(defaultConfig)
    localStorage.removeItem('trench-theme-config')
  }

  return (
    <ThemeConfigContext.Provider value={{ config, setConfig: updateConfig, updateConfig, resetToDefault }}>
      {children}
    </ThemeConfigContext.Provider>
  )
}

export function useThemeConfig() {
  const context = useContext(ThemeConfigContext)
  if (!context) {
    throw new Error('useThemeConfig must be used within ThemeConfigProvider')
  }
  return context
}
