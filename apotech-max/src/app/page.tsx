/**
 * APCAL (ANSI Pharma Calculator) — Home page.
 *
 * Navigation: left vertical sidebar.
 *
 * Menu:
 *   1. Sampling Plan    — define lot + inspection level
 *   2. Input Cacat      — enter defect counts, get decision
 *   3. Riwayat          — calculation history (localStorage)
 *   4. Tabel Referensi  — Z1.4 II-A / II-B / II-C tables
 *   5. Panduan          — defect classification + decision flow
 */

'use client'

import { useState } from 'react'
import {
  BookOpen,
  ClipboardCheck,
  Clock,
  Table as TableIcon,
  Workflow
} from 'lucide-react'

import { Logo, Tabs, TabsContent, AppSidebar } from '@/components/ui'
import type { SidebarItem } from '@/components/ui'
import { SamplingPlanTab } from '@/components/ansi/SamplingPlanTab'
import { DefectsTab } from '@/components/ansi/DefectsTab'
import { ReferencesTab } from '@/components/ansi/ReferencesTab'
import { GuideTab } from '@/components/ansi/GuideTab'
import { HistoryTab } from '@/components/ansi/HistoryTab'

import type { SamplingPlanResponse, TabType } from '@/types/ansi'

const NAV_ITEMS: SidebarItem[] = [
  { id: 'sampling',    label: 'Sampling Plan',   Icon: Workflow       },
  { id: 'defects',     label: 'Input Cacat',      Icon: ClipboardCheck },
  { id: 'history',     label: 'Riwayat',          Icon: Clock          },
  { id: 'references',  label: 'Tabel Referensi',  Icon: TableIcon      },
  { id: 'guide',       label: 'Panduan',          Icon: BookOpen       },
]

export default function Home() {
  const [tab, setTab] = useState<TabType>('sampling')
  const [samplingResult, setSamplingResult] = useState<SamplingPlanResponse | null>(null)

  const sidebarHeader = (
    <div className="flex flex-col gap-1 overflow-hidden">
      <Logo size="sm" priority />
      <div className="mt-1 leading-tight overflow-hidden">
        <p className="text-xs font-bold text-[color:var(--color-fg)] truncate">APCAL</p>
        <p className="text-[10px] text-[color:var(--color-fg-muted)] truncate">ANSI/ASQ Z1.4</p>
      </div>
    </div>
  )

  function handleSelectHistoryItem(entry: any) {
    const samplingPlanRes: SamplingPlanResponse = {
      historyId: entry.id,
      productName: entry.productName ?? '',
      batchNumber: entry.batchNumber ?? '',
      lotSize: entry.lotSize,
      inspectionLevel: entry.inspectionLevel as any,
      inspectionCode: entry.inspectionCode as any,
      inspectionCodeLabel: entry.inspectionCodeLabel,
      letterCode: entry.letterCode,
      inspectionTypeLabel: entry.inspectionTypeLabel,
      initialDefects: entry.defectCounts ?? undefined,
      samplingPlan: {
        code: entry.letterCode,
        sampleSize: entry.sampleSize,
        critical: entry.critical,
        major: entry.major,
        minor: entry.minor,
      },
    }
    setSamplingResult(samplingPlanRes)
    setTab('defects')
  }

  return (
    <div className="flex min-h-screen bg-[color:var(--color-bg-subtle)]">

      <AppSidebar
        items={NAV_ITEMS}
        activeId={tab}
        onSelect={(id) => setTab(id as TabType)}
        header={sidebarHeader}
      />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="md:hidden h-16" aria-hidden />

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

          <header className="hidden md:flex flex-col gap-1 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-fg)]">
              APCAL — ANSI Pharma Calculator
            </h1>
            <p className="text-sm text-[color:var(--color-fg-muted)]">
              PT Dankos Farma · QA Line Injeksi · ANSI/ASQ Z1.4
            </p>
          </header>

          <Tabs value={tab} onValueChange={(v) => setTab(v as TabType)}>
            <TabsContent value="sampling">
              <SamplingPlanTab onSamplingPlanCalculated={setSamplingResult} />
            </TabsContent>
            <TabsContent value="defects">
              <DefectsTab samplingResult={samplingResult} />
            </TabsContent>
            <TabsContent value="history">
              <HistoryTab onSelectForEvaluation={handleSelectHistoryItem} />
            </TabsContent>
            <TabsContent value="references">
              <ReferencesTab />
            </TabsContent>
            <TabsContent value="guide">
              <GuideTab />
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  )
}
