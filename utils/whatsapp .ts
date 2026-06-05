import { ConfigOptions } from './priceCalculator'

const WHATSAPP_NUMBER = '59897741459' // Reemplazá con tu número de WhatsApp (sin +)

export function generateWhatsAppMessage(
  options: ConfigOptions,
  totalUSD: number,
  totalUYU: number
): string {
  const extrasText = options.extras.length > 0 
    ? `Extras: ${options.extras.join(', ')}\n` 
    : ''
  
  const sizeText = options.size === 'custom' && options.customSize
    ? `${options.customSize} m²`
    : options.size
  
  const message = `
¡Hola! Quiero información sobre esta cabaña personalizada:

📐 Tamaño: ${sizeText}
🛏️ Dormitorios: ${options.bedrooms}
🚽 Baños: ${options.bathrooms}
🏠 Techo: ${options.roof}
🌿 Alero: ${options.eaves}
🏠 Revestimiento: ${options.flooring}
${extrasText}
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