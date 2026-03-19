import { UploadCloud, FileText, Calendar } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const uploadedCertificates = [
  { id: 1, domain: 'legacy.example.com', expiry: '2026-05-20' },
  { id: 2, domain: 'old.example.org', expiry: '2025-11-30' },
];

export default function UploadCertificate() {
  return (
    <PageLayout title="Upload External Certificate" subtitle="Upload a certificate issued by another CA">
      {/* Dropzone */}
      <Card className="bg-zinc-900 border border-zinc-800 mb-6">
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <UploadCloud size={32} className="text-[#BFFF00]" />
          </div>
          <p className="text-lg text-zinc-200 font-medium mb-1">Drag and drop certificate file here</p>
          <p className="text-sm text-zinc-500 mb-4">Supports .pem, .crt, .cer formats</p>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-200 hover:border-[#BFFF00] hover:text-[#BFFF00]"
          >
            Browse Files
          </Button>
        </div>
      </Card>

      {/* Previously Uploaded */}
      <Card className="bg-zinc-900 border border-zinc-800">
        <CardHeader title="Previously Uploaded" />
        <div className="divide-y divide-zinc-800">
          {uploadedCertificates.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                  <FileText size={16} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-200 font-mono">{cert.domain}</p>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Calendar size={12} />
                    <span>Expires: {cert.expiry}</span>
                  </div>
                </div>
              </div>
              <Badge variant="warning">External</Badge>
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  );
}
