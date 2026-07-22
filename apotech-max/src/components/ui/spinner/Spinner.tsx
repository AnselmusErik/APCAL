import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
} as const

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizeMap
  /** Accessible label. Use a meaningful string in production code. */
  label?: string
}

export function Spinner({ size = 'md', label = 'Memuat...', className, ...rest }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2 text-[color:var(--color-primary)]', className)}
      {...rest}
    >
      <Loader2 className={cn('animate-spin', sizeMap[size])} aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  )
}
