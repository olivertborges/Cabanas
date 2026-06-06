'use client'

import React, { useState, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'

// --- 📐 INTERFACES ---
interface Point2D { x: number; y: number }

interface RoomBlock {
  id: string
  name: string
  x: number
  y: number
  w: number
  l: number
  color2D: string
}

interface DraggableItem {
  id: string
  type: 'puerta' | 'ventana' | 'cama' | 'sillon' | 'mesa'
  x: number
  y: number
  w: number
  l: number
  label: string
  color: string
}

// Interfaz para recibir las props del Wizard sin errores de compilación
interface InteractiveFloorPlanProps {
  options?: any // Acepta las opciones de configuración del Wizard
}

const WALL_COLORS = [
  { hex: '#b45309', name: '🪵 Roble Natural' },
  { hex: '#78350f', name: '🪵 Nogal Oscuro' },
  { hex: '#4b5563', name: '⚫ Gris Nórdico' },
  { hex: '#1e293b', name: '🔵 Azul Grafito' },
  { hex: '#064e3b', name: '🟢 Verde Bosque' },
  { hex: '#f8fafc', name: '⚪ Blanco Alpino' }
]

const ROOF_COLORS = [
  { hex: '#334155', name: '👵 Gris Pizarra' },
  { hex: '#1e1b4b', name: '🌌 Negro Absoluto' },
  { hex: '#991b1b', name: '🔴 Terracota / Teja' },
  { hex: '#065f46', name: '🟢 Verde Inglés' },
  { hex: '#0369a1', name: '🔵 Azul Metalizado' },
  { hex: '#57534e', name: '🪨 Zinc Natural' }
]

export default function InteractiveFloorPlan({ options }: InteractiveFloorPlanProps) {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  
  // Extensiones holgadas y naturales
  const [walkwayWidth, setWalkwayWidth] = useState<string>('1.2')
  const [eaveLength, setEaveLength] = useState<string>('0.8')
  const [hasWalkway, setHasWalkway] = useState<boolean>(true)

  const [woodColor, setWoodColor] = useState<string>('#b45309')
  const [roofColor, setRoofColor] = useState<string>('#334155')

  const [rooms, setRooms] = useState<RoomBlock[]>([
    { id: 'r1', name: 'Módulo Principal', x: 0, y: 0, w: 6.0, l: 5.0, color2D: '#bfdbfe' },
    { id: 'r2', name: 'Ala en L / Cocina', x: 6.0, y: 0, w: 3.0, l: 3.5, color2D: '#fed7aa' }
  ])

  // Aumentamos levemente el grosor (l) visual en 2D para agarrar mejor los objetos con el mouse
  const [placedItems, setPlacedItems] = useState<DraggableItem[]>([
    { id: 'i1', type: 'puerta', x: 2.0, y: 0.0, w: 1.0, l: 0.3, label: '🚪 Puerta Princ.', color: '#ef4444' },
    { id: 'i2', type: 'ventana', x: 4.5, y: 0.0, w: 1.4, l: 0.3, label: '🪟 Ventana', color: '#38bdf8' },
    { id: 'i3', type: 'cama', x: 1.0, y: 2.0, w: 1.9, l: 2.0, label: '🛏️ Cama', color: '#a855f7' },
  ])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'room' | 'item' | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragOffset, setDragOffset] = useState<Point2D>({ x: 0, y: 0 })
  const [baseType, setBaseType] = useState<'Pilotes' | 'PlateaHormigon'>('Pilotes')

  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 35 

  // --- ENVOLVENTE DINÁMICA ---
  const boundingBox = useMemo(() => {
    if (rooms.length === 0) return { minX: 0, maxX: 6, minY: 0, maxY: 6, w: 6, l: 6 }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    rooms.forEach(r => {
      if (r.x < minX) minX = r.x
      if (r.x + r.w > maxX) maxX = r.x + r.w
      if (r.y < minY) minY = r.y
      if (r.y + r.l > maxY) maxY = r.y + r.l
    })
    return { minX, maxX, minY, maxY, w: maxX - minX, l: maxY - minY }
  }, [rooms])

  const viewBounds = useMemo(() => {
    const margin = 4.0
    return {
      minX: boundingBox.minX - margin,
      minY: boundingBox.minY - margin,
      w: boundingBox.w + (margin * 2),
      l: boundingBox.l + (margin * 2)
    }
  }, [boundingBox])

  // --- TRADUCTOR DE COORDENADAS (Suave y sin tirones) ---
  const getCoordinates = (e: any) => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const svgX = ((clientX - rect.left) / rect.width) * (viewBounds.w * scale) + (viewBounds.minX * scale)
    const svgY = ((clientY - rect.top) / rect.height) * (viewBounds.l * scale) + (viewBounds.minY * scale)
    return { x: svgX / scale, y: svgY / scale }
  }

  const addNewRoom = () => {
    const newR: RoomBlock = {
      id: `room-${Date.now()}`,
      name: `Habitación ${rooms.length + 1}`,
      x: boundingBox.minX,
      y: boundingBox.maxY,
      w: 4.0,
      l: 4.0,
      color2D: ['#bfdbfe', '#fed7aa', '#fef08a', '#fbcfe8', '#ccfbf1'][rooms.length % 5]
    }
    setRooms([...rooms, newR])
    setSelectedId(newR.id)
    setSelectedType('room')
  }

  const addItemToPlan = (type: 'puerta' | 'ventana' | 'cama' | 'sillon' | 'mesa') => {
    const presets: Record<string, { w: number; l: number; label: string; color: string }> = {
      puerta: { w: 1.0, l: 0.35, label: '🚪 Puerta', color: '#ef4444' }, 
      ventana: { w: 1.4, l: 0.35, label: '🪟 Ventana', color: '#38bdf8' },
      cama: { w: 1.9, l: 2.0, label: '🛏️ Cama', color: '#a855f7' },
      sillon: { w: 1.6, l: 0.8, label: '🛋️ Sillón', color: '#f97316' },
      mesa: { w: 1.4, l: 0.9, label: '🪑 Mesa', color: '#10b981' },
    }
    const config = presets[type]
    const newItem: DraggableItem = {
      id: `item-${Date.now()}`,
      type,
      x: boundingBox.minX + boundingBox.w / 2 - config.w / 2,
      y: boundingBox.minY + boundingBox.l / 2 - config.l / 2,
      ...config
    }
    setPlacedItems([...placedItems, newItem])
    setSelectedId(newItem.id)
    setSelectedType('item')
  }

  const handleDragStart = (id: string, type: 'room' | 'item', e: any) => {
    e.stopPropagation()
    setSelectedId(id)
    setSelectedType(type)
    setIsDragging(true)
    const coords = getCoordinates(e)
    if (!coords) return
    
    if (type === 'room') {
      const r = rooms.find(room => room.id === id)
      if (r) setDragOffset({ x: coords.x - r.x, y: coords.y - r.y })
    } else {
      const it = placedItems.find(item => item.id === id)
      if (it) setDragOffset({ x: coords.x - it.x, y: coords.y - it.y })
    }
  }

  const handleGlobalMove = (e: any) => {
    if (!isDragging || !selectedId) return
    const coords = getCoordinates(e)
    if (!coords) return

    if (selectedType === 'room') {
      setRooms(prev => prev.map(r => r.id === selectedId ? { 
        ...r, 
        x: Math.round((coords.x - dragOffset.x) * 4) / 4, 
        y: Math.round((coords.y - dragOffset.y) * 4) / 4 
      } : r))
    } else {
      setPlacedItems(prev => prev.map(it => it.id === selectedId ? { 
        ...it, 
        x: coords.x - dragOffset.x, 
        y: coords.y - dragOffset.y 
      } : it))
    }
  }

  const selectedRoomObj = useMemo(() => {
    return selectedType === 'room' ? rooms.find(r => r.id === selectedId) || null : null
  }, [rooms, selectedId, selectedType])

  const handleNumericPropChange = (id: string, field: 'w' | 'l', textValue: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== id) return r
      const parsed = parseFloat(textValue)
      return { ...r, [field]: textValue === '' ? '' : (isNaN(parsed) ? r[field] : parsed) }
    }))
  }

  // --- 📐 PARÁMETROS ARQUITECTÓNICOS ---
  const numWalkway = parseFloat(walkwayWidth) || 0
  const numEave = parseFloat(eaveLength) || 0

  const floorThickness = 0.15 
  const hPilotes = 0.80       
  const floorY = baseType === 'Pilotes' ? hPilotes : 0.20 
  const hMuros = 2.60        
  const hBaranda = 0.80      

  const generateBalusters = useMemo(() => {
    const list: Array<{ pos: [number, number, number] }> = []
    if (!hasWalkway) return list
    const spacing = 0.40 
    
    const eW = boundingBox.w + numWalkway * 2
    const eL = boundingBox.l + numWalkway * 2
    const cX = boundingBox.minX + boundingBox.w / 2
    const cZ = boundingBox.minY + boundingBox.l / 2

    const stepsX = Math.floor(eW / spacing)
    for (let i = 0; i <= stepsX; i++) {
      const x = (cX - eW / 2) + (i * (eW / stepsX))
      list.push({ pos: [x, hBaranda / 2, cZ - eL / 2] })
      list.push({ pos: [x, hBaranda / 2, cZ + eL / 2] })
    }
    const stepsZ = Math.floor(eL / spacing)
    for (let i = 1; i < stepsZ; i++) {
      const z = (cZ - eL / 2) + (i * (eL / stepsZ))
      list.push({ pos: [cX - eW / 2, hBaranda / 2, z] })
      list.push({ pos: [cX + eW / 2, hBaranda / 2, z] })
    }
    return list
  }, [boundingBox, numWalkway, hasWalkway])

  return (
    <div className="flex flex-col xl:flex-row gap-4 p-4 bg-slate-900 text-white rounded-3xl shadow-2xl w-full max-w-7xl mx-auto overflow-hidden">
      
      {/* 🛠️ PANEL DE CONTROL */}
      <div className="w-full xl:w-96 flex flex-col gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0 max-h-[520px] xl:max-h-[740px] overflow-y-auto">
        <div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            Estudio Arquitectura v4.3
          </span>
          <h2 className="text-lg font-black mt-1">Modelador de Cabañas</h2>
        </div>

        {/* INTERRUPTOR DE PESTAÑAS */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
            📐 Plano 2D (Suave)
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            🌲 Render 3D Dinámico
          </button>
        </div>

        {/* COLORES */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
          <div>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">🏠 Revestimiento:</p>
            <div className="grid grid-cols-3 gap-1">
              {WALL_COLORS.map(c => (
                <button key={c.hex} onClick={() => setWoodColor(c.hex)} className={`p-1 rounded text-[9px] font-medium border transition flex flex-col items-center gap-1 ${woodColor === c.hex ? 'border-white bg-slate-800' : 'border-transparent bg-slate-950 hover:bg-slate-800'}`}>
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span className="truncate w-full text-center">{c.name.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-2">
            <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1.5">☔ Cubierta / Techo:</p>
            <div className="grid grid-cols-3 gap-1">
              {ROOF_COLORS.map(c => (
                <button key={c.hex} onClick={() => setRoofColor(c.hex)} className={`p-1 rounded text-[9px] font-medium border transition flex flex-col items-center gap-1 ${roofColor === c.hex ? 'border-white bg-slate-800' : 'border-transparent bg-slate-950 hover:bg-slate-800'}`}>
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span className="truncate w-full text-center">{c.name.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PASILLOS Y ENTORNO */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">📏 Parámetros Libres (Permite borrar):</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Ancho Deck (m):</label>
              <input type="text" value={walkwayWidth} onChange={(e) => setWalkwayWidth(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-amber-400 outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Vuelo Alero (m):</label>
              <input type="text" value={eaveLength} onChange={(e) => setEaveLength(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-sky-400 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Fundación:</label>
              <select value={baseType} onChange={(e) => setBaseType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1 rounded text-xs text-white outline-none">
                <option value="Pilotes">🪵 Pilotes Madera</option>
                <option value="PlateaHormigon">🧱 Platea Hormigón</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input type="checkbox" checked={hasWalkway} onChange={(e) => setHasWalkway(e.target.checked)} className="rounded accent-amber-500" /> Ver Barandales
              </label>
            </div>
          </div>
        </div>

        {/* EDITAR COMPONENTES */}
        {activeTab === '2d' && (
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">➕ Insertar Componentes:</p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button onClick={addNewRoom} className="p-2 bg-emerald-950/60 hover:bg-emerald-900 rounded border border-emerald-800 text-center font-bold col-span-2">Añadir Módulo Habitable</button>
              <button onClick={() => addItemToPlan('puerta')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700">🚪 Puerta Grande</button>
              <button onClick={() => addItemToPlan('ventana')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700">🪟 Ventana Grande</button>
              <button onClick={() => addItemToPlan('cama')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700">🛏️ Cama</button>
              <button onClick={() => addItemToPlan('sillon')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700">🛋️ Sillón</button>
            </div>

            {selectedRoomObj && (
              <div className="bg-slate-950 p-2.5 rounded border border-slate-700 space-y-2 mt-2">
                <p className="text-[10px] font-black text-emerald-400">✏️ Propiedades (Permite borrar e ingresar):</p>
                <div>
                  <label className="text-[9px] text-slate-400">Nombre:</label>
                  <input type="text" value={selectedRoomObj.name} onChange={(e) => setRooms(prev => prev.map(r => r.id === selectedId ? {...r, name: e.target.value} : r))} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400">Ancho Frente (m):</label>
                    <input type="text" value={selectedRoomObj.w} onChange={(e) => handleNumericPropChange(selectedRoomObj.id, 'w', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-center text-white font-mono outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">Largo Fondo (m):</label>
                    <input type="text" value={selectedRoomObj.l} onChange={(e) => handleNumericPropChange(selectedRoomObj.id, 'l', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-center text-white font-mono outline-none" />
                  </div>
                </div>
                <button onClick={() => { setRooms(prev => prev.filter(r => r.id !== selectedId)); setPlacedItems(prev => prev.filter(i => i.id !== selectedId)); setSelectedId(null); }} className="w-full text-center bg-red-950 hover:bg-red-900 border border-red-800 text-[10px] font-bold text-red-300 p-1 rounded mt-1">
                  🗑️ Eliminar Elemento Seleccionado
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🖥️ ÁREA GRÁFICA */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 relative min-h-[500px] sm:min-h-[640px] w-full flex justify-center items-center overflow-hidden">
        {activeTab === '2d' ? (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-[radial-gradient(#334155_1.1px,transparent_1.1px)] [background-size:20px_20px]">
            <div className="text-center text-[10px] text-slate-400 mb-2 font-medium">💡 Arrastrá libremente. Las aberturas son más gruesas para seleccionarlas al toque.</div>
            <svg 
              ref={svgRef}
              viewBox={`${viewBounds.minX * scale} ${viewBounds.minY * scale} ${viewBounds.w * scale} ${viewBounds.l * scale}`}
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleGlobalMove}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchMove={handleGlobalMove}
              onTouchEnd={() => setIsDragging(false)}
              className="w-full h-full max-h-[520px] bg-slate-900 rounded-xl border border-slate-800 shadow-xl touch-none"
            >
              {hasWalkway && (
                <rect 
                  x={(boundingBox.minX - numWalkway) * scale} 
                  y={(boundingBox.minY - numWalkway) * scale} 
                  width={(boundingBox.w + numWalkway * 2) * scale} 
                  height={(boundingBox.l + numWalkway * 2) * scale} 
                  fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 4" 
                />
              )}

              {/* Habitaciones */}
              {rooms.map(r => {
                const isSel = r.id === selectedId && selectedType === 'room'
                return (
                  <g key={r.id} className="cursor-move" onMouseDown={(e) => handleDragStart(r.id, 'room', e)} onTouchStart={(e) => handleDragStart(r.id, 'room', e)}>
                    <rect x={r.x * scale} y={r.y * scale} width={r.w * scale} height={r.l * scale} fill={r.color2D} fillOpacity={isSel ? "0.35" : "0.15"} stroke={isSel ? "#10b981" : "#38bdf8"} strokeWidth={isSel ? 3 : 1.5} rx="1" />
                    <text x={(r.x + 0.15) * scale} y={(r.y + 0.4) * scale} fill="white" className="text-[10px] font-black pointer-events-none select-none">{r.name}</text>
                  </g>
                )
              })}

              {/* Accesorios y Aberturas Ampliadas */}
              {placedItems.map(item => {
                const isSel = item.id === selectedId && selectedType === 'item'
                return (
                  <g key={item.id} className="cursor-move" onMouseDown={(e) => handleDragStart(item.id, 'item', e)} onTouchStart={(e) => handleDragStart(item.id, 'item', e)}>
                    <rect x={item.x * scale} y={item.y * scale} width={item.w * scale} height={item.l * scale} fill={item.color} fillOpacity={isSel ? "0.85" : "0.5"} stroke="white" strokeWidth={isSel ? 2 : 0.5} rx="2" />
                    <text x={(item.x + 0.08) * scale} y={(item.y + item.l / 2) * scale + 3} fill="white" className="text-[8px] font-bold pointer-events-none select-none">{item.label}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          
          /* 🌲 RENDER 3D PERFECCIONADO */
          <div className="absolute inset-0 w-full h-full block touch-none">
            <Canvas camera={{ position: [boundingBox.minX + boundingBox.w/2, hMuros + 5, boundingBox.minY + boundingBox.l + 6], fov: 42 }} shadows style={{ position: 'absolute' }}>
              <Sky sunPosition={[140, 45, 50]} inclination={0.6} azimuth={0.25} />
              <ambientLight intensity={0.8} />
              <directionalLight position={[30, 50, 30]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} />
              
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[300, 300]} />
                <meshStandardMaterial color="#1a3d10" roughness={0.95} />
              </mesh>

              <group position={[0, floorY, 0]}>
                
                {/* PILOTES ESTRUCTURALES */}
                {baseType === 'Pilotes' && (
                  <group position={[0, -floorY, 0]}>
                    {rooms.map((r, rIdx) => (
                      <group key={`p-group-${r.id}-${rIdx}`}>
                        {[0.15, r.w / 2, r.w - 0.15].map(xOffset =>
                          [0.15, r.l / 2, r.l - 0.15].map((zOffset, idx) => (
                            <mesh key={`p-room-${r.id}-${xOffset}-${zOffset}-${idx}`} position={[r.x + xOffset, floorY / 2, r.y + zOffset]} castShadow>
                              <cylinderGeometry args={[0.10, 0.11, floorY]} />
                              <meshStandardMaterial color="#2d1606" roughness={0.85} />
                            </mesh>
                          ))
                        )}
                      </group>
                    ))}
                  </group>
                )}

                {/* PLATEA */}
                {baseType === 'PlateaHormigon' && (
                  <mesh position={[boundingBox.minX + boundingBox.w / 2, -floorY / 2, boundingBox.minY + boundingBox.l / 2]} receiveShadow>
                    <boxGeometry args={[boundingBox.w, floorY, boundingBox.l]} />
                    <meshStandardMaterial color="#4b5563" roughness={0.6} />
                  </mesh>
                )}

                {/* DECK Y PASAMANO */}
                {hasWalkway && (
                  <group>
                    <mesh position={[boundingBox.minX + boundingBox.w / 2, floorThickness / 2, boundingBox.minY + boundingBox.l / 2]} receiveShadow>
                      <boxGeometry args={[boundingBox.w + numWalkway * 2, floorThickness, boundingBox.l + numWalkway * 2]} />
                      <meshStandardMaterial color={woodColor} roughness={0.85} />
                    </mesh>

                    <group position={[0, floorThickness, 0]}>
                      {/* Pasamanos Superior */}
                      <group position={[boundingBox.minX + boundingBox.w / 2, hBaranda, boundingBox.minY + boundingBox.l / 2]}>
                         <mesh position={[0, 0, -(boundingBox.l + numWalkway * 2) / 2]}><boxGeometry args={[boundingBox.w + numWalkway * 2 + 0.04, 0.03, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                         <mesh position={[0, 0, (boundingBox.l + numWalkway * 2) / 2]}><boxGeometry args={[boundingBox.w + numWalkway * 2 + 0.04, 0.03, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                         <mesh position={[-(boundingBox.w + numWalkway * 2) / 2, 0, 0]}><boxGeometry args={[0.04, 0.03, boundingBox.l + numWalkway * 2 + 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                         <mesh position={[(boundingBox.w + numWalkway * 2) / 2, 0, 0]}><boxGeometry args={[0.04, 0.03, boundingBox.l + numWalkway * 2 + 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      </group>
                      {/* Balaustres */}
                      {generateBalusters.map((bal, idx) => (
                        <mesh key={`b-3d-${idx}`} position={bal.pos} castShadow>
                          <boxGeometry args={[0.025, hBaranda, 0.025]} />
                          <meshStandardMaterial color="#2d1606" roughness={0.9} />
                        </mesh>
                      ))}
                    </group>
                  </group>
                )}

                {/* SUELOS INTERIORES */}
                {rooms.map(r => (
                  <mesh key={`floor-3d-${r.id}`} position={[r.x + r.w / 2, floorThickness / 2 + 0.005, r.y + r.l / 2]} receiveShadow>
                    <boxGeometry args={[r.w - 0.02, floorThickness, r.l - 0.02]} />
                    <meshStandardMaterial color="#5c2d0c" roughness={0.7} />
                  </mesh>
                ))}

                {/* PAREDES */}
                <group position={[0, floorThickness, 0]}>
                  {rooms.map(r => (
                    <group key={`walls-3d-${r.id}`}>
                      <mesh position={[r.x + r.w / 2, hMuros / 2, r.y]} castShadow><boxGeometry args={[r.w, hMuros, 0.12]} /><meshStandardMaterial color={woodColor} /></mesh>
                      <mesh position={[r.x + r.w / 2, hMuros / 2, r.y + r.l]} castShadow><boxGeometry args={[r.w, hMuros, 0.12]} /><meshStandardMaterial color={woodColor} /></mesh>
                      <mesh position={[r.x, hMuros / 2, r.y + r.l / 2]} castShadow><boxGeometry args={[0.12, hMuros, r.l]} /><meshStandardMaterial color={woodColor} /></mesh>
                      <mesh position={[r.x + r.w, hMuros / 2, r.y + r.l / 2]} castShadow><boxGeometry args={[0.12, hMuros, r.l]} /><meshStandardMaterial color={woodColor} /></mesh>
                    </group>
                  ))}
                </group>

                {/* PUERTAS, VENTANAS Y MUEBLES */}
                <group position={[0, floorThickness, 0]}>
                  {placedItems.map(item => {
                    const isAb = item.type === 'puerta' || item.type === 'ventana'
                    const realWidth = isAb ? (item.type === 'puerta' ? 0.90 : 1.20) : item.w
                    const realLength = isAb ? 0.12 : item.l 
                    const height = isAb ? 2.05 : 0.45
                    const yPos = isAb ? height / 2 + 0.05 : height / 2
                    
                    let material;
                    if (item.type === 'puerta') {
                      material = <meshStandardMaterial color="#78350f" roughness={0.8} />
                    } else if (item.type === 'ventana') {
                      material = <meshStandardMaterial color="#a5f3fc" transparent opacity={0.4} metalness={0.9} roughness={0.05} />
                    } else {
                      material = <meshStandardMaterial color={item.color} />
                    }

                    return (
                      <mesh key={`item-3d-${item.id}`} position={[item.x + item.w / 2, yPos, item.y + item.l / 2]} castShadow>
                        <boxGeometry args={[realWidth, height, realLength]} />
                        {material}
                      </mesh>
                    )
                  })}
                </group>

                {/* 🏠 TECHO ADAPTABLE MÁS ALTO */}
                <group position={[boundingBox.minX + boundingBox.w / 2, floorThickness + hMuros, boundingBox.minY + boundingBox.l / 2]}>
                  <mesh position={[-boundingBox.w / 4, 0.70, 0]} rotation={[0, 0, 0.32]} castShadow>
                    <boxGeometry args={[boundingBox.w / 1.8 + numEave, 0.06, boundingBox.l + numEave * 2]} />
                    <meshStandardMaterial color={roofColor} roughness={0.4} />
                  </mesh>
                  <mesh position={[boundingBox.w / 4, 0.70, 0]} rotation={[0, 0, -0.32]} castShadow>
                    <boxGeometry args={[boundingBox.w / 1.8 + numEave, 0.06, boundingBox.l + numEave * 2]} />
                    <meshStandardMaterial color={roofColor} roughness={0.4} />
                  </mesh>
                </group>

              </group>

              <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.05} makeDefault />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  )
}
