'use client'

import { ConfigOptions } from '@/utils/priceCalculator'

interface OptionsPanelProps {
  options: ConfigOptions
  setOptions: (options: ConfigOptions) => void
}

const bedrooms = [
  { label: '1 dormitorio', value: '1' },
  { label: '2 dormitorios', value: '2' },
  { label: '3 dormitorios', value: '3' },
  { label: '4 dormitorios', value: '4' },
]

const bathrooms = [
  { label: '1 baño', value: '1' },
  { label: '2 baños', value: '2' },
  { label: '3 baños', value: '3' },
]

const roofs = [
  { label: 'A dos aguas (Standard)', value: 'standard' },
  { label: 'Moderno', value: 'modern' },
  { label: 'Canadiense', value: 'canadian' },
]

const eaves = [
  { label: 'Sin alero', value: 'none' },
  { label: '1 lado', value: '1side' },
  { label: '2 lados', value: '2sides' },
  { label: '4 lados', value: '4sides' },
]

const floorings = [
  { label: 'Standard', value: 'standard' },
  { label: 'Premium', value: 'premium' },
  { label: 'Luxury', value: 'luxury' },
]

const extrasList = [
  { label: '🛁 Spa / Hidromasaje', value: 'spa' },
  { label: '🔥 Chimenea', value: 'fireplace' },
  { label: '🍖 Parrillero techado', value: 'bbq' },
  { label: '🚗 Estacionamiento cubierto', value: 'covered_parking' },
]

export default function OptionsPanel({ options, setOptions }: OptionsPanelProps) {
  const toggleExtra = (extraValue: string) => {
    if (options.extras.includes(extraValue)) {
      setOptions({
        ...options,
        extras: options.extras.filter(e => e !== extraValue)
      })
    } else {
      setOptions({
        ...options,
        extras: [...options.extras, extraValue]
      })
    }
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold mb-6">Paso 2: Personalizá tu cabaña</h3>
      
      {/* Bedrooms */}
      <div>
        <h4 className="text-lg font-semibold mb-3">🛏️ Dormitorios</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bedrooms.map((bed) => (
            <button
              key={bed.value}
              onClick={() => setOptions({ ...options, bedrooms: bed.value })}
              className={`p-3 border-2 rounded-lg text-center transition ${
                options.bedrooms === bed.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {bed.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <h4 className="text-lg font-semibold mb-3">🚽 Baños</h4>
        <div className="grid grid-cols-3 gap-3">
          {bathrooms.map((bath) => (
            <button
              key={bath.value}
              onClick={() => setOptions({ ...options, bathrooms: bath.value })}
              className={`p-3 border-2 rounded-lg text-center transition ${
                options.bathrooms === bath.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {bath.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roof */}
      <div>
        <h4 className="text-lg font-semibold mb-3">🏠 Tipo de techo</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {roofs.map((roof) => (
            <button
              key={roof.value}
              onClick={() => setOptions({ ...options, roof: roof.value })}
              className={`p-3 border-2 rounded-lg text-center transition ${
                options.roof === roof.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {roof.label}
            </button>
          ))}
        </div>
      </div>

      {/* Eaves */}
      <div>
        <h4 className="text-lg font-semibold mb-3">🌿 Alero</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {eaves.map((eave) => (
            <button
              key={eave.value}
              onClick={() => setOptions({ ...options, eaves: eave.value })}
              className={`p-3 border-2 rounded-lg text-center transition ${
                options.eaves === eave.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {eave.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flooring */}
      <div>
        <h4 className="text-lg font-semibold mb-3">🏠 Revestimiento</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {floorings.map((floor) => (
            <button
              key={floor.value}
              onClick={() => setOptions({ ...options, flooring: floor.value })}
              className={`p-3 border-2 rounded-lg text-center transition ${
                options.flooring === floor.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {floor.label}
            </button>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div>
        <h4 className="text-lg font-semibold mb-3">✨ Extras</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {extrasList.map((extra) => (
            <button
              key={extra.value}
              onClick={() => toggleExtra(extra.value)}
              className={`p-3 border-2 rounded-lg text-left transition ${
                options.extras.includes(extra.value)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {extra.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}