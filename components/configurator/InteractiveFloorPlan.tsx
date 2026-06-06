'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Sky, Center } from '@react-three/drei'
import * as THREE from 'three'

// --- 📐 INTERFACES TÉCNICAS DE AMBIENTES ---
interface Point2D { x: number; y: number }

interface RoomBlock {
  id: string
  name: string
  type: 'Living' | 'Cocina' | 'Dormitorio' | 'Baño'
  min: Point2D
  max: Point2D
  color2D: string
}

export default function InteractiveFloorPlan({ options }: { options?: any }) {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  
  // 🚪 BLOQUES DE AMBIENTES INICIALES (Editables y Estirables)
  const [rooms, setRooms] = useState<RoomBlock[]>([
    { id: 'r1', name: 'Living Comedor', type: 'Living', min: { x: 2, y: 2 }, max: { x: 5, y: 5 }, color2D: '#fef08a' },
    { id: 'r2', name: 'Cocina Gourmet', type: 'Cocina', min: { x: 5, y: 2 }, max: { x: 7, y: 5 }, color2D: '#fed7aa' },
    { id: 'r3', name: 'Dormitorio Principal', type: 'Dormitorio', min: { x: 2, y: 5 }, max: { x: 5, y: 8 }, color2D: '#bfdbfe' },
    { id: 'r4', name: 'Baño Completo', type: 'Baño', min: { x: 5, y: 5 }, max: { x: 7, y: 8 }, color2D: '#fbcfe8' },
  ])

  // --- ESTADOS DE SELECCIÓN Y ARRASTRE CAD ---
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>('r1')
  const [draggingNode, setDraggingNode] = useState<{ roomId: string; handle: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' } | null>(null)

  // --- OPCIONES DE CONFIGURACIÓN DE OBRA Y CLIENTE ---
  const [baseType, setBaseType] = useState<'Pilotes' | 'PlateaHormigon'>('Pilotes')
  const [floorFinish, setFloorFinish] = useState<'Madera' | 'Ceramica'>('Madera')
  const [roofColor, setRoofColor] = useState<string>('#334155')
  const [woodColor, setWoodColor] = useState<string>('#b45309') // Barniz/Madera por defecto
  const [eaves, setEaves] = useState({ n: true, s: true, e: false, o: false })
  const [hasWalkway, setHasWalkway] = useState<boolean>(true)
  const [showRoof3D, setShowRoof3D] = useState<boolean>(true)

  // Inputs controlados para las dimensiones
  const [inputWidth, setInputWidth] = useState<string>('3.0')
  const [inputLength, setInputLength] = useState<string>('3.0')

  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 45 // Factor de multiplicación para el espacio interno del SVG

  const selectedRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId) || null
  }, [rooms, selectedRoomId])

  useEffect(() => {
    if (selectedRoom) {
      const w = selectedRoom.max.x - selectedRoom.min.x
      const l = selectedRoom.max.y - selectedRoom.min.y
      setInputWidth(w.toFixed(1))
      setInputLength(l.toFixed(1))
    }
  }, [selectedRoomId, selectedRoom])

  // --- 📐 ENVOLVENTE PERIMETRAL DINÁMICA (Para auto-centrado en pantallas chicas) ---
  const cabinBounds = useMemo(() => {
    if (rooms.length === 0) return { minX: 0, maxX: 9, minY: 0, maxY: 9, cx: 4.5, cy: 4.5, w: 9, l: 9 }
    const allX = rooms.flatMap(r => [r.min.x, r.max.x])
    const allY = rooms.flatMap(r => [r.min.y, r.max.y])
    const minX = Math.max(0, Math.min(...allX) - 2)
    const maxX = Math.max(9, Math.max(...allX) + 2)
    const minY = Math.max(0, Math.min(...allY) - 2)
    const maxY = Math.max(9, Math.max(...allY) + 2)
    return {
      minX, maxX, minY, maxY,
      cx: minX + (maxX - minX) / 2,
      cy: minY + (maxY - minY) / 2,
      w: maxX - minX,
      l: maxY - minY
    }
  }, [rooms])

  // --- 🖱️ MOTOR ULTRA-RESPONSIVO DE ARRASTRE (Soporta Mouse y Touch de celular) ---
  const getCoordinatesFromEvent = (e: any) => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    
    // Detectar si es evento Touch (Celular) o Mouse (PC)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    // Convertir píxeles relativos al ViewBox real del SVG
    const svgX = ((clientX - rect.left) / rect.width) * (cabinBounds.w * scale) + (cabinBounds.minX * scale)
    const svgY = ((clientY - rect.top) / rect.height) * (cabinBounds.l * scale) + (cabinBounds.minY * scale)
    
    return {
      x: Math.round((svgX / scale) * 10) / 10,
      y: Math.round((svgY / scale) * 10) / 10
    }
  }

  const handleNodeStart = (roomId: string, handle: any, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setSelectedRoomId(roomId)
    setDraggingNode({ roomId, handle })
  }

  const handleGlobalMove = (e: any) => {
    if (!draggingNode) return
    const coords = getCoordinatesFromEvent(e)
    if (!coords) return
    const { x, y } = coords

    setRooms(prev => prev.map(r => {
      if (r.id !== draggingNode.roomId) return r
      let newMin = { ...r.min }
      let newMax = { ...r.max }

      if (draggingNode.handle === 'topLeft') { newMin.x = Math.min(x, r.max.x - 0.5); newMin.y = Math.min(y, r.max.y - 0.5) }
      if (draggingNode.handle === 'topRight') { newMax.x = Math.max(x, r.min.x + 0.5); newMin.y = Math.min(y, r.max.y - 0.5) }
      if (draggingNode.handle === 'bottomLeft') { newMin.x = Math.min(x, r.max.x - 0.5); newMax.y = Math.max(y, r.min.y + 0.5) }
      if (draggingNode.handle === 'bottomRight') { newMax.x = Math.max(x, r.min.x + 0.5); newMax.y = Math.max(y, r.min.y + 0.5) }

      return { ...r, min: newMin, max: newMax }
    }))
  }

  const handleGlobalEnd = () => setDraggingNode(null)

  const applyManualDimensions = () => {
    const w = parseFloat(inputWidth)
    const l = parseFloat(inputLength)
    if (!w || !l || w <= 0.2 || l <= 0.2 || !selectedRoom) return

    setRooms(prev => prev.map(r => r.id === selectedRoomId ? {
      ...r,
      max: { x: Math.round((r.min.x + w) * 10) / 10, y: Math.round((r.min.y + l) * 10) / 10 }
    } : r))
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 p-2 sm:p-4 bg-slate-900 text-white rounded-2xl sm:rounded-3xl shadow-2xl select-none w-full max-w-7xl mx-auto overflow-hidden">
      
      {/* 🛠️ PANEL lateral / superior: Responsivo */}
      <div className="w-full xl:w-96 flex flex-col gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 shrink-0 max-h-[400px] xl:max-h-[680px] overflow-y-auto">
        <div>
          <span className="text-[9px] sm:text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            Diseñador Técnico Responsivo
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight mt-1">Configurador Móvil</h2>
        </div>

        {/* Pestañas táctiles cómodas */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
            📐 Plano Móvil 2D
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            🪵 Vista 3D Real
          </button>
        </div>

        {/* 🎨 SELECTOR DE COLOR COMPACTO */}
        <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
          <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">🎨 Pintura de Madera:</label>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {[
              { name: 'Natural', hex: '#b45309' },
              { name: 'Blanco', hex: '#f8fafc' },
              { name: 'Gris', hex: '#4b5563' },
              { name: 'Forestal', hex: '#14532d' }
            ].map(c => (
              <button key={c.hex} onClick={() => setWoodColor(c.hex)} className={`flex items-center gap-1.5 p-1.5 rounded border transition ${woodColor === c.hex ? 'border-white bg-slate-800 font-bold' : 'border-slate-700 bg-slate-950 text-slate-400'}`}>
                <span className="w-2.5 h-2.5 rounded-full block border" style={{ backgroundColor: c.hex }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* CIMENTACIÓN Y ACABADOS */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Base:</label>
              <select value={baseType} onChange={(e) => setBaseType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded text-xs text-white outline-none">
                <option value="Pilotes">🪵 Pilotes</option>
                <option value="PlateaHormigon">🧱 Platea</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Piso:</label>
              <select value={floorFinish} onChange={(e) => setFloorFinish(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded text-xs text-white outline-none">
                <option value="Madera">🪵 Madera</option>
                <option value="Ceramica">🧱 Cerámica</option>
              </select>
            </div>
          </div>
        </div>

        {/* ALEROS */}
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">☔ Aleros de Chapa:</p>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={eaves.n} onChange={(e) => setEaves({...eaves, n: e.target.checked})} /> N</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={eaves.s} onChange={(e) => setEaves({...eaves, s: e.target.checked})} /> S</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={eaves.e} onChange={(e) => setEaves({...eaves, e: e.target.checked})} /> E</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={eaves.o} onChange={(e) => setEaves({...eaves, o: e.target.checked})} /> O</label>
          </div>
          <label className="flex items-center gap-1.5 text-[11px] pt-1.5 border-t border-slate-800 mt-1 text-amber-400">
            <input type="checkbox" checked={hasWalkway} onChange={(e) => setHasWalkway(e.target.checked)} />
            🚶‍♂️ Caminador + Cerquita
          </label>
        </div>

        {activeTab === '3d' && (
          <button onClick={() => setShowRoof3D(!showRoof3D)} className="w-full py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold">
            {showRoof3D ? '🏠 Quitar Techo' : '🏠 Colocar Techo'}
          </button>
        )}

        {/* MEDIDAS EXACTAS NUMÉRICAS */}
        {selectedRoom && (
          <div className="p-3 bg-slate-900 rounded-xl border-2 border-emerald-500/30 space-y-2">
            <p className="text-[10px] font-bold text-emerald-400 uppercase">{selectedRoom.name}:</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" step="0.1" value={inputWidth} onChange={(e) => setInputWidth(e.target.value)} onBlur={applyManualDimensions} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-white" />
              <input type="number" step="0.1" value={inputLength} onChange={(e) => setInputLength(e.target.value)} onBlur={applyManualDimensions} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-white" />
            </div>
          </div>
        )}
      </div>

      {/* 🖥️ LIENZO DE DISEÑO INTEGRADO Y CENTRADO AUTOMÁTICO */}
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative min-h-[340px] sm:min-h-[500px] w-full flex justify-center items-center">
        {activeTab === '2d' ? (
          <div className="w-full h-full flex justify-center items-center bg-[radial-gradient(#334155_1.1px,transparent_1.1px)] [background-size:20px_20px] p-2 sm:p-4">
            <svg 
              ref={svgRef}
              viewBox={`${cabinBounds.minX * scale} ${cabinBounds.minY * scale} ${cabinBounds.w * scale} ${cabinBounds.l * scale}`}
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleGlobalMove}
              onMouseUp={handleGlobalEnd}
              onMouseLeave={handleGlobalEnd}
              onTouchMove={handleGlobalMove}
              onTouchEnd={handleGlobalEnd}
              className="w-full h-full max-h-[460px] bg-slate-900 rounded-xl border border-slate-800 shadow-xl touch-none"
            >
              {/* Caminador externo perimetral */}
              {hasWalkway && (
                <rect 
                  x={(cabinBounds.minX + 0.8) * scale} y={(cabinBounds.minY + 0.8) * scale} 
                  width={(cabinBounds.w - 1.6) * scale} height={(cabinBounds.l - 1.6) * scale} 
                  fill="none" stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 4" 
                />
              )}

              {/* Dibujo responsivo de ambientes */}
              {rooms.map(r => {
                const isSel = r.id === selectedRoomId
                const rw = (r.max.x - r.min.x) * scale
                const rh = (r.max.y - r.min.y) * scale

                return (
                  <g key={r.id} onClick={() => setSelectedRoomId(r.id)} className="cursor-pointer">
                    <rect 
                      x={r.min.x * scale} y={r.min.y * scale} width={rw} height={rh} 
                      fill={r.color2D} fillOpacity="0.18" stroke={isSel ? '#10b981' : '#475569'} 
                      strokeWidth={isSel ? 3 : 1.5} className="transition-all"
                    />
                    <text x={(r.min.x + 0.15) * scale} y={(r.min.y + 0.5) * scale} fill="white" className="text-[10px] font-black pointer-events-none">
                      {r.name}
                    </text>
                    <text x={(r.min.x + 0.15) * scale} y={(r.min.y + 0.9) * scale} fill="#94a3b8" className="text-[9px] font-mono pointer-events-none">
                      {((r.max.x - r.min.x) * (r.max.y - r.min.y)).toFixed(1)}m²
                    </text>

                    {/* 🟢 NUEVOS MANILLARDS TÁCTILES MEJORADOS (Captura inmediata de gestos) */}
                    {isSel && (
                      <>
                        <circle cx={r.min.x * scale} cy={r.min.y * scale} r="9" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nwse-resize" onMouseDown={(e) => handleNodeStart(r.id, 'topLeft', e)} onTouchStart={(e) => handleNodeStart(r.id, 'topLeft', e)} />
                        <circle cx={r.max.x * scale} cy={r.min.y * scale} r="9" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nesw-resize" onMouseDown={(e) => handleNodeStart(r.id, 'topRight', e)} onTouchStart={(e) => handleNodeStart(r.id, 'topRight', e)} />
                        <circle cx={r.min.x * scale} cy={r.max.y * scale} r="9" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nesw-resize" onMouseDown={(e) => handleNodeStart(r.id, 'bottomLeft', e)} onTouchStart={(e) => handleNodeStart(r.id, 'bottomLeft', e)} />
                        <circle cx={r.max.x * scale} cy={r.max.y * scale} r="9" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nwse-resize" onMouseDown={(e) => handleNodeStart(r.id, 'bottomRight', e)} onTouchStart={(e) => handleNodeStart(r.id, 'bottomRight', e)} />
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          /* ☀️ ENGINE RENDER 3D RESPONSIVO */
          <div className="w-full h-full min-h-[340px] sm:min-h-[500px] relative">
            <Canvas camera={{ position: [4.5, 6, 11], fov: 42 }} shadows>
              <color attach="background" args={['#0f172a']} />
              <Sky sunPosition={[100, 45, 100]} />
              <ambientLight intensity={showRoof3D ? 0.65 : 1.3} />
              <directionalLight position={[25, 45, 20]} intensity={1.5} castShadow />
              
              <Center>
                {/* Platea o Pilotes */}
                {baseType === 'PlateaHormigon' ? (
                  <mesh position={[4.5, 0.1, 5]} receiveShadow>
                    <boxGeometry args={[7.5, 0.2, 7.5]} />
                    <meshStandardMaterial color="#57534e" roughness={0.8} />
                  </mesh>
                ) : (
                  <group position={[0, -0.2, 0]}>
                    <mesh position={[2, 0.3, 2]}><cylinderGeometry args={[0.12, 0.12, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[7, 0.3, 2]}><cylinderGeometry args={[0.12, 0.12, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[2, 0.3, 8]}><cylinderGeometry args={[0.12, 0.12, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[7, 0.3, 8]}><cylinderGeometry args={[0.12, 0.12, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                  </group>
                )}

                {/* Deck Exterior + Cerca */}
                {hasWalkway && (
                  <group>
                    <mesh position={[4.5, 0.04, 5]} receiveShadow>
                      <boxGeometry args={[8.5, 0.04, 8.5]} />
                      <meshStandardMaterial color="#451a03" roughness={0.9} />
                    </mesh>
                    {/* Cerca de Madera */}
                    <group position={[4.5, 0.45, 5]}>
                      <mesh position={[0, 0, -4.25]}><boxGeometry args={[8.5, 0.04, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, -0.2, -4.25]}><boxGeometry args={[8.5, 0.04, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, 0, 4.25]}><boxGeometry args={[8.5, 0.04, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, -0.2, 4.25]}><boxGeometry args={[8.5, 0.04, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    </group>
                  </group>
                )}

                {/* Acabado Piso */}
                <mesh position={[4.5, 0.22, 5]}>
                  <boxGeometry args={[7.3, 0.02, 7.3]} />
                  <meshStandardMaterial color={floorFinish === 'Madera' ? '#854d0e' : '#cbd5e1'} roughness={floorFinish === 'Madera' ? 0.6 : 0.2} />
                </mesh>

                {/* Ambientes Extruidos */}
                {rooms.map(r => {
                  const rw = r.max.x - r.min.x
                  const rl = r.max.y - r.min.y
                  const cx = r.min.x + rw / 2
                  const cz = r.min.y + rl / 2

                  return (
                    <group key={`3d-r-${r.id}`}>
                      <mesh position={[cx, 1.5, r.min.y]} castShadow><boxGeometry args={[rw, 2.6, 0.12]} /><meshStandardMaterial color={woodColor} roughness={0.7} /></mesh>
                      <mesh position={[cx, 1.5, r.max.y]} castShadow><boxGeometry args={[rw, 2.6, 0.12]} /><meshStandardMaterial color={woodColor} roughness={0.7} /></mesh>
                      <mesh position={[r.min.x, 1.5, cz]} castShadow><boxGeometry args={[0.12, 2.6, rl]} /><meshStandardMaterial color={woodColor} roughness={0.7} /></mesh>
                      <mesh position={[r.max.x, 1.5, cz]} castShadow><boxGeometry args={[0.12, 2.6, rl]} /><meshStandardMaterial color={woodColor} roughness={0.7} /></mesh>
                    </group>
                  )
                })}

                {/* Techo */}
                {showRoof3D && (
                  <group position={[4.5, 3.1, 5]}>
                    <mesh position={[-2, 0.3, 0]} rotation={[0, 0, 0.22]} castShadow><boxGeometry args={[4.5, 0.05, 8.5]} /><meshStandardMaterial color={roofColor} /></mesh>
                    <mesh position={[2, 0.3, 0]} rotation={[0, 0, -0.22]} castShadow><boxGeometry args={[4.5, 0.05, 8.5]} /><meshStandardMaterial color={roofColor} /></mesh>
                  </group>
                )}
              </Center>

              <Grid position={[0, -0.01, 0]} args={[30, 30]} cellColor="#334155" sectionColor="#475569" fadeDistance={20} />
              <OrbitControls enableDamping maxPolarAngle={Math.PI / 2.1} />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  )
}
