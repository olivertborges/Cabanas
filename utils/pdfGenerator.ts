import { ConfigOptions, PriceBreakdown } from './priceCalculator'

export function generatePDFBlob(
  options: ConfigOptions,
  prices: PriceBreakdown,
  totalUSD: number,
  totalUYU: number
): void {
  // Obtener el tamaño de la cabaña
  const getSizeText = (): string => {
    if (options.size === 'custom' && options.customSize) {
      return `6x${options.customSize} (${6 * options.customSize} m²)`
    }
    return options.size
  }

  // Obtener el texto del tipo de entrega
  const finishText = options.finishType === 'llave_en_mano' ? 'Llave en mano 🏠' : 'Semiterminada 🔨'
  
  // Obtener lista de extras seleccionados
  const getExtrasList = (): string[] => {
    const extrasMap: Record<string, string> = {
      'platea_hormigon': '🏗️ Platea de hormigón',
      'pozo_negro': '💧 Pozo negro',
      'alero': `🌿 Alero (${options.aleroMetros || 0} metros)`,
      'caminador_con_alero': `🚶 Caminador con alero (${options.caminadorMetros || 0} metros)`,
      'piso_ceramico': '🪟 Piso cerámico (reemplaza madera)',
      'banio_semiterminada': '🚽 Baño completo',
      'cocina_extra': '🍳 Cocina completa'
    }
    
    return options.extras
      .filter(extra => extrasMap[extra])
      .map(extra => extrasMap[extra])
  }

  // Calcular anticipo (50%)
  const initialPayment = totalUSD * 0.5
  const finalPayment = totalUSD * 0.5

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Presupuesto Cabaña Personalizada</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 40px;
          color: #1B4332;
        }
        h1 {
          color: #2D6A4F;
          border-bottom: 3px solid #2D6A4F;
          padding-bottom: 10px;
        }
        h2 {
          color: #2D6A4F;
          margin-top: 25px;
          font-size: 18px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        td, th {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .total {
          font-size: 22px;
          font-weight: bold;
          color: #2D6A4F;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #2D6A4F;
        }
        .footer {
          margin-top: 40px;
          font-size: 11px;
          color: #666;
          text-align: center;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .price-detail {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }
        .warning {
          color: #856404;
          background-color: #fff3cd;
          padding: 10px;
          border-radius: 5px;
          font-size: 12px;
          margin: 10px 0;
        }
        .not-included {
          background-color: #f8d7da;
          padding: 10px;
          border-radius: 5px;
          font-size: 12px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🏕️ Cabañas Rodriguez</div>
        <h1>Presupuesto - Cabaña Personalizada</h1>
        <p>Fecha: ${new Date().toLocaleDateString('es-UY')}</p>
      </div>
      
      <h2>📐 Configuración seleccionada</h2>
      <table>
        <tr><td><strong>Tipo de entrega:</strong></td><td>${finishText}</td></tr>
        <tr><td><strong>Tamaño:</strong></td><td>${getSizeText()}</td></tr>
        <tr><td><strong>Ancho:</strong></td><td>6 metros</td></tr>
        <tr><td><strong>Largo:</strong></td><td>${options.size === 'custom' && options.customSize ? options.customSize : options.size.split('x')[1]} metros</td></tr>
      </table>
      
      <h2>💰 Desglose de precios (USD)</h2>
      <div class="price-detail">
        <table>
          <tr><td>Precio base (${finishText}):</td><td><strong>USD ${(prices.base || 0).toLocaleString()}</strong></td></tr>
          ${prices.platea > 0 ? `<tr><td>🏗️ Platea de hormigón:</td><td>USD ${prices.platea.toLocaleString()}</td></tr>` : ''}
          ${prices.pozoNegro > 0 ? `<tr><td>💧 Pozo negro:</td><td>USD ${prices.pozoNegro.toLocaleString()}</td></tr>` : ''}
          ${prices.alero > 0 ? `<tr><td>🌿 Alero:</td><td>USD ${prices.alero.toLocaleString()}</td></tr>` : ''}
          ${prices.caminador > 0 ? `<tr><td>🚶 Caminador con alero:</td><td>USD ${prices.caminador.toLocaleString()}</td></tr>` : ''}
          ${prices.pisoCeramico > 0 ? `<tr><td>🪟 Piso cerámico:</td><td>USD ${prices.pisoCeramico.toLocaleString()}</td></tr>` : ''}
          ${prices.banioSemiterminada > 0 ? `<tr><td>🚽 Baño completo:</td><td>USD ${prices.banioSemiterminada.toLocaleString()}</td></tr>` : ''}
          ${prices.cocinaExtra > 0 ? `<tr><td>🍳 Cocina completa:</td><td>USD ${prices.cocinaExtra.toLocaleString()}</td></tr>` : ''}
        </table>
      </div>
      
      <div class="total">
        <table>
          <tr style="border-top: 2px solid #2D6A4F;">
            <td><strong>TOTAL USD:</strong></td>
            <td><strong>USD ${(totalUSD || 0).toLocaleString()}</strong></td>
          </tr>
          <tr>
            <td><strong>TOTAL UYU:</strong></td>
            <td><strong>$U ${(totalUYU || 0).toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>
      
      <h2>💳 Condiciones de pago</h2>
      <table>
        <tr><td>🔹 Anticipo (50%):</td><td><strong>USD ${(initialPayment || 0).toLocaleString()}</strong></td></tr>
        <tr><td>🔹 Saldo al finalizar (50%):</td><td><strong>USD ${(finalPayment || 0).toLocaleString()}</strong></td></tr>
      </table>
      <p class="warning">
        ⚠️ El 50% se abona al llegar con los materiales al terreno. El 50% restante al finalizar la obra.
      </p>
      
      <h2>✨ Extras seleccionados</h2>
      ${getExtrasList().length > 0 ? 
        `<ul>${getExtrasList().map(extra => `<li>${extra}</li>`).join('')}</ul>` : 
        '<p>No se seleccionaron extras adicionales.</p>'}
      
      <div class="not-included">
        <strong>❌ No incluido en el presupuesto:</strong>
        <ul>
          <li>🚛 Flete (se calcula según ubicación)</li>
          <li>⚡ Instalaciones eléctricas y sanitarias (solo para semiterminada)</li>
          <li>🎨 Pintura (solo para semiterminada)</li>
        </ul>
      </div>
      
      <div class="warning">
        <strong>📋 Notas importantes:</strong>
        <ul>
          <li>La platea de hormigón requiere terreno nivelado</li>
          <li>Los precios son válidos por 30 días</li>
          <li>Consulte por disponibilidad y plazos de entrega</li>
          <li>El mantenimiento recomendado de la madera es una vez al año</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Cabañas Rodriguez - Construimos tu hogar</p>
        <p>📞 Contacto por WhatsApp | 📧 info@cabanasrodriguez.com</p>
        <p>${new Date().getFullYear()} - Todos los derechos reservados</p>
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