'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { buttonVariants, type ButtonVariantProps } from './Button.variants'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  /** Render as the immediate child element (e.g. Next/Link) — Radix Slot pattern. */
  asChild?: boolean
  /** Show a spinner and disable the button. Caller's `children` is preserved. */
  loading?: boolean
  /** Icon node rendered before the label. Hidden while `loading`. */
  iconLeft?: React.ReactNode
  /** Icon node rendered after the label. Hidden while `loading`. */
  iconRight?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      iconLeft,
      iconRight,
      disabled,
      type,
      children,
      ...rest
    },
    ref
  ) {
    const Comp = asChild ? Slot : 'button'
    const isButton = !asChild

    return (
      <Comp
        ref={ref}
        // Default to type="button" so a Button inside a <form> never
        // unexpectedly submits. Callers needing submit must pass type="submit".
        {...(isButton ? { type: type ?? 'button' } : {})}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isButton ? disabled || loading : undefined}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : iconLeft}
        {children}
        {!loading && iconRight}
      </Comp>
    )
  }
)
