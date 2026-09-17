import api from './axios'

export async function listNotifications(page = 1) {
  const { data } = await api.get('/notifications', { params: { page } })
  return data
}

export async function getUnreadCount() {
  const { data } = await api.get('/notifications/unread-count')
  return data.count
}

export async function markNotificationRead(id) {
  const { data } = await api.post(`/notifications/${id}/read`)
  return data.notification
}

export async function markAllNotificationsRead() {
  await api.post('/notifications/read-all')
}
