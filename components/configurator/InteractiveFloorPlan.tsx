'use client'

import React, { useState, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Center, Environment } from '@react-three/drei'
import * as THREE from 'three'

// --- Tipos ---
interface Point { x: number; y: number }
interface Wall { id: string; start: Point; end: Point }

export default function InteractiveFloorPlan() {
  const [walls, setWalls] = useState<Wall[]>([])
  const [activePoint, setActivePoint] = useState<Point | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const scale = 50

  // Lógica para dibujar paredes
  const handleSvgClick = (e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.round((e.clientX - rect.left) / scale)
    const y = Math.round((e.clientY - rect.top) / scale)

    if (activePoint) {
      setWalls([...walls, { id: Date.now().toString(), start: activePoint, end: { x, y } }])
      setActivePoint(null)
    } else {
      setActivePoint({ x, y })
    }
  }

  // --- Cálculos de Estructura ---
  const bounds = useMemo(() => {
    if (walls.length === 0) return { cx: 0, cy: 0, w: 2, l: 2 }
    const xs = walls.flatMap(w => [w.start.x, w.end.x])
    const ys = walls.flatMap(w => [w.start.y, w.end.y])
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX || 2, l: maxY - minY || 2 }
  }, [walls])

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-4">
      {/* 2D EDITOR */}
      <div className="flex-1 bg-slate-50 rounded-3xl border-2 border-slate-200 overflow-hidden shadow-inner">
        <svg ref={svgRef} width="100%" height="500" onClick={handleSvgClick} className="cursor-crosshair bg-white">
          <defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f1f5f9" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {walls.map(w => (
            <line key={w.id} x1={w.start.x * scale} y1={w.start.y * scale} x2={w.end.x * scale} y2={w.end.y * scale} stroke="#334155" strokeWidth="8" strokeLinecap="round" />
          ))}
          {activePoint && <circle cx={activePoint.x * scale} cy={activePoint.y * scale} r="6" fill="#10b981" />}
        </svg>
      </div>

      {/* 3D RENDERER */}
      <div className="flex-[1.5] h-[500px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        <Canvas camera={{ position: [bounds.cx + 5, 8, bounds.cy + 5] }}>
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
          
          <Center>
            {/* Pilotes */}
            {[-bounds.w/2, bounds.w/2].map(x => [-bounds.l/2, bounds.l/2].map(z => (
              <mesh key={`${x}-${z}`} position={[bounds.cx + x, -0.5, bounds.cy + z]}>
                <cylinderGeometry args={[0.2, 0.2, 1]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            )))}

            {/* Suelo */}
            <mesh position={[bounds.cx, 0, bounds.cy]}>
              <boxGeometry args={[bounds.w + 0.5, 0.2, bounds.l + 0.5]} />
              <meshStandardMaterial color="#d4d4d8" />
            </mesh>

            {/* Paredes */}
            {walls.map(w => {
              const len = Math.sqrt((w.end.x - w.start.x)**2 + (w.end.y - w.start.y)**2)
              const angle = Math.atan2(w.end.y - w.start.y, w.end.x - w.start.x)
              return (
                <mesh key={w.id} position={[(w.start.x + w.end.x)/2, 1.3, (w.start.y + w.end.y)/2]} rotation={[0, -angle, 0]}>
                  <boxGeometry args={[len, 2.5, 0.2]} />
                  <meshStandardMaterial color="#e2e8f0" />
                </mesh>
              )
            })}

            {/* Techo */}
            <mesh position={[bounds.cx, 2.8, bounds.cy]} rotation={[0, 0, 0.1]}>
              <boxGeometry args={[bounds.w + 1.2, 0.3, bounds.l + 1.2]} />
              <meshStandardMaterial color="#3f3f46" />
            </mesh>
          </Center>
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  )
}
