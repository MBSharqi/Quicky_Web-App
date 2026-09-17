import api from './axios'

export async function listAdminRiders({ page = 1, q = '' } = {}) {
  const { data } = await api.get('/admin/riders', {
    params: {
      page,
      ...(q ? { q } : {}),
    },
  })
  return data
}

export async function getAdminRider(id) {
  const { data } = await api.get(`/admin/riders/${id}`)
  return data.rider
}

export async function createAdminRider(payload) {
  const { data } = await api.post('/admin/riders', payload)
  return data.rider
}

export async function updateAdminRider(id, payload) {
  const { data } = await api.put(`/admin/riders/${id}`, payload)
  return data.rider
}
