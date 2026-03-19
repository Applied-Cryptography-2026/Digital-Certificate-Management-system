import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Button = forwardRef(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  const variants = {
    primary: 'bg-lime-accent text-black hover:bg-lime-accent/90',
    secondary: 'bg-surface border border-border text-text-primary hover:bg-surface/80',
    danger: 'bg-error/10 border border-error/20 text-error hover:bg-error/20',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }
