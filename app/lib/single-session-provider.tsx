'use client'

import { ReactNode, useEffect } from 'react'
import { useThemeConfig } from './theme-config-context'
import { useSingleSession } from './single-session-hook'

interface SingleSessionProviderProps {
  children: ReactNode
}

export function SingleSessionProvider({ children }: SingleSessionProviderProps) {
  const { config } = useThemeConfig()
  const { validateSession, registerSession } = useSingleSession(config.enableSingleSession)

  // O hook já gerencia o registro e validação automática via useEffect interno
  // Este provider apenas garante que o hook seja inicializado no contexto correto

  return <>{children}</>
}