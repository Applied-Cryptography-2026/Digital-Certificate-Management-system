import { Plus, Key, Upload, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const recentCertificates = [
  { domain: 'api.example.com', status: 'active' },
  { domain: 'shop.example.com', status: 'active' },
  { domain: 'mail.example.com', status: 'expired' },
  { domain: 'dev.example.com', status: 'pending' },
];

const statusVariant = {
  active: 'success',
  expired: 'danger',
  pending: 'warning',
};

export default function CustomerDashboard() {
  return (
    <PageLayout title="Customer Dashboard" subtitle="Welcome back, John!">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-zinc-900 border border-zinc-800">
          <div className="p-5">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-2">My Certificates</p>
            <p className="text-4xl font-bold text-[#BFFF00] font-mono mb-1">8</p>
            <p className="text-sm text-zinc-400">4 Active, 2 Expired</p>
          </div>
        </Card>
        <Card className="bg-zinc-900 border border-zinc-800">
          <div className="p-5">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-2">Pending CSRs</p>
            <p className="text-4xl font-bold text-[#BFFF00] font-mono mb-1">2</p>
            <p className="text-sm text-zinc-400">Awaiting approval</p>
          </div>
        </Card>
        <Card className="bg-zinc-900 border border-zinc-800">
          <div className="p-5">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-2">Key Pairs</p>
            <p className="text-4xl font-bold text-[#BFFF00] font-mono mb-1">5</p>
            <p className="text-sm text-zinc-400">2 RSA, 3 ECDSA</p>
          </div>
        </Card>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Certificates */}
        <Card className="bg-zinc-900 border border-zinc-800">
          <CardHeader title="Recent Certificates" />
          <div className="divide-y divide-zinc-800">
            {recentCertificates.map((cert) => (
              <div key={cert.domain} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-zinc-200 font-mono">{cert.domain}</span>
                <Badge variant={statusVariant[cert.status]}>
                  {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-zinc-900 border border-zinc-800">
          <CardHeader title="Quick Actions" />
          <div className="p-5 flex flex-col gap-3">
            <Button
              variant="primary"
              className="w-full bg-[#BFFF00] text-black hover:bg-[#d4ff33] font-semibold"
              icon={<Plus size={16} />}
            >
              New Certificate Request
            </Button>
            <Button
              variant="outline"
              className="w-full border-zinc-700 text-zinc-200 hover:border-[#BFFF00] hover:text-[#BFFF00]"
              icon={<Key size={16} />}
            >
              Generate Key Pair
            </Button>
            <Button
              variant="outline"
              className="w-full border-zinc-700 text-zinc-200 hover:border-[#BFFF00] hover:text-[#BFFF00]"
              icon={<Upload size={16} />}
            >
              Upload Certificate
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
