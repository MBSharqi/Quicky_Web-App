import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listPublicShops } from '../api/shops'
import { useCms } from '../context/CmsContext'

export default function HomePage() {
  const { settings, banners } = useCms()
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
        <div className="container">
          <p className="brand-mark mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#b7e8d0' }}>
            {settings.brand_name}
          </p>
          <h1>{settings.hero_title}</h1>
          <p className="lead mb-0">{settings.hero_subtitle}</p>
          <form className="public-search" onSubmit={handleSearch}>
            <input
              type="search"
              className="form-control form-control-lg"
              placeholder={settings.search_placeholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search shops and food"
            />
            <button type="submit" className="btn btn-success btn-lg">
              {settings.search_button_label}
            </button>
          </form>
        </div>
      </section>

      <section className="container py-5">
        <div className="section-head">
          <h2>{settings.browse_title}</h2>
          <p className="text-secondary mb-0">
            {searchParams.get('q')
              ? `Results for “${searchParams.get('q')}”`
              : settings.browse_subtitle}
          </p>
        </div>

        {loading && <p className="text-secondary">Loading shops...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && shops.length === 0 && (
          <div className="surface-panel p-5 text-center">
            <h3 className="h5 mb-2">{settings.empty_shops_title}</h3>
            <p className="text-secondary mb-0">{settings.empty_shops_subtitle}</p>
          </div>
        )}

        <div className="shop-grid">
          {shops.map((shop, index) => (
            <Link
              key={shop.id}
              to={`/shops/${shop.slug}`}
              className="shop-card"
              style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
            >
              <div className="shop-card-media" aria-hidden="true" />
              <div className="shop-card-body">
                <div className="shop-meta">
                  <span className="chip">{shop.type}</span>
                  <span className="chip chip-muted">Open</span>
                </div>
                <h3 className="text-dark">{shop.name}</h3>
                <p className="text-secondary small mb-3">{shop.city} · {shop.address}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-secondary">
                    {shop.available_items_count ?? 0} items available
                  </span>
                  <span className="small fw-semibold text-success">View menu</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {banners.length > 0 && (
        <section className="container pb-5">
          <div className="cms-banner-rail">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className="cms-banner"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <h2 className="h4 mb-2">{banner.title}</h2>
                {banner.subtitle && <p className="mb-3 opacity-75">{banner.subtitle}</p>}
                {banner.link_url && (
                  <Link to={banner.link_url} className="btn btn-outline-success btn-sm">
                    {banner.cta_label || 'Learn more'}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {settings.footer_text && (
        <footer className="border-top py-4" style={{ borderColor: 'var(--q-line)' }}>
          <div className="container text-secondary small">{settings.footer_text}</div>
        </footer>
      )}
    </div>
  )
}
