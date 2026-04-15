import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, FileCheck, Activity } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { authApi, adminAuthApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 1. Try admin login first (most likely use case for this login form)
    try {
      const { data } = await adminAuthApi.login({ username, password })
      login(data.access_token, data.user)
      navigate('/admin', { replace: true })
      return
    } catch (adminErr) {
      // admin login failed — expected for customer accounts, try customer login
    }

    // 2. Try customer login
    try {
      const { data } = await authApi.login({ username, password })
      login(data.access_token, data.user)
      navigate('/dashboard', { replace: true })
      return
    } catch (custErr) {
      // Both failed — show error (prefer customer error message)
      const msg =
        custErr.message ||
        (adminErr && adminErr.message) ||
        'Invalid credentials'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] flex flex-col gap-8">
          <div>
            <p className="text-[15px] font-semibold font-display tracking-[3px] text-lime-accent">
              CERTMANAGER
            </p>
            <p className="text-xs font-mono text-text-tertiary mt-2">
              X.509 Digital Certificate Management
            </p>
          </div>

          <h1 className="text-[32px] font-display font-semibold text-text-primary">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Username"
              type="text"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-xs font-mono text-error">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-xs font-mono text-text-tertiary text-center mt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-lime-accent hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Right - Brand Panel */}
      <div className="hidden lg:flex flex-1 bg-surface items-center justify-center p-12">
        <div className="flex flex-col items-center gap-6 max-w-[400px] text-center">
          <ShieldCheck className="w-20 h-20 text-lime-accent" />
          <h2 className="text-[28px] font-display font-semibold text-text-primary">
            Enterprise PKI
          </h2>
          <p className="text-sm font-mono text-text-secondary leading-relaxed">
            Manage your X.509 digital certificates with confidence. Generate keys,
            submit CSRs, and track your certificate lifecycle.
          </p>
          <div className="flex gap-8 pt-4">
            <div className="flex flex-col items-center gap-2">
              <Lock className="w-6 h-6 text-lime-accent" />
              <p className="text-[11px] font-mono text-text-tertiary text-center w-20">
                AES-256<br />Encryption
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FileCheck className="w-6 h-6 text-lime-accent" />
              <p className="text-[11px] font-mono text-text-tertiary text-center w-20">
                X.509<br />Compliant
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-lime-accent" />
              <p className="text-[11px] font-mono text-text-tertiary text-center w-20">
                Full Audit<br />Trail
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
