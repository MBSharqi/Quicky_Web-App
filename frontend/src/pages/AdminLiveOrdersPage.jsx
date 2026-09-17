import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminLiveOrders } from '../api/admin'

function money(value) {
  return Number(value || 0).toFixed(2)
}

function statusLabel(status) {
  return String(status || '').replaceAll('_', ' ')
}

function statusTone(status) {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'accepted':
      return 'info'
    case 'ready_for_pickup':
      return 'primary'
    case 'assigned':
    case 'picked_up':
      return 'success'
    default:
      return 'secondary'
  }
}

export default function AdminLiveOrdersPage() {
  const [orders, setOrders] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await getAdminLiveOrders()
        if (!active) {
          return
        }
        setOrders(data.orders ?? [])
        setSummary(data.summary ?? null)
        setError('')
        setUpdatedAt(new Date())
      } catch {
        if (active) {
          setError('Unable to load live orders.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    const intervalId = window.setInterval(load, 8000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-secondary mb-0">
            Auto-refreshes every 8 seconds
            {updatedAt ? ` · ${updatedAt.toLocaleTimeString()}` : ''}
          </p>
        </div>
      </div>

      {summary && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="border rounded-3 p-3 bg-white">
              <div className="text-secondary small">Live</div>
              <div className="fs-4 fw-semibold">{summary.orders_live}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="border rounded-3 p-3 bg-white">
              <div className="text-secondary small">Pending</div>
              <div className="fs-4 fw-semibold">{summary.orders_pending}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="border rounded-3 p-3 bg-white">
              <div className="text-secondary small">Ready</div>
              <div className="fs-4 fw-semibold">{summary.orders_ready}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="border rounded-3 p-3 bg-white">
              <div className="text-secondary small">In delivery</div>
              <div className="fs-4 fw-semibold">{summary.orders_in_delivery}</div>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-secondary mb-0">No active orders.</p>
      )}

      <div className="row g-3">
        {orders.map((order) => (
          <div className="col-md-6 col-xl-4" key={order.id}>
            <div className="border rounded-3 bg-white p-3 h-100">
              <div className="d-flex justify-content-between gap-2 mb-2">
                <strong>#{order.id}</strong>
                <span className={`badge text-bg-${statusTone(order.status)} text-capitalize`}>
                  {statusLabel(order.status)}
                </span>
              </div>
              <p className="mb-1">{order.shop?.name || 'Package order'}</p>
              <p className="mb-1 small text-secondary">{order.pickup_city} → {order.dropoff_city}</p>
              <p className="mb-1 small">Customer: {order.customer?.name}</p>
              <p className="mb-3 small">Rider: {order.rider?.name || 'Unassigned'}</p>
              <div className="d-flex justify-content-between align-items-center">
                <strong>{money(order.total)} COD</strong>
                <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline-success">Open</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
