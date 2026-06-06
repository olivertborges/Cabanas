'use client'

import Hero from '@/components/ui/Hero'
import Link from 'next/link'
import { ArrowRight, Ruler, Bed, Bath, Sparkles, Home as HomeIcon } from 'lucide-react'
import InteractiveFloorPlan from '../components/configurator/InteractiveFloorPlan'

export default function HomePage() {
  const features = [
    {
      icon: <Ruler className="w-6 h-6 text-emerald-500" />,
      title: 'Personalización total',
      description: 'Elegí tamaño, distribución, materiales y terminaciones premium a tu medida.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      title: 'Precio al instante',
      description: 'Configurá y conocé el presupuesto en tiempo real, con total transparencia.'
    },
    {
      icon: <Bed className="w-6 h-6 text-blue-500" />,
      title: 'Planos interactivos',
      description: 'Diseñá en 2D y caminá tu proyecto al instante con nuestro renderizado 3D dinámico.'
    },
    {
      icon: <Bath className="w-6 h-6 text-purple-500" />,
      title: 'Asesoramiento experto',
      description: 'Conectá tu diseño directo con nuestros arquitectos e ingenieros por WhatsApp.'
    }
  ]

  const defaultCabinOptions = {
    size: '6x6' as const
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans antialiased selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      
      {/* 1. SECCIÓN HERO */}
      <Hero />
      
      {/* 2. SECCIÓN FEATURES (Diseño de Tarjetas Flotantes Avanzadas) */}
      <section className="py-24 relative bg-white border-b border-slate-100">
        {/* Decoración de fondo sutil */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block mb-3">
              Innovación Arquitectónica
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              ¿Por qué construir con nosotros?
            </h2>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Combinamos tecnología de diseño interactivo con más de 10 años de experiencia real en obras de alta gama.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Contenedor del ícono con efecto glow flotante */}
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
                
                {/* Detalle visual: barra decorativa inferior */}
                <div className="w-0 h-[3px] bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mt-6 group-hover:w-full transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN EXPERIENCIA INMERSIVA: EL CONFIGURADOR */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-slate-100/70 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Encabezado Inmersivo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full mb-4 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Estudio Digital en Vivo
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Modelá tu espacio en tiempo real
            </h2>
            <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
              Modificá las dimensiones en el plano dinámico <strong>2D</strong> y observá cómo cobra vida el amoblado inteligente dentro del renderizador <strong>3D</strong>.
            </p>
          </div>

          {/* Envoltorio del Configurador Premium con Efecto Neumórfico Suave */}
          <div className="bg-white/80 backdrop-blur-md p-3 sm:p-6 rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08)] border border-white relative group">
            {/* Esquinas decorativas de precisión tecnológica */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-slate-300 rounded-tl-lg pointer-events-none opacity-60" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-slate-300 rounded-tr-lg pointer-events-none opacity-60" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-slate-300 rounded-bl-lg pointer-events-none opacity-60" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-slate-300 rounded-br-lg pointer-events-none opacity-60" />
            
            <InteractiveFloorPlan options={defaultCabinOptions} />
          </div>

          <p className="text-center text-xs text-slate-400 font-medium mt-6">
            💡 Consejo: Usá dos dedos en móviles o la rueda del mouse en PC para orbitar y hacer zoom en la pestaña 3D.
          </p>
        </div>
      </section>

      {/* 4. SECCIÓN CTA CUMBRE (Diseño Cinemático Oscuro de Alto Impacto) */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        {/* Luces de fondo de alta gama */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Patrón sutil de grilla técnica de arquitectura de fondo */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10 animate-bounce">
            <HomeIcon className="w-6 h-6 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
            ¿Listo para materializar tu proyecto?
          </h2>
          
          <p className="text-base md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Accedé a nuestro configurador full. Podrás alterar la morfología de la madera, seleccionar revestimientos y obtener cotizaciones contractuales al instante.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/configurador" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 active:scale-98 transition transform duration-200 group text-base tracking-wide"
            >
              Lanzar Configurador Completo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="#demo"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 active:scale-98 transition transform duration-200 text-base"
            >
              Probar Demo Primero
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
