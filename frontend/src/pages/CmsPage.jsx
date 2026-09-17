import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicPage } from '../api/cms'

export default function CmsPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    getPublicPage(slug)
      .then((data) => {
        if (active) {
          setPage(data)
        }
      })
      .catch(() => {
        if (active) {
          setError('Page not found.')
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
  }, [slug])

  if (loading) {
    return <div className="container py-5 text-secondary">Loading...</div>
  }

  if (error || !page) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Page not found.'}</div>
        <Link to="/">Back home</Link>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <h1 className="h3 mb-4">{page.title}</h1>
      <div className="cms-page-body" style={{ whiteSpace: 'pre-wrap' }}>
        {page.body}
      </div>
    </div>
  )
}
