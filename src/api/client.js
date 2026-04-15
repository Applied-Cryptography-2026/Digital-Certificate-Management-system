import axios from 'axios'
import { API_BASE_URL, ENDPOINTS } from '../utils/constants'


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// ── Request interceptor: attach Bearer token ──────────────────────────────
api.interceptors.request.use((config) => {

  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
},

  (error) => Promise.reject(error)
)

// ── Response interceptor: reject on 401 so callers can handle it ────────
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Clear auth state on 401 — callers decide how to navigate
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token')
//       localStorage.removeItem('user')
//     }
//     return Promise.reject(error)
//   }
// )
// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    // Handle network / CORS errors where error.response is undefined
    if (!error.response && !status) {
      return Promise.reject({ message: 'Network error — is the server running?', status: 0 })
    }

    // 401 handle
    if (status === 401 && !originalRequest._retry) {
      const isAuthPage =
        window.location.pathname === '/login' ||
        window.location.pathname === '/admin/login' ||
        window.location.pathname === '*' // Để tạm 404

      const isAuthOrRefreshRequest =
        originalRequest.url?.includes(ENDPOINTS.AUTH_LOGIN) ||
        originalRequest.url?.includes(ENDPOINTS.ADMIN_LOGIN) ||
        originalRequest.url?.includes(ENDPOINTS.AUTH_REFRESH) ||
        originalRequest.url?.includes(ENDPOINTS.ADMIN_REFRESH)

      // Auth state
      if (isAuthPage || isAuthOrRefreshRequest) {
        return Promise.reject(error)
      }

      // Check if it's an admin request to use the correct refresh endpoint
      const isAdminRequest = originalRequest.url?.includes('/admin')
      const refreshUrl = isAdminRequest
        ? `${API_BASE_URL}${ENDPOINTS.ADMIN_REFRESH}`
        : `${API_BASE_URL}${ENDPOINTS.AUTH_REFRESH}`

      //Refresh state
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(api(originalRequest))
            },
            reject: (err) => reject(err),
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Revoke try
        const res = await axios.post(
          refreshUrl,
          {},
          { withCredentials: true }
        )

        const newToken = res.data.access_token
        localStorage.setItem('token', newToken)

        // Header interceptor
        api.defaults.headers.Authorization = `Bearer ${newToken}`

        // Resolve queue
        processQueue(null, newToken)

        // Retry request after revoke
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // 
        processQueue(refreshError, null)

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        const redirectUrl = isAdminRequest ? '/admin/login?session=expired' : '/login?session=expired'
        window.location.href = redirectUrl

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api