/**
 * cn() — concatenate Tailwind classNames with conflict resolution.
 *
 * Use this in every design-system primitive so callers can pass `className`
 * overrides that beat the component's built-in classes:
 *
 *     <Button className="px-8">…</Button>
 *
 * `tailwind-merge` ensures the override wins (e.g. caller's `px-8` replaces
 * the default `px-4` instead of both surviving in the DOM).
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
