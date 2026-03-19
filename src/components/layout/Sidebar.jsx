import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Settings, Award, FileText, BadgeCheck,
  ShieldX, ScrollText, Key, Upload, LogOut, Menu, X
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useState } from 'react'

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/config', icon: Settings, label: 'System Config' },
  { to: '/admin/root-ca', icon: Award, label: 'Root CA' },
  { to: '/admin/csr', icon: FileText, label: 'CSR Requests' },
  { to: '/admin/certificates', icon: BadgeCheck, label: 'Certificates' },
  { to: '/admin/revocations', icon: ShieldX, label: 'Revocations' },
  { to: '/admin/logs', icon: ScrollText, label: 'Audit Logs' },
]

const customerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/keys', icon: Key, label: 'Key Pairs' },
  { to: '/csr', icon: FileText, label: 'CSR Requests' },
  { to: '/certificates', icon: BadgeCheck, label: 'Certificates' },
  { to: '/upload', icon: Upload, label: 'Upload Cert' },
  { to: '/revocations', icon: ShieldX, label: 'Revocations' },
]

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = isAdmin ? adminNav : customerNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <>
      <div>
        <p className="text-[13px] font-semibold font-mono tracking-[3px] text-lime-accent">
          CERTMANAGER
        </p>
        <p className="text-[10px] font-mono text-text-tertiary mt-1">
          X.509 PKI System
        </p>
      </div>

      <nav className="flex flex-col gap-0.5 mt-10">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-mono transition-colors',
                isActive
                  ? 'bg-lime-accent text-black font-medium'
                  : 'text-text-secondary hover:bg-surface'
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-10">
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <div className="w-8 h-8 rounded-full bg-lime-accent flex items-center justify-center text-black text-xs font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-xs font-mono text-text-primary truncate">
            {user?.username || 'user@example.com'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono text-text-tertiary hover:text-text-secondary transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-border"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5 text-text-primary" /> : <Menu className="w-5 h-5 text-text-primary" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static z-40 top-0 left-0 h-screen w-60 bg-black border-r border-border flex flex-col p-6 transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
