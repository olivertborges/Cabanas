'use client'

import { PriceBreakdown as PriceBreakdownType } from '@/utils/priceCalculator'

interface PriceBreakdownProps {
  prices: PriceBreakdownType
  totalUSD: number
  totalUYU: number
  currency: 'USD' | 'UYU'
  setCurrency: (currency: 'USD' | 'UYU') => void
  exchangeRate: number
}

export default function PriceBreakdown({
  prices,
  totalUSD,
  totalUYU,
  currency,
  setCurrency,
  exchangeRate
}: PriceBreakdownProps) {
  const displayTotal = currency === 'USD' ? totalUSD : totalUYU
  const currencySymbol = currency === 'USD' ? 'USD' : '$U'

  const items = [
    { label: 'Precio base', value: prices.base },
    { label: 'Dormitorios extra', value: prices.bedrooms },
    { label: 'Baños extra', value: prices.bathrooms },
    { label: 'Tipo de techo', value: prices.roof },
    { label: 'Alero', value: prices.eaves },
    { label: 'Revestimiento', value: prices.flooring },
    { label: 'Extras', value: prices.extras },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Precio estimado</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 rounded ${
              currency === 'USD' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency('UYU')}
            className={`px-3 py-1 rounded ${
              currency === 'UYU' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            UYU
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {items.map((item, index) => {
          const value = currency === 'USD' ? item.value : item.value * exchangeRate
          if (value === 0) return null
          return (
            <div key={index} className="flex justify-between text-gray-600">
              <span>{item.label}:</span>
              <span>{currencySymbol} {Math.round(value).toLocaleString()}</span>
            </div>
          )
        })}
        
        <div className="border-t-2 pt-3 mt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL:</span>
            <span className="text-primary">{currencySymbol} {Math.round(displayTotal).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {currency === 'UYU' && (
        <p className="text-xs text-gray-500 mt-2">
          * Cotización del dólar: $U {exchangeRate.toFixed(2)}
        </p>
      )}

      <p className="text-xs text-gray-400 mt-4">
        * Precio sujeto a cambios según materiales y ubicación.
        Consultá por promociones vigentes.
      </p>
    </div>
  )
}