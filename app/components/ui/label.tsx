'use client'

import { LabelHTMLAttributes, ReactNode } from 'react'

interface MaterialLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
  required?: boolean
}

export function Label({ children, required, className = '', ...props }: MaterialLabelProps) {
  return (
    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ${className}`} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}
