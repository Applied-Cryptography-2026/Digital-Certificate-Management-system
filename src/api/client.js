import axios from 'axios'
import { API_BASE_URL, ENDPOINTS } from '../utils/constants'

// Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // same-site force
  headers: {
    'Content-Type': 'application/json',
  },
})

// Refresh token state
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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    // 401 handle
    if (status === 401 && !originalRequest._retry) {
      const isAuthPage =
        window.location.pathname === '/auth/login' ||
        window.location.pathname === '*' // Để tạm 404

      const isLoginRequest =
        originalRequest.url?.includes(ENDPOINTS.LOGIN)

      // Auth state
      if (isAuthPage || isLoginRequest) {
        return Promise.reject(error)
      }

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
          `${API_BASE_URL}/auth/refresh`,
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

        window.location.href = '/login?session=expired'

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api