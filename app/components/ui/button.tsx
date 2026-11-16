'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface MaterialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({ variant = 'filled', size = 'md', loading, children, className = '', ...props }: MaterialButtonProps) {
  const baseStyles = 'md-motion-standard font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    filled: 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:bg-[var(--md-sys-color-primary)]/90 md-elevation-1 md-shape-medium px-6 py-2.5',
    outlined: 'border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/8 md-shape-medium px-6 py-2.5',
    text: 'text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/8 md-shape-medium px-6 py-2.5',
    icon: 'p-2 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface)]/8 rounded-full',
  }
  
  const sizes = {
    sm: variant === 'icon' ? 'p-1.5' : 'px-4 py-1.5 text-sm',
    md: variant === 'icon' ? 'p-2' : 'px-6 py-2.5 text-base',
    lg: variant === 'icon' ? 'p-3' : 'px-8 py-3.5 text-lg',
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  )
}
