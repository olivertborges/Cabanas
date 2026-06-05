import { ConfigOptions } from './priceCalculator'

const WHATSAPP_NUMBER = '59897741459' // Reemplazá con tu número de WhatsApp

// Función para obtener el texto del tamaño
const getSizeText = (options: ConfigOptions): string => {
  if (options.size === 'custom' && options.customSize) {
    return `6x${options.customSize} (${6 * options.customSize} m²)`
  }
  return options.size
}

// Función para obtener los extras seleccionados como texto
const getExtrasText = (options: ConfigOptions): string => {
  const extrasMap: Record<string, string> = {
    'platea_hormigon': '🏗️ Platea de hormigón',
    'pozo_negro': '💧 Pozo negro',
    'alero': `🌿 Alero (${options.aleroMetros || 0} metros)`,
    'caminador_con_alero': `🚶 Caminador con alero (${options.caminadorMetros || 0} metros)`,
    'piso_ceramico': '🪟 Piso cerámico (reemplaza madera)',
    'banio_semiterminada': '🚽 Baño completo',
    'cocina_extra': '🍳 Cocina completa'
  }
  
  const selectedExtras = options.extras
    .filter(extra => extrasMap[extra])
    .map(extra => extrasMap[extra])
  
  if (selectedExtras.length === 0) return 'Ninguno'
  return selectedExtras.join(', ')
}

export function generateWhatsAppMessage(
  options: ConfigOptions,
  totalUSD: number,
  totalUYU: number
): string {
  const finishText = options.finishType === 'llave_en_mano' ? 'Llave en mano 🏠' : 'Semiterminada 🔨'
  const sizeText = getSizeText(options)
  const extrasText = getExtrasText(options)
  
  const message = `
¡Hola! Quiero información sobre esta cabaña personalizada:

🔨 Tipo: ${finishText}
📐 Tamaño: ${sizeText}
✨ Extras seleccionados: ${extrasText}

💵 Precio estimado USD: USD ${totalUSD.toLocaleString()}
💵 Precio estimado UYU: $U ${totalUYU.toLocaleString()}

Quedo atento a más información.
  `.trim()
  
  return encodeURIComponent(message)
}

export function getWhatsAppLink(
  options: ConfigOptions,
  totalUSD: number,
  totalUYU: number
): string {
  const message = generateWhatsAppMessage(options, totalUSD, totalUYU)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
}