import { Eye, ShieldX } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';
import { formatDate } from '../../utils/formatters';

const revocations = [
  {
    id: 1,
    domain: 'old.example.com',
    reason: 'Key Compromise',
    requestedDate: '2026-02-10',
    status: 'approved',
  },
  {
    id: 2,
    domain: 'staging.example.com',
    reason: 'Cessation of Operation',
    requestedDate: '2026-03-01',
    status: 'pending',
  },
  {
    id: 3,
    domain: 'test.example.com',
    reason: 'Superseded',
    requestedDate: '2026-01-22',
    status: 'rejected',
  },
];

const statusVariant = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
};

export default function MyRevocations() {
  return (
    <PageLayout title="My Revocation Requests">
      <Card className="bg-zinc-900 border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate Domain</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {revocations.map((rev) => (
              <TableRow key={rev.id}>
                <TableCell className="font-mono text-zinc-200">{rev.domain}</TableCell>
                <TableCell className="text-zinc-400">{rev.reason}</TableCell>
                <TableCell className="text-zinc-400 font-mono">{formatDate(rev.requestedDate)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[rev.status]}>
                    {rev.status.charAt(0).toUpperCase() + rev.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      title="View Details"
                      className="p-1.5 rounded text-zinc-400 hover:text-[#BFFF00] hover:bg-zinc-800 transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                    {rev.status === 'pending' && (
                      <button
                        title="Cancel Request"
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
      </Card>
    </PageLayout>
  );
}
