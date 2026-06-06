'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Sky, Center } from '@react-three/drei'
import * as THREE from 'three'

// --- 📐 INTERFACES TÉCNICAS DE CONSTRUCCIÓN ---
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
  
  // Base de muros (Forma una habitación inicial de 4x4m)
  const [walls, setWalls] = useState<CustomWall[]>([
    { id: 'w1', start: { x: 2, y: 2 }, end: { x: 6, y: 2 }, thickness: 0.15, height: 2.6, materialType: 'TirantesMadera' },
    { id: 'w2', start: { x: 6, y: 2 }, end: { x: 6, y: 6 }, thickness: 0.15, height: 2.6, materialType: 'TirantesMadera' },
    { id: 'w3', start: { x: 6, y: 6 }, end: { x: 2, y: 6 }, thickness: 0.15, height: 2.6, materialType: 'TirantesMadera' },
    { id: 'w4', start: { x: 2, y: 6 }, end: { x: 2, y: 2 }, thickness: 0.15, height: 2.6, materialType: 'TirantesMadera' },
  ])

  // --- ESTADOS DE CONFIGURACIÓN DE OBRA ---
  const [drawingStart, setDrawingStart] = useState<Point2D | null>(null)
  const [selectedWallId, setSelectedWallId] = useState<string | null>('w1')
  
  // Parámetros del pincel de dibujo
  const [currentMaterial, setCurrentMaterial] = useState<'TablaYeso' | 'TirantesMadera' | 'Vidrio'>('TirantesMadera')
  const [wallThickness, setWallThickness] = useState<number>(0.15)
  const [wallHeight, setWallHeight] = useState<number>(2.6)

  // Opciones de Obra Solicitadas
  const [baseType, setBaseType] = useState<'Pilotes' | 'PlateaHormigon'>('Pilotes')
  const [floorFinish, setFloorFinish] = useState<'Madera' | 'Ceramica'>('Madera')
  const [roofColor, setRoofColor] = useState<string>('#334155') // Color de chapa por defecto (Gris)
  
  // Aleros independientes (Norte, Sur, Este, Oeste)
  const [eaves, setEaves] = useState<{ n: boolean; s: boolean; e: boolean; o: boolean }>({
    n: true, s: true, e: false, o: false
  })
  const [hasWalkway, setHasWalkway] = useState<boolean>(true) // Caminador perimetral de hormigón/madera
  const [showRoof3D, setShowRoof3D] = useState<boolean>(true) // Para poder ver el interior en el 3D

  // Input controlado para modificar medidas en 2D
  const [inputLength, setInputLength] = useState<string>('4.0')

  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 45 // Píxeles por metro

  // --- 🎯 CÁLCULO DE MURO SELECCIONADO Y LONGITUD ---
  const selectedWall = useMemo(() => {
    return walls.find(w => w.id === selectedWallId) || null
  }, [walls, selectedWallId])

  const currentWallLength = useMemo(() => {
    if (!selectedWall) return 0
    const dx = selectedWall.end.x - selectedWall.start.x
    const dy = selectedWall.end.y - selectedWall.start.y
    return Math.sqrt(dx * dx + dy * dy)
  }, [selectedWall])

  useEffect(() => {
    if (selectedWall) {
      setInputLength(currentWallLength.toFixed(1))
    }
  }, [selectedWallId, currentWallLength, selectedWall])

  // --- ✏️ ASIGNACIÓN MANUAL DE MEDIDAS DESDE EL INPUT 2D ---
  const applyManualLength = (valStr: string) => {
    const newLen = parseFloat(valStr)
    if (!newLen || newLen <= 0.1 || !selectedWall) return

    const dx = selectedWall.end.x - selectedWall.start.x
    const dy = selectedWall.end.y - selectedWall.start.y
    const currentLen = Math.sqrt(dx * dx + dy * dy)
    if (currentLen === 0) return

    const ratio = newLen / currentLen
    const newEndX = selectedWall.start.x + dx * ratio
    const newEndY = selectedWall.start.y + dy * ratio

    setWalls(prev => prev.map(w => w.id === selectedWallId ? {
      ...w,
      end: { x: Math.round(newEndX * 10) / 10, y: Math.round(newEndY * 10) / 10 }
    } : w))
  }

  // --- 🖱️ INTERACCIÓN CLICK CAD EN 2D ---
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    
    const rawX = (e.clientX - rect.left) / scale
    const rawY = (e.clientY - rect.top) / scale
    const snapX = Math.round(rawX * 10) / 10
    const snapY = Math.round(rawY * 10) / 10

    if (!drawingStart) {
      setDrawingStart({ x: snapX, y: snapY })
    } else {
      if (drawingStart.x !== snapX || drawingStart.y !== snapY) {
        const newId = `wall-${Date.now()}`
        setWalls([...walls, {
          id: newId,
          start: drawingStart,
          end: { x: snapX, y: snapY },
          thickness: wallThickness,
          height: wallHeight,
          materialType: currentMaterial
        }])
        setSelectedWallId(newId)
      }
      setDrawingStart(null)
    }
  }

  // --- 📐 ENVOLVENTE DINÁMICA (BOUNDS) PARA ANCLAR TECHOS, ALEROS Y BASES ---
  const cabinBounds = useMemo(() => {
    if (walls.length === 0) return { minX: 0, maxX: 4, minY: 0, maxY: 4, cx: 2, cy: 2, w: 4, l: 4 }
    const allX = walls.flatMap(w => [w.start.x, w.end.x])
    const allY = walls.flatMap(w => [w.start.y, w.end.y])
    
    const minX = Math.min(...allX)
    const maxX = Math.max(...allX)
    const minY = Math.min(...allY)
    const maxY = Math.max(...allY)

    return {
      minX, maxX, minY, maxY,
      cx: minX + (maxX - minX) / 2,
      cy: minY + (maxY - minY) / 2,
      w: Math.max(maxX - minX, 1),
      l: Math.max(maxY - minY, 1)
    }
  }, [walls])

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 bg-slate-900 text-white rounded-3xl shadow-2xl select-none">
      
      {/* 🛠️ PANEL DE CONFIGURACIÓN ESTRUCTURAL */}
      <div className="w-full xl:w-96 flex flex-col gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shrink-0 overflow-y-auto max-h-[700px]">
        <div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            Cotizador Técnico e Ingeniería
          </span>
          <h2 className="text-lg font-black tracking-tight mt-1">Configurador Fino de Cabañas</h2>
        </div>

        {/* Interruptor de Vistas */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
            📐 Plano 2D (Medidas)
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            🪵 Render 3D Inmersivo
          </button>
        </div>

        <hr className="border-slate-800" />

        {/* 🧱 1. MATERIALES DE MUROS */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">🧱 Materiales del Muro Activo:</p>
          <select 
            value={currentMaterial} 
            onChange={(e) => setCurrentMaterial(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none"
          >
            <option value="TirantesMadera">🪵 Estructura de Tirantes de Madera</option>
            <option value="TablaYeso">🧱 Placas de Tabla Yeso (Durlock)</option>
            <option value="Vidrio">🪟 Ventanal Glaseado / Vidriería</option>
          </select>
        </div>

        {/* 🎨 2. ACABADOS, PISOS Y CIMENTACIÓN */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-3">
          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">🏗️ Cimentación y Suelos:</p>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Base Estructural:</label>
              <select value={baseType} onChange={(e) => setBaseType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded text-xs font-bold">
                <option value="Pilotes">🪵 Pilotes de Madera</option>
                <option value="PlateaHormigon">🧱 Platea de Hormigón</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Revestimiento Piso:</label>
              <select value={floorFinish} onChange={(e) => setFloorFinish(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded text-xs font-bold">
                <option value="Madera">🪵 Entablonado Madera</option>
                <option value="Ceramica">🧱 Cerámica Premium</option>
              </select>
            </div>
          </div>

          {/* 🏠 3. COLOR DE CHAPA DE TECHO */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Color de Chapa del Techo:</label>
            <div className="flex gap-2">
              {['#334155', '#991b1b', '#14532d', '#1e3a8a'].map(c => (
                <button 
                  key={c} onClick={() => setRoofColor(c)} 
                  className={`w-6 h-6 rounded-full border-2 ${roofColor === c ? 'border-white scale-110' : 'border-transparent'}`} 
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 📐 4. SELECCIÓN DE ALEROS POR LADO */}
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">☔ Configuración de Aleros:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.n} onChange={(e) => setEaves({...eaves, n: e.target.checked})} /> Alero Norte (Frente)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.s} onChange={(e) => setEaves({...eaves, s: e.target.checked})} /> Alero Sur (Fondo)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.e} onChange={(e) => setEaves({...eaves, e: e.target.checked})} /> Alero Este (Der)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={eaves.o} onChange={(e) => setEaves({...eaves, o: e.target.checked})} /> Alero Oeste (Izq)</label>
          </div>
          <label className="flex items-center gap-2 text-xs pt-1 border-t border-slate-800 mt-1">
            <input type="checkbox" checked={hasWalkway} onChange={(e) => setHasWalkway(e.target.checked)} />
            🚶‍♂️ Añadir caminador perimetral
          </label>
        </div>

        {/* 👁️ 5. CONTROL DE COBERTURA (VER INTERIOR) */}
        {activeTab === '3d' && (
          <button 
            onClick={() => setShowRoof3D(!showRoof3D)} 
            className={`w-full py-1.5 rounded-xl text-xs font-bold border transition ${showRoof3D ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-amber-600 border-amber-500 text-white animate-pulse'}`}
          >
            {showRoof3D ? '🏠 Quitar Techo (Ver Distribución Interior)' : '🏠 Colocar Techo'}
          </button>
        )}

        {/* ✏️ MODIFICADOR DE MEDIDA DE PARED SELECCIONADA */}
        {selectedWall && (
          <div className="p-3 bg-slate-900 rounded-xl border-2 border-emerald-500/30 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-emerald-400 uppercase">
              <span>📐 Modificar Largo de Pared</span>
              <button onClick={() => { setWalls(prev => prev.filter(w => w.id !== selectedWallId)); setSelectedWallId(null); }} className="text-red-400 underline">Borrar</button>
            </div>
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1">
              <input 
                type="number" step="0.1"
                value={inputLength} 
                onChange={(e) => setInputLength(e.target.value)}
                onBlur={() => applyManualLength(inputLength)}
                className="w-full bg-transparent text-xs font-mono font-bold outline-none text-white"
              />
              <span className="text-xs text-slate-500 font-mono">m</span>
            </div>
          </div>
        )}
      </div>

      {/* 🖥️ LIENZO INTERACTIVO */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[560px]">
        
        {activeTab === '2d' ? (
          <div className="w-full h-full flex justify-center items-center bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:25px_25px] p-4">
            <svg ref={svgRef} width="100%" height="520" onClick={handleSvgClick} className="bg-slate-900 rounded-xl border border-slate-800 overflow-visible cursor-crosshair max-w-2xl shadow-2xl">
              
              {/* Caminador perimetral proyectado en 2D */}
              {hasWalkway && (
                <rect 
                  x={(cabinBounds.minX - 1) * scale} y={(cabinBounds.minY - 1) * scale}
                  width={(cabinBounds.w + 2) * scale} height={(cabinBounds.l + 2) * scale}
                  fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 4"
                />
              )}

              {/* Paredes */}
              {walls.map(w => {
                const isSel = w.id === selectedWallId
                let strokeColor = '#b45309'
                if (w.materialType === 'TablaYeso') strokeColor = '#cbd5e1'
                if (w.materialType === 'Vidrio') strokeColor = '#38bdf8'

                return (
                  <g key={w.id}>
                    <line 
                      x1={w.start.x * scale} y1={w.start.y * scale} 
                      x2={w.end.x * scale} y2={w.end.y * scale} 
                      stroke={isSel ? '#10b981' : strokeColor} 
                      strokeWidth={w.thickness * scale} 
                      strokeLinecap="round"
                      className="cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setSelectedWallId(w.id) }}
                    />
                  </g>
                )
              })}

              {/* Nodo guía primer click */}
              {drawingStart && <circle cx={drawingStart.x * scale} cy={drawingStart.y * scale} r="6" className="fill-emerald-400 animate-ping" />}
            </svg>
          </div>
        ) : (
          
          /* ☀️ RENDERIZADOR 3D AVANZADO CON DETALLES DE OBRA COMPLETA */
          <div className="w-full h-[560px] relative">
            <Canvas camera={{ position: [cabinBounds.cx, 6, cabinBounds.cy + 7], fov: 40 }} shadows>
              <color attach="background" args={['#0f172a']} />
              <Sky sunPosition={[100, 40, 100]} />
              <ambientLight intensity={showRoof3D ? 0.6 : 1.2} />
              <directionalLight position={[20, 40, 20]} intensity={1.5} castShadow />
              
              <Center>
                
                {/* 🧱 CIMENTACIÓN: PLATEA DE HORMIGÓN O PILOTES DE MADERA */}
                {baseType === 'PlateaHormigon' ? (
                  <mesh position={[cabinBounds.cx, 0.1, cabinBounds.cy]} receiveShadow>
                    <boxGeometry args={[cabinBounds.w + 0.1, 0.2, cabinBounds.l + 0.1]} />
                    <meshStandardMaterial color="#57534e" roughness={0.8} /> {/* Hormigón rústico */}
                  </mesh>
                ) : (
                  <group position={[0, -0.2, 0]}>
                    {/* Pilotes calculados en los 4 vértices del armazón perimetral */}
                    <mesh position={[cabinBounds.minX, 0.3, cabinBounds.minY]}><cylinderGeometry args={[0.15, 0.15, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[cabinBounds.maxX, 0.3, cabinBounds.minY]}><cylinderGeometry args={[0.15, 0.15, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[cabinBounds.minX, 0.3, cabinBounds.maxY]}><cylinderGeometry args={[0.15, 0.15, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                    <mesh position={[cabinBounds.maxX, 0.3, cabinBounds.maxY]}><cylinderGeometry args={[0.15, 0.15, 0.6]} /><meshStandardMaterial color="#2d1606" /></mesh>
                  </group>
                )}

                {/* 🚶‍♂️ WALKWAY / ACERAS CAMINADORAS */}
                {hasWalkway && (
                  <mesh position={[cabinBounds.cx, 0.02, cabinBounds.cy]} receiveShadow>
                    <boxGeometry args={[cabinBounds.w + 1.6, 0.04, cabinBounds.l + 1.6]} />
                    <meshStandardMaterial color="#78716c" roughness={0.9} />
                  </mesh>
                )}

                {/* 🪵 ACABADO DE REVESTIMIENTO DE PISO INTERIOR */}
                <mesh position={[cabinBounds.cx, 0.21, cabinBounds.cy]}>
                  <boxGeometry args={[cabinBounds.w - 0.05, 0.02, cabinBounds.l - 0.05]} />
                  <meshStandardMaterial color={floorFinish === 'Madera' ? '#854d0e' : '#a2a1a8'} roughness={floorFinish === 'Madera' ? 0.6 : 0.2} />
                </mesh>

                {/* 🧱 LEVANTAMIENTO TÉCNICO DE PAREDES */}
                {walls.map(w => {
                  const dx = w.end.x - w.start.x
                  const dz = w.end.y - w.start.y
                  const length = Math.sqrt(dx * dx + dz * dz)
                  if (length === 0) return null
                  const angle = Math.atan2(dz, dx)

                  // Detalle de materiales reales solicitado
                  let mColor = '#b45309' // Tirantes de madera por defecto
                  let mRoughness = 0.7
                  let mOpacity = 1.0
                  let trans = false

                  if (w.materialType === 'TablaYeso') {
                    mColor = '#f1f5f9' // Yeso blanco técnico
                    mRoughness = 0.9
                  } else if (w.materialType === 'Vidrio') {
                    mColor = '#e0f2fe'
                    mRoughness = 0.1
                    mOpacity = 0.35
                    trans = true
                  }

                  return (
                    <mesh key={`3d-w-${w.id}`} position={[w.start.x + dx/2, w.height/2 + 0.2, w.start.y + dz/2]} rotation={[0, -angle, 0]} castShadow>
                      <boxGeometry args={[length, w.height, w.thickness]} />
                      <meshStandardMaterial color={mColor} roughness={mRoughness} transparent={trans} opacity={mOpacity} side={THREE.DoubleSide} />
                    </mesh>
                  )
                })}

                {/* 🏠 TECHO INTELIGENTE MODULAR CON ALEROS CONFIGURABLES */}
                {showRoof3D && walls.length > 0 && (
                  <group position={[cabinBounds.cx, wallHeight + 0.4, cabinBounds.cy]}>
                    {/* Techo Ala Izquierda */}
                    <mesh position={[-cabinBounds.w / 4, cabinBounds.w * 0.08, 0]} rotation={[0, 0, 0.22]} castShadow>
                      <boxGeometry args={[
                        cabinBounds.w / 1.6 + (eaves.o ? 0.8 : 0), 
                        0.06, 
                        cabinBounds.l + (eaves.n ? 0.5 : 0) + (eaves.s ? 0.5 : 0)
                      ]} />
                      <meshStandardMaterial color={roofColor} metalness={0.5} roughness={0.4} />
                    </mesh>
                    {/* Techo Ala Derecha */}
                    <mesh position={[cabinBounds.w / 4, cabinBounds.w * 0.08, 0]} rotation={[0, 0, -0.22]} castShadow>
                      <boxGeometry args={[
                        cabinBounds.w / 1.6 + (eaves.e ? 0.8 : 0), 
                        0.06, 
                        cabinBounds.l + (eaves.n ? 0.5 : 0) + (eaves.s ? 0.5 : 0)
                      ]} />
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
