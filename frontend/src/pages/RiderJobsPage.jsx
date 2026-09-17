import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { claimOrder, listAvailableOrders } from '../api/orders'

function money(value) {
  return Number(value || 0).toFixed(2)
}

export default function RiderJobsPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')

  async function refresh() {
    const data = await listAvailableOrders()
    setOrders(data.data ?? [])
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    listAvailableOrders()
      .then((data) => {
        if (active) {
          setOrders(data.data ?? [])
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load available jobs.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    const intervalId = window.setInterval(() => {
      listAvailableOrders()
        .then((data) => {
          if (active) {
            setOrders(data.data ?? [])
          }
        })
        .catch(() => {})
    }, 12000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  async function handleClaim(orderId) {
    setBusyId(orderId)
    setActionError('')
    try {
      await claimOrder(orderId)
      await refresh()
    } catch (err) {
      setActionError(
        err.response?.data?.message
          || err.response?.data?.errors?.order?.[0]
          || 'Unable to claim this job.',
      )
      await refresh().catch(() => {})
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <div>
          <h1 className="h3 mb-1">Available jobs</h1>
          <p className="text-secondary mb-0">First rider to claim locks the order</p>
        </div>
        <Link to="/orders" className="btn btn-outline-success">My orders</Link>
      </div>

      {actionError && <div className="alert alert-warning">{actionError}</div>}
      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="border rounded-3 bg-white p-4">
          <p className="mb-0 text-secondary">No jobs ready for pickup right now. This list refreshes automatically.</p>
        </div>
      )}

      <div className="row g-3">
        {orders.map((order) => (
          <div className="col-md-6" key={order.id}>
            <div className="border rounded-3 bg-white p-4 h-100 d-flex flex-column">
              <div className="d-flex justify-content-between gap-2 mb-2">
                <h2 className="h5 mb-0">#{order.id} · {order.shop?.name || 'Shop order'}</h2>
                <strong>{money(order.total)} COD</strong>
              </div>
              <p className="mb-1"><span className="text-secondary">Pickup:</span> {order.pickup_address}, {order.pickup_city}</p>
              <p className="mb-1"><span className="text-secondary">Dropoff:</span> {order.dropoff_address}, {order.dropoff_city}</p>
              <p className="mb-3 text-secondary small">
                {(order.items || []).length} item(s)
                {order.items?.[0] ? ` · starts with ${order.items[0].name}` : ''}
              </p>
              <div className="mt-auto d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={busyId === order.id}
                  onClick={() => handleClaim(order.id)}
                >
                  {busyId === order.id ? 'Claiming...' : 'Claim job'}
                </button>
                <Link to={`/orders/${order.id}`} className="btn btn-outline-secondary">
                  Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
