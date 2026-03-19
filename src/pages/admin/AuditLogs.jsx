import { useState } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Filter, Download, FileText } from 'lucide-react'

export default function AuditLogs() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [userFilter, setUserFilter] = useState('')

  const auditLogs = [
    {
      id: 1,
      timestamp: '2026-03-19 14:32:15',
      user: 'admin@example.com',
      action: 'CERTIFICATE_ISSUED',
      entity: 'api.example.com',
      details: 'Certificate issued for 365 days',
    },
    {
      id: 2,
      timestamp: '2026-03-19 12:15:42',
      user: 'admin@example.com',
      action: 'CSR_APPROVED',
      entity: 'CSR-2026-0042',
      details: 'Approved CSR for mail.example.com',
    },
    {
      id: 3,
      timestamp: '2026-03-18 16:45:30',
      user: 'security@example.com',
      action: 'CERTIFICATE_REVOKED',
      entity: 'www.example.com',
      details: 'Revoked due to key compromise',
    },
    {
      id: 4,
      timestamp: '2026-03-18 10:22:08',
      user: 'admin@example.com',
      action: 'ROOT_CA_GENERATED',
      entity: 'Root CA',
      details: 'New root CA key pair generated',
    },
    {
      id: 5,
      timestamp: '2026-03-17 09:11:55',
      user: 'john.doe@example.com',
      action: 'CSR_SUBMITTED',
      entity: 'CSR-2026-0041',
      details: 'New CSR submitted for vpn.example.com',
    },
    {
      id: 6,
      timestamp: '2026-03-16 15:30:21',
      user: 'admin@example.com',
      action: 'USER_LOGIN',
      entity: 'admin@example.com',
      details: 'Successful login from 192.168.1.100',
    },
    {
      id: 7,
      timestamp: '2026-03-15 11:45:33',
      user: 'jane.smith@example.com',
      action: 'CERTIFICATE_ISSUED',
      entity: 'db.example.com',
      details: 'Certificate issued for 730 days',
    },
  ]

  const getActionColor = (action) => {
    if (action.includes('ISSUED') || action.includes('APPROVED') || action.includes('GENERATED')) {
      return 'text-lime-accent'
    }
    if (action.includes('REVOKED') || action.includes('REJECTED')) {
      return 'text-error'
    }
    if (action.includes('LOGIN')) {
      return 'text-info'
    }
    return 'text-text-secondary'
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-display font-semibold text-text-primary">
              Audit Logs
            </h1>
            <p className="text-sm font-mono text-text-tertiary">Track all system activities and changes</p>
          </div>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <Card className="mt-8">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              label="User Filter"
              type="text"
              placeholder="Search by user..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />
          </div>
          <Button variant="secondary">
            <Filter className="w-4 h-4" />
            Apply
          </Button>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">{log.timestamp}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>
                  <span className={`text-xs font-mono font-medium ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-text-primary">{log.entity}</TableCell>
                <TableCell className="max-w-[300px]">{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageLayout>
  )
}
