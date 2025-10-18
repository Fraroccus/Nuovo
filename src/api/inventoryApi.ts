// Simulated API integration with artificial delays and validation

export type AddItemPayload = { shelfId: string; item: { sku: string; name: string; quantity: number } }
export type RemoveItemPayload = { shelfId: string; sku: string }
export type AdjustQuantityPayload = { shelfId: string; sku: string; delta: number }
export type CheckoutPayload = { shelfId: string; sku: string; quantity: number }

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

function maybeFail() {
  // 10% failure chance to emulate network errors (disabled in tests via mock)
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') return
  if (Math.random() < 0.1) {
    throw new Error('Network error')
  }
}

export async function addItemApi(payload: AddItemPayload) {
  await delay(120)
  maybeFail()
  if (!payload.item.sku || !payload.item.name || payload.item.quantity <= 0) {
    throw new Error('Invalid item payload')
  }
  return { ok: true }
}

export async function removeItemApi(payload: RemoveItemPayload) {
  await delay(100)
  maybeFail()
  if (!payload.sku) throw new Error('Invalid remove payload')
  return { ok: true }
}

export async function adjustItemQuantityApi(payload: AdjustQuantityPayload) {
  await delay(100)
  maybeFail()
  if (payload.delta <= 0) throw new Error('Delta must be positive')
  return { ok: true }
}

export async function checkoutItemApi(payload: CheckoutPayload) {
  await delay(100)
  maybeFail()
  if (payload.quantity <= 0) throw new Error('Quantity must be positive')
  return { ok: true }
}
