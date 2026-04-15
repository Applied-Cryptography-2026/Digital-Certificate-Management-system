import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileBadge, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { customerApi, keyPairApi } from '../../api'

export default function CSRSubmission() {
  const [form, setForm] = useState({
    common_name: '',
    organization: '',
    country: 'US',
    dns_names: '',
    ip_addresses: '',
  })
  const [keyPairs, setKeyPairs] = useState([])
  const [keyPairsLoading, setKeyPairsLoading] = useState(true)
  const [selectedKeyId, setSelectedKeyId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const selectedKeyPair = keyPairs.find(kp => kp.id === Number(selectedKeyId))

  useEffect(() => {
    async function fetchKeyPairs() {
      try {
        const res = await keyPairApi.list()
        const kps = res?.data ?? []
        setKeyPairs(Array.isArray(kps) ? kps : [])
        if (kps.length > 0) {
          setSelectedKeyId(String(kps[0].id))
        }
      } catch {
        setError('Failed to load key pairs. Please refresh the page.')
      } finally {
        setKeyPairsLoading(false)
      }
    }
    fetchKeyPairs()
  }, [])

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.common_name.trim()) {
      setError('Domain name (Common Name) is required')
      return
    }
    if (!selectedKeyId) {
      setError('Please select a key pair before submitting.')
      return
    }

    const dnsNames = form.dns_names
      ? form.dns_names.split(',').map(s => s.trim()).filter(Boolean)
      : []
    const ipAddresses = form.ip_addresses
      ? form.ip_addresses.split(',').map(s => s.trim()).filter(Boolean)
      : []

    setLoading(true)
    try {
      await customerApi.submitCSR({
        common_name: form.common_name.trim(),
        key_pair_id: Number(selectedKeyId),
        dns_names: dnsNames,
        ip_addresses: ipAddresses,
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.message || 'Failed to submit CSR. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout
      title="Submit Certificate Signing Request"
      subtitle="Request a new certificate from your CA"
    >
      {success ? (
        <Card className="bg-zinc-900 border border-zinc-800">
          <div className="p-10 flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#BFFF00]" />
            <h2 className="text-xl font-semibold text-zinc-100">CSR Submitted Successfully!</h2>
            <p className="text-sm text-zinc-400">
              Your CSR has been submitted for review. You will be notified once an admin approves it.
            </p>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Domain Information */}
            <Card className="bg-zinc-900 border border-zinc-800">
              <CardHeader title="Domain Information" />
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Domain Name (Common Name) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., example.com"
                    value={form.common_name}
                    onChange={handleChange('common_name')}
                    className="w-full bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Organization</label>
                  <Input
                    type="text"
                    placeholder="e.g., Acme Corp"
                    value={form.organization}
                    onChange={handleChange('organization')}
                    className="w-full bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Country</label>
                  <select
                    value={form.country}
                    onChange={handleChange('country')}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-[#BFFF00]"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="VN">Vietnam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    DNS Names <span className="text-zinc-500 text-xs">(comma-separated)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="www.example.com, api.example.com"
                    value={form.dns_names}
                    onChange={handleChange('dns_names')}
                    className="w-full bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    IP Addresses <span className="text-zinc-500 text-xs">(comma-separated)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="192.168.1.1, 10.0.0.1"
                    value={form.ip_addresses}
                    onChange={handleChange('ip_addresses')}
                    className="w-full bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </Card>

            {/* Key Configuration */}
            <Card className="bg-zinc-900 border border-zinc-800">
              <CardHeader title="Key Configuration" />
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Key Pair
                  </label>
                  <select
                    value={selectedKeyId}
                    onChange={(e) => setSelectedKeyId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-[#BFFF00]"
                    disabled={keyPairsLoading}
                  >
                    {keyPairsLoading ? (
                      <option value="">Loading key pairs…</option>
                    ) : keyPairs.length === 0 ? (
                      <>
                        <option value="">No key pairs available</option>
                      </>
                    ) : (
                      keyPairs.map((kp) => (
                        <option key={kp.id} value={kp.id}>
                          {kp.name} ({kp.algorithm}-{kp.key_size})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {selectedKeyPair && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4">
                    <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3">
                      Key Information
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-400">Algorithm:</span>
                        <span className="text-sm text-zinc-200 font-mono">{selectedKeyPair.algorithm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-400">Key Size:</span>
                        <span className="text-sm text-zinc-200 font-mono">{selectedKeyPair.key_size} bits</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              className="bg-[#BFFF00] text-black hover:bg-[#d4ff33] font-semibold px-6"
              icon={<FileBadge size={16} />}
              disabled={loading}
            >
              {loading ? 'Submitting…' : 'Submit CSR'}
            </Button>
          </div>
        </form>
      )}
    </PageLayout>
  )
}