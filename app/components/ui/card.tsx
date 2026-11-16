'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
  elevated?: boolean
}

export function Card({ children, className = '', title, action, elevated = false }: CardProps) {
  return (
    <div className={`bg-[var(--md-sys-color-surface)] rounded-xl border border-[var(--md-sys-color-outline-variant)] ${elevated ? 'md-elevation-2' : 'md-elevation-1'} ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex justify-between items-center">
          {title && <h3 className="md-typescale-title-medium text-[var(--md-sys-color-on-surface)]">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4"><h3 className="md-typescale-title-medium text-[var(--md-sys-color-on-surface)]">{children}</h3></div>
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="md-typescale-title-medium text-[var(--md-sys-color-on-surface)]">{children}</h3>
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}
