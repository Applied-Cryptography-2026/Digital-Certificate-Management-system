import { useState, useEffect, useCallback } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { keyPairApi } from '../../api'
import { Plus, Eye, Trash2, Search, Download, Copy } from 'lucide-react'

const ALGO_LABELS = { RSA: 'RSA', ECDSA: 'ECDSA' }

export default function KeyPairs() {
  const [keyPairs, setKeyPairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAlgo, setFilterAlgo] = useState('ALL')
  const [showGenerate, setShowGenerate] = useState(false)
  const [selectedKp, setSelectedKp] = useState(null) // for view modal
  const [generating, setGenerating] = useState(false)
  const [generateForm, setGenerateForm] = useState({ name: '', algorithm: 'RSA', key_size: 2048 })
  const [generateError, setGenerateError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchKeyPairs = useCallback(async () => {
    try {
      const res = await keyPairApi.list()
      setKeyPairs(res.data || [])
    } catch (err) {
      console.error('Failed to load key pairs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchKeyPairs() }, [fetchKeyPairs])

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerateError('')
    if (!generateForm.name.trim()) {
      setGenerateError('Key name is required')
      return
    }
    setGenerating(true)
    try {
      const res = await keyPairApi.generate(generateForm)
      // Private key returned only on generation — prompt download
      const kp = res.data
      setKeyPairs(prev => [kp, ...prev])
      setShowGenerate(false)
      setGenerateForm({ name: '', algorithm: 'RSA', key_size: 2048 })
      // Auto-show download for the newly generated key
      setSelectedKp(kp)
    } catch (err) {
      setGenerateError(err.message || 'Failed to generate key pair')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await keyPairApi.delete(id)
      setKeyPairs(prev => prev.filter(k => k.id !== id))
    } catch (err) {
      console.error('Failed to delete key pair:', err)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadKey = async (kp) => {
    try {
      // Prefer in-memory PEM for newly generated keys (not stored in list response)
      if (kp.private_key_pem) {
        const blob = new Blob([kp.private_key_pem], { type: 'application/x-pem-file' })
        downloadBlob(blob, `${kp.name.replace(/\s+/g, '_')}_private.key.pem`)
        return
      }
      const blob = await keyPairApi.downloadKeyPEM(kp.id)
      downloadBlob(blob, `${kp.name.replace(/\s+/g, '_')}_private.key.pem`)
    } catch (err) {
      console.error('Failed to download key:', err)
    }
  }

  const filtered = keyPairs.filter(k => {
    if (filterAlgo !== 'ALL' && k.algorithm !== filterAlgo) return false
    if (search && !k.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <PageLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[32px] font-display font-semibold text-text-primary">Key Pairs</h1>
        <Button onClick={() => setShowGenerate(true)}>
          <Plus className="w-3.5 h-3.5" />
          Generate Key Pair
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="flex items-center gap-2 bg-surface px-3 py-2 w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search key pairs..."
            className="flex-1 bg-transparent text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <select
          value={filterAlgo}
          onChange={(e) => setFilterAlgo(e.target.value)}
          className="bg-surface border border-border px-3 py-2 text-xs font-mono text-text-secondary focus:outline-none"
        >
          <option value="ALL">Algorithm: All</option>
          <option value="RSA">RSA</option>
          <option value="ECDSA">ECDSA</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-6">
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
                <TableHead>Algorithm</TableHead>
                <TableHead>Key Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-text-tertiary py-8">Loading…</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-text-tertiary py-8">
                    {keyPairs.length === 0 ? 'No key pairs yet — generate one!' : 'No key pairs match your filter'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((kp) => (
                  <TableRow key={kp.id}>
                    <TableCell className="font-medium text-text-primary">{kp.name}</TableCell>
                    <TableCell>{kp.algorithm}</TableCell>
                    <TableCell>{kp.key_size} bits</TableCell>
                    <TableCell className="font-mono text-xs">
                      {kp.created_at ? new Date(kp.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          className="p-1 hover:bg-surface transition-colors"
                          title="View"
                          onClick={() => setSelectedKp(kp)}
                        >
                          <Eye className="w-3.5 h-3.5 text-text-tertiary" />
                        </button>
                        <button
                          className="p-1 hover:bg-surface transition-colors"
                          title="Download private key"
                          onClick={() => handleDownloadKey(kp)}
                        >
                          <Download className="w-3.5 h-3.5 text-text-tertiary hover:text-[#BFFF00]" />
                        </button>
                        <button
                          className="p-1 hover:bg-surface transition-colors text-error"
                          title="Delete"
                          onClick={() => setDeleteId(kp.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs font-mono text-text-tertiary">
          Showing {filtered.length} of {keyPairs.length} key pairs
        </p>
      </div>

      {/* ── Generate Modal ── */}
      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Key Pair">
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1.5">Key Name</label>
            <input
              type="text"
              value={generateForm.name}
              onChange={e => setGenerateForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Production Server Key"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-[#BFFF00]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1.5">Algorithm</label>
            <select
              value={generateForm.algorithm}
              onChange={e => {
                const alg = e.target.value
                setGenerateForm(f => ({
                  ...f,
                  algorithm: alg,
                  key_size: alg === 'RSA' ? 2048 : 256,
                }))
              }}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-[#BFFF00]"
            >
              <option value="RSA">RSA</option>
              <option value="ECDSA">ECDSA</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1.5">Key Size</label>
            <select
              value={generateForm.key_size}
              onChange={e => setGenerateForm(f => ({ ...f, key_size: parseInt(e.target.value) }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-[#BFFF00]"
            >
              {generateForm.algorithm === 'RSA' ? (
                <>
                  <option value={2048}>2048 bits (recommended)</option>
                  <option value={4096}>4096 bits</option>
                </>
              ) : (
                <>
                  <option value={256}>256 bits (P-256)</option>
                  <option value={384}>384 bits (P-384)</option>
                </>
              )}
            </select>
          </div>
          {generateError && (
            <p className="text-xs font-mono text-error">{generateError}</p>
          )}
          <div className="flex gap-3 mt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowGenerate(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={generating}>
              {generating ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── View / Download Modal ── */}
      <Modal isOpen={!!selectedKp} onClose={() => setSelectedKp(null)} title={selectedKp?.name || 'Key Pair'}>
        {selectedKp && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-zinc-900 rounded px-3 py-2">
                <p className="text-text-tertiary mb-1">Algorithm</p>
                <p className="text-text-primary">{selectedKp.algorithm}</p>
              </div>
              <div className="bg-zinc-900 rounded px-3 py-2">
                <p className="text-text-tertiary mb-1">Key Size</p>
                <p className="text-text-primary">{selectedKp.key_size} bits</p>
              </div>
              <div className="bg-zinc-900 rounded px-3 py-2 col-span-2">
                <p className="text-text-tertiary mb-1">Fingerprint (SHA-256)</p>
                <p className="text-text-primary break-all text-[10px]">{selectedKp.fingerprint}</p>
              </div>
              {selectedKp.private_key_pem && (
                <div className="bg-zinc-900 rounded px-3 py-2 col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-text-tertiary">Private Key (PKCS#8)</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(selectedKp.private_key_pem)}
                        title="Copy private key"
                        className="text-text-tertiary hover:text-[#BFFF00]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadKey(selectedKp)}
                        title="Download private key"
                        className="text-text-tertiary hover:text-[#BFFF00]"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-text-warning text-[10px] mb-1">⚠ Keep this secret — store it securely, never commit it.</p>
                  <textarea
                    readOnly
                    value={selectedKp.private_key_pem}
                    rows={5}
                    className="w-full bg-black border border-zinc-700 rounded px-2 py-1 text-[10px] text-text-primary font-mono resize-none focus:outline-none"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setSelectedKp(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Key Pair?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary font-mono">
            This will permanently delete the key pair. Any CSRs or certificates signed with this key may become invalid.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button className="flex-1" disabled={deleting} onClick={() => handleDelete(deleteId)}>Delete</Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
