'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Center } from '@react-three/drei'
import { ConfigOptions } from '@/utils/priceCalculator'

interface Room {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface InteractiveFloorPlanProps {
  options: ConfigOptions
  onUpdate?: (rooms: Room[]) => void
}

const roomColors: Record<string, string> = {
  'Dormitorio': '#86efac', // Colores un poco más vivos para el 3D
  'Baño': '#fef08a',
  'Cocina': '#fbcfe8',
  'Living': '#bae6fd',
  'Comedor': '#ddd6fe',
  'Pasillo': '#e5e5e5',
}

const roomTypes = [
  { name: 'Dormitorio', icon: '🛏️', defaultSize: { width: 3, height: 3 } },
  { name: 'Baño', icon: '🚽', defaultSize: { width: 2, height: 2 } },
  { name: 'Cocina', icon: '🍳', defaultSize: { width: 3, height: 2.5 } },
  { name: 'Living', icon: '🛋️', defaultSize: { width: 4, height: 3 } },
  { name: 'Comedor', icon: '🍽️', defaultSize: { width: 3, height: 2.5 } },
  { name: 'Pasillo', icon: '🚪', defaultSize: { width: 1.5, height: 3 } },
]

export default function InteractiveFloorPlan({ options, onUpdate }: InteractiveFloorPlanProps) {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Dormitorio 1', x: 0, y: 0, width: 3, height: 3, color: roomColors['Dormitorio'] },
    { id: '2', name: 'Baño 1', x: 3.5, y: 0, width: 2, height: 2, color: roomColors['Baño'] },
    { id: '3', name: 'Living', x: 0, y: 3.5, width: 3.5, height: 3, color: roomColors['Living'] },
    { id: '4', name: 'Cocina', x: 3.5, y: 3.5, width: 2.5, height: 2.5, color: roomColors['Cocina'] },
  ])
  
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizing, setResizing] = useState<string | null>(null)
  const [resizeEdge, setResizeEdge] = useState<string | null>(null)
  
  const getCabinLength = (): number => {
    if (options.size === 'custom' && options.customSize) {
      return options.customSize
    }
    const sizes: Record<string, number> = {
      '6x3': 3, '6x4': 4, '6x5': 5, '6x6': 6,
      '6x7': 7, '6x8': 8, '6x9': 9, '6x10': 10, '6x12': 12
    }
    return sizes[options.size] || 6
  }
  
  const cabinWidth = 6 
  const cabinLength = getCabinLength()
  const scale = 60 // Un poco más grande para mejor usabilidad
  
  const svgWidth = cabinWidth * scale + 40
  const svgHeight = cabinLength * scale + 40
  
  // Handlers de interacción 2D
  const handleMouseDown = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRoom(roomId)
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedRoom) return
    
    const dx = (e.clientX - dragStart.x) / scale
    const dy = (e.clientY - dragStart.y) / scale
    
    setRooms(rooms.map(room => {
      if (room.id === selectedRoom) {
        const newX = Math.max(0, Math.min(cabinWidth - room.width, room.x + dx))
        const newY = Math.max(0, Math.min(cabinLength - room.height, room.y + dy))
        return { ...room, x: newX, y: newY }
      }
      return room
    }))
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
    setResizing(null)
    setResizeEdge(null)
    if (onUpdate) onUpdate(rooms)
  }
  
  const startResize = (roomId: string, edge: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setResizing(roomId)
    setResizeEdge(edge)
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizing || !resizeEdge) return
    
    const dx = (e.clientX - dragStart.x) / scale
    const dy = (e.clientY - dragStart.y) / scale
    
    setRooms(rooms.map(room => {
      if (room.id === resizing) {
        let newWidth = room.width
        let newHeight = room.height
        
        if (resizeEdge.includes('e')) newWidth = Math.max(1, room.width + dx)
        if (resizeEdge.includes('s')) newHeight = Math.max(1, room.height + dy)
        
        newWidth = Math.min(cabinWidth - room.x, newWidth)
        newHeight = Math.min(cabinLength - room.y, newHeight)
        
        return { ...room, width: newWidth, height: newHeight }
      }
      return room
    }))
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const addRoom = (type: typeof roomTypes[0]) => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: `${type.name} ${rooms.filter(r => r.name.includes(type.name)).length + 1}`,
      x: 0,
      y: 0,
      width: type.defaultSize.width,
      height: type.defaultSize.height,
      color: roomColors[type.name] || '#f0fdf4'
    }
    setRooms([...rooms, newRoom])
  }
  
  const removeRoom = (roomId: string) => {
    setRooms(rooms.filter(r => r.id !== roomId))
  }
  
  const updateRoomName = (roomId: string, newName: string) => {
    setRooms(rooms.map(room => room.id === roomId ? { ...room, name: newName } : room))
  }
  
  const totalArea = rooms.reduce((sum, room) => sum + (room.width * room.height), 0)
  const cabinArea = cabinWidth * cabinLength
  const freeArea = cabinArea - totalArea
  
  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    if (resizing) handleResizeMove(e)
    else if (isDragging) handleMouseMove(e)
  }

  return (
    <div className="space-y-6">
      {/* Selector de Vistas / Pestañas */}
      <div className="flex border-b border-gray-200 justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('2d')}
            className={`py-2 px-4 font-semibold text-sm border-b-2 transition ${
              activeTab === '2d' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📐 Plano 2D (Editar)
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`py-2 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === '3d' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🏠 Vista 3D ¡Sorpresa! ✨
          </button>
        </div>
        <span className="text-xs text-gray-500 hidden sm:inline">Modifica las dimensiones en 2D y míralo en 3D</span>
      </div>

      {activeTab === '2d' ? (
        <>
          {/* Toolbar de habitaciones */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-700 mb-3 text-sm flex items-center gap-1">➕ Agregar ambientes al plano:</h4>
            <div className="flex flex-wrap gap-2">
              {roomTypes.map((type) => (
                <button
                  key={type.name}
                  onClick={() => addRoom(type)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition shadow-sm text-gray-700"
                >
                  <span>{type.icon}</span>
                  <span className="text-xs font-medium">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Plano interactivo SVG */}
          <div 
            className="relative overflow-auto border-2 border-gray-200 rounded-xl bg-slate-50 p-4 flex justify-center shadow-inner"
            onMouseMove={handleGlobalMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg 
              width={svgWidth} 
              height={svgHeight} 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="bg-white rounded-lg shadow-md border border-gray-100"
            >
              {/* Grid de fondo */}
              <defs>
                <pattern id="grid" width={scale / 2} height={scale / 2} patternUnits="userSpaceOnUse">
                  <path d={`M ${scale / 2} 0 L 0 0 0 ${scale / 2}`} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Marco exterior de la cabaña */}
              <rect
                x={20}
                y={20}
                width={cabinWidth * scale}
                height={cabinLength * scale}
                fill="transparent"
                stroke="#0f766e"
                strokeWidth="4"
                rx="6"
              />
              
              {/* Medidas exteriores */}
              <text x={20 + (cabinWidth * scale) / 2} y={15} textAnchor="middle" fontSize="11" fill="#0f766e" className="font-bold">
                Ancho: {cabinWidth}m
              </text>
              <text x={svgWidth - 12} y={20 + (cabinLength * scale) / 2} textAnchor="middle" fontSize="11" fill="#0f766e" className="font-bold" transform={`rotate(90, ${svgWidth - 12}, ${20 + (cabinLength * scale) / 2})`}>
                Largo: {cabinLength}m
              </text>
              
              {/* Habitaciones */}
              {rooms.map((room) => (
                <g key={room.id}>
                  <rect
                    x={20 + room.x * scale}
                    y={20 + room.y * scale}
                    width={room.width * scale}
                    height={room.height * scale}
                    fill={room.color}
                    fillOpacity="0.85"
                    stroke="#1e293b"
                    strokeWidth="2.5"
                    rx="4"
                    className={`cursor-move transition-all ${selectedRoom === room.id ? 'stroke-blue-600 stroke-2' : ''}`}
                    onMouseDown={(e) => handleMouseDown(room.id, e)}
                  />
                  
                  {/* Esquina superior derecha (Ancho) */}
                  <circle
                    cx={20 + (room.x + room.width) * scale}
                    cy={20 + room.y * scale}
                    r="6"
                    className="fill-amber-500 stroke-white stroke-2 cursor-ew-resize"
                    onMouseDown={(e) => startResize(room.id, 'e', e)}
                  />
                  {/* Esquina inferior derecha (Ancho y Alto) */}
                  <circle
                    cx={20 + (room.x + room.width) * scale}
                    cy={20 + (room.y + room.height) * scale}
                    r="7"
                    className="fill-amber-600 stroke-white stroke-2 cursor-se-resize"
                    onMouseDown={(e) => startResize(room.id, 'es', e)}
                  />
                  {/* Esquina inferior izquierda (Alto) */}
                  <circle
                    cx={20 + room.x * scale}
                    cy={20 + (room.y + room.height) * scale}
                    r="6"
                    className="fill-amber-500 stroke-white stroke-2 cursor-ns-resize"
                    onMouseDown={(e) => startResize(room.id, 's', e)}
                  />
                  
                  {/* Texto */}
                  <text
                    x={20 + room.x * scale + (room.width * scale) / 2}
                    y={20 + room.y * scale + (room.height * scale) / 2 - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    className="fill-slate-800 font-semibold select-none pointer-events-none"
                  >
                    {room.name}
                  </text>
                  <text
                    x={20 + room.x * scale + (room.width * scale) / 2}
                    y={20 + room.y * scale + (room.height * scale) / 2 + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    className="fill-slate-500 font-medium select-none pointer-events-none"
                  >
                    {room.width.toFixed(2)}x{room.height.toFixed(2)}m
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </>
      ) : (
        /* VISTA 3D CON THREE.JS */
        <div className="w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden relative shadow-lg border border-slate-800">
          <div className="absolute top-4 left-4 z-10 bg-slate-800/90 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm pointer-events-none shadow">
            🖱️ <strong>Click izquierdo + Arrastrar:</strong> Rotar cámara | 📜 <strong>Scroll:</strong> Zoom
          </div>
          
          <Canvas camera={{ position: [8, 10, 12], fov: 45 }}>
            <color attach="background" args={['#0f172a']} />
            
            {/* Iluminación cinematográfica para renderizado atractivo */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 5]} intensity={1.2} castShadow />
            <pointLight position={[-10, 8, -5]} intensity={0.5} />

            <Center>
              {/* Radier / Base de la cabaña */}
              <mesh position={[0, -0.05, 0]} receiveShadow>
                <boxGeometry args={[cabinWidth, 0.1, cabinLength]} />
                <meshStandardMaterial color="#334155" roughness={0.6} />
              </mesh>

              {/* Render de los ambientes en 3D */}
              {rooms.map((room) => {
                // Cálculo de posiciones relativas ajustadas al centro de Three.js
                const posX = room.x + room.width / 2 - cabinWidth / 2
                const posZ = room.y + room.height / 2 - cabinLength / 2
                const height3D = 2.4 // 2.4 metros de altura standard de pared
                
                return (
                  <group key={room.id} position={[posX, 0, posZ]}>
                    {/* Piso de la habitación */}
                    <mesh position={[0, 0.01, 0]}>
                      <boxGeometry args={[room.width - 0.04, 0.02, room.height - 0.04]} />
                      <meshStandardMaterial color={room.color} roughness={0.4} metalness={0.1} />
                    </mesh>

                    {/* Paredes Perimetrales Simuladas mediante bordes volumétricos */}
                    <mesh position={[0, height3D / 2, 0]}>
                      <boxGeometry args={[room.width, height3D, room.height]} />
                      {/* Material transparente/wireframe sofisticado para ver hacia adentro */}
                      <meshStandardMaterial 
                        color={room.color} 
                        wireframe 
                        transparent 
                        opacity={0.4} 
                        roughness={0.2}
                      />
                    </mesh>

                    {/* Muro base visual (Zócalo indicador de la habitación) */}
                    <mesh position={[0, 0.15, 0]}>
                      <boxGeometry args={[room.width, 0.3, room.height]} />
                      <meshStandardMaterial color="#1e293b" opacity={0.8} transparent />
                    </mesh>
                  </group>
                )
              })}
            </Center>

            {/* Guía de suelo */}
            <Grid 
              renderOrder={-1} 
              position={[0, -0.06, 0]} 
              args={[30, 30]} 
              cellSize={1} 
              cellThickness={1} 
              cellColor="#334155" 
              sectionSize={5} 
              sectionThickness={1.5} 
              sectionColor="#475569" 
              fadeDistance={25}
            />
            
            <OrbitControls 
              enableDamping 
              dampingFactor={0.05} 
              maxPolarAngle={Math.PI / 2.1} // Evita que la cámara baje del piso
              minDistance={5}
              maxDistance={25}
            />
          </Canvas>
        </div>
      )}
      
      {/* Lista de habitaciones y Edición Manual de Nombres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="w-5 h-5 rounded-md shadow-inner border border-gray-200" style={{ backgroundColor: room.color }}></div>
            <input
              type="text"
              value={room.name}
              onChange={(e) => updateRoomName(room.id, e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition text-gray-700 font-medium"
            />
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {room.width.toFixed(1)}x{room.height.toFixed(1)}m
            </span>
            <button
              onClick={() => removeRoom(room.id)}
              className="text-gray-400 hover:text-red-500 p-1.5 transition text-sm"
              title="Eliminar ambiente"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
      
      {/* Estadísticas de Distribución */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5 rounded-xl shadow-sm">
        <h4 className="font-bold text-teal-900 mb-3 text-sm flex items-center gap-1">📐 Balance de Espacio y Superficie</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-3 rounded-lg shadow-2xl border border-teal-100/50">
            <span className="text-gray-500 block mb-1">Cabaña Total:</span>
            <span className="font-bold text-base text-teal-900">{cabinArea.toFixed(1)} m²</span>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-2xl border border-teal-100/50">
            <span className="text-gray-500 block mb-1">Área Ocupada:</span>
            <span className="font-bold text-base text-gray-800">{totalArea.toFixed(1)} m²</span>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-2xl border border-teal-100/50">
            <span className="text-gray-500 block mb-1">Área Disponible:</span>
            <span className={`font-bold text-base ${freeArea < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {freeArea.toFixed(1)} m²
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-2xl border border-teal-100/50">
            <span className="text-gray-500 block mb-1">N° de Ambientes:</span>
            <span className="font-bold text-base text-slate-700">{rooms.length}</span>
          </div>
        </div>
        {freeArea < 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs mt-3 font-medium flex items-center gap-1">
            ⚠️ ¡Atención! Los ambientes exceden el espacio delimitado de la cabaña. Redimensiona algunos espacios en la pestaña 2D.
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-400 text-center italic">
        💡 Tips: Diseña la distribución arrastrando y estirando los nodos ámbar en el plano 2D, luego pasa a la pestaña 3D para ver el modelado interactivo final.
      </div>
    </div>
  )
}