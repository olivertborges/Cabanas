'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Center } from '@react-three/drei'
import * as THREE from 'three'

// --- 📐 INTERFACES ---
interface Point2D { x: number; y: number }

interface RoomBlock {
  id: string
  name: string
  type: 'Living' | 'Cocina' | 'Dormitorio' | 'Baño'
  min: Point2D
  max: Point2D
  color2D: string
}

export default function InteractiveFloorPlan() {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  
  // 📏 MEDIDAS MASTER DE LA CABAÑA BASE
  const [cabinWidth, setCabinWidth] = useState<number>(8.0)
  const [cabinLength, setCabinLength] = useState<number>(7.0)

  // 🚶 CONFIGURACIÓN DEL CAMINADOR (DECK)
  const [walkwayWidth, setWalkwayWidth] = useState<number>(1.2) // Medida ajustable del caminador

  // 🚪 BLOQUES DE AMBIENTES
  const [rooms, setRooms] = useState<RoomBlock[]>([])

  useEffect(() => {
    const w = cabinWidth
    const l = cabinLength
    setRooms([
      { id: 'r1', name: 'Living Comedor', type: 'Living', min: { x: 0, y: 0 }, max: { x: w * 0.6, y: l * 0.5 }, color2D: '#fef08a' },
      { id: 'r2', name: 'Cocina Gourmet', type: 'Cocina', min: { x: w * 0.6, y: 0 }, max: { x: w, y: l * 0.5 }, color2D: '#fed7aa' },
      { id: 'r3', name: 'Dormitorio Principal', type: 'Dormitorio', min: { x: 0, y: l * 0.5 }, max: { x: w * 0.6, y: l }, color2D: '#bfdbfe' },
      { id: 'r4', name: 'Baño Completo', type: 'Baño', min: { x: w * 0.6, y: l * 0.5 }, max: { x: w, y: l }, color2D: '#fbcfe8' },
    ])
  }, [cabinWidth, cabinLength])

  // --- ESTADOS DE INTERACCIÓN (ARRASTRE Y CAMBIO DE TAMAÑO) ---
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>('r1')
  const [interactionMode, setInteractionMode] = useState<{
    type: 'resize' | 'move'
    roomId: string
    handle?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
    startOffset?: { x: number; y: number }
  } | null>(null)

  // --- OPCIONES BIOCLIMÁTICAS ---
  const [baseType, setBaseType] = useState<'Pilotes' | 'PlateaHormigon'>('Pilotes')
  const [floorFinish, setFloorFinish] = useState<'Madera' | 'Ceramica'>('Madera')
  const [roofColor, setRoofColor] = useState<string>('#334155')
  const [woodColor, setWoodColor] = useState<string>('#b45309')
  const [eaves, setEaves] = useState({ n: true, s: false, e: true, o: false }) // Aleros independientes
  const [hasWalkway, setHasWalkway] = useState<boolean>(true)
  const [showRoof3D, setShowRoof3D] = useState<boolean>(true)

  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 40 

  const viewBounds = useMemo(() => {
    const margin = 2.5
    return { minX: -margin, minY: -margin, w: cabinWidth + (margin * 2), l: cabinLength + (margin * 2) }
  }, [cabinWidth, cabinLength])

  // --- TRAZADOR DE COORDENADAS (MOUSE / TOUCH) ---
  const getCoordinatesFromEvent = (e: any) => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const svgX = ((clientX - rect.left) / rect.width) * (viewBounds.w * scale) + (viewBounds.minX * scale)
    const svgY = ((clientY - rect.top) / rect.height) * (viewBounds.l * scale) + (viewBounds.minY * scale)
    const x = Math.round((svgX / scale) * 10) / 10
    const y = Math.round((svgY / scale) * 10) / 10
    return { x, y }
  }

  // Iniciar cambio de tamaño (Esquinas)
  const handleResizeStart = (roomId: string, handle: any, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setSelectedRoomId(roomId)
    setInteractionMode({ type: 'resize', roomId, handle })
  }

  // Iniciar movimiento completo (Centro del bloque)
  const handleMoveStart = (roomId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setSelectedRoomId(roomId)
    const coords = getCoordinatesFromEvent(e)
    const room = rooms.find(r => r.id === roomId)
    if (!coords || !room) return

    // Guardamos la distancia entre el mouse y la esquina superior izquierda del cuarto
    setInteractionMode({
      type: 'move',
      roomId,
      startOffset: { x: coords.x - room.min.x, y: coords.y - room.min.y }
    })
  }

  // Gestor de arrastre global
  const handleGlobalMove = (e: any) => {
    if (!interactionMode) return
    const coords = getCoordinatesFromEvent(e)
    if (!coords) return

    setRooms(prev => prev.map(r => {
      if (r.id !== interactionMode.roomId) return r

      if (interactionMode.type === 'resize' && interactionMode.handle) {
        let newMin = { ...r.min }, newMax = { ...r.max }
        const xClamped = Math.max(0, Math.min(cabinWidth, coords.x))
        const yClamped = Math.max(0, Math.min(cabinLength, coords.y))

        if (interactionMode.handle === 'topLeft') { newMin.x = Math.min(xClamped, r.max.x - 0.4); newMin.y = Math.min(yClamped, r.max.y - 0.4) }
        if (interactionMode.handle === 'topRight') { newMax.x = Math.max(xClamped, r.min.x + 0.4); newMin.y = Math.min(yClamped, r.max.y - 0.4) }
        if (interactionMode.handle === 'bottomLeft') { newMin.x = Math.min(xClamped, r.max.x - 0.4); newMax.y = Math.max(yClamped, r.min.y + 0.4) }
        if (interactionMode.handle === 'bottomRight') { newMax.x = Math.max(xClamped, r.min.x + 0.4); newMax.y = Math.max(yClamped, r.min.y + 0.4) }
        return { ...r, min: newMin, max: newMax }
      } 
      
      if (interactionMode.type === 'move' && interactionMode.startOffset) {
        const w = r.max.x - r.min.x
        const l = r.max.y - r.min.y
        
        // Nueva posición calculada usando el offset guardado
        let newMinX = coords.x - interactionMode.startOffset.x
        let newMinY = coords.y - interactionMode.startOffset.y
        
        // Límites para que no se salga de la cabaña máster
        newMinX = Math.max(0, Math.min(cabinWidth - w, newMinX))
        newMinY = Math.max(0, Math.min(cabinLength - l, newMinY))

        return {
          ...r,
          min: { x: newMinX, y: newMinY },
          max: { x: newMinX + w, y: newMinY + l }
        }
      }
      return r
    }))
  }

  const handleGlobalEnd = () => setInteractionMode(null)

  return (
    <div className="flex flex-col xl:flex-row gap-4 p-2 sm:p-4 bg-slate-900 text-white rounded-2xl sm:rounded-3xl shadow-2xl select-none w-full max-w-7xl mx-auto overflow-hidden">
      
      {/* 🛠️ PANEL DE CONTROL */}
      <div className="w-full xl:w-96 flex flex-col gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 shrink-0 max-h-[420px] xl:max-h-[660px] overflow-y-auto">
        <div>
          <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            Control de Obra
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight mt-1">Configuración Avanzada</h2>
        </div>

        {/* MEDIDAS MASTER CABAÑA */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">📐 Núcleo Cabaña (m):</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Ancho Base:</label>
              <input type="number" min="4" max="20" step="0.5" value={cabinWidth} onChange={(e) => setCabinWidth(parseFloat(e.target.value) || 4)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-white outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Largo Base:</label>
              <input type="number" min="4" max="20" step="0.5" value={cabinLength} onChange={(e) => setCabinLength(parseFloat(e.target.value) || 4)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center font-mono font-bold text-white outline-none" />
            </div>
          </div>
        </div>

        {/* MEDIDAS CAMINADOR (DECK) */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">🚶 Dimensión del Caminador / Deck:</p>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Ancho del pasillo (m):</label>
            <input type="number" min="0.5" max="3" step="0.1" value={walkwayWidth} onChange={(e) => setWalkwayWidth(parseFloat(e.target.value) || 0.5)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs font-mono text-amber-400 outline-none font-bold" />
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-1.5 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
            📐 Plano 2D (Mover/Editar)
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-1.5 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            Pine Render 3D 🌲
          </button>
        </div>

        {/* MATERIALES */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase block">🎨 Acabado Estructural:</label>
          <select value={woodColor} onChange={(e) => setWoodColor(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded text-xs text-white">
            <option value="#b45309">🪵 Madera Barniz Natural</option>
            <option value="#f8fafc">⚪ Madera Pintada Blanca</option>
            <option value="#4b5563">⚫ Madera Gris Carbón</option>
          </select>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Cimientos:</label>
              <select value={baseType} onChange={(e) => setBaseType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1 rounded text-xs text-white">
                <option value="Pilotes">🪵 Pilotes Altos</option>
                <option value="PlateaHormigon">🧱 Platea Plana</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Piso Casa:</label>
              <select value={floorFinish} onChange={(e) => setFloorFinish(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1 rounded text-xs text-white">
                <option value="Madera">🪵 Entablonado</option>
                <option value="Ceramica">🧱 Cerámica</option>
              </select>
            </div>
          </div>
        </div>

        {/* ALEROS INDEPENDIENTES REQUERIDOS */}
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">☔ Aleros Independientes Activos:</p>
          <div className="grid grid-cols-4 gap-1.5 text-xs text-center font-bold">
            <button onClick={() => setEaves({...eaves, n: !eaves.n})} className={`p-1 rounded border ${eaves.n ? 'bg-sky-600 text-white border-white' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>Norte</button>
            <button onClick={() => setEaves({...eaves, s: !eaves.s})} className={`p-1 rounded border ${eaves.s ? 'bg-sky-600 text-white border-white' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>Sur</button>
            <button onClick={() => setEaves({...eaves, e: !eaves.e})} className={`p-1 rounded border ${eaves.e ? 'bg-sky-600 text-white border-white' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>Este</button>
            <button onClick={() => setEaves({...eaves, o: !eaves.o})} className={`p-1 rounded border ${eaves.o ? 'bg-sky-600 text-white border-white' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>Oeste</button>
          </div>
          <div className="pt-2 border-t border-slate-800 mt-2 text-[11px]">
            <label className="flex items-center gap-2 text-emerald-400 font-bold">
              <input type="checkbox" checked={hasWalkway} onChange={(e) => setHasWalkway(e.target.checked)} /> Incluir Caminador + Cerquita
            </label>
          </div>
        </div>
      </div>

      {/* 🖥️ CANVAS DE VISUALIZACIÓN */}
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 relative min-h-[440px] sm:min-h-[600px] w-full flex justify-center items-center overflow-hidden">
        
        {activeTab === '2d' ? (
          <div className="w-full h-full flex justify-center items-center bg-[radial-gradient(#334155_1.1px,transparent_1.1px)] [background-size:20px_20px] p-4">
            <svg 
              ref={svgRef}
              viewBox={`${viewBounds.minX * scale} ${viewBounds.minY * scale} ${viewBounds.w * scale} ${viewBounds.l * scale}`}
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleGlobalMove}
              onMouseUp={handleGlobalEnd}
              onMouseLeave={handleGlobalEnd}
              onTouchMove={handleGlobalMove}
              onTouchEnd={handleGlobalEnd}
              className="w-full h-full max-h-[540px] bg-slate-900 rounded-xl border border-slate-800 shadow-xl touch-none"
            >
              {/* Línea guía del caminador si está activo */}
              {hasWalkway && (
                <rect x={-walkwayWidth * scale} y={-walkwayWidth * scale} width={(cabinWidth + walkwayWidth * 2) * scale} height={(cabinLength + walkwayWidth * 2) * scale} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
              )}

              {/* Límite estructural de la cabaña */}
              <rect x={0} y={0} width={cabinWidth * scale} height={cabinLength * scale} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              <text x={0} y={-8} fill="#38bdf8" className="text-[10px] font-black uppercase tracking-wider">Perímetro Cabaña</text>

              {rooms.map(r => {
                const isSel = r.id === selectedRoomId
                const rw = (r.max.x - r.min.x) * scale
                const rh = (r.max.y - r.min.y) * scale

                return (
                  <g key={r.id} className="cursor-move">
                    {/* El centro del rectángulo activa el movimiento completo */}
                    <rect x={r.min.x * scale} y={r.min.y * scale} width={rw} height={rh} fill={r.color2D} fillOpacity="0.2" stroke={isSel ? '#10b981' : '#64748b'} strokeWidth={isSel ? 3 : 1.5} onMouseDown={(e) => handleMoveStart(r.id, e)} onTouchStart={(e) => handleMoveStart(r.id, e)} />
                    
                    <text x={(r.min.x + 0.15) * scale} y={(r.min.y + 0.45) * scale} fill="white" className="text-[10px] font-black pointer-events-none select-none">{r.name}</text>
                    <text x={(r.min.x + 0.15) * scale} y={(r.min.y + 0.9) * scale} fill="#94a3b8" className="text-[9px] font-mono pointer-events-none select-none">{((r.max.x - r.min.x) * (r.max.y - r.min.y)).toFixed(1)}m²</text>

                    {/* Las esquinas activan el redimensionamiento */}
                    {isSel && (
                      <>
                        <circle cx={r.min.x * scale} cy={r.min.y * scale} r="7" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nwse-resize" onMouseDown={(e) => handleResizeStart(r.id, 'topLeft', e)} onTouchStart={(e) => handleResizeStart(r.id, 'topLeft', e)} />
                        <circle cx={r.max.x * scale} cy={r.min.y * scale} r="7" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nesw-resize" onMouseDown={(e) => handleResizeStart(r.id, 'topRight', e)} onTouchStart={(e) => handleResizeStart(r.id, 'topRight', e)} />
                        <circle cx={r.min.x * scale} cy={r.max.y * scale} r="7" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nesw-resize" onMouseDown={(e) => handleResizeStart(r.id, 'bottomLeft', e)} onTouchStart={(e) => handleResizeStart(r.id, 'bottomLeft', e)} />
                        <circle cx={r.max.x * scale} cy={r.max.y * scale} r="7" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nwse-resize" onMouseDown={(e) => handleResizeStart(r.id, 'bottomRight', e)} onTouchStart={(e) => handleResizeStart(r.id, 'bottomRight', e)} />
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          
          /* 🌲 SCENARIO RENDER 3D RE-INGENIERIZADO AL 100% */
          <div className="absolute inset-0 w-full h-full block touch-none">
            <Canvas 
              camera={{ position: [cabinWidth / 2, cabinWidth * 1.1, cabinLength * 1.8], fov: 42 }} 
              shadows
              style={{ width: '100%', height: '100%', position: 'absolute' }}
            >
              <Sky sunPosition={[100, 35, 70]} inclination={0.5} azimuth={0.2} />
              <ambientLight intensity={0.8} />
              <directionalLight position={[25, 45, 25]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]} />
              
              {/* Entorno Pradera */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[180, 180]} />
                <meshStandardMaterial color="#14340e" roughness={0.95} />
              </mesh>

              {/* Bosque de Fondo */}
              <group position={[cabinWidth / 2, 0, cabinLength / 2]}>
                {[...Array(30)].map((_, i) => {
                  const angle = (i / 30) * Math.PI * 2
                  const rad = 26 + Math.random() * 6
                  const th = 4.0 + Math.random() * 3.0
                  return (
                    <group key={`tree-render-${i}`} position={[Math.cos(angle) * rad, 0, Math.sin(angle) * rad]}>
                      <mesh position={[0, th * 0.15, 0]}><cylinderGeometry args={[0.12, 0.22, th * 0.3]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, th * 0.6, 0]} castShadow><coneGeometry args={[1.2, th * 0.8, 4]} /><meshStandardMaterial color="#0f4c24" roughness={0.9} /></mesh>
                    </group>
                  )
                })}
              </group>

              <Center>
                {/* 🪵 PILOTES DE LA CABAÑA BASE */}
                {baseType === 'Pilotes' && (
                  <group>
                    {[0.1, cabinWidth / 2, cabinWidth - 0.1].map(x =>
                      [0.1, cabinLength / 2, cabinLength - 0.1].map((z, idx) => (
                        <mesh key={`p-base-${x}-${z}-${idx}`} position={[x, 0.25, z]} castShadow>
                          <cylinderGeometry args={[0.12, 0.12, 0.5]} />
                          <meshStandardMaterial color="#3b2314" roughness={0.8} />
                        </mesh>
                      ))
                    )}
                  </group>
                )}

                {/* 🧱 PLATEA OPCIONAL */}
                {baseType === 'PlateaHormigon' && (
                  <mesh position={[cabinWidth / 2, 0.1, cabinLength / 2]} receiveShadow>
                    <boxGeometry args={[cabinWidth, 0.2, cabinLength]} />
                    <meshStandardMaterial color="#4b5563" roughness={0.7} />
                  </mesh>
                )/* Altura del piso terminado interior */}
                {const floorY = baseType === 'Pilotes' ? 0.5 : 0.2}

                {/* 🚶 WALKWAY / CAMINADOR CON SUS PROPIOS PILOTES INDEPENDIENTES */}
                {hasWalkway && (
                  <group>
                    {/* Plataforma de madera extendida según las dimensiones dadas */}
                    <mesh position={[cabinWidth / 2, floorY - 0.02, cabinLength / 2]} receiveShadow>
                      <boxGeometry args={[cabinWidth + walkwayWidth * 2, 0.04, cabinLength + walkwayWidth * 2]} />
                      <meshStandardMaterial color="#2d1606" roughness={0.95} />
                    </mesh>

                    {/* Pilotes del Caminador (Llegan hasta el suelo 0) */}
                    <group>
                      {/* Esquinas exteriores del deck pasante */}
                      {[-(walkwayWidth - 0.1), cabinWidth + (walkwayWidth - 0.1)].map(x =>
                        [-(walkwayWidth - 0.1), cabinLength + (walkwayWidth - 0.1)].map((z, idx) => (
                          <mesh key={`p-deck-${x}-${z}-${idx}`} position={[x, floorY / 2, z]} castShadow>
                            <cylinderGeometry args={[0.09, 0.09, floorY]} />
                            <meshStandardMaterial color="#1a0f07" roughness={0.8} />
                          </mesh>
                        ))
                      )}
                    </group>

                    {/* 🚧 CERQUITA / BARANDA DE SEGURIDAD (Postes y Pasamanos a 70cm de alto) */}
                    <group position={[cabinWidth / 2, floorY, cabinLength / 2]}>
                      {/* Ancho y Largo exterior del caminador */}
                      {(() => {
                        const extW = cabinWidth + walkwayWidth * 2
                        const extL = cabinLength + walkwayWidth * 2
                        const hBaranda = 0.70 // 70 cm de alto

                        return (
                          <group>
                            {/* Pasamanos Superior Perimetral */}
                            <mesh position={[0, hBaranda, -extL / 2]}><boxGeometry args={[extW, 0.04, 0.04]} /><meshStandardMaterial color="#3b2314" /></mesh>
                            <mesh position={[0, hBaranda, extL / 2]}><boxGeometry args={[extW, 0.04, 0.04]} /><meshStandardMaterial color="#3b2314" /></mesh>
                            <mesh position={[-extW / 2, hBaranda, 0]}><boxGeometry args={[0.04, 0.04, extL]} /><meshStandardMaterial color="#3b2314" /></mesh>
                            <mesh position={[extW / 2, hBaranda, 0]}><boxGeometry args={[0.04, 0.04, extL]} /><meshStandardMaterial color="#3b2314" /></mesh>

                            {/* Postes verticales de soporte ("Cerquita") */}
                            {[-extW / 2, 0, extW / 2].map((x, i) => (
                              <group key={`p-vert-${i}`}>
                                <mesh position={[x, hBaranda / 2, -extL / 2]}><cylinderGeometry args={[0.03, 0.03, hBaranda]} /><meshStandardMaterial color="#3b2314" /></mesh>
                                <mesh position={[x, hBaranda / 2, extL / 2]}><cylinderGeometry args={[0.03, 0.03, hBaranda]} /><meshStandardMaterial color="#3b2314" /></mesh>
                              </group>
                            ))}
                          </group>
                        )
                      })()}
                    </group>
                  </group>
                )}

                {/* PISO INTERIOR DE LA CABAÑA */}
                <mesh position={[cabinWidth / 2, floorY + 0.01, cabinLength / 2]}>
                  <boxGeometry args={[cabinWidth - 0.02, 0.02, cabinLength - 0.02]} />
                  <meshStandardMaterial color={floorFinish === 'Madera' ? '#65a30d' : '#cbd5e1'} roughness={0.6} />
                </mesh>

                {/* MUROS EXTRUIDOS */}
                <group position={[0, floorY + 0.02, 0]}>
                  {rooms.map(r => {
                    const rw = r.max.x - r.min.x
                    const rl = r.max.y - r.min.y
                    return (
                      <group key={`walls-3d-${r.id}`}>
                        <mesh position={[r.min.x + rw / 2, 1.3, r.min.y]} castShadow><boxGeometry args={[rw, 2.6, 0.12]} /><meshStandardMaterial color={woodColor} /></mesh>
                        <mesh position={[r.min.x + rw / 2, 1.3, r.max.y]} castShadow><boxGeometry args={[rw, 2.6, 0.12]} /><meshStandardMaterial color={woodColor} /></mesh>
                        <mesh position={[r.min.x, 1.3, r.min.y + rl / 2]} castShadow><boxGeometry args={[0.12, 2.6, rl]} /><meshStandardMaterial color={woodColor} /></mesh>
                        <mesh position={[r.max.x, 1.3, r.min.y + rl / 2]} castShadow><boxGeometry args={[0.12, 2.6, rl]} /><meshStandardMaterial color={woodColor} /></mesh>
                      </group>
                    )
                  })}
                </group>

                {/* TECHO MASTER PRINCIPAL */}
                {showRoof3D && (
                  <group position={[cabinWidth / 2, floorY + 2.6, cabinLength / 2]}>
                    <mesh position={[-cabinWidth / 4, 0.2, 0]} rotation={[0, 0, 0.2]} castShadow>
                      <boxGeometry args={[cabinWidth / 1.9, 0.04, cabinLength]} />
                      <meshStandardMaterial color={roofColor} />
                    </mesh>
                    <mesh position={[cabinWidth / 4, 0.2, 0]} rotation={[0, 0, -0.2]} castShadow>
                      <boxGeometry args={[cabinWidth / 1.9, 0.04, cabinLength]} />
                      <meshStandardMaterial color={roofColor} />
                    </mesh>
                  </group>
                )}

                {/* ☔ ALEROS BIOCLIMÁTICOS INDEPENDIENTES (Se proyectan fuera si están activos) */}
                <group position={[cabinWidth / 2, floorY + 2.55, cabinLength / 2]}>
                  {eaves.n && (
                    <mesh position={[0, 0.1, -cabinLength / 2 - 0.4]} rotation={[0.1, 0, 0]} castShadow>
                      <boxGeometry args={[cabinWidth, 0.03, 0.8]} />
                      <meshStandardMaterial color={roofColor} transparent opacity={0.9} />
                    </mesh>
                  )}
                  {eaves.s && (
                    <mesh position={[0, 0.1, cabinLength / 2 + 0.4]} rotation={[-0.1, 0, 0]} castShadow>
                      <boxGeometry args={[cabinWidth, 0.03, 0.8]} />
                      <meshStandardMaterial color={roofColor} transparent opacity={0.9} />
                    </mesh>
                  )}
                  {eaves.e && (
                    <mesh position={[cabinWidth / 2 + 0.4, 0.1, 0]} rotation={[0, 0, -0.1]} castShadow>
                      <boxGeometry args={[0.8, 0.03, cabinLength]} />
                      <meshStandardMaterial color={roofColor} transparent opacity={0.9} />
                    </mesh>
                  )}
                  {eaves.o && (
                    <mesh position={[-cabinWidth / 2 - 0.4, 0.1, 0]} rotation={[0, 0, 0.1]} castShadow>
                      <boxGeometry args={[0.8, 0.03, cabinLength]} />
                      <meshStandardMaterial color={roofColor} transparent opacity={0.9} />
                    </mesh>
                  )}
                </group>

              </Center>

              <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.05} makeDefault />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  )
}
