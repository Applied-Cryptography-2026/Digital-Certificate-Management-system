import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Input = forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium font-mono text-text-secondary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full bg-surface border border-border px-3.5 py-3 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lime-accent/50 transition-colors',
          error && 'border-error',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs font-mono text-error">{error}</span>}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }
