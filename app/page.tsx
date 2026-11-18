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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #1565C0 0%, #0D47A1 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Círculos decorativos de fundo */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />

      {/* Conteúdo Central */}
      <div
        style={{
          textAlign: 'center',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0px',
        }}
      >
        {/* Logo SVG */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            marginBottom: '28px',
            animation: 'splashPulse 2s ease-in-out infinite',
          }}
        >
          <img
            src="/logo.svg"
            alt="TRENCH Logo"
            width={120}
            height={120}
            style={{ display: 'block' }}
          />
        </div>

        {/* Nome do Sistema */}
        <h1
          style={{
            margin: '0 0 6px 0',
            fontSize: '3rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            fontFamily: 'Inter, Roboto, sans-serif',
            lineHeight: 1,
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}
        >
          TRENCH
        </h1>

        {/* Badge Enterprise */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '20px',
            padding: '4px 14px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.95)',
              textTransform: 'uppercase',
              fontFamily: 'Inter, Roboto, sans-serif',
            }}
          >
            Enterprise · Gestão Financeira
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            margin: '0 0 36px 0',
            fontSize: '1.05rem',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.75)',
            fontFamily: 'Inter, Roboto, sans-serif',
            letterSpacing: '0.01em',
          }}
        >
          Controle financeiro para grupos corporativos e holdings
        </p>

        {/* Spinner de carregamento */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.2)',
              borderTopColor: '#FFD54F',
              borderRadius: '50%',
              animation: 'splashSpin 0.9s linear infinite',
            }}
          />
          <span
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.55)',
              fontFamily: 'Inter, Roboto, sans-serif',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Carregando...
          </span>
        </div>

        {/* Badges de conformidade */}
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['✓ BACEN', '✓ LGPD', '✓ TLS 1.3'].map((badge) => (
            <span
              key={badge}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Inter, Roboto, sans-serif',
                letterSpacing: '0.05em',
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Keyframes via style tag */}
      <style>{`
        @keyframes splashSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
          50%       { transform: scale(1.04); box-shadow: 0 24px 72px rgba(0,0,0,0.45); }
        }
      `}</style>
    </div>
  )
}
