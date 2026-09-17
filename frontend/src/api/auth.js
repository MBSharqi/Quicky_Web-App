import api, { backend } from './axios'

export async function getCsrfCookie() {
  await backend.get('/sanctum/csrf-cookie')
}

export async function register(payload) {
  await getCsrfCookie()
  const { data } = await api.post('/register', payload)
  return data.user
}

export async function login(payload) {
  await getCsrfCookie()
  const { data } = await api.post('/login', payload)
  return data.user
}

export async function logout() {
  await api.post('/logout')
}

export async function getUser() {
  const { data } = await api.get('/user')
  return data.user
}
