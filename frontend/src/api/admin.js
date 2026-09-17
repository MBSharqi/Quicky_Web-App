import api from './axios'

export async function getAdminOverview(days = 7) {
  const { data } = await api.get('/admin/overview', { params: { days } })
  return data
}

export async function getAdminLiveOrders() {
  const { data } = await api.get('/admin/live-orders')
  return data
}

export async function listAdminCustomers({ page = 1, q = '' } = {}) {
  const { data } = await api.get('/admin/customers', {
    params: {
      page,
      ...(q ? { q } : {}),
    },
  })
  return data
}

export async function getAdminCustomer(id) {
  const { data } = await api.get(`/admin/customers/${id}`)
  return data
}
