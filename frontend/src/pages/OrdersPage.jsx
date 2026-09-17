import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listOrders } from '../api/orders'
import { useAuth } from '../context/AuthContext'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'ready_for_pickup', label: 'Ready for pickup' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'picked_up', label: 'Picked up' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAYMENT_OPTIONS = [
  { value: '', label: 'All payments' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
]

function statusLabel(status) {
  return status.replaceAll('_', ' ')
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    listOrders({ status, payment_status: paymentStatus })
      .then((data) => {
        if (active) {
          setOrders(data.data ?? [])
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load orders.')
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
  }, [status, paymentStatus])

  return (
    <div className="container py-5 page-shell">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <div>
          {user.role !== 'admin' && <h1 className="h3 mb-1">Orders</h1>}
          <p className="text-secondary mb-0">
            {user.role === 'shop' && 'Incoming shop orders'}
            {user.role === 'rider' && 'Assigned and available pickup orders'}
            {user.role === 'customer' && 'Your orders'}
            {user.role === 'admin' && 'All marketplace orders'}
          </p>
        </div>
        {user.role === 'customer' && (
          <div className="d-flex gap-2">
            <Link to="/" className="btn btn-success">Browse shops</Link>
            <Link to="/orders/new" className="btn btn-outline-secondary">Package order</Link>
          </div>
        )}
        {user.role === 'rider' && (
          <div className="d-flex gap-2">
            <Link to="/rider/jobs" className="btn btn-success">Available jobs</Link>
          </div>
        )}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <label className="form-label" htmlFor="status">Status</label>
          <select id="status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all-status'} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="payment_status">Payment</label>
          <select id="payment_status" className="form-select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            {PAYMENT_OPTIONS.map((option) => (
              <option key={option.value || 'all-payment'} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-secondary mb-0">No orders match these filters.</p>
      )}

      {!loading && orders.length > 0 && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Shop</th>
                <th>Pickup</th>
                <th>Dropoff</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.shop?.name || '—'}</td>
                  <td>
                    {order.pickup_city}
                    <div className="small text-secondary">{order.pickup_address}</div>
                  </td>
                  <td>
                    {order.dropoff_city}
                    <div className="small text-secondary">{order.dropoff_address}</div>
                  </td>
                  <td>{Number(order.total ?? order.delivery_fee).toFixed(2)}</td>
                  <td className="text-capitalize">{statusLabel(order.status)}</td>
                  <td className="text-capitalize">{order.payment_status}</td>
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
      )}
    </div>
  )
}
