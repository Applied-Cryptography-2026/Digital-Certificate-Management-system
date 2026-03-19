import { useState } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Check, X } from 'lucide-react'

export default function RevocationQueue() {
  const [filter, setFilter] = useState('ALL')

  const revocationRequests = [
    {
      id: 1,
      certificate: 'api.example.com',
      requested_by: 'john.doe@example.com',
      reason: 'Key compromise',
      requested_date: '2026-03-18',
      status: 'PENDING',
    },
    {
      id: 2,
      certificate: 'old-server.example.com',
      requested_by: 'jane.smith@example.com',
      reason: 'Service discontinuation',
      requested_date: '2026-03-17',
      status: 'PENDING',
    },
    {
      id: 3,
      certificate: 'dev.example.com',
      requested_by: 'admin@example.com',
      reason: 'Certificate expired',
      requested_date: '2026-03-15',
      status: 'APPROVED',
    },
    {
      id: 4,
      certificate: 'test.example.com',
      requested_by: 'qa@example.com',
      reason: 'Expired - auto revoked',
      requested_date: '2026-03-10',
      status: 'APPROVED',
    },
    {
      id: 5,
      certificate: 'legacy.example.com',
      requested_by: 'security@example.com',
      reason: 'Security concern',
      requested_date: '2026-03-19',
      status: 'REJECTED',
    },
  ]

  const filteredRequests = filter === 'ALL'
    ? revocationRequests
    : revocationRequests.filter(req => req.status === filter)

  const statusVariant = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-display font-semibold text-text-primary">
          Revocation Requests
        </h1>
        <p className="text-sm font-mono text-text-tertiary">Review and process certificate revocation requests</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mt-8">
        {['ALL', 'PENDING'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-mono font-medium transition-colors ${
              filter === f
                ? 'bg-lime-accent text-black'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Revocation Queue Table */}
      <Card className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium text-text-primary">
                  {req.certificate}
                </TableCell>
                <TableCell>{req.requested_by}</TableCell>
                <TableCell>{req.reason}</TableCell>
                <TableCell>{req.requested_date}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[req.status]}>{req.status}</Badge>
                </TableCell>
                <TableCell>
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm">
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button variant="danger" size="sm">
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {req.status !== 'PENDING' && (
                    <span className="text-xs font-mono text-text-tertiary">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageLayout>
  )
}
