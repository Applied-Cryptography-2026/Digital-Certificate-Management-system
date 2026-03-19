export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toISOString().split('T')[0]
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${d.toISOString().split('T')[0]} ${d.toTimeString().slice(0, 5)}`
}

export function truncate(str, len = 30) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

export function statusColor(status) {
  const map = {
    ACTIVE: 'text-lime-accent bg-lime-accent/10',
    APPROVED: 'text-lime-accent bg-lime-accent/10',
    PENDING: 'text-warning bg-warning/10',
    REJECTED: 'text-error bg-error/10',
    REVOKED: 'text-error bg-error/10',
    EXPIRED: 'text-text-muted bg-text-muted/10',
  }
  return map[status] || 'text-text-secondary bg-surface'
}
