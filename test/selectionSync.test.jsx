import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useWarehouseStore } from '../src/store/warehouseStore.js'

function ShelfMeshesDom() {
  const shelves = useWarehouseStore(s => s.shelves)
  const selectedId = useWarehouseStore(s => s.selectedShelfId)
  const select = useWarehouseStore(s => s.selectShelf)

  return (
    <div>
      {shelves.map(s => (
        <div
          key={s.id}
          role="button"
          data-testid={`shelf-${s.id}`}
          data-selected={s.id === selectedId || undefined}
          onPointerDown={() => select(s.id)}
        >
          {s.id}
        </div>
      ))}
    </div>
  )
}

describe('3D selection synchronization (store <-> view)', () => {
  beforeEach(() => {
    const initial = [
      { id: 'A1', x: 0, y: 0, w: 1, h: 1, d: 1 },
      { id: 'B2', x: 2, y: 1, w: 1, h: 1, d: 1 }
    ]
    useWarehouseStore.setState({ shelves: initial, selectedShelfId: null })
  })

  it('selects shelf on pointer event and reflects attribute', async () => {
    const { container } = render(<ShelfMeshesDom />)
    const a1 = screen.getByTestId('shelf-A1')
    expect(a1).not.toHaveAttribute('data-selected')

    fireEvent.pointerDown(a1)

    await waitFor(() => expect(useWarehouseStore.getState().selectedShelfId).toBe('A1'))
    await waitFor(() => expect(a1).toHaveAttribute('data-selected'))

    expect(container).toMatchSnapshot()
  })

  it('updates view when selection changes in store', async () => {
    render(<ShelfMeshesDom />)
    const b2 = screen.getByTestId('shelf-B2')

    useWarehouseStore.getState().selectShelf('B2')

    await waitFor(() => expect(b2).toHaveAttribute('data-selected'))
  })

  it('updates shelf position/size through store mappers', async () => {
    const id = 'A1'
    useWarehouseStore.getState().updateShelfPosition(id, [5, 10, -3])
    useWarehouseStore.getState().updateShelfSize(id, [2, 3, 1])
    const shelf = useWarehouseStore.getState().shelves.find(s => s.id === id)
    expect(shelf).toMatchObject({ x: 5, y: -3, w: 2, h: 3, d: 1 })
  })
})
