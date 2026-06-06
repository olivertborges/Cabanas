'use client'

import Link from 'next/link'
import { Ruler, Bed, Bath, Home, Building2, ArrowRight, Sparkles, Check, X, ShieldAlert, Trees } from 'lucide-react'
import { useState } from 'react'

// Datos de modelos basados en los precios reales
const models = [
  {
    id: '6x3',
    name: 'Cabaña 6x3',
    description: 'Ideal para monoambiente o inversión. Compacta y funcional, perfecta para terreno pequeño.',
    size: '6x3',
    area: 18,
    bedrooms: 1,
    bathrooms: 1,
    priceLlaveEnMano: 9500,
    priceSemiterminada: 5500,
    features: ['Monoambiente', 'Inversión rápida', 'Bajo mantenimiento'],
    image: '/images/renders/6x3.jpg'
  },
  {
    id: '6x4',
    name: 'Cabaña 6x4',
    description: 'Espacio cómodo y práctico. Ideal para pareja o descanso. Muy buena distribución.',
    size: '6x4',
    area: 24,
    bedrooms: 1,
    bathrooms: 1,
    priceLlaveEnMano: 10500,
    priceSemiterminada: 6000,
    features: ['Ideal parejas', 'Distribución eficiente', 'Calidad-precio'],
    image: '/images/renders/6x4.jpg'
  },
  {
    id: '6x5',
    name: 'Cabaña 6x5',
    description: 'Diseño cómodo y funcional. Espacio ideal para vivienda simple con cocina comedor integrada.',
    size: '6x5',
    area: 30,
    bedrooms: 1,
    bathrooms: 1,
    priceLlaveEnMano: 13000,
    priceSemiterminada: 6500,
    features: ['Espacio integrado', 'Vivienda económica', 'Diseño moderno'],
    image: '/images/renders/6x5.jpg'
  },
  {
    id: '6x6',
    name: 'Cabaña 6x6',
    description: '2 dormitorios cómodos, cocina comedor y baño completo. Excelente distribución.',
    size: '6x6',
    area: 36,
    bedrooms: 2,
    bathrooms: 1,
    priceLlaveEnMano: 14500,
    priceSemiterminada: 7000,
    features: ['2 Dormitorios', 'Cocina comedor', 'Más solicitada 🔥'],
    image: '/images/renders/6x6.jpg'
  },
  {
    id: '6x7',
    name: 'Cabaña 6x7',
    description: '2 dormitorios, cocina comedor amplia. Ideal para familia pequeña.',
    size: '6x7',
    area: 42,
    bedrooms: 2,
    bathrooms: 1,
    priceLlaveEnMano: 15500,
    priceSemiterminada: 8000,
    features: ['Dormitorios amplios', 'Ambientes cómodos', 'Muy elegida'],
    image: '/images/renders/6x7.jpg'
  },
  {
    id: '6x8',
    name: 'Cabaña 6x8',
    description: '2 dormitorios cómodos, cocina comedor amplia. Ideal para vivienda permanente.',
    size: '6x8',
    area: 48,
    bedrooms: 2,
    bathrooms: 1,
    priceLlaveEnMano: 17500,
    priceSemiterminada: 9000,
    features: ['Para todo el año', 'Vivienda permanente', 'Gran confort'],
    image: '/images/renders/6x8.jpg'
  },
  {
    id: '6x9',
    name: 'Cabaña 6x9',
    description: '2 dormitorios amplios, cocina comedor, baño completo. Ideal para vivienda permanente.',
    size: '6x9',
    area: 54,
    bedrooms: 2,
    bathrooms: 1,
    priceLlaveEnMano: 19500,
    priceSemiterminada: 10000,
    features: ['Muy solicitada', 'Máxima amplitud', 'Distribución premium'],
    image: '/images/renders/6x9.jpg'
  },
  {
    id: '6x10',
    name: 'Cabaña 6x10',
    description: '3 dormitorios amplios, cocina comedor espaciosa, baño completo. Muy cómoda para vivienda familiar.',
    size: '6x10',
    area: 60,
    bedrooms: 3,
    bathrooms: 1,
    priceLlaveEnMano: 21500,
    priceSemiterminada: 11500,
    features: ['3 Dormitorios', 'Espaciosa', 'Ideal familias'],
    image: '/images/renders/6x10.jpg'
  },
  {
    id: '6x12',
    name: 'Cabaña 6x12',
    description: '3 o 4 dormitorios, living comedor amplio, baño completo. Excelente opción familiar.',
    size: '6x12',
    area: 72,
    bedrooms: 4,
    bathrooms: 1,
    priceLlaveEnMano: 24500,
    priceSemiterminada: 13000,
    features: ['Hasta 4 Dormitorios', 'Living gigante', 'Vivienda fija'],
    image: '/images/renders/6x12.jpg'
  }
]

