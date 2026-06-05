'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Grid, LayoutGrid, ZoomIn, ImageIcon, Home, LayoutDashboard, Utensils, Bath, Bed, Building2 } from 'lucide-react'

const iconMap: Record<string, any> = {
  Home, LayoutGrid: LayoutDashboard, Utensils, Bath, Bed, Building2
}

const categoryNames: Record<string, string> = {
  exteriores: 'Exteriores',
  interiores: 'Interiores',
  cocinas: 'Cocinas',
  baños: 'Baños',
  dormitorios: 'Dormitorios',
  destacados: 'Destacados'
}

const categoryIcons: Record<string, any> = {
  exteriores: Home,
  interiores: LayoutDashboard,
  cocinas: Utensils,
  baños: Bath,
  dormitorios: Bed,
  destacados: Building2
}

const categoryColors: Record<string, string> = {
  exteriores: 'bg-blue-500',
  interiores: 'bg-green-500',
  cocinas: 'bg-orange-500',
  baños: 'bg-cyan-500',
  dormitorios: 'bg-purple-500',
  destacados: 'bg-red-500'
}

interface GalleryData {
  [category: string]: {
    images: string[]
    titles: string[]
    descriptions: string[]
  }
}

export default function GaleriaPage() {
  const [selectedCategory, setSelectedCategory] = useState('exteriores')
  const [selectedImage, setSelectedImage] = useState<{ image: string; title: string; description: string; category: string; index: number } | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid')
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})

  // Cargar imágenes desde la API
  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        setGalleryData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading gallery:', err)
        setLoading(false)
      })
  }, [])

  const currentImages = galleryData?.[selectedCategory] || { images: [], titles: [], descriptions: [] }
  const filteredImages = currentImages.images.map((img, idx) => ({
    image: img,
    title: currentImages.titles[idx] || 'Sin título',
    description: currentImages.descriptions[idx] || 'Cabaña personalizada'
  }))

  const handlePrev = () => {
    if (!selectedImage) return
    const newIndex = selectedImage.index > 0 ? selectedImage.index - 1 : filteredImages.length - 1
    setSelectedImage({
      ...filteredImages[newIndex],
      category: selectedCategory,
      index: newIndex
    })
  }

  const handleNext = () => {
    if (!selectedImage) return
    const newIndex = selectedImage.index < filteredImages.length - 1 ? selectedImage.index + 1 : 0
    setSelectedImage({
      ...filteredImages[newIndex],
      category: selectedCategory,
      index: newIndex
    })
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedImage) return
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') setSelectedImage(null)
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, filteredImages])

  const handleImageLoad = (imageKey: string) => {
    setLoadedImages(prev => ({ ...prev, [imageKey]: true }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando galería...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <section className="relative bg-gradient-to-r from-primary to-dark text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Nuestra galería
          </h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Conocé nuestros proyectos y dejate inspirar por la calidad de nuestras cabañas
          </p>
          <p className="text-sm mt-4 opacity-70">
            📸 {Object.values(galleryData || {}).reduce((acc, cat) => acc + cat.images.length, 0)} imágenes disponibles
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="sticky top-16 z-20 bg-white shadow-md py-4">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              {Object.keys(galleryData || {}).map((cat) => {
                const Icon = categoryIcons[cat]
                const imageCount = galleryData?.[cat]?.images.length || 0
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      selectedCategory === cat
                        ? `${categoryColors[cat]} text-white shadow-lg scale-105`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{categoryNames[cat]}</span>
                    <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
                      {imageCount}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`p-2 rounded transition ${
                  viewMode === 'masonry' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="py-12">
        <div className="container-custom">
          {filteredImages.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No hay imágenes en esta categoría</p>
              <p className="text-sm text-gray-400">Agregá imágenes a la carpeta <code className="bg-gray-100 px-2 py-1 rounded">public/images/gallery/{selectedCategory}/</code></p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'
            }>
              {filteredImages.map((image, idx) => {
                const imageKey = `${selectedCategory}-${idx}`
                return (
                  <div
                    key={idx}
                    className={`group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                      viewMode === 'masonry' ? 'break-inside-avoid' : ''
                    }`}
                    onClick={() => setSelectedImage({
                      ...image,
                      category: selectedCategory,
                      index: idx
                    })}
                  >
                    {!loadedImages[imageKey] && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                    )}
                    
                    <img
                      src={image.image}
                      alt={image.title}
                      className={`w-full h-80 object-cover transition-all duration-700 group-hover:scale-110 ${
                        loadedImages[imageKey] ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => handleImageLoad(imageKey)}
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.jpg'
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
                      
                    
                        <div className="flex items-center gap-2 mt-3">
                          <ZoomIn size={18} />
                          <span className="text-sm">Ver más</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {categoryNames[selectedCategory]}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
          >
            <X size={32} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-primary transition bg-black/50 p-3 rounded-full"
          >
            <ChevronLeft size={32} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-primary transition bg-black/50 p-3 rounded-full"
          >
            <ChevronRight size={32} />
          </button>
          
          <div 
            className="max-w-5xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
    
              <p className="text-sm text-gray-300 mt-2">Categoría: {categoryNames[selectedImage.category]}</p>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
            {selectedImage.index + 1} / {filteredImages.length}
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Te gustó alguna cabaña?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Personalizala a tu gusto y recibí un presupuesto sin compromiso
          </p>
          <a
            href="/configurador"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
          >
            Configurar mi cabaña
          </a>
        </div>
      </section>
    </>
  )
}