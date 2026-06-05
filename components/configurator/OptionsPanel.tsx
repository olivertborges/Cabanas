'use client'

import { ConfigOptions, FinishType } from '@/utils/priceCalculator'
import { calculatePerimeter } from '@/utils/priceCalculator'
import { useState, useEffect } from 'react'

interface OptionsPanelProps {
  options: ConfigOptions
  setOptions: (options: ConfigOptions) => void
  finishType: FinishType
}

// Función para obtener el precio de la platea según el tamaño
const getPlateaPrice = (size: string, customSize?: number): number => {
  if (size === 'custom' && customSize) {
    const area = 6 * customSize
    if (area <= 30) return 1500  // hasta 6x5
    if (area <= 48) return 2500  // hasta 6x8
    return 3000                   // 6x9 a 6x12
  }
  
  const prices: Record<string, number> = {
    '6x3': 1500, '6x4': 1500, '6x5': 1500,
    '6x6': 2500, '6x7': 2500, '6x8': 2500,
    '6x9': 3000, '6x10': 3000, '6x12': 3000
  }
  return prices[size] || 0
}

const getPisoCeramicoPrice = (size: string, customSize?: number): number => {
  const prices: Record<string, number> = {
    '6x3': 1700, '6x4': 2000, '6x5': 2700,
    '6x6': 3500, '6x7': 4500,
    '6x8': 5000, '6x9': 5000, '6x10': 5000,
    '6x12': 5500
  }
  return prices[size] || 0
}

const extrasList = [
  { 
    id: 'platea_hormigon', 
    label: '🏗️ Platea de hormigón', 
    description: 'Base de hormigón para terreno nivelado. El terreno debe estar nivelado.',
    hasVariablePrice: true,
    getPrice: getPlateaPrice
  },
  { 
    id: 'pozo_negro', 
    label: '💧 Pozo negro', 
    description: 'Sistema de saneamiento básico ($2,000 USD fijo)',
    hasVariablePrice: false,
    fixedPrice: 2000
  },
  { 
    id: 'alero', 
    label: '🌿 Alero perimetral', 
    description: 'Protección alrededor de la cabaña ($120 USD por metro)',
    hasVariablePrice: true,
    needsMeters: true,
    pricePerMeter: 120
  },
  { 
    id: 'caminador_con_alero', 
    label: '🚶 Caminador con alero', 
    description: 'Pasillo techado exterior ($250 USD por metro)',
    hasVariablePrice: true,
    needsMeters: true,
    pricePerMeter: 250
  },
  { 
    id: 'piso_ceramico', 
    label: '🪟 Piso cerámico', 
    description: 'Reemplaza al piso de madera original',
    hasVariablePrice: true,
    getPrice: getPisoCeramicoPrice
  },
]

const semiterminadaExtras = [
  { 
    id: 'banio_semiterminada', 
    label: '🚽 Baño completo', 
    description: 'Instalación y terminaciones básicas del baño ($2,000 USD)',
    fixedPrice: 2000
  },
  { 
    id: 'cocina_extra', 
    label: '🍳 Cocina completa', 
    description: 'Muebles aéreo y bajo mesada + electrodomésticos ($1,500 USD)',
    fixedPrice: 1500
  },
]

