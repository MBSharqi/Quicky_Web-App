import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAdminCustomer } from '../api/admin'

function money(value) {
  return Number(value || 0).toFixed(2)
}

function statusLabel(status) {
  return String(status || '').replaceAll('_', ' ')
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getAdminCustomer(id)
      .then((data) => {
        if (!active) {
          return
        }
        setCustomer(data.customer)
        setOrders(data.recent_orders ?? [])
      })
      .catch(() => {
        if (active) {
          setError('Unable to load customer.')
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
  }, [id])

  if (loading) {
    return <div className="container py-5 text-secondary">Loading...</div>
  }

  if (error || !customer) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Customer not found.'}</div>
        <Link to="/admin/customers">Back</Link>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">{customer.name}</h1>
          <p className="text-secondary mb-0">{customer.email}</p>
        </div>
        <Link to="/admin/customers" className="btn btn-outline-secondary btn-sm">Back</Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="border rounded-3 p-3 bg-white">
            <div className="text-secondary small">Orders</div>
            <div className="fs-4 fw-semibold">{customer.orders_total}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="border rounded-3 p-3 bg-white">
            <div className="text-secondary small">Delivered</div>
            <div className="fs-4 fw-semibold">{customer.orders_delivered}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="border rounded-3 p-3 bg-white">
            <div className="text-secondary small">Spend</div>
            <div className="fs-4 fw-semibold">{money(customer.spend_total)}</div>
          </div>
        </div>
      </div>

      <h2 className="h5 mb-3">Recent orders</h2>
      {orders.length === 0 ? (
        <p className="text-secondary mb-0">No orders yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Shop</th>
                <th>Status</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.shop?.name || '—'}</td>
                  <td className="text-capitalize">{statusLabel(order.status)}</td>
                  <td>{money(order.total)}</td>
                  <td className="text-end">
                    <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline-secondary">View</Link>
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
