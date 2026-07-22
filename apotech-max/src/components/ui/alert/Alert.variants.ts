import { cva, type VariantProps } from 'class-variance-authority'

export const alertVariants = cva(
  [
    'relative flex gap-3 p-4',
    'rounded-[var(--radius-lg)]',
    'border-l-4'
  ],
  {
    variants: {
      variant: {
        info: [
          'bg-[color:var(--color-info-tint)]',
          'border-l-[color:var(--color-info)]',
          'text-[color:oklch(28%_0.08_230)]'
        ],
        success: [
          'bg-[color:var(--color-success-tint)]',
          'border-l-[color:var(--color-success)]',
          'text-[color:oklch(28%_0.10_145)]'
        ],
        warning: [
          'bg-[color:var(--color-warning-tint)]',
          'border-l-[color:var(--color-warning)]',
          'text-[color:oklch(34%_0.10_70)]'
        ],
        danger: [
          'bg-[color:var(--color-danger-tint)]',
          'border-l-[color:var(--color-danger)]',
          'text-[color:oklch(34%_0.12_25)]'
        ],
        // Accent variant for Dankos-yellow branded notices (e.g. revertToNormal)
        accent: [
          'bg-[color:var(--color-accent-tint)]',
          'border-l-[color:var(--color-accent)]',
          'text-[color:var(--color-accent-fg)]'
        ]
      }
    },
    defaultVariants: {
      variant: 'info'
    }
  }
)

export type AlertVariantProps = VariantProps<typeof alertVariants>
