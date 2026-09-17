import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createShopOrder } from '../api/orders'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const DELIVERY_FEE = 0

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { shop, items, subtotal, itemCount, clearCart, ready } = useCart()
  const [form, setForm] = useState({
    dropoff_address: '',
    dropoff_city: '',
    dropoff_contact_name: user?.name || '',
    dropoff_contact_phone: '',
    notes: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!ready) {
    return <div className="container py-5 text-secondary">Loading...</div>
  }

  if (!shop || items.length === 0) {
    return (
      <div className="container py-5 page-shell">
        <h1 className="h3 mb-2">Checkout</h1>
        <p className="text-secondary mb-3">Your cart is empty.</p>
        <Link to="/" className="btn btn-success">Browse shops</Link>
      </div>
    )
  }

  const total = subtotal + DELIVERY_FEE

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      const order = await createShopOrder({
        shop_id: shop.id,
        items: items.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
        })),
        dropoff_address: form.dropoff_address.trim(),
        dropoff_city: form.dropoff_city.trim(),
        dropoff_contact_name: form.dropoff_contact_name.trim(),
        dropoff_contact_phone: form.dropoff_contact_phone.trim(),
        notes: form.notes.trim() || null,
        payment_method: 'cod',
        delivery_fee: DELIVERY_FEE,
      })

      clearCart()
      navigate(`/orders/${order.id}`)
    } catch (err) {
      const message = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})?.[0]?.[0]
        || 'Unable to place order.'
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container py-5 page-shell" style={{ maxWidth: 720 }}>
      <h1 className="h3 mb-1">Checkout</h1>
      <p className="text-secondary mb-4">
        Hi {user.name}. Place your COD order from {shop.name}.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="surface-panel p-4 mb-4">
        <h2 className="h6 mb-3">Order summary · {itemCount} items</h2>
        <ul className="list-unstyled mb-3">
          {items.map((item) => (
            <li key={item.id} className="d-flex justify-content-between py-1">
              <span>{item.name} × {item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="d-flex justify-content-between">
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Delivery fee</span>
          <span>{DELIVERY_FEE.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between border-top pt-3 mt-3">
          <strong>Total (COD)</strong>
          <strong>{total.toFixed(2)}</strong>
        </div>
      </div>

      <form className="surface-panel p-4" onSubmit={handleSubmit}>
        <h2 className="h6 mb-3">Delivery details</h2>

        <div className="mb-3">
          <label className="form-label" htmlFor="dropoff_contact_name">Contact name</label>
          <input
            id="dropoff_contact_name"
            name="dropoff_contact_name"
            className="form-control"
            value={form.dropoff_contact_name}
            onChange={updateField}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="dropoff_contact_phone">Contact phone</label>
          <input
            id="dropoff_contact_phone"
            name="dropoff_contact_phone"
            className="form-control"
            value={form.dropoff_contact_phone}
            onChange={updateField}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="dropoff_address">Address</label>
          <input
            id="dropoff_address"
            name="dropoff_address"
            className="form-control"
            value={form.dropoff_address}
            onChange={updateField}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="dropoff_city">City</label>
          <input
            id="dropoff_city"
            name="dropoff_city"
            className="form-control"
            value={form.dropoff_city}
            onChange={updateField}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label" htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            className="form-control"
            rows={3}
            value={form.notes}
            onChange={updateField}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={busy}>
            {busy ? 'Placing order...' : 'Place COD order'}
          </button>
          <Link to="/cart" className="btn btn-outline-secondary">Back to cart</Link>
        </div>
      </form>
    </div>
  )
}
