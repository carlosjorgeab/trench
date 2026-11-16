import { NextRequest, NextResponse } from 'next/server'

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY || ''
const API_URL = `https://api.exchangerate-api.com/v4/latest/BRL`

interface ExchangeRateResponse {
  rates: Record<string, number>
  time_last_updated: string
}

export async function GET(request: NextRequest) {
  try {
    if (!EXCHANGE_RATE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Chave de API não configurada' },
        { status: 500 }
      )
    }

    const response = await fetch(API_URL)
    
    if (!response.ok) {
      throw new Error('Falha ao buscar cotações')
    }

    const data: ExchangeRateResponse = await response.json()

    const currenciesToDisplay = [
      'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF',
      'ARS', 'CLP', 'COP', 'PEN', 'CNY', 'INR', 'MXN'
    ]

    const quotes = currenciesToDisplay.map((currency) => ({
      currency: getCurrencyName(currency),
      code: currency,
      rate: data.rates[currency] || 0,
      lastUpdated: new Date(data.time_last_updated * 1000).toLocaleString('pt-BR'),
    }))

    return NextResponse.json({ success: true, quotes })
  } catch (error) {
    console.error('Exchange Rate API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar cotações' },
      { status: 500 }
    )
  }
}

function getCurrencyName(code: string): string {
  const names: Record<string, string> = {
    USD: 'Dólar Americano',
    EUR: 'Euro',
    GBP: 'Libra Esterlina',
    JPY: 'Iene Japonês',
    CAD: 'Dólar Canadense',
    AUD: 'Dólar Australiano',
    CHF: 'Franco Suíço',
    ARS: 'Peso Argentino',
    CLP: 'Peso Chileno',
    COP: 'Peso Colombiano',
    PEN: 'Sol Peruano',
    CNY: 'Yuan Chinês',
    INR: 'Rupia Indiana',
    MXN: 'Peso Mexicano',
  }
  return names[code] || code
}