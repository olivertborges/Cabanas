'use client'

import { useState } from 'react'
import FinishTypeSelector from './FinishTypeSelector'
import SizeSelector from './SizeSelector'
import OptionsPanel from './OptionsPanel'
import PriceBreakdown from './PriceBreakDown'
import { ConfigOptions, FinishType, calculatePrice, getUSDtoUYU, convertToUYU } from '@/utils/priceCalculator'
import { getWhatsAppLink } from '@/utils/whatsapp'
import { generatePDFBlob } from '@/utils/pdfGenerator'
import { Download, Send } from 'lucide-react'
import InteractiveFloorPlan from './InteractiveFloorPlan'

const steps = ['Tipo de entrega', 'Tamaño', 'Personalización', 'Plano', 'Resumen']

export default function ConfiguratorWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [currency, setCurrency] = useState<'USD' | 'UYU'>('USD')
  const [exchangeRate, setExchangeRate] = useState<number>(43.5)
  const [finishType, setFinishType] = useState<FinishType>('llave_en_mano')
  const [options, setOptions] = useState<ConfigOptions>({
    finishType: 'llave_en_mano',
    size: '6x6',
    customSize: undefined,
    extras: [],
    aleroMetros: 0,
    caminadorMetros: 0
  })

  // Cargar cotización del dólar
  useState(() => {
    getUSDtoUYU().then(rate => setExchangeRate(rate))
  })

  // Actualizar finishType en options cuando cambie
  const handleFinishTypeChange = (type: FinishType) => {
    setFinishType(type)
    setOptions({ ...options, finishType: type })
  }

  const prices = calculatePrice(options)
  const totalUSD = prices.total
  const totalUYU = convertToUYU(totalUSD, exchangeRate)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleWhatsApp = () => {
    const link = getWhatsAppLink(options, totalUSD, totalUYU)
    window.open(link, '_blank')
  }

  const handlePDF = () => {
    generatePDFBlob(options, prices, totalUSD, totalUYU)
  }

  return (
    <div className="container-custom py-12">
      {/* Steps */}
      <div className="mb-12">
        <div className="flex justify-between items-center max-w-3xl mx-auto overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center min-w-[70px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                index <= currentStep ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className="text-xs mt-1 text-center hidden sm:block">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configurador */}
        <div className="lg:col-span-2 space-y-8">
          {currentStep === 0 && (
            <FinishTypeSelector finishType={finishType} setFinishType={handleFinishTypeChange} />
          )}
          {currentStep === 1 && (
            <SizeSelector options={options} setOptions={setOptions} />
          )}
          {currentStep === 2 && (
            <OptionsPanel options={options} setOptions={setOptions} finishType={finishType} />
          )}
          {currentStep === 3 && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Diseñá la distribución</h3>
              <p className="text-gray-600 mb-4">
                Arrastrá las habitaciones, redimensionalas y organizá los espacios a tu gusto.
              </p>
              <InteractiveFloorPlan options={options} />
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Resumen de tu cabaña</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <p><strong>🔨 Tipo de entrega:</strong> {finishType === 'llave_en_mano' ? 'Llave en mano 🏠' : 'Semiterminada 🔨'}</p>
                <p><strong>📐 Tamaño:</strong> {options.size === 'custom' && options.customSize ? `6x${options.customSize} (${6 * options.customSize} m²)` : options.size}</p>
                {options.extras.includes('platea_hormigon') && <p><strong>🏗️ Platea de hormigón:</strong> Incluida</p>}
                {options.extras.includes('pozo_negro') && <p><strong>💧 Pozo negro:</strong> Incluido</p>}
                {options.extras.includes('alero') && options.aleroMetros && options.aleroMetros > 0 && (
                  <p><strong>🌿 Alero:</strong> {options.aleroMetros} metros</p>
                )}
                {options.extras.includes('caminador_con_alero') && options.caminadorMetros && options.caminadorMetros > 0 && (
                  <p><strong>🚶 Caminador con alero:</strong> {options.caminadorMetros} metros</p>
                )}
                {options.extras.includes('piso_ceramico') && <p><strong>🪟 Piso cerámico:</strong> En lugar de madera</p>}
                {options.extras.includes('banio_semiterminada') && <p><strong>🚽 Baño completo:</strong> Incluido</p>}
                {options.extras.includes('cocina_extra') && <p><strong>🍳 Cocina completa:</strong> Incluida</p>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8">
            {currentStep > 0 && (
              <button onClick={handlePrev} className="btn-secondary">
                Anterior
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button onClick={handleNext} className="btn-primary ml-auto">
                Siguiente
              </button>
            ) : (
              <div className="flex gap-4 ml-auto">
                <button onClick={handlePDF} className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition">
                  <Download size={18} />
                  Descargar PDF
                </button>
                <button onClick={handleWhatsApp} className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">
                  <Send size={18} />
                  Enviar por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Price Panel */}
        <div className="lg:col-span-1">
          <PriceBreakdown
            prices={prices}
            totalUSD={totalUSD}
            totalUYU={totalUYU}
            currency={currency}
            setCurrency={setCurrency}
            exchangeRate={exchangeRate}
            finishType={finishType}
            size={options.size === 'custom' && options.customSize ? `6x${options.customSize}` : options.size}
          />
        </div>
      </div>
    </div>
  )
}