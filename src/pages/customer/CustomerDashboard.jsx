import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Key, Upload } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { customerApi, keyPairApi } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function CustomerDashboard() {
  const [certificates, setCertificates] = useState([])
  const [csrs, setCSRs] = useState([])
  const [keyPairs, setKeyPairs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [certsRes, csrsRes, kpRes] = await Promise.all([
          customerApi.listCertificates(),
          customerApi.listCSRs(),
          keyPairApi.list(),
        ])
        setCertificates(certsRes.data || [])
        setCSRs(csrsRes.data || [])
        setKeyPairs(kpRes.data || [])
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const activeCerts  = certificates.filter(c => c.status === 'ACTIVE').length
  const expiredCerts = certificates.filter(c => c.status === 'EXPIRED').length
  const pendingCSRs  = csrs.filter(c => c.status === 'PENDING').length
  const recentCerts  = certificates.slice(0, 4)

  return (
    <PageLayout
      title="Customer Dashboard"
      subtitle={user?.name ? `Welcome back, ${user.name}!` : 'Welcome back!'}
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-zinc-900 border border-zinc-800">
          <div className="p-5">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-2">My Certificates</p>
            <p className="text-4xl font-bold text-[#BFFF00] font-mono mb-1">
              {loading ? '…' : certificates.length}
            </p>
            <p className="text-sm text-zinc-400">
              {loading ? '…' : `${activeCerts} Active, ${expiredCerts} Expired`}
            </p>
          </div>
        </Card>
        <Card className="bg-zinc-900 border border-zinc-800">
          <div className="p-5">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-2">Pending CSRs</p>
            <p className="text-4xl font-bold text-[#BFFF00] font-mono mb-1">
              {loading ? '…' : pendingCSRs}
            </p>
            <p className="text-sm text-zinc-400">Awaiting approval</p>
          </div>
        </Card>
        <Card className="bg-zinc-900 border border-zinc-800">
          <div className="p-5">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-2">Key Pairs</p>
            <p className="text-4xl font-bold text-[#BFFF00] font-mono mb-1">
              {loading ? '…' : keyPairs.length}
            </p>
            <p className="text-sm text-zinc-400">
              {loading ? '…' : `${keyPairs.filter(k => k.algorithm === 'RSA').length} RSA, ${keyPairs.filter(k => k.algorithm === 'ECDSA').length} ECDSA`}
            </p>
          </div>
        </Card>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Certificates */}
        <Card className="bg-zinc-900 border border-zinc-800">
          <CardHeader title="Recent Certificates" />
          <div className="divide-y divide-zinc-800">
            {loading ? (
              <div className="px-5 py-4 text-zinc-500 text-sm">Loading…</div>
            ) : recentCerts.length === 0 ? (
              <div className="px-5 py-4 text-zinc-500 text-sm">No certificates yet — submit a CSR first.</div>
            ) : (
              recentCerts.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-zinc-200 font-mono">
                    {cert.common_name || cert.subject || `Cert #${cert.id}`}
                  </span>
                  <Badge variant={cert.status === 'ACTIVE' ? 'success' : cert.status === 'EXPIRED' ? 'warning' : 'error'}>
                    {cert.status || 'UNKNOWN'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-zinc-900 border border-zinc-800">
          <CardHeader title="Quick Actions" />
          <div className="p-5 flex flex-col gap-3">
            <Button
              variant="primary"
              className="w-full bg-[#BFFF00] text-black hover:bg-[#d4ff33] font-semibold"
              icon={<Plus size={16} />}
              onClick={() => navigate('/customer/csr-submission')}
            >
              New Certificate Request
            </Button>
            <Button
              variant="outline"
              className="w-full border-zinc-700 text-zinc-200 hover:border-[#BFFF00] hover:text-[#BFFF00]"
              icon={<Key size={16} />}
              onClick={() => navigate('/keys')}
            >
              {keyPairs.length === 0 ? 'Generate First Key Pair' : `My Key Pairs (${keyPairs.length})`}
            </Button>
            <Button
              variant="outline"
              className="w-full border-zinc-700 text-zinc-200 hover:border-[#BFFF00] hover:text-[#BFFF00]"
              icon={<Upload size={16} />}
              onClick={() => navigate('/customer/upload-certificate')}
            >
              Upload Certificate
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}
