/**
 * Sampling Plan Tab — 3-Step ANSI Z1.4 Form
 *
 * Step 1: Data Produk (Product Name, Batch, Lot Size)
 * Step 2: Parameter Sampling (InspectionCode + InspectionLevel)
 * Step 3: Hasil Sampling Plan (Code Letter, n, Ac/Re)
 */

'use client'

import { useState } from 'react'
import { Calculator, ChevronLeft, ChevronRight, Package, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Alert
} from '@/components/ui'
import { AcReBadge } from '@/components/patterns'
import { InspectionLevelPicker } from './InspectionLevelPicker'
import { InspectionTypePicker } from './InspectionTypePicker'

import type {
  ApiResponse,
  FormData,
  InspectionCode,
  SamplingPlanResponse
} from '@/types/ansi'

interface SamplingPlanTabProps {
  onSamplingPlanCalculated: (result: SamplingPlanResponse) => void
}

const STEPS = [
  { id: 1, label: 'Data Produk',       icon: <Package    className="h-4 w-4" aria-hidden /> },
  { id: 2, label: 'Parameter Sampling', icon: <Settings2  className="h-4 w-4" aria-hidden /> },
  { id: 3, label: 'Hasil',              icon: <Calculator className="h-4 w-4" aria-hidden /> },
]

export function SamplingPlanTab({ onSamplingPlanCalculated }: SamplingPlanTabProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    batchNumber: '',
    lotSize: '',
    inspectionLevel: 'normal',
    inspectionCode: 'GII'
  })
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<SamplingPlanResponse | null>(null)

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleInspectionCode(code: InspectionCode) {
    setFormData(prev => ({ ...prev, inspectionCode: code }))
  }

  function handleInspectionLevel(level: 'normal' | 'tightened' | 'reduced') {
    setFormData(prev => ({ ...prev, inspectionLevel: level }))
  }

  function canAdvanceStep1(): boolean {
    const ls = parseInt(formData.lotSize, 10)
    return !isNaN(ls) && ls > 0
  }

  function goNext() {
    if (step === 1 && !canAdvanceStep1()) {
      toast.error('Masukkan ukuran lot yang valid (angka > 0)')
      return
    }
    if (step < 3) setStep(s => (s + 1) as 1 | 2 | 3)
  }

  function goBack() {
    if (step > 1) setStep(s => (s - 1) as 1 | 2 | 3)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const response = await fetch('/api/ansi/sampling-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lotSize: parseInt(formData.lotSize, 10)
        })
      })
      const data: ApiResponse<SamplingPlanResponse> = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Gagal menghitung sampling plan')
      }

      setResult(data.data)
      onSamplingPlanCalculated(data.data)
      setStep(3)
      toast.success('Sampling plan berhasil dihitung')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── Stepper ── */}
      <StepIndicator current={step} />

      {/* ── Step 1: Data Produk ── */}
      {step === 1 && (
        <Card variant="elevated" padding="none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
              Step 1 — Data Produk
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Nama Produk" optional>
                <Input
                  name="productName"
                  value={formData.productName}
                  onChange={handleTextChange}
                  placeholder="Contoh: Vial Cefotaxime 1g"
                />
              </FormField>

              <FormField label="No. Batch" optional>
                <Input
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleTextChange}
                  placeholder="Contoh: BATCH2401A"
                />
              </FormField>
            </div>

            <FormField
              label="Ukuran Lot (jumlah unit)"
              required
              helpText="Total unit yang diproduksi dalam satu batch"
            >
              <Input
                name="lotSize"
                type="number"
                min={1}
                value={formData.lotSize}
                onChange={handleTextChange}
                placeholder="Contoh: 5000"
              />
            </FormField>

            <div className="flex justify-end">
              <Button
                onClick={goNext}
                iconRight={<ChevronRight className="h-4 w-4" />}
                disabled={!canAdvanceStep1()}
              >
                Berikutnya
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── Step 2: Parameter Sampling ── */}
      {step === 2 && (
        <Card variant="elevated" padding="none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
              Step 2 — Parameter Sampling
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Inspection Code */}
            <FormField
              label="Inspection Code (ANSI Table I)"
              required
              helpText="Menentukan kolom pada Tabel I untuk mendapatkan Kode Huruf. Pilih General II jika tidak ada ketentuan khusus."
            >
              <InspectionLevelPicker
                value={formData.inspectionCode}
                onChange={handleInspectionCode}
              />
            </FormField>

            {/* Inspection Level */}
            <FormField
              label="Jenis Inspeksi (Tabel II)"
              required
              helpText="Menentukan tabel sampling plan yang digunakan (Normal=II-A, Ketat=II-B, Longgar=II-C)"
            >
              <InspectionTypePicker
                value={formData.inspectionLevel}
                onChange={handleInspectionLevel}
              />
            </FormField>

            <Alert variant="info" title="Tentang pilihan ini">
              <strong>Inspection Code</strong> (General/Special) menentukan ukuran sampel relatif
              terhadap ukuran lot.{' '}
              <strong>Jenis Inspeksi</strong> (Normal/Ketat/Longgar) menentukan batas Ac/Re yang
              digunakan, sesuai aturan switching Z1.4.
            </Alert>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={goBack}
                iconLeft={<ChevronLeft className="h-4 w-4" />}
              >
                Kembali
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                iconLeft={!loading && <Calculator className="h-4 w-4" />}
              >
                {loading ? 'Menghitung...' : 'Hitung Sampling Plan'}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── Step 3: Hasil ── */}
      {step === 3 && result && (
        <div className="space-y-4">
          <SamplingPlanResult result={result} />
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => { setStep(1); setResult(null) }}
              iconLeft={<ChevronLeft className="h-4 w-4" />}
            >
              Hitung Ulang
            </Button>
            <p className="text-xs text-[color:var(--color-fg-muted)]">
              Lanjut ke tab <strong>Input Cacat</strong> untuk mengevaluasi temuan.
            </p>
          </div>
        </div>
      )}

      {/* Hint saat belum mulai / langkah awal */}
      {step === 1 && (
        <Alert variant="info" title="Petunjuk">
          Isi data produk, klik <strong>Berikutnya</strong> untuk memilih parameter sampling.
          Setelah selesai, klik <strong>Hitung Sampling Plan</strong> untuk mendapatkan kode huruf
          dan sampel (n).
        </Alert>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Langkah pengisian" className="sp-stepper">
      {STEPS.map((s, i) => {
        const state = s.id < current ? 'done' : s.id === current ? 'active' : 'pending'
        return (
          <div key={s.id} className={`sp-step sp-step--${state}`} aria-current={state === 'active' ? 'step' : undefined}>
            <span className="sp-step-num" aria-hidden>
              {state === 'done' ? '✓' : s.id}
            </span>
            <span className="sp-step-label">{s.label}</span>
            {i < STEPS.length - 1 && <span className="sp-connector" aria-hidden />}
          </div>
        )
      })}

      <style>{`
        .sp-stepper {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 0.25rem 0;
        }
        .sp-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          flex: 1;
        }
        .sp-step-num {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
          border: 2px solid var(--color-border);
          background: var(--color-bg-surface);
          color: var(--color-fg-muted);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .sp-step--active .sp-step-num {
          border-color: var(--color-primary);
          background: var(--color-primary);
          color: #fff;
          box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 59 130 246) / 0.2);
        }
        .sp-step--done .sp-step-num {
          border-color: var(--color-success);
          background: var(--color-success);
          color: #fff;
        }
        .sp-step-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-fg-muted);
          white-space: nowrap;
        }
        .sp-step--active .sp-step-label {
          color: var(--color-primary);
        }
        .sp-step--done .sp-step-label {
          color: var(--color-success);
        }
        .sp-connector {
          flex: 1;
          height: 2px;
          background: var(--color-border);
          margin: 0 0.5rem;
          min-width: 1rem;
        }
        @media (max-width: 480px) {
          .sp-step-label { display: none; }
        }
      `}</style>
    </nav>
  )
}

