import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPublicShop } from '../api/shops'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function PublicShopPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addItem } = useCart()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

    getPublicShop(slug)
      .then((data) => {
        if (active) {
          setShop(data)
        }
      })
      .catch(() => {
        if (active) {
          setError('Shop not found or unavailable.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [slug])

  function handleAddToCart(item) {
    if (!shop?.is_open) {
      setNotice('This shop is currently closed.')
      return
    }

    const result = addItem(shop, item, 1)
    if (!result.ok) {
      return
    }

    if (!isAuthenticated) {
      navigate('/register?redirect=/cart')
      return
    }

    if (user?.role && user.role !== 'customer') {
      setNotice('Only customer accounts can place food orders. Item was added to cart for review.')
      return
    }

    setNotice(`${item.name} added to cart.`)
  }

  if (loading) {
    return <div className="container py-5 text-secondary">Loading menu...</div>
  }

  if (error || !shop) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Shop not found.'}</div>
        <Link to="/">Back to browse</Link>
      </div>
    )
  }

  const grouped = shop.menu_items?.reduce((acc, item) => {
    const key = item.category || 'Menu'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {}) ?? {}

  return (
    <div className="page-shell">
      <section className="public-shop-hero">
        <div className="container">
          <Link to="/" className="small text-decoration-none">← Back to browse</Link>
          <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mt-3">
            <div>
              <div className="shop-meta mb-2">
                <span className="chip">{shop.type}</span>
                <span className={`chip ${shop.is_open ? '' : 'chip-muted'}`}>
                  {shop.is_open ? 'Open' : 'Closed'}
                </span>
              </div>
              <h1 className="display-6 fw-bold mb-2">{shop.name}</h1>
              <p className="mb-0 opacity-75">{shop.city} · {shop.address}</p>
            </div>
            <Link to="/cart" className="btn btn-success">View cart</Link>
          </div>
        </div>
      </section>

      <div className="container py-5">
        {shop.description && (
          <p className="lead text-secondary mb-4" style={{ maxWidth: 640 }}>{shop.description}</p>
        )}

        {notice && <div className="toast-notice mb-4">{notice}</div>}

        {!shop.is_open && (
          <div className="alert alert-warning">This shop is closed right now. You can browse the menu, but ordering is paused.</div>
        )}

        {Object.keys(grouped).length === 0 && (
          <p className="text-secondary">No available items at the moment.</p>
        )}

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="mb-5">
            <h2 className="h4 mb-1">{category}</h2>
            <div>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="menu-item-row"
                  style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
                >
                  <div>
                    <h3 className="h6 mb-1">{item.name}</h3>
                    {item.description && (
                      <p className="small text-secondary mb-2">{item.description}</p>
                    )}
                    <div className="fw-semibold text-success">{Number(item.price).toFixed(2)}</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-success btn-sm align-self-center"
                    disabled={!shop.is_open}
                    onClick={() => handleAddToCart(item)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
