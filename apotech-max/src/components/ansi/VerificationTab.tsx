/**
 * VerificationTab — Lampiran Verifikasi Produk Bermasalah.
 *
 * UI for capturing a QC inspection sheet:
 *   1. Header form (date, product code, batch, location, AQL criteria,
 *      unit type, inspection level I/II/III, sample size)
 *   2. Editable findings table — one row per container, with add/remove
 *   3. Live summary: total findings + percentage of sample size
 *   4. Keterangan & Kesimpulan — filled AFTER reviewing findings
 *
 * Actions:
 *   • Export CSV — works at any time on the current form state
 *   • Submit → POST /api/verification (auth required)
 */

'use client'

import { useMemo, useState } from 'react'
import {
  ClipboardList,
  Download,
  FileText,
  Plus,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
  Textarea
} from '@/components/ui'
import { csvJoin, downloadCsv } from '@/lib/csv'

import {
  CONTAINER_TYPE_LABEL,
  CONTAINER_TYPES,
  GENERAL_LEVELS,
  UNIT_TYPE_LABEL,
  UNIT_TYPES,
  type ContainerType,
  type FindingRow,
  type InspectionGeneralLevel,
  type UnitType,
  type VerificationDTO,
  type VerificationFormData
} from '@/types/verification'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const todayIso = () => new Date().toISOString().slice(0, 10)

function emptyFinding(): FindingRow {
  return {
    rowId:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `row-${Math.random().toString(36).slice(2)}`,
    label: '',
    containerType: 'WADAH',
    findingCount: '0',
    description: ''
  }
}

function makeEmptyForm(): VerificationFormData {
  return {
    date: todayIso(),
    productCode: '',
    batchNumber: '',
    location: '',
    aqlCriteria: '2.5%',
    unitType: 'TABLET',
    generalLevel: 'II',
    sampleSize: '',
    keterangan: '',
    kesimpulan: ''
  }
}

