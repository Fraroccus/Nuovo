import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useInventoryStore } from '../store/inventory'
import { Modal } from './components/Modal'
import { addItemApi, adjustItemQuantityApi, checkoutItemApi, removeItemApi } from '../api/inventoryApi'

export const ShelfDetailPanel: React.FC = () => {
  const selectedShelfId = useInventoryStore(s => s.selectedShelfId)
  const shelf = useInventoryStore(s => s.shelves.find(sh => sh.id === selectedShelfId))
  const close = useInventoryStore(s => s.selectShelf)

  const isOpen = !!shelf

  const headingId = useId()
  const descId = useId()

  const initialFocusRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (isOpen && initialFocusRef.current) {
      initialFocusRef.current.focus()
    }
  }, [isOpen])

  if (!shelf) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => close(null)}
      ariaLabelledBy={headingId}
      ariaDescribedBy={descId}
    >
      <div>
        <h2 id={headingId}>{shelf.name}</h2>
        <p id={descId}>Location: {shelf.location}</p>

        <InventoryList shelfId={shelf.id} />

        <hr />

        <AddItemForm shelfId={shelf.id} initialFocusRef={initialFocusRef} />

        <div className="actions">
          <button type="button" onClick={() => close(null)}>Close</button>
        </div>
      </div>
    </Modal>
  )
}

const InventoryList: React.FC<{ shelfId: string }> = ({ shelfId }) => {
  const items = useInventoryStore(s => s.getInventoryForShelf(shelfId))

  if (!items.length) return <p>No items on this shelf yet.</p>

  return (
    <div>
      <h3>Inventory</h3>
      <ul>
        {items.map(item => (
          <li key={item.sku} className="item-row">
            <div>
              <strong>{item.name}</strong> (SKU: {item.sku}) — Qty: {item.quantity}
            </div>
            <div className="row-actions">
              <AdjustQuantityForm shelfId={shelfId} sku={item.sku} />
              <CheckoutItemForm shelfId={shelfId} sku={item.sku} />
              <RemoveItemButton shelfId={shelfId} sku={item.sku} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const AddItemForm: React.FC<{ shelfId: string; initialFocusRef: React.RefObject<HTMLButtonElement> }> = ({ shelfId, initialFocusRef }) => {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState<number>(1)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const addItem = useInventoryStore(s => s.addItem)

  return (
    <form
      aria-labelledby="add-item-heading"
      onSubmit={async e => {
        e.preventDefault()
        setError(null)
        if (!name.trim() || !sku.trim()) {
          setError('Name and SKU are required')
          setStatus('error')
          return
        }
        if (!Number.isFinite(quantity) || quantity <= 0) {
          setError('Quantity must be a positive integer')
          setStatus('error')
          return
        }
        try {
          setStatus('loading')
          await addItemApi({ shelfId, item: { name: name.trim(), sku: sku.trim(), quantity } })
          addItem(shelfId, { name: name.trim(), sku: sku.trim(), quantity })
          setStatus('success')
          setName('')
          setSku('')
          setQuantity(1)
          initialFocusRef.current?.focus()
        } catch (err: any) {
          setStatus('error')
          setError(err?.message || 'Failed to add item')
        }
      }}
    >
      <h3 id="add-item-heading">Add Item</h3>
      <div className="fields">
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          SKU
          <input value={sku} onChange={e => setSku(e.target.value)} required />
        </label>
        <label>
          Quantity
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={e => setQuantity(parseInt(e.target.value || '0', 10))}
            required
          />
        </label>
      </div>
      <div className="actions">
        <button ref={initialFocusRef} type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Adding…' : 'Add item'}
        </button>
      </div>
      <div aria-live="polite" role="status" className="status">
        {status === 'success' && <span>Item added successfully</span>}
        {status === 'error' && error && <span aria-atomic="true">{error}</span>}
      </div>
    </form>
  )
}

const AdjustQuantityForm: React.FC<{ shelfId: string; sku: string }> = ({ shelfId, sku }) => {
  const [qty, setQty] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const adjustQuantity = useInventoryStore(s => s.adjustQuantity)
  const currentQty = useInventoryStore(
    s => s.getInventoryForShelf(shelfId).find(i => i.sku === sku)?.quantity ?? 0
  )

  return (
    <form
      aria-label={`Adjust quantity for ${sku}`}
      className="inline-form"
      onSubmit={async e => {
        e.preventDefault()
        setError(null)
        if (!Number.isFinite(qty) || qty <= 0) {
          setError('Quantity must be a positive integer')
          return
        }
        try {
          setLoading(true)
          await adjustItemQuantityApi({ shelfId, sku, delta: qty })
          adjustQuantity(shelfId, sku, qty)
        } catch (err: any) {
          setError(err?.message || 'Failed to adjust quantity')
        } finally {
          setLoading(false)
        }
      }}
    >
      <label>
        Qty +
        <input type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value || '0', 10))} />
      </label>
      <button type="submit" disabled={loading}>Apply</button>
      <span className="muted">Current: {currentQty}</span>
      {error && (
        <span role="status" aria-live="polite" className="error">{error}</span>
      )}
    </form>
  )
}

const CheckoutItemForm: React.FC<{ shelfId: string; sku: string }> = ({ shelfId, sku }) => {
  const [qty, setQty] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const checkoutItem = useInventoryStore(s => s.checkoutItem)
  const currentQty = useInventoryStore(
    s => s.getInventoryForShelf(shelfId).find(i => i.sku === sku)?.quantity ?? 0
  )

  return (
    <form
      aria-label={`Checkout quantity for ${sku}`}
      className="inline-form"
      onSubmit={async e => {
        e.preventDefault()
        setError(null)
        if (!Number.isFinite(qty) || qty <= 0) {
          setError('Quantity must be a positive integer')
          return
        }
        if (qty > currentQty) {
          setError('Cannot checkout more than current quantity')
          return
        }
        try {
          setLoading(true)
          await checkoutItemApi({ shelfId, sku, quantity: qty })
          checkoutItem(shelfId, sku, qty)
        } catch (err: any) {
          setError(err?.message || 'Failed to checkout item')
        } finally {
          setLoading(false)
        }
      }}
    >
      <label>
        Checkout
        <input type="number" min={1} max={currentQty} value={qty} onChange={e => setQty(parseInt(e.target.value || '0', 10))} />
      </label>
      <button type="submit" disabled={loading}>Checkout</button>
      <span className="muted">Current: {currentQty}</span>
      {error && (
        <span role="status" aria-live="polite" className="error">{error}</span>
      )}
    </form>
  )
}

const RemoveItemButton: React.FC<{ shelfId: string; sku: string }> = ({ shelfId, sku }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const removeItem = useInventoryStore(s => s.removeItem)

  return (
    <div className="inline-form" aria-label={`Remove item ${sku}`}>
      <button
        type="button"
        onClick={async () => {
          setError(null)
          try {
            setLoading(true)
            await removeItemApi({ shelfId, sku })
            removeItem(shelfId, sku)
          } catch (err: any) {
            setError(err?.message || 'Failed to remove item')
          } finally {
            setLoading(false)
          }
        }}
        disabled={loading}
      >
        Remove
      </button>
      {error && (
        <span role="status" aria-live="polite" className="error">{error}</span>
      )}
    </div>
  )
}
