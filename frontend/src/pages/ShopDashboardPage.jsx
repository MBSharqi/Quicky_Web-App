import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyShop, updateMyShopStatus } from '../api/shops'
import { getDashboard } from '../api/dashboard'

export default function ShopDashboardPage() {
  const [shop, setShop] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([getMyShop(), getDashboard()])
      .then(([shopData, dashboardData]) => {
        if (!active) {
          return
        }
        setShop(shopData)
        setStats(dashboardData.stats)
      })
      .catch(() => {
        if (active) {
          setError('Unable to load shop profile.')
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
  }, [])

  async function toggleStatus() {
    if (!shop) {
      return
    }

    setBusy(true)
    setMessage('')
    try {
      const updated = await updateMyShopStatus(!shop.is_open)
      setShop(updated)
      setMessage(updated.is_open ? 'Shop is now open.' : 'Shop is now closed.')
    } catch {
      setMessage('Unable to update shop status.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="container py-5 text-secondary">Loading...</div>
  }

  if (error || !shop) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Shop profile not found.'}</div>
      </div>
    )
  }

  return (
    <div className="container py-5 page-shell" style={{ maxWidth: 860 }}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4 flex-wrap">
        <div>
          <h1 className="h3 mb-1">{shop.name}</h1>
          <p className="text-secondary mb-0 text-capitalize">Shop dashboard · {shop.type}</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/orders" className="btn btn-success">
            Orders
            {(stats?.orders_pending ?? 0) > 0 && (
              <span className="badge text-bg-light text-success ms-2">{stats.orders_pending}</span>
            )}
          </Link>
          <Link to="/shop/menu" className="btn btn-outline-success">
            Manage menu
          </Link>
          <button type="button" className={`btn ${shop.is_open ? 'btn-outline-danger' : 'btn-success'}`} disabled={busy} onClick={toggleStatus}>
            {shop.is_open ? 'Set closed' : 'Set open'}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-light border">{message}</div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border rounded-3 p-3 bg-white h-100">
            <div className="text-secondary small mb-1">Status</div>
            <div className="fs-5 fw-semibold">{shop.is_open ? 'Open' : 'Closed'}</div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border rounded-3 p-3 bg-white h-100">
            <div className="text-secondary small mb-1">Pending</div>
            <div className="fs-5 fw-semibold">{stats?.orders_pending ?? 0}</div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border rounded-3 p-3 bg-white h-100">
            <div className="text-secondary small mb-1">Accepted</div>
            <div className="fs-5 fw-semibold">{stats?.orders_accepted ?? 0}</div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border rounded-3 p-3 bg-white h-100">
            <div className="text-secondary small mb-1">Ready</div>
            <div className="fs-5 fw-semibold">{stats?.orders_ready ?? 0}</div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border rounded-3 p-3 bg-white h-100">
            <div className="text-secondary small mb-1">Menu items</div>
            <div className="fs-5 fw-semibold">{stats?.menu_items_total ?? 0}</div>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border rounded-3 p-3 bg-white h-100">
            <div className="text-secondary small mb-1">Available</div>
            <div className="fs-5 fw-semibold">{stats?.menu_items_available ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="border rounded-3 p-4 bg-white">
        <h2 className="h5 mb-3">Shop profile</h2>
        <p className="mb-2">{shop.description || 'No description yet.'}</p>
        <p className="mb-1"><span className="text-secondary">Address:</span> {shop.address}</p>
        <p className="mb-0"><span className="text-secondary">Phone:</span> {shop.phone || '—'}</p>
      </div>
    </div>
  )
}
