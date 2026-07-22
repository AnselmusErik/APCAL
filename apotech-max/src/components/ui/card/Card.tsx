import * as React from 'react'
import { cn } from '@/lib/cn'
import { cardVariants, type CardVariantProps } from './Card.variants'

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    CardVariantProps {}

/**
 * Card — surface container.
 *
 * Pair with `CardHeader` / `CardTitle` / `CardBody` / `CardFooter` for
 * structured content. Use `padding="none"` when composing sub-parts with
 * their own padding.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant, padding, radius, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, radius }), className)}
      {...rest}
    />
  )
})

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardHeader({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-2', className)}
      {...rest}
    />
  )
})

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function CardTitle({ className, ...rest }, ref) {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-tight tracking-tight text-[color:var(--color-fg)]',
        className
      )}
      {...rest}
    />
  )
})

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...rest }, ref) {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-[color:var(--color-fg-muted)]', className)}
      {...rest}
    />
  )
})

export const CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardBody({ className, ...rest }, ref) {
  return <div ref={ref} className={cn('px-6 py-4', className)} {...rest} />
})

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardFooter({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3 px-6 pb-6 pt-2 border-t border-[color:var(--color-border)]',
        className
      )}
      {...rest}
    />
  )
})
