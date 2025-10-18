import React from 'react'
import { useInventoryStore } from '../store/inventory'

export const ShelfList: React.FC<{ onSelect: (id: string) => void; selectedId?: string | null }> = ({ onSelect, selectedId }) => {
  const shelves = useInventoryStore(s => s.shelves)
  return (
    <div>
      <h2 id="shelf-list-heading">Shelves</h2>
      <ul aria-labelledby="shelf-list-heading">
        {shelves.map(shelf => (
          <li key={shelf.id}>
            <button
              type="button"
              aria-pressed={selectedId === shelf.id}
              onClick={() => onSelect(shelf.id)}
            >
              {shelf.name} — {shelf.location}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
