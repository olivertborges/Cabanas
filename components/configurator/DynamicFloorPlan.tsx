'use client'

import { ConfigOptions } from '@/utils/priceCalculator'

interface DynamicFloorPlanProps {
  options: ConfigOptions
}

export default function DynamicFloorPlan({ options }: DynamicFloorPlanProps) {
  const bedrooms = parseInt(options.bedrooms)
  const bathrooms = parseInt(options.bathrooms)

  // Generar SVG del plano dinámicamente
  const generateFloorPlan = () => {
    const width = 400
    const height = 400
    
    // Distribución según habitaciones
    let rooms: any[] = []
    
    if (bedrooms === 1 && bathrooms === 1) {
      rooms = [
        { x: 20, y: 20, w: 160, h: 160, label: 'Dormitorio 1' },
        { x: 200, y: 20, w: 80, h: 80, label: 'Baño' },
        { x: 200, y: 120, w: 180, h: 260, label: 'Living/Cocina' },
      ]
    } else if (bedrooms === 2 && bathrooms === 1) {
      rooms = [
        { x: 20, y: 20, w: 100, h: 150, label: 'Dormitorio 1' },
        { x: 140, y: 20, w: 100, h: 150, label: 'Dormitorio 2' },
        { x: 260, y: 20, w: 60, h: 60, label: 'Baño' },
        { x: 20, y: 190, w: 300, h: 190, label: 'Living/Cocina' },
      ]
    } else if (bedrooms === 3 && bathrooms === 2) {
      rooms = [
        { x: 20, y: 20, w: 100, h: 120, label: 'Dormitorio 1' },
        { x: 140, y: 20, w: 100, h: 120, label: 'Dormitorio 2' },
        { x: 20, y: 160, w: 100, h: 120, label: 'Dormitorio 3' },
        { x: 260, y: 20, w: 60, h: 60, label: 'Baño 1' },
        { x: 260, y: 100, w: 60, h: 60, label: 'Baño 2' },
        { x: 140, y: 160, w: 180, h: 220, label: 'Living/Cocina' },
      ]
    } else {
      // Default 4 dormitorios, 2 baños
      rooms = [
        { x: 20, y: 20, w: 80, h: 80, label: 'Dormitorio 1' },
        { x: 120, y: 20, w: 80, h: 80, label: 'Dormitorio 2' },
        { x: 20, y: 120, w: 80, h: 80, label: 'Dormitorio 3' },
        { x: 120, y: 120, w: 80, h: 80, label: 'Dormitorio 4' },
        { x: 220, y: 20, w: 60, h: 60, label: 'Baño 1' },
        { x: 220, y: 100, w: 60, h: 60, label: 'Baño 2' },
        { x: 20, y: 220, w: 260, h: 160, label: 'Living/Cocina' },
      ]
    }

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto border border-gray-300 rounded-lg bg-white">
        {rooms.map((room, idx) => (
          <g key={idx}>
            <rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              fill="#f0fdf4"
              stroke="#2D6A4F"
              strokeWidth="2"
              rx="4"
            />
            <text
              x={room.x + room.w / 2}
              y={room.y + room.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="#1B4332"
            >
              {room.label}
            </text>
          </g>
        ))}
        {/* Puertas */}
        <circle cx={200} cy={280} r="4" fill="#D4A373" />
        <circle cx={300} cy={300} r="4" fill="#D4A373" />
      </svg>
    )
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg text-center">
      <h4 className="font-semibold mb-4">Distribución sugerida: {options.bedrooms} dormitorios, {options.bathrooms} baños</h4>
      {generateFloorPlan()}
      <p className="text-sm text-gray-500 mt-4">* Plano referencial. La distribución final puede variar según el diseño.</p>
    </div>
  )
}