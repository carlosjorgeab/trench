'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useSupabase } from './supabase-context'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://msrpgopzmmntyigbcaug.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_lEMK5C0K1K24N4QmspsOGA_57Msiht4'

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)

interface SessionValidationResult {
  valid: boolean
  session: {
    id: string
    is_active: boolean
    session_id: string
  } | null
}

export function useSingleSession(enabled: boolean = true) {
  const router = useRouter()
  const { user, refreshUser } = useSupabase()
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isValidatingRef = useRef(false)

  const validateSession = useCallback(async () => {
    if (!user || !enabled || isValidatingRef.current) return

    isValidatingRef.current = true

    try {
      // Obter o session_id atual do Supabase
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session?.access_token) {
        isValidatingRef.current = false
        return
      }

      const sessionId = session.access_token.split('.')[0] // Usar parte do token como identificador

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          session_id: sessionId,
          action: 'validate',
        }),
      })

      const json = await res.json()
      
      if (json.success && json.data && !json.data.valid) {
        // Sessão inválida - fazer logout
        await supabaseClient.auth.signOut({ scope: 'global' })
        router.push('/auth/login?error=sessao_revogada')
      }
    } catch (error) {
      console.error('Erro ao validar sessão única:', error)
    } finally {
      isValidatingRef.current = false
    }
  }, [user, enabled, router])

  const registerSession = useCallback(async (deviceInfo?: string) => {
    if (!user || !enabled) return

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session?.access_token) return

      const sessionId = session.access_token.split('.')[0]

      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          session_id: sessionId,
          device_info: deviceInfo || navigator.userAgent,
          action: 'register',
        }),
      })
    } catch (error) {
      console.error('Erro ao registrar sessão:', error)
    }
  }, [user, enabled])

  useEffect(() => {
    if (!enabled) return

    // Registrar sessão ao fazer login
    if (user) {
      registerSession()
    }

    // Validar sessão periodicamente (a cada 30 segundos)
    validationIntervalRef.current = setInterval(() => {
      validateSession()
    }, 30000)

    // Validar também quando a janela ganha foco
    const handleFocus = () => validateSession()
    window.addEventListener('focus', handleFocus)

    return () => {
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current)
      }
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, enabled, registerSession, validateSession])

  return { validateSession, registerSession }
}