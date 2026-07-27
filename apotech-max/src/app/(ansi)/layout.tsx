"use client";

import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen,
  ClipboardCheck,
  Clock,
  Table as TableIcon,
  Workflow,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { Logo, AppSidebar } from '@/components/ui'
import type { SidebarItem } from '@/components/ui'
import { AnsiProvider } from '@/providers/AnsiProvider'

const NAV_ITEMS: SidebarItem[] = [
  { id: 'sampling', label: 'Sampling Plan', Icon: Workflow },
  { id: 'defects', label: 'Input Cacat', Icon: ClipboardCheck },
  { id: 'history', label: 'Riwayat', Icon: Clock },
  { id: 'references', label: 'Tabel Referensi', Icon: TableIcon },
  { id: 'guide', label: 'Panduan', Icon: BookOpen },
]

export default function AnsiLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  
  const activeId = pathname.split('/')[1] || 'sampling'

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
    <AnsiProvider>
      <div className="flex min-h-screen bg-[color:var(--color-bg-subtle)]">
        <AppSidebar
          items={NAV_ITEMS}
          activeId={activeId}
          onSelect={(id) => router.push(`/${id}`)}
          header={sidebarHeader}
        />

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="md:hidden h-16" aria-hidden />

          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
            <header className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-[color:var(--color-border)]">
              <div>
                <h1 className="text-xl font-bold text-[color:var(--color-fg)]">
                  APCAL — ANSI Pharma Calculator
                </h1>
                <p className="text-xs text-[color:var(--color-fg-muted)] mt-0.5">
                  PT Dankos Farma · QA Division · ANSI/ASQ Z1.4 Standard
                </p>
              </div>

              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-[color:var(--color-border)] text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger-tint)] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </header>

            {children}
          </div>
        </main>
      </div>
    </AnsiProvider>
  )
}
