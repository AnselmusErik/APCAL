/**
 * Defects Input Tab — step 2 of the ANSI flow.
 *
 * User enters actual defect counts found in the sample; the server compares
 * against Ac/Re limits and returns an accept/reject decision, plus the
 * `revertToNormal` signal when (on Reduced) a count falls in the Ac–Re gap.
 */

'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, ClipboardCheck, XCircle, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { printPdfReport } from '@/lib/pdf-report'

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormField,
  Input
} from '@/components/ui'
import { AcReBadge } from '@/components/patterns'

import type {
  ApiResponse,
  DefectInput,
  EvaluationResponse,
  SamplingPlanResponse
} from '@/types/ansi'

interface DefectsTabProps {
  samplingResult: SamplingPlanResponse | null
}

export function DefectsTab({ samplingResult }: DefectsTabProps) {
  const [defects, setDefects] = useState<DefectInput>({ critical: 0, major: 0, minor: 0 })
  const [loading, setLoading] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse | null>(null)

  useEffect(() => {
    if (samplingResult?.initialDefects) {
      setDefects(samplingResult.initialDefects)
    } else {
      setDefects({ critical: 0, major: 0, minor: 0 })
    }
    setEvaluationResult(null)
  }, [samplingResult])

  async function handleEvaluate() {
    if (!samplingResult) {
      toast.error('Silakan hitung Sampling Plan terlebih dahulu di tab sebelumnya')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ansi/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samplingResult, defectCounts: defects })
      })
      const data: ApiResponse<EvaluationResponse> = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to evaluate defects')
      }

      setEvaluationResult(data.data)

      // Update riwayat di database jika historyId ada
      if (samplingResult.historyId) {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/history/sampling/${samplingResult.historyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: data.data.decision,
            decisionReason: data.data.reason,
            defectCounts: defects,
          }),
        }).catch(() => {
          // ignore error background sync
        })
      }

      toast.success('Evaluasi berhasil')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  function handleDefectChange(type: keyof DefectInput, value: string) {
    const numValue = parseInt(value, 10) || 0
    setDefects(prev => ({ ...prev, [type]: Math.max(0, numValue) }))
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-[color:var(--color-primary)]" aria-hidden />
            Input Jumlah Cacat Aktual
          </CardTitle>
        </CardHeader>

        <CardBody>
          {!samplingResult ? (
            <Alert variant="warning" title="Sampling plan belum dihitung">
              Silakan hitung sampling plan terlebih dahulu di tab <strong>Sampling Plan</strong>.
            </Alert>
          ) : (
            <div className="space-y-6">
              <ActiveSamplingSummary samplingResult={samplingResult} />

              <Card variant="flat" className="bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <p className="text-sm font-bold text-[color:var(--color-fg)]">
                    Masukkan Jumlah Cacat Ditemukan dari <span className="text-[color:var(--color-primary)] font-black text-base">{samplingResult.samplingPlan.sampleSize}</span> sampel:
                  </p>
                  <span className="text-xs text-[color:var(--color-fg-muted)]">Gunakan tombol + / - atau ketik langsung</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Kritis Card */}
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                        🔴 Cacat Kritis
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                        AQL 0%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDefectChange('critical', String(Math.max(0, defects.critical - 1)))}
                        className="w-10 h-10 rounded-lg bg-white border border-red-200 text-red-700 font-bold text-lg hover:bg-red-100 active:scale-95 transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        -
                      </button>
                      <Input
                        type="number"
                        min={0}
                        value={defects.critical}
                        onChange={e => handleDefectChange('critical', e.target.value)}
                        className="text-center font-black text-lg h-10 bg-white border-red-200 text-red-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleDefectChange('critical', String(defects.critical + 1))}
                        className="w-10 h-10 rounded-lg bg-white border border-red-200 text-red-700 font-bold text-lg hover:bg-red-100 active:scale-95 transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Mayor Card */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        🟠 Cacat Mayor
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        AQL 2.5%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDefectChange('major', String(Math.max(0, defects.major - 1)))}
                        className="w-10 h-10 rounded-lg bg-white border border-amber-200 text-amber-800 font-bold text-lg hover:bg-amber-100 active:scale-95 transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        -
                      </button>
                      <Input
                        type="number"
                        min={0}
                        value={defects.major}
                        onChange={e => handleDefectChange('major', e.target.value)}
                        className="text-center font-black text-lg h-10 bg-white border-amber-200 text-amber-950"
                      />
                      <button
                        type="button"
                        onClick={() => handleDefectChange('major', String(defects.major + 1))}
                        className="w-10 h-10 rounded-lg bg-white border border-amber-200 text-amber-800 font-bold text-lg hover:bg-amber-100 active:scale-95 transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Minor Card */}
                  <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                        🟢 Cacat Minor
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                        AQL 4.0%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDefectChange('minor', String(Math.max(0, defects.minor - 1)))}
                        className="w-10 h-10 rounded-lg bg-white border border-teal-200 text-teal-800 font-bold text-lg hover:bg-teal-100 active:scale-95 transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        -
                      </button>
                      <Input
                        type="number"
                        min={0}
                        value={defects.minor}
                        onChange={e => handleDefectChange('minor', e.target.value)}
                        className="text-center font-black text-lg h-10 bg-white border-teal-200 text-teal-950"
                      />
                      <button
                        type="button"
                        onClick={() => handleDefectChange('minor', String(defects.minor + 1))}
                        className="w-10 h-10 rounded-lg bg-white border border-teal-200 text-teal-800 font-bold text-lg hover:bg-teal-100 active:scale-95 transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleEvaluate} loading={loading} size="lg">
                    {loading ? 'Mengevaluasi...' : 'Evaluasi & Putuskan QA'}
                  </Button>
                </div>
              </Card>

              {evaluationResult && <DecisionResult result={evaluationResult} />}
            </div>
          )}
        </CardBody>
      </Card>

      <Alert variant="info">
        Cacat <strong>Kritis</strong> (AQL 0%) langsung TOLAK jika ≥ 1. Cacat{' '}
        <strong>Mayor</strong> dan <strong>Minor</strong> dibandingkan dengan batas Ac/Re
        dari sampling plan.
      </Alert>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function ActiveSamplingSummary({ samplingResult }: { samplingResult: SamplingPlanResponse }) {
  const { samplingPlan } = samplingResult
  return (
    <Card variant="flat" className="bg-[color:var(--color-primary-tint)] border-l-4 border-l-[color:var(--color-primary)]">
      <div className="text-sm space-y-2">
        <p className="font-semibold text-[color:var(--color-primary)]">📌 Sampling Aktif</p>
        <p className="text-[color:var(--color-fg)]">
          {samplingResult.productName && <>{samplingResult.productName} · </>}
          {samplingResult.batchNumber && <>Batch {samplingResult.batchNumber} · </>}
          Lot {samplingResult.lotSize.toLocaleString('id-ID')} →{' '}
          <strong>Kode {samplingResult.letterCode}</strong> ({samplingResult.inspectionTypeLabel})
          → <strong>n = {samplingPlan.sampleSize}</strong>
        </p>
        {/* Inspection Code badge */}
        {samplingResult.inspectionCode && (
          <p className="flex items-center gap-1.5 text-[color:var(--color-fg-muted)]">
            <span className="font-semibold text-[color:var(--color-fg)]">Inspection Code:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[color:var(--color-bg-surface)] border border-[color:var(--color-border)]">
              {samplingResult.inspectionCode}
              {samplingResult.inspectionCodeLabel && ` — ${samplingResult.inspectionCodeLabel}`}
            </span>
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <AcReBadge severity="major" ac={samplingPlan.major.ac} re={samplingPlan.major.re} />
          <AcReBadge severity="minor" ac={samplingPlan.minor.ac} re={samplingPlan.minor.re} />
        </div>
      </div>
    </Card>
  )
}


function DecisionResult({ result }: { result: EvaluationResponse }) {
  const accepted = result.decision === 'accept'
  return (
    <Card
      variant="elevated"
      padding="none"
      className={
        accepted
          ? 'border-l-4 border-l-[color:var(--color-success)]'
          : 'border-l-4 border-l-[color:var(--color-danger)]'
      }
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {accepted ? (
            <CheckCircle2 className="h-7 w-7 text-[color:var(--color-success)]" aria-hidden />
          ) : (
            <XCircle className="h-7 w-7 text-[color:var(--color-danger)]" aria-hidden />
          )}
          <CardTitle
            className={
              accepted ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-danger)]'
            }
          >
            Keputusan Akhir: {accepted ? 'TERIMA (Accept)' : 'TOLAK (Reject)'}
          </CardTitle>
          <Badge variant={accepted ? 'solidSuccess' : 'solidDanger'} size="lg">
            {accepted ? 'ACCEPT' : 'REJECT'}
          </Badge>
        </div>

        {result.summary && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              printPdfReport({
                id: 'NEW',
                productName: result.summary.productName,
                batchNumber: result.summary.batchNumber,
                lotSize: result.summary.lotSize,
                letterCode: result.summary.letterCode,
                sampleSize: result.summary.sampleSize,
                inspectionLevel: 'normal',
                inspectionCode: 'GII',
                inspectionCodeLabel: 'General II',
                inspectionTypeLabel: 'Normal',
                critical: { ac: 0, re: 1 },
                major: result.summary.limits.major,
                minor: result.summary.limits.minor,
                decision: result.decision,
                decisionReason: result.reason,
                defectCounts: result.summary.defectCounts,
                createdAt: new Date().toISOString(),
              })
            }
            iconLeft={<Printer className="h-4 w-4 text-[color:var(--color-primary)]" />}
          >
            Cetak PDF Record
          </Button>
        )}
      </CardHeader>

      <CardBody className="space-y-4">
        <p className="text-sm">
          <span className="font-semibold">Alasan:</span> {result.reason}
        </p>

        {result.revertToNormal && (
          <Alert variant="accent" title="Switch back ke Normal">
            Cacat berada di zona Ac–Re — lot tetap diterima per Z1.4 Tabel II-C, namun
            inspeksi <strong>berikutnya wajib pakai level Normal</strong>.
          </Alert>
        )}

        <div className="text-sm">
          <p className="font-semibold mb-2">🔍 Ringkasan</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[color:var(--color-fg-muted)]">
            <SummaryItem label="Lot" value={`${result.summary.lotSize.toLocaleString('id-ID')} → ${result.summary.letterCode}`} />
            <SummaryItem label="Sampel" value={`${result.summary.sampleSize} unit`} />
            <SummaryItem
              label="Cacat ditemukan"
              value={`K=${result.summary.defectCounts.critical}, M=${result.summary.defectCounts.major}, m=${result.summary.defectCounts.minor}`}
            />
            <SummaryItem
              label="Batas Ac/Re"
              value={`M ${result.summary.limits.major.ac}/${result.summary.limits.major.re} · m ${result.summary.limits.minor.ac}/${result.summary.limits.minor.re}`}
            />
          </dl>
        </div>
      </CardBody>
    </Card>
  )
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs uppercase tracking-wider">{label}</dt>
      <dd className="text-[color:var(--color-fg)] font-medium tabular-nums">{value}</dd>
    </>
  )
}
