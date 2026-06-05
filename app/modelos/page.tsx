'use client'

import Link from 'next/link'
import { Ruler, Bed, Bath, Home, Building2, ArrowRight } from 'lucide-react'
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
    features: ['Monoambiente', 'Perfecta para inversión', 'Bajo mantenimiento'],
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
    features: ['Perfecta para pareja', 'Distribución eficiente', 'Buena relación calidad-precio'],
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
    features: ['Cocina comedor integrada', 'Vivienda económica', 'Moderna'],
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
    features: ['2 dormitorios', 'Cocina comedor', 'Una de las más solicitadas'],
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
    features: ['2 dormitorios amplios', 'Cocina comedor amplia', 'Muy elegida'],
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
    features: ['Excelente distribución', 'Para vivir todo el año', 'Muy cómoda'],
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
    features: ['Muy solicitada', 'Amplia y cómoda', 'Excelente distribución'],
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
    features: ['3 dormitorios', 'Cocina comedor espaciosa', 'Ideal para familia'],
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
    features: ['Hasta 4 dormitorios', 'Living comedor amplio', 'Para vivir fijo'],
    image: '/images/renders/6x12.jpg'
  }
]

export default function ModelosPage() {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (modelId: string) => {
    setImgErrors(prev => ({ ...prev, [modelId]: true }))
  }

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-dark text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Nuestros modelos
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            Elegí el tamaño que mejor se adapte a tus necesidades.
            <br />
            Ancho fijo de <strong>6 metros</strong>, largo variable de <strong>3 a 12 metros</strong>.
          </p>
        </div>
      </section>

      {/* Grid de modelos */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {models.map((model) => (
              <div key={model.id} className="card group">
                {/* Imagen */}
                <div className="relative h-56 overflow-hidden bg-gray-300">
                  {!imgErrors[model.id] ? (
                    <img
                      src={model.image}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => handleImageError(model.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                      <span className="text-4xl mb-2">🏠</span>
                      <span className="text-gray-400 text-sm">{model.size}</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                    {model.area} m²
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-primary mb-2">{model.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{model.description}</p>
                  
                  {/* Características */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Ruler size={18} className="text-primary" />
                      <span className="text-sm">{model.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed size={18} className="text-primary" />
                      <span className="text-sm">{model.bedrooms} dorm.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath size={18} className="text-primary" />
                      <span className="text-sm">{model.bathrooms} baño</span>
                    </div>
                  </div>
                  
                  {/* Precios */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <div className="flex items-center gap-2">
                        <Home size={16} className="text-primary" />
                        <span className="text-sm font-medium">Llave en mano:</span>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        USD {model.priceLlaveEnMano.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-600" />
                        <span className="text-sm font-medium">Semiterminada:</span>
                      </div>
                      <span className="text-lg font-bold text-gray-700">
                        USD {model.priceSemiterminada.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Características destacadas */}
                  <div className="mb-4">
                    {model.features.map((feature, idx) => (
                      <span key={idx} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {/* Botón */}
                  <Link
                    href={`/configurador?model=${model.id}`}
                    className="flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition w-full"
                  >
                    Personalizar
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Información adicional */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-primary mb-3">🏠 ¿Qué incluye Llave en Mano?</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Revestimiento interior en yeso</li>
                <li>✓ Baño completo con cerámica</li>
                <li>✓ Aislación térmica</li>
                <li>✓ Instalación de luz y agua</li>
                <li>✓ Cocina con aéreo y bajo mesada</li>
                <li>✓ Piso de madera</li>
                <li>✓ Elevada del suelo entre 50 y 60 cm</li>
                <li>✓ Techo en chapa trapezoidal calibre 26 (color a elección)</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">❌ No incluye: pozo negro, flete, platea de hormigón</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-primary mb-3">🔨 ¿Qué incluye Semiterminada?</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Estructura completa</li>
                <li>✓ Paredes y techo instalado</li>
                <li>✓ Puertas y ventanas colocadas</li>
                <li>✓ División de ambientes según modelo</li>
              </ul>
              <p className="text-sm font-semibold mt-3 text-amber-600">❌ No incluye:</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✗ Instalación eléctrica</li>
                <li>✗ Instalación sanitaria</li>
                <li>✗ Pintura</li>
                <li>✗ Terminaciones finales</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">💡 Podés agregar baño y cocina como extras en el configurador</p>
            </div>
          </div>
          
          {/* Materiales */}
          <div className="mt-8 bg-primary/5 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-primary mb-2">🌲 Materiales de construcción</h3>
            <p className="text-gray-700">
              Trabajamos con <strong>pino nacional de alta calidad</strong>, utilizando tabla machimbrada secada a horno 
              y tratada con productos especiales para brindar mayor durabilidad y resistencia. 
              La madera se protege con tratamiento impermeabilizante y protector.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              🛠️ Mantenimiento recomendado: aplicar protector a la madera una vez al año.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}