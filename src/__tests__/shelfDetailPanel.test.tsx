import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import App from '../ui/App'
import { useInventoryStore } from '../store/inventory'

function openShelf(id: string) {
  useInventoryStore.getState().selectShelf(id)
}

describe('Shelf detail panel and inventory operations', () => {
  beforeEach(() => {
    // reset selection and render fresh app
    useInventoryStore.setState({ selectedShelfId: null })
  })

  it('opens modal when shelf is selected and is accessible', () => {
    render(<App />)

    const shelfButton = screen.getByRole('button', { name: /Shelf A/i })
    userEvent.click(shelfButton)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    const heading = within(dialog).getByRole('heading', { name: /Shelf A/i })
    expect(heading).toBeInTheDocument()
  })

  it('adds an item with validation and shows feedback', async () => {
    render(<App />)
    const shelfButton = screen.getByRole('button', { name: /Shelf B/i })
    await userEvent.click(shelfButton)

    const dialog = screen.getByRole('dialog')

    const addBtn = within(dialog).getByRole('button', { name: /Add item/i })

    // try invalid submit
    await userEvent.click(addBtn)
    expect(await within(dialog).findByText(/Name and SKU are required/i)).toBeInTheDocument()

    // fill form correctly
    const [nameInput, skuInput, qtyInput] = within(dialog).getAllByRole('textbox')
    await userEvent.type(nameInput, 'Widgets')
    await userEvent.type(skuInput, 'W001')
    const qtyNumber = within(dialog).getByLabelText(/Quantity/i) as HTMLInputElement
    await userEvent.clear(qtyNumber)
    await userEvent.type(qtyNumber, '3')

    await userEvent.click(addBtn)

    expect(await within(dialog).findByText(/Item added successfully/i)).toBeInTheDocument()

    // 2D/3D views synced
    expect(screen.getByTestId('view-2d-total')).toHaveTextContent('3')
    expect(screen.getByTestId('view-3d-skus')).toHaveTextContent('W001')
  })

  it('adjusts and checks out quantities with feedback and validation', async () => {
    render(<App />)
    const shelfButton = screen.getByRole('button', { name: /Shelf A/i })
    await userEvent.click(shelfButton)
    const dialog = screen.getByRole('dialog')

    // Adjust quantity for bolts +2
    const adjustForms = within(dialog).getAllByRole('form', { name: /Adjust quantity/i })
    const adjustForm = adjustForms.find(f => within(f).queryByText(/Current: 10/))!
    const qtyInput = within(adjustForm).getByRole('spinbutton') as HTMLInputElement
    await userEvent.clear(qtyInput)
    await userEvent.type(qtyInput, '2')
    await userEvent.click(within(adjustForm).getByRole('button', { name: /Apply/i }))

    // Now checkout 5 bolts
    const checkoutForms = within(dialog).getAllByRole('form', { name: /Checkout quantity/i })
    const checkoutForm = checkoutForms[0]
    const coInput = within(checkoutForm).getByRole('spinbutton')
    await userEvent.clear(coInput)
    await userEvent.type(coInput, '5')
    await userEvent.click(within(checkoutForm).getByRole('button', { name: /Checkout/i }))

    // Check 2D/3D views reflect updates
    expect(screen.getByTestId('view-2d-total')).toHaveTextContent('12') // 10 +2 -5 + 5 nuts still = 12
  })
})
