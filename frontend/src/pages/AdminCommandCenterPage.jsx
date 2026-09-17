import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminOverview } from '../api/admin'

function money(value) {
  return Number(value || 0).toFixed(2)
}

function statusLabel(status) {
  return String(status || '').replaceAll('_', ' ')
}

function StatCard({ label, value, to }) {
  const body = (
    <div className="stat-tile">
      <div className="text-secondary small mb-1">{label}</div>
      <div className="fs-4 fw-semibold">{value}</div>
    </div>
  )

  if (!to) {
    return <div className="col-6 col-md-3">{body}</div>
  }

  return (
    <div className="col-6 col-md-3">
      <Link to={to} className="text-decoration-none text-dark d-block h-100">
        {body}
      </Link>
    </div>
  )
}

function RevenueBars({ series }) {
  const max = Math.max(...series.map((row) => Number(row.paid_total || 0)), 1)

  return (
    <div className="d-flex align-items-end gap-2" style={{ minHeight: 140 }}>
      {series.map((row) => {
        const height = Math.max(6, Math.round((Number(row.paid_total || 0) / max) * 120))
        const label = row.day.slice(5)
        return (
          <div key={row.day} className="flex-fill text-center">
            <div
              className="mx-auto rounded-top"
              title={`${row.day}: ${money(row.paid_total)}`}
              style={{
                height,
                width: '70%',
                maxWidth: 36,
                background: 'linear-gradient(180deg, #c084fc 0%, #7c3aed 55%, #4c1d95 100%)',
              }}
            />
            <div className="small text-secondary mt-1">{label}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminCommandCenterPage() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const overview = await getAdminOverview(days)
        if (!active) {
          return
        }
        setData(overview)
        setError('')
        setUpdatedAt(new Date())
      } catch {
        if (active) {
          setError('Unable to load command center.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    setLoading(true)
    load()
    const intervalId = window.setInterval(load, 15000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [days])

  if (loading && !data) {
    return <div className="container py-5 text-secondary">Loading command center...</div>
  }

  if (error && !data) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  const summary = data.summary
  const maxRevenue = Math.max(...(data.revenue_by_day || []).map((row) => Number(row.paid_total || 0)), 0)

  return (
    <div className="admin-page">
      <p className="admin-page-meta text-secondary mb-4">
        Live marketplace overview
        {updatedAt ? ` · refreshed ${updatedAt.toLocaleTimeString()}` : ''}
      </p>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="row g-3 mb-4">
        <StatCard label="Live orders" value={summary.orders_live} to="/admin/live" />
        <StatCard label="Orders today" value={summary.orders_today} />
        <StatCard label="COD today" value={money(summary.cod_paid_today)} />
        <StatCard label="COD collected" value={money(summary.cod_paid_total)} />
        <StatCard label="COD outstanding" value={money(summary.cod_unpaid_total)} />
        <StatCard label="Shops open" value={`${summary.shops_open}/${summary.shops_total}`} to="/admin/shops" />
        <StatCard label="Riders" value={summary.riders_total} to="/admin/riders" />
        <StatCard label="Customers" value={summary.customers_total} to="/admin/customers" />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="surface-panel p-4 h-100">
            <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
              <h2 className="h5 mb-0">COD revenue</h2>
              <select className="form-select form-select-sm" style={{ width: 120 }} value={days} onChange={(e) => setDays(Number(e.target.value))}>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
            {maxRevenue === 0 ? (
              <p className="text-secondary mb-0">No paid COD in this period yet.</p>
            ) : (
              <RevenueBars series={data.revenue_by_day} />
            )}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="surface-panel p-4 h-100">
            <h2 className="h5 mb-3">Pipeline</h2>
            <ul className="list-unstyled mb-0">
              <li className="d-flex justify-content-between py-2 border-bottom">
                <span>Pending shop accept</span>
                <strong>{summary.orders_pending}</strong>
              </li>
              <li className="d-flex justify-content-between py-2 border-bottom">
                <span>Ready for riders</span>
                <strong>{summary.orders_ready}</strong>
              </li>
              <li className="d-flex justify-content-between py-2 border-bottom">
                <span>In delivery</span>
                <strong>{summary.orders_in_delivery}</strong>
              </li>
              <li className="d-flex justify-content-between py-2 border-bottom">
                <span>Delivered</span>
                <strong>{summary.orders_delivered}</strong>
              </li>
              <li className="d-flex justify-content-between py-2">
                <span>Cancelled</span>
                <strong>{summary.orders_cancelled}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Live orders</h2>
        <Link to="/admin/live" className="btn btn-sm btn-outline-secondary">Open live board</Link>
      </div>

      {(data.live_orders || []).length === 0 ? (
        <p className="text-secondary mb-4">No active orders right now.</p>
      ) : (
        <div className="table-responsive mb-4">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Shop</th>
                <th>Customer</th>
                <th>Rider</th>
                <th>Status</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.live_orders.slice(0, 10).map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.shop?.name || '—'}</td>
                  <td>{order.customer?.name}</td>
                  <td>{order.rider?.name || 'Unassigned'}</td>
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

      <h2 className="h5 mb-3">Shop performance</h2>
      {(data.shop_performance || []).length === 0 ? (
        <p className="text-secondary mb-4">No shops yet.</p>
      ) : (
        <div className="table-responsive mb-4">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Orders</th>
                <th>Delivered</th>
                <th>Cancelled</th>
                <th>Accept %</th>
                <th>COD paid</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.shop_performance.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    {shop.name}
                    <div className="small text-secondary">{shop.is_open ? 'Open' : 'Closed'}</div>
                  </td>
                  <td>{shop.orders_total}</td>
                  <td>{shop.orders_delivered}</td>
                  <td>{shop.orders_cancelled}</td>
                  <td>{shop.acceptance_rate == null ? '—' : `${shop.acceptance_rate}%`}</td>
                  <td>{money(shop.revenue_paid)}</td>
                  <td className="text-end">
                    <Link to={`/admin/shops/${shop.id}`} className="btn btn-sm btn-outline-secondary">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="h5 mb-3">Top riders</h2>
      {(data.top_riders || []).length === 0 ? (
        <p className="text-secondary mb-0">No riders yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Rider</th>
                <th>Active</th>
                <th>Delivered</th>
                <th>COD collected</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.top_riders.map((rider) => (
                <tr key={rider.id}>
                  <td>
                    {rider.name}
                    <div className="small text-secondary">{rider.email}</div>
                  </td>
                  <td>{rider.active_orders_count}</td>
                  <td>{rider.delivered_orders_count}</td>
                  <td>{money(rider.cod_collected)}</td>
                  <td className="text-end">
                    <Link to={`/admin/riders/${rider.id}`} className="btn btn-sm btn-outline-secondary">View</Link>
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
