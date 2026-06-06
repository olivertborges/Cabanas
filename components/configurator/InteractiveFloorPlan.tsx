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
  
  // 📏 MEDIDAS MASTER DE LA CABAÑA (Definen el terreno total editable)
  const [cabinWidth, setCabinWidth] = useState<number>(8.0)
  const [cabinLength, setCabinLength] = useState<number>(7.0)

  // 🚪 BLOQUES DE AMBIENTES (Se adaptan inicialmente al tamaño de la cabaña)
  const [rooms, setRooms] = useState<RoomBlock[]>([])

  // Al cambiar las medidas de la cabaña, los ambientes se distribuyen proporcionalmente
  useEffect(() => {
    const w = cabinWidth
    const l = cabinLength
    
    // Distribución inteligente en base a los metros totales dados por el usuario
    setRooms([
      { id: 'r1', name: 'Living Comedor', type: 'Living', min: { x: 0, y: 0 }, max: { x: w * 0.6, y: l * 0.5 }, color2D: '#fef08a' },
      { id: 'r2', name: 'Cocina Gourmet', type: 'Cocina', min: { x: w * 0.6, y: 0 }, max: { x: w, y: l * 0.5 }, color2D: '#fed7aa' },
      { id: 'r3', name: 'Dormitorio Principal', type: 'Dormitorio', min: { x: 0, y: l * 0.5 }, max: { x: w * 0.6, y: l }, color2D: '#bfdbfe' },
      { id: 'r4', name: 'Baño Completo', type: 'Baño', min: { x: w * 0.6, y: l * 0.5 }, max: { x: w, y: l }, color2D: '#fbcfe8' },
    ])
  }, [cabinWidth, cabinLength])

  // --- ESTADOS DE SELECCIÓN Y ARRASTRE CAD ---
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>('r1')
  const [draggingNode, setDraggingNode] = useState<{ roomId: string; handle: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' } | null>(null)

  // --- OPCIONES DE CONFIGURACIÓN DE OBRA ---
  const [baseType, setBaseType] = useState<'Pilotes' | 'PlateaHormigon'>('Pilotes')
  const [floorFinish, setFloorFinish] = useState<'Madera' | 'Ceramica'>('Madera')
  const [roofColor, setRoofColor] = useState<string>('#334155')
  const [woodColor, setWoodColor] = useState<string>('#b45309')
  const [eaves, setEaves] = useState({ n: true, s: true, e: false, o: false })
  const [hasWalkway, setHasWalkway] = useState<boolean>(true)
  const [showRoof3D, setShowRoof3D] = useState<boolean>(true)

  // Inputs para la pieza seleccionada
  const [inputWidth, setInputWidth] = useState<string>('3.0')
  const [inputLength, setInputLength] = useState<string>('3.0')

  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 40 

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

  // --- 📐 ENVOLVENTE DEL LIENZO SVG (Mantiene un margen limpio alrededor) ---
  const viewBounds = useMemo(() => {
    const margin = 1.5
    return {
      minX: -margin,
      minY: -margin,
      w: cabinWidth + (margin * 2),
      l: cabinLength + (margin * 2)
    }
  }, [cabinWidth, cabinLength])

  // --- 🖱️ MOTOR DE ARRASTRE CAD COORDENADAS ---
  const getCoordinatesFromEvent = (e: any) => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const svgX = ((clientX - rect.left) / rect.width) * (viewBounds.w * scale) + (viewBounds.minX * scale)
    const svgY = ((clientY - rect.top) / rect.height) * (viewBounds.l * scale) + (viewBounds.minY * scale)
    
    // Forzar límites para que no se salgan de las medidas de la cabaña
    let x = Math.round((svgX / scale) * 10) / 10
    let y = Math.round((svgY / scale) * 10) / 10
    
    x = Math.max(0, Math.min(cabinWidth, x))
    y = Math.max(0, Math.min(cabinLength, y))

    return { x, y }
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

      if (draggingNode.handle === 'topLeft') { newMin.x = Math.min(x, r.max.x - 0.4); newMin.y = Math.min(y, r.max.y - 0.4) }
      if (draggingNode.handle === 'topRight') { newMax.x = Math.max(x, r.min.x + 0.4); newMin.y = Math.min(y, r.max.y - 0.4) }
      if (draggingNode.handle === 'bottomLeft') { newMin.x = Math.min(x, r.max.x - 0.4); newMax.y = Math.max(y, r.min.y + 0.4) }
      if (draggingNode.handle === 'bottomRight') { newMax.x = Math.max(x, r.min.x + 0.4); newMax.y = Math.max(y, r.min.y + 0.4) }

      return { ...r, min: newMin, max: newMax }
    }))
  }

  const handleGlobalEnd = () => setDraggingNode(null)

  const applyManualDimensions = () => {
    const w = parseFloat(inputWidth)
    const l = parseFloat(inputLength)
    if (!w || !l || w <= 0.2 || l <= 0.2 || !selectedRoom) return

    setRooms(prev => prev.map(r => {
      if (r.id !== selectedRoomId) return r
      const targetMaxX = Math.min(cabinWidth, Math.round((r.min.x + w) * 10) / 10)
      const targetMaxY = Math.min(cabinLength, Math.round((r.min.y + l) * 10) / 10)
      return { ...r, max: { x: targetMaxX, y: targetMaxY } }
    }))
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 p-2 sm:p-4 bg-slate-900 text-white rounded-2xl sm:rounded-3xl shadow-2xl select-none w-full max-w-7xl mx-auto overflow-hidden">
      
      {/* 🛠️ PANEL DE CONTROL */}
      <div className="w-full xl:w-96 flex flex-col gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 shrink-0 max-h-[420px] xl:max-h-[680px] overflow-y-auto">
        <div>
          <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            Medidas e Infraestructura
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight mt-1">Dimensiones de Cabaña</h2>
        </div>

        {/* 📐 SECCIÓN MASTER: ASIGNACIÓN DE MEDIDAS TOTALES */}
        <div className="bg-slate-900 p-3 rounded-xl border-2 border-blue-500/30 space-y-2">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">📐 Tamaño Total del Perímetro (m):</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Ancho Cabaña:</label>
              <input 
                type="number" min="4" max="20" step="0.5"
                value={cabinWidth} 
                onChange={(e) => setCabinWidth(parseFloat(e.target.value) || 4)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-center font-mono font-bold text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Largo Cabaña:</label>
              <input 
                type="number" min="4" max="20" step="0.5"
                value={cabinLength} 
                onChange={(e) => setCabinLength(parseFloat(e.target.value) || 4)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-center font-mono font-bold text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-1.5 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
            📐 Plano 2D Medidas
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-1.5 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            🪵 Render sobre Suelo
          </button>
        </div>

        {/* 🎨 COLOR DE REVESTIMIENTO */}
        <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
          <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">🎨 Revestimiento Exterior:</label>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {[
              { name: 'Madera Barniz', hex: '#b45309' },
              { name: 'Blanco Nórdico', hex: '#f8fafc' },
              { name: 'Gris Campo', hex: '#4b5563' },
              { name: 'Verde Forestal', hex: '#14532d' }
            ].map(c => (
              <button key={c.hex} onClick={() => setWoodColor(c.hex)} className={`flex items-center gap-1.5 p-1.5 rounded border transition ${woodColor === c.hex ? 'border-white bg-slate-800 font-bold' : 'border-slate-700 bg-slate-950 text-slate-400'}`}>
                <span className="w-2.5 h-2.5 rounded-full block border" style={{ backgroundColor: c.hex }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* CIMENTACIÓN */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Estructura Base:</label>
              <select value={baseType} onChange={(e) => setBaseType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1 rounded text-xs text-white">
                <option value="Pilotes">🪵 Pilotes Altos</option>
                <option value="PlateaHormigon">🧱 Platea Plana</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Tipo Piso:</label>
              <select value={floorFinish} onChange={(e) => setFloorFinish(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1 rounded text-xs text-white">
                <option value="Madera">🪵 Tabla Pulida</option>
                <option value="Ceramica">🧱 Cerámica</option>
              </select>
            </div>
          </div>
        </div>

        {/* ALEROS */}
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">☔ Aleros de Techo:</p>
          <div className="grid grid-cols-4 gap-1 text-[11px] text-center">
            <label className="block p-1 bg-slate-950 rounded border border-slate-800"><input type="checkbox" checked={eaves.n} onChange={(e) => setEaves({...eaves, n: e.target.checked})} /><br/>N</label>
            <label className="block p-1 bg-slate-950 rounded border border-slate-800"><input type="checkbox" checked={eaves.s} onChange={(e) => setEaves({...eaves, s: e.target.checked})} /><br/>S</label>
            <label className="block p-1 bg-slate-950 rounded border border-slate-800"><input type="checkbox" checked={eaves.e} onChange={(e) => setEaves({...eaves, e: e.target.checked})} /><br/>E</label>
            <label className="block p-1 bg-slate-950 rounded border border-slate-800"><input type="checkbox" checked={eaves.o} onChange={(e) => setEaves({...eaves, o: e.target.checked})} /><br/>O</label>
          </div>
          <label className="flex items-center gap-1.5 text-[11px] pt-2 border-t border-slate-800 mt-2 text-amber-400 font-medium">
            <input type="checkbox" checked={hasWalkway} onChange={(e) => setHasWalkway(e.target.checked)} />
             Galería Deck + Barandilla Externa
          </label>
        </div>

        {/* AJUSTES FINOS DEL CUARTO SELECCIONADO */}
        {selectedRoom && (
          <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 space-y-1.5">
            <p className="text-[10px] font-bold text-emerald-400 uppercase">Ajuste de {selectedRoom.name}:</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" step="0.1" value={inputWidth} onChange={(e) => setInputWidth(e.target.value)} onBlur={applyManualDimensions} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-white" />
              <input type="number" step="0.1" value={inputLength} onChange={(e) => setInputLength(e.target.value)} onBlur={applyManualDimensions} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-white" />
            </div>
          </div>
        )}
      </div>

      {/* 🖥️ CANVAS DE DIBUJO Y RENDER (RESPONSIVO Y CENTRADO) */}
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative min-h-[360px] sm:min-h-[520px] w-full flex justify-center items-center">
        {activeTab === '2d' ? (
          <div className="w-full h-full flex justify-center items-center bg-[radial-gradient(#334155_1.1px,transparent_1.1px)] [background-size:20px_20px] p-2 sm:p-4">
            <svg 
              ref={svgRef}
              viewBox={`${viewBounds.minX * scale} ${viewBounds.minY * scale} ${viewBounds.w * scale} ${viewBounds.l * scale}`}
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleGlobalMove}
              onMouseUp={handleGlobalEnd}
              onMouseLeave={handleGlobalEnd}
              onTouchMove={handleGlobalMove}
              onTouchEnd={handleGlobalEnd}
              className="w-full h-full max-h-[480px] bg-slate-900 rounded-xl border border-slate-800 shadow-xl touch-none"
            >
              {/* 🏠 RECUADRO LÍMITE DEL TERRENO/CABAÑA CONFIGURADO */}
              <rect 
                x={0} y={0} width={cabinWidth * scale} height={cabinLength * scale} 
                fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4"
              />
              <text x={0} y={-8} fill="#38bdf8" className="text-[10px] font-bold uppercase tracking-wider">
                Límite Cabaña ({cabinWidth}m x {cabinLength}m)
              </text>

              {/* Deck perimetral proyectado exterior */}
              {hasWalkway && (
                <rect 
                  x={-1.0 * scale} y={-1.0 * scale} 
                  width={(cabinWidth + 2.0) * scale} height={(cabinLength + 2.0) * scale} 
                  fill="none" stroke="#b45309" strokeWidth="1.2" strokeDasharray="3 3" 
                />
              )}

              {/* Render dinámico de las subdivisiones */}
              {rooms.map(r => {
                const isSel = r.id === selectedRoomId
                const rw = (r.max.x - r.min.x) * scale
                const rh = (r.max.y - r.min.y) * scale

                return (
                  <g key={r.id} onClick={() => setSelectedRoomId(r.id)} className="cursor-pointer">
                    <rect 
                      x={r.min.x * scale} y={r.min.y * scale} width={rw} height={rh} 
                      fill={r.color2D} fillOpacity="0.16" stroke={isSel ? '#10b981' : '#475569'} 
                      strokeWidth={isSel ? 3 : 1.5} className="transition-all"
                    />
                    <text x={(r.min.x + 0.15) * scale} y={(r.min.y + 0.45) * scale} fill="white" className="text-[10px] font-black pointer-events-none">
                      {r.name}
                    </text>
                    <text x={(r.min.x + 0.15) * scale} y={(r.min.y + 0.85) * scale} fill="#94a3b8" className="text-[9px] font-mono pointer-events-none">
                      {((r.max.x - r.min.x) * (r.max.y - r.min.y)).toFixed(1)}m²
                    </text>

                    {/* Controles elásticos para redimensionar */}
                    {isSel && (
                      <>
                        <circle cx={r.min.x * scale} cy={r.min.y * scale} r="8" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nwse-resize" onMouseDown={(e) => handleNodeStart(r.id, 'topLeft', e)} onTouchStart={(e) => handleNodeStart(r.id, 'topLeft', e)} />
                        <circle cx={r.max.x * scale} cy={r.min.y * scale} r="8" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nesw-resize" onMouseDown={(e) => handleNodeStart(r.id, 'topRight', e)} onTouchStart={(e) => handleNodeStart(r.id, 'topRight', e)} />
                        <circle cx={r.min.x * scale} cy={r.max.y * scale} r="8" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nesw-resize" onMouseDown={(e) => handleNodeStart(r.id, 'bottomLeft', e)} onTouchStart={(e) => handleNodeStart(r.id, 'bottomLeft', e)} />
                        <circle cx={r.max.x * scale} cy={r.max.y * scale} r="8" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nwse-resize" onMouseDown={(e) => handleNodeStart(r.id, 'bottomRight', e)} onTouchStart={(e) => handleNodeStart(r.id, 'bottomRight', e)} />
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          
          /* 🪵 ENGINE RENDER 3D PERFECTAMENTE ALINEADO SOBRE LA GRILLA (NIVEL 0) */
          <div className="w-full h-full min-h-[360px] sm:min-h-[500px] relative">
            <Canvas camera={{ position: [cabinWidth / 2, cabinWidth * 0.9, cabinLength * 1.6], fov: 40 }} shadows>
              <color attach="background" args={['#0f172a']} />
              <Sky sunPosition={[120, 50, 100]} />
              <ambientLight intensity={showRoof3D ? 0.7 : 1.3} />
              <directionalLight position={[30, 50, 25]} intensity={1.4} castShadow />
              
              <Center>
                {/* 🧱 CIMENTACIÓN CORREGIDA: Apoya exactamente SOBRE la grilla (Y >= 0) */}
                {baseType === 'PlateaHormigon' ? (
                  <mesh position={[cabinWidth / 2, 0.1, cabinLength / 2]} receiveShadow>
                    <boxGeometry args={[cabinWidth, 0.2, cabinLength]} />
                    <meshStandardMaterial color="#57534e" roughness={0.8} />
                  </mesh>
                ) : (
                  // Pilotes altos: El poste va de Y=0 a Y=0.5, dejando la base levantada sobre el suelo
                  <group>
                    <mesh position={[0.2, 0.25, 0.2]}><cylinderGeometry args={[0.12, 0.12, 0.5]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[cabinWidth - 0.2, 0.25, 0.2]}><cylinderGeometry args={[0.12, 0.12, 0.5]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[0.2, 0.25, cabinLength - 0.2]}><cylinderGeometry args={[0.12, 0.12, 0.5]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[cabinWidth - 0.2, 0.25, cabinLength - 0.2]}><cylinderGeometry args={[0.12, 0.12, 0.5]} /><meshStandardMaterial color="#2d1606" /></mesh>
                  </group>
                )}

                {/* GALERÍA DECK EXTERIOR (Elevada según el tipo de base) */}
                {hasWalkway && (
                  <group position={[0, baseType === 'Pilotes' ? 0.5 : 0.2, 0]}>
                    <mesh position={[cabinWidth / 2, 0.02, cabinLength / 2]} receiveShadow>
                      <boxGeometry args={[cabinWidth + 1.6, 0.04, cabinLength + 1.6]} />
                      <meshStandardMaterial color="#451a03" roughness={0.9} />
                    </mesh>
                    {/* Barandilla perimetral */}
                    <group position={[cabinWidth / 2, 0.4, cabinLength / 2]}>
                      <mesh position={[0, 0, -(cabinLength + 1.6) / 2]}><boxGeometry args={[cabinWidth + 1.6, 0.04, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, -0.2, -(cabinLength + 1.6) / 2]}><boxGeometry args={[cabinWidth + 1.6, 0.04, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, 0, (cabinLength + 1.6) / 2]}><boxGeometry args={[cabinWidth + 1.6, 0.04, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, -0.2, (cabinLength + 1.6) / 2]}><boxGeometry args={[cabinWidth + 1.6, 0.04, 0.04]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    </group>
                  </group>
                )}

                {/* ACABADO DE PISO INTERIOR (Alineado arriba de la cimentación) */}
                <mesh position={[cabinWidth / 2, baseType === 'Pilotes' ? 0.52 : 0.22, cabinLength / 2]}>
                  <boxGeometry args={[cabinWidth - 0.05, 0.02, cabinLength - 0.05]} />
                  <meshStandardMaterial color={floorFinish === 'Madera' ? '#854d0e' : '#cbd5e1'} roughness={floorFinish === 'Madera' ? 0.6 : 0.2} />
                </mesh>

                {/* 🧱 MUROS EXTRUIDOS (Ubicados perfectamente sobre el piso elevado) */}
                <group position={[0, baseType === 'Pilotes' ? 0.52 : 0.22, 0]}>
                  {rooms.map(r => {
                    const rw = r.max.x - r.min.x
                    const rl = r.max.y - r.min.y
                    const cx = r.min.x + rw / 2
                    const cz = r.min.y + rl / 2

                    return (
                      <group key={`3d-wall-group-${r.id}`}>
                        <mesh position={[cx, 1.3, r.min.y]} castShadow><boxGeometry args={[rw, 2.6, 0.12]} /><meshStandardMaterial color={woodColor} roughness={0.7} /></mesh>
                        <mesh position={[cx, 1.3, r.max.y]} castShadow><boxGeometry args={[rw, 2.6, 0.12]} /><meshStandardMaterial color={woodColor} roughness={0.7} /></mesh>
                        <mesh position={[r.min.x, 1.3, cz]} castShadow><boxGeometry args={[0.12, 2.6, rl]} /><meshStandardMaterial color={woodColor} roughness={0.7} /></mesh>
                        <mesh position={[r.max.x, 1.3, cz]} castShadow><boxGeometry args={[0.12, 2.6, rl]} /><meshStandardMaterial color={woodColor} roughness={0.7} /></mesh>
                      </group>
                    )
                  })}
                </group>

                {/* TECHO INDUSTRIAL DOS AGUAS (Ajustado a la nueva altura) */}
                {showRoof3D && (
                  <group position={[cabinWidth / 2, (baseType === 'Pilotes' ? 0.52 : 0.22) + 2.6, cabinLength / 2]}>
                    <mesh position={[-cabinWidth / 4, cabinWidth * 0.08, 0]} rotation={[0, 0, 0.22]} castShadow>
                      <boxGeometry args={[cabinWidth / 1.6 + (eaves.o ? 0.6 : 0), 0.05, cabinLength + (eaves.n ? 0.5 : 0) + (eaves.s ? 0.5 : 0)]} />
                      <meshStandardMaterial color={roofColor} roughness={0.4} />
                    </mesh>
                    <mesh position={[cabinWidth / 4, cabinWidth * 0.08, 0]} rotation={[0, 0, -0.22]} castShadow>
                      <boxGeometry args={[cabinWidth / 1.6 + (eaves.e ? 0.6 : 0), 0.05, cabinLength + (eaves.n ? 0.5 : 0) + (eaves.s ? 0.5 : 0)]} />
                      <meshStandardMaterial color={roofColor} roughness={0.4} />
                    </mesh>
                  </group>
                )}
              </Center>

              {/* Suelo base de grilla limpia */}
              <Grid position={[0, 0, 0]} args={[40, 40]} cellColor="#334155" sectionColor="#475569" fadeDistance={25} />
              <OrbitControls enableDamping maxPolarAngle={Math.PI / 2.05} />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  )
}