export default function OptionsPanel({ options, setOptions, finishType }: OptionsPanelProps) {
  const [plateaPrice, setPlateaPrice] = useState(0)
  const [pisoCeramicoPrice, setPisoCeramicoPrice] = useState(0)
  const [suggestedPerimeter, setSuggestedPerimeter] = useState(0)

  useEffect(() => {
    // Actualizar precio de platea cuando cambia el tamaño
    const newPlateaPrice = getPlateaPrice(options.size, options.customSize)
    setPlateaPrice(newPlateaPrice)
    
    // Actualizar precio del piso cerámico
    const newPisoPrice = getPisoCeramicoPrice(options.size, options.customSize)
    setPisoCeramicoPrice(newPisoPrice)
    
    // Actualizar perímetro sugerido para alero
    const perimeter = calculatePerimeter(options.size, options.customSize)
    setSuggestedPerimeter(perimeter)
  }, [options.size, options.customSize])

  const toggleExtra = (extraId: string) => {
    if (options.extras.includes(extraId)) {
      setOptions({
        ...options,
        extras: options.extras.filter(e => e !== extraId)
      })
    } else {
      setOptions({
        ...options,
        extras: [...options.extras, extraId]
      })
    }
  }

  const updateMeters = (extraId: string, meters: number) => {
    if (extraId === 'alero') {
      setOptions({ ...options, aleroMetros: meters })
    } else if (extraId === 'caminador_con_alero') {
      setOptions({ ...options, caminadorMetros: meters })
    }
  }

  const getMetersValue = (extraId: string): number => {
    if (extraId === 'alero') return options.aleroMetros || 0
    if (extraId === 'caminador_con_alero') return options.caminadorMetros || 0
    return 0
  }

  // Obtener el texto del tamaño actual
  const getSizeText = (): string => {
    if (options.size === 'custom' && options.customSize) {
      return `6x${options.customSize}`
    }
    return options.size
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold mb-6">Paso 3: Personalizá tu cabaña</h3>
      
      {/* Indicador de tipo de entrega */}
      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
        <p className="text-sm text-primary font-medium">
          Modo: <strong>{finishType === 'llave_en_mano' ? '🏠 Llave en mano' : '🔨 Semiterminada'}</strong>
          {finishType === 'semiterminada' && (
            <span className="block text-xs mt-1">
              Podés agregar baño y cocina como extras
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Tamaño actual: <strong>{getSizeText()}</strong>
        </p>
      </div>

      {/* Extras generales */}
      <div>
        <h4 className="text-lg font-semibold mb-3">✨ Extras adicionales</h4>
        <div className="space-y-3">
          {extrasList.map((extra) => {
            // Determinar el precio a mostrar
            let displayPrice = ''
            if (extra.id === 'platea_hormigon') {
              displayPrice = `USD ${plateaPrice.toLocaleString()}`
            } else if (extra.id === 'piso_ceramico') {
              displayPrice = `USD ${pisoCeramicoPrice.toLocaleString()}`
            } else if (extra.id === 'pozo_negro') {
              const price = extra.fixedPrice || 0
              displayPrice = `USD ${price.toLocaleString()}`
            } else if (extra.needsMeters) {
              const meters = getMetersValue(extra.id)
              const pricePerMeter = extra.pricePerMeter || 0
              const totalPrice = meters * pricePerMeter
              displayPrice = meters > 0 ? `USD ${totalPrice.toLocaleString()}` : ''
            }
            
            return (
              <div key={extra.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.extras.includes(extra.id)}
                        onChange={() => toggleExtra(extra.id)}
                        className="w-5 h-5 text-primary"
                      />
                      <span className="font-medium">{extra.label}</span>
                    </label>
                    <p className="text-sm text-gray-500 ml-7">{extra.description}</p>
                    {extra.id === 'platea_hormigon' && (
                      <p className="text-xs text-amber-600 ml-7 mt-1">
                        ⚠️ El terreno debe estar nivelado
                      </p>
                    )}
                    {displayPrice && options.extras.includes(extra.id) && (
                      <p className="text-sm font-medium text-primary ml-7 mt-1">
                        Costo: {displayPrice}
                      </p>
                    )}
                  </div>
                </div>
                
                {options.extras.includes(extra.id) && extra.needsMeters && (
                  <div className="mt-3 ml-7">
                    <label className="text-sm font-medium">Metros lineales:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        step={1}
                        value={getMetersValue(extra.id)}
                        onChange={(e) => updateMeters(extra.id, parseFloat(e.target.value) || 0)}
                        className="w-32 p-2 border rounded-lg"
                      />
                      <span className="text-sm text-gray-500">metros</span>
                      {extra.id === 'alero' && (
                        <span className="text-xs text-gray-400">
                          (sugerido: {suggestedPerimeter}m para perímetro completo)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Extras específicos para semiterminada */}
      {finishType === 'semiterminada' && (
        <div>
          <h4 className="text-lg font-semibold mb-3">🔧 Terminaciones para semiterminada</h4>
          <div className="space-y-3">
            {semiterminadaExtras.map((extra) => {
              const price = extra.fixedPrice || 0
              return (
                <div key={extra.id} className="border rounded-lg p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.extras.includes(extra.id)}
                      onChange={() => toggleExtra(extra.id)}
                      className="w-5 h-5 text-primary"
                    />
                    <div>
                      <span className="font-medium">{extra.label}</span>
                      <p className="text-sm text-gray-500">{extra.description}</p>
                      {options.extras.includes(extra.id) && (
                        <p className="text-sm font-medium text-primary mt-1">
                          Costo: USD {price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Información de materiales */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h4 className="font-semibold mb-2">🌲 Materiales de construcción</h4>
        <p className="text-sm text-gray-600">
          Trabajamos con <strong>pino nacional de alta calidad</strong>, tabla machimbrada secada a horno 
          y tratada con productos especiales para mayor durabilidad y resistencia. 
          Madera protegida con tratamiento impermeabilizante.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          🛠️ Mantenimiento recomendado: aplicar protector a la madera una vez al año.
        </p>
      </div>

      {/* Condiciones de pago */}
      <div className="bg-primary/5 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">💰 Condiciones de pago</h4>
        <p className="text-sm">
          🔹 <strong>50%</strong> al llegar al terreno con los materiales<br />
          🔹 <strong>50%</strong> restante al finalizar la obra
        </p>
        <p className="text-xs text-gray-500 mt-2">
          ❌ No trabajamos con financiación.
        </p>
      </div>
    </div>
  )
}