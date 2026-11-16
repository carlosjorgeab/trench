'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSupabase } from '../lib/supabase-context'
import { useTheme } from '../lib/theme-context'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, IconButton, Avatar } from '@mui/material'
import { Menu, X, Home, FileText, BarChart3, Settings, Users, Building2, DollarSign, TrendingUp, LogOut, Moon, Sun } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { supabase, refreshUser } = useSupabase()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
    { label: 'Financeiro', href: '/financeiro', icon: <DollarSign size={20} /> },
    { label: 'Prestação de Contas', href: '/prestacao', icon: <FileText size={20} /> },
    { label: 'Cotação de Moedas', href: '/cotacao', icon: <TrendingUp size={20} /> },
    { label: 'Cadastros', href: '/cadastros', icon: <Building2 size={20} /> },
    { label: 'Acesso', href: '/acesso', icon: <Users size={20} /> },
    { label: 'Configurações', href: '/configuracao', icon: <Settings size={20} /> },
  ]

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      await refreshUser()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const drawerContent = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>T</Typography>
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>TRENCH</Typography>
          <Typography variant="caption" color="text.secondary">Sistema Financeiro</Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={() => setIsOpen(false)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={toggleTheme} sx={{ borderRadius: 2, mb: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </ListItemIcon>
          <ListItemText primary={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'} />
        </ListItemButton>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Mobile menu button */}
      <IconButton
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1200,
          display: { xs: 'flex', lg: 'none' },
          bgcolor: 'background.paper',
          boxShadow: 2,
        }}
      >
        <Menu size={24} />
      </IconButton>

      {/* Mobile drawer */}
      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{ display: { xs: 'block', lg: 'none' } }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  )
}
