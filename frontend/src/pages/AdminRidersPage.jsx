import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAdminRiders } from '../api/riders'

export default function AdminRidersPage() {
  const [riders, setRiders] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    listAdminRiders({ q })
      .then((data) => {
        if (active) {
          setRiders(data.data ?? [])
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load riders.')
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
          <p className="text-secondary mb-0">Register and manage delivery riders</p>
        </div>
        <Link to="/admin/riders/new" className="btn btn-success">
          Register rider
        </Link>
      </div>

      <div className="mb-4" style={{ maxWidth: 360 }}>
        <label className="form-label" htmlFor="rider-search">Search</label>
        <input
          id="rider-search"
          className="form-control"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name or email"
        />
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && riders.length === 0 && (
        <p className="text-secondary mb-0">No riders registered yet.</p>
      )}

      {!loading && riders.length > 0 && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Active</th>
                <th>Delivered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {riders.map((rider) => (
                <tr key={rider.id}>
                  <td>{rider.name}</td>
                  <td>{rider.email}</td>
                  <td>{rider.active_orders_count ?? 0}</td>
                  <td>{rider.delivered_orders_count ?? 0}</td>
                  <td className="text-end">
                    <Link to={`/admin/riders/${rider.id}`} className="btn btn-sm btn-outline-secondary">
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
