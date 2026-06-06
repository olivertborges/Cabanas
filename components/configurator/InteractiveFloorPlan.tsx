'use client'

import React, { useState, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Center } from '@react-three/drei'

// --- 📐 INTERFACES ESTRICTAS ---
interface Point2D { x: number; y: number }

interface RoomBlock {
  id: string
  name: string
  min: Point2D
  max: Point2D
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

export default function InteractiveFloorPlan({ options }: { options?: any }) {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  
  // 📏 MEDIDAS MASTER DE LA CABAÑA BASE
  const [cabinWidth, setCabinWidth] = useState<number>(8.0)
  const [cabinLength, setCabinLength] = useState<number>(7.0)

  // 🚶 CONFIGURACIÓN DEL CAMINADOR
  const [walkwayWidth, setWalkwayWidth] = useState<number>(1.2)
  const [hasWalkway, setHasWalkway] = useState<boolean>(true)

  // 🚪 DISTRIBUCIÓN FIJA DE AMBIENTES
  const rooms = useMemo<RoomBlock[]>(() => {
    const w = cabinWidth
    const l = cabinLength
    return [
      { id: 'r1', name: 'Living Comedor', min: { x: 0, y: 0 }, max: { x: w * 0.6, y: l * 0.5 }, color2D: '#fef08a' },
      { id: 'r2', name: 'Cocina Gourmet', min: { x: w * 0.6, y: 0 }, max: { x: w, y: l * 0.5 }, color2D: '#fed7aa' },
      { id: 'r3', name: 'Dormitorio Principal', min: { x: 0, y: l * 0.5 }, max: { x: w * 0.6, y: l }, color2D: '#bfdbfe' },
      { id: 'r4', name: 'Baño Completo', min: { x: w * 0.6, y: l * 0.5 }, max: { x: w, y: l }, color2D: '#fbcfe8' },
    ]
  }, [cabinWidth, cabinLength])

  // 🛋️ MOBILIARIO Y ABERTURAS COLOCADAS EN EL PLÁNO
  const [placedItems, setPlacedItems] = useState<DraggableItem[]>([
    { id: 'i1', type: 'puerta', x: 2.0, y: 0.0, w: 0.9, l: 0.15, label: '🚪 Puerta Princ.', color: '#ef4444' },
    { id: 'i2', type: 'ventana', x: 4.5, y: 0.0, w: 1.2, l: 0.15, label: '🪟 Ventana', color: '#38bdf8' },
    { id: 'i3', type: 'cama', x: 1.0, y: 4.5, w: 1.9, l: 2.0, label: '🛏️ Cama Matrimonial', color: '#a855f7' },
  ])

  // --- ESTADOS DE INTERACCIÓN ---
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragOffset, setDragOffset] = useState<Point2D>({ x: 0, y: 0 })

  // --- OPCIONES BIOCLIMÁTICAS ---
  const [baseType, setBaseType] = useState<'Pilotes' | 'PlateaHormigon'>('Pilotes')
  const [roofColor, setRoofColor] = useState<string>('#334155')
  const [woodColor, setWoodColor] = useState<string>('#b45309')
  const [eaves, setEaves] = useState({ n: true, s: false, e: true, o: false })

  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 40 

  const viewBounds = useMemo(() => {
    const margin = 3.0
    return { minX: -margin, minY: -margin, w: cabinWidth + (margin * 2), l: cabinLength + (margin * 2) }
  }, [cabinWidth, cabinLength])

