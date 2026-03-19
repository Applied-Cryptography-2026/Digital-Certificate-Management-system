import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Modal({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className={cn('relative bg-surface border border-border p-6 w-full max-w-md', className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-display text-text-primary">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface/80 transition-colors">
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
