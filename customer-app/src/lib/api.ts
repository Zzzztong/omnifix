const BASE = 'http://localhost:4000/api'

function getToken() {
  return localStorage.getItem('fixnest_token')
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data
}

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string; phone?: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Services
  categories: () => request('/services/categories'),

  // Orders
  myOrders: () => request('/orders/my'),
  createOrder: (body: object) =>
    request('/orders', { method: 'POST', body: JSON.stringify(body) }),

  // Coupons
  validateCoupon: (code: string, amount: number) =>
    request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, amount }) }),
}
