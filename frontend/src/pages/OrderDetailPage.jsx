import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import OrderMap from '../components/OrderMap'
import {
  acceptShopOrder,
  assignOrder,
  claimOrder,
  completeOrder,
  getOrder,
  listRiders,
  rejectShopOrder,
  releaseShopOrder,
  updateOrderLocation,
  updateOrderPayment,
  updateOrderStatus,
} from '../api/orders'
import { useAuth } from '../context/AuthContext'

function statusLabel(status) {
  return status.replaceAll('_', ' ')
}

function nextActions(user, order) {
  if (!user || !order) {
    return []
  }

  if (user.role === 'customer' && order.status === 'pending') {
    return [{ label: 'Cancel order', status: 'cancelled', variant: 'outline-danger' }]
  }

  if (user.role === 'rider') {
    if (order.status === 'assigned') {
      return [{ label: 'Mark picked up', status: 'picked_up', variant: 'success' }]
    }
    if (order.status === 'picked_up' && order.payment_status === 'paid') {
      return [{ label: 'Mark delivered', status: 'delivered', variant: 'success' }]
    }
  }

  if (user.role === 'admin') {
    if (['pending', 'accepted', 'ready_for_pickup'].includes(order.status)) {
      return [{ label: 'Cancel order', status: 'cancelled', variant: 'outline-danger' }]
    }
    if (order.status === 'assigned') {
      return [
        { label: 'Mark picked up', status: 'picked_up', variant: 'success' },
        { label: 'Cancel order', status: 'cancelled', variant: 'outline-danger' },
      ]
    }
    if (order.status === 'picked_up') {
      return [{ label: 'Mark delivered', status: 'delivered', variant: 'success' }]
    }
  }

  return []
}

function canMarkPaid(user, order) {
  if (!user || !order || order.payment_status === 'paid' || order.status === 'cancelled') {
    return false
  }

  if (user.role === 'admin') {
    return true
  }

  return user.role === 'rider'
    && order.rider_id === user.id
    && ['picked_up', 'delivered'].includes(order.status)
}

