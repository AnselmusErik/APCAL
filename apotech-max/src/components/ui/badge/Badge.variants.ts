import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 font-medium whitespace-nowrap',
    'rounded-[var(--radius-full)]',
    'border'
  ],
  {
    variants: {
      variant: {
        neutral: [
          'bg-[color:var(--color-bg-subtle)] text-[color:var(--color-fg-muted)]',
          'border-[color:var(--color-border)]'
        ],
        primary: [
          'bg-[color:var(--color-primary-tint)] text-[color:var(--color-primary)]',
          'border-[color:var(--color-brand-blue-200)]'
        ],
        accent: [
          'bg-[color:var(--color-accent-tint)] text-[color:var(--color-accent-fg)]',
          'border-[color:var(--color-brand-yellow-300)]'
        ],
        success: [
          'bg-[color:var(--color-success-tint)] text-[color:var(--color-success)]',
          'border-[color:oklch(85%_0.10_145)]'
        ],
        warning: [
          'bg-[color:var(--color-warning-tint)] text-[color:oklch(40%_0.12_70)]',
          'border-[color:oklch(85%_0.10_70)]'
        ],
        danger: [
          'bg-[color:var(--color-danger-tint)] text-[color:var(--color-danger)]',
          'border-[color:oklch(85%_0.10_25)]'
        ],
        info: [
          'bg-[color:var(--color-info-tint)] text-[color:var(--color-info)]',
          'border-[color:oklch(85%_0.08_230)]'
        ],
        // Solid variants for high-emphasis status (e.g. Accept/Reject pills)
        solidSuccess: 'bg-[color:var(--color-success)] text-[color:var(--color-success-fg)] border-transparent',
        solidDanger:  'bg-[color:var(--color-danger)]  text-[color:var(--color-danger-fg)]  border-transparent',
        solidPrimary: 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] border-transparent',
        solidAccent:  'bg-[color:var(--color-accent)]  text-[color:var(--color-accent-fg)]  border-transparent'
      },
      size: {
        sm: 'h-5 px-2 text-[11px] leading-none',
        md: 'h-6 px-2.5 text-xs leading-none',
        lg: 'h-7 px-3 text-sm leading-none'
      }
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md'
    }
  }
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>
