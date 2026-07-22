import { cva, type VariantProps } from 'class-variance-authority'

export const cardVariants = cva(
  'bg-[color:var(--color-surface)] text-[color:var(--color-fg)]',
  {
    variants: {
      variant: {
        default: 'border border-[color:var(--color-border)]',
        elevated: 'shadow-[var(--shadow-md)] border border-[color:var(--color-border)]',
        flat: 'border-0',
        outline: 'border-2 border-[color:var(--color-border-strong)] bg-transparent'
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      },
      radius: {
        sm: 'rounded-[var(--radius-sm)]',
        md: 'rounded-[var(--radius-md)]',
        lg: 'rounded-[var(--radius-lg)]',
        xl: 'rounded-[var(--radius-xl)]',
        '2xl': 'rounded-[var(--radius-2xl)]'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      radius: 'lg'
    }
  }
)

export type CardVariantProps = VariantProps<typeof cardVariants>
