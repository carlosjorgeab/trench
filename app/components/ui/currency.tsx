'use client'

interface CurrencyProps {
  value: number
  className?: string
}

export function Currency({ value, className = '' }: CurrencyProps) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
  
  const isPositive = value >= 0
  
  return (
    <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'} ${className}`}>
      {formatted}
    </span>
  )
}

interface PercentProps {
  value: number
  className?: string
}

export function Percent({ value, className = '' }: PercentProps) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
  }).format(value / 100)
  
  return (
    <span className={className}>
      {formatted}
    </span>
  )
}