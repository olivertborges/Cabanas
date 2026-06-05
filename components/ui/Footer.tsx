import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre nosotros */}
          <div>
            <h3 className="text-xl font-bold mb-4">Cabañas Personalizadas</h3>
            <p className="text-gray-300">
              Diseñamos y construimos la cabaña de tus sueños con los más altos estándares de calidad.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-secondary transition">Inicio</Link></li>
              <li><Link href="/modelos" className="text-gray-300 hover:text-secondary transition">Modelos</Link></li>
              <li><Link href="/configurador" className="text-gray-300 hover:text-secondary transition">Configurador</Link></li>
              <li><Link href="/galeria" className="text-gray-300 hover:text-secondary transition">Galería</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Phone size={18} />
                <span>+598 99 999 999</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} />
                <span>info@cabanas.com.uy</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={18} />
                <span>Punta del Este, Uruguay</span>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-xl font-bold mb-4">Seguinos</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-secondary transition"><Facebook size={24} /></a>
              <a href="#" className="hover:text-secondary transition"><Instagram size={24} /></a>
              <a href="#" className="hover:text-secondary transition"><Twitter size={24} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2024 Cabañas Personalizadas - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}