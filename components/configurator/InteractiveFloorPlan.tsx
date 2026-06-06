'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Sky, Center } from '@react-three/drei'
import * as THREE from 'three'

// --- 📐 INTERFACES TÉCNICAS ---
interface Point2D { x: number; y: number }

interface CustomWall {
  id: string
  start: Point2D
  end: Point2D
  thickness: number
  height: number
  materialType: 'TablaYeso' | 'TirantesMadera' | 'Vidrio'
}

export default function InteractiveFloorPlan({ options }: { options?: any }) {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  
  // Estructura inicial base modificable
  const [walls, setWalls] = useState<CustomWall[]>([
    { id: 'w1', start: { x: 2, y: 2 }, end: { x: 6, y: 2 }, thickness: 0.15, height: 2.6, materialType: 'TirantesMadera' },
    { id: 'w2', start: { x: 6, y: 2 }, end: { x: 6, y: 6 }, thickness: 0.15, height: 2.6, materialType: 'TirantesMadera' },
    { id: 'w3', start: { x: 6, y: 6 }, end: { x: 2, y: 6 }, thickness: 0.15, height: 2.6, materialType: 'TirantesMadera' },
    { id: 'w4', start: { x: 2, y: 6 }, end: { x: 2, y: 2 }, thickness: 0.15, height: 2.6, materialType: 'TirantesMadera' },
  ])

  // --- ESTADOS DE CONTROL Y HERRAMIENTAS ---
  const [selectedWallId, setSelectedWallId] = useState<string | null>('w1')
  const [drawingStart, setDrawingStart] = useState<Point2D | null>(null)
  
  // Estados para el arrastre y estiramiento de paredes (CAD Drag)
  const [draggingNode, setDraggingNode] = useState<{ wallId: string; target: 'start' | 'end' } | null>(null)

  // Opciones de Pincel y Materiales de Obra
  const [currentMaterial, setCurrentMaterial] = useState<'TablaYeso' | 'TirantesMadera' | 'Vidrio'>('TirantesMadera')
  const [wallThickness, setWallThickness] = useState<number>(0.15)
  const [wallHeight, setWallHeight] = useState<number>(2.6)

  // Personalización del Cliente
  const [baseType, setBaseType] = useState<'Pilotes' | 'PlateaHormigon'>('Pilotes')
  const [floorFinish, setFloorFinish] = useState<'Madera' | 'Ceramica'>('Madera')
  const [roofColor, setRoofColor] = useState<string>('#334155')
  const [eaves, setEaves] = useState({ n: true, s: true, e: false, o: false })
  const [hasWalkway, setHasWalkway] = useState<boolean>(true)
  const [showRoof3D, setShowRoof3D] = useState<boolean>(true)

  const [inputLength, setInputLength] = useState<string>('4.0')
  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 45

  // --- 🎯 DATOS DE SELECCIÓN ---
  const selectedWall = useMemo(() => {
    return walls.find(w => w.id === selectedWallId) || null
  }, [walls, selectedWallId])

  const currentWallLength = useMemo(() => {
    if (!selectedWall) return 0
    return Math.sqrt((selectedWall.end.x - selectedWall.start.x) ** 2 + (selectedWall.end.y - selectedWall.start.y) ** 2)
  }, [selectedWall])

  useEffect(() => {
    if (selectedWall) setInputLength(currentWallLength.toFixed(1))
  }, [selectedWallId, currentWallLength, selectedWall])

  // --- 🖱️ MOTOR DRAG & DROP EN 2D PARA ESTIRAR PAREDES ---
  const getSvgCoordinates = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    const rawX = (e.clientX - rect.left) / scale
    const rawY = (e.clientY - rect.top) / scale
    // Ajuste fino magnético (Snap a 0.1m) para mantener la precisión técnica
    return { x: Math.round(rawX * 10) / 10, y: Math.round(rawY * 10) / 10 }
  }

  const handleSvgMouseDown = (wallId: string, target: 'start' | 'end', e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedWallId(wallId)
    setDraggingNode({ wallId, target })
  }

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!draggingNode) return
    const { x, y } = getSvgCoordinates(e)

    setWalls(prev => prev.map(w => {
      if (w.id === draggingNode.wallId) {
        return { ...w, [draggingNode.target]: { x, y } }
      }
      return w
    }))
  }

  const handleSvgMouseUp = () => {
    setDraggingNode(null)
  }

  const handleSvgClickCanvas = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (draggingNode) return
    const { x, y } = getSvgCoordinates(e)

    if (!drawingStart) {
      setDrawingStart({ x, y })
    } else {
      if (drawingStart.x !== x || drawingStart.y !== y) {
        const newId = `wall-${Date.now()}`
        setWalls([...walls, {
          id: newId, start: drawingStart, end: { x, y },
          thickness: wallThickness, height: wallHeight, materialType: currentMaterial
        }])
        setSelectedWallId(newId)
      }
      setDrawingStart(null)
    }
  }

  const applyManualLength = (valStr: string) => {
    const newLen = parseFloat(valStr)
    if (!newLen || newLen <= 0.1 || !selectedWall) return
    const dx = selectedWall.end.x - selectedWall.start.x
    const dy = selectedWall.end.y - selectedWall.start.y
    const currentLen = Math.sqrt(dx * dx + dy * dy)
    if (currentLen === 0) return

    const ratio = newLen / currentLen
    setWalls(prev => prev.map(w => w.id === selectedWallId ? {
      ...w, end: { x: Math.round((w.start.x + dx * ratio) * 10) / 10, y: Math.round((w.start.y + dy * ratio) * 10) / 10 }
    } : w))
  }

  // --- 📐 ENVOLVENTE PERIMETRAL ---
  const cabinBounds = useMemo(() => {
    if (walls.length === 0) return { minX: 0, maxX: 4, minY: 0, maxY: 4, cx: 2, cy: 2, w: 4, l: 4 }
    const allX = walls.flatMap(w => [w.start.x, w.end.x])
    const allY = walls.flatMap(w => [w.start.y, w.end.y])
    const minX = Math.min(...allX), maxX = Math.max(...allX)
    const minY = Math.min(...allY), maxY = Math.max(...allY)
    return { minX, maxX, minY, maxY, cx: minX + (maxX - minX) / 2, cy: minY + (maxY - minY) / 2, w: Math.max(maxX - minX, 1), l: Math.max(maxY - minY, 1) }
  }, [walls])

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 bg-slate-900 text-white rounded-3xl shadow-2xl select-none">
      
      {/* 🛠️ PANEL DE HERRAMIENTAS Y CONTROL */}
      <div className="w-full xl:w-96 flex flex-col gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shrink-0 overflow-y-auto max-h-[720px]">
        <div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            CAD Interactivo de Precisión
          </span>
          <h2 className="text-lg font-black tracking-tight mt-1">Configurador Libre Flexible</h2>
          <p className="text-[11px] text-slate-400 mt-1">Hacé clic y arrastrá los círculos en las esquinas de las paredes para estirarlas o cambiar su tamaño.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
            📐 Plano Estirable 2D
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            🪵 Render Vivo 3D
          </button>
        </div>

        <hr className="border-slate-800" />

        {/* MATERIAL DE MUROS */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Material de Pared Activa:</label>
          <select value={currentMaterial} onChange={(e) => setCurrentMaterial(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white">
            <option value="TirantesMadera">🪵 Tirantes de Madera Maciza</option>
            <option value="TablaYeso">🧱 Placa Yeso / Tablaroca interior</option>
            <option value="Vidrio">🪟 Paño Fijo de Vidrio Templado</option>
          </select>
        </div>

        {/* ESTRUCTURAS COMPLEMENTARIAS */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
          <p className="text-[11px] font-bold text-emerald-400 uppercase">🏗️ Opciones de Obra:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Cimentación:</label>
              <select value={baseType} onChange={(e) => setBaseType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded text-xs font-bold">
                <option value="Pilotes">🪵 Pilotes de Madera</option>
                <option value="PlateaHormigon">🧱 Platea / Talla Hormigón</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Piso Acabado:</label>
              <select value={floorFinish} onChange={(e) => setFloorFinish(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded text-xs font-bold">
                <option value="Madera">🪵 Tabla Estilo Deck</option>
                <option value="Ceramica">🧱 Cerámica de Obra</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Pintura de Chapa:</label>
            <div className="flex gap-2">
              {['#334155', '#991b1b', '#14532d', '#1e3a8a'].map(c => (
                <button key={c} onClick={() => setRoofColor(c)} className={`w-6 h-6 rounded-full border-2 ${roofColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* ALEROS Y CAMINADOR CON CERCA */}
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-blue-400 uppercase">☔ Aleros Perimetrales Extensibles:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.n} onChange={(e) => setEaves({...eaves, n: e.target.checked})} /> Alero Norte</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.s} onChange={(e) => setEaves({...eaves, s: e.target.checked})} /> Alero Sur</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.e} onChange={(e) => setEaves({...eaves, e: e.target.checked})} /> Alero Este</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.o} onChange={(e) => setEaves({...eaves, o: e.target.checked})} /> Alero Oeste</label>
          </div>
          <label className="flex items-center gap-2 text-xs pt-2 border-t border-slate-800 mt-2 text-amber-400 font-medium">
            <input type="checkbox" checked={hasWalkway} onChange={(e) => setHasWalkway(e.target.checked)} />
            🚶‍♂️ Caminador Perimetral + Baranda / Cerquita de Madera
          </label>
        </div>

        {activeTab === '3d' && (
          <button onClick={() => setShowRoof3D(!showRoof3D)} className={`w-full py-2 rounded-xl text-xs font-bold border transition ${showRoof3D ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-amber-600 border-amber-500 text-white animate-pulse'}`}>
            {showRoof3D ? '🏠 Ocultar Techo (Auditar Interior)' : '🏠 Mostrar Techo Completo'}
          </button>
        )}

        {/* INPUT DE EDICIÓN EXACTA EN METROS */}
        {selectedWall && (
          <div className="p-3 bg-slate-900 rounded-xl border-2 border-emerald-500/30 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-emerald-400 uppercase">
              <span>📐 Acotar Dimensión a Mano</span>
              <button onClick={() => { setWalls(prev => prev.filter(w => w.id !== selectedWallId)); setSelectedWallId(null); }} className="text-red-400 underline">Eliminar</button>
            </div>
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1">
              <input type="number" step="0.1" value={inputLength} onChange={(e) => setInputLength(e.target.value)} onBlur={() => applyManualLength(inputLength)} className="w-full bg-transparent text-xs font-mono font-bold outline-none text-white" />
              <span className="text-xs text-slate-500 font-mono">m</span>
            </div>
          </div>
        )}
      </div>

      {/* 🖥️ LIENZO CAD DE TRABAJO */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[560px]">
        {activeTab === '2d' ? (
          <div className="w-full h-full flex justify-center items-center bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:25px_25px] p-4">
            <svg 
              ref={svgRef} width="100%" height="520" 
              onClick={handleSvgClickCanvas}
              onMouseMove={handleSvgMouseMove}
              onMouseUp={handleSvgMouseUp}
              onMouseLeave={handleSvgMouseUp}
              className="bg-slate-900 rounded-xl border border-slate-800 overflow-visible max-w-2xl shadow-2xl"
            >
              {hasWalkway && (
                <rect x={(cabinBounds.minX - 1.2) * scale} y={(cabinBounds.minY - 1.2) * scale} width={(cabinBounds.w + 2.4) * scale} height={(cabinBounds.l + 2.4) * scale} fill="none" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3 3" />
              )}

              {/* Mapeo de Muros en 2D */}
              {walls.map(w => {
                const isSel = w.id === selectedWallId
                let strokeColor = '#b45309'
                if (w.materialType === 'TablaYeso') strokeColor = '#cbd5e1'
                if (w.materialType === 'Vidrio') strokeColor = '#38bdf8'

                return (
                  <g key={w.id}>
                    <line 
                      x1={w.start.x * scale} y1={w.start.y * scale} x2={w.end.x * scale} y2={w.end.y * scale} 
                      stroke={isSel ? '#10b981' : strokeColor} strokeWidth={w.thickness * scale} strokeLinecap="round"
                      className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedWallId(w.id) }}
                    />
                    
                    {/* Nodos interactivos de control en los extremos para estirar */}
                    {isSel && (
                      <>
                        <circle cx={w.start.x * scale} cy={w.start.y * scale} r="7" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-move" onMouseDown={(e) => handleSvgMouseDown(w.id, 'start', e)} />
                        <circle cx={w.end.x * scale} cy={w.end.y * scale} r="7" className="fill-emerald-400 stroke-slate-950 stroke-2 cursor-move" onMouseDown={(e) => handleSvgMouseDown(w.id, 'end', e)} />
                      </>
                    )}
                  </g>
                )
              })}

              {drawingStart && <circle cx={drawingStart.x * scale} cy={drawingStart.y * scale} r="6" className="fill-emerald-500 animate-pulse" />}
            </svg>
          </div>
        ) : (
          
          /* ☀️ ENGINE 3D CON CAMINADOR, CERCA PERIMETRAL Y MUROS ESTIRABLES */
          <div className="w-full h-[560px] relative">
            <Canvas camera={{ position: [cabinBounds.cx, 6, cabinBounds.cy + 7], fov: 40 }} shadows>
              <color attach="background" args={['#0f172a']} />
              <Sky sunPosition={[100, 45, 100]} />
              <ambientLight intensity={showRoof3D ? 0.6 : 1.3} />
              <directionalLight position={[25, 45, 20]} intensity={1.5} castShadow />
              
              <Center>
                {/* ESTRUCTURA DE LA BASE */}
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

                {/* 🚶‍♂️ CAMINADOR DECK + BARANDA / CERQUITA DE MADERA */}
                {hasWalkway && (
                  <group>
                    {/* Suelo del caminador perimetral exterior */}
                    <mesh position={[cabinBounds.cx, 0.04, cabinBounds.cy]} receiveShadow>
                      <boxGeometry args={[cabinBounds.w + 1.8, 0.04, cabinBounds.l + 1.8]} />
                      <meshStandardMaterial color="#7c2d12" roughness={0.9} /> {/* Deck Oscuro */}
                    </mesh>

                    {/* CERQUITA / BARANDA INTEGRAL ALREDEDOR DEL CAMINADOR */}
                    <group position={[cabinBounds.cx, 0.45, cabinBounds.cy]}>
                      {/* Barandilla Norte */}
                      <mesh position={[0, 0, -cabinBounds.l / 2 - 0.8]}><boxGeometry args={[cabinBounds.w + 1.8, 0.05, 0.05]} /><meshStandardMaterial color="#451a03" /></mesh>
                      <mesh position={[0, -0.2, -cabinBounds.l / 2 - 0.8]}><boxGeometry args={[cabinBounds.w + 1.8, 0.05, 0.05]} /><meshStandardMaterial color="#451a03" /></mesh>
                      {/* Barandilla Sur */}
                      <mesh position={[0, 0, cabinBounds.l / 2 + 0.8]}><boxGeometry args={[cabinBounds.w + 1.8, 0.05, 0.05]} /><meshStandardMaterial color="#451a03" /></mesh>
                      <mesh position={[0, -0.2, cabinBounds.l / 2 + 0.8]}><boxGeometry args={[cabinBounds.w + 1.8, 0.05, 0.05]} /><meshStandardMaterial color="#451a03" /></mesh>
                      {/* Barandilla Este */}
                      <mesh position={[cabinBounds.w / 2 + 0.8, 0, 0]}><boxGeometry args={[0.05, 0.05, cabinBounds.l + 1.6]} /><meshStandardMaterial color="#451a03" /></mesh>
                      <mesh position={[cabinBounds.w / 2 + 0.8, -0.2, 0]}><boxGeometry args={[0.05, 0.05, cabinBounds.l + 1.6]} /><meshStandardMaterial color="#451a03" /></mesh>
                      {/* Barandilla Oeste */}
                      <mesh position={[-cabinBounds.w / 2 - 0.8, 0, 0]}><boxGeometry args={[0.05, 0.05, cabinBounds.l + 1.6]} /><meshStandardMaterial color="#451a03" /></mesh>
                      <mesh position={[-cabinBounds.w / 2 - 0.8, -0.2, 0]}><boxGeometry args={[0.05, 0.05, cabinBounds.l + 1.6]} /><meshStandardMaterial color="#451a03" /></mesh>
                      
                      {/* Postes verticales de la cerca */}
                      {[-cabinBounds.w/2 - 0.8, 0, cabinBounds.w/2 + 0.8].map((px, i) => 
                        [-cabinBounds.l/2 - 0.8, cabinBounds.l/2 + 0.8].map((pz, j) => (
                          <mesh key={`post-${i}-${j}`} position={[px, -0.2, pz]}><cylinderGeometry args={[0.04, 0.04, 0.5]} /><meshStandardMaterial color="#2d1606" /></mesh>
                        ))
                      )}
                    </group>
                  </group>
                )}

                {/* ACABADO PISO INTERIOR */}
                <mesh position={[cabinBounds.cx, 0.22, cabinBounds.cy]}>
                  <boxGeometry args={[cabinBounds.w - 0.04, 0.02, cabinBounds.l - 0.04]} />
                  <meshStandardMaterial color={floorFinish === 'Madera' ? '#854d0e' : '#cbd5e1'} roughness={floorFinish === 'Madera' ? 0.6 : 0.2} />
                </mesh>

                {/* RENDERIZADO EXTRUDADO DE PAREDES MODIFICADAS */}
                {walls.map(w => {
                  const dx = w.end.x - w.start.x
                  const dz = w.end.y - w.start.y
                  const length = Math.sqrt(dx * dx + dz * dz)
                  if (length === 0) return null
                  const angle = Math.atan2(dz, dx)

                  let mColor = '#b45309'
                  let mRoughness = 0.7
                  let mOpacity = 1.0
                  let trans = false

                  if (w.materialType === 'TablaYeso') { mColor = '#f8fafc'; mRoughness = 0.9 }
                  else if (w.materialType === 'Vidrio') { mColor = '#e0f2fe'; mRoughness = 0.05; mOpacity = 0.3; trans = true }

                  return (
                    <mesh key={`3d-w-${w.id}`} position={[w.start.x + dx/2, w.height/2 + 0.2, w.start.y + dz/2]} rotation={[0, -angle, 0]} castShadow>
                      <boxGeometry args={[length, w.height, w.thickness]} />
                      <meshStandardMaterial color={mColor} roughness={mRoughness} transparent={trans} opacity={mOpacity} side={THREE.DoubleSide} />
                    </mesh>
                  )
                })}

                {/* TECHO INDUSTRIAL DOS AGUAS CON ALEROS CONFIGURABLES */}
                {showRoof3D && walls.length > 0 && (
                  <group position={[cabinBounds.cx, wallHeight + 0.4, cabinBounds.cy]}>
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
