'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { alertVariants, type AlertVariantProps } from './Alert.variants'

const ICON_MAP = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
  accent: TriangleAlert
} as const

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    AlertVariantProps {
  /** Optional bold heading rendered above the children. */
  title?: React.ReactNode
  /** Override the auto-selected icon. Pass `null` to hide. */
  icon?: React.ReactNode
  /** Show an `×` button and invoke this callback on click. */
  onDismiss?: () => void
  /** Label for the dismiss button (a11y). */
  dismissLabel?: string
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    className,
    variant = 'info',
    title,
    icon,
    onDismiss,
    dismissLabel = 'Tutup',
    children,
    role,
    ...rest
  },
  ref
) {
  const DefaultIcon = ICON_MAP[variant ?? 'info']
  const showIcon = icon !== null
  const iconNode = icon ?? (DefaultIcon ? <DefaultIcon className="h-5 w-5 shrink-0" aria-hidden /> : null)

  return (
    <div
      ref={ref}
      // assertive for danger so screen readers announce immediately; polite otherwise
      role={role ?? (variant === 'danger' ? 'alert' : 'status')}
      className={cn(alertVariants({ variant }), className)}
      {...rest}
    >
      {showIcon && iconNode}
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold leading-tight mb-1">{title}</div>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="shrink-0 -mr-1 -mt-1 p-1 rounded-[var(--radius-sm)] opacity-70 hover:opacity-100 hover:bg-black/5 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})
