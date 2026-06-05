'use client'

import { useState } from 'react'
import galleryData from '@/data/gallery.json'

export default function GaleriaPage() {
  const [selectedCategory, setSelectedCategory] = useState('exteriores')
  
  const categories = galleryData.map(cat => cat.category)
  const currentImages = galleryData.find(cat => cat.category === selectedCategory)?.images || []

  return (
    <>
      <section className="bg-gradient-to-r from-primary to-dark text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Galería de proyectos
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            Conocé nuestras cabañas construidas y dejate inspirar
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full capitalize transition ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentImages.map((image, idx) => (
              <div key={idx} className="card group overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image}
                    alt={`${selectedCategory} ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
            ))}
          </div>

          {currentImages.length === 0 && (
            <p className="text-center text-gray-500 py-12">
              No hay imágenes disponibles en esta categoría.
            </p>
          )}
        </div>
      </section>
    </>
  )
}