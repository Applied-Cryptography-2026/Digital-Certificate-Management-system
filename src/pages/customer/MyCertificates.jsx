import { useState } from 'react';
import { Download, Eye, ShieldX } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';
import { formatDate } from '../../utils/formatters';

const certificates = [
  { id: 1, domain: 'api.example.com', issuer: 'Let\'s Encrypt', expires: '2026-06-15', status: 'active' },
  { id: 2, domain: 'shop.example.com', issuer: 'DigiCert', expires: '2026-09-01', status: 'active' },
  { id: 3, domain: 'mail.example.com', issuer: 'Let\'s Encrypt', expires: '2025-01-10', status: 'expired' },
  { id: 4, domain: 'dev.example.com', issuer: 'Internal CA', expires: '2026-12-31', status: 'active' },
  { id: 5, domain: 'staging.example.com', issuer: 'Internal CA', expires: '2025-03-20', status: 'expired' },
  { id: 6, domain: 'cdn.example.com', issuer: 'DigiCert', expires: '2026-08-14', status: 'active' },
  { id: 7, domain: 'auth.example.com', issuer: 'Let\'s Encrypt', expires: '2026-07-22', status: 'pending' },
  { id: 8, domain: 'admin.example.com', issuer: 'Internal CA', expires: '2026-11-05', status: 'pending' },
];

const statusVariant = {
  active: 'success',
  expired: 'danger',
  pending: 'warning',
};

const filters = [
  { label: 'All', value: 'all', count: 8 },
  { label: 'Active', value: 'active', count: 4 },
  { label: 'Expired', value: 'expired', count: 2 },
];

export default function MyCertificates() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? certificates
    : certificates.filter((c) => c.status === activeFilter);

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
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <Card className="bg-zinc-900 border border-zinc-800">
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
            {filtered.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-mono text-zinc-200">{cert.domain}</TableCell>
                <TableCell className="text-zinc-400">{cert.issuer}</TableCell>
                <TableCell className="text-zinc-400 font-mono">{formatDate(cert.expires)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[cert.status]}>
                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      title="Download"
                      className="p-1.5 rounded text-zinc-400 hover:text-[#BFFF00] hover:bg-zinc-800 transition-colors"
                    >
                      <Download size={15} />
                    </button>
                    <button
                      title="View"
                      className="p-1.5 rounded text-zinc-400 hover:text-[#BFFF00] hover:bg-zinc-800 transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      title="Revoke"
                      className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <ShieldX size={15} />
                    </button>
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
