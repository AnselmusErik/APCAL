import { cva, type VariantProps } from 'class-variance-authority'

export const inputVariants = cva(
  [
    'block w-full',
    'bg-[color:var(--color-surface)] text-[color:var(--color-fg)]',
    'placeholder:text-[color:var(--color-fg-subtle)]',
    'border rounded-[var(--radius-md)]',
    'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    'focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-[color:var(--color-bg)]',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ],
  {
    variants: {
      variant: {
        default: 'border-[color:var(--color-border)] focus-visible:border-[color:var(--color-primary)]',
        error: 'border-[color:var(--color-danger)] focus-visible:ring-[color:var(--color-danger)]'
      },
      size: {
        sm: 'h-8 px-2.5 text-sm',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export type InputVariantProps = VariantProps<typeof inputVariants>
