'use client'

import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert, AlertTitle, Box } from '@mui/material'
import { AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar Exclusão',
  message = 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
  confirmText = 'Sim, Excluir',
  cancelText = 'Não',
  variant = 'danger',
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
      onClose()
    }
  }

  const getVariantColor = () => {
    switch (variant) {
      case 'danger': return 'error'
      case 'warning': return 'warning'
      case 'info': return 'info'
      default: return 'error'
    }
  }

  const getBgColor = () => {
    switch (variant) {
      case 'danger': return 'error.light'
      case 'warning': return 'warning.light'
      case 'info': return 'info.light'
      default: return 'error.light'
    }
  }

  const getMainColor = () => {
    switch (variant) {
      case 'danger': return '#c62828'
      case 'warning': return '#ef6c00'
      case 'info': return '#1565c0'
      default: return '#c62828'
    }
  }

  const getIconBgColor = () => {
    switch (variant) {
      case 'danger': return '#ffebee'
      case 'warning': return '#fff3e0'
      case 'info': return '#e3f2fd'
      default: return '#ffebee'
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case 'danger': return '#c62828'
      case 'warning': return '#ef6c00'
      case 'info': return '#1565c0'
      default: return '#c62828'
    }
  }

  const getPaperProps = () => ({
    style: {
      background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: `2px solid ${getMainColor()}33`,
    }
  })

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={getPaperProps()}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5, 
        px: 3, 
        py: 2,
        bgcolor: getBgColor(),
        borderBottom: `2px solid ${getMainColor()}40`,
        borderRadius: '8px 8px 0 0',
        color: getMainColor(),
      }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 44, 
            height: 44, 
            borderRadius: '50%', 
            bgcolor: getIconBgColor(),
            boxShadow: `0 4px 12px ${getMainColor()}40`,
          }}
        >
          <AlertCircle size={28} color={getMainColor()} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: getMainColor() }}>{title}</Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2 }}>
        <Alert 
          severity={getVariantColor()} 
          variant="filled" 
          sx={{ mb: 2, borderRadius: 2, border: `1px solid ${getMainColor()}40` }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>Atenção</AlertTitle>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{message}</Typography>
        </Alert>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2, gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{ 
            px: 3, 
            py: 1, 
            fontWeight: 600,
            borderColor: 'divider',
            '&:hover': { borderColor: 'divider', bgcolor: 'action.hover' }
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={getVariantColor()}
          onClick={handleConfirm}
          disabled={loading}
          startIcon={loading ? <Box sx={{ display: 'flex', alignItems: 'center' }}>⏳</Box> : undefined}
          sx={{ 
            px: 3, 
            py: 1, 
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: `0 4px 12px ${getMainColor()}40`,
            '&:hover': { boxShadow: `0 6px 16px ${getMainColor()}50` }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}