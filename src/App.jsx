import React from 'react'
import WarehouseCanvas from './components/WarehouseCanvas.jsx'
import { useWarehouseStore } from './store/warehouseStore.js'

export default function App() {
  const selected = useWarehouseStore(s => s.selectedShelfId)
  const mode = useWarehouseStore(s => s.transformMode)
  const setMode = useWarehouseStore(s => s.setTransformMode)
  const clearSelection = useWarehouseStore(s => s.clearSelection)

  return (
    <div className="app">
      <div className="toolbar">
        <button
          onClick={() => setMode('translate')}
          aria-pressed={mode === 'translate'}
          title="Translate (T)"
        >Translate</button>
        <button
          onClick={() => setMode('scale')}
          aria-pressed={mode === 'scale'}
          title="Scale (S)"
        >Scale</button>
        <button onClick={clearSelection} title="Clear selection (Esc)">Clear</button>
        <span style={{marginLeft: 'auto', color: '#71717a'}}>Selected: {selected ?? 'none'}</span>
      </div>
      <div className="canvas-wrap">
        <WarehouseCanvas />
        <div className="status">3D Warehouse</div>
      </div>
    </div>
  )
}
