import { useState } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { adminApi } from '../../api'
import { Check, X, Eye } from 'lucide-react'

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

export default function CSRReviewQueue() {
  const [csrs, setCSRs] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const filteredCSRs = csrs.filter(csr => {
    if (filter === 'ALL') return true
    return csr.status === filter
  })

  const handleApprove = async (id) => {
    try {
      await adminApi.approveCSR(id)
      setCSRs(csrs.map(c => c.id === id ? { ...c, status: 'APPROVED' } : c))
    } catch (err) {
      console.error('Failed to approve CSR:', err)
    }
  }

  const handleReject = async (id) => {
    try {
      await adminApi.rejectCSR(id, { reason: 'Rejected by admin' })
      setCSRs(csrs.map(c => c.id === id ? { ...c, status: 'REJECTED' } : c))
    } catch (err) {
      console.error('Failed to reject CSR:', err)
    }
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

      {/* Filters */}
      <div className="flex gap-3 mt-8">
        <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
          All (23)
        </FilterButton>
        <FilterButton active={filter === 'PENDING'} onClick={() => setFilter('PENDING')}>
          Pending (8)
        </FilterButton>
        <FilterButton active={filter === 'APPROVED'} onClick={() => setFilter('APPROVED')}>
          Approved (12)
        </FilterButton>
        <FilterButton active={filter === 'REJECTED'} onClick={() => setFilter('REJECTED')}>
          Rejected (3)
        </FilterButton>
      </div>

      {/* Table */}
      <div className="mt-6">
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Key Algo</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Sample data */}
              {[
                { id: 1, domain: 'api.production.com', organization: 'Acme Corp', key_algo: 'RSA-2048', requested: '2026-03-18', status: 'PENDING' },
                { id: 2, domain: 'shop.staging.io', organization: 'TechStart', key_algo: 'ECDSA-256', requested: '2026-03-17', status: 'APPROVED' },
                { id: 3, domain: 'dev.internal.net', organization: 'Internal', key_algo: 'RSA-4096', requested: '2026-03-16', status: 'REJECTED' },
              ].filter(c => filter === 'ALL' || c.status === filter).map((csr) => (
                <TableRow key={csr.id}>
                  <TableCell className="font-medium text-text-primary">{csr.domain}</TableCell>
                  <TableCell>{csr.organization}</TableCell>
                  <TableCell>{csr.key_algo}</TableCell>
                  <TableCell>{csr.requested}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[csr.status]}>{csr.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {csr.status === 'PENDING' ? (
                        <>
                          <Button size="sm" onClick={() => handleApprove(csr.id)}>
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="danger">
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </PageLayout>
  )
}
