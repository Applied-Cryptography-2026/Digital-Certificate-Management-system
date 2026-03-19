import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { useAuth } from '../context/AuthContext'

// Pages
import Login from '../pages/Login'
import Register from '../pages/Register'
import NotFound from '../pages/NotFound'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import SystemConfig from '../pages/admin/SystemConfig'
import RootCAManagement from '../pages/admin/RootCAManagement'
import CSRReviewQueue from '../pages/admin/CSRReviewQueue'
import CertificateManagement from '../pages/admin/CertificateManagement'
import RevocationQueue from '../pages/admin/RevocationQueue'
import AuditLogs from '../pages/admin/AuditLogs'

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard'
import MyCertificates from '../pages/customer/MyCertificates'
import CSRSubmission from '../pages/customer/CSRSubmission'
import UploadCertificate from '../pages/customer/UploadCertificate'
import MyRevocations from '../pages/customer/MyRevocations'

// Public
import CRLLookup from '../pages/public/CRLLookup'

// Key Pairs page (customer)
import KeyPairs from '../pages/customer/KeyPairs'

export default function AppRoutes() {
  const { user, isAdmin, isCustomer, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lime-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <Register />} />
      <Route path="/crl" element={<CRLLookup />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute requiredRole="ADMIN"><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/config" element={<PrivateRoute requiredRole="ADMIN"><SystemConfig /></PrivateRoute>} />
      <Route path="/admin/root-ca" element={<PrivateRoute requiredRole="ADMIN"><RootCAManagement /></PrivateRoute>} />
      <Route path="/admin/csr" element={<PrivateRoute requiredRole="ADMIN"><CSRReviewQueue /></PrivateRoute>} />
      <Route path="/admin/certificates" element={<PrivateRoute requiredRole="ADMIN"><CertificateManagement /></PrivateRoute>} />
      <Route path="/admin/revocations" element={<PrivateRoute requiredRole="ADMIN"><RevocationQueue /></PrivateRoute>} />
      <Route path="/admin/logs" element={<PrivateRoute requiredRole="ADMIN"><AuditLogs /></PrivateRoute>} />

      {/* Customer Routes */}
      <Route path="/dashboard" element={<PrivateRoute requiredRole="CUSTOMER"><CustomerDashboard /></PrivateRoute>} />
      <Route path="/keys" element={<PrivateRoute><KeyPairs /></PrivateRoute>} />
      <Route path="/csr" element={<PrivateRoute><CSRSubmission /></PrivateRoute>} />
      <Route path="/certificates" element={<PrivateRoute><MyCertificates /></PrivateRoute>} />
      <Route path="/upload" element={<PrivateRoute><UploadCertificate /></PrivateRoute>} />
      <Route path="/revocations" element={<PrivateRoute><MyRevocations /></PrivateRoute>} />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to={isAdmin ? '/admin' : isCustomer ? '/dashboard' : '/login'} replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
