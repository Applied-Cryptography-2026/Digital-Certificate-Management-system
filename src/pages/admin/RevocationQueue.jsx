import { useState, useEffect } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Check, X, Eye, AlertCircle, ShieldX } from 'lucide-react'
import { adminApi } from '../../api'
import { formatDate } from '../../utils/formatters'

const STATUS_VARIANT = {
  PENDING:  'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

export default function RevocationQueue() {
  const [filter, setFilter] = useState('ALL')
  const [revocations, setRevocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null) // id currently being confirmed
  const [detailId, setDetailId] = useState(null)
  const [pendingNotes, setPendingNotes] = useState({}) // per-row: { [id]: string }
  const [error, setError] = useState('')

  useEffect(() => { fetchRevocations() }, [])

  async function fetchRevocations() {
    setLoading(true)
    setError('')
    try {
      const res = await adminApi.listRevocations(filter === 'ALL' ? undefined : filter.toLowerCase())
      setRevocations(Array.isArray(res?.data) ? res.data : [])
    } catch {
      setError('Failed to load revocation requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filter !== 'ALL') fetchRevocations()
  }, [filter])

  async function handleApprove(id) {
    setActionId(id)
    try {
      await adminApi.approveRevocation(id, { notes: pendingNotes[id] || '' })
      setPendingNotes(prev => { const n = { ...prev }; delete n[id]; return n })
      fetchRevocations()
    } catch (err) {
      setError(err?.message || 'Failed to approve request.')
    } finally {
      setActionId(null)
    }
  }

  async function handleReject(id) {
    setActionId(id)
    try {
      await adminApi.rejectRevocation(id, { notes: pendingNotes[id] || '' })
      setPendingNotes(prev => { const n = { ...prev }; delete n[id]; return n })
      fetchRevocations()
    } catch (err) {
      setError(err?.message || 'Failed to reject request.')
    } finally {
      setActionId(null)
    }
  }

  function toggleNotes(id) {
    setPendingNotes(prev => ({ ...prev, [id]: prev[id] || '' }))
  }

  function formatStatus(status) {
    if (!status) return null
    const s = String(status).toUpperCase()
    return <Badge variant={STATUS_VARIANT[s] || 'warning'}>{s}</Badge>
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-display font-semibold text-text-primary">
          Revocation Requests
        </h1>
        <p className="text-sm font-mono text-text-tertiary">
          Review and process certificate revocation requests
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mt-8">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-mono font-medium transition-colors rounded ${
              filter === f
                ? 'bg-lime-accent text-black'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mt-4">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <Card className="mt-6">
        {loading ? (
          <div className="p-12 flex flex-col items-center text-text-tertiary">
            <div className="w-6 h-6 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-mono">Loading…</p>
          </div>
        ) : revocations.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center text-text-tertiary">
            <ShieldX className="w-10 h-10 mb-3" />
            <p className="text-sm font-mono">No revocation requests found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Certificate</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revocations.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium text-text-primary font-mono text-xs max-w-[180px] truncate">
                    {req.certificate_cn || `Cert #${req.certificate_id}`}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-400 text-xs">
                    {req.certificate_serial
                      ? (req.certificate_serial.length > 16
                          ? req.certificate_serial.slice(0, 16) + '…'
                          : req.certificate_serial)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {req.requester_name || `User #${req.requester_id}`}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm max-w-[160px] truncate">
                    {req.reason || '—'}
                  </TableCell>
                  <TableCell className="text-zinc-500 font-mono text-xs">
                    {formatDate(req.created_at)}
                  </TableCell>
                  <TableCell>{formatStatus(req.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1.5">
                        {req.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => toggleNotes(req.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                              icon={<Check className="w-3.5 h-3.5" />}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => toggleNotes(req.id)}
                              icon={<X className="w-3.5 h-3.5" />}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {req.status !== 'pending' && pendingNotes[req.id] === undefined && (
                          <button
                            title="View details"
                            onClick={() => setDetailId(detailId === req.id ? null : req.id)}
                            className="p-1.5 rounded text-zinc-400 hover:text-lime-accent hover:bg-zinc-800 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                      </div>

                      {/* Notes input — shown when Approve/Reject is clicked */}
                      {pendingNotes[req.id] !== undefined && (
                        <div className="mt-1.5 bg-zinc-950 border border-zinc-700 rounded-md p-2">
                          <textarea
                            value={pendingNotes[req.id] ?? ''}
                            onChange={e => setPendingNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                            placeholder="Admin notes (optional)"
                            rows={2}
                            className="w-full bg-transparent text-xs font-mono text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none"
                          />
                          <div className="flex gap-1.5 mt-1.5">
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={actionId === req.id}
                              className="flex-1 text-xs font-mono bg-emerald-500 hover:bg-emerald-600 text-white py-1 rounded transition-colors disabled:opacity-50"
                            >
                              {actionId === req.id ? '…' : 'Confirm Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              disabled={actionId === req.id}
                              className="flex-1 text-xs font-mono bg-red-500 hover:bg-red-600 text-white py-1 rounded transition-colors disabled:opacity-50"
                            >
                              {actionId === req.id ? '…' : 'Confirm Reject'}
                            </button>
                            <button
                              onClick={() => setPendingNotes(prev => { const n = { ...prev }; delete n[req.id]; return n })}
                              className="text-xs font-mono text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded border border-zinc-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Processed details */}
                      {detailId === req.id && req.status !== 'pending' && (
                        <div className="mt-1.5 bg-zinc-950 border border-zinc-700 rounded-md p-2 text-xs font-mono text-zinc-400 space-y-1">
                          {req.admin_notes && (
                            <div>
                              <span className="text-zinc-600">Notes: </span>
                              {req.admin_notes}
                            </div>
                          )}
                          {req.processed_at && (
                            <div>
                              <span className="text-zinc-600">Processed: </span>
                              {formatDate(req.processed_at)}
                            </div>
                          )}
                          {req.admin_id && (
                            <div>
                              <span className="text-zinc-600">Admin ID: </span>
                              {req.admin_id}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </PageLayout>
  )
}
