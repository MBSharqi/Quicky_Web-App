import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadNotifications() {
    const data = await listNotifications()
    setNotifications(data.data ?? [])
  }

  useEffect(() => {
    let active = true

    loadNotifications()
      .catch(() => {
        if (active) {
          setError('Unable to load notifications.')
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

  async function handleMarkRead(id) {
    setBusy(true)
    try {
      const updated = await markNotificationRead(id)
      setNotifications((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      )
      window.dispatchEvent(new Event('notifications:refresh'))
    } finally {
      setBusy(false)
    }
  }

  async function handleMarkAllRead() {
    setBusy(true)
    try {
      await markAllNotificationsRead()
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          read_at: item.read_at ?? new Date().toISOString(),
        })),
      )
      window.dispatchEvent(new Event('notifications:refresh'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Notifications</h1>
          <p className="text-secondary mb-0">Order updates for your account</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={busy || notifications.every((item) => item.read_at)}
          onClick={handleMarkAllRead}
        >
          Mark all read
        </button>
      </div>

      {loading && <p className="text-secondary">Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && notifications.length === 0 && (
        <p className="text-secondary mb-0">No notifications yet.</p>
      )}

      <div className="list-group">
        {notifications.map((notification) => {
          const unread = !notification.read_at
          const orderId = notification.data?.order_id

          return (
            <div
              key={notification.id}
              className={`list-group-item list-group-item-action${unread ? ' list-group-item-light' : ''}`}
            >
              <div className="d-flex justify-content-between gap-3">
                <div>
                  <p className="mb-1">{notification.data?.message}</p>
                  <div className="small text-secondary">
                    {new Date(notification.created_at).toLocaleString()}
                    {orderId && (
                      <>
                        {' · '}
                        <Link to={`/orders/${orderId}`}>View order</Link>
                      </>
                    )}
                  </div>
                </div>
                {unread && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success align-self-start"
                    disabled={busy}
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
