import { useState, useEffect } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { customerApi } from '../../api'
import { Download, Eye, ShieldX, X, Copy, CheckCircle } from 'lucide-react'

const statusVariant = {
  ACTIVE: 'success',
  REVOKED: 'error',
  EXPIRED: 'warning',
  PENDING: 'warning',
}

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Revoked', value: 'REVOKED' },
]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function ViewModal({ cert, onClose }) {
  const [copied, setCopied] = useState(false)

  function copyPEM() {
    navigator.clipboard.writeText(cert.cert_pem || '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <h2 className="font-mono text-lime-accent font-semibold">Certificate Details</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4 text-sm font-mono">
          <Row label="Subject (CN)" value={cert.common_name || cert.subject || '—'} />
          <Row label="Issuer" value={cert.issuer || '—'} />
          <Row label="Serial" value={cert.serial || cert.serial_number || '—'} />
          <Row label="Key Algorithm" value={cert.key_algorithm || '—'} />
          <Row label="Valid From" value={formatDate(cert.not_before)} />
          <Row label="Valid Until" value={formatDate(cert.not_after)} />
          <Row label="Status" value={
            <Badge variant={statusVariant[cert.status] || 'default'}>{cert.status}</Badge>
          } />
          {cert.dns_names && cert.dns_names.length > 0 && (
            <Row label="DNS Names" value={cert.dns_names.join(', ')} />
          )}
          {cert.ip_addresses && cert.ip_addresses.length > 0 && (
            <Row label="IP Addresses" value={cert.ip_addresses.join(', ')} />
          )}
          <Row label="Fingerprint" value={cert.fingerprint || '—'} />
          <div>
            <div className="text-zinc-500 mb-1">Certificate PEM</div>
            <div className="bg-zinc-950 border border-zinc-700 rounded p-3 max-h-32 overflow-auto">
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-all">{cert.cert_pem}</pre>
            </div>
            <button
              onClick={copyPEM}
              className="mt-2 flex items-center gap-1.5 text-xs font-mono text-lime-accent hover:text-lime-300 transition-colors"
            >
              {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy PEM'}
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-zinc-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function RevokeModal({ cert, onClose }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Please provide a reason for revocation.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await customerApi.submitRevocation({ certificate_id: cert.id, reason: reason.trim() })
      setSuccess(true)
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setError(err.message || 'Failed to submit revocation request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <h2 className="font-mono text-red-400 font-semibold">Request Revocation</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        {success ? (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <CheckCircle size={40} className="text-emerald-400" />
            <p className="text-sm font-mono text-zinc-300">Revocation request submitted successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-sm font-mono text-zinc-400">
              You are requesting revocation for{' '}
              <span className="text-lime-accent">{cert.common_name || cert.subject || `Cert #${cert.id}`}</span>
              . An admin will review your request.
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1.5">Reason *</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Key compromised, Service decommissioned…"
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-lime-accent resize-none"
                autoFocus
              />
            </div>
            {error && (
              <div className="text-xs font-mono text-red-400 bg-red-950 border border-red-900 rounded px-3 py-2">
                {error}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-mono bg-red-600 hover:bg-red-500 text-white rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex gap-4">
      <div className="text-zinc-500 min-w-[120px]">{label}</div>
      <div className="text-zinc-200 flex-1 break-all">{value}</div>
    </div>
  )
}

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [viewCert, setViewCert] = useState(null)
  const [revokeCert, setRevokeCert] = useState(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const res = await customerApi.listCertificates()
      setCertificates(res.data || [])
    } catch (err) {
      console.error('Failed to load certificates:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(cert) {
    try {
      const blob = await customerApi.downloadCertificate(cert.id)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${(cert.common_name || cert.subject || 'cert').replace(/[^a-zA-Z0-9.-]/g, '_')}.crt`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (err) {
      console.error('Failed to download certificate:', err)
    }
  }

  const filtered = activeFilter === 'all'
    ? certificates
    : certificates.filter(c => c.status === activeFilter)

  const counts = {
    all: certificates.length,
    ACTIVE: certificates.filter(c => c.status === 'ACTIVE').length,
    EXPIRED: certificates.filter(c => c.status === 'EXPIRED').length,
    REVOKED: certificates.filter(c => c.status === 'REVOKED').length,
  }

  return (
    <PageLayout title="My Certificates">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              activeFilter === f.value
                ? 'bg-[#BFFF00] text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {f.label} ({counts[f.value] ?? 0})
          </button>
        ))}
      </div>

      <Card className="bg-zinc-900 border border-zinc-800">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No certificates found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain (CN)</TableHead>
                <TableHead>Key Algorithm</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-mono text-zinc-200">
                    {cert.common_name || cert.subject || '—'}
                  </TableCell>
                  <TableCell className="text-zinc-400">{cert.key_algorithm || '—'}</TableCell>
                  <TableCell className="text-zinc-400 font-mono">
                    {cert.not_after ? formatDate(cert.not_after) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[cert.status] || 'default'}>
                      {cert.status || 'UNKNOWN'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        title="Download"
                        onClick={() => handleDownload(cert)}
                        className="p-1.5 rounded text-zinc-400 hover:text-[#BFFF00] hover:bg-zinc-800 transition-colors"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        title="View"
                        onClick={() => setViewCert(cert)}
                        className="p-1.5 rounded text-zinc-400 hover:text-[#BFFF00] hover:bg-zinc-800 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      {cert.status === 'ACTIVE' && (
                        <button
                          title="Request Revocation"
                          onClick={() => setRevokeCert(cert)}
                          className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                        >
                          <ShieldX size={15} />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {viewCert && <ViewModal cert={viewCert} onClose={() => setViewCert(null)} />}
      {revokeCert && <RevokeModal cert={revokeCert} onClose={() => { setRevokeCert(null); fetchCertificates() }} />}
    </PageLayout>
  )
}
