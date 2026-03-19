import { useState } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Eye, ShieldX } from 'lucide-react'

export default function CertificateManagement() {
  const [filter, setFilter] = useState('ALL')

  const certificates = [
    {
      id: 1,
      domain: 'api.example.com',
      issuer: 'CertManager Sub CA',
      expires: '2026-06-15',
      status: 'ACTIVE',
    },
    {
      id: 2,
      domain: 'mail.example.com',
      issuer: 'CertManager Sub CA',
      expires: '2026-03-10',
      status: 'EXPIRED',
    },
    {
      id: 3,
      domain: 'www.example.com',
      issuer: 'CertManager Sub CA',
      expires: '2025-12-01',
      status: 'REVOKED',
    },
    {
      id: 4,
      domain: 'vpn.example.com',
      issuer: 'CertManager Sub CA',
      expires: '2027-01-20',
      status: 'ACTIVE',
    },
    {
      id: 5,
      domain: 'db.example.com',
      issuer: 'CertManager Sub CA',
      expires: '2026-08-30',
      status: 'ACTIVE',
    },
  ]

  const filteredCerts = filter === 'ALL'
    ? certificates
    : certificates.filter(cert => cert.status === filter)

  const statusVariant = {
    ACTIVE: 'success',
    REVOKED: 'error',
    EXPIRED: 'warning',
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-display font-semibold text-text-primary">
          Certificate Management
        </h1>
        <p className="text-sm font-mono text-text-tertiary">View and manage issued certificates</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mt-8">
        {['ALL', 'ACTIVE', 'REVOKED', 'EXPIRED'].map((f) => (
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

      {/* Certificates Table */}
      <Card className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCerts.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-medium text-text-primary">
                  {cert.domain}
                </TableCell>
                <TableCell>{cert.issuer}</TableCell>
                <TableCell>{cert.expires}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[cert.status]}>{cert.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ShieldX className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageLayout>
  )
}
