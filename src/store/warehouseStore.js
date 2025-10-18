import { create } from 'zustand'

function makeShelf(id, x, y, w, h, d) {
  return { id, x, y, w, h, d }
}

const initialShelves = [
  makeShelf('A1', 0, 0, 2, 1, 1),
  makeShelf('A2', 3, 0.5, 1.5, 1.2, 1),
  makeShelf('B1', -2, 2, 1, 0.8, 2),
  makeShelf('C3', 2, -2, 1.2, 1.5, 1.2)
]

export const useWarehouseStore = create((set, get) => ({
  shelves: initialShelves,
  selectedShelfId: null,
  transformMode: 'translate',

  selectShelf: (id) => set({ selectedShelfId: id }),
  clearSelection: () => set({ selectedShelfId: null }),
  setTransformMode: (mode) => set({ transformMode: mode }),

  updateShelfPosition: (id, position3) => {
    // 3D position [x, y, z] with floor at y=0; store 2D mapping x->x, z->y (floor plane)
    const [x, _y, z] = position3
    set({
      shelves: get().shelves.map(s => s.id === id ? { ...s, x, y: z } : s)
    })
  },
  updateShelfSize: (id, size3) => {
    const [w, h, d] = size3
    set({
      shelves: get().shelves.map(s => s.id === id ? { ...s, w, h, d } : s)
    })
  },
  setShelves: (shelves) => set({ shelves })
}))

export function shelfPosition3D(shelf) {
  return [shelf.x, shelf.h / 2, shelf.y]
}

export function shelfSize3D(shelf) {
  return [shelf.w, shelf.h, shelf.d]
}
