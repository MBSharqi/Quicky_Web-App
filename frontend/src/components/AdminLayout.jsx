import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  Bell,
  Bike,
  ChevronLeft,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react'
import { getUnreadCount } from '../api/notifications'
import { useAuth } from '../context/AuthContext'
import { useCms } from '../context/CmsContext'

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/live', label: 'Live orders', icon: Activity },
  { to: '/orders', label: 'All orders', icon: ShoppingBag },
  { to: '/admin/shops', label: 'Shops', icon: Store },
  { to: '/admin/riders', label: 'Riders', icon: Bike },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/cms', label: 'Site settings', icon: Settings2, end: true },
  { to: '/admin/cms/banners', label: 'Banners', icon: Image },
  { to: '/admin/cms/pages', label: 'Pages', icon: FileText },
  { to: '/notifications', label: 'Alerts', icon: Bell },
]

const STORAGE_KEY = 'quicky_admin_sidebar'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { settings } = useCms()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === null) {
        return window.innerWidth >= 992
      }
      return stored === '1'
    } catch {
      return true
    }
  })
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, open ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [open])

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    if (window.innerWidth < 992) {
      setOpen(false)
    }
  }, [location.pathname])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const title = NAV.find((item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
  )?.label || 'Admin'

  return (
    <div className={`admin-shell${open ? ' is-open' : ''}`}>
      <div
        className="admin-sidebar-backdrop"
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar-glow" aria-hidden="true" />
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-brand-mark">
              {(settings.brand_name || 'Q').slice(0, 1)}
            </span>
            <div>
              <div className="admin-sidebar-brand-name">{settings.brand_name || 'Quicky'}</div>
              <div className="admin-sidebar-brand-sub">Admin</div>
            </div>
          </div>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => setOpen(false)}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} strokeWidth={2.25} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
                {item.to === '/notifications' && unreadCount > 0 && (
                  <span className="admin-nav-badge">{unreadCount}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-user-name">{user?.name}</div>
            <div className="admin-sidebar-user-role">{user?.email}</div>
          </div>
          <button type="button" className="admin-nav-link admin-logout" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={2} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-icon-btn admin-menu-btn"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} strokeWidth={2.25} />
            </button>
            <div>
              <div className="admin-topbar-kicker">Control center</div>
              <h1 className="admin-topbar-title">{title}</h1>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
