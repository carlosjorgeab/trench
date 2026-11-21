'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, InputAdornment,
  IconButton, FormControlLabel, Checkbox, Divider, Alert, CircularProgress,
  Chip, Tooltip, Paper, Tabs, Tab, useTheme, alpha, MenuItem, Select,
  FormControl, InputLabel,
} from '@mui/material'
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Building2,
  TrendingUp, CreditCard, Moon, Sun, User, CheckCircle2, Phone,
  Briefcase, FileText, AlertCircle,
} from 'lucide-react'
import { useSupabase } from '../../lib/supabase-context'
import { useAppUser } from '../../lib/user-context'
import { useThemeConfig } from '../../lib/theme-config-context'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase, refreshUser } = useSupabase()
  const { refreshAppUser } = useAppUser()
  const { config, toggleMode } = useThemeConfig()
  const theme = useTheme()

  const [modeTab, setModeTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Handle URL query params from OAuth callback
  useEffect(() => {
    const info = searchParams.get('info')
    const error = searchParams.get('error')
    
    if (info === 'solicitacao_criada') {
      setSuccessMessage('Solicitação de cadastro criada! Aguarde a aprovação do administrador.')
      setModeTab('register')
    } else if (info === 'solicitacao_pendente') {
      setErrorMessage('Sua solicitação de cadastro está pendente de aprovação. Aguarde o administrador aprovar.')
    } else if (error === 'conta_inativa') {
      setErrorMessage('Sua conta está inativa. Entre em contato com o administrador.')
    } else if (error === 'solicitacao_rejeitada') {
      setErrorMessage('Sua solicitação de cadastro foi rejeitada. Entre em contato com o administrador.')
    } else if (error === 'oauth_failed') {
      setErrorMessage('Falha na autenticação com Google. Tente novamente.')
    }
  }, [searchParams])

  // Pré-cadastro da empresa
  const [regForm, setRegForm] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    responsavel: '',
    cargo_responsavel: '',
    tipo_empresa: 'filial',
    mensagem: '',
  })

  // ─── Login ───────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) throw signInError

      const authUser = authData.user
      if (!authUser) throw new Error('Usuário não encontrado.')

      // Busca perfil na tabela usuarios
      const appUser = await refreshAppUser(authUser.id)

      if (!appUser) {
        // Verificar se o usuário existe na tabela usuarios mas a empresa está inativa
        const { data: userCheck } = await supabase
          .from('usuarios')
          .select('id, empresa_id')
          .eq('id', authUser.id)
          .maybeSingle()

        if (userCheck) {
          // Busca a empresa separadamente
          let empresaAtiva = false
          if (userCheck.empresa_id) {
            const { data: empresaData } = await supabase
              .from('empresas')
              .select('ativo')
              .eq('id', userCheck.empresa_id)
              .maybeSingle()
            empresaAtiva = empresaData?.ativo === true
          }
          
          if (userCheck.empresa_id && !empresaAtiva) {
            throw new Error('A empresa vinculada ao seu usuário está inativa. Entre em contato com o administrador para reativar a empresa.')
          }
          
          if (!userCheck.empresa_id) {
            throw new Error('Seu usuário não está vinculado a nenhuma empresa. Entre em contato com o administrador.')
          }
        }

        // Usuário autenticado no Supabase mas não cadastrado na tabela usuarios
        // Verificar se há solicitação pendente/aprovada para este email
        const { data: solicitation } = await supabase
          .from('solicitacoes_empresa')
          .select('id, status, empresa_id, user_id')
          .eq('email', authUser.email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (solicitation) {
          if (solicitation.status === 'aprovado' && solicitation.empresa_id) {
            // Criar usuário vinculado à empresa aprovada
            await supabase
              .from('usuarios')
              .insert([{
                id: authUser.id,
                email: authUser.email,
                nome: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Usuário',
                empresa_id: solicitation.empresa_id,
                perfil: 'usuario',
                ativo: true,
              }])

            // Atualizar solicitação com user_id
            if (!solicitation.user_id) {
              await supabase
                .from('solicitacoes_empresa')
                .update({ user_id: authUser.id })
                .eq('id', solicitation.id)
            }

            await refreshAppUser(authUser.id)
            await refreshUser()
            router.push('/dashboard')
            return
          } else if (solicitation.status === 'pendente') {
            throw new Error('Sua solicitação de cadastro está pendente de aprovação. Aguarde o administrador aprovar.')
          } else if (solicitation.status === 'rejeitado') {
            throw new Error('Sua solicitação de cadastro foi rejeitada. Entre em contato com o administrador.')
          }
        }

        // Verificar se é um admin_sistema demo
        if (email.includes('@trench.com')) {
          await refreshUser()
          router.push('/dashboard')
          return
        }
        throw new Error(
          'Seu usuário não está vinculado a nenhuma empresa ativa no sistema. ' +
          'Entre em contato com o administrador.'
        )
      }

      if (!appUser.ativo) {
        throw new Error('Sua conta está inativa. Entre em contato com o administrador.')
      }

      // Se usuário não tem empresa_id, verificar solicitação aprovada
      if (!appUser.empresa_id) {
        const { data: solicitation } = await supabase
          .from('solicitacoes_empresa')
          .select('empresa_id')
          .eq('user_id', authUser.id)
          .eq('status', 'aprovado')
          .maybeSingle()

        if (solicitation?.empresa_id) {
          await supabase
            .from('usuarios')
            .update({ empresa_id: solicitation.empresa_id })
            .eq('id', authUser.id)
          
            await refreshAppUser(authUser.id)
        }
      }

      await refreshUser()
      router.push('/dashboard')
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de autenticação. Verifique os dados informados.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Pré-cadastro da Empresa ─────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!regForm.razao_social || !regForm.email || !regForm.responsavel) {
      setErrorMessage('Preencha os campos obrigatórios: Razão Social, E-mail e Responsável.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/solicitacoes-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      setSuccessMessage(
        '✅ Solicitação enviada com sucesso! O administrador do sistema irá analisar seu cadastro. ' +
        'Você receberá uma confirmação por e-mail assim que a empresa for aprovada.'
      )
      setRegForm({
        razao_social: '', nome_fantasia: '', cnpj: '', email: '', telefone: '',
        responsavel: '', cargo_responsavel: '', tipo_empresa: 'filial', mensagem: '',
      })
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar via Google OAuth.')
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Botão de Tema */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Tooltip title={config.mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}>
          <IconButton
            onClick={toggleMode}
            sx={{
              bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
              boxShadow: 2, p: 1.25, borderRadius: `${config.borderRadius}px`,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
            }}
          >
            {config.mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Container Principal */}
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: { xs: 480, sm: 560, md: 1020, lg: 1140 },
          borderRadius: `${config.borderRadius + 6}px`,
          border: '1px solid', borderColor: 'divider',
          boxShadow: config.mode === 'dark' ? '0 16px 40px rgba(0,0,0,0.5)' : '0 16px 40px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        <Grid container>
          {/* ── PAINEL VISUAL LATERAL ── */}
          <Grid
            item xs={12} md={5} lg={5.2}
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: { md: 4, lg: 5 },
              position: 'relative',
              background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: '#ffffff',
              overflow: 'hidden',
            }}
          >
            {/* Decorações */}
            <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Logo e marca */}
            <Box sx={{ zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: `${config.borderRadius + 2}px`, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', flexShrink: 0, bgcolor: '#1565C0' }}>
                  <img src="/logo.svg" alt="TRENCH Logo" width={56} height={56} style={{ display: 'block' }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>TRENCH</Typography>
                    <Chip label="Enterprise" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block' }}>
                    Gestão Financeira & Prestação de Contas
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Mini Dashboard Preview */}
            <Box sx={{ zIndex: 1, my: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '12px', p: 2, border: '1px solid rgba(255,255,255,0.15)', mb: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                  {[
                    { label: 'Receitas', value: 'R$ 284K', color: '#86EFAC' },
                    { label: 'Despesas', value: 'R$ 97K', color: '#FCA5A5' },
                    { label: 'Saldo', value: 'R$ 187K', color: '#93C5FD' },
                    { label: 'Empresas', value: '12 ativas', color: '#FCD34D' },
                  ].map((kpi) => (
                    <Box key={kpi.label} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '8px', p: 1 }}>
                      <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500, display: 'block' }}>{kpi.label}</Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: kpi.color, fontWeight: 700 }}>{kpi.value}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 36 }}>
                  {[30, 50, 40, 70, 55, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
                    <Box key={i} sx={{ flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0', bgcolor: i === 11 ? '#FFD54F' : 'rgba(255,255,255,0.3)' }} />
                  ))}
                </Box>
                <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', mt: 0.5, textAlign: 'right' }}>
                  Fluxo de Caixa · Últimos 12 meses
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, color: '#fff' }}>
                A plataforma financeira definitiva para grupos corporativos e holdings.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { icon: Building2, title: 'Multi-Empresa Consolidado', desc: 'Estrutura unificada de matriz e filiais com isolamento de dados.' },
                  { icon: TrendingUp, title: 'Fluxo de Caixa & DRE em Tempo Real', desc: 'Acompanhamento automático de receitas, despesas e margens.' },
                  { icon: ShieldCheck, title: 'Segurança & Permissões Granulares', desc: 'Políticas RBAC, controle de acesso e auditoria contábil.' },
                  { icon: CreditCard, title: 'Contas, Caixas & Cartões', desc: 'Conciliação bancária ágil e controle de gastos corporativos.' },
                ].map((feat, idx) => {
                  const Icon = feat.icon
                  return (
                    <Box key={idx} sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
                      <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.25 }}>
                        <Icon size={18} color="#ffffff" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{feat.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>{feat.desc}</Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            </Box>

            {/* Rodapé */}
            <Box sx={{ zIndex: 1, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle2 size={16} color="#86efac" />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Conformidade BACEN & LGPD</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>v1.0.0</Typography>
            </Box>
          </Grid>

          {/* ── PAINEL DE FORMULÁRIO ── */}
          <Grid item xs={12} md={7} lg={6.8}>
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              {/* Logo mobile */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: `${config.borderRadius}px`, overflow: 'hidden', boxShadow: 3, flexShrink: 0, bgcolor: '#1565C0' }}>
                  <img src="/logo.svg" alt="TRENCH Logo" width={44} height={44} style={{ display: 'block' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' }}>TRENCH</Typography>
                  <Typography variant="caption" color="text.secondary">Gestão Financeira</Typography>
                </Box>
              </Box>

              {/* Tabs */}
              <Paper elevation={0} sx={{ bgcolor: alpha(theme.palette.divider, 0.2), p: 0.5, borderRadius: `${config.borderRadius}px`, mb: 3 }}>
                <Tabs
                  value={modeTab}
                  onChange={(_, val) => { setModeTab(val); setErrorMessage(''); setSuccessMessage('') }}
                  variant="fullWidth"
                  sx={{ minHeight: 38, '& .MuiTab-root': { minHeight: 38, py: 0.75, fontWeight: 600, fontSize: '0.88rem', borderRadius: `${config.borderRadius - 2}px`, textTransform: 'none' } }}
                >
                  <Tab label="Entrar na Conta" value="login" />
                  <Tab label="Cadastrar Empresa" value="register" />
                </Tabs>
              </Paper>

              {/* Alertas */}
              {errorMessage && <Alert severity="error" sx={{ mb: 2.5, borderRadius: `${config.borderRadius}px` }}>{errorMessage}</Alert>}
              {successMessage && <Alert severity="success" sx={{ mb: 2.5, borderRadius: `${config.borderRadius}px` }}>{successMessage}</Alert>}

              {/* ── FORMULÁRIO DE LOGIN ── */}
              {modeTab === 'login' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>Bem-vindo de volta</Typography>
                    <Typography variant="body2" color="text.secondary">Acesse o painel financeiro para gerenciar suas empresas e lançamentos.</Typography>
                  </Box>

                  <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField fullWidth size="small" label="E-mail Corporativo *" type="email" placeholder="usuario@empresa.com.br" value={email} onChange={(e) => setEmail(e.target.value)} required InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color={theme.palette.text.secondary} /></InputAdornment> }} />
                    <TextField
                      fullWidth size="small" label="Senha de Acesso *" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Lock size={18} color={theme.palette.text.secondary} /></InputAdornment>,
                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</IconButton></InputAdornment>,
                      }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <FormControlLabel control={<Checkbox size="small" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />} label={<Typography variant="body2">Lembrar meu acesso</Typography>} />
                      <Typography component="a" href="#" onClick={(e) => { e.preventDefault(); alert('Solicite redefinição ao administrador ou verifique seu e-mail corporativo.') }} variant="caption" color="primary.main" sx={{ fontWeight: 600, textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                        Esqueceu a senha?
                      </Typography>
                    </Box>

                    <Button type="submit" variant="contained" fullWidth disabled={loading} endIcon={!loading ? <ArrowRight size={18} /> : null} sx={{ py: 1.25, fontSize: '0.95rem', fontWeight: 700, mt: 1 }}>
                      {loading ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={18} color="inherit" /><span>Validando Acesso...</span></Box> : 'Entrar na Plataforma'}
                    </Button>

                    <Divider sx={{ my: 1.5 }}><Typography variant="caption" color="text.secondary">OU CONTINUE COM</Typography></Divider>

                    <Button type="button" variant="outlined" fullWidth disabled={loading} onClick={handleGoogleLogin}
                      startIcon={<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>}
                      sx={{ py: 1, color: 'text.primary', borderColor: 'divider', fontWeight: 600, '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
                    >
                      Entrar com Google
                    </Button>
                  </Box>
                </>
              )}

              {/* ── FORMULÁRIO DE PRÉ-CADASTRO DE EMPRESA ── */}
              {modeTab === 'register' && !successMessage && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>Solicitar Cadastro de Empresa</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Preencha os dados abaixo. Após a análise e aprovação pelo administrador do sistema, sua empresa será ativada e você poderá cadastrar usuários.
                    </Typography>
                  </Box>

                  {/* Aviso de fluxo */}
                  <Alert severity="info" icon={<AlertCircle size={18} />} sx={{ mb: 3, borderRadius: `${config.borderRadius}px` }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>Como funciona?</Typography>
                    <Typography variant="caption">
                      1. Envie a solicitação → 2. Admin analisa e aprova → 3. Empresa fica ativa → 4. Admin cria seus usuários de acesso
                    </Typography>
                  </Alert>

                  <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField fullWidth size="small" label="Razão Social *" placeholder="Ex: Trench Holding S/A" value={regForm.razao_social} onChange={(e) => setRegForm({ ...regForm, razao_social: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><Building2 size={18} color={theme.palette.text.secondary} /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Nome Fantasia" placeholder="Ex: Trench Finance" value={regForm.nome_fantasia} onChange={(e) => setRegForm({ ...regForm, nome_fantasia: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="CNPJ" placeholder="00.000.000/0001-00" value={regForm.cnpj} onChange={(e) => setRegForm({ ...regForm, cnpj: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><FileText size={18} color={theme.palette.text.secondary} /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="E-mail Corporativo *" type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color={theme.palette.text.secondary} /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Telefone" placeholder="(11) 9 9999-9999" value={regForm.telefone} onChange={(e) => setRegForm({ ...regForm, telefone: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color={theme.palette.text.secondary} /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Nome do Responsável *" placeholder="Ex: Carlos Jorge da Silva" value={regForm.responsavel} onChange={(e) => setRegForm({ ...regForm, responsavel: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color={theme.palette.text.secondary} /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Cargo do Responsável" placeholder="Ex: Diretor Financeiro" value={regForm.cargo_responsavel} onChange={(e) => setRegForm({ ...regForm, cargo_responsavel: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><Briefcase size={18} color={theme.palette.text.secondary} /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Tipo de Empresa</InputLabel>
                          <Select value={regForm.tipo_empresa} label="Tipo de Empresa" onChange={(e) => setRegForm({ ...regForm, tipo_empresa: e.target.value })}>
                            <MenuItem value="matriz">Matriz</MenuItem>
                            <MenuItem value="filial">Filial</MenuItem>
                            <MenuItem value="holding">Holding</MenuItem>
                            <MenuItem value="subsidiaria">Subsidiária</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth size="small" label="Mensagem (opcional)" multiline rows={2} placeholder="Descreva brevemente o uso pretendido do sistema..." value={regForm.mensagem} onChange={(e) => setRegForm({ ...regForm, mensagem: e.target.value })} />
                      </Grid>
                    </Grid>

                    <Button type="submit" variant="contained" fullWidth disabled={loading} endIcon={!loading ? <ArrowRight size={18} /> : null} sx={{ py: 1.25, fontSize: '0.95rem', fontWeight: 700, mt: 1 }}>
                      {loading ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={18} color="inherit" /><span>Enviando Solicitação...</span></Box> : 'Enviar Solicitação de Cadastro'}
                    </Button>

                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      Já tem acesso?{' '}
                      <Typography component="span" variant="caption" color="primary.main" sx={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => setModeTab('login')}>
                        Clique aqui para entrar
                      </Typography>
                    </Typography>
                  </Box>
                </>
              )}

              {/* Rodapé legal */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Protegido por criptografia TLS 1.3 • Ao acessar, você concorda com nossos{' '}
                  <Typography component="span" variant="caption" color="primary.main" sx={{ cursor: 'pointer' }}>Termos</Typography>{' '}e{' '}
                  <Typography component="span" variant="caption" color="primary.main" sx={{ cursor: 'pointer' }}>Privacidade</Typography>.
                </Typography>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Box>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>}>
      <LoginContent />
    </Suspense>
  )
}
