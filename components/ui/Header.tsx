'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Home, Settings, Image, Phone, Layers } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Efecto para cambiar el fondo al hacer scroll (le da un toque premium)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Modelos', href: '/modelos', icon: Layers },
    { name: 'Configurador', href: '/configurador', icon: Settings },
    { name: 'Galería', href: '/galeria', icon: Image },
    { name: 'Contacto', href: '#contacto', icon: Phone },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100' 
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
              🏕️
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-amber-700 transition-colors">
                Cabañas
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 -mt-1">
                Personalizadas
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 relative group"
              >
                {item.name}
                {/* Línea sutil decorativa que aparece al pasar el mouse */}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-amber-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
            
            {/* Botón Call to Action integrado opcional para darle más nivel */}
            <Link 
              href="#contacto" 
              className="ml-4 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-full shadow-sm hover:shadow transition-all duration-200"
            >
              Presupuesto
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu con transición de slide/fade sutil */}
      <div
        className={`md:hidden absolute w-full bg-white border-b border-gray-200 shadow-xl transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'opacity-100 translate-y-0 visible' 
            : 'opacity-0 -translate-y-4 invisible pointer-events-none'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1.5 sm:px-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-amber-700 hover:bg-amber-50 active:bg-amber-100 transition-all"
              >
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-amber-600" />
                <span>{item.name}</span>
              </Link>
            )
          })}
          
          <div className="pt-4 px-4">
            <Link
              href="#contacto"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-full px-4 py-3 bg-amber-600 text-white font-medium rounded-xl shadow-md"
            >
              Solicitar Presupuesto
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
