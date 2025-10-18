import React, { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, TransformControls, StatsGl } from '@react-three/drei'
import Shelf from './Shelf.jsx'
import { useWarehouseStore } from '../store/warehouseStore.js'

function Shelves() {
  const shelves = useWarehouseStore(s => s.shelves)
  const selectedId = useWarehouseStore(s => s.selectedShelfId)
  const select = useWarehouseStore(s => s.selectShelf)

  const items = useMemo(() => shelves, [shelves])

  return items.map(shelf => (
    <Shelf key={shelf.id} shelf={shelf} selected={shelf.id === selectedId} onSelect={select} />
  ))
}

function SelectionTransform() {
  const selectedId = useWarehouseStore(s => s.selectedShelfId)
  const mode = useWarehouseStore(s => s.transformMode)
  const shelves = useWarehouseStore(s => s.shelves)
  const updatePos = useWarehouseStore(s => s.updateShelfPosition)
  const updateSize = useWarehouseStore(s => s.updateShelfSize)

  const meshRef = useRef()
  const controlRef = useRef()
  const base = useRef({ pos: [0,0,0], size: [1,1,1], scale: [1,1,1] })

  const selectedShelf = useMemo(() => shelves.find(s => s.id === selectedId), [shelves, selectedId])

  useEffect(() => {
    if (selectedShelf && meshRef.current) {
      // sync mesh to store
      const [x, y, z] = [selectedShelf.x, selectedShelf.h/2, selectedShelf.y]
      meshRef.current.position.set(x, y, z)
      meshRef.current.scale.set(1,1,1)
    }
  }, [selectedShelf])

  useEffect(() => {
    const controls = controlRef.current
    if (!controls) return
    const onMouseDown = () => {
      if (!meshRef.current || !selectedShelf) return
      base.current = {
        pos: [meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z],
        size: [selectedShelf.w, selectedShelf.h, selectedShelf.d],
        scale: [meshRef.current.scale.x, meshRef.current.scale.y, meshRef.current.scale.z]
      }
    }
    controls.addEventListener('mouseDown', onMouseDown)
    return () => controls.removeEventListener('mouseDown', onMouseDown)
  }, [selectedShelf])

  const onObjectChange = () => {
    if (!meshRef.current || !selectedShelf) return
    if (mode === 'translate') {
      updatePos(selectedShelf.id, [meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z])
    } else if (mode === 'scale') {
      const bs = base.current
      const sx = meshRef.current.scale.x / (bs.scale[0] || 1)
      const sy = meshRef.current.scale.y / (bs.scale[1] || 1)
      const sz = meshRef.current.scale.z / (bs.scale[2] || 1)
      const newSize = [Math.max(0.1, bs.size[0] * sx), Math.max(0.1, bs.size[1] * sy), Math.max(0.1, bs.size[2] * sz)]
      updateSize(selectedShelf.id, newSize)
    }
  }

  if (!selectedShelf) return null

  return (
    <TransformControls
      ref={controlRef}
      mode={mode}
      showX
      showY
      showZ
      onObjectChange={onObjectChange}
    >
      <group ref={meshRef}>
        <mesh visible={false}>
          <boxGeometry args={[selectedShelf.w, selectedShelf.h, selectedShelf.d]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </TransformControls>
  )
}

function Scene() {
  const clear = useWarehouseStore(s => s.clearSelection)
  useFrame((_s, _d) => {})

  useEffect(() => {
    const onKey = (e) => {
      const setMode = useWarehouseStore.getState().setTransformMode
      if (e.key.toLowerCase() === 't') setMode('translate')
      if (e.key.toLowerCase() === 's') setMode('scale')
      if (e.key === 'Escape') clear()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clear])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

      <gridHelper args={[50, 50, '#94a3b8', '#e2e8f0']} position={[0, 0.001, 0]} />
      <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow onPointerDown={(e) => { e.stopPropagation(); clear() }}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      <Suspense fallback={null}>
        <Shelves />
      </Suspense>
      <SelectionTransform />
      <OrbitControls makeDefault enableDamping target={[0, 0.5, 0]} />
      <StatsGl showPanel={0} className="stats"/>
    </>
  )
}

export default function WarehouseCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [6, 6, 6], fov: 50, near: 0.1, far: 200 }}
      dpr={[1, Math.min(2, window.devicePixelRatio || 2)]}
      frameloop="demand"
      onPointerMissed={(e) => { if (e.type === 'click') useWarehouseStore.getState().clearSelection() }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene />
    </Canvas>
  )
}
