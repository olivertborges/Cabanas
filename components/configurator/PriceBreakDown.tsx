'use client'

import { PriceBreakDown as PriceBreakdownType } from '@/utils/priceCalculator'
import { Coins, CreditCard, ShieldAlert, CheckCircle2, Info } from 'lucide-react'

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
  // Moneda activa
  const isUSD = currency === 'USD'
  const displayTotal = isUSD ? totalUSD : totalUYU
  const currencySymbol = isUSD ? 'USD' : '$U'

  const finishName = finishType === 'llave_en_mano' ? 'Llave en mano' : 'Semiterminada'

  // SOLUCCIÓN AL BUG: El cálculo base de las formas de pago ahora responde dinámicamente al total de la moneda activa
  const initialPayment = displayTotal * 0.5
  const finalPayment = displayTotal * 0.5

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

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl sticky top-24 space-y-6">
      
      {/* Encabezado y Selector de Moneda (Estilo Tabs Premium) */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-600" /> Precio Estimado
        </h3>
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isUSD 
                ? 'bg-white text-gray-950 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency('UYU')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              !isUSD 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            UYU
          </button>
        </div>
      </div>

      {/* Info de Entrega Contextualizada */}
      <div className={`p-4 rounded-2xl border transition-colors duration-300 ${
        finishType === 'llave_en_mano' 
          ? 'bg-emerald-50/[0.3] border-emerald-100' 
          : 'bg-blue-50/[0.3] border-blue-100'
      }`}>
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Tipo de entrega seleccionado</span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${finishType === 'llave_en_mano' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          <p className="text-base font-bold text-gray-900">{finishName}</p>
        </div>
        {finishType === 'semiterminada' && (
          <p className="text-xs text-blue-700/80 mt-1 font-medium">
            * Retira instalaciones eléctricas, sanitarias y esquemas de pintura.
          </p>
        )}
      </div>

      {/* Desglose de Items */}
      <div className="space-y-2.5 text-sm border-b border-gray-100 pb-5">
        {items.map((item, index) => {
          // Si es USD usa el valor base, si es UYU lo multiplica matemáticamente en caliente
          const value = isUSD ? item.value : item.value * exchangeRate
          if (value === 0 && !item.alwaysShow) return null
          
          return (
            <div key={index} className="flex justify-between items-start text-gray-600 group">
              <span className="text-gray-500 group-hover:text-gray-900 transition-colors">{item.label}</span>
              <span className="font-semibold text-gray-900 whitespace-nowrap">
                {currencySymbol} {Math.round(value).toLocaleString('es-UY')}
              </span>
            </div>
          )
        })}
      </div>

      {/* Cuadro de TOTAL IMPACTANTE */}
      <div className="bg-gray-950 text-white p-5 rounded-2xl shadow-inner relative overflow-hidden">
        <span className="text-xs font-semibold text-gray-400 block mb-0.5 uppercase tracking-wider">Inversión Estimada Total</span>
        <div className="text-3xl font-black tracking-tight text-amber-400">
          {currencySymbol} {Math.round(displayTotal).toLocaleString('es-UY')}
        </div>
        {!isUSD && (
          <div className="text-[10px] text-gray-400 mt-1 border-t border-white/10 pt-1.5 flex justify-between">
            <span>Cotización del dólar aplicada:</span>
            <span className="font-medium text-amber-300">$U {exchangeRate.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Cronograma / Formas de pago corregidas */}
      <div className="space-y-3 pt-1">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-amber-600" /> Estructura de Pagos por Hito
        </h4>
        
        <div className="space-y-2.5">
          {/* Anticipo */}
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800">Anticipo de Obra (50%)</span>
                <span className="text-[10px] text-gray-400">Al arribar con materiales al predio</span>
              </div>
            </div>
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
              {currencySymbol} {Math.round(initialPayment).toLocaleString('es-UY')}
            </span>
          </div>

          {/* Saldo final */}
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800">Saldo Final (50%)</span>
                <span className="text-[10px] text-gray-400">Contra entrega conforme de llaves</span>
              </div>
            </div>
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
              {currencySymbol} {Math.round(finalPayment).toLocaleString('es-UY')}
            </span>
          </div>
        </div>
      </div>

      {/* Alertas y Exclusiones */}
      <div className="space-y-2 pt-2 border-t border-gray-100 text-[11px] leading-relaxed">
        {finishType === 'semiterminada' && (
          <div className="flex gap-2 p-2.5 bg-amber-500/[0.04] border border-amber-500/10 rounded-xl text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p><span className="font-bold">Módulo Semiterminado:</span> Excluye enhebrado eléctrico, cañerías sanitarias, pinturas y terminaciones finas.</p>
          </div>
        )}

        <div className="flex gap-2 text-gray-400 px-1 pt-1">
          <Info className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
          <p>
            El costo logístico de flete no se encuentra incluido (varía según la geolocalización de tu terreno). Consultá por promociones del mes.
          </p>
        </div>
      </div>

    </div>
  )
}
