/**
 * References Tab — read-only display of the underlying Z1.4 tables.
 */

'use client'

import { useEffect, useState } from 'react'
import { BookOpenText } from 'lucide-react'

import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll
} from '@/components/ui'

import type { ApiResponse, ReferenceData } from '@/types/ansi'

type PlanRow = ReferenceData['samplingPlans'][number]

export function ReferencesTab() {
  const [data, setData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ansi/references`)
        const result: ApiResponse<ReferenceData> = await response.json()
        if (cancelled) return
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.error || 'Gagal memuat data referensi')
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Gagal memuat data referensi')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <Card variant="elevated" className="flex items-center justify-center py-16">
        <Spinner size="lg" label="Memuat tabel referensi..." />
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Alert variant="danger" title="Gagal memuat data referensi">
        {error ?? 'Coba refresh halaman.'}
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Inspection Levels Explanation Card ── */}
      <Card variant="elevated" className="space-y-4">
        <CardHeader className="p-0 border-none">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpenText className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
            Penjelasan Tingkat Inspeksi (Inspection Levels)
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Special Inspection Levels */}
            <div className="p-4 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)] space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[color:var(--color-fg)]">Special Inspection Levels</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[color:var(--color-info-tint)] text-[color:var(--color-info)] font-medium">S-1, S-2, S-3, S-4</span>
              </div>
              <p className="text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                Digunakan ketika hanya diperlukan pemeriksaan khusus dengan jumlah sampel yang lebih sedikit (misal pengujian destruktif atau biaya tinggi).
              </p>
            </div>

            {/* General Inspection Levels */}
            <div className="p-4 rounded-[var(--radius-md)] border border-[color:var(--color-primary)] bg-[color:var(--color-primary-tint)] space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[color:var(--color-primary)]">General Inspection Levels</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[color:var(--color-primary)] text-white font-medium">Level I, II, III</span>
              </div>
              <p className="text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                Pemeriksaan umum untuk produksi farmasi. Level II merupakan standar default internasional ANSI/ASQ Z1.4.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-[var(--radius-sm)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] space-y-1">
              <span className="font-semibold text-[color:var(--color-fg)]">Level I</span>
              <ul className="text-[color:var(--color-fg-muted)] space-y-0.5 list-disc list-inside">
                <li>Sampel lebih sedikit</li>
                <li>Risiko lebih tinggi</li>
                <li>Bila ingin mengurangi inspeksi</li>
              </ul>
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] space-y-1">
              <span className="font-semibold text-[color:var(--color-fg)]">Level II</span>
              <ul className="text-[color:var(--color-fg-muted)] space-y-0.5 list-disc list-inside">
                <li>Standar internasional</li>
                <li>Default ANSI/ASQ Z1.4</li>
                <li>Paling umum digunakan</li>
              </ul>
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] space-y-1">
              <span className="font-semibold text-[color:var(--color-fg)]">Level III</span>
              <ul className="text-[color:var(--color-fg-muted)] space-y-0.5 list-disc list-inside">
                <li>Sampel lebih banyak</li>
                <li>Pemeriksaan paling ketat</li>
                <li>Tingkat keyakinan tinggi</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Table I Reference Mapping ── */}
      <Card variant="elevated" padding="none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpenText className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
            Reference Mapping (ANSI/ASQ Z1.4 Table I — Kode Huruf Sampel)
          </CardTitle>
        </CardHeader>
        <CardBody>
          <TableScroll>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Lot Size</TableHead>
                  <TableHead align="center">S-1</TableHead>
                  <TableHead align="center">S-2</TableHead>
                  <TableHead align="center">S-3</TableHead>
                  <TableHead align="center">S-4</TableHead>
                  <TableHead align="center">Level I</TableHead>
                  <TableHead align="center">Level II</TableHead>
                  <TableHead align="center">Level III</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lotCodeMappings.map((mapping, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {mapping.maxSize >= 99999999
                        ? `≥ ${mapping.minSize.toLocaleString('id-ID')}`
                        : `${mapping.minSize.toLocaleString('id-ID')} – ${mapping.maxSize.toLocaleString('id-ID')}`}
                    </TableCell>
                    <TableCell align="center">{mapping.s1 ?? 'A'}</TableCell>
                    <TableCell align="center">{mapping.s2 ?? 'A'}</TableCell>
                    <TableCell align="center">{mapping.s3 ?? 'A'}</TableCell>
                    <TableCell align="center">{mapping.s4 ?? 'A'}</TableCell>
                    <TableCell align="center">{mapping.gi ?? 'A'}</TableCell>
                    <TableCell align="center">{mapping.gii ?? mapping.code}</TableCell>
                    <TableCell align="center">{mapping.giii ?? 'B'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableScroll>
        </CardBody>
      </Card>

      <SamplingPlanTable
        title="Tabel 2 — Normal Inspection (Z1.4 II-A)"
        plans={data.samplingPlans}
      />
      <SamplingPlanTable
        title="Tabel 3 — Tightened Inspection (Z1.4 II-B)"
        plans={data.tightenedPlans ?? []}
        accent="warning"
      />
      <SamplingPlanTable
        title="Tabel 4 — Reduced Inspection (Z1.4 II-C)"
        plans={data.reducedPlans ?? []}
        accent="success"
      />

      <Alert variant="info" title="Catatan singkat tiga level inspeksi">
        <ul className="ml-4 list-disc space-y-1 mt-1">
          <li><strong>Normal</strong> — default untuk lot reguler.</li>
          <li><strong>Tightened</strong> — Ac lebih ketat, dipakai saat kualitas menurun.</li>
          <li><strong>Reduced</strong> — sample size lebih kecil, Ac–Re ada gap; saat kualitas stabil baik.</li>
        </ul>
      </Alert>
    </div>
  )
}

function SamplingPlanTable({
  title,
  plans,
  accent = 'primary'
}: {
  title: string
  plans: PlanRow[]
  accent?: 'primary' | 'warning' | 'success'
}) {
  // Re-color only the table header — body stays neutral.
  const headerClass = {
    primary: '',
    warning: '[&_thead]:bg-[color:var(--color-warning)] [&_thead]:text-[color:var(--color-warning-fg)]',
    success: '[&_thead]:bg-[color:var(--color-success)] [&_thead]:text-[color:var(--color-success-fg)]'
  }[accent]

  return (
    <Card variant="elevated" padding="none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        <TableScroll className={headerClass}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead align="center">Kode</TableHead>
                <TableHead align="center">n (Sampel)</TableHead>
                <TableHead align="center">Critical (0%)</TableHead>
                <TableHead align="center">Major (2.5%)</TableHead>
                <TableHead align="center">Minor (4%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map(plan => (
                <TableRow key={plan.code}>
                  <TableCell align="center" className="font-bold text-[color:var(--color-primary)]">
                    {plan.code}
                  </TableCell>
                  <TableCell align="center" className="tabular-nums">{plan.sampleSize}</TableCell>
                  <TableCell align="center" className="tabular-nums">
                    {plan.critical.ac} / {plan.critical.re}
                  </TableCell>
                  <TableCell align="center" className="tabular-nums">
                    {plan.major.ac} / {plan.major.re}
                  </TableCell>
                  <TableCell align="center" className="tabular-nums">
                    {plan.minor.ac} / {plan.minor.re}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      </CardBody>
    </Card>
  )
}
