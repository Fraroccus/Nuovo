import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'
import { useInventoryStore } from '../store/inventory'

function resetStore() {
  const initial = useInventoryStore.getState().shelves
  useInventoryStore.setState({ shelves: JSON.parse(JSON.stringify(initial)), selectedShelfId: null })
}

describe('inventory store operations', () => {
  beforeEach(() => {
    // reset shelf selection and rehydrate initial shelves
    const state = useInventoryStore.getState()
    useInventoryStore.setState({ shelves: state.shelves, selectedShelfId: null })
  })

  it('adds items and notifies listeners', () => {
    const events: Array<{ shelfId: string; items: any[] }> = []
    const unsub = useInventoryStore.getState().onInventoryChange(p => events.push(p))

    act(() => {
      useInventoryStore.getState().addItem('s2', { sku: 'X', name: 'Thing', quantity: 2 })
    })

    expect(useInventoryStore.getState().getInventoryForShelf('s2')).toEqual([
      { sku: 'X', name: 'Thing', quantity: 2 }
    ])
    expect(events.at(-1)).toEqual({ shelfId: 's2', items: [{ sku: 'X', name: 'Thing', quantity: 2 }] })
    unsub()
  })

  it('adjusts and checks out items, syncing views via listener events', () => {
    const events: Array<{ shelfId: string; items: any[] }> = []
    const unsub = useInventoryStore.getState().onInventoryChange(p => events.push(p))

    act(() => {
      useInventoryStore.getState().adjustQuantity('s1', 'SKU-001', 5)
    })

    const bolts = useInventoryStore.getState().getInventoryForShelf('s1').find(i => i.sku === 'SKU-001')!
    expect(bolts.quantity).toBe(15)

    act(() => {
      useInventoryStore.getState().checkoutItem('s1', 'SKU-001', 7)
    })

    const bolts2 = useInventoryStore.getState().getInventoryForShelf('s1').find(i => i.sku === 'SKU-001')!
    expect(bolts2.quantity).toBe(8)

    // last event should carry latest items for s1
    expect(events.at(-1)?.shelfId).toBe('s1')
    const items = events.at(-1)?.items
    expect(items?.find(i => i.sku === 'SKU-001')?.quantity).toBe(8)
    unsub()
  })

  it('removes item', () => {
    act(() => {
      useInventoryStore.getState().removeItem('s1', 'SKU-002')
    })

    const items = useInventoryStore.getState().getInventoryForShelf('s1')
    expect(items.find(i => i.sku === 'SKU-002')).toBeUndefined()
  })
})
