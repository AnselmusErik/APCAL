import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  // Base — applies to all variants
  [
    'inline-flex items-center justify-center gap-2 font-medium',
    'rounded-[var(--radius-md)] whitespace-nowrap',
    'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-[color:var(--color-bg)]'
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]',
          'hover:bg-[color:var(--color-primary-hover)] active:bg-[color:var(--color-primary-active)]'
        ],
        secondary: [
          'bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]',
          'hover:bg-[color:var(--color-brand-blue-100)] active:bg-[color:var(--color-brand-blue-200)]'
        ],
        outline: [
          'border border-[color:var(--color-primary)] text-[color:var(--color-primary)] bg-transparent',
          'hover:bg-[color:var(--color-primary-tint)] active:bg-[color:var(--color-brand-blue-100)]'
        ],
        accent: [
          'bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]',
          'hover:bg-[color:var(--color-accent-hover)]'
        ],
        ghost: [
          'bg-transparent text-[color:var(--color-fg)]',
          'hover:bg-[color:var(--color-bg-subtle)]'
        ],
        destructive: [
          'bg-[color:var(--color-danger)] text-[color:var(--color-danger-fg)]',
          'hover:opacity-90'
        ],
        link: [
          'bg-transparent text-[color:var(--color-primary)] underline-offset-4',
          'hover:underline p-0 h-auto'
        ]
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0'
      },
      fullWidth: {
        true: 'w-full'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
