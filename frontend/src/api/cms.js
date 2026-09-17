import api from './axios'

export async function getPublicCms() {
  const { data } = await api.get('/cms')
  return data
}

export async function getPublicPage(slug) {
  const { data } = await api.get(`/pages/${slug}`)
  return data.page
}

export async function getAdminCmsSettings() {
  const { data } = await api.get('/admin/cms/settings')
  return data
}

export async function updateAdminCmsSettings(settings) {
  const { data } = await api.put('/admin/cms/settings', { settings })
  return data
}

export async function listAdminBanners() {
  const { data } = await api.get('/admin/cms/banners')
  return data.banners
}

export async function createAdminBanner(payload) {
  const { data } = await api.post('/admin/cms/banners', payload)
  return data.banner
}

export async function updateAdminBanner(id, payload) {
  const { data } = await api.put(`/admin/cms/banners/${id}`, payload)
  return data.banner
}

export async function deleteAdminBanner(id) {
  await api.delete(`/admin/cms/banners/${id}`)
}

export async function listAdminPages() {
  const { data } = await api.get('/admin/cms/pages')
  return data.pages
}

export async function createAdminPage(payload) {
  const { data } = await api.post('/admin/cms/pages', payload)
  return data.page
}

export async function updateAdminPage(id, payload) {
  const { data } = await api.put(`/admin/cms/pages/${id}`, payload)
  return data.page
}

export async function deleteAdminPage(id) {
  await api.delete(`/admin/cms/pages/${id}`)
}
