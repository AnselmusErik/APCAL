/**
 * APCAL (ANSI Pharma Calculator) — Home page.
 *
 * Navigation refactored from horizontal tabs → left vertical sidebar.
 * All business logic, state management, and tab content are unchanged.
 *
 * The 5-section flow:
 *   1. Sampling Plan    — define lot + inspection level
 *   2. Input Cacat      — enter defect counts, get decision
 *   3. Verifikasi Produk — product verification
 *   4. Tabel Referensi  — Z1.4 II-A / II-B / II-C tables
 *   5. Panduan          — defect classification + decision flow
 */

'use client'

import { useState } from 'react'
import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  Table as TableIcon,
  Workflow
} from 'lucide-react'

import { Logo, Tabs, TabsContent, AppSidebar } from '@/components/ui'
import type { SidebarItem } from '@/components/ui'
import { SamplingPlanTab } from '@/components/ansi/SamplingPlanTab'
import { DefectsTab } from '@/components/ansi/DefectsTab'
import { ReferencesTab } from '@/components/ansi/ReferencesTab'
import { GuideTab } from '@/components/ansi/GuideTab'
import { VerificationTab } from '@/components/ansi/VerificationTab'

import type { SamplingPlanResponse, TabType } from '@/types/ansi'

const NAV_ITEMS: SidebarItem[] = [
  { id: 'sampling',      label: 'Sampling Plan',      Icon: Workflow       },
  { id: 'defects',       label: 'Input Cacat',         Icon: ClipboardCheck },
  { id: 'verification',  label: 'Verifikasi Produk',   Icon: ClipboardList  },
  { id: 'references',    label: 'Tabel Referensi',     Icon: TableIcon      },
  { id: 'guide',         label: 'Panduan',             Icon: BookOpen       },
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

  return (
    /* Full-viewport flex row — sidebar left, content right */
    <div className="flex min-h-screen bg-[color:var(--color-bg-subtle)]">

      <AppSidebar
        items={NAV_ITEMS}
        activeId={tab}
        onSelect={(id) => setTab(id as TabType)}
        header={sidebarHeader}
      />

      {/* ── Main content area ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile top spacing so hamburger doesn't overlap content */}
        <div className="md:hidden h-16" aria-hidden />

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

          {/* Page header — visible on md+ (mobile uses sidebar logo) */}
          <header className="hidden md:flex flex-col gap-1 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-fg)]">
              APCAL — ANSI Pharma Calculator
            </h1>
            <p className="text-sm text-[color:var(--color-fg-muted)]">
              PT Dankos Farma · QA Line Injeksi · ANSI/ASQ Z1.4
            </p>
          </header>

          {/*
            Radix Tabs.Root manages the active panel state.
            TabsList / TabsTrigger are intentionally omitted — the sidebar
            drives navigation by syncing the `value` prop.
          */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabType)}>
            <TabsContent value="sampling">
              <SamplingPlanTab onSamplingPlanCalculated={setSamplingResult} />
            </TabsContent>
            <TabsContent value="defects">
              <DefectsTab samplingResult={samplingResult} />
            </TabsContent>
            <TabsContent value="verification">
              <VerificationTab />
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
