const BASE = import.meta.env.VITE_API_URL || 'https://omnifix-production.up.railway.app/api'

function getToken() {
  return localStorage.getItem('admin_token') || ''
}

async function request(path: string, options?: RequestInit) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data
}

export const api = {
  // 认证
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // 仪表盘
  dashboard: () => request('/orders/stats/dashboard'),

  // 服务管理
  getCategories: () => request('/services/categories'),
  getServices: () => request('/services'),
  createService: (data: object) => request('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id: string, data: object) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id: string) => request(`/services/${id}`, { method: 'DELETE' }),
  updateCategory: (id: string, data: object) => request(`/services/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // 订单管理
  getOrders: (params?: string) => request(`/orders${params ? '?' + params : ''}`),
  updateOrder: (id: string, data: object) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // 技师管理
  getTechnicians: () => request('/technicians'),
  createTechnician: (data: object) => request('/technicians', { method: 'POST', body: JSON.stringify(data) }),
  updateTechnician: (id: string, data: object) => request(`/technicians/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // 优惠券
  getCoupons: () => request('/coupons'),
  createCoupon: (data: object) => request('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  updateCoupon: (id: string, data: object) => request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // 客户
  getCustomers: (search?: string) => request(`/customers${search ? '?search=' + encodeURIComponent(search) : ''}`),
  createCustomer: (data: object) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: object) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // 管理员录入订单
  createOrderAdmin: (data: object) => request('/orders/admin', { method: 'POST', body: JSON.stringify(data) }),
}
