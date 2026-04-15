import { useState, useEffect } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { adminApi } from '../../api'
import { Eye, ShieldX, Download, X as XIcon } from 'lucide-react'
import { Copy, CheckCircle } from 'lucide-react'

const statusVariant = {
  ACTIVE: 'success',
  REVOKED: 'error',
  EXPIRED: 'warning',
}

const filters = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Revoked', value: 'REVOKED' },
  { label: 'Expired', value: 'EXPIRED' },
]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
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
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><XIcon size={18} /></button>
        </div>
        <div className="p-6 space-y-4 text-sm font-mono">
          <Row label="Subject (CN)" value={cert.common_name || cert.subject || '—'} />
          <Row label="Issuer" value={cert.issuer || '—'} />
          <Row label="Serial" value={cert.serial || cert.serial_number || '—'} />
          <Row label="Key Algorithm" value={cert.key_algorithm || '—'} />
          <Row label="Valid From" value={formatDate(cert.not_before)} />
          <Row label="Valid Until" value={formatDate(cert.not_after)} />
          <Row label="Status" value={<Badge variant={statusVariant[cert.status] || 'default'}>{cert.status}</Badge>} />
          <Row label="Is CA" value={cert.is_ca ? 'Yes' : 'No'} />
          <Row label="Profile" value={cert.profile || '—'} />
          <Row label="Requester ID" value={cert.requester_id || '—'} />
          {cert.revoked_at && <Row label="Revoked At" value={formatDate(cert.revoked_at)} />}
          {cert.dns_names && cert.dns_names.length > 0 && (
            <Row label="DNS Names" value={cert.dns_names.join(', ')} />
          )}
          {cert.ip_addresses && cert.ip_addresses.length > 0 && (
            <Row label="IP Addresses" value={cert.ip_addresses.join(', ')} />
          )}
          <Row label="Fingerprint" value={cert.fingerprint || '—'} />
          <Row label="Created" value={formatDate(cert.created_at)} />
          <div>
            <div className="text-zinc-500 mb-1">Certificate PEM</div>
            <div className="bg-zinc-950 border border-zinc-700 rounded p-3 max-h-32 overflow-auto">
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-all">{cert.cert_pem}</pre>
            </div>
            <button onClick={copyPEM} className="mt-2 flex items-center gap-1.5 text-xs font-mono text-lime-accent hover:text-lime-300 transition-colors">
              {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy PEM'}
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-zinc-700 flex justify-end gap-3">
          <button
            onClick={async () => {
              try {
                const blob = await adminApi.downloadCertificate(cert.id)
                downloadBlob(blob, `${(cert.common_name || cert.subject || 'cert').replace(/[^a-zA-Z0-9.-]/g, '_')}.crt`)
              } catch { /* ignore */ }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          >
            <Download size={14} /> Download Cert
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function RevokeModal({ cert, onClose, onRevoked }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await adminApi.revokeDirectly(cert.id, { notes })
      setSuccess(true)
      onRevoked()
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setError(err.message || 'Failed to revoke certificate.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <h2 className="font-mono text-red-400 font-semibold">Revoke Certificate</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><XIcon size={18} /></button>
        </div>
        {success ? (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <CheckCircle size={40} className="text-emerald-400" />
            <p className="text-sm font-mono text-zinc-300">Certificate revoked successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-sm font-mono text-zinc-400">
              Revoking: <span className="text-lime-accent">{cert.common_name || cert.subject || `Cert #${cert.id}`}</span>
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1.5">Admin Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Reason for revocation…"
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-lime-accent resize-none"
                autoFocus
              />
            </div>
            {error && (
              <div className="text-xs font-mono text-red-400 bg-red-950 border border-red-900 rounded px-3 py-2">{error}</div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm font-mono bg-red-600 hover:bg-red-500 text-white rounded transition-colors disabled:opacity-50">
                {loading ? 'Revoking…' : 'Revoke'}
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
      <div className="text-zinc-500 min-w-[140px]">{label}</div>
      <div className="text-zinc-200 flex-1 break-all">{value}</div>
    </div>
  )
}

export default function CertificateManagement() {
  const [certificates, setCertificates] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [viewCert, setViewCert] = useState(null)
  const [revokeCert, setRevokeCert] = useState(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const res = await adminApi.listCertificates()
      setCertificates(res.data || [])
    } catch (err) {
      console.error('Failed to load certificates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (id, notes) => {
    setActionId(id)
    try {
      await adminApi.revokeDirectly(id, { notes })
      setCertificates(prev => prev.map(c => c.id === id ? { ...c, status: 'REVOKED' } : c))
    } catch (err) {
      console.error('Failed to revoke certificate:', err)
    } finally {
      setActionId(null)
    }
  }

  async function handleDownload(cert) {
    try {
      const blob = await adminApi.downloadCertificate(cert.id)
      const name = (cert.common_name || cert.subject || 'cert').replace(/[^a-zA-Z0-9.-]/g, '_')
      downloadBlob(blob, `${name}.crt`)
    } catch (err) {
      console.error('Failed to download certificate:', err)
    }
  }

  const filteredCerts = filter === 'ALL'
    ? certificates
    : certificates.filter(cert => cert.status === filter)

  const counts = {
    ALL: certificates.length,
    ACTIVE: certificates.filter(c => c.status === 'ACTIVE').length,
    REVOKED: certificates.filter(c => c.status === 'REVOKED').length,
    EXPIRED: certificates.filter(c => c.status === 'EXPIRED').length,
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-display font-semibold text-text-primary">
          Certificate Management
        </h1>
        <p className="text-sm font-mono text-text-tertiary">View and manage issued certificates</p>
      </div>

      <div className="flex gap-2 mt-8">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-xs font-mono font-medium transition-colors ${
              filter === f.value
                ? 'bg-lime-accent text-black'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label} ({counts[f.value] ?? 0})
          </button>
        ))}
      </div>

      <Card className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain (CN)</TableHead>
              <TableHead>Key Algorithm</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Serial</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-text-tertiary py-8">Loading…</TableCell>
              </TableRow>
            ) : filteredCerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-text-tertiary py-8">No certificates found</TableCell>
              </TableRow>
            ) : (
              filteredCerts.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium text-text-primary font-mono">
                    {cert.common_name || cert.subject || '—'}
                  </TableCell>
                  <TableCell className="text-text-secondary font-mono text-sm">{cert.key_algorithm || '—'}</TableCell>
                  <TableCell className="text-text-secondary font-mono text-xs">{cert.issuer || '—'}</TableCell>
                  <TableCell className="font-mono text-xs text-text-secondary">
                    {(cert.serial || cert.serial_number || '—').slice(0, 20)}
                    {(cert.serial || cert.serial_number || '').length > 20 ? '…' : ''}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{formatDate(cert.not_after)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[cert.status] || 'default'}>{cert.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setViewCert(cert)} title="View">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(cert)} title="Download">
                        <Download className="w-4 h-4" />
                      </Button>
                      {cert.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionId === cert.id}
                          onClick={() => setRevokeCert(cert)}
                          className="text-error hover:text-error"
                          title="Revoke"
                        >
                          <ShieldX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {viewCert && <ViewModal cert={viewCert} onClose={() => setViewCert(null)} />}
      {revokeCert && (
        <RevokeModal
          cert={revokeCert}
          onClose={() => setRevokeCert(null)}
          onRevoked={() => {
            setCertificates(prev => prev.map(c => c.id === revokeCert.id ? { ...c, status: 'REVOKED' } : c))
          }}
        />
      )}
    </PageLayout>
  )
}