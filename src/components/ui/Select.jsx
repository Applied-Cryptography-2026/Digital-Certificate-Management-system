import { cn } from '../../utils/cn'
import { ChevronDown } from 'lucide-react'

export function Select({ label, options, value, onChange, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium font-mono text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={cn(
            'w-full appearance-none bg-surface border border-border px-3.5 py-3 text-sm font-mono text-text-primary focus:outline-none focus:border-lime-accent/50 transition-colors pr-10',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
      </div>
    </div>
  )
}
