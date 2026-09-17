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
    <div className="container py-5">
      <div className="public-shop-header mb-4">
        <Link to="/" className="small text-decoration-none text-secondary">← Back to browse</Link>
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mt-2">
          <div>
            <div className="d-flex gap-2 mb-2">
              <span className="badge text-bg-light text-capitalize">{shop.type}</span>
              <span className={`badge ${shop.is_open ? 'text-bg-success' : 'text-bg-secondary'}`}>
                {shop.is_open ? 'Open' : 'Closed'}
              </span>
            </div>
            <h1 className="h2 mb-2">{shop.name}</h1>
            <p className="text-secondary mb-0">{shop.city} · {shop.address}</p>
            {shop.description && <p className="mt-3 mb-0">{shop.description}</p>}
          </div>
          <Link to="/cart" className="btn btn-outline-success">View cart</Link>
        </div>
      </div>

      {notice && <div className="alert alert-light border">{notice}</div>}

      {!shop.is_open && (
        <div className="alert alert-warning">This shop is closed right now. You can browse the menu, but ordering is paused.</div>
      )}

      {Object.keys(grouped).length === 0 && (
        <p className="text-secondary">No available items at the moment.</p>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="mb-5">
          <h2 className="h4 mb-3">{category}</h2>
          <div className="row g-3">
            {items.map((item) => (
              <div className="col-md-6" key={item.id}>
                <div className="menu-item-card">
                  <div className="d-flex justify-content-between gap-3">
                    <div>
                      <h3 className="h6 mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="small text-secondary mb-2">{item.description}</p>
                      )}
                      <div className="fw-semibold text-success">{Number(item.price).toFixed(2)}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-success btn-sm align-self-start"
                      disabled={!shop.is_open}
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
