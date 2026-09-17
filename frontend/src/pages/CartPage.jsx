import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { shop, items, subtotal, updateQuantity, removeItem, clearCart, itemCount } = useCart()

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate('/register?redirect=/cart')
      return
    }

    if (user?.role !== 'customer') {
      return
    }

    navigate('/checkout')
  }

  if (!shop || items.length === 0) {
    return (
      <div className="container py-5" style={{ maxWidth: 720 }}>
        <h1 className="h3 mb-2">Your cart</h1>
        <p className="text-secondary mb-4">No items yet. Browse open shops and add something delicious.</p>
        <Link to="/" className="btn btn-success">Browse shops</Link>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4 flex-wrap">
        <div>
          <h1 className="h3 mb-1">Your cart</h1>
          <p className="text-secondary mb-0">
            From <Link to={`/shops/${shop.slug}`}>{shop.name}</Link> · {itemCount} item{itemCount === 1 ? '' : 's'}
          </p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearCart}>
          Clear cart
        </button>
      </div>

      <div className="list-group mb-4">
        {items.map((item) => (
          <div key={item.id} className="list-group-item py-3">
            <div className="d-flex justify-content-between gap-3 flex-wrap">
              <div>
                <div className="fw-semibold">{item.name}</div>
                <div className="small text-secondary">{Number(item.price).toFixed(2)} each</div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  min="1"
                  className="form-control form-control-sm"
                  style={{ width: 80 }}
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.id, event.target.value)}
                />
                <div className="fw-semibold" style={{ minWidth: 72, textAlign: 'right' }}>
                  {(item.price * item.quantity).toFixed(2)}
                </div>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded-3 bg-white p-4">
        <div className="d-flex justify-content-between mb-3">
          <span className="text-secondary">Subtotal</span>
          <span className="fs-5 fw-semibold">{subtotal.toFixed(2)}</span>
        </div>

        {!isAuthenticated && (
          <p className="small text-secondary mb-3">
            Create a customer account to place your order.
          </p>
        )}

        {isAuthenticated && user?.role !== 'customer' && (
          <div className="alert alert-warning">
            Food checkout is for customer accounts only.
          </div>
        )}

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleCheckout}
            disabled={isAuthenticated && user?.role !== 'customer'}
          >
            {isAuthenticated ? 'Continue to checkout' : 'Register to checkout'}
          </button>
          <Link to={`/shops/${shop.slug}`} className="btn btn-outline-secondary">
            Add more items
          </Link>
        </div>
        <p className="small text-secondary mt-3 mb-0">
          Checkout (COD order placement) arrives in Phase 4. Cart and account flow are ready now.
        </p>
      </div>
    </div>
  )
}
