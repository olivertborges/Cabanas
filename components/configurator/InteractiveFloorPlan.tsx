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
  // Definimos el bloque por su esquina superior izquierda (min) y esquina inferior derecha (max)
  min: Point2D
  max: Point2D
  color2D: string
}

export default function InteractiveFloorPlan({ options }: { options?: any }) {

  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  
  // 🚪 BLOQUES DE AMBIENTES INICIALES (Configurables y Estirables)
  const [rooms, setRooms] = useState<RoomBlock[]>([
    { id: 'r1', name: 'Living Comedor', type: 'Living', min: { x: 2, y: 2 }, max: { x: 5, y: 5 }, color2D: '#fef08a' },
    { id: 'r2', name: 'Cocina Gourmet', type: 'Cocina', min: { x: 5, y: 2 }, max: { x: 7, y: 5 }, color2D: '#fed7aa' },
    { id: 'r3', name: 'Dormitorio Principal', type: 'Dormitorio', min: { x: 2, y: 5 }, max: { x: 5, y: 8 }, color2D: '#bfdbfe' },
    { id: 'r4', name: 'Baño Completo', type: 'Baño', min: { x: 5, y: 5 }, max: { x: 7, y: 8 }, color2D: '#fbcfe8' },
  ])

  // --- ESTADOS DE SELECCIÓN Y ARRASTRE CAD ---
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>('r1')
  // draggingNode nos dice qué esquina de qué ambiente estamos arrastrando
  const [draggingNode, setDraggingNode] = useState<{ roomId: string; handle: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' } | null>(null)

  // --- OPCIONES DE CONFIGURACIÓN DE OBRA Y CLIENTE ---
  const [baseType, setBaseType] = useState<'Pilotes' | 'PlateaHormigon'>('Pilotes')
  const [floorFinish, setFloorFinish] = useState<'Madera' | 'Ceramica'>('Madera')
  const [roofColor, setRoofColor] = useState<string>('#334155')
  
  // 🎨 NUEVO: Color de pintura/barniz para las tablas de madera exteriores
  const [woodColor, setWoodColor] = useState<string>('#b45309') // Por defecto Marrón Madera / Barniz
  
  const [eaves, setEaves] = useState({ n: true, s: true, e: false, o: false })
  const [hasWalkway, setHasWalkway] = useState<boolean>(true)
  const [showRoof3D, setShowRoof3D] = useState<boolean>(true)

  // Inputs para editar medidas exactas del cuarto seleccionado
  const [inputWidth, setInputWidth] = useState<string>('3.0')
  const [inputLength, setInputLength] = useState<string>('3.0')

  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 45 // Píxeles por metro en la grilla CAD

  // --- 🎯 AMBIENTE ACTIVO ---
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

  // --- 🖱️ MOTOR DRAG & DROP PARA MODIFICAR CUADROS DESDE SUS ESQUINAS ---
  const getSvgCoordinates = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    const rawX = (e.clientX - rect.left) / scale
    const rawY = (e.clientY - rect.top) / scale
    return { x: Math.round(rawX * 10) / 10, y: Math.round(rawY * 10) / 10 }
  }

  const handleNodeMouseDown = (roomId: string, handle: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRoomId(roomId)
    setDraggingNode({ roomId, handle })
  }

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!draggingNode) return
    const { x, y } = getSvgCoordinates(e)

    setRooms(prev => prev.map(r => {
      if (r.id !== draggingNode.roomId) return r
      
      let newMin = { ...r.min }
      let newMax = { ...r.max }

      // Modificar coordenadas basándose en qué esquina se está arrastrando
      if (draggingNode.handle === 'topLeft') { newMin.x = Math.min(x, r.max.x - 0.5); newMin.y = Math.min(y, r.max.y - 0.5) }
      if (draggingNode.handle === 'topRight') { newMax.x = Math.max(x, r.min.x + 0.5); newMin.y = Math.min(y, r.max.y - 0.5) }
      if (draggingNode.handle === 'bottomLeft') { newMin.x = Math.min(x, r.max.x - 0.5); newMax.y = Math.max(y, r.min.y + 0.5) }
      if (draggingNode.handle === 'bottomRight') { newMax.x = Math.max(x, r.min.x + 0.5); newMax.y = Math.max(y, r.min.y + 0.5) }

      return { ...r, min: newMin, max: newMax }
    }))
  }

  const handleSvgMouseUp = () => setDraggingNode(null)

  // --- ✏️ EDICIÓN MANUAL POR NUMEROS (INPUTS) ---
  const applyManualDimensions = () => {
    const w = parseFloat(inputWidth)
    const l = parseFloat(inputLength)
    if (!w || !l || w <= 0.2 || l <= 0.2 || !selectedRoom) return

    setRooms(prev => prev.map(r => r.id === selectedRoomId ? {
      ...r,
      max: { x: Math.round((r.min.x + w) * 10) / 10, y: Math.round((r.min.y + l) * 10) / 10 }
    } : r))
  }

  // --- 📐 ENVOLVENTE PERIMETRAL DE TODA LA CASA ---
  const cabinBounds = useMemo(() => {
    if (rooms.length === 0) return { minX: 0, maxX: 4, minY: 0, maxY: 4, cx: 2, cy: 2, w: 4, l: 4 }
    const allX = rooms.flatMap(r => [r.min.x, r.max.x])
    const allY = rooms.flatMap(r => [r.min.y, r.max.y])
    const minX = Math.min(...allX), maxX = Math.max(...allX)
    const minY = Math.min(...allY), maxY = Math.max(...allY)
    return { minX, maxX, minY, maxY, cx: minX + (maxX - minX) / 2, cy: minY + (maxY - minY) / 2, w: Math.max(maxX - minX, 1), l: Math.max(maxY - minY, 1) }
  }, [rooms])

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 bg-slate-900 text-white rounded-3xl shadow-2xl select-none">
      
      {/* 🛠️ PANEL DE CONFIGURACIÓN TÉCNICA */}
      <div className="w-full xl:w-96 flex flex-col gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shrink-0 overflow-y-auto max-h-[720px]">
        <div>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            Diseñador de Bloques Modulares
          </span>
          <h2 className="text-lg font-black tracking-tight mt-1">Configurador de Ambientes</h2>
          <p className="text-[11px] text-slate-400 mt-1">Seleccioná un ambiente y arrastrá sus esquinas para cambiar el tamaño y diagramar la casa.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
            📐 Modificar Cuadros 2D
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            🪵 Render Vivo 3D
          </button>
        </div>

        <hr className="border-slate-800" />

        {/* 🎨 COLOR DE LA CABAÑA (TABLAS DE MADERA) */}
        <div className="space-y-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
          <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">🎨 Color de Pintura / Cabaña:</label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Madera Natural', hex: '#b45309' },
              { name: 'Blanco Nórdico', hex: '#f8fafc' },
              { name: 'Gris Campo', hex: '#4b5563' },
              { name: 'Verde Forestal', hex: '#14532d' },
              { name: 'Madera Oscura', hex: '#451a03' }
            ].map(colorObj => (
              <button 
                key={colorObj.hex}
                onClick={() => setWoodColor(colorObj.hex)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold transition ${woodColor === colorObj.hex ? 'border-white bg-slate-800' : 'border-slate-700 bg-slate-950 text-slate-400'}`}
              >
                <span className="w-3 h-3 rounded-full block border border-white/20" style={{ backgroundColor: colorObj.hex }} />
                {colorObj.name}
              </button>
            ))}
          </div>
        </div>

        {/* CIMENTACIÓN Y ACABADOS */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5">
          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">🏗️ Cimentación y Suelos:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Base Estructural:</label>
              <select value={baseType} onChange={(e) => setBaseType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded text-xs font-bold text-white outline-none">
                <option value="Pilotes">🪵 Pilotes de Madera</option>
                <option value="PlateaHormigon">🧱 Platea de Hormigón</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Piso de Ambientes:</label>
              <select value={floorFinish} onChange={(e) => setFloorFinish(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded text-xs font-bold text-white outline-none">
                <option value="Madera">🪵 Tabla Cepillada</option>
                <option value="Ceramica">🧱 Cerámica Elegida</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Color de la Chapa del Techo:</label>
            <div className="flex gap-2">
              {['#334155', '#991b1b', '#14532d', '#1e3a8a'].map(c => (
                <button key={c} onClick={() => setRoofColor(c)} className={`w-6 h-6 rounded-full border-2 ${roofColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* ALEROS Y CAMINADORES PERIMETRALES */}
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">☔ Aleros y Galerías:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.n} onChange={(e) => setEaves({...eaves, n: e.target.checked})} /> Alero Norte</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.s} onChange={(e) => setEaves({...eaves, s: e.target.checked})} /> Alero Sur</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.e} onChange={(e) => setEaves({...eaves, e: e.target.checked})} /> Alero Este</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.o} onChange={(e) => setEaves({...eaves, o: e.target.checked})} /> Alero Oeste</label>
          </div>
          <label className="flex items-center gap-2 text-xs pt-2 border-t border-slate-800 mt-2 text-amber-400 font-bold">
            <input type="checkbox" checked={hasWalkway} onChange={(e) => setHasWalkway(e.target.checked)} />
            🚶‍♂️ Deck de Galería + Cerca / Baranda
          </label>
        </div>

        {activeTab === '3d' && (
          <button onClick={() => setShowRoof3D(!showRoof3D)} className={`w-full py-2 rounded-xl text-xs font-bold border transition ${showRoof3D ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-amber-600 border-amber-500 text-white'}`}>
            {showRoof3D ? '🏠 Quitar Techo (Ver Ambientes por Dentro)' : '🏠 Poner Techo'}
          </button>
        )}

        {/* MODIFICADOR EXACTO DE TAMAÑO EN METROS */}
        {selectedRoom && (
          <div className="p-3 bg-slate-900 rounded-xl border-2 border-emerald-500/30 space-y-2.5">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">✏️ Ajustar Medidas de {selectedRoom.name}:</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Ancho (m):</label>
                <input type="number" step="0.1" value={inputWidth} onChange={(e) => setInputWidth(e.target.value)} onBlur={applyManualDimensions} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs font-mono font-bold outline-none text-white" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Largo (m):</label>
                <input type="number" step="0.1" value={inputLength} onChange={(e) => setInputLength(e.target.value)} onBlur={applyManualDimensions} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs font-mono font-bold outline-none text-white" />
              </div>
            </div>
            <button 
              onClick={() => setRooms(prev => prev.map(r => r.id === selectedRoomId ? { ...r, type: r.type === 'Living' ? 'Dormitorio' : 'Living' } : r))}
              className="w-full bg-slate-950 text-[10px] py-1 rounded text-slate-400 border border-slate-800"
            >
              Cambiar Destino de Ambiente
            </button>
          </div>
        )}
      </div>

      {/* 🖥️ ÁREA DE DISEÑO / RENDER */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[560px]">
        {activeTab === '2d' ? (
          <div className="w-full h-full flex justify-center items-center bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:25px_25px] p-4">
            <svg 
              ref={svgRef} width="100%" height="520" 
              onMouseMove={handleSvgMouseMove}
              onMouseUp={handleSvgMouseUp}
              onMouseLeave={handleSvgMouseUp}
              className="bg-slate-900 rounded-xl border border-slate-800 overflow-visible max-w-2xl shadow-2xl"
            >
              {/* Contorno proyectado de la galería exterior */}
              {hasWalkway && (
                <rect x={(cabinBounds.minX - 1.2) * scale} y={(cabinBounds.minY - 1.2) * scale} width={(cabinBounds.w + 2.4) * scale} height={(cabinBounds.l + 2.4) * scale} fill="none" stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 4" />
              )}

              {/* RENDERIZADO 2D DE LOS AMBIENTES COMO CUADROS */}
              {rooms.map(r => {
                const isSel = r.id === selectedRoomId
                const w = (r.max.x - r.min.x) * scale
                const h = (r.max.y - r.min.y) * scale

                return (
                  <g key={r.id} onClick={() => setSelectedRoomId(r.id)}>
                    {/* Caja de habitación rellena */}
                    <rect 
                      x={r.min.x * scale} y={r.min.y * scale} width={w} height={h} 
                      fill={r.color2D} fillOpacity="0.15" stroke={isSel ? '#10b981' : '#475569'} 
                      strokeWidth={isSel ? 3 : 2} className="cursor-pointer transition-all"
                    />
                    
                    {/* Texto identificador con metros cuadrados */}
                    <text x={(r.min.x + 0.2) * scale} y={(r.min.y + 0.5) * scale} fill="white" className="text-[11px] font-black tracking-wide bg-slate-950">
                      {r.name}
                    </text>
                    <text x={(r.min.x + 0.2) * scale} y={(r.min.y + 0.9) * scale} fill="#94a3b8" className="text-[10px] font-mono">
                      {((r.max.x - r.min.x) * (r.max.y - r.min.y)).toFixed(1)} m²
                    </text>

                    {/* MANIJAS/NODOS EN LAS ESQUINAS PARA REDIMENSIONAR LIBREMENTE */}
                    {isSel && (
                      <>
                        <circle cx={r.min.x * scale} cy={r.min.y * scale} r="6" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nwse-resize" onMouseDown={(e) => handleNodeMouseDown(r.id, 'topLeft', e)} />
                        <circle cx={r.max.x * scale} cy={r.min.y * scale} r="6" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nesw-resize" onMouseDown={(e) => handleNodeMouseDown(r.id, 'topRight', e)} />
                        <circle cx={r.min.x * scale} cy={r.max.y * scale} r="6" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nesw-resize" onMouseDown={(e) => handleNodeMouseDown(r.id, 'bottomLeft', e)} />
                        <circle cx={r.max.x * scale} cy={r.max.y * scale} r="6" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-nwse-resize" onMouseDown={(e) => handleNodeMouseDown(r.id, 'bottomRight', e)} />
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          
          /* ☀️ ENGINE RENDERIZADOR 3D INTEGRADO CON COLORES SELECCIONABLES */
          <div className="w-full h-[560px] relative">
            <Canvas camera={{ position: [cabinBounds.cx, 6, cabinBounds.cy + 7], fov: 40 }} shadows>
              <color attach="background" args={['#0f172a']} />
              <Sky sunPosition={[100, 45, 100]} />
              <ambientLight intensity={showRoof3D ? 0.6 : 1.3} />
              <directionalLight position={[25, 45, 20]} intensity={1.5} castShadow />
              
              <Center>
                {/* BASES */}
                {baseType === 'PlateaHormigon' ? (
                  <mesh position={[cabinBounds.cx, 0.1, cabinBounds.cy]} receiveShadow>
                    <boxGeometry args={[cabinBounds.w + 0.1, 0.2, cabinBounds.l + 0.1]} />
                    <meshStandardMaterial color="#57534e" roughness={0.8} />
                  </mesh>
                ) : (
                  <group position={[0, -0.2, 0]}>
                    <mesh position={[cabinBounds.minX, 0.3, cabinBounds.minY]}><cylinderGeometry args={[0.14, 0.14, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[cabinBounds.maxX, 0.3, cabinBounds.minY]}><cylinderGeometry args={[0.14, 0.14, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[cabinBounds.minX, 0.3, cabinBounds.maxY]}><cylinderGeometry args={[0.14, 0.14, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[cabinBounds.maxX, 0.3, cabinBounds.maxY]}><cylinderGeometry args={[0.14, 0.14, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                  </group>
                )}

                {/* GALERÍA PERIMETRAL EXTERIOR + BARANDA CERQUITA */}
                {hasWalkway && (
                  <group>
                    <mesh position={[cabinBounds.cx, 0.04, cabinBounds.cy]} receiveShadow>
                      <boxGeometry args={[cabinBounds.w + 1.8, 0.04, cabinBounds.l + 1.8]} />
                      <meshStandardMaterial color="#451a03" roughness={0.9} />
                    </mesh>

                    {/* Cerquita Protectora perimetral */}
                    <group position={[cabinBounds.cx, 0.45, cabinBounds.cy]}>
                      <mesh position={[0, 0, -cabinBounds.l / 2 - 0.8]}><boxGeometry args={[cabinBounds.w + 1.8, 0.05, 0.05]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, -0.2, -cabinBounds.l / 2 - 0.8]}><boxGeometry args={[cabinBounds.w + 1.8, 0.05, 0.05]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, 0, cabinBounds.l / 2 + 0.8]}><boxGeometry args={[cabinBounds.w + 1.8, 0.05, 0.05]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[0, -0.2, cabinBounds.l / 2 + 0.8]}><boxGeometry args={[cabinBounds.w + 1.8, 0.05, 0.05]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[cabinBounds.w / 2 + 0.8, 0, 0]}><boxGeometry args={[0.05, 0.05, cabinBounds.l + 1.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[cabinBounds.w / 2 + 0.8, -0.2, 0]}><boxGeometry args={[0.05, 0.05, cabinBounds.l + 1.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[-cabinBounds.w / 2 - 0.8, 0, 0]}><boxGeometry args={[0.05, 0.05, cabinBounds.l + 1.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      <mesh position={[-cabinBounds.w / 2 - 0.8, -0.2, 0]}><boxGeometry args={[0.05, 0.05, cabinBounds.l + 1.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                      {/* Postes de barandilla */}
                      {[-cabinBounds.w/2 - 0.8, cabinBounds.w/2 + 0.8].map((px, i) => 
                        [-cabinBounds.l/2 - 0.8, cabinBounds.l/2 + 0.8].map((pz, j) => (
                          <mesh key={`post3d-${i}-${j}`} position={[px, -0.2, pz]}><cylinderGeometry args={[0.04, 0.04, 0.5]} /><meshStandardMaterial color="#1c0d02" /></mesh>
                        ))
                      )}
                    </group>
                  </group>
                )}

                {/* REVESTIMIENTO PISO INTERIOR */}
                <mesh position={[cabinBounds.cx, 0.22, cabinBounds.cy]}>
                  <boxGeometry args={[cabinBounds.w - 0.04, 0.02, cabinBounds.l - 0.04]} />
                  <meshStandardMaterial color={floorFinish === 'Madera' ? '#854d0e' : '#cbd5e1'} roughness={floorFinish === 'Madera' ? 0.6 : 0.2} />
                </mesh>

                {/* MUROS EXTRUIDOS AUTOMÁTICAMENTE SEGÚN LOS BLOQUES */}
                {rooms.map(r => {
                  const rw = r.max.x - r.min.x
                  const rl = r.max.y - r.min.y
                  const cx = r.min.x + rw / 2
                  const cz = r.min.y + rl / 2

                  return (
                    <group key={`3d-room-${r.id}`}>
                      {/* Muro Norte del ambiente */}
                      <mesh position={[cx, 1.5, r.min.y]} castShadow>
                        <boxGeometry args={[rw, 2.6, 0.15]} />
                        <meshStandardMaterial color={woodColor} roughness={0.7} />
                      </mesh>
                      {/* Muro Sur del ambiente */}
                      <mesh position={[cx, 1.5, r.max.y]} castShadow>
                        <boxGeometry args={[rw, 2.6, 0.15]} />
                        <meshStandardMaterial color={woodColor} roughness={0.7} />
                      </mesh>
                      {/* Muro Oeste del ambiente */}
                      <mesh position={[r.min.x, 1.5, cz]} castShadow>
                        <boxGeometry args={[0.15, 2.6, rl]} />
                        <meshStandardMaterial color={woodColor} roughness={0.7} />
                      </mesh>
                      {/* Muro Este del ambiente */}
                      <mesh position={[r.max.x, 1.5, cz]} castShadow>
                        <boxGeometry args={[0.15, 2.6, rl]} />
                        <meshStandardMaterial color={woodColor} roughness={0.7} />
                      </mesh>
                    </group>
                  )
                })}

                {/* TECHO INDUSTRIAL DOS AGUAS CON COLORES DE CHAPA */}
                {showRoof3D && rooms.length > 0 && (
                  <group position={[cabinBounds.cx, 3.0, cabinBounds.cy]}>
                    <mesh position={[-cabinBounds.w / 4, cabinBounds.w * 0.08, 0]} rotation={[0, 0, 0.22]} castShadow>
                      <boxGeometry args={[cabinBounds.w / 1.6 + (eaves.o ? 0.8 : 0), 0.06, cabinBounds.l + (eaves.n ? 0.6 : 0) + (eaves.s ? 0.6 : 0)]} />
                      <meshStandardMaterial color={roofColor} metalness={0.5} roughness={0.4} />
                    </mesh>
                    <mesh position={[cabinBounds.w / 4, cabinBounds.w * 0.08, 0]} rotation={[0, 0, -0.22]} castShadow>
                      <boxGeometry args={[cabinBounds.w / 1.6 + (eaves.e ? 0.8 : 0), 0.06, cabinBounds.l + (eaves.n ? 0.6 : 0) + (eaves.s ? 0.6 : 0)]} />
                      <meshStandardMaterial color={roofColor} metalness={0.5} roughness={0.4} />
                    </mesh>
                  </group>
                )}
              </Center>

              <Grid position={[0, -0.01, 0]} args={[40, 40]} cellColor="#334155" sectionColor="#475569" fadeDistance={25} />
              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  )
}
