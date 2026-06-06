'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Sky, Center } from '@react-three/drei'
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

const ROOM_TEMPLATES = {
  Living: { name: 'Living Cocina', color: '#fef08a', stroke: '#a16207', icon: '🛋️🍳' },
  Dormitorio: { name: 'Dormitorio', color: '#bfdbfe', stroke: '#1e40af', icon: '🛏️' },
  Baño: { name: 'Baño Completo', color: '#fbcfe8', stroke: '#9d174d', icon: '🚽' },
}

export default function InteractiveFloorPlan({ options }: { options?: any }) {

  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d')
  const [selectedTarget, setSelectedTarget] = useState<{ type: 'room' | 'porch'; id: string }>({ type: 'room', id: 'r1' })

  // Ambientes iniciales moldeables con nodos
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 'r1',
      name: 'Espacio Principal',
      type: 'Living',
      vertices: [{ x: 2, y: 2 }, { x: 7, y: 2 }, { x: 7, y: 6 }, { x: 2, y: 6 }],
      items: [
        { id: 'p1', type: 'puerta', x: 4.5, y: 6 },
        { id: 'v1', type: 'ventana', x: 7, y: 4 }
      ]
    }
  ])

  // Cajas de texto editables
  const [inputWidth, setInputWidth] = useState<string>('5.0')
  const [inputLength, setInputLength] = useState<string>('4.0')

  const [dragInfo, setDragInfo] = useState<{
    type: 'vertex' | 'room-center' | 'porch-vertex' | 'porch-center' | 'item'
    id: string
    index?: number
    itemId?: string
    startX?: number
    startY?: number
    originalVertices?: Point2D[]
    originalItemPos?: { x: number; y: number }
  } | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 40

  // --- 📐 CALCULADORA DE BBOX PARA TRANSFORMAR EN METROS REALES ---
  const activeStructureData = useMemo(() => {
    if (selectedTarget.type === 'room') {
      const room = rooms.find(r => r.id === selectedTarget.id)
      if (!room || room.vertices.length === 0) return null
      const xs = room.vertices.map(v => v.x), ys = room.vertices.map(v => v.y)
      const minX = Math.min(...xs), maxX = Math.max(...xs)
      const minY = Math.min(...ys), maxY = Math.max(...ys)
      return { name: room.name, width: maxX - minX, length: maxY - minY, minX, minY }
    } else return null
  }, [selectedTarget, rooms])

  useEffect(() => {
    if (activeStructureData) {
      setInputWidth(activeStructureData.width.toFixed(1))
      setInputLength(activeStructureData.length.toFixed(1))
    }
  }, [selectedTarget, activeStructureData])

  // --- 🔄 APLICAR CAMBIOS DESDE LAS CAJAS DE TEXTO MANUALES ---
  const applyManualDimension = (field: 'width' | 'length', valStr: string) => {
    const newSize = parseFloat(valStr)
    if (!newSize || newSize <= 0.5 || !activeStructureData) return
    const { minX, minY, width: currentW, length: currentL } = activeStructureData

    setRooms(prev => prev.map(r => {
      if (r.id !== selectedTarget.id) return r
      return {
        ...r,
        vertices: r.vertices.map(v => {
          if (field === 'width') {
            const relX = (v.x - minX) / currentW
            return { ...v, x: Math.round((minX + relX * newSize) * 10) / 10 }
          } else {
            const relY = (v.y - minY) / currentL
            return { ...v, y: Math.round((minY + relY * newSize) * 10) / 10 }
          }
        })
      }
    }))
  }

  // --- 🛒 INSERTAR NUEVOS MÓDULOS ---
  const handleAddRoom = (type: 'Living' | 'Dormitorio' | 'Baño') => {
    const id = `r-${Date.now()}`
    const template = ROOM_TEMPLATES[type]
    const offset = rooms.length * 1.2
    const newRoom: Room = {
      id,
      name: `${template.name} ${rooms.length + 1}`,
      type,
      vertices: [
        { x: 3 + offset, y: 2 + offset },
        { x: 7 + offset, y: 2 + offset },
        { x: 7 + offset, y: 6 + offset },
        { x: 3 + offset, y: 6 + offset }
      ],
      items: [{ id: `w-${Date.now()}`, type: 'ventana', x: 5 + offset, y: 2 + offset }]
    }
    setRooms([...rooms, newRoom])
    setSelectedTarget({ type: 'room', id })
  }

  // --- 🖱️ MOTOR DRAG MOUSE GLOBAL CAD ---
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (!dragInfo || !svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const mX = (e.clientX - rect.left) / scale
      const mY = (e.clientY - rect.top) / scale
      const snap = (v: number) => Math.round(v * 10) / 10

      if (dragInfo.type === 'vertex') {
        setRooms(prev => prev.map(r => {
          if (r.id !== dragInfo.id) return r
          const nv = [...r.vertices]
          nv[dragInfo.index!] = { x: snap(mX), y: snap(mY) }
          return { ...r, vertices: nv }
        }))
      }
      else if (dragInfo.type === 'room-center' && dragInfo.startX && dragInfo.startY && dragInfo.originalVertices) {
        const dx = mX - dragInfo.startX
        const dy = mY - dragInfo.startY
        setRooms(prev => prev.map(r => r.id === dragInfo.id ? {
          ...r, vertices: dragInfo.originalVertices!.map(v => ({ x: snap(v.x + dx), y: snap(v.y + dy) }))
        } : r))
      }
    }
    const handleGlobalUp = () => setDragInfo(null)
    if (dragInfo) {
      window.addEventListener('mousemove', handleGlobalMove)
      window.addEventListener('mouseup', handleGlobalUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove)
      window.removeEventListener('mouseup', handleGlobalUp)
    }
  }, [dragInfo])

  const globalBounds = useMemo(() => {
    if (rooms.length === 0) return { w: 1, l: 1, cx: 0, cy: 0 }
    let minX = 999, maxX = -999, minY = 999, maxY = -999
    rooms.forEach(r => r.vertices.forEach(v => {
      if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x
      if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y
    }))
    return { w: maxX - minX, l: maxY - minY, cx: minX + (maxX - minX)/2, cy: minY + (maxY - minY)/2 }
  }, [rooms])

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-6 bg-slate-900 text-white rounded-3xl shadow-2xl select-none">
      
      {/* 🛠️ PANEL IZQUIERDO UNIFICADO DE ARQUITECTURA */}
      <div className="w-full xl:w-85 flex flex-col gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shrink-0">
        <div>
          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Estudio de Cabañas Realista</span>
          <h2 className="text-lg font-black tracking-tight mt-1">Configurador CAD Profesional</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('2d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '2d' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>
            📐 Plano Plano 2D
          </button>
          <button onClick={() => setActiveTab('3d')} className={`py-2 rounded-lg font-bold text-xs transition ${activeTab === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            🪵 Render Vivo 3D ✨
          </button>
        </div>

        <hr className="border-slate-800" />

        {/* 🟩 FORMULARIO CON INPUTS NUMÉRICOS REALES */}
        {activeStructureData && (
          <div className="p-4 bg-slate-900 rounded-xl border-2 border-amber-500/30 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">✏️ Editar Módulo Seleccionado:</p>
              <input 
                type="text"
                value={rooms.find(r => r.id === selectedTarget.id)?.name || ''}
                onChange={(e) => setRooms(prev => prev.map(r => r.id === selectedTarget.id ? { ...r, name: e.target.value } : r))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-bold">Ancho (Frente):</label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 transition">
                  <input 
                    type="number" step="0.1" min="1"
                    value={inputWidth} 
                    onChange={(e) => setInputWidth(e.target.value)}
                    onBlur={() => applyManualDimension('width', inputWidth)}
                    className="w-full bg-transparent text-sm font-mono font-bold text-white outline-none"
                  />
                  <span className="text-xs text-slate-500 font-mono">m</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-bold">Largo (Fondo):</label>
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 transition">
                  <input 
                    type="number" step="0.1" min="1"
                    value={inputLength} 
                    onChange={(e) => setInputLength(e.target.value)}
                    onBlur={() => applyManualDimension('length', inputLength)}
                    className="w-full bg-transparent text-sm font-mono font-bold text-white outline-none"
                  />
                  <span className="text-xs text-slate-500 font-mono">m</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">🔨 Catálogo Constructivo:</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleAddRoom('Living')} className="bg-amber-950/40 border border-amber-800 p-2 rounded-xl text-xs font-bold transition hover:bg-amber-900">
              🛋️ + Living/Cocina
            </button>
            <button onClick={() => handleAddRoom('Dormitorio')} className="bg-blue-950/40 border border-blue-800 p-2 rounded-xl text-xs font-bold transition hover:bg-blue-900">
              🛏️ + Dormitorio
            </button>
            <button onClick={() => handleAddRoom('Baño')} className="bg-pink-950/40 border border-pink-800 p-2 rounded-xl text-xs font-bold transition hover:bg-pink-900">
              🚽 + Baño Sanitario
            </button>
          </div>
        </div>
      </div>

      {/* 🖥️ ÁREA DE TRABAJO */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[560px]">
        {activeTab === '2d' ? (
          <div className="w-full h-full flex justify-center items-center bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:20px_20px]">
            <svg ref={svgRef} width="660" height="500" className="bg-slate-900 rounded-xl border border-slate-800 overflow-visible">
              {rooms.map(room => {
                const pointsStr = room.vertices.map(v => `${v.x * scale},${v.y * scale}`).join(' ')
                const isSel = selectedTarget.type === 'room' && selectedTarget.id === room.id
                const template = ROOM_TEMPLATES[room.type] || ROOM_TEMPLATES['Living']

                return (
                  <g key={room.id}>
                    <polygon 
                      points={pointsStr} fill={template.color} fillOpacity={isSel ? "0.95" : "0.75"} stroke="#451a03" strokeWidth="5" strokeLinejoin="round" className="cursor-move"
                      onMouseDown={(e) => {
                        if (!svgRef.current) return
                        const rect = svgRef.current.getBoundingClientRect()
                        setDragInfo({
                          type: 'room-center', id: room.id,
                          startX: (e.clientX - rect.left)/scale, startY: (e.clientY - rect.top)/scale,
                          originalVertices: JSON.parse(JSON.stringify(room.vertices))
                        })
                        setSelectedTarget({ type: 'room', id: room.id })
                      }}
                    />
                    <text x={room.vertices[0].x * scale + 12} y={room.vertices[0].y * scale + 24} fontSize="11" className="fill-stone-900 font-black pointer-events-none">{template.icon} {room.name}</text>
                    {room.vertices.map((v, idx) => (
                      <circle key={`dot-${room.id}-${idx}`} cx={v.x * scale} cy={v.y * scale} r="7.5" className="fill-amber-500 stroke-slate-950 stroke-2 cursor-move hover:fill-white"
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setDragInfo({ type: 'vertex', id: room.id, index: idx }); setSelectedTarget({ type: 'room', id: room.id }) }}
                      />
                    ))}
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          /* ☀️ RENDER 3D PROFESIONAL CON TECHOS DE CHAPA Y PILOTES */
          <div className="w-full h-[560px] relative">
            <Canvas camera={{ position: [globalBounds.cx, 10, globalBounds.cy + 10], fov: 40 }} shadows>
              <color attach="background" args={['#e0f2fe']} />
              <Sky sunPosition={[100, 150, 100]} inclination={0.6} elevation={45} />
              <ambientLight intensity={0.9} />
              <directionalLight position={[25, 35, 20]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]} />
              
              <Center>
                {rooms.map(room => {
                  const shape = new THREE.Shape()
                  if (room.vertices.length === 0) return null
                  shape.moveTo(room.vertices[0].x, room.vertices[0].y)
                  for (let i = 1; i < room.vertices.length; i++) shape.lineTo(room.vertices[i].x, room.vertices[i].y)
                  shape.closePath()

                  return (
                    <group key={`3d-r-${room.id}`}>
                      {/* MUROS DE MADERA RÚSTICA SOBREELEVADOS */}
                      <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
                        <extrudeGeometry args={[shape, { depth: 2.3, bevelEnabled: false }]} />
                        <meshStandardMaterial color="#7c2d12" roughness={0.75} side={THREE.DoubleSide} />
                      </mesh>
                    </group>
                  )
                })}

                {/* PILOTES DE BASE DE CIMENTACIÓN */}
                {rooms.map(room => room.vertices.map((v, idx) => (
                  <mesh key={`3d-p-${room.id}-${idx}`} position={[v.x, 0.1, v.y]} castShadow>
                    <cylinderGeometry args={[0.1, 0.12, 0.2]} />
                    <meshStandardMaterial color="#2d1606" />
                  </mesh>
                )))}

                {/* TECHO UNIFICADO DE CHAPA ACERADA */}
                <group position={[globalBounds.cx, 2.5, globalBounds.cy]}>
                  <mesh position={[-globalBounds.w / 4, globalBounds.w * 0.11, 0]} rotation={[0, 0, 0.36]} castShadow>
                    <boxGeometry args={[globalBounds.w / 1.55, 0.06, globalBounds.l + 0.6]} />
                    <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
                  </mesh>
                  <mesh position={[globalBounds.w / 4, globalBounds.w * 0.11, 0]} rotation={[0, 0, -0.36]} castShadow>
                    <boxGeometry args={[globalBounds.w / 1.55, 0.06, globalBounds.l + 0.6]} />
                    <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
                  </mesh>
                </group>
              </Center>

              <Grid position={[0, -0.01, 0]} args={[50, 50]} cellColor="#cbd5e1" sectionColor="#94a3b8" fadeDistance={30} />
              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>
        )}
      </div>
    </div>
  )
}
