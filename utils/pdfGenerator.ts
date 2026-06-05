import { ConfigOptions, PriceBreakdown } from './priceCalculator'

export function generatePDFBlob(
  options: ConfigOptions,
  prices: PriceBreakdown,
  totalUSD: number,
  totalUYU: number
): void {
  // Función simple para generar HTML y convertir a PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Presupuesto Cabaña Personalizada</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2D6A4F; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td, th { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-size: 24px; font-weight: bold; color: #2D6A4F; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <h1>Presupuesto - Cabaña Personalizada</h1>
      <p>Fecha: ${new Date().toLocaleDateString('es-UY')}</p>
      
      <h2>Configuración seleccionada</h2>
      <table>
        <tr><td><strong>Tamaño:</strong></td><td>${options.size === 'custom' && options.customSize ? `${options.customSize} m²` : options.size}</td></tr>
        <tr><td><strong>Dormitorios:</strong></td><td>${options.bedrooms}</td></tr>
        <tr><td><strong>Baños:</strong></td><td>${options.bathrooms}</td></tr>
        <tr><td><strong>Tipo de techo:</strong></td><td>${options.roof}</td></tr>
        <tr><td><strong>Alero:</strong></td><td>${options.eaves}</td></tr>
        <tr><td><strong>Revestimiento:</strong></td><td>${options.flooring}</td></tr>
        <tr><td><strong>Extras:</strong></td><td>${options.extras.length > 0 ? options.extras.join(', ') : 'Ninguno'}</td></tr>
      </table>
      
      <h2>Detalle de precios</h2>
      <table>
        <tr><td>Precio base:</td><td>USD ${prices.base.toLocaleString()}</td></tr>
        <tr><td>Dormitorios extra:</td><td>USD ${prices.bedrooms.toLocaleString()}</td></tr>
        <tr><td>Baños extra:</td><td>USD ${prices.bathrooms.toLocaleString()}</td></tr>
        <tr><td>Techo:</td><td>USD ${prices.roof.toLocaleString()}</td></tr>
        <tr><td>Alero:</td><td>USD ${prices.eaves.toLocaleString()}</td></tr>
        <tr><td>Revestimiento:</td><td>USD ${prices.flooring.toLocaleString()}</td></tr>
        <tr><td>Extras:</td><td>USD ${prices.extras.toLocaleString()}</td></tr>
        <tr style="border-top: 2px solid #000;"><td><strong>TOTAL USD:</strong></td><td><strong>USD ${totalUSD.toLocaleString()}</strong></td></tr>
        <tr><td><strong>TOTAL UYU:</strong></td><td><strong>$U ${totalUYU.toLocaleString()}</strong></td></tr>
      </table>
      
      <p>Este presupuesto tiene una validez de 30 días.</p>
      <div class="footer">
        <p>Cabañas Personalizadas - www.tucabaña.vercel.app</p>
        <p>📞 Contacto por WhatsApp</p>
      </div>
    </body>
    </html>
  `
  
  // Abrir en nueva ventana para imprimir/guardar como PDF
  const win = window.open()
  if (win) {
    win.document.write(htmlContent)
    win.document.close()
    win.print()
  }
}