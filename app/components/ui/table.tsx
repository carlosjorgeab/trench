'use client'

import { ReactNode } from 'react'

interface TableProps {
  headers: string[]
  children: ReactNode
  emptyMessage?: string
}

export function Table({ headers, children, emptyMessage = 'Nenhum registro encontrado' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </tbody>
      </table>
    </div>
  )
}

interface TableRowProps {
  children: ReactNode
  onClick?: () => void
  highlight?: boolean
}

export function TableRow({ children, onClick, highlight = false }: TableRowProps) {
  return (
    <tr 
      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${highlight ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface TableCellProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function TableCell({ children, className = '', align = 'left' }: TableCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  
  return (
    <td className={`px-6 py-4 text-sm text-gray-900 dark:text-gray-300 ${alignClass[align]} ${className}`}>
      {children}
    </td>
  )
}