function canShareLocation(user, order) {
  return user?.role === 'rider'
    && order?.rider_id === user.id
    && ['assigned', 'picked_up'].includes(order.status)
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [riders, setRiders] = useState([])
  const [riderId, setRiderId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [tracking, setTracking] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')

  async function refreshOrder() {
    const currentOrder = await getOrder(id)
    setOrder(currentOrder)
    return currentOrder
  }

  useEffect(() => {
    let active = true

    Promise.all([
      getOrder(id),
      user.role === 'admin' ? listRiders() : Promise.resolve([]),
    ])
      .then(([currentOrder, riderList]) => {
        if (!active) {
          return
        }
        setOrder(currentOrder)
        setRiders(riderList)
      })
      .catch(() => {
        if (active) {
          setError('Unable to load order.')
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
  }, [id, user.role])

  useEffect(() => {
    if (!order || !['assigned', 'picked_up', 'ready_for_pickup'].includes(order.status)) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      getOrder(id)
        .then(setOrder)
        .catch(() => {})
    }, 15000)

    return () => window.clearInterval(intervalId)
  }, [id, order?.status])

  useEffect(() => {
    if (!tracking || !order || !canShareLocation(user, order)) {
      return undefined
    }

    let cancelled = false

    async function pushLocation(position) {
      if (cancelled) {
        return
      }
      try {
        const updated = await updateOrderLocation(id, position.coords.latitude, position.coords.longitude)
        setOrder(updated)
        setLocationMessage('Location shared.')
      } catch {
        setLocationMessage('Unable to update location.')
      }
    }

    function onError() {
      setLocationMessage('Location permission denied or unavailable.')
      setTracking(false)
    }

    navigator.geolocation.getCurrentPosition(pushLocation, onError, { enableHighAccuracy: true })
    const watchId = navigator.geolocation.watchPosition(pushLocation, onError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 20000,
    })

    return () => {
      cancelled = true
      navigator.geolocation.clearWatch(watchId)
    }
  }, [tracking, id, user, order?.status, order?.rider_id])

  async function handleStatus(status) {
    setBusy(true)
    setActionError('')
    try {
      const updated = await updateOrderStatus(id, status)
      setOrder(updated)
      if (!['assigned', 'picked_up'].includes(updated.status)) {
        setTracking(false)
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to update status.')
    } finally {
      setBusy(false)
    }
  }

  async function handleAssign(event) {
    event.preventDefault()
    setBusy(true)
    setActionError('')
    try {
      const updated = await assignOrder(id, Number(riderId))
      setOrder(updated)
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data?.errors?.rider_id?.[0] || 'Unable to assign rider.')
    } finally {
      setBusy(false)
    }
  }

  async function handleMarkPaid() {
    setBusy(true)
    setActionError('')
    try {
      const updated = await updateOrderPayment(id)
      setOrder(updated)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to update payment.')
    } finally {
      setBusy(false)
    }
  }

  async function handleShopAction(action) {
    setBusy(true)
    setActionError('')
    try {
      const updated = action === 'accept'
        ? await acceptShopOrder(id)
        : action === 'reject'
          ? await rejectShopOrder(id)
          : await releaseShopOrder(id)
      setOrder(updated)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to update order.')
    } finally {
      setBusy(false)
    }
  }

  async function handleClaim() {
    setBusy(true)
    setActionError('')
    try {
      const updated = await claimOrder(id)
      setOrder(updated)
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data?.errors?.order?.[0] || 'Unable to claim order.')
    } finally {
      setBusy(false)
    }
  }

  async function handleComplete() {
    setBusy(true)
    setActionError('')
    try {
      const updated = await completeOrder(id)
      setOrder(updated)
      setTracking(false)
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data?.errors?.order?.[0] || 'Unable to complete order.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="container py-5 text-secondary">Loading...</div>
  }

  if (error || !order) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Order not found.'}</div>
        <Link to="/orders">Back to orders</Link>
      </div>
    )
  }

  const actions = nextActions(user, order)
  const pickup = Number.isFinite(order.pickup_lat) && Number.isFinite(order.pickup_lng)
    ? [order.pickup_lat, order.pickup_lng]
    : null
  const dropoff = Number.isFinite(order.dropoff_lat) && Number.isFinite(order.dropoff_lng)
    ? [order.dropoff_lat, order.dropoff_lng]
    : null
  const riderPoint = Number.isFinite(order.rider_lat) && Number.isFinite(order.rider_lng)
    ? [order.rider_lat, order.rider_lng]
    : null
  const canAdminAssign = user.role === 'admin'
    && ((order.shop_id && order.status === 'ready_for_pickup') || (!order.shop_id && order.status === 'pending'))
  const canShopAccept = user.role === 'shop' && order.status === 'pending'
  const canShopRelease = user.role === 'shop' && order.status === 'accepted'
  const canRiderClaim = user.role === 'rider' && order.status === 'ready_for_pickup' && !order.rider_id
  const canComplete = ['admin', 'rider'].includes(user.role)
    && (user.role === 'admin' || order.rider_id === user.id)
    && ['picked_up', 'delivered'].includes(order.status)
    && order.payment_status !== 'paid'

  return (
    <div className="container py-5" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Order #{order.id}</h1>
          <p className="text-secondary mb-0 text-capitalize">
            Status: {statusLabel(order.status)}
            {order.shop?.name ? ` · ${order.shop.name}` : ''}
          </p>
        </div>
        <Link to="/orders" className="btn btn-outline-secondary btn-sm">Back</Link>
      </div>

      {actionError && <div className="alert alert-danger">{actionError}</div>}

      {(pickup || dropoff || riderPoint) && (
        <div className="mb-4">
          <h2 className="h6 text-uppercase text-secondary mb-2">Live map</h2>
          <OrderMap pickup={pickup} dropoff={dropoff} rider={riderPoint} height={360} />
          {order.rider_location_updated_at && (
            <p className="small text-secondary mt-2 mb-0">
              Rider last updated: {new Date(order.rider_location_updated_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {order.items?.length > 0 && (
        <div className="border rounded-3 bg-white p-3 mb-4">
          <h2 className="h6 text-uppercase text-secondary mb-3">Items</h2>
          <ul className="list-unstyled mb-0">
            {order.items.map((item) => (
              <li key={item.id} className="d-flex justify-content-between py-1">
                <span>{item.name} × {item.quantity}</span>
                <span>{Number(item.line_total).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <h2 className="h6 text-uppercase text-secondary">Pickup</h2>
          <p className="mb-1 fw-semibold">{order.pickup_contact_name}</p>
          <p className="mb-1">{order.pickup_address}</p>
          <p className="mb-1">{order.pickup_city}</p>
          <p className="mb-0 text-secondary">{order.pickup_contact_phone}</p>
        </div>
        <div className="col-md-6">
          <h2 className="h6 text-uppercase text-secondary">Dropoff</h2>
          <p className="mb-1 fw-semibold">{order.dropoff_contact_name}</p>
          <p className="mb-1">{order.dropoff_address}</p>
          <p className="mb-1">{order.dropoff_city}</p>
          <p className="mb-0 text-secondary">{order.dropoff_contact_phone}</p>
        </div>
      </div>

      {(order.package_description || order.notes) && (
        <div className="mb-4">
          {order.package_description && !order.shop_id && (
            <p className="mb-1"><span className="text-secondary">Package:</span> {order.package_description}</p>
          )}
          {order.notes && (
            <p className="mb-0"><span className="text-secondary">Notes:</span> {order.notes}</p>
          )}
        </div>
      )}

      <div className="mb-4">
        <p className="mb-1"><span className="text-secondary">Customer:</span> {order.customer?.name}</p>
        <p className="mb-1"><span className="text-secondary">Rider:</span> {order.rider?.name || 'Unassigned'}</p>
        <p className="mb-1 text-uppercase"><span className="text-secondary text-capitalize">Payment method:</span> {order.payment_method}</p>
        <p className="mb-1 text-capitalize"><span className="text-secondary">Payment status:</span> {order.payment_status}</p>
        <p className="mb-1"><span className="text-secondary">Subtotal:</span> {Number(order.subtotal || 0).toFixed(2)}</p>
        <p className="mb-1"><span className="text-secondary">Delivery fee:</span> {Number(order.delivery_fee).toFixed(2)}</p>
        <p className="mb-0"><span className="text-secondary">Total:</span> {Number(order.total ?? order.delivery_fee).toFixed(2)}</p>
      </div>

      {canAdminAssign && (
        <form className="d-flex flex-wrap gap-2 align-items-end mb-4" onSubmit={handleAssign}>
          <div>
            <label className="form-label" htmlFor="rider_id">Assign rider</label>
            <select id="rider_id" className="form-select" value={riderId} onChange={(e) => setRiderId(e.target.value)} required>
              <option value="">Select rider</option>
              {riders.map((rider) => (
                <option key={rider.id} value={rider.id}>{rider.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-success" disabled={busy || !riderId}>
            Assign
          </button>
        </form>
      )}

      <div className="d-flex flex-wrap gap-2 mb-3">
        {canShopAccept && (
          <>
            <button type="button" className="btn btn-success" disabled={busy} onClick={() => handleShopAction('accept')}>
              Accept order
            </button>
            <button type="button" className="btn btn-outline-danger" disabled={busy} onClick={() => handleShopAction('reject')}>
              Reject order
            </button>
          </>
        )}

        {canShopRelease && (
          <button type="button" className="btn btn-success" disabled={busy} onClick={() => handleShopAction('release')}>
            Release to riders
          </button>
        )}

        {canRiderClaim && (
          <button type="button" className="btn btn-success" disabled={busy} onClick={handleClaim}>
            Claim this order
          </button>
        )}

        {canComplete && (
          <button type="button" className="btn btn-success" disabled={busy} onClick={handleComplete}>
            Complete & collect COD
          </button>
        )}

        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            className={`btn btn-${action.variant}`}
            disabled={busy}
            onClick={() => handleStatus(action.status)}
          >
            {action.label}
          </button>
        ))}

        {canMarkPaid(user, order) && (
          <button type="button" className="btn btn-outline-success" disabled={busy} onClick={handleMarkPaid}>
            Mark COD as paid
          </button>
        )}

        {canShareLocation(user, order) && (
          <button
            type="button"
            className={`btn ${tracking ? 'btn-warning' : 'btn-outline-warning'}`}
            disabled={busy}
            onClick={() => setTracking((current) => !current)}
          >
            {tracking ? 'Stop sharing location' : 'Share live location'}
          </button>
        )}

        <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={() => refreshOrder()}>
          Refresh
        </button>
      </div>

      {locationMessage && <p className="small text-secondary mb-0">{locationMessage}</p>}
    </div>
  )
}