  // --- TRAZADOR DE COORDENADAS ---
  const getCoordinates = (e: any) => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const svgX = ((clientX - rect.left) / rect.width) * (viewBounds.w * scale) + (viewBounds.minX * scale)
    const svgY = ((clientY - rect.top) / rect.height) * (viewBounds.l * scale) + (viewBounds.minY * scale)
    return { x: Math.round((svgX / scale) * 10) / 10, y: Math.round((svgY / scale) * 10) / 10 }
  }

  // --- AGREGAR ITEM AL CANVAS ---
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
      x: cabinWidth / 2 - config.w / 2,
      y: cabinLength / 2 - config.l / 2,
      ...config
    }
    setPlacedItems([...placedItems, newItem])
    setSelectedItemId(newItem.id)
  }

  const handleItemDragStart = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setSelectedItemId(id)
    setIsDragging(true)
    const coords = getCoordinates(e)
    const item = placedItems.find(i => i.id === id)
    if (coords && item) {
      setDragOffset({ x: coords.x - item.x, y: coords.y - item.y })
    }
  }

  const handleGlobalMove = (e: any) => {
    if (!isDragging || !selectedItemId) return
    const coords = getCoordinates(e)
    if (!coords) return

    setPlacedItems(prev => prev.map(item => {
      if (item.id !== selectedItemId) return item
      let newX = coords.x - dragOffset.x
      let newY = coords.y - dragOffset.y
      newX = Math.max(-2, Math.min(cabinWidth + 1, newX))
      newY = Math.max(-2, Math.min(cabinLength + 1, newY))
      return { ...item, x: newX, y: newY }
    }))
  }

  const handleGlobalEnd = () => setIsDragging(false)

  // --- 📐 CONSTANTES DE CORRECCIÓN DE ALTURA REAL (CÉSPED EN Y = 0) ---
  const floorThickness = 0.04
  const hPilotes = 0.60                   // Altura libre de pilotes sobre el pasto
  // Nivel real donde apoya el calzado/muebles de la casa
  const floorY = baseType === 'Pilotes' ? hPilotes + floorThickness : 0.20 + floorThickness 
  
  const hMuros = 2.70                     // Muros interiores más altos
  const extW = cabinWidth + walkwayWidth * 2
  const extL = cabinLength + walkwayWidth * 2
  const hBaranda = 0.80                   // Cerquita a altura reglamentaria

  return (
    <div className="flex flex-col xl:flex-row gap-4 p-4 bg-slate-900 text-white rounded-3xl shadow-2xl select-none w-full max-w-7xl mx-auto overflow-hidden">
      
      {/* 🛠️ PANEL DE CONTROL */}
      <div className="w-full xl:w-96 flex flex-col gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0 max-h-[480px] xl:max-h-[680px] overflow-y-auto">
        <div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            Estudio Arquitectura RealScale
          </span>
          <h2 className="text-lg font-black mt-1">Configurador y Planificación</h2>
        </div>

        {/* SELECTOR DE VISTA */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
            📐 Plano 2D (Diseño)
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            🌲 Render 3D Corregido
          </button>
        </div>

        {/* MEDIDAS DE LA ESTRUCTURA */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">📐 Dimensiones Núcleo Cabaña:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Ancho Base (m):</label>
              <input type="number" min="4" max="16" step="0.5" value={cabinWidth} onChange={(e) => setCabinWidth(parseFloat(e.target.value) || 4)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-white outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Largo Base (m):</label>
              <input type="number" min="4" max="16" step="0.5" value={cabinLength} onChange={(e) => setCabinLength(parseFloat(e.target.value) || 4)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-white outline-none" />
            </div>
          </div>
        </div>

        {/* HERRAMIENTAS 2D */}
        {activeTab === '2d' && (
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">🧱 Equipamiento y Aberturas (Añadir):</p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button onClick={() => addItemToPlan('puerta')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700 font-medium text-left">🚪 Colocar Puerta</button>
              <button onClick={() => addItemToPlan('ventana')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700 font-medium text-left">🪟 Colocar Ventana</button>
              <button onClick={() => addItemToPlan('cama')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700 font-medium text-left">🛏️ Añadir Cama</button>
              <button onClick={() => addItemToPlan('sillon')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700 font-medium text-left">🛋️ Añadir Sillón</button>
              <button onClick={() => addItemToPlan('mesa')} className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-700 font-medium text-left col-span-2 text-center bg-emerald-950/40 border-emerald-800">🪑 Añadir Mesa de Comedor</button>
            </div>
            {selectedItemId && (
              <button onClick={() => { setPlacedItems(prev => prev.filter(i => i.id !== selectedItemId)); setSelectedItemId(null); }} className="w-full mt-2 p-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded border border-red-800 text-[11px] font-bold">
                🗑️ Eliminar Objeto Seleccionado
              </button>
            )}
          </div>
        )}

        {/* DECK, ALEROS Y MATERIALES */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
          <div>
            <label className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <input type="checkbox" checked={hasWalkway} onChange={(e) => setHasWalkway(e.target.checked)} className="rounded bg-slate-950 accent-amber-500" /> 
              Activar Caminador + Cerquita
            </label>
            {hasWalkway && (
              <div className="mt-2">
                <label className="text-[10px] text-slate-400 block mb-0.5">Ancho de Deck Perimetral (m):</label>
                <input type="number" min="0.6" max="2.5" step="0.1" value={walkwayWidth} onChange={(e) => setWalkwayWidth(parseFloat(e.target.value) || 0.6)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs font-mono text-amber-400 outline-none font-bold" />
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-2">
            <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1.5">☔ Aleros Bioclimáticos Activos:</p>
            <div className="grid grid-cols-4 gap-1 text-xs text-center font-bold">
              <button onClick={() => setEaves({...eaves, n: !eaves.n})} className={`p-1 rounded border ${eaves.n ? 'bg-sky-600 text-white border-white' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>Norte</button>
              <button onClick={() => setEaves({...eaves, s: !eaves.s})} className={`p-1 rounded border ${eaves.s ? 'bg-sky-600 text-white border-white' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>Sur</button>
              <button onClick={() => setEaves({...eaves, e: !eaves.e})} className={`p-1 rounded border ${eaves.e ? 'bg-sky-600 text-white border-white' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>Este</button>
              <button onClick={() => setEaves({...eaves, o: !eaves.o})} className={`p-1 rounded border ${eaves.o ? 'bg-sky-600 text-white border-white' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>Oeste</button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Cimentación:</label>
              <select value={baseType} onChange={(e) => setBaseType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1 rounded text-xs text-white">
                <option value="Pilotes">🪵 Pilotes Elevados</option>
                <option value="PlateaHormigon">🧱 Platea de Fundación</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Tonalidad Estructural:</label>
              <select value={woodColor} onChange={(e) => setWoodColor(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-1 rounded text-xs text-white">
                <option value="#b45309">🪵 Madera Natural</option>
                <option value="#4b5563">⚫ Madera Grafito</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 🖥️ ÁREA DE RENDERIZADO */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 relative min-h-[480px] sm:min-h-[620px] w-full flex justify-center items-center overflow-hidden">
        
        {activeTab === '2d' ? (
          <div className="w-full h-full flex flex-col justify-center items-center bg-[radial-gradient(#334155_1.1px,transparent_1.1px)] [background-size:20px_20px] p-4">
            <div className="text-center text-[11px] text-slate-400 mb-2 font-medium">💡 Arrastrá los objetos libres dentro del núcleo azul para amueblar la cabaña.</div>
            <svg 
              ref={svgRef}
              viewBox={`${viewBounds.minX * scale} ${viewBounds.minY * scale} ${viewBounds.w * scale} ${viewBounds.l * scale}`}
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleGlobalMove}
              onMouseUp={handleGlobalEnd}
              onMouseLeave={handleGlobalEnd}
              onTouchMove={handleGlobalMove}
              onTouchEnd={handleGlobalEnd}
              className="w-full h-full max-h-[500px] bg-slate-900 rounded-xl border border-slate-800 shadow-xl touch-none"
            >
              {hasWalkway && (
                <g>
                  <rect x={-walkwayWidth * scale} y={-walkwayWidth * scale} width={extW * scale} height={extL * scale} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
                </g>
              )}

              <rect x={0} y={0} width={cabinWidth * scale} height={cabinLength * scale} fill="none" stroke="#38bdf8" strokeWidth="3" />
              
              {rooms.map(r => {
                const rw = (r.max.x - r.min.x) * scale
                const rh = (r.max.y - r.min.y) * scale
                return (
                  <g key={r.id}>
                    <rect x={r.min.x * scale} y={r.min.y * scale} width={rw} height={rh} fill={r.color2D} fillOpacity="0.12" stroke="#334155" strokeWidth="1" />
                    <text x={(r.min.x + 0.15) * scale} y={(r.min.y + 0.4) * scale} fill="white" className="text-[10px] font-black opacity-60 pointer-events-none">{r.name}</text>
                  </g>
                )
              })}

              {placedItems.map(item => {
                const isSel = item.id === selectedItemId
                return (
                  <g key={item.id} className="cursor-move" onMouseDown={(e) => handleItemDragStart(item.id, e)} onTouchStart={(e) => handleItemDragStart(item.id, e)}>
                    <rect x={item.x * scale} y={item.y * scale} width={item.w * scale} height={item.l * scale} fill={item.color} fillOpacity={isSel ? "0.7" : "0.4"} stroke={item.color} strokeWidth={isSel ? 3 : 1.5} rx="2" />
                    <text x={(item.x + 0.05) * scale} y={(item.y + item.l / 2) * scale + 4} fill="white" className="text-[8px] font-bold pointer-events-none select-none">{item.label}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          
          /* 🌲 SCENARIO RENDER 3D RE-PROPORCIONADO CON CORRECTOR DE ALTURAS FIJAS */
          <div className="absolute inset-0 w-full h-full block touch-none">
            <Canvas camera={{ position: [cabinWidth / 2, cabinWidth * 1.3, cabinLength * 1.7], fov: 42 }} shadows style={{ position: 'absolute' }}>
              <Sky sunPosition={[140, 45, 50]} inclination={0.6} azimuth={0.25} />
              <ambientLight intensity={0.9} />
              <directionalLight position={[35, 60, 35]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]} />
              
              {/* Grilla / Suelo Verde Exacto en Y = 0 */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[220, 220]} />
                <meshStandardMaterial color="#1b4311" roughness={0.95} />
              </mesh>

              <group position={[0, 0, 0]}>
                {/* 🪵 PILOTES DE APOYO ELEVADOS REALES (Apoyan en Y=0 y suben hasta hPilotes) */}
                {baseType === 'Pilotes' && (
                  <group>
                    {[0.1, cabinWidth / 2, cabinWidth - 0.1].map(x =>
                      [0.1, cabinLength / 2, cabinLength - 0.1].map((z, idx) => (
                        <mesh key={`p-casa-${x}-${z}-${idx}`} position={[x, hPilotes / 2, z]} castShadow>
                          <cylinderGeometry args={[0.11, 0.13, hPilotes]} />
                          <meshStandardMaterial color="#2d1606" roughness={0.8} />
                        </mesh>
                      ))
                    )}
                  </group>
                )}

                {/* PLATEA DE FUNDACIÓN */}
                {baseType === 'PlateaHormigon' && (
                  <mesh position={[cabinWidth / 2, 0.10, cabinLength / 2]} receiveShadow>
                    <boxGeometry args={[cabinWidth, 0.20, cabinLength]} />
                    <meshStandardMaterial color="#4b5563" roughness={0.6} />
                  </mesh>
                )}

                {/* 🚶 DECK / CAMINADOR EXTERIOR TOTALMENTE ALINEADO */}
                {hasWalkway && (
                  <group>
                    {/* Estructura de suelo exterior */}
                    <mesh position={[cabinWidth / 2, floorY - (floorThickness / 2), cabinLength / 2]} receiveShadow>
                      <boxGeometry args={[extW, floorThickness, extL]} />
                      <meshStandardMaterial color="#3b2314" roughness={0.9} />
                    </mesh>

                    {/* Pilotes del Deck Perimetral */}
                    {baseType === 'Pilotes' && (
                      <group>
                        {[-walkwayWidth + 0.15, cabinWidth + walkwayWidth - 0.15].map(x =>
                          [-walkwayWidth + 0.15, cabinLength + walkwayWidth - 0.15].map((z, idx) => (
                            <mesh key={`p-walkway-${x}-${z}-${idx}`} position={[x, hPilotes / 2, z]} castShadow>
                              <cylinderGeometry args={[0.08, 0.09, hPilotes]} />
                              <meshStandardMaterial color="#1f1107" roughness={0.8} />
                            </mesh>
                          ))
                        )}
                      </group>
                    )}

                    {/* 🚧 CERQUITA DE MADERA (BARANDA) FLOTANTE SOBRE EL DECK */}
                    <group position={[cabinWidth / 2, floorY, cabinLength / 2]}>
                      <mesh position={[0, hBaranda - 0.02, -extL / 2]}><boxGeometry args={[extW, 0.04, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, hBaranda - 0.02, extL / 2]}><boxGeometry args={[extW, 0.04, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[-extW / 2, hBaranda - 0.02, 0]}><boxGeometry args={[0.04, 0.04, extL]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[extW / 2, hBaranda - 0.02, 0]}><boxGeometry args={[0.04, 0.04, extL]} /><meshStandardMaterial color="#2d1606" /></mesh>

                      {/* Postes verticales de la cerquita apoyados en el deck */}
                      {[-extW / 2, -cabinWidth / 2, 0, cabinWidth / 2, extW / 2].map((x, i) => (
                        <group key={`poste-v-${i}`}>
                          <mesh position={[x, hBaranda / 2, -extL / 2]}><cylinderGeometry args={[0.025, 0.025, hBaranda]} /><meshStandardMaterial color="#2d1606" /></mesh>
                          <mesh position={[x, hBaranda / 2, extL / 2]}><cylinderGeometry args={[0.025, 0.025, hBaranda]} /><meshStandardMaterial color="#2d1606" /></mesh>
                        </group>
                      ))}
                    </group>
                  </group>
                )}

                {/* SUELO INTERIOR ELEVADO Y EN APARICIÓN PERFECTA */}
                <mesh position={[cabinWidth / 2, floorY - 0.005, cabinLength / 2]}>
                  <boxGeometry args={[cabinWidth - 0.02, 0.01, cabinLength - 0.02]} />
                  <meshStandardMaterial color="#78350f" roughness={0.65} />
                </mesh>

                {/* MUROS DE ALTURA COMPLETA (Posición Y corregida al baricentro real) */}
                <group position={[0, floorY, 0]}>
                  {rooms.map(r => {
                    const rw = r.max.x - r.min.x
                    const rl = r.max.y - r.min.y
                    return (
                      <group key={`walls-3d-${r.id}`}>
                        <mesh position={[r.min.x + rw / 2, hMuros / 2, r.min.y]} castShadow><boxGeometry args={[rw, hMuros, 0.12]} /><meshStandardMaterial color={woodColor} /></mesh>
                        <mesh position={[r.min.x + rw / 2, hMuros / 2, r.max.y]} castShadow><boxGeometry args={[rw, hMuros, 0.12]} /><meshStandardMaterial color={woodColor} /></mesh>
                        <mesh position={[r.min.x, hMuros / 2, r.min.y + rl / 2]} castShadow><boxGeometry args={[0.12, hMuros, rl]} /><meshStandardMaterial color={woodColor} /></mesh>
                        <mesh position={[r.max.x, hMuros / 2, r.min.y + rl / 2]} castShadow><boxGeometry args={[0.12, hMuros, rl]} /><meshStandardMaterial color={woodColor} /></mesh>
                      </group>
                    )
                  })}
                </group>

                {/* 🛋️ OBJETOS Y MOBILIARIO TOTALMENTE EN RANGO SOBRE EL PISO */}
                <group position={[0, floorY, 0]}>
                  {placedItems.map(item => {
                    const isAbertura = item.type === 'puerta' || item.type === 'ventana'
                    const height = isAbertura ? 2.10 : 0.45
                    const yPos = isAbertura ? height / 2 + 0.10 : height / 2 // Elevar un toque aberturas
                    const zPos = item.y + item.l / 2
                    return (
                      <mesh key={`3d-item-${item.id}`} position={[item.x + item.w / 2, yPos, zPos]} castShadow>
                        <boxGeometry args={[item.w, height, item.l]} />
                        <meshStandardMaterial color={item.color} roughness={0.5} />
                      </mesh>
                    )
                  })}
                </group>

                {/* 🏠 TECHO MASTER TOTALMENTE ELEVADO (Por encima del dintel de los muros) */}
                <group position={[cabinWidth / 2, floorY + hMuros, cabinLength / 2]}>
                  <mesh position={[-cabinWidth / 4, 0.45, 0]} rotation={[0, 0, 0.28]} castShadow>
                    <boxGeometry args={[cabinWidth / 1.85, 0.05, cabinLength + 0.4]} />
                    <meshStandardMaterial color={roofColor} roughness={0.5} />
                  </mesh>
                  <mesh position={[cabinWidth / 4, 0.45, 0]} rotation={[0, 0, -0.28]} castShadow>
                    <boxGeometry args={[cabinWidth / 1.85, 0.05, cabinLength + 0.4]} />
                    <meshStandardMaterial color={roofColor} roughness={0.5} />
                  </mesh>
                </group>

                {/* ☔ ALEROS BIOCLIMÁTICOS INDEPENDIENTES ELEVADOS */}
                <group position={[cabinWidth / 2, floorY + hMuros + 0.20, cabinLength / 2]}>
                  {eaves.n && (
                    <mesh position={[0, 0.12, -cabinLength / 2 - 0.4]} rotation={[0.15, 0, 0]} castShadow>
                      <boxGeometry args={[cabinWidth + 0.6, 0.03, 1.0]} />
                      <meshStandardMaterial color={roofColor} />
                    </mesh>
                  )}
                  {eaves.s && (
                    <mesh position={[0, 0.12, cabinLength / 2 + 0.4]} rotation={[-0.15, 0, 0]} castShadow>
                      <boxGeometry args={[cabinWidth + 0.6, 0.03, 1.0]} />
                      <meshStandardMaterial color={roofColor} />
                    </mesh>
                  )}
                  {eaves.e && (
                    <mesh position={[cabinWidth / 2 + 0.4, 0.12, 0]} rotation={[0, 0, -0.15]} castShadow>
                      <boxGeometry args={[1.0, 0.03, cabinLength + 0.6]} />
                      <meshStandardMaterial color={roofColor} />
                    </mesh>
                  )}
                  {eaves.o && (
                    <mesh position={[-cabinWidth / 2 - 0.4, 0.12, 0]} rotation={[0, 0, 0.15]} castShadow>
                      <boxGeometry args={[1.0, 0.03, cabinLength + 0.6]} />
                      <meshStandardMaterial color={roofColor} />
                    </mesh>
                  )}
                </group>

              </group>

              <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.02} makeDefault />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  )
}
