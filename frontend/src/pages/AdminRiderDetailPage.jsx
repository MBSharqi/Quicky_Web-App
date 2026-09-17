import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getAdminRider, updateAdminRider } from '../api/riders'

export default function AdminRiderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rider, setRider] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true

    getAdminRider(id)
      .then((data) => {
        if (!active) {
          return
        }
        setRider(data)
        setForm({
          name: data.name,
          email: data.email,
          password: '',
          password_confirmation: '',
        })
      })
      .catch(() => {
        if (active) {
          setError('Unable to load rider.')
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

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    setMessage('')

    const payload = {
      name: form.name,
      email: form.email,
    }

    if (form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    try {
      const updated = await updateAdminRider(id, payload)
      setRider((current) => ({ ...current, ...updated }))
      setForm((current) => ({ ...current, password: '', password_confirmation: '' }))
      setMessage('Rider updated.')
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {
        form: [err.response?.data?.message || 'Unable to update rider.'],
      })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="container py-5 text-secondary">Loading...</div>
  }

  if (error || !rider) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Rider not found.'}</div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/admin/riders')}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">{rider.name}</h1>
          <p className="text-secondary mb-0">{rider.email}</p>
        </div>
        <Link to="/admin/riders" className="btn btn-outline-secondary btn-sm">Back</Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6">
          <div className="border rounded-3 p-3 bg-white">
            <div className="text-secondary small mb-1">Active jobs</div>
            <div className="fs-4 fw-semibold">{rider.active_orders_count ?? 0}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="border rounded-3 p-3 bg-white">
            <div className="text-secondary small mb-1">Delivered</div>
            <div className="fs-4 fw-semibold">{rider.delivered_orders_count ?? 0}</div>
          </div>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {errors.form?.[0] && <div className="alert alert-danger">{errors.form[0]}</div>}

      <form onSubmit={handleSubmit} className="border rounded-3 bg-white p-4">
        <h2 className="h6 mb-3">Account</h2>
        <div className="mb-3">
          <label className="form-label" htmlFor="name">Name</label>
          <input id="name" name="name" className={`form-control${errors.name ? ' is-invalid' : ''}`} value={form.name} onChange={updateField} required />
          {errors.name?.[0] && <div className="invalid-feedback">{errors.name[0]}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className={`form-control${errors.email ? ' is-invalid' : ''}`} value={form.email} onChange={updateField} required />
          {errors.email?.[0] && <div className="invalid-feedback">{errors.email[0]}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="password">New password</label>
          <input id="password" name="password" type="password" className={`form-control${errors.password ? ' is-invalid' : ''}`} value={form.password} onChange={updateField} />
          {errors.password?.[0] && <div className="invalid-feedback">{errors.password[0]}</div>}
        </div>
        <div className="mb-4">
          <label className="form-label" htmlFor="password_confirmation">Confirm new password</label>
          <input id="password_confirmation" name="password_confirmation" type="password" className="form-control" value={form.password_confirmation} onChange={updateField} />
        </div>
        <button type="submit" className="btn btn-success" disabled={busy}>
          {busy ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
