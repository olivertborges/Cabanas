'use client'

import { useState, useEffect } from 'react'
import FinishTypeSelector from './FinishTypeSelector'
import SizeSelector from './SizeSelector'
import OptionsPanel from './OptionsPanel'
import PriceBreakDown from './PriceBreakDown'
import InteractiveFloorPlan from './InteractiveFloorPlan'
import { ConfigOptions, FinishType, calculatePrice, getUSDtoUYU, convertToUYU } from '@/utils/priceCalculator'
import { getWhatsAppLink } from '@/utils/whatsapp'
import { generatePDFBlob } from '@/utils/pdfGenerator'
import { Download, Send, ArrowRight, ArrowLeft, Check, ClipboardList } from 'lucide-react'

const steps = ['Tamaño', 'Tipo de entrega', 'Personalización', 'Plano', 'Resumen']

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

  // Corrección de ciclo de vida: Cargar cotización correctamente usando useEffect
  useEffect(() => {
    getUSDtoUYU()
      .then(rate => setExchangeRate(rate))
      .catch(err => console.error("Error cargando cotización:", err))
  }, [])

  const handleFinishTypeChange = (type: FinishType) => {
    setFinishType(type)
    setOptions(prev => ({ ...prev, finishType: type }))
  }

  const prices = calculatePrice(options)
  const totalUSD = prices.total
  const totalUYU = convertToUYU(totalUSD, exchangeRate)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh] bg-gray-50/50">
      
      {/* Indicador de Pasos (Stepper) de Diseño Líquido */}
      <div className="mb-12 relative max-w-4xl mx-auto px-4">
        {/* Línea gris de fondo */}
        <div className="absolute top-5 left-12 right-12 h-0.5 bg-gray-200 -z-10 hidden sm:block" />
        {/* Línea de progreso de color activa */}
        <div 
          className="absolute top-5 left-12 h-0.5 bg-amber-600 transition-all duration-500 -z-10 hidden sm:block"
          style={{ width: `${(currentStep / (steps.length - 1)) * 82}%` }}
        />

        <div className="flex justify-between items-center overflow-x-auto pb-2 scrollbar-none">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isActive = index === currentStep

            return (
              <div key={step} className="flex flex-col items-center flex-1 min-w-[80px] group">
                <button
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  disabled={index >= currentStep}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
                      : isActive 
                        ? 'bg-gray-900 text-white ring-4 ring-gray-900/10 scale-105' 
                        : 'bg-white text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </button>
                <span className={`text-xs mt-2 font-medium transition-colors ${
                  isActive ? 'text-gray-900 font-bold' : isCompleted ? 'text-amber-700' : 'text-gray-400'
                } hidden sm:block`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Grilla de Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Columna Izquierda: Panel Dinámico del Selector */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm min-h-[450px] flex flex-col justify-between">
          
          <div className="w-full">
            {/* Paso 1: Tamaño */}
            {currentStep === 0 && (
              <SizeSelector options={options} setOptions={setOptions} />
            )}
            
            {/* Paso 2: Tipo de entrega */}
            {currentStep === 1 && (
              <FinishTypeSelector finishType={finishType} setFinishType={handleFinishTypeChange} />
            )}
            
            {/* Paso 3: Personalización */}
            {currentStep === 2 && (
              <OptionsPanel options={options} setOptions={setOptions} finishType={finishType} />
            )}
            
            {/* Paso 4: Plano interactivo */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🛠️ Diseñá la distribución interna
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Organizá y visualizá los metros cuadrados asignando estratégicamente tus espacios.
                  </p>
                </div>
                <InteractiveFloorPlan options={options} />
              </div>
            )}
            
            {/* Paso 5: Resumen Final Empaquetado */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-600" /> Resumen de Configuración Técnica
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Revisá la ficha técnica estructurada de tu cabaña antes de descargar o enviar tu presupuesto.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">Dimensiones base:</span>
                    <span className="text-sm font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg shadow-sm border">
                      // Reemplazá la línea 166 por esto:
{options.size === 'custom' && options.customSize ? `6x${options.customSize} (${6 * options.customSize}m²)` : `${options.size} (${(prices as any).area || 0}m²)`}

                    </span>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">Modalidad de obra:</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm border ${
                      finishType === 'llave_en_mano' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {finishType === 'llave_en_mano' ? 'Llave en Mano 🏠' : 'Semiterminada 🔨'}
                    </span>
                  </div>
                </div>

                {/* Listado limpio de opcionales seleccionados */}
                <div className="bg-amber-500/[0.02] border border-amber-500/10 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">Equipamiento & Componentes Extra</h4>
                  <div className="divide-y divide-gray-100/70 text-sm text-gray-700">
                    {options.extras.length === 0 && (!options.aleroMetros && !options.caminadorMetros) ? (
                      <p className="text-gray-400 italic text-xs py-2">No has añadido componentes adicionales.</p>
                    ) : (
                      <>
                        {options.extras.includes('platea_hormigon') && <div className="py-2.5 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Platea de fundación en hormigón armada</div>}
                        {options.extras.includes('pozo_negro') && <div className="py-2.5 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Construcción de pozo séptico/negro en terreno</div>}
                        {options.extras.includes('alero') && options.aleroMetros && options.aleroMetros > 0 ? (
                          <div className="py-2.5 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Alero frontal exterior techado: <strong className="text-gray-900 ml-auto">{options.aleroMetros} Mts</strong></div>
                        ) : null}
                        {options.extras.includes('caminador_con_alero') && options.caminadorMetros && options.caminadorMetros > 0 ? (
                          <div className="py-2.5 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Deck caminador perimetral con alero: <strong className="text-gray-900 ml-auto">{options.caminadorMetros} Mts</strong></div>
                        ) : null}
                        {options.extras.includes('piso_ceramico') && <div className="py-2.5 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Reemplazo a pavimento cerámico de alto tránsito</div>}
                        {options.extras.includes('banio_semiterminada') && <div className="py-2.5 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Kit completo de loza sanitaria e instalación de baño</div>}
                        {options.extras.includes('cocina_extra') && <div className="py-2.5 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Amoblamiento integral de cocina premium</div>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de Navegación del Flujo de Compra */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-8">
            {currentStep > 0 ? (
              <button 
                onClick={handlePrev} 
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
            ) : <div />}
            
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={handleNext} 
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm ml-auto"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-wrap gap-3 ml-auto w-full sm:w-auto justify-end">
                <button 
                  onClick={handlePDF} 
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all w-full sm:w-auto"
                >
                  <Download className="w-4 h-4" /> Ficha PDF
                </button>
                <button 
                  onClick={handleWhatsApp} 
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-900/10 w-full sm:w-auto"
                >
                  <Send className="w-4 h-4" /> Enviar Presupuesto
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Tarjeta Lateral de Precios Dinámica */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <PriceBreakDown
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
