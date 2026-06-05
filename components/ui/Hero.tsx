'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center bg-gradient-to-r from-dark/80 to-primary/80">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Diseña tu cabaña ideal
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Conocé el precio al instante sin llamar ni escribir. Personalizala a tu gusto.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/configurador" className="btn-primary inline-block">
            Configurar mi cabaña
          </Link>
          <Link href="/modelos" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Ver modelos
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-16">
          <div>
            <div className="text-2xl font-bold">10+</div>
            <div className="text-sm">Modelos</div>
          </div>
          <div>
            <div className="text-2xl font-bold">50+</div>
            <div className="text-sm">Cabañas construidas</div>
          </div>
          <div>
            <div className="text-2xl font-bold">100%</div>
            <div className="text-sm">Personalizables</div>
          </div>
        </div>
      </div>
    </section>
  )
}