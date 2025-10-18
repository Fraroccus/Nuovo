import { create } from 'zustand'

export type InventoryItem = {
  sku: string
  name: string
  quantity: number
}

export type Shelf = {
  id: string
  name: string
  location: string
  items: InventoryItem[]
}

export type InventoryListener = (payload: { shelfId: string; items: InventoryItem[] }) => void

export type InventoryStore = {
  shelves: Shelf[]
  selectedShelfId: string | null
  selectShelf: (id: string | null) => void
  getInventoryForShelf: (id: string) => InventoryItem[]
  addItem: (shelfId: string, item: InventoryItem) => void
  removeItem: (shelfId: string, sku: string) => void
  checkoutItem: (shelfId: string, sku: string, quantity: number) => void
  adjustQuantity: (shelfId: string, sku: string, delta: number) => void
  onInventoryChange: (listener: InventoryListener) => () => void
}

const initialShelves: Shelf[] = [
  {
    id: 's1',
    name: 'Shelf A',
    location: 'Aisle 1',
    items: [
      { sku: 'SKU-001', name: 'Bolts', quantity: 10 },
      { sku: 'SKU-002', name: 'Nuts', quantity: 5 }
    ]
  },
  {
    id: 's2',
    name: 'Shelf B',
    location: 'Aisle 2',
    items: []
  }
]

const listeners = new Set<InventoryListener>()

function emitInventoryChange(shelfId: string, items: InventoryItem[]) {
  for (const l of listeners) l({ shelfId, items })
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  shelves: initialShelves,
  selectedShelfId: null,
  selectShelf: id => set({ selectedShelfId: id }),
  getInventoryForShelf: id => get().shelves.find(s => s.id === id)?.items ?? [],
  addItem: (shelfId, item) => set(state => {
    const shelves = state.shelves.map(s => {
      if (s.id !== shelfId) return s
      const existing = s.items.find(i => i.sku === item.sku)
      let newItems: InventoryItem[]
      if (existing) {
        newItems = s.items.map(i => i.sku === item.sku ? { ...i, quantity: i.quantity + item.quantity } : i)
      } else {
        newItems = [...s.items, item]
      }
      emitInventoryChange(shelfId, newItems)
      return { ...s, items: newItems }
    })
    return { shelves }
  }),
  removeItem: (shelfId, sku) => set(state => {
    const shelves = state.shelves.map(s => {
      if (s.id !== shelfId) return s
      const newItems = s.items.filter(i => i.sku !== sku)
      emitInventoryChange(shelfId, newItems)
      return { ...s, items: newItems }
    })
    return { shelves }
  }),
  checkoutItem: (shelfId, sku, quantity) => set(state => {
    const shelves = state.shelves.map(s => {
      if (s.id !== shelfId) return s
      const newItems = s.items
        .map(i => i.sku === sku ? { ...i, quantity: Math.max(0, i.quantity - quantity) } : i)
        .filter(i => i.quantity > 0)
      emitInventoryChange(shelfId, newItems)
      return { ...s, items: newItems }
    })
    return { shelves }
  }),
  adjustQuantity: (shelfId, sku, delta) => set(state => {
    const shelves = state.shelves.map(s => {
      if (s.id !== shelfId) return s
      const newItems = s.items.map(i => i.sku === sku ? { ...i, quantity: i.quantity + delta } : i)
      emitInventoryChange(shelfId, newItems)
      return { ...s, items: newItems }
    })
    return { shelves }
  }),
  onInventoryChange: (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
}))
