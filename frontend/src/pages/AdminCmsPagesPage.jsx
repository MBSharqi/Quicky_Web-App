import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createAdminPage, deleteAdminPage, listAdminPages, updateAdminPage } from '../api/cms'
import { useCms } from '../context/CmsContext'

const emptyForm = {
  title: '',
  slug: '',
  body: '',
  is_published: true,
}

export default function AdminCmsPagesPage() {
  const { refresh } = useCms()
  const [pages, setPages] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const data = await listAdminPages()
    setPages(data)
  }

  useEffect(() => {
    let active = true
    listAdminPages()
      .then((data) => {
        if (active) {
          setPages(data)
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load pages.')
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

  function startEdit(page) {
    setEditingId(page.id)
    setForm({
      title: page.title || '',
      slug: page.slug || '',
      body: page.body || '',
      is_published: Boolean(page.is_published),
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
      slug: form.slug || null,
      body: form.body || null,
    }

    try {
      if (editingId) {
        await updateAdminPage(editingId, payload)
        setMessage('Page updated.')
      } else {
        await createAdminPage(payload)
        setMessage('Page created.')
      }
      resetForm()
      await load()
      await refresh().catch(() => {})
    } catch (err) {
      setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})?.[0]?.[0] || 'Unable to save page.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this page?')) {
      return
    }
    setBusy(true)
    try {
      await deleteAdminPage(id)
      if (editingId === id) {
        resetForm()
      }
      await load()
      await refresh().catch(() => {})
    } catch {
      setError('Unable to delete page.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-secondary mb-0">Static content like About</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/cms" className="btn btn-outline-secondary">Settings</Link>
          <Link to="/admin/cms/banners" className="btn btn-outline-secondary">Banners</Link>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <form className="border rounded-3 bg-white p-4" onSubmit={handleSubmit}>
            <h2 className="h6 mb-3">{editingId ? `Edit page #${editingId}` : 'New page'}</h2>
            <div className="mb-3">
              <label className="form-label" htmlFor="title">Title</label>
              <input id="title" name="title" className="form-control" value={form.title} onChange={updateField} required />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="slug">Slug</label>
              <input id="slug" name="slug" className="form-control" value={form.slug} onChange={updateField} placeholder="about" />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="body">Body</label>
              <textarea id="body" name="body" className="form-control" rows={8} value={form.body} onChange={updateField} />
            </div>
            <div className="form-check mb-3">
              <input id="is_published" name="is_published" type="checkbox" className="form-check-input" checked={form.is_published} onChange={updateField} />
              <label className="form-check-label" htmlFor="is_published">Published</label>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success" disabled={busy}>
                {busy ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        <div className="col-lg-7">
          {loading && <p className="text-secondary">Loading...</p>}
          {!loading && pages.length === 0 && <p className="text-secondary">No pages yet.</p>}
          <div className="d-flex flex-column gap-3">
            {pages.map((page) => (
              <div key={page.id} className="border rounded-3 bg-white p-3">
                <div className="d-flex justify-content-between gap-2">
                  <div>
                    <strong>{page.title}</strong>
                    <div className="small text-secondary">/{page.slug} · {page.is_published ? 'Published' : 'Draft'}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/p/${page.slug}`} className="btn btn-sm btn-outline-success">View</Link>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(page)}>Edit</button>
                    <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => handleDelete(page.id)}>Delete</button>
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
