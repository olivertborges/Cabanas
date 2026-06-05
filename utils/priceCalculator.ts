import pricesData from '@/data/prices.json'

export type FinishType = 'llave_en_mano' | 'semiterminada'

export interface ConfigOptions {
  finishType: FinishType
  size: string
  customSize?: number
  extras: string[]
  aleroMetros?: number
  caminadorMetros?: number
}

export interface PriceBreakDown {
  base: number
  platea: number
  pozoNegro: number
  alero: number
  caminador: number
  pisoCeramico: number
  banioSemiterminada: number
  cocinaExtra: number
  total: number
}

// Función para obtener el precio base según tamaño y tipo
export function getBasePrice(size: string, finishType: FinishType): number {
  const prices = pricesData as any
  const sizePrices = prices.basePrices[size as keyof typeof prices.basePrices]
  if (!sizePrices) return 0
  return sizePrices[finishType] || 0
}

// Calcular perímetro para aleros (ancho 6m, largo variable)
export function calculatePerimeter(size: string, customSize?: number): number {
  let length = 6 // default 6x6
  if (size !== 'custom' && size.includes('x')) {
    length = parseInt(size.split('x')[1])
  } else if (customSize) {
    length = customSize
  }
  // Perímetro = 2*(ancho + largo) = 2*(6 + largo)
  return 2 * (6 + length)
}

export function calculatePrice(options: ConfigOptions): PriceBreakDown {
  const prices = pricesData as any
  
  // Precio base
  const basePrice = getBasePrice(options.size, options.finishType)
  
  // Platea de hormigón
  let plateaPrice = 0
  if (options.extras.includes('platea_hormigon')) {
    const plateaPrices = prices.extras.platea_hormigon.prices
    plateaPrice = plateaPrices[options.size as keyof typeof plateaPrices] || 0
  }
  
  // Pozo negro
  let pozoNegroPrice = 0
  if (options.extras.includes('pozo_negro')) {
    pozoNegroPrice = prices.extras.pozo_negro.price
  }
  
  // Alero (por metro lineal)
  let aleroPrice = 0
  if (options.extras.includes('alero') && options.aleroMetros) {
    aleroPrice = options.aleroMetros * prices.extras.alero.pricePerMeter
  }
  
  // Caminador con alero
  let caminadorPrice = 0
  if (options.extras.includes('caminador_con_alero') && options.caminadorMetros) {
    caminadorPrice = options.caminadorMetros * prices.extras.caminador_con_alero.pricePerMeter
  }
  
  // Piso cerámico (reemplaza al de madera)
  let pisoCeramicoPrice = 0
  if (options.extras.includes('piso_ceramico')) {
    const pisoPrices = prices.extras.piso_ceramico.prices
    pisoCeramicoPrice = pisoPrices[options.size as keyof typeof pisoPrices] || 0
  }
  
  // Baño para semiterminada (solo si aplica)
  let banioSemiterminadaPrice = 0
  if (options.finishType === 'semiterminada' && options.extras.includes('banio_semiterminada')) {
    banioSemiterminadaPrice = prices.extras.banio_semiterminada.price
  }
  
  // Cocina extra para semiterminada
  let cocinaExtraPrice = 0
  if (options.finishType === 'semiterminada' && options.extras.includes('cocina_extra')) {
    cocinaExtraPrice = prices.extras.cocina_extra.price
  }
  
  const total = basePrice + plateaPrice + pozoNegroPrice + aleroPrice + caminadorPrice + pisoCeramicoPrice + banioSemiterminadaPrice + cocinaExtraPrice
  
  return {
    base: basePrice,
    platea: plateaPrice,
    pozoNegro: pozoNegroPrice,
    alero: aleroPrice,
    caminador: caminadorPrice,
    pisoCeramico: pisoCeramicoPrice,
    banioSemiterminada: banioSemiterminadaPrice,
    cocinaExtra: cocinaExtraPrice,
    total
  }
}

export async function getUSDtoUYU(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await response.json()
    return data.rates.UYU || 43.5
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return 43.5
  }
}

export function convertToUYU(usdAmount: number, exchangeRate: number): number {
  return Math.round(usdAmount * exchangeRate)
}