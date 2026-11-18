'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'

export interface ThemeConfig {
  mode: 'light' | 'dark'
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
  fontFamily: string
  fontSize: number
  spacingUnit: number
  borderRadius: number
  presetName: string
}

export interface ThemePresets {
  [key: string]: {
    name: string
    description: string
    config: Partial<ThemeConfig>
  }
}

export const THEME_PRESETS: ThemePresets = {
  catppuccin: {
    name: 'TRENCH Kilo / Catppuccin',
    description: 'Tema quente baseado nas especificações do kilo.json',
    config: {
      mode: 'light',
      primaryColor: '#24200E',
      secondaryColor: '#6C757D',
      backgroundColor: '#FAF3EB',
      surfaceColor: '#F5E6D3',
      buttonColor: '#24200E',
      textColor: '#1A1A1A',
      borderColor: '#E6D5C0',
      shadowColor: 'rgba(36, 32, 14, 0.08)',
      panelBg: '#F5E6D3',
      panelBorder: '#E6D5C0',
      panelShadow: '0 2px 6px rgba(36, 32, 14, 0.08)',
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontSize: 14,
      spacingUnit: 8,
      borderRadius: 8,
      presetName: 'catppuccin',
    },
  },
  material: {
    name: 'Material Blue (Padrão)',
    description: 'Design corporativo moderno em tons de azul e ardósia',
    config: {
      mode: 'light',
      primaryColor: '#1a73e8',
      secondaryColor: '#00639b',
      backgroundColor: '#f8fafc',
      surfaceColor: '#ffffff',
      buttonColor: '#1a73e8',
      textColor: '#1e293b',
      borderColor: '#e2e8f0',
      shadowColor: 'rgba(0, 0, 0, 0.06)',
      panelBg: '#ffffff',
      panelBorder: '#e2e8f0',
      panelShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontSize: 14,
      spacingUnit: 8,
      borderRadius: 10,
      presetName: 'material',
    },
  },
  emerald: {
    name: 'Esmeralda Finanças',
    description: 'Focado em negócios e finanças com verde e teal',
    config: {
      mode: 'light',
      primaryColor: '#059669',
      secondaryColor: '#0d9488',
      backgroundColor: '#f0fdf4',
      surfaceColor: '#ffffff',
      buttonColor: '#059669',
      textColor: '#064e3b',
      borderColor: '#d1fae5',
      shadowColor: 'rgba(5, 150, 105, 0.08)',
      panelBg: '#ffffff',
      panelBorder: '#d1fae5',
      panelShadow: '0 1px 3px rgba(5, 150, 105, 0.08)',
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontSize: 14,
      spacingUnit: 8,
      borderRadius: 8,
      presetName: 'emerald',
    },
  },
  purple: {
    name: 'Roxo Corporativo',
    description: 'Visual moderno e elegante com tons de violeta e indigo',
    config: {
      mode: 'light',
      primaryColor: '#7c3aed',
      secondaryColor: '#4f46e5',
      backgroundColor: '#f5f3ff',
      surfaceColor: '#ffffff',
      buttonColor: '#7c3aed',
      textColor: '#2e1065',
      borderColor: '#ede9fe',
      shadowColor: 'rgba(124, 58, 237, 0.08)',
      panelBg: '#ffffff',
      panelBorder: '#ede9fe',
      panelShadow: '0 1px 3px rgba(124, 58, 237, 0.08)',
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontSize: 14,
      spacingUnit: 8,
      borderRadius: 12,
      presetName: 'purple',
    },
  },
  sunset: {
    name: 'Sunset Laranja',
    description: 'Tons vibrantes e acolhedores de laranja e âmbar',
    config: {
      mode: 'light',
      primaryColor: '#ea580c',
      secondaryColor: '#d97706',
      backgroundColor: '#fff7ed',
      surfaceColor: '#ffffff',
      buttonColor: '#ea580c',
      textColor: '#431407',
      borderColor: '#ffedd5',
      shadowColor: 'rgba(234, 88, 12, 0.08)',
      panelBg: '#ffffff',
      panelBorder: '#ffedd5',
      panelShadow: '0 1px 3px rgba(234, 88, 12, 0.08)',
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontSize: 14,
      spacingUnit: 8,
      borderRadius: 8,
      presetName: 'sunset',
    },
  },
  dark: {
    name: 'Dark Elegance',
    description: 'Modo escuro de alto contraste com destaque azul ciano',
    config: {
      mode: 'dark',
      primaryColor: '#38bdf8',
      secondaryColor: '#818cf8',
      backgroundColor: '#0f172a',
      surfaceColor: '#1e293b',
      buttonColor: '#38bdf8',
      textColor: '#f8fafc',
      borderColor: '#334155',
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      panelBg: '#1e293b',
      panelBorder: '#334155',
      panelShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontSize: 14,
      spacingUnit: 8,
      borderRadius: 10,
      presetName: 'dark',
    },
  },
}

export const defaultThemeConfig: ThemeConfig = {
  mode: 'light',
  primaryColor: '#1a73e8',
  secondaryColor: '#00639b',
  backgroundColor: '#f8fafc',
  surfaceColor: '#ffffff',
  borderColor: '#e2e8f0',
  shadowColor: 'rgba(0, 0, 0, 0.06)',
  buttonColor: '#1a73e8',
  textColor: '#1e293b',
  panelBg: '#ffffff',
  panelBorder: '#e2e8f0',
  panelShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  fontSize: 14,
  spacingUnit: 8,
  borderRadius: 8,
  presetName: 'material',
}

