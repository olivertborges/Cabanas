import Hero from '@/components/ui/Hero'
import Link from 'next/link'
import { ArrowRight, Ruler, Bed, Bath, Sparkles } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Ruler className="w-8 h-8 text-primary" />,
      title: 'Personalización total',
      description: 'Elegí tamaño, distribución, materiales y terminaciones.'
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: 'Precio al instante',
      description: 'Configurá y conocé el precio en tiempo real sin llamar.'
    },
    {
      icon: <Bed className="w-8 h-8 text-primary" />,
      title: 'Planos interactivos',
      description: 'Visualizá la distribución según tus elecciones.'
    },
    {
      icon: <Bath className="w-8 h-8 text-primary" />,
      title: 'Asesoramiento personalizado',
      description: 'Contactanos por WhatsApp para resolver tus dudas.'
    }
  ]

  return (
    <>
      <Hero />
      
      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Llevamos más de 10 años construyendo los sueños de nuestros clientes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comenzá a diseñar tu cabaña hoy
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Sin compromiso, sin llamadas. Descubrí el precio de tu cabaña ideal.
          </p>
          <Link href="/configurador" className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105">
            Configurar ahora
          </Link>
        </div>
      </section>
    </>
  )
}