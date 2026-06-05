import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import WhatsAppButton from '@/components/configurator/WhatsAppButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cabañas Personalizadas | Diseña tu cabaña ideal',
  description: 'Configura tu cabaña personalizada, calcula el precio al instante y recibe tu presupuesto sin necesidad de llamar.',
  keywords: 'cabañas, construcción de cabañas, cabañas personalizadas, precios de cabañas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}