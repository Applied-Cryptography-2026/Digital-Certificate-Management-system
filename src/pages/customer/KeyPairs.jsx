import { useState } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { Plus, Eye, Trash2, Search } from 'lucide-react'

export default function KeyPairs() {
  const [showGenerate, setShowGenerate] = useState(false)
  const [algorithm, setAlgorithm] = useState('RSA')
  const [keySize, setKeySize] = useState('2048')
  const [search, setSearch] = useState('')
  const [filterAlgo, setFilterAlgo] = useState('ALL')

  const sampleKeys = [
    { id: 1, name: 'Production Server Key', algorithm: 'RSA', key_size: '2048 bits', created: '2026-03-15' },
    { id: 2, name: 'Development Key', algorithm: 'ECDSA', key_size: '256 bits', created: '2026-03-10' },
    { id: 3, name: 'Staging Environment', algorithm: 'RSA', key_size: '4096 bits', created: '2026-03-08' },
  ]

  const filtered = sampleKeys.filter(k => {
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
              {filtered.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium text-text-primary">{key.name}</TableCell>
                  <TableCell>{key.algorithm}</TableCell>
                  <TableCell>{key.key_size}</TableCell>
                  <TableCell>{key.created}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-surface transition-colors">
                        <Eye className="w-3.5 h-3.5 text-text-tertiary" />
                      </button>
                      <button className="p-1 hover:bg-surface transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-error" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs font-mono text-text-tertiary">
          Showing 1-{filtered.length} of {sampleKeys.length} key pairs
        </p>
        <div className="flex gap-1">
          <button className="px-2.5 py-1.5 bg-surface text-xs font-mono text-text-muted">&lt;</button>
          <button className="px-2.5 py-1.5 text-xs font-mono text-text-primary">1</button>
          <button className="px-2.5 py-1.5 text-xs font-mono text-text-tertiary">2</button>
          <button className="px-2.5 py-1.5 bg-surface text-xs font-mono text-text-tertiary">&gt;</button>
        </div>
      </div>

      {/* Generate Modal */}
      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Key Pair">
        <div className="flex flex-col gap-4">
          <Input label="Key Name" placeholder="e.g. Production Server Key" />
          <Select
            label="Algorithm"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            options={[
              { value: 'RSA', label: 'RSA' },
              { value: 'ECDSA', label: 'ECDSA' },
            ]}
          />
          <Select
            label="Key Size"
            value={keySize}
            onChange={(e) => setKeySize(e.target.value)}
            options={
              algorithm === 'RSA'
                ? [{ value: '2048', label: '2048 bits' }, { value: '4096', label: '4096 bits' }]
                : [{ value: '256', label: '256 bits' }, { value: '384', label: '384 bits' }]
            }
          />
          <div className="flex gap-3 mt-2">
            <Button onClick={() => setShowGenerate(false)} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">Generate</Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
