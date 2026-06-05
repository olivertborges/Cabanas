'use client'

import { useState } from 'react'
import SizeSelector from './SizeSelector'
import OptionsPanel from './OptionsPanel'
import PriceBreakdown from './PriceBreakDown'
import DynamicFloorPlan from './DynamicFloorPlan'
import { ConfigOptions, calculatePrice, getUSDtoUYU, convertToUYU } from '@/utils/priceCalculator'
import { getWhatsAppLink } from '@/utils/whatsapp'
import { generatePDFBlob } from '@/utils/pdfGenerator'
import { Download, Send } from 'lucide-react'

const steps = ['Tamaño', 'Distribución', 'Extras', 'Resumen']

export default function ConfiguratorWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [currency, setCurrency] = useState<'USD' | 'UYU'>('USD')
  const [exchangeRate, setExchangeRate] = useState<number>(39.5)
  const [options, setOptions] = useState<ConfigOptions>({
    size: '10x8',
    customSize: undefined,
    bedrooms: '3',
    bathrooms: '2',
    roof: 'standard',
    eaves: 'none',
    flooring: 'standard',
    extras: []
  })

  // Cargar cotización del dólar
  useState(() => {
    getUSDtoUYU().then(rate => setExchangeRate(rate))
  })

  const prices = calculatePrice(options)
  const totalUSD = prices.total
  const totalUYU = convertToUYU(totalUSD, exchangeRate)
  const displayTotal = currency === 'USD' ? `USD ${totalUSD.toLocaleString()}` : `$U ${totalUYU.toLocaleString()}`

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
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                index <= currentStep ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className="text-sm mt-2 hidden md:block">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configurador */}
        <div className="lg:col-span-2 space-y-8">
          {currentStep === 0 && (
            <SizeSelector options={options} setOptions={setOptions} />
          )}
          {currentStep === 1 && (
            <OptionsPanel options={options} setOptions={setOptions} />
          )}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Plano interactivo</h3>
                <DynamicFloorPlan options={options} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Simulador informativo</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    * Los valores mostrados son a modo informativo. No ofrecemos financiación propia.
                  </p>
                  <div className="space-y-2">
                    <p>💰 Entrega sugerida: <strong>USD {(totalUSD * 0.2).toLocaleString()}</strong> (20%)</p>
                    <p>🏦 Saldo restante: <strong>USD {(totalUSD * 0.8).toLocaleString()}</strong></p>
                    <p>📊 Cuota referencial (48 meses): <strong>USD {Math.round(totalUSD * 0.8 / 48).toLocaleString()}/mes</strong></p>
                    <p className="text-sm text-gray-500 mt-4">Consultá con tu banco por créditos hipotecarios o prendarios.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Resumen de tu cabaña</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <p><strong>📐 Tamaño:</strong> {options.size === 'custom' && options.customSize ? `${options.customSize} m²` : options.size}</p>
                <p><strong>🛏️ Dormitorios:</strong> {options.bedrooms}</p>
                <p><strong>🚽 Baños:</strong> {options.bathrooms}</p>
                <p><strong>🏠 Techo:</strong> {options.roof}</p>
                <p><strong>🌿 Alero:</strong> {options.eaves}</p>
                <p><strong>🏠 Revestimiento:</strong> {options.flooring}</p>
                {options.extras.length > 0 && (
                  <p><strong>✨ Extras:</strong> {options.extras.join(', ')}</p>
                )}
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
          <div className="sticky top-24">
            <PriceBreakdown
              prices={prices}
              totalUSD={totalUSD}
              totalUYU={totalUYU}
              currency={currency}
              setCurrency={setCurrency}
              exchangeRate={exchangeRate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
