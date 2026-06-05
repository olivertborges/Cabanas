import { NextResponse } from 'next/server'
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const categories = ['exteriores', 'interiores', 'cocinas', 'baños', 'dormitorios', 'destacados']
  const gallery: Record<string, { images: string[]; titles: string[]; descriptions: string[] }> = {}
  
  for (const category of categories) {
    const folderPath = join(process.cwd(), 'public', 'images', 'gallery', category)
    const imagePath = `/images/gallery/${category}/`
    
    gallery[category] = {
      images: [],
      titles: [],
      descriptions: []
    }
    
    if (existsSync(folderPath)) {
      const files = readdirSync(folderPath)
      const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
      
      const imageFiles = files.filter(file => 
        supportedExtensions.some(ext => file.toLowerCase().endsWith(ext))
      )
      
      gallery[category].images = imageFiles.map(file => imagePath + file)
      gallery[category].titles = imageFiles.map(file => {
        const name = file.replace(/\.[^/.]+$/, '')
        return name
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
      })
      gallery[category].descriptions = imageFiles.map(file => {
        const name = file.replace(/\.[^/.]+$/, '')
        const parts = name.split(/[-_]/)
        if (parts.length > 1) {
          return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' - ')
        }
        return `Cabaña ${name.replace(/\b\w/g, l => l.toUpperCase())}`
      })
    }
  }
  
  return NextResponse.json(gallery)
}