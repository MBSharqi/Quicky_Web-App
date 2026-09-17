import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAdminShops } from '../api/shops'

export default function AdminShopsPage() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    listAdminShops()
      .then((data) => {
        if (active) {
          setShops(data.data ?? [])
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load shops.')
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

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-secondary mb-0">Register and manage restaurants, hotels, and shops</p>
        </div>
        <Link to="/admin/shops/new" className="btn btn-success">
          Register shop
        </Link>
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && shops.length === 0 && (
        <p className="text-secondary mb-0">No shops registered yet.</p>
      )}

      {!loading && shops.length > 0 && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>City</th>
                <th>Owner</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td className="fw-semibold">{shop.name}</td>
                  <td className="text-capitalize">{shop.type}</td>
                  <td>{shop.city}</td>
                  <td>
                    {shop.owner?.name}
                    <div className="small text-secondary">{shop.owner?.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${shop.is_open ? 'text-bg-success' : 'text-bg-secondary'}`}>
                      {shop.is_open ? 'Open' : 'Closed'}
                    </span>
                  </td>
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
      )}
    </div>
  )
}
