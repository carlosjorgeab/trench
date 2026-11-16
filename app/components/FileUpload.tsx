'use client'

import { useState, useRef, DragEvent } from 'react'
import { Box, Typography, Button, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material'
import { Upload, X, File, Paperclip } from 'lucide-react'

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  uploadedUrls: string[]
  onUploadedUrlsChange: (urls: string[]) => void
}

export default function FileUpload({ files, onFilesChange, uploadedUrls, onUploadedUrlsChange }: FileUploadProps) {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    onFilesChange([...files, ...droppedFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      onFilesChange([...files, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
    const newUrls = uploadedUrls.filter((_, i) => i !== index)
    onUploadedUrlsChange(newUrls)
  }

  const uploadFiles = async () => {
    const urls: string[] = []
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'anexos')
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (data.success) {
          urls.push(data.data.url)
        }
      } catch (error) {
        console.error('Upload error:', error)
      }
    }
    onUploadedUrlsChange([...uploadedUrls, ...urls])
  }

  return (
    <Box>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: dragging ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragging ? 'primary.50' : 'grey.50',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.50',
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <Upload size={32} style={{ color: '#999', marginBottom: 8 }} />
        <Typography variant="body2" color="text.secondary">
          Arraste arquivos aqui ou clique para selecionar
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Suporta: PDF, JPG, PNG, DOC, XLS
        </Typography>
      </Box>

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              Arquivos selecionados ({files.length})
            </Typography>
            <Button size="small" variant="outlined" onClick={uploadFiles} startIcon={<Upload size={14} />}>
              Fazer Upload
            </Button>
          </Box>
          <List dense>
            {files.map((file, index) => (
              <ListItem key={index}>
                <File size={16} style={{ marginRight: 8, color: '#666' }} />
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(1)} KB`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" size="small" onClick={() => removeFile(index)}>
                    <X size={16} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {uploadedUrls.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Arquivos enviados ({uploadedUrls.length})
          </Typography>
          <List dense>
            {uploadedUrls.map((url, index) => (
              <ListItem key={index}>
                <Paperclip size={16} style={{ marginRight: 8, color: '#1976d2' }} />
                <ListItemText
                  primary={`Arquivo ${index + 1}`}
                  secondary={url.split('/').pop()}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  )
}
