'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export interface AppCompany {
  id: number
  nome: string
  tipo: string | null
  principal: boolean
}

export interface AppUser {
  id: string
  auth_id: string
  nome: string
  email: string
  perfil: 'admin_sistema' | 'admin_empresa' | 'gestor' | 'analista' | 'usuario' | 'admin'
  empresa_id: number | null
  empresa_nome: string | null
  empresa_tipo: string | null
  empresas?: AppCompany[]
  ativo: boolean
  isSystemAdmin?: boolean
}

interface UserContextType {
  appUser: AppUser | null
  loadingAppUser: boolean
  refreshAppUser: (authId: string) => Promise<AppUser | null>
  switchCompany: (authId: string, companyId: number) => Promise<AppUser | null>
  clearAppUser: () => void
}

const UserContext = createContext<UserContextType | null>(null)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://msrpgopzmmntyigbcaug.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_lEMK5C0K1K24N4QmspsOGA_57Msiht4'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export function UserProvider({ children }: { children: ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loadingAppUser, setLoadingAppUser] = useState(false)

  const refreshAppUser = useCallback(async (authId: string): Promise<AppUser | null> => {
    if (!authId) {
      setAppUser(null)
      return null
    }
    setLoadingAppUser(true)
    try {
      const res = await fetch(`/api/auth/me?id=${encodeURIComponent(authId)}`)
      if (!res.ok) {
        setAppUser(null)
        return null
      }
      const json = await res.json()
      if (!json.success || !json.data) {
        setAppUser(null)
        return null
      }
      setAppUser(json.data)
      return json.data
    } catch {
      setAppUser(null)
      return null
    } finally {
      setLoadingAppUser(false)
    }
  }, [])

  const switchCompany = useCallback(async (authId: string, companyId: number): Promise<AppUser | null> => {
    if (!authId || !companyId) return null
    setLoadingAppUser(true)
    try {
      const res = await fetch('/api/usuarios/empresa-ativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: authId, empresa_id: companyId }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) return null
      return await refreshAppUser(authId)
    } catch {
      return null
    } finally {
      setLoadingAppUser(false)
    }
  }, [refreshAppUser])

  // Auto-refresh appUser when Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await refreshAppUser(session.user.id)
      } else {
        setAppUser(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [refreshAppUser])

  // Initial load: check for existing session
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        refreshAppUser(user.id)
      }
    })
  }, [refreshAppUser])

  const clearAppUser = useCallback(() => setAppUser(null), [])

  return (
    <UserContext.Provider value={{ appUser, loadingAppUser, refreshAppUser, switchCompany, clearAppUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useAppUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useAppUser must be used within UserProvider')
  return ctx
}
