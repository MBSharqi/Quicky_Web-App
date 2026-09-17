import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const validationErrors = error.response?.data?.errors
      if (validationErrors) {
        setErrors(validationErrors)
      } else {
        setErrors({
          email: [error.response?.data?.message || 'Unable to register.'],
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 480 }}>
      <h1 className="h3 mb-1">Create account</h1>
      <p className="text-secondary mb-4">Register as a Quicky customer to place orders</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            id="name"
            type="text"
            className={`form-control${errors.name ? ' is-invalid' : ''}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
          {errors.name?.[0] && <div className="invalid-feedback">{errors.name[0]}</div>}
        </div>

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

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`form-control${errors.password ? ' is-invalid' : ''}`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          {errors.password?.[0] && <div className="invalid-feedback">{errors.password[0]}</div>}
        </div>

        <div className="mb-4">
          <label htmlFor="password_confirmation" className="form-label">
            Confirm password
          </label>
          <input
            id="password_confirmation"
            type="password"
            className="form-control"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-success w-100" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-3 mb-0 text-secondary">
        Already registered? <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`}>Log in</Link>
      </p>
    </div>
  )
}
