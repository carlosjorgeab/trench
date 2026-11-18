'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '../components/AppShell'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Chip,
  Alert,
  Snackbar,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
  alpha,
} from '@mui/material'
import { useThemeConfig, THEME_PRESETS, ThemeConfig } from '../lib/theme-config-context'
import {
  Palette,
  Settings,
  Type,
  LayoutGrid,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Copy,
  Moon,
  Sun,
  Eye,
  Sliders,
  DollarSign,
  TrendingUp,
} from 'lucide-react'

export default function ConfiguracaoPage() {
  const {
    config,
    updateConfig,
    setConfig,
    setMode,
    applyPreset,
    resetToDefault,
    exportConfigJson,
    importConfigJson,
    presets,
  } = useThemeConfig()

  const theme = useTheme()
  const [localConfig, setLocalConfig] = useState<ThemeConfig>(config)
  const [activeTab, setActiveTab] = useState(0)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleApplyPreset = (presetKey: string) => {
    applyPreset(presetKey)
    const preset = presets[presetKey]
    if (preset) {
      setLocalConfig((prev) => ({ ...prev, ...preset.config, presetName: presetKey }))
      setSnackbarMessage(`Tema "${preset.name}" aplicado com sucesso!`)
      setSnackbarOpen(true)
    }
  }

  const handleSave = () => {
    updateConfig(localConfig)
    setSnackbarMessage('Configurações visuais salvas com sucesso!')
    setSnackbarOpen(true)
  }

  const handleReset = () => {
    resetToDefault()
    setSnackbarMessage('Tema restaurado para os padrões do sistema!')
    setSnackbarOpen(true)
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportConfigJson())
    setSnackbarMessage('JSON de configuração copiado para a área de transferência!')
    setSnackbarOpen(true)
  }

  const fontOptions = [
    { label: 'Roboto (Padrão Material)', value: 'Roboto, Helvetica, Arial, sans-serif' },
    { label: 'Inter (UI Moderna)', value: 'Inter, system-ui, -apple-system, sans-serif' },
    { label: 'Plus Jakarta Sans (Corporativo)', value: '"Plus Jakarta Sans", sans-serif' },
    { label: 'Poppins (Geométrico)', value: 'Poppins, sans-serif' },
    { label: 'Sistema Nativo (System UI)', value: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' },
  ]

  const colorFields: { key: keyof ThemeConfig; label: string; desc: string }[] = [
    { key: 'primaryColor', label: 'Cor Primária', desc: 'Botões principais, links ativos e destaques visuais' },
    { key: 'secondaryColor', label: 'Cor Secundária', desc: 'Acentos secundários, tags e detalhes' },
    { key: 'backgroundColor', label: 'Plano de Fundo (App)', desc: 'Cor do fundo principal da tela' },
    { key: 'surfaceColor', label: 'Superfície de Cards/Paineis', desc: 'Fundo dos cards, tabelas e menus' },
    { key: 'textColor', label: 'Cor do Texto Principal', desc: 'Tipografia de títulos e parágrafos' },
    { key: 'borderColor', label: 'Bordas e Divisores', desc: 'Linhas divisórias e contornos de cards' },
  ]

  return (
    <AppShell
      title="Configurações do Sistema"
      subtitle="Personalização visual de temas, cores, fontes, densidade e espaçamento"
      breadcrumbs={[
        { label: 'Início', href: '/dashboard' },
        { label: 'Configurações' },
      ]}
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RotateCcw size={16} />}
            onClick={handleReset}
            size="small"
          >
            Restaurar
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={16} />}
            onClick={handleSave}
            size="small"
          >
            Salvar
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Banner com Indicador do Tema Atual */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: `${config.borderRadius}px`,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: `${config.borderRadius}px`,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Palette size={24} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Personalização Visual TRENCH
                </Typography>
                <Chip
                  label={config.mode === 'light' ? 'Modo Claro' : 'Modo Escuro'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Configure a paleta de cores, tipografia, bordas e espaçamento conforme a identidade visual da sua empresa.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Copy size={16} />}
              onClick={handleCopyJson}
            >
              Copiar Configuração JSON
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Coluna Principal: Seletor de Abas e Opções */}
          <Grid item xs={12} lg={7}>
            <Card elevation={0}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, val) => setActiveTab(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab icon={<Sparkles size={18} />} iconPosition="start" label="Temas Prontos" />
                  <Tab icon={<Palette size={18} />} iconPosition="start" label="Cores Customizadas" />
                  <Tab icon={<Type size={18} />} iconPosition="start" label="Fontes" />
                  <Tab icon={<LayoutGrid size={18} />} iconPosition="start" label="Espaçamento & Bordas" />
                </Tabs>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {/* ABA 0: Temas Prontos (Presets) */}
                {activeTab === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Modo de Exibição
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Alterne entre o modo diurno e noturno do sistema.
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper
                            onClick={() => {
                              setMode('light')
                              setLocalConfig((prev) => ({ ...prev, mode: 'light' }))
                            }}
                            elevation={0}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              borderRadius: `${config.borderRadius}px`,
                              border: '2px solid',
                              borderColor: config.mode === 'light' ? 'primary.main' : 'divider',
                              bgcolor: config.mode === 'light' ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: 'primary.main' },
                            }}
                          >
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: '50%',
                                bgcolor: 'amber.100',
                                color: 'warning.main',
                                display: 'flex',
                              }}
                            >
                              <Sun size={20} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Modo Claro
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Padrão diurno de alta legibilidade
                              </Typography>
                            </Box>
                            {config.mode === 'light' && <Check size={18} color={theme.palette.primary.main} />}
                          </Paper>
                        </Grid>

                        <Grid item xs={6}>
                          <Paper
                            onClick={() => {
                              setMode('dark')
                              setLocalConfig((prev) => ({ ...prev, mode: 'dark' }))
                            }}
                            elevation={0}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              borderRadius: `${config.borderRadius}px`,
                              border: '2px solid',
                              borderColor: config.mode === 'dark' ? 'primary.main' : 'divider',
                              bgcolor: config.mode === 'dark' ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: 'primary.main' },
                            }}
                          >
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: '50%',
                                bgcolor: 'slate.800',
                                color: 'primary.main',
                                display: 'flex',
                              }}
                            >
                              <Moon size={20} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Modo Escuro
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Conforto visual para ambientes escuros
                              </Typography>
                            </Box>
                            {config.mode === 'dark' && <Check size={18} color={theme.palette.primary.main} />}
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Paletas Pré-definidas
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Selecione um tema pré-configurado para aplicar cores e estilos instantaneamente.
                      </Typography>

                      <Grid container spacing={2}>
                        {Object.entries(presets).map(([key, item]) => {
                          const isSelected = config.presetName === key
                          return (
                            <Grid item xs={12} sm={6} key={key}>
                              <Paper
                                onClick={() => handleApplyPreset(key)}
                                elevation={0}
                                sx={{
                                  p: 2,
                                  cursor: 'pointer',
                                  borderRadius: `${config.borderRadius}px`,
                                  border: '2px solid',
                                  borderColor: isSelected ? 'primary.main' : 'divider',
                                  bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 2,
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {item.name}
                                  </Typography>
                                  {isSelected && <Check size={18} color={theme.palette.primary.main} />}
                                </Box>

                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                  {item.description}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      bgcolor: item.config.primaryColor,
                                      border: '1px solid rgba(0,0,0,0.1)',
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      bgcolor: item.config.secondaryColor,
                                      border: '1px solid rgba(0,0,0,0.1)',
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      bgcolor: item.config.surfaceColor,
                                      border: '1px solid rgba(0,0,0,0.1)',
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      bgcolor: item.config.backgroundColor,
                                      border: '1px solid rgba(0,0,0,0.1)',
                                    }}
                                  />
                                </Box>
                              </Paper>
                            </Grid>
                          )
                        })}
                      </Grid>
                    </Box>
                  </Box>
                )}

                {/* ABA 1: Cores Customizadas */}
                {activeTab === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Personalização Fina de Cores
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ajuste as cores exatas via seletor visual ou código hexadecimal.
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {colorFields.map((field) => (
                        <Paper
                          key={field.key}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: `${config.borderRadius}px`,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 200, flex: 1 }}>
                            <input
                              type="color"
                              value={localConfig[field.key] as string}
                              onChange={(e) => {
                                const val = e.target.value
                                setLocalConfig({ ...localConfig, [field.key]: val, presetName: 'custom' })
                                updateConfig({ [field.key]: val, presetName: 'custom' })
                              }}
                              style={{
                                width: 44,
                                height: 44,
                                padding: 0,
                                border: '1px solid #ccc',
                                borderRadius: localConfig.borderRadius,
                                cursor: 'pointer',
                              }}
                            />
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {field.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {field.desc}
                              </Typography>
                            </Box>
                          </Box>

                          <TextField
                            size="small"
                            value={localConfig[field.key] as string}
                            onChange={(e) => {
                              const val = e.target.value
                              setLocalConfig({ ...localConfig, [field.key]: val, presetName: 'custom' })
                              updateConfig({ [field.key]: val, presetName: 'custom' })
                            }}
                            sx={{ width: 140 }}
                            inputProps={{ style: { fontFamily: 'monospace', fontWeight: 600 } }}
                          />
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* ABA 2: Fontes & Tipografia */}
                {activeTab === 2 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Tipografia da Interface
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Escolha a fonte principal e o dimensionamento base para o sistema.
                      </Typography>
                    </Box>

                    <FormControl fullWidth size="small">
                      <InputLabel id="font-family-label">Família de Fonte</InputLabel>
                      <Select
                        labelId="font-family-label"
                        label="Família de Fonte"
                        value={localConfig.fontFamily}
                        onChange={(e) => {
                          const val = e.target.value
                          setLocalConfig({ ...localConfig, fontFamily: val, presetName: 'custom' })
                          updateConfig({ fontFamily: val, presetName: 'custom' })
                        }}
                      >
                        {fontOptions.map((f) => (
                          <MenuItem key={f.value} value={f.value} sx={{ fontFamily: f.value }}>
                            {f.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Tamanho Base da Fonte ({localConfig.fontSize}px)
                      </Typography>
                      <Slider
                        value={localConfig.fontSize}
                        min={12}
                        max={16}
                        step={1}
                        marks={[
                          { value: 12, label: '12px Compacto' },
                          { value: 14, label: '14px Padrão' },
                          { value: 16, label: '16px Grande' },
                        ]}
                        onChange={(_, val) => {
                          const num = val as number
                          setLocalConfig({ ...localConfig, fontSize: num, presetName: 'custom' })
                          updateConfig({ fontSize: num, presetName: 'custom' })
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {/* ABA 3: Espaçamento & Bordas */}
                {activeTab === 3 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Densidade, Espaçamento e Arredondamento
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ajuste o espaçamento de grid (baseado em kilo.json) e o raio de borda dos elementos.
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Raio de Borda dos Cards e Botões ({localConfig.borderRadius}px)
                      </Typography>
                      <Slider
                        value={localConfig.borderRadius}
                        min={2}
                        max={18}
                        step={2}
                        marks={[
                          { value: 4, label: '4px Reto' },
                          { value: 8, label: '8px Padrão' },
                          { value: 12, label: '12px Moderno' },
                          { value: 16, label: '16px Pill' },
                        ]}
                        onChange={(_, val) => {
                          const num = val as number
                          setLocalConfig({ ...localConfig, borderRadius: num, presetName: 'custom' })
                          updateConfig({ borderRadius: num, presetName: 'custom' })
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Unidade de Espaçamento Base MUI ({localConfig.spacingUnit}px)
                      </Typography>
                      <Slider
                        value={localConfig.spacingUnit}
                        min={6}
                        max={12}
                        step={1}
                        marks={[
                          { value: 6, label: '6px Compacto' },
                          { value: 8, label: '8px Padrão' },
                          { value: 10, label: '10px Confortável' },
                          { value: 12, label: '12px Amplo' },
                        ]}
                        onChange={(_, val) => {
                          const num = val as number
                          setLocalConfig({ ...localConfig, spacingUnit: num, presetName: 'custom' })
                          updateConfig({ spacingUnit: num, presetName: 'custom' })
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Coluna Lateral: Pré-visualização ao Vivo (Live Preview) */}
          <Grid item xs={12} lg={5}>
            <Card elevation={0} sx={{ position: 'sticky', top: 90 }}>
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Eye size={18} color={theme.palette.primary.main} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Pré-visualização Dinâmica ao Vivo
                </Typography>
              </Box>

              <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Exemplo 1: Card de Estatística Financeira */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: `${config.borderRadius}px`,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      RECEITA MENSAL
                    </Typography>
                    <Chip label="+14.2%" size="small" color="success" />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    R$ 145.890,00
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Atualizado em tempo real via tema configurado
                  </Typography>
                </Paper>

                {/* Exemplo 2: Botões de Ação */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="contained" color="primary" size="small">
                    Primário
                  </Button>
                  <Button variant="contained" color="secondary" size="small">
                    Secundário
                  </Button>
                  <Button variant="outlined" color="primary" size="small">
                    Borda
                  </Button>
                  <Button variant="text" color="primary" size="small">
                    Texto
                  </Button>
                </Box>

                {/* Exemplo 3: Campo de Entrada */}
                <TextField
                  fullWidth
                  size="small"
                  label="Pesquisar registro..."
                  defaultValue="Cliente XPTO Ltda"
                />

                {/* Exemplo 4: Linha de Tabela */}
                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: `${config.borderRadius}px`, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Empresa</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Alpha Comércio</TableCell>
                        <TableCell>
                          <Chip label="Liquidado" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          R$ 4.250,00
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: 500 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AppShell>
  )
}
