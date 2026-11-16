'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: ReactNode
}

export function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    negative: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    neutral: 'text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-variant)]',
  }
  
  return (
    <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] md-elevation-1 md-motion-standard hover:md-elevation-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="md-typescale-label-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wide">{title}</p>
          <p className="md-typescale-headline-medium text-[var(--md-sys-color-on-surface)] mt-2">{value}</p>
          <span className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
            {change}
          </span>
        </div>
        <div className={`p-3 rounded-xl ${changeColors[changeType]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
