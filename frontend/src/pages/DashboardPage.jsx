import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getDashboard } from '../api/dashboard'
import { useAuth } from '../context/AuthContext'
import ShopDashboardPage from './ShopDashboardPage'

function statusLabel(status) {
  return status.replaceAll('_', ' ')
}

function StatCard({ label, value }) {
  return (
    <div className="col-6 col-md-3">
      <div className="stat-tile">
        <div className="text-secondary small mb-1">{label}</div>
        <div className="fs-4 fw-semibold">{value}</div>
      </div>
    </div>
  )
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user.role === 'admin' || user.role === 'shop') {
      setLoading(false)
      return undefined
    }

    let active = true

    getDashboard()
      .then((data) => {
        if (active) {
          setStats(data.stats)
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load dashboard.')
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
  }, [user.role])

  if (user.role === 'shop') {
    return <ShopDashboardPage />
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  const cards = (() => {
    if (!stats) {
      return []
    }

    if (user.role === 'admin') {
      return [
        { label: 'Shops', value: stats.shops_total },
        { label: 'Shops open', value: stats.shops_open },
        { label: 'Total orders', value: stats.orders_total },
        { label: 'Pending', value: stats.orders_pending },
        { label: 'Delivered', value: stats.orders_delivered },
        { label: 'COD collected', value: money(stats.cod_paid_total) },
        { label: 'Riders', value: stats.riders_total },
        { label: 'Customers', value: stats.customers_total },
      ]
    }

    if (user.role === 'rider') {
      return [
        { label: 'Available', value: stats.orders_available },
        { label: 'Assigned', value: stats.orders_assigned },
        { label: 'Picked up', value: stats.orders_picked_up },
        { label: 'Delivered', value: stats.orders_delivered },
        { label: 'COD to collect', value: money(stats.cod_to_collect) },
      ]
    }

    return [
      { label: 'Total orders', value: stats.orders_total },
      { label: 'Pending', value: stats.orders_pending },
      { label: 'In progress', value: stats.orders_active },
      { label: 'Delivered', value: stats.orders_delivered },
      { label: 'COD unpaid', value: money(stats.cod_unpaid_total) },
    ]
  })()

  return (
    <div className="container py-5 page-shell">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <div>
          <h1 className="h3 mb-1">Dashboard</h1>
          <p className="text-secondary mb-0">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="d-flex gap-2">
          {user.role === 'admin' && (
            <>
              <Link to="/admin/shops" className="btn btn-success">
                Manage shops
              </Link>
              <Link to="/admin/riders" className="btn btn-outline-success">
                Manage riders
              </Link>
            </>
          )}
          {user.role === 'rider' && (
            <Link to="/rider/jobs" className="btn btn-success">
              Available jobs
            </Link>
          )}
          {['admin', 'customer', 'rider'].includes(user.role) && (
            <Link to="/orders" className="btn btn-outline-success">
              Orders
            </Link>
          )}
          {user.role === 'customer' && (
            <Link to="/orders/new" className="btn btn-outline-secondary">
              New order
            </Link>
          )}
        </div>
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          <div className="row g-3 mb-4">
            {cards.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} />
            ))}
          </div>

          {user.role === 'admin' && stats.recent_shops?.length > 0 && (
            <>
              <h2 className="h5 mb-3">Recent shops</h2>
              <div className="table-responsive mb-4">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_shops.map((shop) => (
                      <tr key={shop.id}>
                        <td>{shop.name}</td>
                        <td className="text-capitalize">{shop.type}</td>
                        <td>{shop.owner?.name}</td>
                        <td>{shop.is_open ? 'Open' : 'Closed'}</td>
                        <td className="text-end">
                          <Link to={`/admin/shops/${shop.id}`} className="btn btn-sm btn-outline-secondary">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {stats.recent_orders && (
            <>
              <h2 className="h5 mb-3">Recent orders</h2>
              {stats.recent_orders.length ? (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Route</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Fee</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.pickup_city} → {order.dropoff_city}</td>
                          <td className="text-capitalize">{statusLabel(order.status)}</td>
                          <td className="text-capitalize">{order.payment_status}</td>
                          <td>{money(order.total ?? order.delivery_fee)}</td>
                          <td className="text-end">
                            <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline-secondary">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-secondary mb-0">No recent orders.</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
