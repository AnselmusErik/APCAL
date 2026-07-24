import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * Table — minimal accessible HTML table styled with Dankos tokens.
 * Wrap in a scrollable container with `<TableScroll>` for narrow viewports.
 *
 *     <TableScroll>
 *       <Table>
 *         <TableHeader>
 *           <TableRow>
 *             <TableHead>Code</TableHead>
 *             <TableHead align="right">n</TableHead>
 *           </TableRow>
 *         </TableHeader>
 *         <TableBody>
 *           <TableRow><TableCell>A</TableCell><TableCell align="right">2</TableCell></TableRow>
 *         </TableBody>
 *       </Table>
 *     </TableScroll>
 */

export const TableScroll = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function TableScroll({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'w-full overflow-x-auto',
        'rounded-[var(--radius-lg)] border border-[color:var(--color-border)]',
        className
      )}
      {...rest}
    />
  )
})

export const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(function Table({ className, ...rest }, ref) {
  return (
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...rest}
    />
  )
})

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...rest }, ref) {
  return (
    <thead
      ref={ref}
      className={cn(
        'bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]',
        className
      )}
      {...rest}
    />
  )
})

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...rest }, ref) {
  return (
    <tbody
      ref={ref}
      className={cn(
        'divide-y divide-[color:var(--color-border)] bg-[color:var(--color-surface)]',
        className
      )}
      {...rest}
    />
  )
})

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(function TableRow({ className, ...rest }, ref) {
  return (
    <tr
      ref={ref}
      className={cn(
        'transition-colors',
        className
      )}
      {...rest}
    />
  )
})

type Align = 'left' | 'center' | 'right'
const alignClass: Record<Align, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
}

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  function TableHead({ className, align = 'left', ...rest }, ref) {
    return (
      <th
        ref={ref}
        scope="col"
        className={cn(
          'px-4 py-3 font-semibold text-xs uppercase tracking-wider',
          alignClass[align],
          className
        )}
        {...rest}
      />
    )
  }
)

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ className, align = 'left', ...rest }, ref) {
    return (
      <td
        ref={ref}
        className={cn('px-4 py-2.5', alignClass[align], className)}
        {...rest}
      />
    )
  }
)

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption({ className, ...rest }, ref) {
  return (
    <caption
      ref={ref}
      className={cn('mt-3 text-xs text-[color:var(--color-fg-muted)]', className)}
      {...rest}
    />
  )
})
