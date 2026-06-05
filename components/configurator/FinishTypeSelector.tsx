'use client'

import { FinishType } from '@/utils/priceCalculator'
import { Home, Building2, CheckCircle, XCircle } from 'lucide-react'

interface FinishTypeSelectorProps {
  finishType: FinishType
  setFinishType: (type: FinishType) => void
  currentSize?: string  // ← Nueva prop
}

export default function FinishTypeSelector({ finishType, setFinishType }: FinishTypeSelectorProps) {
  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold mb-4">Paso 1: Elegí el tipo de entrega</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Llave en mano */}
        <button
          onClick={() => setFinishType('llave_en_mano')}
          className={`p-6 border-2 rounded-xl text-left transition-all ${
            finishType === 'llave_en_mano'
              ? 'border-primary bg-primary/10 shadow-lg'
              : 'border-gray-200 hover:border-primary hover:shadow-md'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${finishType === 'llave_en_mano' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Home size={28} />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold mb-1">Llave en mano 🏠</h4>
              <p className="text-gray-600 text-sm mb-3">
                Se entrega <strong>pronta para habitar</strong>. Todo incluido.
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Revestimiento yeso</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Baño completo con cerámica</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Aislación térmica</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Instalación luz y agua</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Cocina con aéreo y bajo mesada</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Piso de madera</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Elevada 50-60cm del suelo</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Techo chapa trapezoidal calibre 26</div>
              </div>
            </div>
          </div>
        </button>

        {/* Semiterminada */}
        <button
          onClick={() => setFinishType('semiterminada')}
          className={`p-6 border-2 rounded-xl text-left transition-all ${
            finishType === 'semiterminada'
              ? 'border-primary bg-primary/10 shadow-lg'
              : 'border-gray-200 hover:border-primary hover:shadow-md'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${finishType === 'semiterminada' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Building2 size={28} />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold mb-1">Semiterminada 🔨</h4>
              <p className="text-gray-600 text-sm mb-3">
                Ideal para <strong>avanzar a tu ritmo</strong> y personalizar después.
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Estructura completa</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Paredes y techo instalado</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> Puertas y ventanas colocadas</div>
                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600"/> División de ambientes</div>
                <div className="flex items-center gap-1 mt-2"><XCircle size={12} className="text-red-500"/> Sin instalación eléctrica</div>
                <div className="flex items-center gap-1"><XCircle size={12} className="text-red-500"/> Sin instalación sanitaria</div>
                <div className="flex items-center gap-1"><XCircle size={12} className="text-red-500"/> Sin pintura</div>
                <div className="flex items-center gap-1"><XCircle size={12} className="text-red-500"/> Sin terminaciones finales</div>
              </div>
              <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-1 rounded">
                💡 Podés agregar baño y cocina como extras abajo
              </p>
            </div>
          </div>
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
        <p className="font-semibold">❌ No incluido en ningún presupuesto:</p>
        <p className="text-gray-600">Pozo negro, flete, platea de hormigón (se cotizan aparte como extras)</p>
      </div>
    </div>
  )
}