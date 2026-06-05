import modelsData from '@/data/models.json'
import ModelCard from '@/components/ui/ModelCard'

export const metadata = {
  title: 'Modelos de Cabañas | Conocé nuestros diseños',
  description: 'Explorá nuestros modelos de cabañas personalizables. Encontrá el diseño perfecto para vos.'
}

export default function ModelosPage() {
  return (
    <>
      <section className="bg-gradient-to-r from-primary to-dark text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Nuestros modelos
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            Elegí el diseño base que más te guste y personalizalo a tu medida
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modelsData.map((model) => (
              <ModelCard key={model.id} {...model} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}