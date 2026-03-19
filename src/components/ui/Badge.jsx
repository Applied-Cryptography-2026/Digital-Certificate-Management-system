import { cn } from '../../utils/cn'

const variants = {
  success: 'bg-lime-accent/10 text-lime-accent',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
  neutral: 'bg-surface text-text-secondary',
}

export function Badge({ variant = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
