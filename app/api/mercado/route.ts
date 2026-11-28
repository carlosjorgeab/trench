import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface MarketQuote {
  code: string
  name: string
  category: 'Brasil' | 'Forex' | 'Commodities'
  value: number
  unit: string
  variation: number | null
  source: string
  updatedAt: string
}

interface AwesomeQuote {
  name: string
  bid: string
  pctChange: string
  create_date: string
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: { regularMarketPrice?: number; previousClose?: number; chartPreviousClose?: number }
      indicators?: { quote?: Array<{ close?: Array<number | null> }> }
  }>
  }
}

async function getAwesomeQuotes(): Promise<MarketQuote[]> {
  const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL', {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`AwesomeAPI respondeu ${response.status}`)
  const data = await response.json() as Record<string, AwesomeQuote>
  const names: Record<string, string> = {
    USDBRL: 'Dólar comercial',
    EURBRL: 'Euro comercial',
    GBPBRL: 'Libra comercial',
  }

  return Object.entries(data).flatMap(([code, quote]) => {
    const value = Number(quote.bid)
    if (!Number.isFinite(value)) return []
    return [{
      code: code.replace('BRL', '/BRL'),
      name: names[code] || quote.name,
      category: 'Forex' as const,
      value,
      unit: 'R$/un.',
      variation: Number.isFinite(Number(quote.pctChange)) ? Number(quote.pctChange) : null,
      source: 'AwesomeAPI',
      updatedAt: quote.create_date,
    }]
  })
}

async function getBcbRate(series: number, code: string, name: string, unit: string): Promise<MarketQuote> {
  const response = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${series}/dados/ultimos/1?formato=json`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Banco Central (${code}) respondeu ${response.status}`)
  const rows = await response.json() as Array<{ data: string; valor: string }>
  const latest = rows.at(-1)
  const value = Number(latest?.valor.replace(',', '.'))
  if (!latest || !Number.isFinite(value)) throw new Error(`Sem dados recentes para ${code}`)

  return {
    code,
    name,
    category: 'Brasil',
    value,
    unit,
    variation: null,
    source: 'Banco Central do Brasil',
    updatedAt: latest.data,
  }
}

async function getYahooQuote(symbol: string, code: string, name: string, category: MarketQuote['category'], unit: string): Promise<MarketQuote> {
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`, {
    next: { revalidate: 300 },
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Yahoo Finance (${code}) respondeu ${response.status}`)
  const payload = await response.json() as YahooChartResponse
  const result = payload.chart?.result?.[0]
  const value = Number(result?.meta?.regularMarketPrice)
  if (!Number.isFinite(value)) throw new Error(`Sem dados recentes para ${code}`)

  const closes = result?.indicators?.quote?.[0]?.close?.filter((close): close is number => close != null) || []
  const previous = Number(result?.meta?.chartPreviousClose ?? result?.meta?.previousClose ?? closes.at(-2))
  const variation = Number.isFinite(previous) && previous !== 0 ? ((value - previous) / previous) * 100 : null

  return {
    code,
    name,
    category,
    value,
    unit,
    variation,
    source: 'Yahoo Finance',
    updatedAt: new Date().toISOString(),
  }
}

export async function GET() {
  const requests: Array<Promise<MarketQuote | MarketQuote[]>> = [
    getAwesomeQuotes(),
    getBcbRate(432, 'SELIC', 'Selic', '% a.a.'),
    getBcbRate(12, 'CDI', 'CDI diário', '% a.d.'),
    getBcbRate(433, 'IPCA', 'IPCA mensal', '% no mês'),
    getYahooQuote('^BVSP', 'IBOV', 'Ibovespa', 'Brasil', 'pts'),
    getYahooQuote('EURUSD=X', 'EUR/USD', 'Euro / Dólar', 'Forex', 'US$'),
    getYahooQuote('JPY=X', 'USD/JPY', 'Dólar / Iene', 'Forex', 'JPY'),
    getYahooQuote('GC=F', 'OURO', 'Ouro futuro', 'Commodities', 'US$/oz'),
    getYahooQuote('CL=F', 'WTI', 'Petróleo WTI', 'Commodities', 'US$/barril'),
    getYahooQuote('SI=F', 'PRATA', 'Prata futura', 'Commodities', 'US$/oz'),
  ]

  const results = await Promise.allSettled(requests)
  const quotes = results.flatMap((result) => {
    if (result.status !== 'fulfilled') return []
    return Array.isArray(result.value) ? result.value : [result.value]
  })
  const failedSources = results.filter((result) => result.status === 'rejected').length

  return NextResponse.json({
    success: quotes.length > 0,
    quotes,
    failedSources,
    updatedAt: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
