'use client'

/**
 * AppSidebar — Vertical permanent sidebar navigation.
 *
 * Replaces the horizontal TabsList while preserving all Radix Tabs state.
 * Uses design tokens from globals.css (--color-primary, --color-border, etc.)
 * and Lucide icons already installed in the project.
 *
 * Features:
 *  - Collapse to icon-only mode (desktop)
 *  - Mobile overlay with hamburger toggle
 *  - Active-item indicator using --color-primary
 *  - Smooth transitions via --duration-base / --ease-out
 */

import * as React from 'react'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SidebarItem {
  id: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
}

export interface AppSidebarProps {
  items: SidebarItem[]
  activeId: string
  onSelect: (id: string) => void
  /** Shown at the top of the sidebar — logo / brand slot */
  header?: React.ReactNode
  className?: string
}

export function AppSidebar({
  items,
  activeId,
  onSelect,
  header,
  className,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  /** Close mobile overlay when a menu item is selected */
  const handleSelect = (id: string) => {
    onSelect(id)
    setMobileOpen(false)
  }

  return (
    <>
      {/* ── Mobile: hamburger trigger (visible < md) ── */}
      <button
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className={cn(
          'fixed top-4 left-4 z-40 md:hidden',
          'flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)]',
          'bg-[color:var(--color-surface)] border border-[color:var(--color-border)]',
          'shadow-[var(--shadow-sm)]',
          'text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]',
          'transition-colors duration-[var(--duration-fast)]',
          mobileOpen && 'hidden'
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ── Mobile: backdrop overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        role="navigation"
        aria-label="Sidebar navigation"
        className={cn(
          // Layout
          'flex flex-col h-screen sticky top-0',
          'bg-[color:var(--color-surface)] border-r border-[color:var(--color-border)]',
          'shadow-[var(--shadow-sm)]',
          // Width transition
          'transition-[width] duration-[var(--duration-base)] ease-[var(--ease-out)]',
          // Desktop widths
          collapsed ? 'w-[68px]' : 'w-[220px]',
          // Mobile: fixed overlay
          'max-md:fixed max-md:top-0 max-md:left-0 max-md:z-50',
          'max-md:w-[240px] max-md:shadow-[var(--shadow-xl)]',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          'max-md:transition-transform max-md:duration-[var(--duration-base)] max-md:ease-[var(--ease-out)]',
          className
        )}
      >
        {/* ── Header slot (logo / app title + toggle collapse) ── */}
        <div
          className={cn(
            'flex items-center justify-between gap-2 px-3 py-4 border-b border-[color:var(--color-border)]',
            'overflow-hidden min-h-[72px]'
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {header}
          </div>

          {/* ── Collapse / expand toggle (desktop only, topbar next to logo) ── */}
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'hidden md:flex shrink-0 items-center justify-center w-8 h-8 rounded-[var(--radius-sm)]',
              'text-[color:var(--color-fg-subtle)]',
              'hover:bg-[color:var(--color-bg-subtle)] hover:text-[color:var(--color-fg)]',
              'transition-colors duration-[var(--duration-fast)]'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* ── Mobile close button ── */}
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'md:hidden absolute top-3 right-3',
            'flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)]',
            'text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]',
            'hover:bg-[color:var(--color-bg-subtle)]',
            'transition-colors duration-[var(--duration-fast)]'
          )}
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Nav items ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          <ul className="flex flex-col gap-0.5 px-2" role="list">
            {items.map(({ id, label, Icon }) => {
              const isActive = activeId === id
              return (
                <li key={id}>
                  <button
                    id={`sidebar-item-${id}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => handleSelect(id)}
                    title={collapsed ? label : undefined}
                    className={cn(
                      'group w-full flex items-center gap-3 rounded-[var(--radius-md)]',
                      'text-sm font-medium',
                      'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-1',
                      collapsed ? 'px-0 justify-center h-10' : 'px-3 h-10',
                      isActive
                        ? [
                            'bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]',
                            'shadow-[var(--shadow-sm)]',
                          ]
                        : [
                            'text-[color:var(--color-fg-muted)]',
                            'hover:bg-[color:var(--color-bg-subtle)]',
                            'hover:text-[color:var(--color-fg)]',
                          ]
                    )}
                  >
                    <Icon
                      className={cn(
                        'shrink-0',
                        collapsed ? 'h-5 w-5' : 'h-4 w-4'
                      )}
                      aria-hidden
                    />
                    {!collapsed && (
                      <span className="truncate leading-none">{label}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
