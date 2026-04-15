import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    // Normalise role to lowercase to match backend DB values
    const normalised = { ...userData, role: (userData.role || '').toLowerCase() }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(normalised))
    setUser(normalised)
  }

  const logout = async () => {
    try {
      await customerApi.logout()
    } catch {
      // ignore network errors — always clear local state
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      navigate('/login', { replace: true })
    }
  }

  const isAdmin = user?.role === 'admin'
  const isCustomer = user?.role === 'customer'

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
