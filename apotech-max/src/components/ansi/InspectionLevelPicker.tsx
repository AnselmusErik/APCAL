/**
 * InspectionLevelPicker
 * Toggle group (Segmented Control) untuk memilih Inspection Code ANSI Table I:
 *   S1, S2, S3, S4 (Special) — GI, GII, GIII (General)
 *
 * Default: GII (General II) — paling umum dipakai industri farmasi.
 */

'use client'

import type { InspectionCode } from '@/types/ansi'

interface Option {
  value: InspectionCode
  label: string
  sublabel: string
}

const GROUPS: { group: string; options: Option[] }[] = [
  {
    group: 'Special',
    options: [
      { value: 'S1', label: 'S-1', sublabel: 'Sangat kecil' },
      { value: 'S2', label: 'S-2', sublabel: 'Kecil' },
      { value: 'S3', label: 'S-3', sublabel: 'Sedang' },
      { value: 'S4', label: 'S-4', sublabel: 'Menengah' },
    ]
  },
  {
    group: 'General',
    options: [
      { value: 'GI',   label: 'I',   sublabel: 'Longgar' },
      { value: 'GII',  label: 'II',  sublabel: 'Normal ✓' },
      { value: 'GIII', label: 'III', sublabel: 'Ketat' },
    ]
  }
]

interface InspectionLevelPickerProps {
  value: InspectionCode
  onChange: (code: InspectionCode) => void
  disabled?: boolean
}

export function InspectionLevelPicker({ value, onChange, disabled }: InspectionLevelPickerProps) {
  return (
    <div className="ilp-root" aria-label="Pilih Inspection Code (ANSI Table I)">
      {GROUPS.map(({ group, options }) => (
        <div key={group} className="ilp-group">
          <p className="ilp-group-label">{group}</p>
          <div className="ilp-group-options" role="group" aria-label={`${group} Inspection Levels`}>
            {options.map(opt => {
              const selected = value === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  className={`ilp-option ${selected ? 'ilp-option--selected' : ''}`}
                  onClick={() => onChange(opt.value)}
                  id={`ilp-${opt.value}`}
                  aria-label={`${group} ${opt.label} — ${opt.sublabel}`}
                >
                  <span className="ilp-option-label">{opt.label}</span>
                  <span className="ilp-option-sub">{opt.sublabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <style>{`
        .ilp-root {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .ilp-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .ilp-group-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-fg-muted);
          padding-left: 0.125rem;
        }
        .ilp-group-options {
          display: flex;
          gap: 0.375rem;
          flex-wrap: wrap;
        }
        .ilp-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 4rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1.5px solid var(--color-border);
          background: var(--color-bg-surface);
          cursor: pointer;
          transition: all 0.15s ease;
          gap: 0.125rem;
          user-select: none;
        }
        .ilp-option:hover:not(:disabled) {
          border-color: var(--color-primary);
          background: var(--color-primary-tint);
        }
        .ilp-option:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .ilp-option--selected {
          border-color: var(--color-primary);
          background: var(--color-primary);
          box-shadow: 0 2px 6px rgba(var(--color-primary-rgb, 59 130 246) / 0.35);
        }
        .ilp-option-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-fg);
          transition: color 0.15s ease;
        }
        .ilp-option--selected .ilp-option-label {
          color: #fff;
        }
        .ilp-option-sub {
          font-size: 0.6rem;
          color: var(--color-fg-muted);
          transition: color 0.15s ease;
          white-space: nowrap;
        }
        .ilp-option--selected .ilp-option-sub {
          color: rgba(255,255,255,0.8);
        }
      `}</style>
    </div>
  )
}
