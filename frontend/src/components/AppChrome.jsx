import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminLayout from './AdminLayout'
import AppHeader from './AppHeader'

function isAdminWorkspace(pathname) {
  return (
    pathname.startsWith('/admin')
    || pathname.startsWith('/orders')
    || pathname === '/notifications'
    || pathname === '/dashboard'
  )
}

export default function AppChrome() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) {
    return <div className="container py-5 text-secondary">Loading...</div>
  }

  if (user?.role === 'admin' && isAdminWorkspace(pathname)) {
    return <AdminLayout />
  }

  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  )
}
