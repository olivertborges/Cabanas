'use client'

import Link from 'next/link'
import { Facebook, Instagram, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Grilla Principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 pb-12">
          
          {/* Columna 1: Sobre Nosotros (Más ancha para mejor balance) */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl transition-transform duration-300 group-hover:rotate-12">🏕️</span>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Cabañas
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500 -mt-1">
                  Personalizadas
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
              Diseñamos y construimos la cabaña de tus sueños con tecnología de personalización en tiempo real y los más altos estándares de calidad.
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="md:col-span-2 md:col-start-6">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">
              Explorar
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'Inicio', href: '/' },
                { name: 'Modelos', href: '/modelos' },
                { name: 'Configurador', href: '/configurador' },
                { name: 'Galería', href: '/galeria' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="hover:text-amber-400 transition-colors duration-200 flex items-center gap-0.5 group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="tel:+59897741459" 
                  className="flex items-center space-x-3 hover:text-white transition-colors group"
                >
                  <div className="p-2 bg-gray-900 rounded-lg group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>+598 97 741 459</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:cabanasrodriguez@gmail.com" 
                  className="flex items-center space-x-3 hover:text-white transition-colors group"
                >
                  <div className="p-2 bg-gray-900 rounded-lg group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="break-all">cabanasrodriguez@gmail.com</span>
                </a>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Montevideo, Uruguay</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Redes Sociales */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">
              Seguinos
            </h3>
            <div className="flex space-x-3">
              <a 
                href="https://www.facebook.com/cabanasrodriguezas/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-gray-900 hover:bg-amber-600 text-gray-400 hover:text-white rounded-xl transition-all duration-300 hover:-translate-y-1 block"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/casasprefabricadas.uy?igsh=OTNkaDllbHEyeGZ4" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-gray-900 hover:bg-amber-600 text-gray-400 hover:text-white rounded-xl transition-all duration-300 hover:-translate-y-1 block"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        {/* Línea divisoria y Copyright */}
        <div className="border-t border-gray-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {currentYear} Cabañas Personalizadas. Todos los derechos reservados.</p>
          <div className="flex space-x-6 text-gray-500">
            <Link href="#" className="hover:text-gray-400 transition-colors">Política de Privacidad</Link>
            <Link href="#" className="hover:text-gray-400 transition-colors">Términos de Servicio</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
