'use client'

import { ConfigOptions } from '@/utils/priceCalculator'

interface SizeSelectorProps {
  options: ConfigOptions
  setOptions: (options: ConfigOptions) => void
}

const sizes = [
  { label: '6x6 (36m²)', value: '6x6' },
  { label: '8x8 (64m²)', value: '8x8' },
  { label: '10x8 (80m²)', value: '10x8' },
  { label: '11x9 (99m²)', value: '11x9' },
  { label: 'Personalizado', value: 'custom' },
]

export default function SizeSelector({ options, setOptions }: SizeSelectorProps) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Paso 1: Elegí el tamaño</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sizes.map((size) => (
          <button
            key={size.value}
            onClick={() => setOptions({ ...options, size: size.value })}
            className={`p-4 border-2 rounded-lg text-center transition ${
              options.size === size.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>
      
      {options.size === 'custom' && (
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">
            Ingresá los metros cuadrados:
          </label>
          <input
            type="number"
            value={options.customSize || ''}
            onChange={(e) => setOptions({ ...options, customSize: parseInt(e.target.value) })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            placeholder="Ej: 100"
          />
        </div>
      )}
    </div>
  )
}