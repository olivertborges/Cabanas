'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Bed, Bath, Ruler } from 'lucide-react'

interface ModelCardProps {
  id: string
  name: string
  description: string
  baseSize: string
  basePrice: number
  bedrooms: number
  bathrooms: number
  image: string
  features: string[]
}

export default function ModelCard({
  id,
  name,
  description,
  baseSize,
  basePrice,
  bedrooms,
  bathrooms,
  image,
  features
}: ModelCardProps) {
  return (
    <div className="card group">
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-primary mb-2">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Bed size={18} className="text-primary" />
            <span className="text-sm">{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={18} className="text-primary" />
            <span className="text-sm">{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Ruler size={18} className="text-primary" />
            <span className="text-sm">{baseSize}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <span className="text-2xl font-bold text-primary">
            USD {basePrice.toLocaleString()}
          </span>
          <span className="text-gray-500 text-sm"> + personalización</span>
        </div>
        
        <Link
          href={`/configurador?model=${id}`}
          className="flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          Personalizar
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )
}