function SamplingPlanResult({ result }: { result: SamplingPlanResponse }) {
  const { samplingPlan } = result
  return (
    <Card variant="elevated" padding="none" className="border-l-4 border-l-[color:var(--color-primary)]">
      <CardHeader>
        <CardTitle>✅ Hasil Sampling Plan</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        {(result.productName || result.batchNumber) && (
          <div className="text-sm text-[color:var(--color-fg-muted)]">
            <span className="font-semibold text-[color:var(--color-fg)]">Produk:</span>{' '}
            {result.productName || '-'}
            <span className="mx-2">·</span>
            <span className="font-semibold text-[color:var(--color-fg)]">Batch:</span>{' '}
            {result.batchNumber || '-'}
          </div>
        )}

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <Stat label="Lot Size"         value={result.lotSize.toLocaleString('id-ID')} />
          <Stat label="Kode Huruf"       value={result.letterCode}        highlight />
          <Stat label="Inspeksi"         value={result.inspectionTypeLabel} />
          <Stat label="Sampel (n)"       value={`${samplingPlan.sampleSize} unit`} highlight />
        </dl>

        {/* Inspection Code info */}
        <div className="flex items-center gap-2 text-xs text-[color:var(--color-fg-muted)]">
          <span className="font-semibold text-[color:var(--color-fg)]">Inspection Code:</span>
          <span className="px-2 py-0.5 rounded-full bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] font-medium">
            {result.inspectionCode} — {result.inspectionCodeLabel}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-fg-muted)] mb-2">
            Batas Ac / Re
          </p>
          <div className="flex flex-wrap gap-2">
            <AcReBadge severity="critical" ac={samplingPlan.critical.ac} re={samplingPlan.critical.re} />
            <AcReBadge severity="major"    ac={samplingPlan.major.ac}    re={samplingPlan.major.re} />
            <AcReBadge severity="minor"    ac={samplingPlan.minor.ac}    re={samplingPlan.minor.re} />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function Stat({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        {label}
      </dt>
      <dd
        className={
          highlight
            ? 'mt-1 text-lg font-bold text-[color:var(--color-primary)]'
            : 'mt-1 text-base font-medium text-[color:var(--color-fg)]'
        }
      >
        {value}
      </dd>
    </div>
  )
}
