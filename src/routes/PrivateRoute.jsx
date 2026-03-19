import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lime-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
  }

  return children
}
