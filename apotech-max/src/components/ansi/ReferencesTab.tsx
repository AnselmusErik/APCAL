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
        const response = await fetch('/api/ansi/references')
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
      <Card variant="elevated" padding="none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpenText className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
            Tabel 1 — Ukuran Lot → Kode Huruf (General Inspection Level II)
          </CardTitle>
        </CardHeader>
        <CardBody>
          <TableScroll>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rentang Ukuran Lot</TableHead>
                  <TableHead align="center">Kode Huruf</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lotCodeMappings.map(mapping => (
                  <TableRow key={mapping.code}>
                    <TableCell>
                      {mapping.minSize.toLocaleString('id-ID')} – {mapping.maxSize.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell align="center" className="font-bold text-[color:var(--color-primary)]">
                      {mapping.code}
                    </TableCell>
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
