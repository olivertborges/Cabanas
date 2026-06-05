'use client'

import { PriceBreakdown as PriceBreakdownType } from '@/utils/priceCalculator'

interface PriceBreakdownProps {
  prices: PriceBreakdownType
  totalUSD: number
  totalUYU: number
  currency: 'USD' | 'UYU'
  setCurrency: (currency: 'USD' | 'UYU') => void
  exchangeRate: number
  finishType: 'llave_en_mano' | 'semiterminada'
  size: string
}

export default function PriceBreakDown({
  prices,
  totalUSD,
  totalUYU,
  currency,
  setCurrency,
  exchangeRate,
  finishType,
  size
}: PriceBreakdownProps) {
  const displayTotal = currency === 'USD' ? totalUSD : totalUYU
  const currencySymbol = currency === 'USD' ? 'USD' : '$U'

  const finishName = finishType === 'llave_en_mano' ? 'Llave en mano' : 'Semiterminada'

  const items = [
    { label: `Cabaña ${size} (${finishName})`, value: prices.base, alwaysShow: true },
    { label: '🏗️ Platea de hormigón', value: prices.platea },
    { label: '💧 Pozo negro', value: prices.pozoNegro },
    { label: '🌿 Alero', value: prices.alero },
    { label: '🚶 Caminador con alero', value: prices.caminador },
    { label: '🪟 Piso cerámico', value: prices.pisoCeramico },
    { label: '🚽 Baño completo (semiterminada)', value: prices.banioSemiterminada },
    { label: '🍳 Cocina completa (semiterminada)', value: prices.cocinaExtra },
  ]

  // Calcular anticipo (50%)
  const initialPayment = totalUSD * 0.5
  const finalPayment = totalUSD * 0.5

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
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

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700">Tipo de entrega:</p>
        <p className="text-lg font-bold text-primary">{finishName}</p>
        {finishType === 'semiterminada' && (
          <p className="text-xs text-gray-500 mt-1">
            * Sin instalaciones eléctricas, sanitarias ni pintura
          </p>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {items.map((item, index) => {
          const value = currency === 'USD' ? item.value : item.value * exchangeRate
          if (value === 0 && !item.alwaysShow) return null
          return (
            <div key={index} className="flex justify-between text-gray-600 text-sm">
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

      {/* Formas de pago */}
      <div className="border-t pt-4 mt-4">
        <p className="font-semibold text-sm mb-2">💰 Formas de pago:</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>🔹 Anticipo (50%):</span>
            <span className="font-medium">{currencySymbol} {Math.round(initialPayment).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>🔹 Saldo al finalizar (50%):</span>
            <span className="font-medium">{currencySymbol} {Math.round(finalPayment).toLocaleString()}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * 50% al llegar con los materiales, 50% al finalizar la obra
        </p>
      </div>

      {currency === 'UYU' && (
        <p className="text-xs text-gray-500 mt-2">
          * Cotización del dólar: $U {exchangeRate.toFixed(2)}
        </p>
      )}

      {finishType === 'semiterminada' && (
        <p className="text-xs text-amber-600 mt-4 p-2 bg-amber-50 rounded">
          ⚠️ La cabaña semiterminada NO incluye instalaciones eléctricas, sanitarias, pintura ni terminaciones finales.
        </p>
      )}

      <p className="text-xs text-gray-400 mt-4">
        * El flete no está incluido. Se calcula según ubicación.
        <br />
        * Consultá por promociones vigentes.
      </p>
    </div>
  )
}