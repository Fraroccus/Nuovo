import React from 'react'
import { ShelfList } from './ShelfList'
import { ShelfDetailPanel } from './ShelfDetailPanel'
import { Shelf2DView } from './Shelf2DView'
import { Shelf3DView } from './Shelf3DView'
import { useInventoryStore } from '../store/inventory'

const App: React.FC = () => {
  const selectedShelfId = useInventoryStore(s => s.selectedShelfId)
  const selectShelf = useInventoryStore(s => s.selectShelf)
  return (
    <div className="app">
      <header>
        <h1>Warehouse Shelves</h1>
      </header>
      <main className="layout">
        <section aria-label="Shelf list" className="panel">
          <ShelfList onSelect={selectShelf} selectedId={selectedShelfId} />
        </section>
        <section aria-label="2D view" className="panel">
          <Shelf2DView />
        </section>
        <section aria-label="3D view" className="panel">
          <Shelf3DView />
        </section>
      </main>

      <ShelfDetailPanel />
    </div>
  )
}

export default App
