/**
 * InspectionTypePicker
 * Card-based radio group untuk memilih Inspection Type (Normal / Tightened / Reduced).
 * Menampilkan keterangan singkat kondisi switching setiap pilihan.
 */

'use client'

interface InspectionTypeOption {
  value: 'normal' | 'tightened' | 'reduced'
  label: string
  icon: string
  description: string
  tag: string
  tagColor: string
}

const OPTIONS: InspectionTypeOption[] = [
  {
    value: 'normal',
    label: 'Normal',
    icon: '🟡',
    description: 'Inspeksi standar untuk batch reguler. Paling umum digunakan.',
    tag: 'Standar',
    tagColor: 'var(--color-primary)'
  },
  {
    value: 'tightened',
    label: 'Diperketat',
    icon: '🔴',
    description: 'Gunakan setelah ≥ 2 dari 5 lot berturut-turut ditolak saat Normal.',
    tag: 'Tightened',
    tagColor: 'var(--color-danger)'
  },
  {
    value: 'reduced',
    label: 'Diperlonggar',
    icon: '🟢',
    description: 'Gunakan setelah ≥ 10 lot berturut-turut lolos Normal tanpa masalah.',
    tag: 'Reduced',
    tagColor: 'var(--color-success)'
  }
]

interface InspectionTypePickerProps {
  value: 'normal' | 'tightened' | 'reduced'
  onChange: (type: 'normal' | 'tightened' | 'reduced') => void
  disabled?: boolean
}

export function InspectionTypePicker({ value, onChange, disabled }: InspectionTypePickerProps) {
  return (
    <div className="itp-root" role="radiogroup" aria-label="Pilih Jenis Inspeksi">
      {OPTIONS.map(opt => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            id={`itp-${opt.value}`}
            className={`itp-card ${selected ? 'itp-card--selected' : ''}`}
            onClick={() => onChange(opt.value)}
            aria-label={`${opt.label} — ${opt.description}`}
          >
            <span className="itp-top">
              <span className="itp-icon">{opt.icon}</span>
              <span
                className="itp-tag"
                style={{ '--itp-tag-color': opt.tagColor } as React.CSSProperties}
              >
                {opt.tag}
              </span>
            </span>
            <span className="itp-label">{opt.label}</span>
            <span className="itp-desc">{opt.description}</span>
            {selected && <span className="itp-check" aria-hidden>✓</span>}
          </button>
        )
      })}

      <style>{`
        .itp-root {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
          gap: 0.625rem;
        }
        .itp-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.3rem;
          padding: 0.875rem 1rem;
          border-radius: 0.75rem;
          border: 1.5px solid var(--color-border);
          background: var(--color-bg-surface);
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
          overflow: hidden;
        }
        .itp-card:hover:not(:disabled) {
          border-color: var(--color-primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .itp-card:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .itp-card--selected {
          border-color: var(--color-primary);
          background: var(--color-primary-tint);
          box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 59 130 246) / 0.2);
        }
        .itp-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .itp-icon {
          font-size: 1.25rem;
          line-height: 1;
        }
        .itp-tag {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--itp-tag-color);
          border: 1px solid var(--itp-tag-color);
          border-radius: 99px;
          padding: 0.1rem 0.45rem;
          opacity: 0.85;
        }
        .itp-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-fg);
        }
        .itp-desc {
          font-size: 0.7rem;
          color: var(--color-fg-muted);
          line-height: 1.4;
        }
        .itp-check {
          position: absolute;
          top: 0.5rem;
          right: 0.625rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--color-primary);
        }
      `}</style>
    </div>
  )
}
