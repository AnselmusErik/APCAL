/**
 * Guide Tab — defect classification reference + decision flow + switching rules.
 */

'use client'

import { useEffect, useState } from 'react'
import { ArrowRightLeft, BookOpen, ListChecks } from 'lucide-react'

import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Spinner
} from '@/components/ui'

import type { ApiResponse, ReferenceData } from '@/types/ansi'

type DefectClassification = ReferenceData['defectClassifications'][number]
type SwitchKey = keyof ReferenceData['switchingRules']

const switchMeta: Record<SwitchKey, { from: string; to: string }> = {
  normalToTightened: { from: 'Normal', to: 'Tightened' },
  tightenedToNormal: { from: 'Tightened', to: 'Normal' },
  normalToReduced: { from: 'Normal', to: 'Reduced' },
  reducedToNormal: { from: 'Reduced', to: 'Normal' }
}

const defectLabel: Record<DefectClassification['type'], string> = {
  critical: 'Kritis',
  major: 'Mayor',
  minor: 'Minor'
}

export function GuideTab() {
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
          setError(result.error || 'Gagal memuat panduan')
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Gagal memuat panduan')
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
        <Spinner size="lg" label="Memuat panduan..." />
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Alert variant="danger" title="Gagal memuat panduan">
        {error ?? 'Coba refresh halaman.'}
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      <section>
        <header className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
          <h2 className="text-xl font-bold text-[color:var(--color-fg)]">
            Klasifikasi Cacat Produk Injeksi Steril
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {data.defectClassifications.map(defect => (
            <DefectCard key={defect.type} defect={defect} />
          ))}
        </div>
      </section>

      <section>
        <header className="flex items-center gap-2 mb-4">
          <ListChecks className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
          <h2 className="text-xl font-bold text-[color:var(--color-fg)]">
            Alur Keputusan Sampling
          </h2>
        </header>

        <Card variant="elevated">
          <ol className="space-y-3 list-decimal list-inside text-sm text-[color:var(--color-fg)]">
            <li>Tentukan ukuran lot → cari kode huruf dari Tabel 1.</li>
            <li>Dari kode huruf & jenis inspeksi → tentukan jumlah sampel (n) dan batas Ac/Re.</li>
            <li>Ambil sampel sebanyak n unit secara acak.</li>
            <li>Hitung jumlah cacat per kategori (Kritis, Mayor, Minor).</li>
            <li>
              Bandingkan dengan batas Ac/Re:
              <ul className="ml-6 mt-2 space-y-1 list-disc list-outside text-[color:var(--color-fg-muted)]">
                <li>Cacat Kritis ≥ 1 → <Badge variant="solidDanger" size="sm">TOLAK</Badge></li>
                <li>Cacat Mayor ≥ Re → <Badge variant="solidDanger" size="sm">TOLAK</Badge></li>
                <li>Cacat Minor ≥ Re → <Badge variant="solidDanger" size="sm">TOLAK</Badge></li>
                <li>Selain itu → <Badge variant="solidSuccess" size="sm">TERIMA</Badge></li>
              </ul>
            </li>
          </ol>
        </Card>
      </section>

      <section>
        <header className="flex items-center gap-2 mb-4">
          <ArrowRightLeft className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
          <h2 className="text-xl font-bold text-[color:var(--color-fg)]">
            Aturan Peralihan Inspeksi
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(switchMeta) as SwitchKey[]).map(key => (
            <Card key={key} variant="default">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm">{switchMeta[key].from}</Badge>
                <ArrowRightLeft className="h-4 w-4 text-[color:var(--color-fg-muted)]" aria-hidden />
                <Badge variant="accent" size="sm">{switchMeta[key].to}</Badge>
              </div>
              <p className="text-sm text-[color:var(--color-fg-muted)]">
                {data.switchingRules[key].condition}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

function DefectCard({ defect }: { defect: DefectClassification }) {
  const variantByType = {
    critical: { accent: 'border-l-[color:var(--color-danger)]', badge: 'danger' as const },
    major:    { accent: 'border-l-[color:var(--color-warning)]', badge: 'warning' as const },
    minor:    { accent: 'border-l-[color:var(--color-info)]', badge: 'info' as const }
  }[defect.type]

  return (
    <Card variant="elevated" padding="none" className={`border-l-4 ${variantByType.accent}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span aria-hidden>{defect.icon}</span>
          {defectLabel[defect.type]}
          <Badge variant={variantByType.badge} size="sm">AQL {defect.aql}</Badge>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <ul className="space-y-1.5 text-sm text-[color:var(--color-fg-muted)]">
          {defect.examples.map((example, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[color:var(--color-fg-subtle)]" aria-hidden>•</span>
              <span>{example}</span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
