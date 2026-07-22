import Image from 'next/image'
import { cn } from '@/lib/cn'
import { logoVariants, type LogoVariantProps } from './Logo.variants'

/**
 * Dimensions of the source Dankos logo. The webp is ~1200×460, so a 1000:380
 * aspect ratio is close enough — Next/Image needs explicit width/height for
 * intrinsic layout.
 */
const LOGO_W = 1000
const LOGO_H = 380

export interface LogoProps extends LogoVariantProps {
  /** Show "APCAL" wordmark next to the logo. Defaults to false (logo only). */
  withWordmark?: boolean
  /** Override for the wordmark text. */
  wordmark?: string
  className?: string
  /** Used by Next/Image for above-the-fold logo placements. */
  priority?: boolean
}

export function Logo({
  size,
  withWordmark = false,
  wordmark = 'APCAL',
  className,
  priority = false
}: LogoProps) {
  return (
    <span className={cn(logoVariants({ size }), className)}>
      <Image
        src="/brand/logo-dankos.webp"
        alt="Dankos"
        width={LOGO_W}
        height={LOGO_H}
        priority={priority}
        className="h-full w-auto"
      />
      {withWordmark && (
        <span className="font-bold tracking-tight text-[color:var(--color-fg)] text-lg leading-none">
          {wordmark}
        </span>
      )}
    </span>
  )
}
