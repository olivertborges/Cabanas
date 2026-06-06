'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Building2, ShieldCheck, Hammer } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] md:h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden bg-gray-950">
      
      {/* Background Image con efecto de Zoom lento continuo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 animate-[subtle-zoom_20s_ease-out_infinite-alternate]"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
          }}
        />
        {/* Overlay premium: degradado oscuro que asegura legibilidad total */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-gray-950/40" />
      </div>

      {/* Contenedor Principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 text-center text-white flex flex-col items-center justify-center h-full">
        
        {/* Badge superior animado (Micro-interacción) */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-wide text-amber-300 mb-6 animate-fade-in-down">
          <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
          <span>Configurador Online 3D Disponible</span>
        </div>

        {/* Título Principal Trabajado */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6 drop-shadow-sm">
          Diseñá la cabaña de tus <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            sueños a tu medida
          </span>
        </h1>

        {/* Bajada de texto con mejor peso visual */}
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Conocé el precio estimado al instante sin llamadas ni esperas. 
          Elegí los materiales, la distribución y personalizala a tu gusto.
        </p>

        {/* Botones / CTA con efectos hover avanzados */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto mb-20">
          <Link 
            href="/configurador" 
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-2xl shadow-xl shadow-amber-900/20 hover:shadow-amber-600/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            {/* Brillo interno al pasar el mouse */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span>Configurar mi cabaña</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          
          <Link 
            href="/modelos" 
            className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            Ver modelos preestablecidos
          </Link>
        </div>

        {/* Sección de Estadísticas en Tarjetas Flotantes */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mt-auto">
          
          <div className="flex items-center gap-4 bg-white/[0.04] backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl text-left hover:bg-white/[0.08] transition-colors duration-300">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">+10</div>
              <div className="text-sm text-gray-400 font-medium">Modelos Base</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.04] backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl text-left hover:bg-white/[0.08] transition-colors duration-300">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Hammer className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">+50</div>
              <div className="text-sm text-gray-400 font-medium">Proyectos Entregados</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.04] backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl text-left hover:bg-white/[0.08] transition-colors duration-300">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">100%</div>
              <div className="text-sm text-gray-400 font-medium">Personalizables</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
