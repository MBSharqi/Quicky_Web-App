import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteMenuItem,
  listMenuItems,
  updateMenuItemAvailability,
} from '../api/shops'

export default function ShopMenuPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function loadItems() {
    const data = await listMenuItems()
    setItems(data.data ?? [])
  }

  useEffect(() => {
    let active = true

    loadItems()
      .catch(() => {
        if (active) {
          setError('Unable to load menu items.')
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

  async function toggleAvailability(item) {
    setBusyId(item.id)
    try {
      const updated = await updateMenuItemAvailability(item.id, !item.is_available)
      setItems((current) => current.map((row) => (row.id === item.id ? updated : row)))
    } catch {
      setError('Unable to update availability.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) {
      return
    }

    setBusyId(item.id)
    try {
      await deleteMenuItem(item.id)
      setItems((current) => current.filter((row) => row.id !== item.id))
    } catch {
      setError('Unable to delete item.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
        <div>
          <h1 className="h3 mb-1">Menu items</h1>
          <p className="text-secondary mb-0">Manage food and product listings for your shop</p>
        </div>
        <Link to="/shop/menu/new" className="btn btn-success">
          Add item
        </Link>
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <p className="text-secondary mb-0">No menu items yet. Add your first item.</p>
      )}

      {!loading && items.length > 0 && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-semibold">{item.name}</div>
                    {item.description && (
                      <div className="small text-secondary">{item.description}</div>
                    )}
                  </td>
                  <td>{item.category || '—'}</td>
                  <td>{Number(item.price).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${item.is_available ? 'text-bg-success' : 'text-bg-secondary'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={busyId === item.id}
                        onClick={() => toggleAvailability(item)}
                      >
                        {item.is_available ? 'Mark unavailable' : 'Mark available'}
                      </button>
                      <Link to={`/shop/menu/${item.id}/edit`} className="btn btn-sm btn-outline-success">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        disabled={busyId === item.id}
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                    </div>
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
