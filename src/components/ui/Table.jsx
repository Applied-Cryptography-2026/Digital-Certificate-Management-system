import { cn } from '../../utils/cn'

export function Table({ className, children, ...props }) {
  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="w-full" {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead className={cn('bg-surface', className)} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn('', className)} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr className={cn('border-b border-border', className)} {...props}>
      {children}
    </tr>
  )
}

export function TableHead({ className, children, ...props }) {
  return (
    <th className={cn('px-4 py-3 text-left text-[10px] font-bold font-mono uppercase tracking-wider text-text-tertiary', className)} {...props}>
      {children}
    </th>
  )
}

export function TableCell({ className, children, ...props }) {
  return (
    <td className={cn('px-4 py-4 text-sm font-mono text-text-secondary', className)} {...props}>
      {children}
    </td>
  )
}
