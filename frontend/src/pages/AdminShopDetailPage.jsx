import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAdminShop } from '../api/shops'

export default function AdminShopDetailPage() {
  const { id } = useParams()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getAdminShop(id)
      .then((data) => {
        if (active) {
          setShop(data)
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load shop.')
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

  if (error || !shop) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Shop not found.'}</div>
        <Link to="/admin/shops">Back to shops</Link>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">{shop.name}</h1>
          <p className="text-secondary mb-0 text-capitalize">{shop.type} · {shop.city}</p>
        </div>
        <Link to="/admin/shops" className="btn btn-outline-secondary btn-sm">Back</Link>
      </div>

      <div className="mb-3">
        <span className={`badge ${shop.is_open ? 'text-bg-success' : 'text-bg-secondary'}`}>
          {shop.is_open ? 'Open' : 'Closed'}
        </span>
      </div>

      {shop.description && <p className="mb-4">{shop.description}</p>}

      <dl className="row mb-0">
        <dt className="col-sm-4">Address</dt>
        <dd className="col-sm-8">{shop.address}</dd>

        <dt className="col-sm-4">Phone</dt>
        <dd className="col-sm-8">{shop.phone || '—'}</dd>

        <dt className="col-sm-4">Owner</dt>
        <dd className="col-sm-8">
          {shop.owner?.name}
          <div className="small text-secondary">{shop.owner?.email}</div>
        </dd>

        <dt className="col-sm-4">Slug</dt>
        <dd className="col-sm-8">{shop.slug}</dd>
      </dl>
    </div>
  )
}
