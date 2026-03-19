import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Key, FileKey, Shield, Calendar } from 'lucide-react'

export default function RootCAManagement() {
  const rootCA = {
    subject_dn: 'CN=CertManager Root CA, O=CertManager, C=US',
    serial_number: '01:AB:CD:EF:12:34:56:78:9A:BC:DE:F0:12:34:56:78',
    signature_algorithm: 'SHA256withRSA',
    not_before: '2024-01-15',
    not_after: '2046-01-15',
    key_algorithm: 'RSA',
    key_size: '4096 bits',
    private_key_storage: 'AES-256-GCM Encrypted',
    created: '2024-01-15',
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-display font-semibold text-text-primary">
              Root CA Management
            </h1>
            <p className="text-sm font-mono text-text-tertiary">Manage your Root Certificate Authority</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <Key className="w-4 h-4" />
              Generate Key Pair
            </Button>
            <Button>
              <Shield className="w-4 h-4" />
              Generate Certificate
            </Button>
          </div>
        </div>
      </div>

      {/* Root Certificate Authority Info */}
      <Card className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold font-display text-text-primary">
            Root Certificate Authority
          </h3>
          <Badge variant="success">ACTIVE</Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-xs font-mono text-text-secondary">Subject DN</span>
              <span className="text-xs font-mono text-text-primary text-right max-w-[280px]">
                {rootCA.subject_dn}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-xs font-mono text-text-secondary">Serial Number</span>
              <span className="text-xs font-mono text-text-primary font-mono">
                {rootCA.serial_number}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-xs font-mono text-text-secondary">Signature Algorithm</span>
              <span className="text-xs font-mono text-text-primary">{rootCA.signature_algorithm}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-xs font-mono text-text-secondary">Not Before</span>
              <span className="text-xs font-mono text-text-primary">{rootCA.not_before}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-xs font-mono text-text-secondary">Not After</span>
              <span className="text-xs font-mono text-text-primary">{rootCA.not_after}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-xs font-mono text-text-secondary">Key Algorithm</span>
              <span className="text-xs font-mono text-text-primary">{rootCA.key_algorithm}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Root CA Key Pair */}
      <Card className="mt-6">
        <h3 className="text-sm font-semibold font-display text-text-primary mb-6">
          Root CA Key Pair
        </h3>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-xs font-mono text-text-secondary">Algorithm</span>
              <span className="text-xs font-mono text-text-primary">{rootCA.key_algorithm}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-xs font-mono text-text-secondary">Key Size</span>
              <span className="text-xs font-mono text-text-primary">{rootCA.key_size}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-xs font-mono text-text-secondary">Private Key Storage</span>
              <span className="text-xs font-mono text-lime-accent font-medium">
                {rootCA.private_key_storage}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-xs font-mono text-text-secondary">Created</span>
              <span className="text-xs font-mono text-text-primary">{rootCA.created}</span>
            </div>
          </div>
        </div>
      </Card>
    </PageLayout>
  )
}
