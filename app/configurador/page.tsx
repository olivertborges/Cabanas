import ConfiguratorWizard from '@/components/configurator/ConfiguratorWizard'

export const metadata = {
  title: 'Configurador de Cabañas | Diseña tu cabaña ideal',
  description: 'Personalizá tu cabaña en tiempo real. Elegí tamaño, distribución y materiales. Conocé el precio al instante.'
}

export default function ConfiguradorPage() {
  return (
    <>
      <section className="bg-gradient-to-r from-primary to-dark text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Configurá tu cabaña
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            Seleccioná las opciones que más te gusten y mirá cómo cambia el precio en tiempo real
          </p>
        </div>
      </section>
      <ConfiguratorWizard />
    </>
  )
}