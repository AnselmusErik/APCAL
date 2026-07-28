'use client'

/**
 * HistoryTab — Riwayat Perhitungan ANSI
 *
 * Data tersimpan di PostgreSQL via C# backend.
 * Next.js API Route (/api/history/sampling) sebagai thin proxy.
 *
 * Operasi:
 *  - GET  /api/history/sampling       → load list
 *  - DELETE /api/history/sampling/:id → hapus 1 entry
 *  - DELETE /api/history/sampling     → hapus semua
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Clock, Trash2, ClipboardCheck, RefreshCw, Search, Filter, X, Printer, Pencil, Check } from 'lucide-react'
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Input, Spinner, ConfirmDialog } from '@/components/ui'
import { AcReBadge } from '@/components/patterns'
import { printPdfReport } from '@/lib/pdf-report'
import toast from 'react-hot-toast'

// ── Types (matching C# SamplingHistoryDto) ────────────────────────────────────

export interface HistoryEntry {
  id: string
  productName?: string
  batchNumber?: string
  lotSize: number
  letterCode: string
  sampleSize: number
  inspectionLevel: string
  inspectionCode: string
  inspectionCodeLabel: string
  inspectionTypeLabel: string
  critical: { ac: number; re: number }
  major:    { ac: number; re: number }
  minor:    { ac: number; re: number }
  decision?: 'accept' | 'reject' | string | null
  decisionReason?: string | null
  defectCounts?: {
    critical: number
    major: number
    minor: number
  } | null
  createdAt: string   // ISO timestamp from DB
}

// ── ATB helper ────────────────────────────────────────────────────────────────

function atbPoints(n: number) {
  const p1 = Math.floor(n / 3)
  const p2 = Math.floor(n / 3)
  const p3 = n - p1 - p2
  return [p1, p2, p3] as const
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

interface HistoryTabProps {
  onSelectForEvaluation?: (entry: HistoryEntry) => void
}

// ── Main Component ────────────────────────────────────────────────────────────

export function HistoryTab({ onSelectForEvaluation }: HistoryTabProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isClearingAll, setIsClearingAll] = useState(false)

  // Modals & Edit state
  const [itemToDelete, setItemToDelete] = useState<HistoryEntry | null>(null)
  const [isClearAllOpen, setIsClearAllOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<HistoryEntry | null>(null)
  const [editProductName, setEditProductName] = useState('')
  const [editBatchNumber, setEditBatchNumber] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const startEditProduct = (entry: HistoryEntry) => {
    setEditingItem(entry)
    setEditProductName(entry.productName || '')
    setEditBatchNumber(entry.batchNumber || '')
  }

  const cancelEditProduct = () => {
    setEditingItem(null)
    setEditProductName('')
    setEditBatchNumber('')
  }

  const handleSaveProductEdit = async () => {
    if (!editingItem) return
    setIsSavingEdit(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'
      const res = await fetch(`${baseUrl}/history/sampling/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: editProductName.trim(),
          batchNumber: editBatchNumber.trim(),
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Nama produk berhasil diperbarui')
        setEntries((prev) =>
          prev.map((e) =>
            e.id === editingItem.id
              ? { ...e, productName: editProductName.trim(), batchNumber: editBatchNumber.trim() }
              : e
          )
        )
        cancelEditProduct()
      } else {
        toast.error('Gagal memperbarui: ' + (json.error || ''))
      }
    } catch {
      toast.error('Gagal terhubung ke server')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'accept' | 'reject' | 'pending'>('all')
  const [levelFilter, setLevelFilter] = useState<'all' | 'normal' | 'tightened' | 'reduced'>('all')

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'
      const res = await fetch(`${baseUrl}/history/sampling?limit=50`)
      const json = await res.json()
      if (json.success) {
        setEntries(json.data ?? [])
      } else {
        toast.error('Gagal memuat riwayat: ' + (json.error ?? ''), { id: 'history-connect-error' })
      }
    } catch {
      toast.error('Tidak dapat terhubung ke server', { id: 'history-connect-error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Filter computation
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const nameMatch = (e.productName ?? '').toLowerCase().includes(q)
        const batchMatch = (e.batchNumber ?? '').toLowerCase().includes(q)
        const codeMatch = (e.letterCode ?? '').toLowerCase().includes(q)
        if (!nameMatch && !batchMatch && !codeMatch) return false
      }

      // Status decision filter
      if (statusFilter === 'accept' && e.decision !== 'accept') return false
      if (statusFilter === 'reject' && e.decision !== 'reject') return false
      if (statusFilter === 'pending' && e.decision != null) return false

      // Inspection level filter
      if (levelFilter !== 'all' && e.inspectionLevel !== levelFilter) return false

      return true
    })
  }, [entries, searchQuery, statusFilter, levelFilter])

  // Handlers for deleting
  async function confirmDeleteOne() {
    if (!itemToDelete) return
    setDeletingId(itemToDelete.id)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'
      const res = await fetch(`${baseUrl}/history/sampling/${itemToDelete.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setEntries(prev => prev.filter(e => e.id !== itemToDelete.id))
        toast.success('Riwayat berhasil dihapus')
        setItemToDelete(null)
      } else {
        toast.error(json.error ?? 'Gagal menghapus')
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus', { id: 'history-action-error' })
    } finally {
      setDeletingId(null)
    }
  }

  async function confirmClearAll() {
    setIsClearingAll(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'
      const res = await fetch(`${baseUrl}/history/sampling`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setEntries([])
        toast.success(`${json.deleted ?? 0} riwayat berhasil dihapus`)
        setIsClearAllOpen(false)
      } else {
        toast.error(json.error ?? 'Gagal menghapus semua riwayat')
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus semua', { id: 'history-action-error' })
    } finally {
      setIsClearingAll(false)
    }
  }

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || levelFilter !== 'all'

  function resetFilters() {
    setSearchQuery('')
    setStatusFilter('all')
    setLevelFilter('all')
  }

  // Summary Metrics Computation
  const summaryStats = useMemo(() => {
    const total = entries.length
    const acceptCount = entries.filter(e => e.decision === 'accept').length
    const rejectCount = entries.filter(e => e.decision === 'reject').length
    const pendingCount = total - acceptCount - rejectCount
    const evaluatedTotal = acceptCount + rejectCount
    const acceptRate = evaluatedTotal > 0 ? Math.round((acceptCount / evaluatedTotal) * 100) : 0
    return { total, acceptCount, rejectCount, pendingCount, acceptRate }
  }, [entries])

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
          <h2 className="text-lg font-bold text-[color:var(--color-fg)]">Riwayat Perhitungan</h2>
          {!loading && (
            <span className="text-xs text-[color:var(--color-fg-muted)]">
              ({filteredEntries.length} dari {entries.length} entri)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={loadHistory} disabled={loading}
            iconLeft={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          {entries.length > 0 && (
            <Button
              variant="outline" size="sm" onClick={() => setIsClearAllOpen(true)}
              className="text-[color:var(--color-danger)] border-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)] hover:text-white"
            >
              Hapus Semua
            </Button>
          )}
        </div>
      </div>

      {/* ── Executive Summary Metrics Bar ── */}
      {!loading && entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-[color:var(--color-fg-muted)] uppercase tracking-wider">
              Total Sampling Record
            </p>
            <p className="text-2xl font-black text-[color:var(--color-fg)] tabular-nums">
              {summaryStats.total}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                🟢 Total ACCEPT
              </p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                {summaryStats.acceptRate}% Pass Rate
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-900 tabular-nums">
              {summaryStats.acceptCount}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
              🔴 Total REJECT
            </p>
            <p className="text-2xl font-black text-red-900 tabular-nums">
              {summaryStats.rejectCount}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              ⚪ Belum Dievaluasi
            </p>
            <p className="text-2xl font-black text-slate-700 tabular-nums">
              {summaryStats.pendingCount}
            </p>
          </div>
        </div>
      )}

      {/* ── Filter Bar ── */}
      {!loading && entries.length > 0 && (
        <Card variant="flat" className="p-4 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-fg-subtle)] pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk, batch, atau kode..."
                className="pl-9 pr-8 text-sm bg-[color:var(--color-bg)] border-[color:var(--color-border)] text-[color:var(--color-fg)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus kata kunci pencarian"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Level Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[color:var(--color-fg-subtle)] shrink-0" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="h-10 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 text-xs font-medium text-[color:var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
              >
                <option value="all">Semua Level Inspeksi</option>
                <option value="normal">Normal</option>
                <option value="tightened">Diperketat (Tightened)</option>
                <option value="reduced">Diperlonggar (Reduced)</option>
              </select>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-[color:var(--color-fg-muted)] mr-1">Status:</span>
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'accept', label: '🟢 Accept' },
                  { id: 'reject', label: '🔴 Reject' },
                  { id: 'pending', label: '⚪ Belum Dievaluasi' },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-3 py-1 rounded-full font-medium transition-colors border ${
                    statusFilter === pill.id
                      ? 'bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)] shadow-xs'
                      : 'bg-[color:var(--color-bg-subtle)] text-[color:var(--color-fg-muted)] border-[color:var(--color-border)] hover:bg-[color:var(--color-border)] hover:text-[color:var(--color-fg)]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[color:var(--color-primary)] hover:underline font-semibold"
              >
                Reset Filter
              </button>
            )}
          </div>
        </Card>
      )}

      {/* ── Loading ── */}
      {loading && (
        <Card variant="elevated">
          <CardBody className="py-12 flex justify-center">
            <Spinner size="lg" />
          </CardBody>
        </Card>
      )}

      {/* ── Empty state ── */}
      {!loading && filteredEntries.length === 0 && (
        <Card variant="elevated">
          <CardBody className="py-16 flex flex-col items-center gap-3 text-center">
            <ClipboardCheck className="h-10 w-10 text-[color:var(--color-fg-subtle)]" aria-hidden />
            <p className="text-[color:var(--color-fg-muted)] text-sm">
              {hasActiveFilters
                ? 'Tidak ada riwayat yang cocok dengan filter.'
                : 'Belum ada riwayat perhitungan.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset Filter
              </Button>
            ) : (
              <p className="text-[color:var(--color-fg-subtle)] text-xs">
                Riwayat akan tersimpan otomatis ke database setelah Anda menghitung Sampling Plan.
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {/* ── Entry list ── */}
      {!loading && filteredEntries.map((entry) => {
        const n = entry.sampleSize
        const [p1, p2, p3] = atbPoints(n)

        return (
          <Card key={entry.id} variant="elevated" padding="none">
            <CardHeader>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  {editingItem?.id === entry.id ? (
                    <div className="flex items-center gap-2 my-1 flex-wrap">
                      <Input
                        value={editProductName}
                        onChange={(e) => setEditProductName(e.target.value)}
                        placeholder="Nama Produk (mis. Ranitidine Injeksi)"
                        className="text-xs h-8 min-w-[200px]"
                      />
                      <Input
                        value={editBatchNumber}
                        onChange={(e) => setEditBatchNumber(e.target.value)}
                        placeholder="No Batch"
                        className="text-xs h-8 w-[120px]"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveProductEdit}
                        disabled={isSavingEdit}
                        iconLeft={isSavingEdit ? <Spinner size="sm" /> : <Check className="h-3.5 w-3.5" />}
                      >
                        Simpan
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEditProduct}>
                        Batal
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {entry.productName || '(Produk tidak diisi)'}
                      </CardTitle>
                      <button
                        type="button"
                        onClick={() => startEditProduct(entry)}
                        className="text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-primary)] p-1 rounded-sm transition-colors"
                        title="Edit Nama Produk & Batch"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
                    Batch: <span className="font-medium">{entry.batchNumber || '-'}</span>
                    <span className="mx-1">·</span>
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Decision Badge */}
                  {entry.decision === 'accept' && (
                    <Badge variant="solidSuccess" size="md">
                      ACCEPT (TERIMA)
                    </Badge>
                  )}
                  {entry.decision === 'reject' && (
                    <Badge variant="solidDanger" size="md">
                      REJECT (TOLAK)
                    </Badge>
                  )}
                  {!entry.decision && (
                    <Badge variant="neutral" size="md">
                      BELUM DIEVALUASI
                    </Badge>
                  )}

                  <Badge variant={
                    entry.inspectionLevel === 'normal'    ? 'info'
                    : entry.inspectionLevel === 'tightened' ? 'danger'
                    : 'warning'
                  }>
                    {entry.inspectionTypeLabel}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => printPdfReport(entry)}
                    iconLeft={<Printer className="h-4 w-4 text-[color:var(--color-primary)]" />}
                    title="Cetak Laporan PDF Resmi (Dankos Logo & Form QA)"
                  >
                    Cetak PDF
                  </Button>

                  {onSelectForEvaluation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectForEvaluation(entry)}
                      iconLeft={<ClipboardCheck className="h-4 w-4" />}
                      className="ml-1"
                    >
                      {entry.decision ? 'Evaluasi Ulang' : 'Input Cacat'}
                    </Button>
                  )}

                  <button
                    aria-label="Hapus entri ini"
                    disabled={deletingId === entry.id}
                    onClick={() => setItemToDelete(entry)}
                    className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)]
                      text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-danger)]
                      hover:bg-[color:var(--color-bg-subtle)] disabled:opacity-40
                      transition-colors duration-[var(--duration-fast)]"
                  >
                    {deletingId === entry.id
                      ? <Spinner size="sm" />
                      : <Trash2 className="h-4 w-4" />
                    }
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardBody className="space-y-4">
              {/* Stats */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <StatItem label="Lot Size"   value={entry.lotSize.toLocaleString('id-ID')} />
                <StatItem label="Kode Huruf" value={entry.letterCode} highlight />
                <StatItem label="Inspeksi"   value={`${entry.inspectionCode} — ${entry.inspectionCodeLabel}`} />
                <StatItem label="Sampel (n)" value={`${n} unit`} highlight />
              </dl>

              {/* Titik ATB */}
              <div className="rounded-[var(--radius-md)] border border-[color:var(--color-primary)] bg-[color:var(--color-primary-tint)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-primary)] mb-2">
                  Titik ATB — {n} ÷ 3
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {([p1, p2, p3] as const).map((val, i) => (
                    <div key={i} className="bg-white/60 rounded-[var(--radius-sm)] py-2 px-1">
                      <p className="text-[10px] text-[color:var(--color-fg-muted)] uppercase tracking-wider">
                        Titik {i + 1}
                      </p>
                      <p className="text-xl font-bold text-[color:var(--color-primary)] tabular-nums">
                        {val}
                      </p>
                      <p className="text-[10px] text-[color:var(--color-fg-subtle)]">unit</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ac / Re */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)] mb-2">
                  Batas Ac / Re
                </p>
                <div className="flex flex-wrap gap-2">
                  <AcReBadge severity="critical" ac={entry.critical.ac} re={entry.critical.re} />
                  <AcReBadge severity="major"    ac={entry.major.ac}    re={entry.major.re} />
                  <AcReBadge severity="minor"    ac={entry.minor.ac}    re={entry.minor.re} />
                </div>
              </div>

              {/* Evaluasi Temuan & Decision Note */}
              {entry.decision && (
                <div className="pt-3 border-t border-[color:var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-[color:var(--color-fg)]">Hasil Evaluasi Cacat:</span>
                    <div className="flex items-center gap-3 font-medium tabular-nums">
                      <span className="text-[color:var(--color-danger)]">🔴 Kritis: {entry.defectCounts?.critical ?? 0}</span>
                      <span className="text-amber-600">🟠 Mayor: {entry.defectCounts?.major ?? 0}</span>
                      <span className="text-teal-600">🟢 Minor: {entry.defectCounts?.minor ?? 0}</span>
                    </div>
                  </div>
                  {entry.decisionReason && (
                    <p className="text-xs text-[color:var(--color-fg-muted)] bg-[color:var(--color-bg-subtle)] p-2.5 rounded-[var(--radius-sm)] border border-[color:var(--color-border)]">
                      <strong className="text-[color:var(--color-fg)]">Alasan Evaluasi:</strong> {entry.decisionReason}
                    </p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        )
      })}

      {/* Confirm Modal: Delete 1 item */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Hapus Riwayat Perhitungan?"
        description={`Apakah Anda yakin ingin menghapus riwayat untuk "${itemToDelete?.productName || 'Produk'}" (Batch: ${itemToDelete?.batchNumber || '-'})? Data yang dihapus tidak dapat dikembalikan.`}
        confirmText="Hapus Riwayat"
        cancelText="Batal"
        loading={!!deletingId}
        onConfirm={confirmDeleteOne}
        onClose={() => setItemToDelete(null)}
      />

      {/* Confirm Modal: Delete all items */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        title="Hapus SEMUA Riwayat Perhitungan?"
        description="Apakah Anda yakin ingin menghapus SELURUH riwayat perhitungan dari database? Tindakan ini bersifat permanen dan tidak dapat dibatalkan."
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        loading={isClearingAll}
        onConfirm={confirmClearAll}
        onClose={() => setIsClearAllOpen(false)}
      />
    </div>
  )
}

function StatItem({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">{label}</dt>
      <dd className={highlight
        ? 'mt-1 text-lg font-bold text-[color:var(--color-primary)]'
        : 'mt-1 text-sm font-medium text-[color:var(--color-fg)]'
      }>{value}</dd>
    </div>
  )
}
