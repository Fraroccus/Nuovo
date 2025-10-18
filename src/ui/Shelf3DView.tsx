import React from 'react'
import { useInventoryStore } from '../store/inventory'

export const Shelf3DView: React.FC = () => {
  const selectedShelfId = useInventoryStore(s => s.selectedShelfId)
  const items = useInventoryStore(s => (selectedShelfId ? s.getInventoryForShelf(selectedShelfId) : []))
  const skus = items.map(i => i.sku).join(', ')

  return (
    <div>
      <h2>3D View</h2>
      {selectedShelfId ? (
        <p data-testid="view-3d-skus">SKUs present: {skus || 'none'}</p>
      ) : (
        <p>Select a shelf to view</p>
      )}
    </div>
  )
}
