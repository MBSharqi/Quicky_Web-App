import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getUnreadCount } from '../api/notifications'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
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
    <header className="border-bottom bg-white sticky-top">
      <div className="container py-3 d-flex align-items-center justify-content-between gap-3">
        <Link to="/" className="text-decoration-none">
          <span className="fs-4 fw-bold text-success">Quicky</span>
        </Link>

        <nav className="d-flex align-items-center gap-3 flex-wrap justify-content-end">
          <NavLink to="/" className="text-decoration-none" end>
            Browse
          </NavLink>

          <NavLink to="/cart" className="text-decoration-none">
            Cart
            {itemCount > 0 && (
              <span className="badge text-bg-success ms-1">{itemCount}</span>
            )}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className="text-decoration-none">
                Dashboard
              </NavLink>

              {user.role === 'admin' && (
                <NavLink to="/admin/shops" className="text-decoration-none">
                  Shops
                </NavLink>
              )}

              {user.role === 'shop' && (
                <>
                  <NavLink to="/shop" className="text-decoration-none">
                    My shop
                  </NavLink>
                  <NavLink to="/shop/menu" className="text-decoration-none">
                    Menu
                  </NavLink>
                  <NavLink to="/orders" className="text-decoration-none">
                    Orders
                  </NavLink>
                </>
              )}

              {['admin', 'customer', 'rider'].includes(user.role) && (
                <NavLink to="/orders" className="text-decoration-none">
                  Orders
                </NavLink>
              )}

              <NavLink to="/notifications" className="text-decoration-none">
                Notifications
                {unreadCount > 0 && (
                  <span className="badge text-bg-success ms-1">{unreadCount}</span>
                )}
              </NavLink>

              <span className="text-secondary small">
                {user.name} · {user.role}
              </span>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-decoration-none">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn-success btn-sm">
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
