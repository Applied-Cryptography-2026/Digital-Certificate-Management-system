import { cn } from '../../utils/cn'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('bg-surface p-5', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, title, action }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <h3 className="text-base font-semibold font-display text-text-primary">{title}</h3>
      {action}
    </div>
  )
}
