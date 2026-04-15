import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useEffect, useState } from 'react'
import { adminApi } from '../../api'

function StatCard({ label, value, change, variant }) {
  const colors = {
    default: 'text-text-primary',
    warning: 'text-warning',
    error: 'text-error',
  }

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-[10px] font-bold font-mono uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
      <p className={`text-[32px] font-display font-semibold ${colors[variant] || colors.default}`}>
        {value ?? '—'}
      </p>
      <p className="text-xs font-mono text-text-secondary">{change}</p>
    </Card>
  )
}

function CSRRow({ csr }) {
  const statusVariant = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className={`w-2 h-2 ${csr.status === 'PENDING' ? 'bg-warning' : csr.status === 'APPROVED' ? 'bg-lime-accent' : 'bg-error'}`} />
      <span className="flex-1 text-[13px] font-mono text-text-primary">{csr.common_name || csr.domain}</span>
      <Badge variant={statusVariant[csr.status] || 'default'}>{csr.status}</Badge>
    </div>
  )
}

function RootCAStatusCard() {
  return (
    <Card>
      <h3 className="text-sm font-semibold font-display text-text-primary mb-4">Root CA Status</h3>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <span className="text-xs font-mono text-text-secondary">Root Certificate</span>
          <span className="text-xs font-mono font-medium text-lime-accent">Active</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-mono text-text-secondary">Issuer DN</span>
          <span className="text-[11px] font-mono text-text-primary">CN=CertManager Root CA</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-mono text-text-secondary">Valid Until</span>
          <span className="text-xs font-mono font-medium text-text-primary">2046-03-15</span>
        </div>
      </div>
      <button className="w-full mt-4 py-2.5 px-4 bg-surface border border-border text-xs font-mono font-medium text-text-primary hover:bg-surface/80 transition-colors">
        Manage Root CA
      </button>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCerts: 0,
    activeCerts: 0,
    pendingCSRs: 0,
    revokedCerts: 0,
  })
  const [recentCSRs, setRecentCSRs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [certsRes, csrsRes] = await Promise.all([
          adminApi.listCertificates(),
          adminApi.listCSRs(),
        ])

        const certs = certsRes.data || []
        const csrs = csrsRes.data || []

        setStats({
          totalCerts: certs.length,
          activeCerts: certs.filter(c => c.status === 'ACTIVE').length,
          pendingCSRs: csrs.filter(c => c.status === 'PENDING').length,
          revokedCerts: certs.filter(c => c.status === 'REVOKED').length,
        })

        setRecentCSRs(csrs.slice(0, 5))
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-display font-semibold text-text-primary">
          Admin Dashboard
        </h1>
        <p className="text-sm font-mono text-text-tertiary">Overview of your PKI system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        <StatCard
          label="Total Certificates"
          value={loading ? '…' : stats.totalCerts.toLocaleString()}
          change="In system"
        />
        <StatCard
          label="Active Certificates"
          value={loading ? '…' : stats.activeCerts}
          change={stats.totalCerts ? `${Math.round((stats.activeCerts / stats.totalCerts) * 100)}% of total` : ''}
        />
        <StatCard
          label="Pending CSRs"
          value={loading ? '…' : stats.pendingCSRs}
          change="Requires review"
          variant="warning"
        />
        <StatCard
          label="Revoked"
          value={loading ? '…' : stats.revokedCerts}
          change={stats.totalCerts ? `${((stats.revokedCerts / stats.totalCerts) * 100).toFixed(1)}% of total` : ''}
          variant="error"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        {/* Recent CSRs */}
        <Card>
          <h3 className="text-sm font-semibold font-display text-text-primary mb-4">Recent CSR Requests</h3>
          <div className="flex flex-col">
            {recentCSRs.length > 0 ? (
              recentCSRs.map((csr) => (
                <CSRRow key={csr.id} csr={csr} />
              ))
            ) : (
              <p className="text-xs font-mono text-text-tertiary py-4">
                {loading ? 'Loading…' : 'No CSR requests yet'}
              </p>
            )}
          </div>
        </Card>

        {/* Root CA Status */}
        <RootCAStatusCard />
      </div>
    </PageLayout>
  )
}
