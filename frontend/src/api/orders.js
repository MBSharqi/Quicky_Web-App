import api from './axios'

export async function geocodeAddress(query) {
  const { data } = await api.get('/geocode', { params: { query } })
  return data
}

export async function listOrders({ page = 1, status = '', payment_status = '' } = {}) {
  const { data } = await api.get('/orders', {
    params: {
      page,
      ...(status ? { status } : {}),
      ...(payment_status ? { payment_status } : {}),
    },
  })
  return data
}

export async function listAvailableOrders(page = 1) {
  const { data } = await api.get('/orders/available', { params: { page } })
  return data
}

export async function listShopOrders({ page = 1, status = '' } = {}) {
  const { data } = await api.get('/shop/orders', {
    params: {
      page,
      ...(status ? { status } : {}),
    },
  })
  return data
}

export async function getOrder(id) {
  const { data } = await api.get(`/orders/${id}`)
  return data.order
}

export async function getShopOrder(id) {
  const { data } = await api.get(`/shop/orders/${id}`)
  return data.order
}

export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload)
  return data.order
}

export async function createShopOrder(payload) {
  const { data } = await api.post('/orders/shop', payload)
  return data.order
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.patch(`/orders/${id}/status`, { status })
  return data.order
}

export async function updateOrderPayment(id, paymentStatus = 'paid') {
  const { data } = await api.patch(`/orders/${id}/payment`, { payment_status: paymentStatus })
  return data.order
}

export async function updateOrderLocation(id, lat, lng) {
  const { data } = await api.patch(`/orders/${id}/location`, { lat, lng })
  return data.order
}

export async function assignOrder(id, riderId) {
  const { data } = await api.patch(`/orders/${id}/assign`, { rider_id: riderId })
  return data.order
}

export async function claimOrder(id) {
  const { data } = await api.patch(`/orders/${id}/claim`)
  return data.order
}

export async function completeOrder(id) {
  const { data } = await api.patch(`/orders/${id}/complete`)
  return data.order
}

export async function acceptShopOrder(id) {
  const { data } = await api.patch(`/shop/orders/${id}/accept`)
  return data.order
}

export async function rejectShopOrder(id) {
  const { data } = await api.patch(`/shop/orders/${id}/reject`)
  return data.order
}

export async function releaseShopOrder(id) {
  const { data } = await api.patch(`/shop/orders/${id}/release`)
  return data.order
}

export async function listRiders() {
  const { data } = await api.get('/riders')
  return data
}
