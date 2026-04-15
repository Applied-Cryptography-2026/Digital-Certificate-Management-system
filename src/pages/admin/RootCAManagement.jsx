import { useState, useEffect } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Key, Shield, AlertCircle, CheckCircle2, Download, Wifi, X } from 'lucide-react'
import { adminApi } from '../../api'

export default function RootCAManagement() {
  const [rootCA, setRootCA] = useState(null)
  const [loading, setLoading] = useState(true)

  // Generate modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genSuccess, setGenSuccess] = useState(false)
  const [form, setForm] = useState({
    common_name: '',
    organization: '',
    country: 'US',
    algorithm: 'RSA',
    key_size: 4096,
    years: 10,
  })
  const [formError, setFormError] = useState('')

  // TLS Test state
  const [tlsTesting, setTlsTesting] = useState(false)
  const [tlsResult, setTlsResult] = useState(null)

  useEffect(() => {
    fetchRootCA()
  }, [])

  async function fetchRootCA() {
    setLoading(true)
    try {
      const res = await adminApi.getRootCA()
      setRootCA(res?.data ?? null)
    } catch {
      setRootCA(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setFormError('')
    if (!form.common_name.trim()) {
      setFormError('Common Name is required')
      return
    }
    setGenerating(true)
    try {
      const res = await adminApi.generateRootCA({
        common_name: form.common_name.trim(),
        organization: form.organization.trim() || 'X509 MVC System',
        country: form.country,
        algorithm: form.algorithm,
        key_size: Number(form.key_size),
        years: Number(form.years),
      })
      setRootCA(res?.data ?? null)
      setShowGenerateModal(false)
      setGenSuccess(true)
      setTlsResult(null)
      setTimeout(() => setGenSuccess(false), 4000)
    } catch (err) {
      setFormError(err?.message || 'Failed to generate Root CA')
    } finally {
      setGenerating(false)
    }
  }

  async function handleTestTLS() {
    setTlsTesting(true)
    setTlsResult(null)
    try {
      const res = await adminApi.testTLS()
      setTlsResult(res?.data ?? null)
    } catch (err) {
      setTlsResult({
        error: err?.message || 'TLS test failed',
        mutual_tls_established: false,
      })
    } finally {
      setTlsTesting(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  function formatFingerprint(fp) {
    if (!fp) return '—'
    return fp.match(/.{2}/g)?.join(':') ?? fp
  }

  function formatStatus(status) {
    if (!status) return null
    const s = String(status).toUpperCase()
    const variant = s === 'ACTIVE' ? 'success' : 'warning'
    return <Badge variant={variant}>{s}</Badge>
  }

  return (
    <PageLayout>
      {/* Success Banner */}
      {genSuccess && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-md px-4 py-3 mb-6">
          <CheckCircle2 className="w-4 h-4" />
          Root CA generated successfully!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-display font-semibold text-text-primary">
              Root CA Management
            </h1>
            <p className="text-sm font-mono text-text-tertiary">
              Manage your Root Certificate Authority
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowGenerateModal(true)}
              disabled={loading}
            >
              <Key className="w-4 h-4" />
              Generate Key Pair
            </Button>
            <Button
              onClick={() => setShowGenerateModal(true)}
              disabled={loading}
            >
              <Shield className="w-4 h-4" />
              Generate Certificate
            </Button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <Card className="mt-8">
          <div className="p-12 flex flex-col items-center text-text-tertiary">
            <div className="w-6 h-6 border-2 border-lime-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-mono">Loading Root CA…</p>
          </div>
        </Card>
      )}

      {/* Not found */}
      {!loading && !rootCA && (
        <Card className="mt-8">
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-text-tertiary" />
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-1">
                No Root CA Found
              </h3>
              <p className="text-sm text-text-secondary font-mono">
                Generate a Root CA certificate to get started.
              </p>
            </div>
            <Button onClick={() => setShowGenerateModal(true)}>
              <Shield className="w-4 h-4" />
              Generate Root CA
            </Button>
          </div>
        </Card>
      )}

      {/* Root CA Info */}
      {!loading && rootCA && (
        <>
          <Card className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold font-display text-text-primary">
                Root Certificate Authority
              </h3>
              {formatStatus(rootCA.status)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-xs font-mono text-text-secondary">Subject DN</span>
                  <span className="text-xs font-mono text-text-primary text-right max-w-[280px]">
                    {rootCA.subject_dn || rootCA.subject || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-xs font-mono text-text-secondary">Serial Number</span>
                  <span className="text-xs font-mono text-text-primary font-mono">
                    {formatFingerprint(rootCA.serial_number || rootCA.serial)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs font-mono text-text-secondary">Signature Algorithm</span>
                  <span className="text-xs font-mono text-text-primary">
                    {rootCA.signature_algorithm || 'SHA256with' + (rootCA.key_algorithm || 'RSA')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-xs font-mono text-text-secondary">Not Before</span>
                  <span className="text-xs font-mono text-text-primary">
                    {formatDate(rootCA.not_before)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-xs font-mono text-text-secondary">Not After</span>
                  <span className="text-xs font-mono text-text-primary">
                    {formatDate(rootCA.not_after)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs font-mono text-text-secondary">Key Algorithm</span>
                  <span className="text-xs font-mono text-text-primary">
                    {rootCA.key_algorithm || '—'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-6">
            <h3 className="text-sm font-semibold font-display text-text-primary mb-6">
              Root CA Key Pair
            </h3>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-xs font-mono text-text-secondary">Algorithm</span>
                  <span className="text-xs font-mono text-text-primary">
                    {rootCA.key_algorithm || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-xs font-mono text-text-secondary">Key Size</span>
                  <span className="text-xs font-mono text-text-primary">
                    {rootCA.key_size ? `${rootCA.key_size} bits` : '—'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-xs font-mono text-text-secondary">Private Key Storage</span>
                  <span className="text-xs font-mono text-lime-accent font-medium">
                    {rootCA.private_key_storage || 'AES-256-GCM Encrypted'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-xs font-mono text-text-secondary">Created</span>
                  <span className="text-xs font-mono text-text-primary">
                    {formatDate(rootCA.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs font-mono text-text-secondary mb-3">Download Files</p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => adminApi.downloadCertPEM()}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  root-ca.crt
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => adminApi.downloadKeyPEM()}
                  icon={<Key className="w-3.5 h-3.5" />}
                >
                  root-ca-key.pem
                </Button>
              </div>
            </div>
          </Card>

          {/* TLS Test Card */}
          <Card className="mt-6">
            <h3 className="text-sm font-semibold font-display text-text-primary mb-6">
              TLS Authentication Test
            </h3>

            <p className="text-xs font-mono text-text-secondary mb-4">
              Generate short-lived server and client certificates signed by this Root CA,
              then verify the certificate chain. This simulates a full mTLS handshake.
            </p>

            <Button
              onClick={handleTestTLS}
              disabled={tlsTesting || loading}
              icon={<Wifi className="w-4 h-4" />}
              className="bg-lime-accent text-black hover:bg-lime-accent/90"
            >
              {tlsTesting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Running TLS Test…
                </span>
              ) : 'Run TLS Test'}
            </Button>

            {/* TLS Result */}
            {tlsResult && (
              <div className={`mt-6 p-4 rounded-md border ${
                tlsResult.mutual_tls_established
                  ? 'bg-emerald-400/5 border-emerald-400/20'
                  : 'bg-red-400/5 border-red-400/20'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {tlsResult.mutual_tls_established ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-semibold ${
                    tlsResult.mutual_tls_established ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {tlsResult.mutual_tls_established ? 'mTLS Handshake Verified' : 'TLS Test Failed'}
                  </span>
                </div>
                <p className="text-xs font-mono text-text-secondary mb-4">
                  {tlsResult.message}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Server Cert Valid', ok: tlsResult.server_cert_valid },
                    { label: 'Server Signed by CA', ok: tlsResult.server_cert_signed_by_ca },
                    { label: 'Client Cert Valid', ok: tlsResult.client_cert_valid },
                    { label: 'Client Signed by CA', ok: tlsResult.client_cert_signed_by_ca },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.ok
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        : <X className="w-3.5 h-3.5 text-red-400" />
                      }
                      <span className="text-xs font-mono text-text-secondary">{item.label}</span>
                    </div>
                  ))}
                </div>
                {tlsResult.error && (
                  <p className="mt-3 text-xs font-mono text-red-400">{tlsResult.error}</p>
                )}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Generate Root CA
            </h2>
            <p className="text-xs font-mono text-text-tertiary mb-6">
              Create a new self-signed Root Certificate Authority.
            </p>

            {formError && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono mb-4">
                <AlertCircle className="w-3.5 h-3.5" />
                {formError}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">
                  Common Name <span className="text-red-400">*</span>
                </label>
                <Input
                  value={form.common_name}
                  onChange={e => setForm(f => ({ ...f, common_name: e.target.value }))}
                  placeholder="Root CA"
                  className="w-full bg-zinc-950 border-zinc-700 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">
                  Organization
                </label>
                <Input
                  value={form.organization}
                  onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                  placeholder="X509 MVC System"
                  className="w-full bg-zinc-950 border-zinc-700 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">
                  Country
                </label>
                <select
                  value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-lime-accent"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="VN">Vietnam</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">
                    Algorithm
                  </label>
                  <select
                    value={form.algorithm}
                    onChange={e => setForm(f => ({
                      ...f,
                      algorithm: e.target.value,
                      key_size: e.target.value === 'RSA' ? 4096 : 256
                    }))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-lime-accent"
                  >
                    <option value="RSA">RSA</option>
                    <option value="ECDSA">ECDSA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5">
                    Key Size
                  </label>
                  <select
                    value={form.key_size}
                    onChange={e => setForm(f => ({ ...f, key_size: Number(e.target.value) }))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-lime-accent"
                  >
                    {form.algorithm === 'RSA' ? (
                      <>
                        <option value={2048}>2048 bits</option>
                        <option value={4096}>4096 bits</option>
                      </>
                    ) : (
                      <>
                        <option value={256}>P-256</option>
                        <option value={384}>P-384</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5">
                  Validity (years)
                </label>
                <Input
                  type="number"
                  value={form.years}
                  onChange={e => setForm(f => ({ ...f, years: Number(e.target.value) }))}
                  min={1}
                  max={50}
                  className="w-full bg-zinc-950 border-zinc-700 text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setShowGenerateModal(false); setFormError('') }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={generating}
                  className="bg-lime-accent text-black hover:bg-lime-accent/90"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Generating…
                    </span>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Generate Root CA
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  )
}