interface ThemeConfigContextType {
  config: ThemeConfig
  setConfig: (config: ThemeConfig) => void
  updateConfig: (partial: Partial<ThemeConfig>) => void
  setMode: (mode: 'light' | 'dark') => void
  toggleMode: () => void
  applyPreset: (presetKey: string) => void
  resetToDefault: () => void
  exportConfigJson: () => string
  importConfigJson: (jsonStr: string) => boolean
  presets: ThemePresets
}

const ThemeConfigContext = createContext<ThemeConfigContextType | null>(null)

export function ThemeConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<ThemeConfig>(defaultThemeConfig)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('trench-theme-config')
      if (saved) {
        const parsed = JSON.parse(saved)
        setConfigState((prev) => ({ ...prev, ...parsed }))
      }
    } catch (e) {
      console.error('Error loading theme config from localStorage:', e)
    }
  }, [])

  const updateConfig = useCallback((partial: Partial<ThemeConfig>) => {
    setConfigState((prev) => {
      const newConfig = { ...prev, ...partial }
      try {
        localStorage.setItem('trench-theme-config', JSON.stringify(newConfig))
      } catch (e) {
        console.error('Error saving theme config:', e)
      }
      return newConfig
    })
  }, [])

  const setConfig = useCallback((newConfig: ThemeConfig) => {
    setConfigState(newConfig)
    try {
      localStorage.setItem('trench-theme-config', JSON.stringify(newConfig))
    } catch (e) {
      console.error('Error saving theme config:', e)
    }
  }, [])

  const setMode = useCallback((mode: 'light' | 'dark') => {
    setConfigState((prev) => {
      let bg = prev.backgroundColor
      let surface = prev.surfaceColor
      let text = prev.textColor
      let border = prev.borderColor

      if (mode === 'dark') {
        if (bg === '#f8fafc' || bg === '#ffffff' || bg === '#FAF3EB' || bg === '#f0fdf4' || bg === '#f5f3ff' || bg === '#fff7ed') {
          bg = '#0f172a'
        }
        if (surface === '#ffffff' || surface === '#F5E6D3') {
          surface = '#1e293b'
        }
        text = '#f8fafc'
        border = '#334155'
      } else {
        if (bg === '#0f172a' || bg === '#1a1c1e') {
          bg = '#f8fafc'
        }
        if (surface === '#1e293b' || surface === '#1a1c1e') {
          surface = '#ffffff'
        }
        text = '#1e293b'
        border = '#e2e8f0'
      }

      const updated: ThemeConfig = {
        ...prev,
        mode,
        backgroundColor: bg,
        surfaceColor: surface,
        textColor: text,
        borderColor: border,
        panelBg: surface,
        panelBorder: border,
      }
      try {
        localStorage.setItem('trench-theme-config', JSON.stringify(updated))
      } catch (e) {
        console.error('Error saving theme config:', e)
      }
      return updated
    })
  }, [])

  const toggleMode = useCallback(() => {
    setConfigState((prev) => {
      const newMode = prev.mode === 'light' ? 'dark' : 'light'
      let bg = prev.backgroundColor
      let surface = prev.surfaceColor
      let text = prev.textColor
      let border = prev.borderColor

      if (newMode === 'dark') {
        bg = '#0f172a'
        surface = '#1e293b'
        text = '#f8fafc'
        border = '#334155'
      } else {
        bg = '#f8fafc'
        surface = '#ffffff'
        text = '#1e293b'
        border = '#e2e8f0'
      }

      const updated: ThemeConfig = {
        ...prev,
        mode: newMode,
        backgroundColor: bg,
        surfaceColor: surface,
        textColor: text,
        borderColor: border,
        panelBg: surface,
        panelBorder: border,
      }
      try {
        localStorage.setItem('trench-theme-config', JSON.stringify(updated))
      } catch (e) {
        console.error('Error saving theme config:', e)
      }
      return updated
    })
  }, [])

  const applyPreset = useCallback((presetKey: string) => {
    const preset = THEME_PRESETS[presetKey]
    if (preset) {
      setConfigState((prev) => {
        const updated = {
          ...prev,
          ...preset.config,
          presetName: presetKey,
        }
        try {
          localStorage.setItem('trench-theme-config', JSON.stringify(updated))
        } catch (e) {
          console.error('Error saving preset:', e)
        }
        return updated
      })
    }
  }, [])

  const resetToDefault = useCallback(() => {
    setConfigState(defaultThemeConfig)
    try {
      localStorage.removeItem('trench-theme-config')
    } catch (e) {
      console.error('Error resetting theme config:', e)
    }
  }, [])

  const exportConfigJson = useCallback(() => {
    return JSON.stringify(config, null, 2)
  }, [config])

  const importConfigJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr)
      if (typeof parsed === 'object' && parsed !== null) {
        updateConfig(parsed)
        return true
      }
    } catch (e) {
      console.error('Error parsing imported theme config:', e)
    }
    return false
  }, [updateConfig])

  return (
    <ThemeConfigContext.Provider
      value={{
        config,
        setConfig,
        updateConfig,
        setMode,
        toggleMode,
        applyPreset,
        resetToDefault,
        exportConfigJson,
        importConfigJson,
        presets: THEME_PRESETS,
      }}
    >
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
