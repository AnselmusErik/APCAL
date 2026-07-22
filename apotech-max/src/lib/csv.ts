/**
 * Tiny CSV helpers — no dependency.
 *
 * RFC 4180-ish: wrap cells containing comma / double-quote / newline in
 * double quotes, escape inner double quotes by doubling them. Lines use \r\n
 * so Excel on Windows interprets them as one row.
 */

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  const needsQuoting = /[",\r\n]/.test(s)
  const escaped = s.replace(/"/g, '""')
  return needsQuoting ? `"${escaped}"` : escaped
}

export function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(',')
}

export function csvJoin(rows: (unknown[] | string)[]): string {
  return rows.map(r => (typeof r === 'string' ? r : csvRow(r))).join('\r\n')
}

/**
 * Trigger a browser download of `content` as a CSV file. Prepends the BOM so
 * Excel auto-detects UTF-8 (important for Indonesian characters).
 */
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Defer revoke so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
