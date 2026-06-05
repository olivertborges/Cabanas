import pricesData from '@/data/prices.json'

export interface ConfigOptions {
  size: string
  customSize?: number
  bedrooms: string
  bathrooms: string
  roof: string
  eaves: string
  flooring: string
  extras: string[]
}

export interface PriceBreakdown {
  base: number
  size: number
  bedrooms: number
  bathrooms: number
  roof: number
  eaves: number
  flooring: number
  extras: number
  total: number
}

export function calculatePrice(options: ConfigOptions): PriceBreakdown {
  const prices = pricesData as any
  
  let basePrice = prices.basePrices[options.size as keyof typeof prices.basePrices] || 0
  
  if (options.size === 'custom' && options.customSize) {
    basePrice = options.customSize * prices.customSizePricePerM2
  }
  
  const bedroomsPrice = prices.bedrooms[options.bedrooms as keyof typeof prices.bedrooms] || 0
  const bathroomsPrice = prices.bathrooms[options.bathrooms as keyof typeof prices.bathrooms] || 0
  const roofPrice = prices.roof[options.roof as keyof typeof prices.roof] || 0
  const eavesPrice = prices.eaves[options.eaves as keyof typeof prices.eaves] || 0
  const flooringPrice = prices.flooring[options.flooring as keyof typeof prices.flooring] || 0
  
  let extrasPrice = 0
  options.extras.forEach(extra => {
    extrasPrice += prices.extras[extra as keyof typeof prices.extras] || 0
  })
  
  const total = basePrice + bedroomsPrice + bathroomsPrice + roofPrice + eavesPrice + flooringPrice + extrasPrice
  
  return {
    base: basePrice,
    size: basePrice,
    bedrooms: bedroomsPrice,
    bathrooms: bathroomsPrice,
    roof: roofPrice,
    eaves: eavesPrice,
    flooring: flooringPrice,
    extras: extrasPrice,
    total
  }
}

export async function getUSDtoUYU(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await response.json()
    return data.rates.UYU || 39.5
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return 39.5
  }
}

export function convertToUYU(usdAmount: number, exchangeRate: number): number {
  return Math.round(usdAmount * exchangeRate)
}
