'use client'

import { MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '59897741459' // Reemplazá con tu número

export default function WhatsAppButton() {
  const handleClick = () => {
    const message = encodeURIComponent(
      '¡Hola! Quiero información sobre las cabañas personalizadas.'
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 z-50 group"
    >
      <MessageCircle size={28} />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
        Consultanos por WhatsApp
      </span>
    </button>
  )
}