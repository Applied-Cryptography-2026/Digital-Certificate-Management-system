import { useState } from 'react'
import { ShieldAlert, Search, Download } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { publicApi } from '../../api'

export default function CRLLookup() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const { data } = await publicApi.getCRL()
      setResults(data)
    } catch (err) {
      console.error('CRL search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-[500px] bg-surface p-10 flex flex-col gap-6 items-center">
        <ShieldAlert className="w-12 h-12 text-lime-accent" />

        <h1 className="text-2xl font-display font-semibold text-text-primary text-center">
          Certificate Revocation List
        </h1>

        <p className="text-[13px] font-mono text-text-secondary text-center">
          Search for revoked certificates by serial number or domain
        </p>

        <form onSubmit={handleSearch} className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-black border border-border px-3.5 py-3">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter serial number or domain..."
              className="flex-1 bg-transparent text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Searching...' : 'Search CRL'}
          </Button>
        </form>

        <button className="flex items-center gap-3 text-xs font-mono text-text-tertiary hover:text-text-secondary transition-colors">
          <Download className="w-3.5 h-3.5" />
          Download full CRL (PEM)
        </button>

        <div className="w-full bg-black p-4 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-xs font-mono text-text-tertiary">Last Updated</span>
            <span className="text-xs font-mono text-text-primary">2026-03-18 00:00 UTC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-mono text-text-tertiary">Revoked Certificates</span>
            <span className="text-xs font-mono text-error">48</span>
          </div>
        </div>

        {results && (
          <div className="w-full bg-black p-4">
            <p className="text-xs font-mono text-text-primary">
              {results.found ? 'Certificate found in CRL' : 'Certificate not found in CRL'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
