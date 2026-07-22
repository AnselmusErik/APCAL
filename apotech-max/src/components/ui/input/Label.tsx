import * as React from 'react'
import { cn } from '@/lib/cn'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Render a red asterisk after the label text. */
  required?: boolean
  /** Render dim "(Opsional)" suffix after the label text. */
  optional?: boolean
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, required, optional, children, ...rest },
  ref
) {
  return (
    <label
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-semibold leading-none',
        'text-[color:var(--color-fg)]',
        className
      )}
      {...rest}
    >
      {children}
      {required && <span className="text-[color:var(--color-danger)]" aria-hidden>*</span>}
      {optional && (
        <span className="ml-1 font-normal text-[color:var(--color-fg-muted)]">(Opsional)</span>
      )}
    </label>
  )
})
