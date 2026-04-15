import { useState, useEffect } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ShieldX, AlertCircle, CheckCircle2, X, Plus } from 'lucide-react'
import { customerApi } from '../../api'
import { formatDate } from '../../utils/formatters'

const STATUS_VARIANT = {
  PENDING:  'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

const REASONS = [
  'Key Compromise',
  'Cessation of Operation',
  'Superseded',
  'Affiliation Changed',
  'Certificate Holder Request',
  'Other',
]

export default function MyRevocations() {
  const [revocations, setRevocations] = useState([])
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  // Submit modal
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitCertId, setSubmitCertId] = useState('')
  const [submitReason, setSubmitReason] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [revRes, certRes] = await Promise.all([
        customerApi.listRevocations(),
        customerApi.listCertificates(),
      ])
      setRevocations(Array.isArray(revRes?.data) ? revRes.data : [])
      setCerts(Array.isArray(certRes?.data) ? certRes.data : [])
    } catch {
      setRevocations([])
      setCerts([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    if (!submitCertId) { setSubmitError('Please select a certificate'); return }
    if (!submitReason.trim()) { setSubmitError('Please provide a reason'); return }

    setSubmitting(true)
    try {
      await customerApi.submitRevocation({
        certificate_id: Number(submitCertId),
        reason: submitReason.trim(),
      })
      setShowSubmit(false)
      setSubmitCertId('')
      setSubmitReason('')
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
      fetchAll()
    } catch (err) {
      setSubmitError(err?.message || 'Failed to submit revocation request.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel(id) {
    try {
      await customerApi.cancelRevocation(id)
      fetchAll()
    } catch (err) {
      // silently fail — would need toast in real app
      console.error('Cancel failed:', err)
    }
  }

  function formatStatus(status) {
    if (!status) return null
    const s = String(status).toUpperCase()
    return <Badge variant={STATUS_VARIANT[s] || 'warning'}>{s}</Badge>
  }

  // Active certs the customer can request revocation for
  const activeCerts = certs.filter(c =>
    c.status !== 'REVOKED' && c.status !== 'EXPIRED'
  )

  return (
    <PageLayout title="My Revocation Requests">
      {/* Success banner */}
      {submitSuccess && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-md px-4 py-3 mb-4">
          <CheckCircle2 className="w-4 h-4" />
          Revocation request submitted successfully!
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Revocation Requests</h2>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">
            Request revocation of your certificates
          </p>
        </div>
        <Button
          onClick={() => setShowSubmit(true)}
          disabled={activeCerts.length === 0}
          icon={<Plus className="w-4 h-4" />}
          className="bg-lime-accent text-black hover:bg-lime-accent/90"
        >
          New Request
        </Button>
      </div>

      <Card className="bg-zinc-900 border border-zinc-800">
        {loading ? (
          <div className="p-12 flex flex-col items-center text-text-tertiary">
            <div className="w-6 h-6 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-mono">Loading…</p>
          </div>
        ) : revocations.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <ShieldX className="w-10 h-10 text-text-tertiary mb-3" />
            <p className="text-sm font-mono text-text-tertiary">No revocation requests.</p>
            <p className="text-xs font-mono text-text-muted mt-1">
              Submit a request to revoke one of your certificates.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revocations.map((rev) => (
                <TableRow key={rev.id}>
                  <TableCell className="font-mono text-zinc-200 text-xs max-w-[180px] truncate">
                    {rev.certificate_cn || rev.certificate_name || `Cert #${rev.certificate_id}`}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-500 text-xs">
                    {rev.certificate_serial
                      ? (rev.certificate_serial.length > 16
                          ? rev.certificate_serial.slice(0, 16) + '…'
                          : rev.certificate_serial)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm max-w-[160px] truncate">
                    {rev.reason || '—'}
                  </TableCell>
                  <TableCell className="text-zinc-500 font-mono text-xs">
                    {formatDate(rev.created_at)}
                  </TableCell>
                  <TableCell>{formatStatus(rev.status)}</TableCell>
                  <TableCell>
                    {rev.status === 'PENDING' && (
                      <button
                        title="Cancel request"
                        onClick={() => handleCancel(rev.id)}
                        className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      >
                        <ShieldX size={14} />
                      </button>
                    )}
                    {rev.status !== 'PENDING' && (
                      <span className="text-xs font-mono text-text-muted">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Submit Modal */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Request Certificate Revocation
            </h2>
            <p className="text-xs font-mono text-text-tertiary mb-6">
              Select a certificate and provide a reason for revocation.
            </p>

            {submitError && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono mb-4">
                <AlertCircle className="w-3.5 h-3.5" />
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">
                  Certificate <span className="text-red-400">*</span>
                </label>
                <select
                  value={submitCertId}
                  onChange={e => setSubmitCertId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-lime-accent text-sm"
                >
                  <option value="">Select a certificate…</option>
                  {activeCerts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.common_name || c.subject || `Cert #${c.id}`}
                      {' — '}{c.serial_number?.slice(0, 16) || c.serial?.slice(0, 16) || '—'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">
                  Reason <span className="text-red-400">*</span>
                </label>
                <select
                  value={submitReason}
                  onChange={e => setSubmitReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-lime-accent text-sm"
                >
                  <option value="">Select a reason…</option>
                  {REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setShowSubmit(false); setSubmitError('') }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-lime-accent text-black hover:bg-lime-accent/90"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Submitting…
                    </span>
                  ) : (
                    <>
                      <ShieldX className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  )
}