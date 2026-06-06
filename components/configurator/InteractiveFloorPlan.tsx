'use client'

import React, { useState, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Center } from '@react-three/drei'

// --- 📐 INTERFACES ESTRICTAS ---
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

// 🎨 CATÁLOGO EXTENDIDO DE COLORES REALES
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

export default function InteractiveFloorPlan({ options }: { options?: any }) {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  
  // 🚶 VARIABLES DINÁMICAS DEL CAMINADOR Y ALEROS
  const [walkwayWidth, setWalkwayWidth] = useState<number>(1.2) // Ancho del pasillo
  const [eaveLength, setEaveLength] = useState<number>(0.8)     // Largo/Vuelo del alero
  const [hasWalkway, setHasWalkway] = useState<boolean>(true)

  // 🎨 ESTADOS DE COLOR SELECCIONADOS
  const [woodColor, setWoodColor] = useState<string>('#b45309')
  const [roofColor, setRoofColor] = useState<string>('#334155')

  // 🏠 BLOQUES DE HABITACIÓN MODULABLES (Permite formas en L, divisiones libres)
  const [rooms, setRooms] = useState<RoomBlock[]>([
    { id: 'r1', name: 'Módulo Principal', x: 0, y: 0, w: 6.0, l: 5.0, color2D: '#bfdbfe' },
    { id: 'r2', name: 'Ala en L / Cocina', x: 6.0, y: 0, w: 3.0, l: 3.5, color2D: '#fed7aa' }
  ])

  // 🛋️ MOBILIARIO Y ABERTURAS COLOCADAS
  const [placedItems, setPlacedItems] = useState<DraggableItem[]>([
    { id: 'i1', type: 'puerta', x: 2.0, y: 0.0, w: 0.9, l: 0.15, label: '🚪 Puerta Princ.', color: '#ef4444' },
    { id: 'i2', type: 'ventana', x: 4.0, y: 0.0, w: 1.2, l: 0.15, label: '🪟 Ventana', color: '#38bdf8' },
  ])

  // --- SELECCIÓN Y DRAG GLOBAL ---
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'room' | 'item' | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragOffset, setDragOffset] = useState<Point2D>({ x: 0, y: 0 })
  const [baseType, setBaseType] = useState<'Pilotes' | 'PlateaHormigon'>('Pilotes')
  const [eaves, setEaves] = useState({ n: true, s: true, e: true, o: true })

  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 35 

  // --- CÁLCULO DE ENVOLVENTE MÁXIMA EN TIEMPO REAL (Para el caminador, techo único y cámara) ---
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

  // --- CAPTURADOR DE COORDENADAS ---
  const getCoordinates = (e: any) => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const svgX = ((clientX - rect.left) / rect.width) * (viewBounds.w * scale) + (viewBounds.minX * scale)
    const svgY = ((clientY - rect.top) / rect.height) * (viewBounds.l * scale) + (viewBounds.minY * scale)
    return { x: Math.round((svgX / scale) * 10) / 10, y: Math.round((svgY / scale) * 10) / 10 }
  }

  // --- CREACIÓN DE ELEMENTOS ---
  const addNewRoom = () => {
    const newR: RoomBlock = {
      id: `room-${Date.now()}`,
      name: `Habitación ${rooms.length + 1}`,
      x: boundingBox.minX,
      y: boundingBox.maxY,
      w: 3.5,
      l: 3.5,
      color2D: ['#bfdbfe', '#fed7aa', '#fef08a', '#fbcfe8', '#ccfbf1'][rooms.length % 5]
    }
    setRooms([...rooms, newR])
    setSelectedId(newR.id)
    setSelectedType('room')
  }

  const addItemToPlan = (type: 'puerta' | 'ventana' | 'cama' | 'sillon' | 'mesa') => {
    const presets: Record<string, { w: number; l: number; label: string; color: string }> = {
      puerta: { w: 0.9, l: 0.15, label: '🚪 Puerta', color: '#ef4444' },
      ventana: { w: 1.2, l: 0.15, label: '🪟 Ventana', color: '#38bdf8' },
      cama: { w: 1.9, l: 2.0, label: '🛏️ Cama', color: '#a855f7' },
      sillon: { w: 1.6, l: 0.8, label: '🛋️ Sillón', color: '#f97316' },
      mesa: { w: 1.4, l: 0.9, label: '🪑 Mesa', color: '#10b981' },
    }
    const config = presets[type]
    const newItem: DraggableItem = {
      id: `item-${Date.now()}`,
      type,
      x: boundingBox.minX + boundingBox.w / 2,
      y: boundingBox.minY + boundingBox.l / 2,
      ...config
    }
    setPlacedItems([...placedItems, newItem])
    setSelectedId(newItem.id)
    setSelectedType('item')
  }

  // --- MANIPULACIÓN POR ARRASTRE ---
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
      setRooms(prev => prev.map(r => r.id === selectedId ? { ...r, x: Math.round((coords.x - dragOffset.x) * 2) / 2, y: Math.round((coords.y - dragOffset.y) * 2) / 2 } : r))
    } else {
      setPlacedItems(prev => prev.map(it => it.id === selectedId ? { ...it, x: coords.x - dragOffset.x, y: coords.y - dragOffset.y } : it))
    }
  }

  const selectedRoomObj = useMemo(() => {
    if (selectedType === 'room') return rooms.find(r => r.id === selectedId) || null
    return null
  }, [rooms, selectedId, selectedType])

  const updateSelectedRoomProp = (field: 'w' | 'l' | 'name', val: any) => {
    if (!selectedId) return
    setRooms(prev => prev.map(r => r.id === selectedId ? { ...r, [field]: val } : r))
  }

  // --- 📐 CONSTANTES DE ALTURA CONSTRUCTIVA REAL ---
  const floorThickness = 0.04
  const hPilotes = 0.60                   
  const floorY = baseType === 'Pilotes' ? hPilotes : 0.20 
  const hMuros = 2.70                     
  const hBaranda = 0.75                   

  // Generador dinámico de palitos (Balaustres) según el perímetro total
  const generateBalusters = useMemo(() => {
    const list: Array<{ pos: [number, number, number] }> = []
    if (!hasWalkway) return list
    const spacing = 0.35 
    
    const eW = boundingBox.w + walkwayWidth * 2
    const eL = boundingBox.l + walkwayWidth * 2
    const cX = boundingBox.minX + boundingBox.w / 2
    const cZ = boundingBox.minY + boundingBox.l / 2

    // Cerca perimetral Norte y Sur
    const stepsX = Math.floor(eW / spacing)
    for (let i = 0; i <= stepsX; i++) {
      const x = (cX - eW / 2) + (i * (eW / stepsX))
      list.push({ pos: [x, hBaranda / 2, cZ - eL / 2] })
      list.push({ pos: [x, hBaranda / 2, cZ + eL / 2] })
    }
    // Cerca perimetral Este y Oeste
    const stepsZ = Math.floor(eL / spacing)
    for (let i = 1; i < stepsZ; i++) {
      const z = (cZ - eL / 2) + (i * (eL / stepsZ))
      list.push({ pos: [cX - eW / 2, hBaranda / 2, z] })
      list.push({ pos: [cX + eW / 2, hBaranda / 2, z] })
    }
    return list
  }, [boundingBox, walkwayWidth, hasWalkway])

  return (
    <div className="flex flex-col xl:flex-row gap-4 p-4 bg-slate-900 text-white rounded-3xl shadow-2xl select-none w-full max-w-7xl mx-auto overflow-hidden">
      
      {/* 🛠️ PANEL DE CONTROL INTELIGENTE */}
      <div className="w-full xl:w-96 flex flex-col gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0 max-h-[500px] xl:max-h-[720px] overflow-y-auto">
        <div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            Estudio Arquitectura Libre v4
          </span>
          <h2 className="text-lg font-black mt-1">Diseño en Planta y Renderizado</h2>
        </div>

        {/* SELECTOR DE VISTA */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
            📐 Plano 2D (Modelador)
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            🌲 Render 3D Sincronizado
          </button>
        </div>

        {/* 🎨 SECTOR: COLORES DE MATERIALES */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
          <div>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">🏠 Tono Cabaña y Caminador:</p>
            <div className="grid grid-cols-3 gap-1">
              {WALL_COLORS.map(c => (
                <button key={c.hex} onClick={() => setWoodColor(c.hex)} className={`p-1 rounded text-[9px] font-medium border transition flex flex-col items-center gap-1 ${woodColor === c.hex ? 'border-white bg-slate-800' : 'border-transparent bg-slate-950 hover:bg-slate-800'}`}>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span className="truncate w-full text-center">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-2">☔ Tono de Techo y Aleros:</p>
            <div className="grid grid-cols-3 gap-1">
              {ROOF_COLORS.map(c => (
                <button key={c.hex} onClick={() => setRoofColor(c.hex)} className={`p-1 rounded text-[9px] font-medium border transition flex flex-col items-center gap-1 ${roofColor === c.hex ? 'border-white bg-slate-800' : 'border-transparent bg-slate-950 hover:bg-slate-800'}`}>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span className="truncate w-full text-center">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 📏 SECTOR: MEDIDAS PRECISAS DE CAMINADOR Y ALERO */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">📏 Configurar Extensiones:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Ancho Caminador (m):</label>
              <input type="number" min="0.4" max="3.0" step="0.1" value={walkwayWidth} onChange={(e) => setWalkwayWidth(parseFloat(e.target.value) || 0.4)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-amber-400 outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Vuelo de Alero (m):</label>
              <input type="number" min="0.2" max="2.5" step="0.1" value={eaveLength} onChange={(e) => setEaveLength(parseFloat(e.target.value) || 0.2)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-sky-400 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Cimentación:</label>
              <select value={baseType} onChange={(e) => setBaseType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1 rounded text-xs text-white">
                <option value="Pilotes">🪵 Pilotes Elevados</option>
                <option value="PlateaHormigon">🧱 Platea de Fundación</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-[11px] text-slate-300">
                <input type="checkbox" checked={hasWalkway} onChange={(e) => setHasWalkway(e.target.checked)} className="rounded accent-amber-500" /> Ver Cerca / Cerca
              </label>
            </div>
          </div>
        </div>

        {/* 🧱 MODELADO EN PLANTA */}
        {activeTab === '2d' && (
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">🧱 Modelado Estructural Libre:</p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button onClick={addNewRoom} className="p-2 bg-emerald-950/60 hover:bg-emerald-900 rounded border border-emerald-800 text-center font-bold col-span-2">➕ Añadir Nuevo Módulo/Habitación</button>
              <button onClick={() => addItemToPlan('puerta')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700">🚪 Añadir Puerta</button>
              <button onClick={() => addItemToPlan('ventana')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700">🪟 Añadir Ventana</button>
              <button onClick={() => addItemToPlan('cama')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700">🛏️ Añadir Cama</button>
              <button onClick={() => addItemToPlan('sillon')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700">🛋️ Añadir Sillón</button>
            </div>

            {/* EDICIÓN DE MEDIDAS DE MÓDULOS */}
            {selectedRoomObj && (
              <div className="bg-slate-950 p-2.5 rounded border border-slate-700 space-y-2 mt-2">
                <p className="text-[10px] font-black text-emerald-400">✏️ Editar {selectedRoomObj.name}:</p>
                <div>
                  <label className="text-[9px] text-slate-400">Nombre de zona:</label>
                  <input type="text" value={selectedRoomObj.name} onChange={(e) => updateSelectedRoomProp('name', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400">Ancho Módulo (m):</label>
                    <input type="number" min="1" max="15" step="0.5" value={selectedRoomObj.w} onChange={(e) => updateSelectedRoomProp('w', parseFloat(e.target.value) || 1)} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-center text-white font-mono" />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400">Largo Módulo (m):</label>
                    <input type="number" min="1" max="15" step="0.5" value={selectedRoomObj.l} onChange={(e) => updateSelectedRoomProp('l', parseFloat(e.target.value) || 1)} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-center text-white font-mono" />
                  </div>
                </div>
                <button onClick={() => { setRooms(prev => prev.filter(r => r.id !== selectedId)); setSelectedId(null); }} className="w-full text-center bg-red-950 hover:bg-red-900 border border-red-800 text-[10px] font-bold text-red-300 p-1 rounded mt-1">
                  🗑️ Eliminar este Módulo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🖥/ VISTA GRÁFICA INTERACTIVA */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 relative min-h-[500px] sm:min-h-[640px] w-full flex justify-center items-center overflow-hidden">
        {activeTab === '2d' ? (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-[radial-gradient(#334155_1.1px,transparent_1.1px)] [background-size:20px_20px]">
            <div className="text-center text-[10px] text-slate-400 mb-2 font-medium">💡 Modificá el tamaño arriba. Arrastrá habitaciones para armar formas en L.</div>
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
              {/* CAMINADOR PERIMETRAL EN PLANO 2D */}
              {hasWalkway && (
                <rect 
                  x={(boundingBox.minX - walkwayWidth) * scale} 
                  y={(boundingBox.minY - walkwayWidth) * scale} 
                  width={(boundingBox.w + walkwayWidth * 2) * scale} 
                  height={(boundingBox.l + walkwayWidth * 2) * scale} 
                  fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 4" 
                />
              )}

              {/* RENDER MÓDULOS DE HABITACIONES */}
              {rooms.map(r => {
                const isSel = r.id === selectedId && selectedType === 'room'
                return (
                  <g key={r.id} className="cursor-move" onMouseDown={(e) => handleDragStart(r.id, 'room', e)} onTouchStart={(e) => handleDragStart(r.id, 'room', e)}>
                    <rect x={r.x * scale} y={r.y * scale} width={r.w * scale} height={r.l * scale} fill={r.color2D} fillOpacity={isSel ? "0.3" : "0.15"} stroke={isSel ? "#10b981" : "#38bdf8"} strokeWidth={isSel ? 3 : 1.5} rx="1" />
                    <text x={(r.x + 0.15) * scale} y={(r.y + 0.4) * scale} fill="white" className="text-[10px] font-black pointer-events-none select-none">{r.name} ({r.w}mx{r.l}m)</text>
                  </g>
                )
              })}

              {/* RENDER ITEMS INDEPENDIENTES */}
              {placedItems.map(item => {
                const isSel = item.id === selectedId && selectedType === 'item'
                return (
                  <g key={item.id} className="cursor-move" onMouseDown={(e) => handleDragStart(item.id, 'item', e)} onTouchStart={(e) => handleDragStart(item.id, 'item', e)}>
                    <rect x={item.x * scale} y={item.y * scale} width={item.w * scale} height={item.l * scale} fill={item.color} fillOpacity={isSel ? "0.7" : "0.4"} stroke={item.color} strokeWidth={isSel ? 2.5 : 1} rx="2" />
                    <text x={(item.x + 0.05) * scale} y={(item.y + item.l / 2) * scale + 3} fill="white" className="text-[8px] font-bold pointer-events-none">{item.label}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          
          /* 🌲 SCENARIO RENDER 3D PROFESIONAL COMPLETO */
          <div className="absolute inset-0 w-full h-full block touch-none">
            <Canvas camera={{ position: [boundingBox.minX + boundingBox.w/2, boundingBox.w * 1.4, boundingBox.minY + boundingBox.l * 1.6], fov: 42 }} shadows style={{ position: 'absolute' }}>
              <Sky sunPosition={[140, 45, 50]} inclination={0.6} azimuth={0.25} />
              <ambientLight intensity={0.9} />
              <directionalLight position={[40, 60, 40]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
              
              {/* Terreno / Césped */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[250, 250]} />
                <meshStandardMaterial color="#1a3d10" roughness={0.95} />
              </mesh>

                          <Center>
                {/* 🏠 ESTRUCTURA COMPLETA ELEVADA SOBRE EL SUELO */}
                <group position={[0, floorY, 0]}>
                  
                  {/* PILOTES (Si es tipo Pilotes) */}
                  {baseType === 'Pilotes' && (
                    <group position={[0, -hPilotes/2, 0]}>
                      {rooms.map((r, rIdx) => (
                        <group key={`p-group-${r.id}-${rIdx}`}>
                          {[0.1, r.w / 2, r.w - 0.1].map(xOffset =>
                            [0.1, r.l / 2, r.l - 0.1].map((zOffset, idx) => (
                              <mesh key={`p-room-${r.id}-${xOffset}-${zOffset}-${idx}`} position={[r.x + xOffset, hPilotes / 2, r.y + zOffset]} castShadow>
                                <cylinderGeometry args={[0.11, 0.12, hPilotes]} />
                                <meshStandardMaterial color="#221105" roughness={0.8} />
                              </mesh>
                            ))
                          )}
                        </group>
                      ))}
                    </group>
                  )}

                  {/* SUELO INTERIOR */}
                  {rooms.map(r => (
                    <mesh key={`floor-3d-${r.id}`} position={[r.x + r.w / 2, floorThickness / 2, r.y + r.l / 2]} receiveShadow>
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

                  {/* TECHO ÚNICO */}
                  <group position={[boundingBox.minX + boundingBox.w / 2, floorThickness + hMuros, boundingBox.minY + boundingBox.l / 2]}>
                    <mesh position={[-boundingBox.w / 4, 0.40, 0]} rotation={[0, 0, 0.28]} castShadow>
                      <boxGeometry args={[boundingBox.w / 1.85, 0.05, boundingBox.l + 0.3]} />
                      <meshStandardMaterial color={roofColor} roughness={0.5} />
                    </mesh>
                    <mesh position={[boundingBox.w / 4, 0.40, 0]} rotation={[0, 0, -0.28]} castShadow>
                      <boxGeometry args={[boundingBox.w / 1.85, 0.05, boundingBox.l + 0.3]} />
                      <meshStandardMaterial color={roofColor} roughness={0.5} />
                    </mesh>
                  </group>
                </group>
              </Center>


              <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.02} makeDefault />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  )
}
