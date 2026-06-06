'use client'

import { useState, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'

interface Point2D { x: number; y: number }

interface WallItem {
  id: string
  type: 'puerta' | 'ventana'
  x: number 
  y: number 
}

interface Room {
  id: string
  name: string
  type: 'Dormitorio' | 'Baño' | 'Cocina' | 'Living'
  vertices: Point2D[] 
  items: WallItem[]
}

interface PorchStructure {
  id: string
  name: string
  style: 'alero' | 'pilotes' // Alero simple o caminador elevado con postes
  vertices: Point2D[]
}

const roomStyles: Record<string, { bg: string; stroke: string; icon: string }> = {
  'Dormitorio': { bg: '#fbfbfb', stroke: '#854d0e', icon: '🛏️' },
  'Baño': { bg: '#f4f4f5', stroke: '#a16207', icon: '🚽' },
  'Cocina': { bg: '#fafaf9', stroke: '#ca8a04', icon: '🍳' },
  'Living': { bg: '#ffffff', stroke: '#78350f', icon: '🛋️' },
}

export default function CabinArchitectMaster() {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  const [activeElement, setActiveElement] = useState<{ type: 'room' | 'porch'; id: string }>({ type: 'room', id: 'r1' })
  
  // Estructura de ambientes
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 'r1',
      name: 'Módulo Living/Cocina',
      type: 'Living',
      vertices: [{ x: 1, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 5 }, { x: 1, y: 5 }],
      items: [
        { id: 'p1', type: 'puerta', x: 3.5, y: 5 },
        { id: 'v1', type: 'ventana', x: 6, y: 3 }
      ]
    },
    {
      id: 'r2',
      name: 'Habitación Principal',
      type: 'Dormitorio',
      vertices: [{ x: 6, y: 1 }, { x: 10, y: 1 }, { x: 10, y: 5 }, { x: 6, y: 5 }],
      items: [
        { id: 'v2', type: 'ventana', x: 8, y: 1 }
      ]
    }
  ])

  // Sistema de porches con transformación totalmente libre (Múltiples zonas)
  const [porches, setPorches] = useState<PorchStructure[]>([
    {
      id: 'p-main',
      name: 'Galería Frontal',
      style: 'pilotes',
      vertices: [{ x: 1, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 6.5 }, { x: 1, y: 6.5 }]
    }
  ])

  const svgRef = useRef<SVGSVGElement>(null)
  
  // Registro de arrastre unificado
  const dragInfo = useRef<{
    type: 'vertex' | 'room-center' | 'item' | 'porch-vertex' | 'porch-center'
    roomId?: string
    porchId?: string
    index?: number
    itemId?: string
    startX?: number
    startY?: number
    originalVertices?: Point2D[]
    originalItemPos?: { x: number; y: number }
  } | null>(null)

  const scale = 45 

  // --- DETECTOR DE CLIC DERECHO PARA CREAR FORMAS EN L O POLÍGONOS RAROS ---
  const handleRightClickWall = (roomId: string, idx: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const mX = Math.round(((e.clientX - rect.left) / scale) * 10) / 10
    const mY = Math.round(((e.clientY - rect.top) / scale) * 10) / 10

    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      const nv = [...r.vertices]
      nv.splice(idx + 1, 0, { x: mX, y: mY })
      return { ...r, vertices: nv }
    }))
  }

  const handleRightClickPorch = (porchId: string, idx: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const mX = Math.round(((e.clientX - rect.left) / scale) * 10) / 10
    const mY = Math.round(((e.clientY - rect.top) / scale) * 10) / 10

    setPorches(prev => prev.map(p => {
      if (p.id !== porchId) return p
      const nv = [...p.vertices]
      nv.splice(idx + 1, 0, { x: mX, y: mY })
      return { ...p, vertices: nv }
    }))
  }

  // --- INICIADORES DE ARRASTRE SIN BLOQUEOS ---
  const initVertexDrag = (roomId: string, index: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    dragInfo.current = { type: 'vertex', roomId, index }
    setActiveElement({ type: 'room', id: roomId })
  }

  const initPorchVertexDrag = (porchId: string, index: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    dragInfo.current = { type: 'porch-vertex', porchId, index }
    setActiveElement({ type: 'porch', id: porchId })
  }

  const initRoomCenterDrag = (room: Room, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    dragInfo.current = {
      type: 'room-center',
      roomId: room.id,
      startX: (e.clientX - rect.left) / scale,
      startY: (e.clientY - rect.top) / scale,
      originalVertices: JSON.parse(JSON.stringify(room.vertices))
    }
    setActiveElement({ type: 'room', id: room.id })
  }

  const initPorchCenterDrag = (porch: PorchStructure, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    dragInfo.current = {
      type: 'porch-center',
      porchId: porch.id,
      startX: (e.clientX - rect.left) / scale,
      startY: (e.clientY - rect.top) / scale,
      originalVertices: JSON.parse(JSON.stringify(porch.vertices))
    }
    setActiveElement({ type: 'porch', id: porch.id })
  }

  const initItemDrag = (roomId: string, item: WallItem, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    dragInfo.current = {
      type: 'item',
      roomId,
      itemId: item.id,
      startX: (e.clientX - rect.left) / scale,
      startY: (e.clientY - rect.top) / scale,
      originalItemPos: { x: item.x, y: item.y }
    }
  }

  // --- MOTOR DE MOVIMIENTO EN TIEMPO REAL ---
  const handleMouseMoveGlobal = (e: React.MouseEvent) => {
    if (!dragInfo.current || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const curX = (e.clientX - rect.left) / scale
    const curY = (e.clientY - rect.top) / scale
    const curXSnap = Math.round(curX * 10) / 10
    const curYSnap = Math.round(curY * 10) / 10

    const info = dragInfo.current

    if (info.type === 'vertex' && info.roomId && info.index !== undefined) {
      setRooms(prev => prev.map(r => {
        if (r.id !== info.roomId) return r
        const nv = [...r.vertices]
        nv[info.index!] = { x: curXSnap, y: curYSnap }
        return { ...r, vertices: nv }
      }))
    } 
    else if (info.type === 'porch-vertex' && info.porchId && info.index !== undefined) {
      setPorches(prev => prev.map(p => {
        if (p.id !== info.porchId) return p
        const nv = [...p.vertices]
        nv[info.index!] = { x: curXSnap, y: curYSnap }
        return { ...p, vertices: nv }
      }))
    }
    else if (info.type === 'room-center' && info.roomId && info.startX && info.startY && info.originalVertices) {
      const dx = curX - info.startX
      const dy = curY - info.startY
      setRooms(prev => prev.map(r => {
        if (r.id !== info.roomId) return r
        return {
          ...r,
          vertices: info.originalVertices!.map(v => ({
            x: Math.round((v.x + dx) * 10) / 10,
            y: Math.round((v.y + dy) * 10) / 10
          }))
        }
      }))
    }
    else if (info.type === 'porch-center' && info.porchId && info.startX && info.startY && info.originalVertices) {
      const dx = curX - info.startX
      const dy = curY - info.startY
      setPorches(prev => prev.map(p => {
        if (p.id !== info.porchId) return p
        return {
          ...p,
          vertices: info.originalVertices!.map(v => ({
            x: Math.round((v.x + dx) * 10) / 10,
            y: Math.round((v.y + dy) * 10) / 10
          }))
        }
      }))
    }
    else if (info.type === 'item' && info.roomId && info.itemId && info.startX && info.startY && info.originalItemPos) {
      const dx = curX - info.startX
      const dy = curY - info.startY
      setRooms(prev => prev.map(r => {
        if (r.id !== info.roomId) return r
        return {
          ...r,
          items: r.items.map(it => it.id === info.itemId ? {
            ...it,
            x: Math.round((info.originalItemPos!.x + dx) * 10) / 10,
            y: Math.round((info.originalItemPos!.y + dy) * 10) / 10
          } : it)
        }
      }))
    }
  }

  const handleMouseUpGlobal = () => {
    dragInfo.current = null
  }

  // --- CONTROLES DE AGREGAR MÁS PORCHES ---
  const addNewPorchZone = () => {
    const id = `p-${Date.now()}`
    setPorches([...porches, {
      id,
      name: `Porche Adicional ${porches.length + 1}`,
      style: 'alero',
      vertices: [{ x: 2, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 3.5 }, { x: 2, y: 3.5 }]
    }])
    setActiveElement({ type: 'porch', id })
  }

  // Cálculo de los límites globales para el techo dinámico unificado
  const boundingBox3D = useMemo(() => {
    let minX = 999, maxX = -999, minY = 999, maxY = -999
    rooms.forEach(r => {
      r.vertices.forEach(v => {
        if (v.x < minX) minX = v.x
        if (v.x > maxX) maxX = v.x
        if (v.y < minY) minY = v.y
        if (v.y > maxY) maxY = v.y
      })
    })
    return { minX, maxX, minY, maxY, width: maxX - minX, length: maxY - minY }
  }, [rooms])

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-slate-900 text-white rounded-3xl shadow-2xl select-none">
      
      {/* PANEL DE CONTROL MULTI-PORCHE Y ACABADOS */}
      <div className="w-full lg:w-80 flex flex-col gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shrink-0">
        <div>
          <span className="text-[10px] bg-yellow-500/20 text-yellow-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Cabañas de Madera Premium</span>
          <h3 className="text-base font-black tracking-tight mt-1">Configurador Libre</h3>
          <p className="text-xs text-slate-400 mt-1">🚀 <b>¡Todo solucionado!</b> Podés arrastrar los ambientes desde su centro, mover aberturas y diseñar múltiples porches alrededor.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>
            📐 Plano Plano 2D
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            🌲 Cabaña 3D Real ✨
          </button>
        </div>

        <hr className="border-slate-800" />

        {/* PROPIEDADES DINÁMICAS DEL PORCHE SELECCIONADO */}
        {activeElement.type === 'porch' ? (
          <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-900/50 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>🛠️ Configurar Porche Activo</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setPorches(prev => prev.map(p => p.id === activeElement.id ? { ...p, style: 'alero' } : p))}
                className={`p-2 text-[11px] font-bold rounded-lg border transition ${porches.find(p => p.id === activeElement.id)?.style === 'alero' ? 'bg-amber-600 border-amber-500' : 'bg-slate-900 border-slate-800'}`}
              >
                💧 Solo Alero
              </button>
              <button 
                onClick={() => setPorches(prev => prev.map(p => p.id === activeElement.id ? { ...p, style: 'pilotes' } : p))}
                className={`p-2 text-[11px] font-bold rounded-lg border transition ${porches.find(p => p.id === activeElement.id)?.style === 'pilotes' ? 'bg-amber-600 border-amber-500' : 'bg-slate-900 border-slate-800'}`}
              >
                🪵 Deck c/ Pilotes
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 text-center italic bg-slate-900/50 p-2 rounded-lg">Seleccioná o arrastrá un porche para cambiar su estilo constructivo.</p>
        )}

        <button 
          onClick={addNewPorchZone}
          className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-amber-500 text-xs font-bold rounded-xl transition text-center"
        >
          ➕ Agregar Otra Zona de Porche
        </button>

        <hr className="border-slate-800" />
        <div className="text-[11px] bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-400 space-y-1.5">
          <p className="font-bold text-slate-200">💡 Tip de diseño:</p>
          <p>• Clic izquierdo y arrastrá el interior de un ambiente o porche para reposicionarlo entero.</p>
          <p>• Hacé clic derecho sobre cualquier línea perimetral para añadirle un vértice extra.</p>
        </div>
      </div>

      {/* ÁREA DE RENDERIZADO Y PLANO */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[540px]">
        {activeTab === '2d' ? (
          <div 
            className="w-full h-full p-6 flex justify-center items-center relative overflow-auto bg-[radial-gradient(#2a251f_1.5px,transparent_1.5px)] [background-size:20px_20px]"
            onMouseMove={handleMouseMoveGlobal}
            onMouseUp={handleMouseUpGlobal}
            onMouseLeave={handleMouseUpGlobal}
          >
            <svg ref={svgRef} width="640" height="480" className="bg-slate-900/90 rounded-xl border border-slate-800 shadow-2xl overflow-visible">
              
              {/* RENDERIZADO DE PORCHES COMPLETAMENTE EDITABLES */}
              {porches.map(porch => {
                const pointsStr = porch.vertices.map(v => `${v.x * scale},${v.y * scale}`).join(' ')
                const isSelected = activeElement.type === 'porch' && activeElement.id === porch.id

                return (
                  <g key={porch.id}>
                    {/* Polígono base del porche */}
                    <polygon 
                      points={pointsStr}
                      fill={porch.style === 'pilotes' ? '#d97706' : '#0284c7'}
                      fillOpacity={isSelected ? "0.3" : "0.18"}
                      stroke={porch.style === 'pilotes' ? '#b45309' : '#0369a1'}
                      strokeWidth="3"
                      strokeDasharray="4,4"
                      className="cursor-move"
                      onMouseDown={(e) => initPorchCenterDrag(porch, e)}
                    />

                    {/* Manejo de vértices del porche */}
                    {porch.vertices.map((v, idx) => {
                      const nextV = porch.vertices[(idx + 1) % porch.vertices.length]
                      return (
                        <g key={`pv-g-${idx}`}>
                          <line x1={v.x * scale} y1={v.y * scale} x2={nextV.x * scale} y2={nextV.y * scale} stroke="transparent" strokeWidth="10" className="cursor-crosshair" onContextMenu={(e) => handleRightClickPorch(porch.id, idx, e)} />
                          <circle cx={v.x * scale} cy={v.y * scale} r="7" className="fill-amber-600 stroke-slate-950 stroke-2 cursor-move hover:fill-white" onMouseDown={(e) => initPorchVertexDrag(porch.id, idx, e)} />
                        </g>
                      )
                    })}
                  </g>
                )
              })}

              {/* RENDERIZADO DE AMBIENTES INTERNOS */}
              {rooms.map((room) => {
                const style = roomStyles[room.type] || roomStyles['Living']
                const pointsStr = room.vertices.map(v => `${v.x * scale},${v.y * scale}`).join(' ')
                const isSelected = activeElement.type === 'room' && activeElement.id === room.id

                return (
                  <g key={room.id}>
                    {/* Área central para arrastrar la habitación entera */}
                    <polygon 
                      points={pointsStr}
                      fill={style.bg}
                      fillOpacity={isSelected ? "0.9" : "0.75"}
                      stroke="#451a03"
                      strokeWidth="6"
                      className="cursor-move"
                      onMouseDown={(e) => initRoomCenterDrag(room, e)}
                    />

                    {/* Medidas de los tramos de pared */}
                    {room.vertices.map((v, idx) => {
                      const nextV = room.vertices[(idx + 1) % room.vertices.length]
                      const midX = ((v.x + nextV.x) / 2) * scale
                      const midY = ((v.y + nextV.y) / 2) * scale
                      const dist = Math.sqrt(Math.pow(nextV.x - v.x, 2) + Math.pow(nextV.y - v.y, 2))

                      return (
                        <g key={`w-info-${idx}`}>
                          {/* Línea invisible receptora de Clic Derecho */}
                          <line x1={v.x * scale} y1={v.y * scale} x2={nextV.x * scale} y2={nextV.y * scale} stroke="transparent" strokeWidth="12" className="cursor-crosshair" onContextMenu={(e) => handleRightClickWall(room.id, idx, e)} />
                          <g className="pointer-events-none">
                            <rect x={midX - 14} y={midY - 7} width="28" height="14" fill="#451a03" rx="3" />
                            <text x={midX} y={midY + 3} textAnchor="middle" fontSize="9" className="fill-amber-300 font-mono font-bold">{dist.toFixed(1)}m</text>
                          </g>
                        </g>
                      )
                    })}

                    {/* Título de habitación */}
                    {room.vertices[0] && (
                      <text x={room.vertices[0].x * scale + 15} y={room.vertices[0].y * scale + 25} fontSize="11" className="fill-stone-800 font-black pointer-events-none">{style.icon} {room.name}</text>
                    )}

                    {/* Aberturas de arrastre libre absoluto */}
                    {room.items.map(item => (
                      <g key={item.id} transform={`translate(${item.x * scale}, ${item.y * scale})`} className="cursor-move" onMouseDown={(e) => initItemDrag(room.id, item, e)}>
                        {item.type === 'puerta' ? (
                          <g>
                            <circle r="6" fill="#d84315" />
                            <line x1="0" y1="0" x2="16" y2="0" stroke="#d84315" strokeWidth="3" />
                            <path d="M 0,0 A 16,16 0 0,1 16,-16" fill="none" stroke="#d84315" strokeDasharray="2,2" />
                          </g>
                        ) : (
                          <g>
                            <rect x="-12" y="-4" width="24" height="8" fill="#0284c7" stroke="#fff" rx="2" />
                          </g>
                        )}
                      </g>
                    ))}

                    {/* Vértices del contorno estructural */}
                    {room.vertices.map((v, idx) => (
                      <circle key={`v-dot-${idx}`} cx={v.x * scale} cy={v.y * scale} r="8" className="fill-amber-500 stroke-amber-950 stroke-2 cursor-move hover:fill-white" onMouseDown={(e) => initVertexDrag(room.id, idx, e)} />
                    ))}
                  </g>
                )
              })}

            </svg>
          </div>
        ) : (
          /* VISTA 3D MEJORADA: CABAÑA DE TRONCOS, PORCHES MODULARES Y TECHO ACOPLADO */
          <div className="w-full h-[540px]">
            <Canvas camera={{ position: [boundingBox3D.minX + boundingBox3D.width/2, 10, boundingBox3D.maxY + 10], fov: 45 }} shadows>
              <color attach="background" args={['#0c0f17']} />
              <ambientLight intensity={0.7} />
              <directionalLight position={[20, 25, 15]} intensity={1.3} castShadow shadow-mapSize={[2048, 2048]} />
              
              {/* Plano de la Cabaña */}
              <group position={[0, 0, 0]}>
                
                {/* 1. MUROS DE MADERA RÚSTICA (Siguen fielmente los polígonos del plano) */}
                {rooms.map((room) => {
                  const shape = new THREE.Shape()
                  if (room.vertices.length === 0) return null
                  shape.moveTo(room.vertices[0].x, room.vertices[0].y)
                  for (let i = 1; i < room.vertices.length; i++) {
                    shape.lineTo(room.vertices[i].x, room.vertices[i].y)
                  }
                  shape.closePath()

                  return (
                    <group key={`3d-room-${room.id}`}>
                      <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                        <extrudeGeometry args={[shape, { depth: 2.4, bevelEnabled: false }]} />
                        {/* Tono marrón leño acanalado */}
                        <meshStandardMaterial color="#5c2e0b" roughness={0.75} side={THREE.DoubleSide} />
                      </mesh>

                      {/* Aberturas integradas en sus coordenadas exactas */}
                      {room.items.map(item => (
                        <mesh key={`3d-item-${item.id}`} position={[item.x, 1.1, item.y]} castShadow>
                          <boxGeometry args={[item.type === 'puerta' ? 0.85 : 1.3, item.type === 'puerta' ? 2.0 : 1.1, 0.3]} />
                          <meshStandardMaterial color={item.type === 'puerta' ? '#7c2d12' : '#93c5fd'} metalness={item.type === 'puerta' ? 0.1 : 0.6} roughness={0.2} />
                        </mesh>
                      ))}
                    </group>
                  )
                })}

                {/* 2. TECHO DINÁMICO A DOS AGUAS: Se adapta a los límites reales de la casa */}
                <group position={[0, 2.4, 0]}>
                  {/* Ala Izquierda del Techo de Chapa */}
                  <mesh 
                    position={[boundingBox3D.minX + boundingBox3D.width / 4, boundingBox3D.length * 0.15, boundingBox3D.minY + boundingBox3D.length / 2]} 
                    rotation={[0, 0, 0.4]} 
                    castShadow
                  >
                    <boxGeometry args={[boundingBox3D.width / 1.6, 0.08, boundingBox3D.length + 0.6]} />
                    <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} title="Chapa Acanalada" />
                  </mesh>

                  {/* Ala Derecha del Techo de Chapa */}
                  <mesh 
                    position={[boundingBox3D.maxX - boundingBox3D.width / 4, boundingBox3D.length * 0.15, boundingBox3D.minY + boundingBox3D.length / 2]} 
                    rotation={[0, 0, -0.4]} 
                    castShadow
                  >
                    <boxGeometry args={[boundingBox3D.width / 1.6, 0.08, boundingBox3D.length + 0.6]} />
                    <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
                  </mesh>
                </group>

                {/* 3. PORCHES PERMANENTES Y EDITABLES ALREDEDOR DE LA CASA */}
                {porches.map(porch => {
                  const shape = new THREE.Shape()
                  if (porch.vertices.length === 0) return null
                  shape.moveTo(porch.vertices[0].x, porch.vertices[0].y)
                  for (let i = 1; i < porch.vertices.length; i++) {
                    shape.lineTo(porch.vertices[i].x, porch.vertices[i].y)
                  }
                  shape.closePath()

                  // Busquemos el centro y dimensiones aproximadas del porche para los pilotes
                  let pMinX = 999, pMaxX = -999, pMinY = 999, pMaxY = -999
                  porch.vertices.forEach(v => {
                    if (v.x < pMinX) pMinX = v.x; if (v.x > pMaxX) pMaxX = v.x
                    if (v.y < pMinY) pMinY = v.y; if (v.y > pMaxY) pMaxY = v.y
                  })

                  return (
                    <group key={`3d-porch-${porch.id}`}>
                      {/* Si el cliente eligió 'pilotes', se renderiza el piso/deck de madera sobreelevado */}
                      {porch.style === 'pilotes' && (
                        <>
                          {/* Deck de Madera */}
                          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} receiveShadow>
                            <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
                            <meshStandardMaterial color="#a16207" roughness={0.6} />
                          </mesh>
                          {/* Pilotes de madera de soporte (esquinas básicas) */}
                          <mesh position={[pMinX + 0.2, 0.05, pMinY + 0.2]} castShadow><cylinderGeometry args={[0.08, 0.08, 0.2]} /><meshStandardMaterial color="#451a03" /></mesh>
                          <mesh position={[pMaxX - 0.2, 0.05, pMinY + 0.2]} castShadow><cylinderGeometry args={[0.08, 0.08, 0.2]} /><meshStandardMaterial color="#451a03" /></mesh>
                          <mesh position={[pMinX + 0.2, 0.05, pMaxY - 0.2]} castShadow><cylinderGeometry args={[0.08, 0.08, 0.2]} /><meshStandardMaterial color="#451a03" /></mesh>
                          <mesh position={[pMaxX - 0.2, 0.05, pMaxY - 0.2]} castShadow><cylinderGeometry args={[0.08, 0.08, 0.2]} /><meshStandardMaterial color="#451a03" /></mesh>

                          {/* Columnas altas que sostienen el techo de la galería */}
                          <mesh position={[pMinX + 0.2, 1.2, pMaxY - 0.2]} castShadow><cylinderGeometry args={[0.06, 0.06, 2.2]} /><meshStandardMaterial color="#451a03" /></mesh>
                          <mesh position={[pMaxX - 0.2, 1.2, pMaxY - 0.2]} castShadow><cylinderGeometry args={[0.06, 0.06, 2.2]} /><meshStandardMaterial color="#451a03" /></mesh>
                        </>
                      )}

                      {/* Alero Superior (Presente en ambos estilos: alero simple y deck con pilotes) */}
                      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.35, 0]} castShadow>
                        <extrudeGeometry args={[shape, { depth: 0.06, bevelEnabled: false }]} />
                        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
                      </mesh>
                    </group>
                  )
                })}

              </group>

              <Grid position={[0, -0.01, 0]} args={[40, 40]} cellColor="#1e293b" sectionColor="#475569" fadeDistance={25} />
              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  )
}
