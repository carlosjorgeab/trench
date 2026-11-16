'use client'

import { useEffect } from 'react'
import { useSupabase } from './lib/supabase-context'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, refreshUser } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      await refreshUser()
    }
    checkUser()
  }, [refreshUser])

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">TRENCH</h1>
        <p className="text-gray-600">Sistema Financeiro e Prestação de Contas</p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}