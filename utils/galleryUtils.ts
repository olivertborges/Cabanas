// Esta función corre en el servidor (Next.js)
export async function getImagesFromFolder(folderPath: string): Promise<string[]> {
  // En Next.js, podemos usar fs para leer archivos
  const fs = await import('fs')
  const path = await import('path')
  
  const fullPath = path.join(process.cwd(), 'public', folderPath)
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`Folder not found: ${fullPath}`)
    return []
  }
  
  const files = fs.readdirSync(fullPath)
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  
  const images = files
    .filter(file => supportedExtensions.some(ext => file.toLowerCase().endsWith(ext)))
    .map(file => `${folderPath}/${file}`)
  
  return images
}

export async function getAllGalleryImages() {
  const categories = ['exteriores', 'interiores', 'cocinas', 'baños', 'dormitorios', 'destacados']
  
  const gallery: Record<string, { images: string[], titles: string[] }> = {}
  
  for (const category of categories) {
    const images = await getImagesFromFolder(`images/gallery/${category}`)
    gallery[category] = {
      images,
      titles: images.map(img => {
        // Extraer título del nombre del archivo
        const filename = img.split('/').pop()?.replace(/\.[^/.]+$/, '') || ''
        return filename
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
      })
    }
  }
  
  return gallery
}

// Versión para cliente (con fetch a API)
export async function fetchGalleryImages() {
  const response = await fetch('/api/gallery')
  return response.json()
}