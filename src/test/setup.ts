import '@testing-library/jest-dom/vitest'

// In tests, mock the inventory API to be deterministic and fast
import * as api from '../api/inventoryApi'
vi.mock('../api/inventoryApi', async () => {
  const actual = await vi.importActual<typeof api>('../api/inventoryApi')
  return {
    ...actual,
    addItemApi: vi.fn(async () => ({ ok: true })),
    removeItemApi: vi.fn(async () => ({ ok: true })),
    adjustItemQuantityApi: vi.fn(async () => ({ ok: true })),
    checkoutItemApi: vi.fn(async () => ({ ok: true }))
  }
})
