import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAdminRider } from '../api/riders'

const initialForm = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

export default function AdminCreateRiderPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const rider = await createAdminRider(form)
      navigate(`/admin/riders/${rider.id}`, { replace: true })
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {
        form: [error.response?.data?.message || 'Unable to register rider.'],
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <h1 className="h3 mb-1">Register rider</h1>
      <p className="text-secondary mb-4">Create a rider account for the delivery network</p>

      {errors.form?.[0] && <div className="alert alert-danger">{errors.form[0]}</div>}

      <form onSubmit={handleSubmit} noValidate className="border rounded-3 bg-white p-4">
        <div className="mb-3">
          <label className="form-label" htmlFor="name">Full name</label>
          <input id="name" name="name" className={`form-control${errors.name ? ' is-invalid' : ''}`} value={form.name} onChange={updateField} required />
          {errors.name?.[0] && <div className="invalid-feedback">{errors.name[0]}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className={`form-control${errors.email ? ' is-invalid' : ''}`} value={form.email} onChange={updateField} required />
          {errors.email?.[0] && <div className="invalid-feedback">{errors.email[0]}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className={`form-control${errors.password ? ' is-invalid' : ''}`} value={form.password} onChange={updateField} required />
          {errors.password?.[0] && <div className="invalid-feedback">{errors.password[0]}</div>}
        </div>

        <div className="mb-4">
          <label className="form-label" htmlFor="password_confirmation">Confirm password</label>
          <input id="password_confirmation" name="password_confirmation" type="password" className="form-control" value={form.password_confirmation} onChange={updateField} required />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create rider'}
          </button>
          <Link to="/admin/riders" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
