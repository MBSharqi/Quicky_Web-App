import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createMenuItem, getMenuItem, updateMenuItem } from '../api/shops'

const emptyForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  image_url: '',
  is_available: true,
  sort_order: '0',
}

export default function ShopMenuItemFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit) {
      return undefined
    }

    let active = true

    getMenuItem(id)
      .then((item) => {
        if (!active) {
          return
        }
        setForm({
          name: item.name ?? '',
          category: item.category ?? '',
          description: item.description ?? '',
          price: String(item.price ?? ''),
          image_url: item.image_url ?? '',
          is_available: Boolean(item.is_available),
          sort_order: String(item.sort_order ?? 0),
        })
      })
      .catch(() => {
        if (active) {
          setErrors({ form: ['Unable to load menu item.'] })
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
  }, [id, isEdit])

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

    const payload = {
      name: form.name,
      category: form.category || null,
      description: form.description || null,
      price: Number(form.price),
      image_url: form.image_url || null,
      is_available: form.is_available,
      sort_order: Number(form.sort_order || 0),
    }

    try {
      if (isEdit) {
        await updateMenuItem(id, payload)
      } else {
        await createMenuItem(payload)
      }
      navigate('/shop/menu', { replace: true })
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {
        form: [error.response?.data?.message || 'Unable to save menu item.'],
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="container py-5 text-secondary">Loading...</div>
  }

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <h1 className="h3 mb-1">{isEdit ? 'Edit menu item' : 'Add menu item'}</h1>
      <p className="text-secondary mb-4">Set name, price, category, and availability</p>

      {errors.form?.[0] && <div className="alert alert-danger">{errors.form[0]}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <label className="form-label" htmlFor="name">Name</label>
            <input id="name" name="name" className={`form-control${errors.name ? ' is-invalid' : ''}`} value={form.name} onChange={updateField} required />
            {errors.name?.[0] && <div className="invalid-feedback">{errors.name[0]}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="category">Category</label>
            <input id="category" name="category" className={`form-control${errors.category ? ' is-invalid' : ''}`} value={form.category} onChange={updateField} placeholder="e.g. Drinks" />
            {errors.category?.[0] && <div className="invalid-feedback">{errors.category[0]}</div>}
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="3" className={`form-control${errors.description ? ' is-invalid' : ''}`} value={form.description} onChange={updateField} />
            {errors.description?.[0] && <div className="invalid-feedback">{errors.description[0]}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="price">Price</label>
            <input id="price" name="price" type="number" min="0" step="0.01" className={`form-control${errors.price ? ' is-invalid' : ''}`} value={form.price} onChange={updateField} required />
            {errors.price?.[0] && <div className="invalid-feedback">{errors.price[0]}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="sort_order">Sort order</label>
            <input id="sort_order" name="sort_order" type="number" min="0" className={`form-control${errors.sort_order ? ' is-invalid' : ''}`} value={form.sort_order} onChange={updateField} />
            {errors.sort_order?.[0] && <div className="invalid-feedback">{errors.sort_order[0]}</div>}
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <div className="form-check mb-2">
              <input id="is_available" name="is_available" type="checkbox" className="form-check-input" checked={form.is_available} onChange={updateField} />
              <label className="form-check-label" htmlFor="is_available">Available</label>
            </div>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="image_url">Image URL</label>
            <input id="image_url" name="image_url" type="url" className={`form-control${errors.image_url ? ' is-invalid' : ''}`} value={form.image_url} onChange={updateField} />
            {errors.image_url?.[0] && <div className="invalid-feedback">{errors.image_url[0]}</div>}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create item'}
          </button>
          <Link to="/shop/menu" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
