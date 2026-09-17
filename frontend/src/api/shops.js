import api from './axios'

export async function listAdminShops(page = 1) {
  const { data } = await api.get('/admin/shops', { params: { page } })
  return data
}

export async function getAdminShop(id) {
  const { data } = await api.get(`/admin/shops/${id}`)
  return data.shop
}

export async function createAdminShop(payload) {
  const { data } = await api.post('/admin/shops', payload)
  return data.shop
}

export async function updateAdminShop(id, payload) {
  const { data } = await api.put(`/admin/shops/${id}`, payload)
  return data.shop
}

export async function getMyShop() {
  const { data } = await api.get('/shop')
  return data.shop
}

export async function updateMyShopStatus(isOpen) {
  const { data } = await api.patch('/shop/status', { is_open: isOpen })
  return data.shop
}

export async function listMenuItems(page = 1) {
  const { data } = await api.get('/shop/menu-items', { params: { page } })
  return data
}

export async function getMenuItem(id) {
  const { data } = await api.get(`/shop/menu-items/${id}`)
  return data.menu_item
}

export async function createMenuItem(payload) {
  const { data } = await api.post('/shop/menu-items', payload)
  return data.menu_item
}

export async function updateMenuItem(id, payload) {
  const { data } = await api.put(`/shop/menu-items/${id}`, payload)
  return data.menu_item
}

export async function deleteMenuItem(id) {
  await api.delete(`/shop/menu-items/${id}`)
}

export async function updateMenuItemAvailability(id, isAvailable) {
  const { data } = await api.patch(`/shop/menu-items/${id}/availability`, {
    is_available: isAvailable,
  })
  return data.menu_item
}

export async function listPublicShops({ page = 1, q = '' } = {}) {
  const { data } = await api.get('/shops', {
    params: {
      page,
      ...(q ? { q } : {}),
    },
  })
  return data
}

export async function getPublicShop(slug) {
  const { data } = await api.get(`/shops/${slug}`)
  return data.shop
}
