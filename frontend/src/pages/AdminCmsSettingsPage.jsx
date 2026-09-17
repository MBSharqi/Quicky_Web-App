import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminCmsSettings, updateAdminCmsSettings } from '../api/cms'
import { useCms } from '../context/CmsContext'

const FIELDS = [
  ['brand_name', 'Brand name'],
  ['logo_url', 'Logo URL'],
  ['hero_kicker', 'Hero kicker'],
  ['hero_title', 'Hero title'],
  ['hero_subtitle', 'Hero subtitle'],
  ['search_placeholder', 'Search placeholder'],
  ['search_button_label', 'Search button'],
  ['browse_title', 'Browse section title'],
  ['browse_subtitle', 'Browse section subtitle'],
  ['empty_shops_title', 'Empty shops title'],
  ['empty_shops_subtitle', 'Empty shops subtitle'],
  ['footer_text', 'Footer text'],
]

export default function AdminCmsSettingsPage() {
  const { refresh } = useCms()
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let active = true

    getAdminCmsSettings()
      .then((data) => {
        if (active) {
          setForm(data.settings || {})
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load CMS settings.')
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
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    setMessage('')
    setError('')

    try {
      const data = await updateAdminCmsSettings(form)
      setForm(data.settings || form)
      setMessage('Settings saved. Public pages will use the new copy.')
      await refresh().catch(() => {})
    } catch (err) {
      setErrors(err.response?.data?.errors || {})
      setError(err.response?.data?.message || 'Unable to save settings.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="container py-5 text-secondary">Loading...</div>
  }

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-secondary mb-0">Control brand, hero, and public copy</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/cms/banners" className="btn btn-outline-success">Banners</Link>
          <Link to="/admin/cms/pages" className="btn btn-outline-secondary">Pages</Link>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="border rounded-3 bg-white p-4">
        {FIELDS.map(([name, label]) => {
          const isLong = name.includes('subtitle') || name === 'footer_text'
          return (
            <div className="mb-3" key={name}>
              <label className="form-label" htmlFor={name}>{label}</label>
              {isLong ? (
                <textarea
                  id={name}
                  name={name}
                  rows={3}
                  className={`form-control${errors[`settings.${name}`] ? ' is-invalid' : ''}`}
                  value={form[name] || ''}
                  onChange={updateField}
                />
              ) : (
                <input
                  id={name}
                  name={name}
                  className={`form-control${errors[`settings.${name}`] ? ' is-invalid' : ''}`}
                  value={form[name] || ''}
                  onChange={updateField}
                />
              )}
              {errors[`settings.${name}`]?.[0] && (
                <div className="invalid-feedback">{errors[`settings.${name}`][0]}</div>
              )}
            </div>
          )
        })}

        <button type="submit" className="btn btn-success" disabled={busy}>
          {busy ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
