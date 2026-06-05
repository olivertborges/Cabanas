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
  'Dormitorio': '#86efac',
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
  const scale = 55 // Ajustado para un calce óptimo en celulares
  
  const svgWidth = cabinWidth * scale + 40
  const svgHeight = cabinLength * scale + 40
  
  // Extrae la coordenada X e Y sin importar si viene de Mouse o Touch
  const getClientCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      if (e.touches.length === 0) return null
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  // Handlers para Mover Habitación (Soporta ambos entornos)
  const handleStartDrag = (roomId: string, e: React.MouseEvent | React.TouchEvent) => {
    // Si es touch, prevenimos que la pantalla haga scroll involuntario
    if (e.cancelable) e.preventDefault()
    e.stopPropagation()
    
    const coords = getClientCoords(e)
    if (!coords) return

    setSelectedRoom(roomId)
    setIsDragging(true)
    setDragStart({ x: coords.x, y: coords.y })
  }
  
  const handleMoveDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !selectedRoom) return
    if (e.cancelable) e.preventDefault()
    
    const coords = getClientCoords(e)
    if (!coords) return
    
    const dx = (coords.x - dragStart.x) / scale
    const dy = (coords.y - dragStart.y) / scale
    
    setRooms(rooms.map(room => {
      if (room.id === selectedRoom) {
        const newX = Math.max(0, Math.min(cabinWidth - room.width, room.x + dx))
        const newY = Math.max(0, Math.min(cabinLength - room.height, room.y + dy))
        return { ...room, x: newX, y: newY }
      }
      return room
    }))
    setDragStart({ x: coords.x, y: coords.y })
  }
  
  const handleEndInteraction = () => {
    setIsDragging(false)
    setResizing(null)
    setResizeEdge(null)
    if (onUpdate) onUpdate(rooms)
  }
  
  // Handlers para Redimensionar Habitación (Soporta ambos entornos)
  const handleStartResize = (roomId: string, edge: string, e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) e.preventDefault()
    e.stopPropagation()
    
    const coords = getClientCoords(e)
    if (!coords) return

    setResizing(roomId)
    setResizeEdge(edge)
    setDragStart({ x: coords.x, y: coords.y })
  }
  
  const handleMoveResize = (e: React.MouseEvent | React.TouchEvent) => {
    if (!resizing || !resizeEdge) return
    if (e.cancelable) e.preventDefault()
    
    const coords = getClientCoords(e)
    if (!coords) return
    
    const dx = (coords.x - dragStart.x) / scale
    const dy = (coords.y - dragStart.y) / scale
    
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
    setDragStart({ x: coords.x, y: coords.y })
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
  
  // Enrutador global de movimientos tanto táctil como de mouse
  const handleGlobalMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (resizing) handleMoveResize(e)
    else if (isDragging) handleMoveDrag(e)
  }

  return (
    <div className="space-y-6 select-none">
      {/* Selector de Vistas / Pestañas */}
      <div className="flex border-b border-gray-200 justify-between items-center">
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('2d')}
            className={`flex-1 sm:flex-none py-2.5 px-3 text-center font-semibold text-xs sm:text-sm border-b-2 transition ${
              activeTab === '2d' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            📐 Plano 2D (Editar)
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`flex-1 sm:flex-none py-2.5 px-3 text-center font-semibold text-xs sm:text-sm border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeTab === '3d' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            🏠 Vista 3D ✨
          </button>
        </div>
      </div>

      {activeTab === '2d' ? (
        <>
          {/* Toolbar de habitaciones */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl shadow-sm">
            <h4 className="font-semibold text-gray-700 mb-2.5 text-xs sm:text-sm flex items-center gap-1">➕ Añadir ambientes:</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {roomTypes.map((type) => (
                <button
                  key={type.name}
                  onClick={() => addRoom(type)}
                  className="flex items-center gap-1.5 px-2.5 py-2 bg-white border border-gray-200 rounded-lg active:bg-green-50 active:border-green-600 sm:hover:border-green-600 sm:hover:bg-green-50 transition shadow-sm text-gray-700"
                >
                  <span className="text-sm">{type.icon}</span>
                  <span className="text-xs font-medium">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Plano interactivo SVG listo para Touch (celulares) */}
          <div 
            className="relative overflow-auto border-2 border-gray-200 rounded-xl bg-slate-50 p-2 sm:p-4 flex justify-center shadow-inner touch-none"
            onMouseMove={handleGlobalMove}
            onMouseUp={handleEndInteraction}
            onMouseLeave={handleEndInteraction}
            onTouchMove={handleGlobalMove}
            onTouchEnd={handleEndInteraction}
          >
            <svg 
              width={svgWidth} 
              height={svgHeight} 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="bg-white rounded-lg shadow-md border border-gray-100"
            >
              <defs>
                <pattern id="grid" width={scale / 2} height={scale / 2} patternUnits="userSpaceOnUse">
                  <path d={`M ${scale / 2} 0 L 0 0 0 ${scale / 2}`} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Contorno perimetral */}
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
              
              <text x={20 + (cabinWidth * scale) / 2} y={15} textAnchor="middle" fontSize="11" fill="#0f766e" className="font-bold">
                {cabinWidth}m de ancho
              </text>
              <text x={svgWidth - 12} y={20 + (cabinLength * scale) / 2} textAnchor="middle" fontSize="11" fill="#0f766e" className="font-bold" transform={`rotate(90, ${svgWidth - 12}, ${20 + (cabinLength * scale) / 2})`}>
                {cabinLength}m de largo
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
                    onMouseDown={(e) => handleStartDrag(room.id, e)}
                    onTouchStart={(e) => handleStartDrag(room.id, e)}
                  />
                  
                  {/* Manillas de tamaño agrandadas a r="10" para que quepa la yema del dedo */}
                  {/* Derecha (Ancho) */}
                  <circle
                    cx={20 + (room.x + room.width) * scale}
                    cy={20 + room.y * scale}
                    r="10"
                    className="fill-amber-500 stroke-white stroke-2 cursor-ew-resize opacity-90"
                    onMouseDown={(e) => handleStartResize(room.id, 'e', e)}
                    onTouchStart={(e) => handleStartResize(room.id, 'e', e)}
                  />
                  {/* Esquina Inferior Derecha (Ambos ejes) */}
                  <circle
                    cx={20 + (room.x + room.width) * scale}
                    cy={20 + (room.y + room.height) * scale}
                    r="12"
                    className="fill-amber-600 stroke-white stroke-2 cursor-se-resize opacity-90"
                    onMouseDown={(e) => handleStartResize(room.id, 'es', e)}
                    onTouchStart={(e) => handleStartResize(room.id, 'es', e)}
                  />
                  {/* Abajo (Alto) */}
                  <circle
                    cx={20 + room.x * scale}
                    cy={20 + (room.y + room.height) * scale}
                    r="10"
                    className="fill-amber-500 stroke-white stroke-2 cursor-ns-resize opacity-90"
                    onMouseDown={(e) => handleStartResize(room.id, 's', e)}
                    onTouchStart={(e) => handleStartResize(room.id, 's', e)}
                  />
                  
                  <text
                    x={20 + room.x * scale + (room.width * scale) / 2}
                    y={20 + room.y * scale + (room.height * scale) / 2 - 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    className="fill-slate-800 font-bold select-none pointer-events-none"
                  >
                    {room.name}
                  </text>
                  <text
                    x={20 + room.x * scale + (room.width * scale) / 2}
                    y={20 + room.y * scale + (room.height * scale) / 2 + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    className="fill-slate-600 font-semibold select-none pointer-events-none"
                  >
                    {room.width.toFixed(1)}x{room.height.toFixed(1)}m
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </>
      ) : (
        /* VISTA 3D EN MOBILE CON CONTROL TÁCTIL AUTOMÁTICO */
        <div className="w-full h-[380px] sm:h-[500px] bg-slate-900 rounded-xl overflow-hidden relative shadow-lg border border-slate-800">
          <div className="absolute top-3 left-3 z-10 bg-slate-800/95 text-white text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg backdrop-blur-sm pointer-events-none shadow">
            📱 <strong>Un dedo:</strong> Rotar | ✌️ <strong>Pellizcar:</strong> Zoom
          </div>
          
          <Canvas camera={{ position: [7, 9, 11], fov: 45 }}>
            <color attach="background" args={['#0f172a']} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 5]} intensity={1.2} />

            <Center>
              <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[cabinWidth, 0.1, cabinLength]} />
                <meshStandardMaterial color="#334155" roughness={0.6} />
              </mesh>

              {rooms.map((room) => {
                const posX = room.x + room.width / 2 - cabinWidth / 2
                const posZ = room.y + room.height / 2 - cabinLength / 2
                const height3D = 2.2
                
                return (
                  <group key={room.id} position={[posX, 0, posZ]}>
                    <mesh position={[0, 0.01, 0]}>
                      <boxGeometry args={[room.width - 0.03, 0.02, room.height - 0.03]} />
                      <meshStandardMaterial color={room.color} roughness={0.4} />
                    </mesh>

                    <mesh position={[0, height3D / 2, 0]}>
                      <boxGeometry args={[room.width, height3D, room.height]} />
                      <meshStandardMaterial color={room.color} wireframe transparent opacity={0.35} />
                    </mesh>

                    <mesh position={[0, 0.1, 0]}>
                      <boxGeometry args={[room.width, 0.2, room.height]} />
                      <meshStandardMaterial color="#1e293b" opacity={0.8} transparent />
                    </mesh>
                  </group>
                )
              })}
            </Center>

            <Grid position={[0, -0.06, 0]} args={[20, 20]} cellColor="#334155" sectionColor="#475569" fadeDistance={20} />
            <OrbitControls enableDamping dampingFactor={0.07} maxPolarAngle={Math.PI / 2.2} minDistance={4} maxDistance={20} />
          </Canvas>
        </div>
      )}
      
      {/* Editor de Nombres de Ambientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="w-4 h-4 rounded border border-gray-200 shrink-0" style={{ backgroundColor: room.color }}></div>
            <input
              type="text"
              value={room.name}
              onChange={(e) => updateRoomName(room.id, e.target.value)}
              className="flex-1 min-w-0 px-2 py-1 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-700 font-medium focus:bg-white"
            />
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
              {room.width.toFixed(1)}x{room.height.toFixed(1)}m
            </span>
            <button onClick={() => removeRoom(room.id)} className="text-gray-400 active:text-red-500 sm:hover:text-red-500 p-1 shrink-0">
              🗑️
            </button>
          </div>
        ))}
      </div>
      
      {/* Caja de Estadísticas */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 rounded-xl">
        <h4 className="font-bold text-teal-900 mb-2.5 text-xs sm:text-sm">📐 Resumen de Superficie</h4>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-white p-2 rounded-lg border border-teal-50">
            <span className="text-gray-500 block">Total Cabaña:</span>
            <span className="font-bold text-teal-900">{cabinArea.toFixed(1)} m²</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-teal-50">
            <span className="text-gray-500 block">Área Disponible:</span>
            <span className={`font-bold ${freeArea < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{freeArea.toFixed(1)} m²</span>
          </div>
        </div>
        {freeArea < 0 && (
          <div className="p-2 bg-red-50 border border-red-100 rounded-lg text-red-700 text-[10px] mt-2 font-medium">
            ⚠️ Los ambientes exceden el tamaño real de la cabaña.
          </div>
        )}
      </div>
    </div>
  )
}