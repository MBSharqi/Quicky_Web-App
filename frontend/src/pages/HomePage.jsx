import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listPublicShops } from '../api/shops'

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const q = searchParams.get('q') || ''
    setLoading(true)
    setError('')

    listPublicShops({ q })
      .then((data) => {
        if (active) {
          setShops(data.data ?? [])
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load shops right now.')
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
  }, [searchParams])

  function handleSearch(event) {
    event.preventDefault()
    const next = query.trim()
    if (next) {
      setSearchParams({ q: next })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="public-home">
      <section className="public-hero">
        <div className="container py-5">
          <p className="public-kicker mb-2">Quicky</p>
          <h1 className="display-5 fw-bold mb-3">Local food &amp; shops, delivered fast</h1>
          <p className="lead text-secondary mb-4" style={{ maxWidth: 560 }}>
            Search restaurants, hotels, and shops near you. Add items to your cart and order with cash on delivery.
          </p>
          <form className="public-search" onSubmit={handleSearch}>
            <input
              type="search"
              className="form-control form-control-lg"
              placeholder="Search shops, food, or city..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search shops and food"
            />
            <button type="submit" className="btn btn-success btn-lg">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 gap-3 flex-wrap">
          <div>
            <h2 className="h4 mb-1">Open now</h2>
            <p className="text-secondary mb-0">
              {searchParams.get('q')
                ? `Results for “${searchParams.get('q')}”`
                : 'Browse available restaurants and shops'}
            </p>
          </div>
        </div>

        {loading && <p className="text-secondary">Loading shops...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && shops.length === 0 && (
          <div className="border rounded-3 bg-white p-5 text-center">
            <h3 className="h5 mb-2">No shops found</h3>
            <p className="text-secondary mb-0">Try another search or check back soon.</p>
          </div>
        )}

        <div className="row g-4">
          {shops.map((shop) => (
            <div className="col-md-6 col-lg-4" key={shop.id}>
              <Link to={`/shops/${shop.slug}`} className="shop-card text-decoration-none">
                <div className="shop-card-body">
                  <div className="d-flex justify-content-between gap-2 mb-2">
                    <span className="badge text-bg-light text-capitalize">{shop.type}</span>
                    <span className="badge text-bg-success">Open</span>
                  </div>
                  <h3 className="h5 mb-1 text-dark">{shop.name}</h3>
                  <p className="text-secondary small mb-3">{shop.city} · {shop.address}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-secondary">
                      {shop.available_items_count ?? 0} items available
                    </span>
                    <span className="small fw-semibold text-success">View menu →</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
