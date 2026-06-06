'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Sky, Center } from '@react-three/drei'
import * as THREE from 'three'

// --- 📐 INTERFACES DE ARQUITECTURA ---
interface Point2D {
  x: number
  y: number
}

interface CustomWall {
  id: string
  start: Point2D
  end: Point2D
  thickness: number
  height: number
  materialType: 'Madera' | 'Cemento' | 'Vidrio'
}

export default function InteractiveFloorPlan({ options }: { options?: any }) {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  const [walls, setWalls] = useState<CustomWall[]>([
    // Estructura inicial de ejemplo (un cuarto básico de 4x4 metros)
    { id: 'w1', start: { x: 2, y: 2 }, end: { x: 6, y: 2 }, thickness: 0.2, height: 2.4, materialType: 'Madera' },
    { id: 'w2', start: { x: 6, y: 2 }, end: { x: 6, y: 6 }, thickness: 0.2, height: 2.4, materialType: 'Madera' },
    { id: 'w3', start: { x: 6, y: 6 }, end: { x: 2, y: 6 }, thickness: 0.2, height: 2.4, materialType: 'Madera' },
    { id: 'w4', start: { x: 2, y: 6 }, end: { x: 2, y: 2 }, thickness: 0.2, height: 2.4, materialType: 'Madera' },
  ])

  // Estados de dibujo libre y selección
  const [drawingStart, setDrawingStart] = useState<Point2D | null>(null)
  const [selectedWallId, setSelectedWallId] = useState<string | null>('w1')
  const [globalThickness, setGlobalThickness] = useState<number>(0.2)
  const [globalHeight, setGlobalHeight] = useState<number>(2.4)
  const [selectedMaterial, setSelectedMaterial] = useState<'Madera' | 'Cemento' | 'Vidrio'>('Madera')

  // Inputs controlados para la pared seleccionada
  const [inputLength, setInputLength] = useState<string>('4.0')

  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 45 // Factor de escala píxeles/metro para el espacio CAD

  // --- 🎯 PARED SELECCIONADA ACTUALMENTE ---
  const selectedWall = useMemo(() => {
    return walls.find(w => w.id === selectedWallId) || null
  }, [walls, selectedWallId])

  // Calcular la longitud actual de la pared seleccionada para los inputs
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

  // --- 🛠️ MODIFICAR MEDIDA POR TECLADO (INPUT) ---
  const applyManualLength = (valStr: string) => {
    const newLen = parseFloat(valStr)
    if (!newLen || newLen <= 0.2 || !selectedWall) return

    const dx = selectedWall.end.x - selectedWall.start.x
    const dy = selectedWall.end.y - selectedWall.start.y
    const currentLen = Math.sqrt(dx * dx + dy * dy)
    if (currentLen === 0) return

    // Proyectar el nuevo punto final manteniendo la misma dirección angular
    const ratio = newLen / currentLen
    const newEndX = selectedWall.start.x + dx * ratio
    const newEndY = selectedWall.start.y + dy * ratio

    setWalls(prev => prev.map(w => w.id === selectedWallId ? {
      ...w,
      end: { x: Math.round(newEndX * 10) / 10, y: Math.round(newEndY * 10) / 10 }
    } : w))
  }

  // --- 🖱️ INTERACCIÓN CLICK CAD: DIBUJO TOTALMENTE LIBRE ---
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    
    // Obtener coordenadas relativas al lienzo y aplicar Snap magnético a décimas de metro (0.1m)
    const rawX = (e.clientX - rect.left) / scale
    const rawY = (e.clientY - rect.top) / scale
    const snapX = Math.round(rawX * 10) / 10
    const snapY = Math.round(rawY * 10) / 10

    if (!drawingStart) {
      // Primer click: Fijar inicio del muro
      setDrawingStart({ x: snapX, y: snapY })
    } else {
      // Segundo click: Crear muro si no es un punto fantasma vacio
      if (drawingStart.x !== snapX || drawingStart.y !== snapY) {
        const newWallId = `wall-${Date.now()}`
        const newWall: CustomWall = {
          id: newWallId,
          start: drawingStart,
          end: { x: snapX, y: snapY },
          thickness: globalThickness,
          height: globalHeight,
          materialType: selectedMaterial
        }
        setWalls([...walls, newWall])
        setSelectedWallId(newWallId)
      }
      setDrawingStart(null)
    }
  }

  // --- 📐 ENCONTRAR ENVOLVENTE (BOUNDS) EXACTA DE LA CABAÑA ---
  const cabinBounds = useMemo(() => {
    if (walls.length === 0) return { minX: 0, maxX: 4, minY: 0, maxY: 4, cx: 2, cy: 2, w: 4, l: 4 }
    const allX = walls.flatMap(w => [w.start.x, w.end.x])
    const allY = walls.flatMap(w => [w.start.y, w.end.y])
    
    const minX = Math.min(...allX)
    const maxX = Math.max(...allX)
    const minY = Math.min(...allY)
    const maxY = Math.max(...allY)

    return {
      minX,
      maxX,
      minY,
      maxY,
      cx: minX + (maxX - minX) / 2,
      cy: minY + (maxY - minY) / 2,
      w: Math.max(maxX - minX, 1),
      l: Math.max(maxY - minY, 1)
    }
  }, [walls])

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-2 text-white select-none">
      
      {/* 🛠️ PANEL DE CONTROL LATERAL */}
      <div className="w-full xl:w-80 flex flex-col gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shrink-0">
        <div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
            CAD Core Avanzado v2.5
          </span>
          <h2 className="text-lg font-black tracking-tight mt-1">Diseñador de Muros Libres</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Hacé clicks en la grilla para levantar estructuras personalizadas.</p>
        </div>

        {/* Selector de Modos 2D / 3D */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('2d')} 
            className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            📐 Plano Dibujo 2D
          </button>
          <button 
            onClick={() => setActiveTab('3d')} 
            className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            🪵 Render Vivo 3D
          </button>
        </div>

        <hr className="border-slate-800" />

        {/* Configuración de Pincel de Muro Activo */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">📐 Propiedades del Pincel:</p>
          
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">Material Estructural:</label>
            <select 
              value={selectedMaterial} 
              onChange={(e) => setSelectedMaterial(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-emerald-500"
            >
              <option value="Madera">🪵 Troncos Rústicos de Cabaña</option>
              <option value="Cemento">🧱 Cemento Sólido Alisado</option>
              <option value="Vidrio">🪟 Panel Acristalado Térmico</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Espesor (m):</label>
              <input 
                type="number" step="0.05" min="0.1" max="0.5"
                value={globalThickness}
                onChange={(e) => setGlobalThickness(parseFloat(e.target.value) || 0.2)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Altura Muro (m):</label>
              <input 
                type="number" step="0.1" min="1.5" max="4"
                value={globalHeight}
                onChange={(e) => setGlobalHeight(parseFloat(e.target.value) || 2.4)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Editor Numérico de Elemento Seleccionado */}
        {selectedWall && (
          <div className="p-4 bg-slate-900 rounded-xl border-2 border-emerald-500/30 space-y-3 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">✏️ Muro Seleccionado</span>
              <button 
                onClick={() => {
                  setWalls(prev => prev.filter(w => w.id !== selectedWallId))
                  setSelectedWallId(null)
                }}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold underline"
              >
                Eliminar Muro
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block font-bold mb-1">Extensión Exacta (Longitud):</label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5">
                <input 
                  type="number" step="0.1" min="0.3"
                  value={inputLength} 
                  onChange={(e) => setInputLength(e.target.value)}
                  onBlur={() => applyManualLength(inputLength)}
                  className="w-full bg-transparent text-xs font-mono font-bold text-white outline-none"
                />
                <span className="text-xs text-slate-500 font-mono">m</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setWalls(prev => prev.map(w => w.id === selectedWallId ? { ...w, materialType: 'Madera' } : w))}
                className={`py-1 text-[10px] font-bold rounded ${selectedWall.materialType === 'Madera' ? 'bg-amber-700' : 'bg-slate-950'}`}
              >
                Madera
              </button>
              <button 
                onClick={() => setWalls(prev => prev.map(w => w.id === selectedWallId ? { ...w, materialType: 'Vidrio' } : w))}
                className={`py-1 text-[10px] font-bold rounded ${selectedWall.materialType === 'Vidrio' ? 'bg-sky-700' : 'bg-slate-950'}`}
              >
                Vidrio
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => { setWalls([]); setSelectedWallId(null); setDrawingStart(null); }}
          className="w-full bg-red-950/40 border border-red-800 text-red-400 py-2 rounded-xl text-xs font-bold hover:bg-red-900/50 transition mt-auto"
        >
          🗑️ Limpiar Todo el Lienzo
        </button>
      </div>

      {/* 🖥️ ÁREA DE TRABAJO EN VIVO (RESPONSIVA) */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[520px]">
        
        {activeTab === '2d' ? (
          <div className="w-full h-full flex justify-center items-center bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:22px_22px] p-4">
            <svg 
              ref={svgRef} 
              width="100%" 
              height="480" 
              onClick={handleSvgClick}
              className="bg-slate-900 rounded-xl border border-slate-800 overflow-visible cursor-crosshair max-w-2xl shadow-2xl"
            >
              {/* Renderizar muros terminados */}
              {walls.map(w => {
                const isSel = w.id === selectedWallId
                let colorMat = '#b45309' // madera
                if (w.materialType === 'Cemento') colorMat = '#64748b'
                if (w.materialType === 'Vidrio') colorMat = '#38bdf8'

                return (
                  <line 
                    key={w.id} 
                    x1={w.start.x * scale} y1={w.start.y * scale} 
                    x2={w.end.x * scale} y2={w.end.y * scale} 
                    stroke={isSel ? '#10b981' : colorMat} 
                    strokeWidth={w.thickness * scale} 
                    strokeLinecap="round"
                    className="transition-colors duration-150 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation() // Evita activar el dibujo al seleccionar muro
                      setSelectedWallId(w.id)
                    }}
                  />
                )
              })}

              {/* Nodo guía del primer click en pleno dibujo */}
              {drawingStart && (
                <g>
                  <circle cx={drawingStart.x * scale} cy={drawingStart.y * scale} r="6" className="fill-emerald-400 animate-ping" />
                  <circle cx={drawingStart.x * scale} cy={drawingStart.y * scale} r="5" className="fill-emerald-500 stroke-white stroke-2" />
                </g>
              )}
            </svg>
          </div>
        ) : (
          /* ☀️ RENDERIZADOR INTERACTIVO 3D TOTALMENTE ENCUADRADO */
          <div className="w-full h-[520px] relative">
            <Canvas camera={{ position: [cabinBounds.cx, globalHeight * 2.5, cabinBounds.cy + 6], fov: 42 }} shadows>
              <color attach="background" args={['#0f172a']} />
              <Sky sunPosition={[80, 50, 100]} />
              <ambientLight intensity={0.8} />
              <directionalLight position={[30, 45, 20]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
              
              {/* <Center> fuerza a ThreeJS a tomar la geometría resultante de los muros y encuadrarla exactamente en el centro óptimo */}
              <Center>
                
                {/* PILOTES DE BASE: Ubicados milimétricamente en las esquinas de la envolvente perimetral */}
                <group position={[0, -0.2, 0]}>
                  <mesh position={[cabinBounds.minX, 0.3, cabinBounds.minY]} castShadow>
                    <cylinderGeometry args={[0.15, 0.18, 0.6, 12]} />
                    <meshStandardMaterial color="#2d1606" roughness={0.9} />
                  </mesh>
                  <mesh position={[cabinBounds.maxX, 0.3, cabinBounds.minY]} castShadow>
                    <cylinderGeometry args={[0.15, 0.18, 0.6, 12]} />
                    <meshStandardMaterial color="#2d1606" roughness={0.9} />
                  </mesh>
                  <mesh position={[cabinBounds.minX, 0.3, cabinBounds.maxY]} castShadow>
                    <cylinderGeometry args={[0.15, 0.18, 0.6, 12]} />
                    <meshStandardMaterial color="#2d1606" roughness={0.9} />
                  </mesh>
                  <mesh position={[cabinBounds.maxX, 0.3, cabinBounds.maxY]} castShadow>
                    <cylinderGeometry args={[0.15, 0.18, 0.6, 12]} />
                    <meshStandardMaterial color="#2d1606" roughness={0.9} />
                  </mesh>
                </group>

                {/* PLATAFORMA DE SUELO: Cubre exactamente el perímetro interno dinámico */}
                <mesh position={[cabinBounds.cx, 0.05, cabinBounds.cy]} receiveShadow>
                  <boxGeometry args={[cabinBounds.w + 0.3, 0.1, cabinBounds.l + 0.3]} />
                  <meshStandardMaterial color="#a16207" roughness={0.8} /> {/* Madera de cubierta */}
                </mesh>

                {/* MOTOR DE EXTRUSIÓN Y ROTACIÓN DE CADA MURO INDEPENDIENTE */}
                {walls.map(w => {
                  const dx = w.end.x - w.start.x
                  const dz = w.end.y - w.start.y // En 3D el eje Y del plano es el eje Z
                  const length = Math.sqrt(dx * dx + dz * dz)
                  if (length === 0) return null

                  const angle = Math.atan2(dz, dx)
                  
                  // Definición de materiales visuales profesionales
                  let matColor = "#b45309"
                  let matRoughness = 0.7
                  let matOpacity = 1.0
                  let isTransparent = false

                  if (w.materialType === 'Cemento') {
                    matColor = "#78716c"
                    matRoughness = 0.9
                  } else if (w.materialType === 'Vidrio') {
                    matColor = "#bae6fd"
                    matRoughness = 0.1
                    matOpacity = 0.4
                    isTransparent = true
                  }

                  return (
                    <mesh 
                      key={`3d-${w.id}`} 
                      position={[w.start.x + dx / 2, w.height / 2 + 0.1, w.start.y + dz / 2]} 
                      rotation={[0, -angle, 0]}
                      castShadow
                    >
                      <boxGeometry args={[length, w.height, w.thickness]} />
                      <meshStandardMaterial 
                        color={matColor} 
                        roughness={matRoughness} 
                        transparent={isTransparent} 
                        opacity={matOpacity} 
                      />
                    </mesh>
                  )
                })}

                {/* TECHO INDUSTRIAL AJUSTABLE: Se escala automáticamente a los límites del plano */}
                {walls.length > 0 && (
                  <group position={[cabinBounds.cx, globalHeight + 0.3, cabinBounds.cy]}>
                    {/* Ala Izquierda del Techo a dos aguas */}
                    <mesh position={[-cabinBounds.w / 4, cabinBounds.w * 0.08, 0]} rotation={[0, 0, 0.25]} castShadow>
                      <boxGeometry args={[cabinBounds.w / 1.6 + 0.4, 0.08, cabinBounds.l + 0.6]} />
                      <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
                    </mesh>
                    {/* Ala Derecha del Techo a dos aguas */}
                    <mesh position={[cabinBounds.w / 4, cabinBounds.w * 0.08, 0]} rotation={[0, 0, -0.25]} castShadow>
                      <boxGeometry args={[cabinBounds.w / 1.6 + 0.4, 0.08, cabinBounds.l + 0.6]} />
                      <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
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
