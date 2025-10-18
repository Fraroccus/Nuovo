import React, { useMemo } from 'react'
import { Edges } from '@react-three/drei'

export default React.memo(function Shelf({ shelf, selected, onSelect }) {
  const size = useMemo(() => [shelf.w, shelf.h, shelf.d], [shelf.w, shelf.h, shelf.d])
  const pos = useMemo(() => [shelf.x, shelf.h / 2, shelf.y], [shelf.x, shelf.h, shelf.y])

  return (
    <group position={pos}>
      <mesh
        userData={{ id: shelf.id }}
        castShadow
        receiveShadow
        frustumCulled
        onPointerDown={(e) => { e.stopPropagation(); onSelect?.(shelf.id) }}
        data-shelf-id={shelf.id}
        data-selected={selected || undefined}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial color={selected ? '#f59e0b' : '#60a5fa'} metalness={0.1} roughness={0.6} />
        {selected && <Edges linewidth={2} renderOrder={1}>
          <lineBasicMaterial color="black" />
        </Edges>}
      </mesh>
    </group>
  )
})
