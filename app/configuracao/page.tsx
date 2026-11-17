'use client'

import { useState } from 'react'
import { Sidebar } from '../components/sidebar'
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Divider, List, ListItem, ListItemText } from '@mui/material'
import { useThemeConfig } from '../lib/theme-config-context'
import { Settings, Palette, Save, RefreshCw } from 'lucide-react'

export default function ConfiguracaoPage() {
  const { config, updateConfig, resetToDefault } = useThemeConfig()
  const [localConfig, setLocalConfig] = useState(config)

  const handleSave = () => {
    updateConfig(localConfig)
  }

  const handleReset = () => {
    resetToDefault()
    setLocalConfig(config)
  }

  const colorFields = [
    { key: 'primaryColor', label: 'Cor Primária', description: 'Cor principal do app' },
    { key: 'secondaryColor', label: 'Cor Secundária', description: 'Cor secundária' },
    { key: 'backgroundColor', label: 'Fundo da Aplicação', description: 'Cor de fundo do app' },
    { key: 'surfaceColor', label: 'Fundo dos Painéis', description: 'Cor de fundo dos cards/painéis' },
    { key: 'borderColor', label: 'Borda dos Painéis', description: 'Cor das bordas' },
    { key: 'shadowColor', label: 'Sombra dos Painéis', description: 'Cor da sombra' },
    { key: 'buttonColor', label: 'Cor dos Botões', description: 'Cor dos botões' },
    { key: 'textColor', label: 'Cor do Texto', description: 'Cor do texto principal' },
    { key: 'panelBg', label: 'Fundo do Painel', description: 'Fundo dos painéis/cards' },
    { key: 'panelBorder', label: 'Borda do Painel', description: 'Borda dos painéis/cards' },
    { key: 'panelShadow', label: 'Sombra do Painel', description: 'Sombra dos painéis/cards' },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ ml: { lg: '288px' } }}>
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 1,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Configurações
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={handleReset}>
              Resetar
            </Button>
            <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSave}>
              Salvar
            </Button>
          </Box>
        </Box>

        <Box component="main" sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    <Palette size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                    Tema do App
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 1 }}
                      onClick={() => updateConfig({ backgroundColor: '#ffffff', surfaceColor: '#ffffff' })}
                    >
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#ffffff', border: '2px solid #ccc' }} />
                      <Typography variant="caption">Claro</Typography>
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 1 }}
                      onClick={() => updateConfig({ backgroundColor: '#1a1c1e', surfaceColor: '#1a1c1e' })}
                    >
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#1a1c1e', border: '2px solid #ccc' }} />
                      <Typography variant="caption">Escuro</Typography>
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    <Settings size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                    Cores Personalizadas
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {colorFields.map((field) => (
                      <Box key={field.key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <input
                          type="color"
                          value={localConfig[field.key as keyof typeof localConfig]}
                          onChange={(e) => setLocalConfig({ ...localConfig, [field.key]: e.target.value })}
                          style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #ccc', cursor: 'pointer' }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {field.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {field.description}
                          </Typography>
                        </Box>
                        <TextField
                          size="small"
                          value={localConfig[field.key as keyof typeof localConfig]}
                          onChange={(e) => setLocalConfig({ ...localConfig, [field.key]: e.target.value })}
                          sx={{ width: 120 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Predefinições de Cores
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { name: 'Azul', primary: '#1a73e8', secondary: '#00639b', bg: '#f5f5f7', surface: '#ffffff' },
                      { name: 'Verde', primary: '#1e8e3e', secondary: '#00639b', bg: '#f0f4f0', surface: '#ffffff' },
                      { name: 'Roxo', primary: '#9334e6', secondary: '#7c3aed', bg: '#f5f0f7', surface: '#ffffff' },
                      { name: 'Vermelho', primary: '#d93025', secondary: '#c5221f', bg: '#fdf0f0', surface: '#ffffff' },
                      { name: 'Laranja', primary: '#e8710a', secondary: '#c5221f', bg: '#fef7f0', surface: '#ffffff' },
                      { name: 'Teal', primary: '#00796b', secondary: '#004d40', bg: '#f0f7f6', surface: '#ffffff' },
                    ].map((preset) => (
                      <Grid item xs={6} sm={4} md={2} key={preset.name}>
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                          onClick={() => setLocalConfig({
                            ...localConfig,
                            primaryColor: preset.primary,
                            secondaryColor: preset.secondary,
                            backgroundColor: preset.bg,
                            surfaceColor: preset.surface,
                            buttonColor: preset.primary,
                            panelBg: preset.surface,
                          })}
                        >
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: preset.primary }} />
                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: preset.secondary }} />
                          </Box>
                          <Typography variant="caption">{preset.name}</Typography>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}
