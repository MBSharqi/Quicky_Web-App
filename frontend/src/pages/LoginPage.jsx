import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const validationErrors = error.response?.data?.errors
      if (validationErrors) {
        setErrors(validationErrors)
      } else {
        setErrors({
          email: [error.response?.data?.message || 'Unable to log in.'],
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h1 className="h3 mb-1">Log in</h1>
      <p className="text-secondary mb-4">Access your Quicky account</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`form-control${errors.email ? ' is-invalid' : ''}`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          {errors.email?.[0] && <div className="invalid-feedback">{errors.email[0]}</div>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`form-control${errors.password ? ' is-invalid' : ''}`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          {errors.password?.[0] && <div className="invalid-feedback">{errors.password[0]}</div>}
        </div>

        <button type="submit" className="btn btn-success w-100" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-3 mb-0 text-secondary">
        No account? <Link to={`/register?redirect=${encodeURIComponent(redirectTo)}`}>Register</Link>
      </p>
    </div>
  )
}