export function VerificationTab() {
  const [form, setForm] = useState<VerificationFormData>(makeEmptyForm)
  const [findings, setFindings] = useState<FindingRow[]>([emptyFinding()])
  const [loading, setLoading] = useState(false)
  const [savedRecord, setSavedRecord] = useState<VerificationDTO | null>(null)

  const sampleSizeNumber = parseInt(form.sampleSize, 10) || 0

  const totals = useMemo(() => {
    const total = findings.reduce(
      (acc, f) => acc + (parseInt(f.findingCount, 10) || 0),
      0
    )
    // Percentage = total findings ÷ sample size × 100
    const pct = sampleSizeNumber > 0 ? (total / sampleSizeNumber) * 100 : 0
    return { total, pct }
  }, [findings, sampleSizeNumber])

  function updateForm<K extends keyof VerificationFormData>(
    key: K,
    value: VerificationFormData[K]
  ) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function updateFinding(rowId: string, patch: Partial<FindingRow>) {
    setFindings(prev => prev.map(f => (f.rowId === rowId ? { ...f, ...patch } : f)))
  }

  function addFinding() {
    setFindings(prev => [...prev, emptyFinding()])
  }

  function removeFinding(rowId: string) {
    setFindings(prev => (prev.length > 1 ? prev.filter(f => f.rowId !== rowId) : prev))
  }

  function resetForm() {
    setForm(makeEmptyForm())
    setFindings([emptyFinding()])
    setSavedRecord(null)
  }

  function handleExportCsv() {
    const csv = buildVerificationCsv(form, findings, totals.total, totals.pct)
    const safeBatch = (form.batchNumber || 'verifikasi').replace(/[^a-z0-9_-]+/gi, '_')
    downloadCsv(`verifikasi_${safeBatch}_${form.date}.csv`, csv)
    toast.success('CSV berhasil di-export')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sampleSizeNumber || sampleSizeNumber <= 0) {
      toast.error('Jumlah unit sampel harus > 0')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sampleSize: sampleSizeNumber,
          keterangan: form.keterangan.trim() || null,
          kesimpulan: form.kesimpulan.trim() || null,
          findings: findings.map(f => ({
            label: f.label.trim(),
            containerType: f.containerType,
            findingCount: parseInt(f.findingCount, 10) || 0,
            description: f.description.trim() || null
          }))
        })
      })
      const data: ApiResponse<VerificationDTO> = await response.json()

      if (response.status === 401) {
        toast.error('Anda perlu login terlebih dahulu')
        return
      }
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Gagal menyimpan verifikasi')
      }

      setSavedRecord(data.data)
      toast.success('Verifikasi tersimpan')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="none">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
              Lampiran Verifikasi Produk Bermasalah
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              iconLeft={<Download className="h-4 w-4" />}
            >
              Export CSV
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- 1. Header inspeksi --------------------------------- */}
            <section>
              <SectionHeader step={1} title="Data Inspeksi" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField label="Tanggal" required>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={e => updateForm('date', e.target.value)}
                  />
                </FormField>

                <FormField label="Kode Produk" required>
                  <Input
                    value={form.productCode}
                    onChange={e => updateForm('productCode', e.target.value)}
                    placeholder="Contoh: PRD-001"
                  />
                </FormField>

                <FormField label="Nomor Batch" required>
                  <Input
                    value={form.batchNumber}
                    onChange={e => updateForm('batchNumber', e.target.value)}
                    placeholder="Contoh: BATCH2401A"
                  />
                </FormField>

                <FormField label="Lokasi" required>
                  <Input
                    value={form.location}
                    onChange={e => updateForm('location', e.target.value)}
                    placeholder="Contoh: Gudang Karantina A"
                  />
                </FormField>

                <FormField
                  label="Kriteria Penerimaan (AQL)"
                  required
                  helpText="Misal 2.5%, 4%, atau AQL 1.0"
                >
                  <Input
                    value={form.aqlCriteria}
                    onChange={e => updateForm('aqlCriteria', e.target.value)}
                    placeholder="Contoh: 2.5%"
                  />
                </FormField>

                <FormField label="Jenis Unit Produk" required>
                  <Select
                    value={form.unitType}
                    onChange={e => updateForm('unitType', e.target.value as UnitType)}
                  >
                    {UNIT_TYPES.map(u => (
                      <option key={u} value={u}>{UNIT_TYPE_LABEL[u]}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Tingkat Inspeksi" required helpText="Z1.4 General Inspection Level">
                  <Select
                    value={form.generalLevel}
                    onChange={e => updateForm('generalLevel', e.target.value as InspectionGeneralLevel)}
                  >
                    {GENERAL_LEVELS.map(l => (
                      <option key={l} value={l}>Level {l}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Jumlah Unit Sampel" required helpText="Total unit yang akan diperiksa">
                  <Input
                    type="number"
                    min={1}
                    value={form.sampleSize}
                    onChange={e => updateForm('sampleSize', e.target.value)}
                    placeholder="Misal: 200"
                  />
                </FormField>
              </div>
            </section>

            {/* --- 2. Temuan Masalah ---------------------------------- */}
            <section>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                <SectionHeader step={2} title={`Temuan Masalah (${findings.length} baris)`} compact />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addFinding}
                  iconLeft={<Plus className="h-4 w-4" />}
                >
                  Tambah Baris
                </Button>
              </div>

              <FindingsTable
                rows={findings}
                onChange={updateFinding}
                onRemove={removeFinding}
              />

              <SummaryStrip
                total={totals.total}
                percentage={totals.pct}
                sampleSize={sampleSizeNumber}
              />
            </section>

            {/* --- 3. Keterangan & Kesimpulan ------------------------- */}
            <section>
              <SectionHeader
                step={3}
                title="Keterangan & Kesimpulan"
                helper="Diisi setelah meninjau seluruh temuan di atas."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Keterangan" optional>
                  <Textarea
                    rows={5}
                    value={form.keterangan}
                    onChange={e => updateForm('keterangan', e.target.value)}
                    placeholder="Penjelasan / catatan tambahan terkait temuan…"
                  />
                </FormField>
                <FormField label="Kesimpulan" optional>
                  <Textarea
                    rows={5}
                    value={form.kesimpulan}
                    onChange={e => updateForm('kesimpulan', e.target.value)}
                    placeholder="Keputusan akhir / tindak lanjut (mis. lot diterima, retur, karantina)…"
                  />
                </FormField>
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={resetForm}>
                Reset Form
              </Button>
              <Button
                type="submit"
                loading={loading}
                iconLeft={!loading && <FileText className="h-4 w-4" />}
              >
                {loading ? 'Menyimpan...' : 'Simpan Verifikasi'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {savedRecord && <SavedConfirmation record={savedRecord} />}

      <Alert variant="info" title="Tips pengisian">
        Setiap baris di tabel <strong>Temuan Masalah</strong> mewakili satu wadah (atau
        kantong / bak / MB). Persentase dihitung otomatis sebagai{' '}
        <span className="font-mono">total temuan ÷ jumlah sampel × 100</span>. Setelah
        semua temuan tercatat, lanjut ke bagian <strong>Keterangan & Kesimpulan</strong>{' '}
        sebelum menyimpan.
      </Alert>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  step,
  title,
  helper,
  compact = false
}: {
  step: number
  title: string
  helper?: string
  compact?: boolean
}) {
  return (
    <div className={compact ? '' : 'mb-3'}>
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] text-[11px]">
          {step}
        </span>
        {title}
      </div>
      {helper && (
        <p className="text-xs text-[color:var(--color-fg-muted)] mt-1 ml-7">{helper}</p>
      )}
    </div>
  )
}

function FindingsTable({
  rows,
  onChange,
  onRemove
}: {
  rows: FindingRow[]
  onChange: (rowId: string, patch: Partial<FindingRow>) => void
  onRemove: (rowId: string) => void
}) {
  return (
    <TableScroll>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" align="center">#</TableHead>
            <TableHead>Label</TableHead>
            <TableHead className="w-44">Jenis Wadah</TableHead>
            <TableHead className="w-32" align="right">Jumlah</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead className="w-12" align="center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={row.rowId}>
              <TableCell align="center" className="font-mono text-[color:var(--color-fg-muted)]">
                {i + 1}
              </TableCell>
              <TableCell>
                <Input
                  size="sm"
                  value={row.label}
                  onChange={e => onChange(row.rowId, { label: e.target.value })}
                  placeholder={`Wadah ${i + 1}`}
                />
              </TableCell>
              <TableCell>
                <Select
                  size="sm"
                  value={row.containerType}
                  onChange={e => onChange(row.rowId, { containerType: e.target.value as ContainerType })}
                >
                  {CONTAINER_TYPES.map(c => (
                    <option key={c} value={c}>{CONTAINER_TYPE_LABEL[c]}</option>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  size="sm"
                  type="number"
                  min={0}
                  value={row.findingCount}
                  onChange={e => onChange(row.rowId, { findingCount: e.target.value })}
                  className="text-right tabular-nums"
                />
              </TableCell>
              <TableCell>
                <Input
                  size="sm"
                  value={row.description}
                  onChange={e => onChange(row.rowId, { description: e.target.value })}
                  placeholder="(opsional)"
                />
              </TableCell>
              <TableCell align="center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(row.rowId)}
                  disabled={rows.length <= 1}
                  aria-label={`Hapus baris ${i + 1}`}
                  className="h-8 w-8 text-[color:var(--color-danger)]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableScroll>
  )
}

function SummaryStrip({
  total,
  percentage,
  sampleSize
}: {
  total: number
  percentage: number
  sampleSize: number
}) {
  const hasSample = sampleSize > 0
  // Visual cue based on % of sample
  const severity =
    !hasSample ? 'neutral'
    : percentage === 0 ? 'success'
    : percentage <= 2.5 ? 'success'
    : percentage <= 5 ? 'warning'
    : 'danger'

  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatBox label="Sampel" value={hasSample ? sampleSize.toLocaleString('id-ID') : '—'} />
      <StatBox label="Total Temuan" value={total.toLocaleString('id-ID')} />

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)] px-4 py-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
            Persentase
          </div>
          <div className="text-lg font-bold text-[color:var(--color-fg)] tabular-nums">
            {hasSample ? `${percentage.toFixed(2)}%` : '— (isi sampel)'}
          </div>
          {hasSample && (
            <div className="text-[11px] text-[color:var(--color-fg-subtle)] font-mono tabular-nums">
              {total} ÷ {sampleSize} × 100
            </div>
          )}
        </div>
        {hasSample && (
          <Badge
            variant={
              severity === 'success' ? 'success'
              : severity === 'warning' ? 'warning'
              : severity === 'danger' ? 'danger'
              : 'neutral'
            }
          >
            {severity === 'success' ? 'Aman' : severity === 'warning' ? 'Waspada' : severity === 'danger' ? 'Tinggi' : '—'}
          </Badge>
        )}
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)] px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        {label}
      </div>
      <div className="text-lg font-bold text-[color:var(--color-fg)] tabular-nums">{value}</div>
    </div>
  )
}

function SavedConfirmation({ record }: { record: VerificationDTO }) {
  return (
    <Card
      variant="elevated"
      padding="none"
      className="border-l-4 border-l-[color:var(--color-success)]"
    >
      <CardHeader>
        <CardTitle className="text-[color:var(--color-success)]">
          ✅ Verifikasi tersimpan
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-2 text-sm">
        <p>
          <strong>ID:</strong> <span className="font-mono">{record.id}</span>
        </p>
        <p>
          <strong>Batch:</strong> {record.batchNumber} ·{' '}
          <strong>Kode:</strong> {record.productCode} ·{' '}
          <strong>Tanggal:</strong> {record.date}
        </p>
        <p>
          <strong>Total temuan:</strong> {record.totalFindings} dari {record.sampleSize}{' '}
          sampel ({record.findingsPercentage.toFixed(2)}%)
        </p>
        {record.kesimpulan && (
          <p>
            <strong>Kesimpulan:</strong> {record.kesimpulan}
          </p>
        )}
      </CardBody>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  CSV builder                                                               */
/* -------------------------------------------------------------------------- */

function buildVerificationCsv(
  form: VerificationFormData,
  findings: FindingRow[],
  total: number,
  percentage: number
): string {
  const sampleSize = parseInt(form.sampleSize, 10) || 0
  const pctStr = sampleSize > 0 ? `${percentage.toFixed(2)}%` : '-'

  const headerLines: (string | unknown[])[] = [
    ['Lampiran Verifikasi Produk Bermasalah'],
    [],
    ['Tanggal', form.date],
    ['Kode Produk', form.productCode],
    ['Nomor Batch', form.batchNumber],
    ['Lokasi', form.location],
    ['Kriteria Penerimaan (AQL)', form.aqlCriteria],
    ['Jenis Unit Produk', UNIT_TYPE_LABEL[form.unitType]],
    ['Tingkat Inspeksi', `Level ${form.generalLevel}`],
    ['Jumlah Unit Sampel', sampleSize || ''],
    []
  ]

  const findingsLines: (string | unknown[])[] = [
    ['Temuan Masalah'],
    ['#', 'Label', 'Jenis Wadah', 'Jumlah Temuan', 'Deskripsi'],
    ...findings.map((f, i) => [
      i + 1,
      f.label,
      CONTAINER_TYPE_LABEL[f.containerType],
      parseInt(f.findingCount, 10) || 0,
      f.description
    ]),
    []
  ]

  const summaryLines: (string | unknown[])[] = [
    ['Ringkasan'],
    ['Total Temuan', total],
    ['Persentase', pctStr],
    ['Formula', sampleSize > 0 ? `${total} / ${sampleSize} * 100` : 'sampel = 0'],
    [],
    ['Keterangan', form.keterangan],
    ['Kesimpulan', form.kesimpulan]
  ]

  return csvJoin([...headerLines, ...findingsLines, ...summaryLines])
}
