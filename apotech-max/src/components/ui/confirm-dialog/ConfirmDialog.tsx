'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'
import { Button } from '../button'
import { Spinner } from '../spinner'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[color:var(--color-surface)] p-6 shadow-2xl border border-[color:var(--color-border)] animate-in zoom-in-95 duration-200 space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-danger-tint)] text-[color:var(--color-danger)]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[color:var(--color-fg)]">
              {title}
            </h3>
            <p className="text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[color:var(--color-border)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            iconLeft={loading ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4" />}
          >
            {loading ? 'Menghapus...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
