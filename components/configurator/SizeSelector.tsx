'use client'

import { ConfigOptions } from '@/utils/priceCalculator'

interface SizeSelectorProps {
  options: ConfigOptions
  setOptions: (options: ConfigOptions) => void
}

const sizes = [
  { label: '6x3 (18m²)', value: '6x3', area: 18 },
  { label: '6x4 (24m²)', value: '6x4', area: 24 },
  { label: '6x5 (30m²)', value: '6x5', area: 30 },
  { label: '6x6 (36m²)', value: '6x6', area: 36 },
  { label: '6x7 (42m²)', value: '6x7', area: 42 },
  { label: '6x8 (48m²)', value: '6x8', area: 48 },
  { label: '6x9 (54m²)', value: '6x9', area: 54 },
  { label: '6x10 (60m²)', value: '6x10', area: 60 },
  { label: '6x12 (72m²)', value: '6x12', area: 72 },
  { label: 'Personalizado', value: 'custom' },
]

export default function SizeSelector({ options, setOptions }: SizeSelectorProps) {
  // Si por alguna razón options es undefined, usamos un valor por defecto
  const currentSize = options?.size || '6x6'
  const currentCustomSize = options?.customSize

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Paso 2: Elegí el tamaño</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sizes.map((size) => (
          <button
            key={size.value}
            onClick={() => setOptions({ ...options, size: size.value, customSize: undefined })}
            className={`p-4 border-2 rounded-lg text-center transition ${
              currentSize === size.value && currentSize !== 'custom'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <div className="font-bold">{size.label}</div>
          </button>
        ))}
      </div>
      
      {currentSize === 'custom' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium mb-2">
            Ingresá el largo en metros (ancho fijo 6m):
          </label>
          <input
            type="number"
            min={2}
            max={15}
            step={0.5}
            value={currentCustomSize || ''}
            onChange={(e) => setOptions({ ...options, customSize: parseFloat(e.target.value) })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            placeholder="Ej: 7.5 (para 6x7.5)"
          />
          {currentCustomSize && (
            <p className="mt-2 text-sm text-gray-500">
              Área: {6 * currentCustomSize} m²
            </p>
          )}
        </div>
      )}
    </div>
  )
}