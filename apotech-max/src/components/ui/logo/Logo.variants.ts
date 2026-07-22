import { cva, type VariantProps } from 'class-variance-authority'

export const logoVariants = cva('inline-flex items-center gap-2 select-none', {
  variants: {
    size: {
      sm: 'h-6',
      md: 'h-9',
      lg: 'h-12',
      xl: 'h-16'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

export type LogoVariantProps = VariantProps<typeof logoVariants>
