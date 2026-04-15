import { useState, useEffect, useCallback } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { adminApi } from '../../api'
import { Check, X, Eye, Download, X as XIcon } from 'lucide-react'
import { Copy, CheckCircle } from 'lucide-react'

function FilterButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 text-xs font-mono transition-colors ${
        active
          ? 'bg-lime-accent text-black'
          : 'bg-surface text-text-secondary hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  )
}

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

function ViewModal({ csr, onClose }) {
  const [copied, setCopied] = useState(false)

  function copyPEM() {
    navigator.clipboard.writeText(csr.pem || '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <h2 className="font-mono text-lime-accent font-semibold">CSR Details</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><XIcon size={18} /></button>
        </div>
        <div className="p-6 space-y-4 text-sm font-mono">
          <Row label="Subject (CN)" value={csr.common_name || csr.subject || '—'} />
          <Row label="Key Algorithm" value={csr.key_algorithm || '—'} />
          <Row label="Signature Algorithm" value={csr.signature_algorithm || '—'} />
          <Row label="DNS Names" value={(csr.dns_names || []).join(', ') || '—'} />
          <Row label="IP Addresses" value={(csr.ip_addresses || []).join(', ') || '—'} />
          <Row label="Requester ID" value={csr.requester_id || '—'} />
          <Row label="Key Pair ID" value={csr.key_pair_id || '—'} />
          <Row label="Created" value={formatDate(csr.created_at)} />
          {csr.approved_at && <Row label="Approved At" value={formatDate(csr.approved_at)} />}
          {csr.approver_id && <Row label="Approver ID" value={csr.approver_id} />}
          {csr.rejected_at && <Row label="Rejected At" value={formatDate(csr.rejected_at)} />}
          {csr.notes && <Row label="Notes" value={csr.notes} />}
          <div>
            <div className="text-zinc-500 mb-1">CSR PEM</div>
            <div className="bg-zinc-950 border border-zinc-700 rounded p-3 max-h-32 overflow-auto">
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-all">{csr.pem}</pre>
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
                const blob = await adminApi.downloadCSR(csr.id)
                downloadBlob(blob, `csr-${csr.id}.pem`)
              } catch { /* ignore */ }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          >
            <Download size={14} /> Download CSR
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
            Close
          </button>
        </div>
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

export default function CSRReviewQueue() {
  const [csrs, setCSRs] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [viewCsr, setViewCsr] = useState(null)

  const fetchCSRs = useCallback(async (isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true)
    try {
      const res = await adminApi.listCSRs()
      setCSRs(res.data || [])
    } catch (err) {
      console.error('Failed to load CSRs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCSRs(true)
    const interval = setInterval(() => fetchCSRs(false), 5000)
    return () => clearInterval(interval)
  }, [fetchCSRs])

  const handleApprove = async (id) => {
    setActionId(id)
    try {
      await adminApi.approveCSR(id)
      await fetchCSRs()
    } catch (err) {
      console.error('Failed to approve CSR:', err)
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id) => {
    setActionId(id)
    try {
      await adminApi.rejectCSR(id, { notes: 'Rejected by admin' })
      await fetchCSRs()
    } catch (err) {
      console.error('Failed to reject CSR:', err)
    } finally {
      setActionId(null)
    }
  }

  async function handleDownload(csr) {
    try {
      const blob = await adminApi.downloadCSR(csr.id)
      downloadBlob(blob, `csr-${csr.id}.pem`)
    } catch (err) {
      console.error('Failed to download CSR:', err)
    }
  }

  const filteredCSRs = csrs.filter(csr => {
    if (filter === 'ALL') return true
    return csr.status === filter
  })

  const counts = {
    ALL: csrs.length,
    PENDING: csrs.filter(c => c.status === 'PENDING').length,
    APPROVED: csrs.filter(c => c.status === 'APPROVED').length,
    REJECTED: csrs.filter(c => c.status === 'REJECTED').length,
  }

  const statusVariant = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-display font-semibold text-text-primary">
          CSR Review Queue
        </h1>
      </div>

      <div className="flex gap-3 mt-8">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
          <FilterButton key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f} ({counts[f] ?? 0})
          </FilterButton>
        ))}
      </div>

      <div className="mt-6">
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain (CN)</TableHead>
                <TableHead>DNS Names</TableHead>
                <TableHead>Key Algorithm</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-text-tertiary py-8">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filteredCSRs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-text-tertiary py-8">
                    No CSRs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCSRs.map((csr) => (
                  <TableRow key={csr.id}>
                    <TableCell className="font-medium text-text-primary">{csr.common_name}</TableCell>
                    <TableCell className="text-text-secondary">
                      {(csr.dns_names || []).slice(0, 2).join(', ')}
                      {(csr.dns_names || []).length > 2 && ` +${csr.dns_names.length - 2}`}
                    </TableCell>
                    <TableCell>{csr.key_algorithm}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {csr.created_at ? new Date(csr.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[csr.status] || 'default'}>{csr.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {csr.status === 'PENDING' ? (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={actionId === csr.id}
                              onClick={() => handleApprove(csr.id)}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={actionId === csr.id}
                              onClick={() => handleReject(csr.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => setViewCsr(csr)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDownload(csr)} title="Download CSR">
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {viewCsr && <ViewModal csr={viewCsr} onClose={() => setViewCsr(null)} />}
    </PageLayout>
  )
}