'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box, Card, CardContent, Typography, Button, TextField, InputAdornment,
  Alert, CircularProgress, IconButton,
} from '@mui/material'
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle,
  Moon, Sun,
} from 'lucide-react'
import { useSupabase } from '../../lib/supabase-context'
import { useThemeConfig } from '../../lib/theme-config-context'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { config, toggleMode } = useThemeConfig()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [step, setStep] = useState<'verify' | 'reset' | 'done'>('verify')

  useEffect(() => {
    const code = searchParams.get('code') || searchParams.get('access_token')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      setErrorMessage(errorDescription || 'Erro ao redefinir senha. Tente novamente.')
      setStep('verify')
      return
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error: sessionError }) => {
        if (sessionError || !data?.user) {
          setErrorMessage('Não foi possível validar o link de recuperação. Solicite um novo.')
          setStep('verify')
          return
        }
        setStep('reset')
      })
    }
  }, [searchParams, supabase])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      setStep('done')
      setSuccessMessage('Sua senha foi redefinida com sucesso! Você será redirecionado para o login.')
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao redefinir senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/auth/login')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Button variant="text" size="small" onClick={toggleMode}>
          {config.mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
      </Box>

      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          borderRadius: `${config.borderRadius + 6}px`,
          border: '1px solid', borderColor: 'divider',
          boxShadow: config.mode === 'dark' ? '0 16px 40px rgba(0,0,0,0.5)' : '0 16px 40px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
          {step === 'verify' && (
            <>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'warning.light',
                    color: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <AlertCircle size={32} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Redefinição de Senha
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Informe seu e-mail corporativo para receber um link de redefinição.
                </Typography>
              </Box>

              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="E-mail Corporativo *"
                  type="email"
                  placeholder="usuario@empresa.com.br"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Mail size={18} color="text.secondary" /></InputAdornment>,
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  endIcon={!loading ? <ArrowRight size={18} /> : null}
                  sx={{ py: 1.25, fontSize: '0.95rem', fontWeight: 700, mt: 1 }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} color="inherit" />
                      <span>Enviando Link...</span>
                    </Box>
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </Button>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleBackToLogin}
                  sx={{ color: 'text.secondary' }}
                >
                  ← Voltar ao Login
                </Button>
              </Box>
            </>
          )}

          {step === 'reset' && (
            <>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <CheckCircle2 size={32} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Nova Senha
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Crie uma nova senha para acessar sua conta.
                </Typography>
              </Box>

              {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
              {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

              <Box component="form" onSubmit={handleReset} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nova Senha *"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock size={18} color="text.secondary" /></InputAdornment>,
                    endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</IconButton></InputAdornment>,
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Confirmar Nova Senha *"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock size={18} color="text.secondary" /></InputAdornment>,
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  endIcon={!loading ? <ArrowRight size={18} /> : null}
                  sx={{ py: 1.25, fontSize: '0.95rem', fontWeight: 700, mt: 1 }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} color="inherit" />
                      <span>Redefinindo...</span>
                    </Box>
                  ) : (
                    'Redefinir Senha'
                  )}
                </Button>
              </Box>
            </>
          )}

          {step === 'done' && (
            <>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <CheckCircle2 size={40} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Senha Redefinida com Sucesso!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Você será redirecionado para a tela de login em instantes.
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleBackToLogin}
                  sx={{ py: 1, fontSize: '0.95rem', fontWeight: 700 }}
                >
                  Ir para o Login
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
