import React from 'react'
import { useInventoryStore } from '../store/inventory'

export const Shelf2DView: React.FC = () => {
  const selectedShelfId = useInventoryStore(s => s.selectedShelfId)
  const items = useInventoryStore(s => (selectedShelfId ? s.getInventoryForShelf(selectedShelfId) : []))
  const total = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div>
      <h2>2D View</h2>
      {selectedShelfId ? (
        <p data-testid="view-2d-total">Total items on shelf: {total}</p>
      ) : (
        <p>Select a shelf to view</p>
      )}
    </div>
  )
}
