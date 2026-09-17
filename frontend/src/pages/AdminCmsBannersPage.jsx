import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createAdminBanner, deleteAdminBanner, listAdminBanners, updateAdminBanner } from '../api/cms'
import { useCms } from '../context/CmsContext'

const emptyForm = {
  title: '',
  subtitle: '',
  image_url: '',
  link_url: '/',
  cta_label: 'Learn more',
  is_active: true,
  sort_order: 0,
}

export default function AdminCmsBannersPage() {
  const { refresh } = useCms()
  const [banners, setBanners] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const data = await listAdminBanners()
    setBanners(data)
  }

  useEffect(() => {
    let active = true
    listAdminBanners()
      .then((data) => {
        if (active) {
          setBanners(data)
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load banners.')
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

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function startEdit(banner) {
    setEditingId(banner.id)
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      cta_label: banner.cta_label || '',
      is_active: Boolean(banner.is_active),
      sort_order: banner.sort_order ?? 0,
    })
    setMessage('')
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    const payload = {
      ...form,
      image_url: form.image_url || null,
      subtitle: form.subtitle || null,
      link_url: form.link_url || null,
      cta_label: form.cta_label || null,
      sort_order: Number(form.sort_order) || 0,
    }

    try {
      if (editingId) {
        await updateAdminBanner(editingId, payload)
        setMessage('Banner updated.')
      } else {
        await createAdminBanner(payload)
        setMessage('Banner created.')
      }
      resetForm()
      await load()
      await refresh().catch(() => {})
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save banner.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this banner?')) {
      return
    }
    setBusy(true)
    try {
      await deleteAdminBanner(id)
      if (editingId === id) {
        resetForm()
      }
      await load()
      await refresh().catch(() => {})
    } catch {
      setError('Unable to delete banner.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-secondary mb-0">Homepage promotional blocks</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/cms" className="btn btn-outline-secondary">Settings</Link>
          <Link to="/admin/cms/pages" className="btn btn-outline-secondary">Pages</Link>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <form className="border rounded-3 bg-white p-4" onSubmit={handleSubmit}>
            <h2 className="h6 mb-3">{editingId ? `Edit banner #${editingId}` : 'New banner'}</h2>
            <div className="mb-3">
              <label className="form-label" htmlFor="title">Title</label>
              <input id="title" name="title" className="form-control" value={form.title} onChange={updateField} required />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="subtitle">Subtitle</label>
              <textarea id="subtitle" name="subtitle" className="form-control" rows={2} value={form.subtitle} onChange={updateField} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="link_url">Link URL</label>
              <input id="link_url" name="link_url" className="form-control" value={form.link_url} onChange={updateField} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="cta_label">CTA label</label>
              <input id="cta_label" name="cta_label" className="form-control" value={form.cta_label} onChange={updateField} />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="sort_order">Sort order</label>
              <input id="sort_order" name="sort_order" type="number" className="form-control" value={form.sort_order} onChange={updateField} />
            </div>
            <div className="form-check mb-3">
              <input id="is_active" name="is_active" type="checkbox" className="form-check-input" checked={form.is_active} onChange={updateField} />
              <label className="form-check-label" htmlFor="is_active">Active</label>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success" disabled={busy}>
                {busy ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="col-lg-7">
          {loading && <p className="text-secondary">Loading...</p>}
          {!loading && banners.length === 0 && <p className="text-secondary">No banners yet.</p>}
          <div className="d-flex flex-column gap-3">
            {banners.map((banner) => (
              <div key={banner.id} className="border rounded-3 bg-white p-3">
                <div className="d-flex justify-content-between gap-2">
                  <div>
                    <strong>{banner.title}</strong>
                    <div className="small text-secondary">{banner.subtitle || 'No subtitle'}</div>
                    <div className="small text-secondary">
                      {banner.is_active ? 'Active' : 'Inactive'} · sort {banner.sort_order}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(banner)}>Edit</button>
                    <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => handleDelete(banner.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
