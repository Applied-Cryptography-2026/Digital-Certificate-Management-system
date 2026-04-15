import { useState, useEffect } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { FileText, Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { adminApi } from '../../api'
import { formatDate } from '../../utils/formatters'

export default function CRLManagement() {
  const [revoked, setRevoked] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [lastGenerated, setLastGenerated] = useState(null)

  useEffect(() => { fetchRevoked() }, [])

  async function fetchRevoked() {
    setLoading(true)
    try {
      const res = await adminApi.listRevoked()
      setRevoked(Array.isArray(res?.data) ? res.data : [])
    } catch {
      setRevoked([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadCRL() {
    setDownloadError('')
    setGenerating(true)
    try {
      await adminApi.downloadCRL()
      setDownloadSuccess(true)
      setLastGenerated(new Date())
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (err) {
      setDownloadError(err?.message || 'Failed to generate CRL')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PageLayout>
      {/* Success Banner */}
      {downloadSuccess && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-md px-4 py-3 mb-6">
          <CheckCircle2 className="w-4 h-4" />
          CRL generated and downloaded successfully!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-display font-semibold text-text-primary">
              Certificate Revocation List
            </h1>
            <p className="text-sm font-mono text-text-tertiary">
              Manage revoked certificates and distribute CRL
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={fetchRevoked}
              disabled={loading}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              onClick={handleDownloadCRL}
              disabled={generating}
              className="bg-lime-accent text-black hover:bg-lime-accent/90"
              icon={<FileText className="w-4 h-4" />}
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Generating…
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download CRL
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {downloadError && (
        <div className="flex items-center gap-2 text-red-400 text-sm mt-4">
          <AlertCircle className="w-4 h-4" />
          {downloadError}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <Card className="bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-xs font-mono text-text-secondary mb-1">Total Revoked</p>
          <p className="text-2xl font-display font-semibold text-error">
            {revoked.length}
          </p>
        </Card>
        <Card className="bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-xs font-mono text-text-secondary mb-1">CRL Validity</p>
          <p className="text-sm font-mono text-text-primary mt-1">24 hours</p>
          <p className="text-xs font-mono text-text-muted">Auto-renewed daily</p>
        </Card>
        <Card className="bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-xs font-mono text-text-secondary mb-1">Last Generated</p>
          <p className="text-sm font-mono text-text-primary mt-1">
            {lastGenerated
              ? lastGenerated.toLocaleTimeString()
              : '—'}
          </p>
          {lastGenerated && (
            <p className="text-xs font-mono text-text-muted">on-demand</p>
          )}
        </Card>
      </div>

      {/* Revoked Certificates Table */}
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold font-display text-text-primary">
            Revoked Certificates
          </h3>
          <Badge variant="error">{revoked.length} revoked</Badge>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center text-text-tertiary">
            <div className="w-6 h-6 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-mono">Loading…</p>
          </div>
        ) : revoked.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400/40 mb-3" />
            <p className="text-sm font-mono text-text-tertiary">
              No revoked certificates
            </p>
            <p className="text-xs font-mono text-text-muted mt-1">
              All certificates are currently valid.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Fingerprint (SHA-1)</TableHead>
                <TableHead>Revoked At</TableHead>
                <TableHead>Original Expiry</TableHead>
                <TableHead>Issuer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revoked.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-mono text-text-primary text-xs max-w-[180px] truncate">
                    {cert.subject || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-400 text-xs max-w-[140px] truncate">
                    {cert.serial || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-500 text-xs max-w-[200px] truncate">
                    {cert.fingerprint || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-400 text-xs">
                    {formatDate(cert.revoked_at)}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-500 text-xs">
                    {formatDate(cert.not_after)}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-500 text-xs max-w-[140px] truncate">
                    {cert.issuer || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* CRL Format Info */}
      <Card className="mt-6">
        <h3 className="text-sm font-semibold font-display text-text-primary mb-4">
          CRL Distribution
        </h3>
        <div className="bg-zinc-950 rounded-md p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono text-text-secondary">Format</p>
              <p className="text-xs font-mono text-text-primary mt-0.5">PEM-encoded X.509 CRL (RFC 5280)</p>
            </div>
            <Badge variant="success">RFC 5280</Badge>
          </div>
          <div className="flex justify-between">
            <p className="text-xs font-mono text-text-secondary">Signature Algorithm</p>
            <p className="text-xs font-mono text-text-primary">SHA256withRSA</p>
          </div>
          <div className="flex justify-between">
            <p className="text-xs font-mono text-text-secondary">CRL Number Extension</p>
            <p className="text-xs font-mono text-text-primary">OID 2.5.29.20</p>
          </div>
          <div className="flex justify-between">
            <p className="text-xs font-mono text-text-secondary">Next Update</p>
            <p className="text-xs font-mono text-text-primary">24 hours from generation</p>
          </div>
        </div>
      </Card>
    </PageLayout>
  )
}
