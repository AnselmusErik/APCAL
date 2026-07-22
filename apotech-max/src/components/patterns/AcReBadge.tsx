import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * AcReBadge — compact pill displaying ANSI Ac/Re limits for a defect class.
 *
 *     <AcReBadge severity="major" ac={5} re={6} />
 *
 * The visual is intentionally subtle so several can be lined up in a row
 * (e.g. inside Card summaries) without competing with the page heading.
 */

const severityClass = {
  critical:
    'bg-[color:var(--color-danger-tint)] text-[color:var(--color-danger)] border-[color:oklch(85%_0.10_25)]',
  major:
    'bg-[color:var(--color-warning-tint)] text-[color:oklch(40%_0.12_70)] border-[color:oklch(85%_0.10_70)]',
  minor:
    'bg-[color:var(--color-info-tint)] text-[color:var(--color-info)] border-[color:oklch(85%_0.08_230)]'
} as const

const dotClass = {
  critical: 'bg-[color:var(--color-danger)]',
  major: 'bg-[color:var(--color-warning)]',
  minor: 'bg-[color:var(--color-info)]'
} as const

const severityLabel = {
  critical: 'Critical',
  major: 'Mayor',
  minor: 'Minor'
} as const

export type AcReSeverity = keyof typeof severityClass

export interface AcReBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  severity: AcReSeverity
  ac: number
  re: number
  /** Show the severity label inside the badge (default: true). */
  showLabel?: boolean
}

export function AcReBadge({
  severity,
  ac,
  re,
  showLabel = true,
  className,
  ...rest
}: AcReBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-[var(--radius-full)] border px-3 h-7 text-xs font-medium',
        severityClass[severity],
        className
      )}
      {...rest}
    >
      <span className={cn('h-2 w-2 rounded-full', dotClass[severity])} aria-hidden />
      {showLabel && <span className="font-semibold">{severityLabel[severity]}</span>}
      <span className="font-mono tabular-nums">
        Ac={ac} / Re={re}
      </span>
    </div>
  )
}
