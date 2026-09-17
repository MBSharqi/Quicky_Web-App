import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAdminCustomers } from '../api/admin'

function money(value) {
  return Number(value || 0).toFixed(2)
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    listAdminCustomers({ q })
      .then((data) => {
        if (active) {
          setCustomers(data.data ?? [])
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load customers.')
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
  }, [q])

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-secondary mb-0">Marketplace customer accounts</p>
        </div>
      </div>

      <div className="mb-4" style={{ maxWidth: 360 }}>
        <label className="form-label" htmlFor="customer-search">Search</label>
        <input
          id="customer-search"
          className="form-control"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name or email"
        />
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && customers.length === 0 && (
        <p className="text-secondary mb-0">No customers found.</p>
      )}

      {!loading && customers.length > 0 && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Delivered</th>
                <th>Spend</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.orders_total ?? 0}</td>
                  <td>{customer.orders_delivered ?? 0}</td>
                  <td>{money(customer.spend_total)}</td>
                  <td className="text-end">
                    <Link to={`/admin/customers/${customer.id}`} className="btn btn-sm btn-outline-secondary">
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
