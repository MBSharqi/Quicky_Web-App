import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getUnreadCount } from '../api/notifications'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useCms } from '../context/CmsContext'

export default function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const { settings, pages } = useCms()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return undefined
    }

    let active = true

    function refreshCount() {
      getUnreadCount()
        .then((count) => {
          if (active) {
            setUnreadCount(count)
          }
        })
        .catch(() => {
          if (active) {
            setUnreadCount(0)
          }
        })
    }

    refreshCount()
    window.addEventListener('notifications:refresh', refreshCount)
    const intervalId = window.setInterval(refreshCount, 30000)

    return () => {
      active = false
      window.removeEventListener('notifications:refresh', refreshCount)
      window.clearInterval(intervalId)
    }
  }, [isAuthenticated])

  async function handleLogout() {
    await logout()
  }

  return (
    <header className="site-header">
      <div className="container py-3 d-flex align-items-center justify-content-between gap-3">
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.brand_name} style={{ height: 34 }} />
          ) : (
            <span className="brand-mark">{settings.brand_name}</span>
          )}
        </Link>

        <nav className="site-nav d-flex align-items-center gap-3 flex-wrap justify-content-end">
          <NavLink to="/" end>Browse</NavLink>

          {pages.map((page) => (
            <NavLink key={page.slug} to={`/p/${page.slug}`}>
              {page.title}
            </NavLink>
          ))}

          <NavLink to="/cart">
            Cart
            {itemCount > 0 && <span className="nav-badge">{itemCount}</span>}
          </NavLink>

          {isAuthenticated ? (
            <>
              {user.role === 'admin' && (
                <NavLink to="/admin">Admin</NavLink>
              )}

              {user.role === 'shop' && (
                <>
                  <NavLink to="/shop">My shop</NavLink>
                  <NavLink to="/shop/menu">Menu</NavLink>
                  <NavLink to="/orders">Orders</NavLink>
                </>
              )}

              {user.role === 'rider' && (
                <>
                  <NavLink to="/rider/jobs">Available jobs</NavLink>
                  <NavLink to="/orders">Orders</NavLink>
                </>
              )}

              {user.role === 'customer' && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/orders">Orders</NavLink>
                </>
              )}

              {user.role !== 'admin' && (
                <NavLink to="/notifications">
                  Alerts
                  {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
                </NavLink>
              )}

              <span className="text-secondary small">{user.name}</span>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn btn-success btn-sm">Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
