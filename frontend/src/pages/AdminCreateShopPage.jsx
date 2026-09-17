import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAdminShop } from '../api/shops'

const initialForm = {
  name: '',
  type: 'restaurant',
  description: '',
  address: '',
  city: '',
  phone: '',
  logo_url: '',
  is_open: false,
  owner_name: '',
  owner_email: '',
  owner_password: '',
  owner_password_confirmation: '',
}

export default function AdminCreateShopPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const payload = {
        ...form,
        logo_url: form.logo_url || null,
        phone: form.phone || null,
        description: form.description || null,
      }
      const shop = await createAdminShop(payload)
      navigate(`/admin/shops/${shop.id}`, { replace: true })
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {
        form: [error.response?.data?.message || 'Unable to register shop.'],
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <h1 className="h3 mb-1">Register shop</h1>
      <p className="text-secondary mb-4">Create a merchant account and shop profile</p>

      {errors.form?.[0] && <div className="alert alert-danger">{errors.form[0]}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <h2 className="h5 mb-3">Shop details</h2>
        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <label className="form-label" htmlFor="name">Shop name</label>
            <input id="name" name="name" className={`form-control${errors.name ? ' is-invalid' : ''}`} value={form.name} onChange={updateField} required />
            {errors.name?.[0] && <div className="invalid-feedback">{errors.name[0]}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="type">Type</label>
            <select id="type" name="type" className={`form-select${errors.type ? ' is-invalid' : ''}`} value={form.type} onChange={updateField} required>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="shop">Shop</option>
            </select>
            {errors.type?.[0] && <div className="invalid-feedback">{errors.type[0]}</div>}
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="3" className={`form-control${errors.description ? ' is-invalid' : ''}`} value={form.description} onChange={updateField} />
            {errors.description?.[0] && <div className="invalid-feedback">{errors.description[0]}</div>}
          </div>
          <div className="col-md-8">
            <label className="form-label" htmlFor="address">Address</label>
            <input id="address" name="address" className={`form-control${errors.address ? ' is-invalid' : ''}`} value={form.address} onChange={updateField} required />
            {errors.address?.[0] && <div className="invalid-feedback">{errors.address[0]}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="city">City</label>
            <input id="city" name="city" className={`form-control${errors.city ? ' is-invalid' : ''}`} value={form.city} onChange={updateField} required />
            {errors.city?.[0] && <div className="invalid-feedback">{errors.city[0]}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="phone">Phone</label>
            <input id="phone" name="phone" className={`form-control${errors.phone ? ' is-invalid' : ''}`} value={form.phone} onChange={updateField} />
            {errors.phone?.[0] && <div className="invalid-feedback">{errors.phone[0]}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="logo_url">Logo URL</label>
            <input id="logo_url" name="logo_url" type="url" className={`form-control${errors.logo_url ? ' is-invalid' : ''}`} value={form.logo_url} onChange={updateField} />
            {errors.logo_url?.[0] && <div className="invalid-feedback">{errors.logo_url[0]}</div>}
          </div>
          <div className="col-12">
            <div className="form-check">
              <input id="is_open" name="is_open" type="checkbox" className="form-check-input" checked={form.is_open} onChange={updateField} />
              <label className="form-check-label" htmlFor="is_open">Open for orders</label>
            </div>
          </div>
        </div>

        <h2 className="h5 mb-3">Owner account</h2>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label" htmlFor="owner_name">Owner name</label>
            <input id="owner_name" name="owner_name" className={`form-control${errors.owner_name ? ' is-invalid' : ''}`} value={form.owner_name} onChange={updateField} required />
            {errors.owner_name?.[0] && <div className="invalid-feedback">{errors.owner_name[0]}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="owner_email">Owner email</label>
            <input id="owner_email" name="owner_email" type="email" className={`form-control${errors.owner_email ? ' is-invalid' : ''}`} value={form.owner_email} onChange={updateField} required />
            {errors.owner_email?.[0] && <div className="invalid-feedback">{errors.owner_email[0]}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="owner_password">Password</label>
            <input id="owner_password" name="owner_password" type="password" className={`form-control${errors.owner_password ? ' is-invalid' : ''}`} value={form.owner_password} onChange={updateField} required />
            {errors.owner_password?.[0] && <div className="invalid-feedback">{errors.owner_password[0]}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="owner_password_confirmation">Confirm password</label>
            <input id="owner_password_confirmation" name="owner_password_confirmation" type="password" className="form-control" value={form.owner_password_confirmation} onChange={updateField} required />
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create shop'}
          </button>
          <Link to="/admin/shops" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