export default function ModelosPage() {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<'todos' | '1-dorm' | '2-dorm' | '3+0-dorm'>('todos')

  const handleImageError = (modelId: string) => {
    setImgErrors(prev => ({ ...prev, [modelId]: true }))
  }

  // Filtrado moderno dinámico
  const filteredModels = models.filter(model => {
    if (filter === '1-dorm') return model.bedrooms === 1
    if (filter === '2-dorm') return model.bedrooms === 2
    if (filter === '3+0-dorm') return model.bedrooms >= 3
    return true
  })

  return (
    <div className="bg-gray-50 min-h-screen selection:bg-amber-500 selection:text-white">
      
      {/* Header Contextualizado */}
      <section className="relative bg-gray-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-400 uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Catálogo Técnico Completamente Personalizable
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Nuestros Modelos Base
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Elegí las dimensiones ideales para tu proyecto. Todos nuestros diseños cuentan con un ancho estructural fijo de <strong className="text-white">6 metros</strong> y largos adaptables desde <strong className="text-white">3 hasta 12 metros</strong>.
          </p>
        </div>
      </section>

      {/* Control de Filtros Estilizado */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: '1-dorm', label: '1 Dormitorio' },
            { id: '2-dorm', label: '2 Dormitorios' },
            { id: '3+0-dorm', label: '3+ Dormitorios' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === btn.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de Modelos Trabajado */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModels.map((model) => (
            <div 
              key={model.id} 
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              {/* Contenedor de Imagen / Render */}
              <div className="relative h-60 overflow-hidden bg-gray-100">
                {!imgErrors[model.id] ? (
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => handleImageError(model.id)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400">
                    <span className="text-4xl mb-2 filter grayscale group-hover:grayscale-0 transition-all">🏠</span>
                    <span className="font-semibold text-xs uppercase tracking-wider text-gray-400">{model.size} Mts</span>
                  </div>
                )}
                {/* Badge de Metraje Superpuesto */}
                <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-white/10">
                  {model.area} m² cubiertos
                </div>
              </div>
              
              {/* Información y Cuerpo */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
                  {model.name}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4 min-h-[40px]">
                  {model.description}
                </p>
                
                {/* Atributos Técnicos en Fila Estilizada */}
                <div className="grid grid-cols-3 gap-2 border-y border-gray-100 py-3 mb-5 text-gray-600">
                  <div className="flex flex-col items-center justify-center text-center border-r border-gray-100">
                    <Ruler className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="text-xs font-semibold text-gray-800">{model.size} m</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center border-r border-gray-100">
                    <Bed className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="text-xs font-semibold text-gray-800">{model.bedrooms} {model.bedrooms === 1 ? 'Dorm' : 'Dorms'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center">
                    <Bath className="w-4 h-4 text-amber-600 mb-1" />
                    <span className="text-xs font-semibold text-gray-800">{model.bathrooms} Baño</span>
                  </div>
                </div>
                
                {/* Estructura de Costos Traducida a UI Limpia */}
                <div className="space-y-2 mb-6 mt-auto">
                  <div className="flex justify-between items-center px-3 py-2.5 bg-amber-500/[0.04] border border-amber-500/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-gray-700">Llave en mano</span>
                    </div>
                    <span className="text-base font-bold text-amber-700">
                      USD {model.priceLlaveEnMano.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-600">Semiterminada</span>
                    </div>
                    <span className="text-base font-bold text-gray-700">
                      USD {model.priceSemiterminada.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Micro Tags de Atractivos */}
                <div className="flex flex-wrap gap-1 mb-5">
                  {model.features.map((feature, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
                
                {/* Acción Principal */}
                <Link
                  href={`/configurador?model=${model.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow group/btn"
                >
                  <span>Cotizar y Personalizar</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección Técnica Comparativa (¿Qué incluye?) */}
      <section className="py-16 bg-gray-100/70 border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Modalidades de Entrega Estandarizadas</h2>
            <p className="text-sm text-gray-500 mt-1">Transparencia total en el proceso de obra</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Caja Llave en Mano */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8" />
              <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-4">
                <span className="p-1.5 bg-amber-500/10 text-amber-700 rounded-lg">🏠</span>
                ¿Qué incluye el sistema Llave en Mano?
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {[
                  'Revestimiento completo interior en yeso super pulido',
                  'Baño completo revestido con cerámica de calidad',
                  'Aislación térmica termo-acústica de alto rendimiento',
                  'Instalación completa embutida de luz (fases) y agua',
                  'Mobiliario de cocina integrado (aéreo y bajo mesada)',
                  'Piso de madera seleccionado de alta resistencia',
                  'Estructura sobreelevada del suelo natural (entre 50 y 60 cm)',
                  'Techo de chapa trapezoidal reforzada calibre 26 (color elegible)'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 -mx-6 -mb-6 p-4">
                <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-700">Costos logísticos externos no incluidos:</strong> Pozo negro/séptico, traslados/fletes al predio, ni plateas de hormigón si el terreno lo exigiera.</span>
              </div>
            </div>
            
            {/* Caja Semiterminada */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden">
              <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2 mb-4">
                <span className="p-1.5 bg-gray-100 text-gray-700 rounded-lg">🔨</span>
                ¿Qué incluye el sistema Semiterminada?
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-5">
                {[
                  'Estructura portante perimetral y divisoria completa',
                  'Paredes exteriores e interiores totalmente levantadas',
                  'Techo principal instalado y asegurado contra filtraciones',
                  'Aberturas principales (puertas y ventanas exteriores) colocadas'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <X className="w-3.5 h-3.5 text-red-500" /> Ítems excluidos de este módulo:
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-5">
                <div>✗ Enhebrado e instalación eléctrica</div>
                <div>✗ Conexiones e instalación sanitaria</div>
                <div>✗ Esquemas de pintura y sellado</div>
                <div>✗ Revestimientos y terminaciones finas</div>
              </div>

              <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/10 text-xs text-amber-800">
                💡 <span className="font-semibold">Tip de ahorro:</span> Podés añadir módulos parciales como el baño instalado o el kit de cocina como adicionales directos usando el configurador interactivo.
              </div>
            </div>
          </div>
          
          {/* Ficha Técnica de Materiales */}
          <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 md:p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-4 bg-white/5 rounded-2xl text-amber-400 flex-shrink-0">
              <Trees className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1.5">Origen y Tratamiento de la Materia Prima</h3>
              <p className="text-sm text-gray-300 leading-relaxed max-w-4xl">
                Nuestras construcciones emplean exclusivamente <strong className="text-amber-400 font-semibold">Pino Nacional Seleccionado de alta densidad</strong>. Cada pieza utiliza tablas machimbradas estrictamente secadas a horno para neutralizar movimientos moleculares y es tratada preventivamente con compuestos químicos protectores e hidrófugos de alta penetración contra xilófagos y humedad climática uruguaya.
              </p>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                <span>🔧</span> <span className="italic">Plan de conservación óptimo: Reaplique una capa de protector/lasur para madera exterior una vez al año para garantizar vida útil indefinida.</span>
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
