import * as React from 'react'
import { cn } from '@/lib/cn'
import { badgeVariants, type BadgeVariantProps } from './Badge.variants'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    BadgeVariantProps {
  /** Optional leading icon (Lucide icon at ~12-14px). */
  iconLeft?: React.ReactNode
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, size, iconLeft, children, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...rest}
    >
      {iconLeft}
      {children}
    </span>
  )
})
