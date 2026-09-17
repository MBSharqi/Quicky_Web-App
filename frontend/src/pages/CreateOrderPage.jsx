import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OrderMap from '../components/OrderMap'
import { createOrder, geocodeAddress } from '../api/orders'

const initialForm = {
  pickup_address: '',
  pickup_city: '',
  pickup_lat: '',
  pickup_lng: '',
  pickup_contact_name: '',
  pickup_contact_phone: '',
  dropoff_address: '',
  dropoff_city: '',
  dropoff_lat: '',
  dropoff_lng: '',
  dropoff_contact_name: '',
  dropoff_contact_phone: '',
  package_description: '',
  notes: '',
  payment_method: 'cod',
  delivery_fee: '100',
}

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [pinTarget, setPinTarget] = useState('pickup')
  const [mapMessage, setMapMessage] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function setCoords(target, lat, lng) {
    setForm((current) => ({
      ...current,
      [`${target}_lat`]: Number(lat).toFixed(7),
      [`${target}_lng`]: Number(lng).toFixed(7),
    }))
  }

  async function locate(target) {
    const address = form[`${target}_address`]
    const city = form[`${target}_city`]
    const query = [address, city].filter(Boolean).join(', ')

    if (query.length < 3) {
      setMapMessage('Enter an address and city before locating.')
      return
    }

    setMapMessage('Locating...')
    try {
      const result = await geocodeAddress(query)
      setCoords(target, result.lat, result.lng)
      setMapMessage(`${target === 'pickup' ? 'Pickup' : 'Dropoff'} located on map.`)
    } catch (error) {
      setMapMessage(error.response?.data?.message || 'Unable to locate address.')
    }
  }

  function handleMapClick([lat, lng]) {
    setCoords(pinTarget, lat, lng)
    setMapMessage(`${pinTarget === 'pickup' ? 'Pickup' : 'Dropoff'} pin set on map.`)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const order = await createOrder({
        ...form,
        pickup_lat: Number(form.pickup_lat),
        pickup_lng: Number(form.pickup_lng),
        dropoff_lat: Number(form.dropoff_lat),
        dropoff_lng: Number(form.dropoff_lng),
        delivery_fee: Number(form.delivery_fee),
      })
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {
        form: [error.response?.data?.message || 'Unable to create order.'],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const pickup = form.pickup_lat && form.pickup_lng
    ? [Number(form.pickup_lat), Number(form.pickup_lng)]
    : null
  const dropoff = form.dropoff_lat && form.dropoff_lng
    ? [Number(form.dropoff_lat), Number(form.dropoff_lng)]
    : null

  return (
    <div className="container py-5" style={{ maxWidth: 920 }}>
      <h1 className="h3 mb-1">New order</h1>
      <p className="text-secondary mb-4">Create a local delivery request with map pins</p>

      {errors.form?.[0] && <div className="alert alert-danger">{errors.form[0]}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <h2 className="h5 mb-3">Pickup</h2>
        <div className="row g-3 mb-3">
          <div className="col-md-8">
            <label className="form-label" htmlFor="pickup_address">Address</label>
            <input id="pickup_address" name="pickup_address" className={`form-control${errors.pickup_address ? ' is-invalid' : ''}`} value={form.pickup_address} onChange={updateField} required />
            {errors.pickup_address?.[0] && <div className="invalid-feedback">{errors.pickup_address[0]}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="pickup_city">City</label>
            <input id="pickup_city" name="pickup_city" className={`form-control${errors.pickup_city ? ' is-invalid' : ''}`} value={form.pickup_city} onChange={updateField} required />
            {errors.pickup_city?.[0] && <div className="invalid-feedback">{errors.pickup_city[0]}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="pickup_contact_name">Contact name</label>
            <input id="pickup_contact_name" name="pickup_contact_name" className={`form-control${errors.pickup_contact_name ? ' is-invalid' : ''}`} value={form.pickup_contact_name} onChange={updateField} required />
            {errors.pickup_contact_name?.[0] && <div className="invalid-feedback">{errors.pickup_contact_name[0]}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="pickup_contact_phone">Contact phone</label>
            <input id="pickup_contact_phone" name="pickup_contact_phone" className={`form-control${errors.pickup_contact_phone ? ' is-invalid' : ''}`} value={form.pickup_contact_phone} onChange={updateField} required />
            {errors.pickup_contact_phone?.[0] && <div className="invalid-feedback">{errors.pickup_contact_phone[0]}</div>}
          </div>
          <div className="col-12 d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-outline-success btn-sm" onClick={() => locate('pickup')}>
              Locate pickup
            </button>
            <button type="button" className={`btn btn-sm ${pinTarget === 'pickup' ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setPinTarget('pickup')}>
              Tap map for pickup
            </button>
            {(errors.pickup_lat || errors.pickup_lng) && (
              <span className="text-danger small align-self-center">Set pickup on the map</span>
            )}
          </div>
        </div>

        <h2 className="h5 mb-3">Dropoff</h2>
        <div className="row g-3 mb-3">
          <div className="col-md-8">
            <label className="form-label" htmlFor="dropoff_address">Address</label>
            <input id="dropoff_address" name="dropoff_address" className={`form-control${errors.dropoff_address ? ' is-invalid' : ''}`} value={form.dropoff_address} onChange={updateField} required />
            {errors.dropoff_address?.[0] && <div className="invalid-feedback">{errors.dropoff_address[0]}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="dropoff_city">City</label>
            <input id="dropoff_city" name="dropoff_city" className={`form-control${errors.dropoff_city ? ' is-invalid' : ''}`} value={form.dropoff_city} onChange={updateField} required />
            {errors.dropoff_city?.[0] && <div className="invalid-feedback">{errors.dropoff_city[0]}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="dropoff_contact_name">Contact name</label>
            <input id="dropoff_contact_name" name="dropoff_contact_name" className={`form-control${errors.dropoff_contact_name ? ' is-invalid' : ''}`} value={form.dropoff_contact_name} onChange={updateField} required />
            {errors.dropoff_contact_name?.[0] && <div className="invalid-feedback">{errors.dropoff_contact_name[0]}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="dropoff_contact_phone">Contact phone</label>
            <input id="dropoff_contact_phone" name="dropoff_contact_phone" className={`form-control${errors.dropoff_contact_phone ? ' is-invalid' : ''}`} value={form.dropoff_contact_phone} onChange={updateField} required />
            {errors.dropoff_contact_phone?.[0] && <div className="invalid-feedback">{errors.dropoff_contact_phone[0]}</div>}
          </div>
          <div className="col-12 d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => locate('dropoff')}>
              Locate dropoff
            </button>
            <button type="button" className={`btn btn-sm ${pinTarget === 'dropoff' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPinTarget('dropoff')}>
              Tap map for dropoff
            </button>
            {(errors.dropoff_lat || errors.dropoff_lng) && (
              <span className="text-danger small align-self-center">Set dropoff on the map</span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <OrderMap
            pickup={pickup}
            dropoff={dropoff}
            onMapClick={handleMapClick}
            height={360}
          />
          {mapMessage && <p className="small text-secondary mt-2 mb-0">{mapMessage}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="package_description">Package description</label>
          <input id="package_description" name="package_description" className={`form-control${errors.package_description ? ' is-invalid' : ''}`} value={form.package_description} onChange={updateField} />
          {errors.package_description?.[0] && <div className="invalid-feedback">{errors.package_description[0]}</div>}
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="payment_method">Payment method</label>
            <select id="payment_method" name="payment_method" className={`form-select${errors.payment_method ? ' is-invalid' : ''}`} value={form.payment_method} onChange={updateField} required>
              <option value="cod">Cash on delivery (COD)</option>
            </select>
            {errors.payment_method?.[0] && <div className="invalid-feedback">{errors.payment_method[0]}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="delivery_fee">Delivery fee</label>
            <input id="delivery_fee" name="delivery_fee" type="number" min="0" step="0.01" className={`form-control${errors.delivery_fee ? ' is-invalid' : ''}`} value={form.delivery_fee} onChange={updateField} required />
            {errors.delivery_fee?.[0] && <div className="invalid-feedback">{errors.delivery_fee[0]}</div>}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label" htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows="3" className={`form-control${errors.notes ? ' is-invalid' : ''}`} value={form.notes} onChange={updateField} />
          {errors.notes?.[0] && <div className="invalid-feedback">{errors.notes[0]}</div>}
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create order'}
          </button>
          <Link to="/orders" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
