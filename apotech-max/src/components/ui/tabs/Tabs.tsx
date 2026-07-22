'use client'

import * as React from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/cn'

/**
 * Tabs — accessible tab control wired through Radix.
 *
 * Composition:
 *
 *     <Tabs defaultValue="one">
 *       <TabsList>
 *         <TabsTrigger value="one">First</TabsTrigger>
 *         <TabsTrigger value="two">Second</TabsTrigger>
 *       </TabsList>
 *       <TabsContent value="one">…</TabsContent>
 *       <TabsContent value="two">…</TabsContent>
 *     </Tabs>
 *
 * The trigger styling is "pill" by default. For underlined / vertical
 * variants we can extend with `variant` prop later.
 */

export const Tabs = RadixTabs.Root

export const TabsList = React.forwardRef<
  React.ElementRef<typeof RadixTabs.List>,
  React.ComponentPropsWithoutRef<typeof RadixTabs.List>
>(function TabsList({ className, ...rest }, ref) {
  return (
    <RadixTabs.List
      ref={ref}
      className={cn(
        'inline-flex flex-wrap items-center gap-2',
        'p-1.5 rounded-[var(--radius-full)]',
        'bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)]',
        className
      )}
      {...rest}
    />
  )
})

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(function TabsTrigger({ className, ...rest }, ref) {
  return (
    <RadixTabs.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2 px-4 h-9 text-sm font-semibold',
        'rounded-[var(--radius-full)]',
        'text-[color:var(--color-fg-muted)]',
        'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
        'hover:text-[color:var(--color-fg)] hover:bg-[color:var(--color-surface)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-subtle)]',
        // Active state — Dankos blue pill
        'data-[state=active]:bg-[color:var(--color-primary)]',
        'data-[state=active]:text-[color:var(--color-primary-fg)]',
        'data-[state=active]:shadow-[var(--shadow-sm)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...rest}
    />
  )
})

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Content>,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Content>
>(function TabsContent({ className, ...rest }, ref) {
  return (
    <RadixTabs.Content
      ref={ref}
      className={cn(
        'mt-6',
        'focus-visible:outline-none',
        'data-[state=active]:animate-fadeIn',
        className
      )}
      {...rest}
    />
  )
})
