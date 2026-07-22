/**
 * ANSI Service
 * Business logic for ANSI/AQL sampling and evaluation
 */

import { AnsiRepository, INSPECTION_CODE_LABELS } from '@/server/repositories/ansiRepository'
import {
  type InspectionLevel,
  type InspectionCode,
  type SamplingRequest,
  type SamplingResult,
  type EvaluationRequest,
  type EvaluationResult,
  type DefectCount,
  type SamplingPlan
} from '@/server/types/ansi'
import { ValidationError, NotFoundError } from '@/server/utils/errors'

export class AnsiService {
  /**
   * Calculate sampling plan based on lot size, inspection code, and inspection level.
   *
   * Two independent choices:
   *   1. inspectionCode  (S1–S4, GI–GIII) → selects column in ANSI Table I → Code Letter
   *   2. inspectionLevel (normal / tightened / reduced) → selects sampling plan table (II-A/B/C)
   */
  static async calculateSamplingPlan(request: SamplingRequest): Promise<SamplingResult> {
    // Validate input
    this.validateSamplingRequest(request)

    // Step 1 — Get letter code from lot size using the correct inspection level column
    const letterCode = AnsiRepository.getCodeFromLotSizeAndLevel(
      request.lotSize,
      request.inspectionCode
    )

    // Step 2 — Get sampling plan based on inspection type (Normal / Tightened / Reduced)
    let samplingPlan: SamplingPlan | null
    let inspectionTypeLabel: string

    switch (request.inspectionLevel) {
      case 'normal':
        samplingPlan = AnsiRepository.getNormalPlan(letterCode)
        inspectionTypeLabel = 'Normal'
        break
      case 'tightened':
        samplingPlan = AnsiRepository.getTightenedPlan(letterCode)
        inspectionTypeLabel = 'Diperketat (Tightened)'
        break
      case 'reduced':
        samplingPlan = AnsiRepository.getReducedPlan(letterCode)
        inspectionTypeLabel = 'Diperlonggar (Reduced)'
        break
      default:
        throw new ValidationError(`Invalid inspection level: ${request.inspectionLevel}`)
    }

    if (!samplingPlan) {
      throw new NotFoundError(`Sampling plan not found for code ${letterCode}`)
    }

    const inspectionCodeLabel = INSPECTION_CODE_LABELS[request.inspectionCode]

    return {
      ...request,
      letterCode,
      samplingPlan,
      inspectionTypeLabel,
      inspectionCodeLabel
    }
  }


  /**
   * Evaluate defects and make acceptance decision.
   *
   * Decision rules per ANSI/ASQ Z1.4:
   *   - critical ≥ 1                    → reject (zero-tolerance)
   *   - d ≥ Re                          → reject
   *   - d ≤ Ac                          → accept
   *   - Ac < d < Re (Reduced only,
   *     since Normal/Tightened have
   *     Re = Ac + 1 so the gap is
   *     empty)                          → accept BUT next lot reverts to Normal
   */
  static async evaluateDefects(request: EvaluationRequest): Promise<EvaluationResult> {
    const { samplingResult, defectCounts } = request
    const { samplingPlan } = samplingResult

    // Validate defect counts
    this.validateDefectCounts(defectCounts)

    let decision: EvaluationResult['decision']
    let reason: string
    let revertToNormal = false

    // Critical defects: AQL 0% — any defect rejects
    if (defectCounts.critical >= 1) {
      decision = 'reject'
      reason = `Ditemukan ${defectCounts.critical} cacat kritis → melebihi batas Ac = 0 (wajib 0)`
    }
    // Major: reject when count reaches Re
    else if (defectCounts.major >= samplingPlan.major.re) {
      decision = 'reject'
      reason = `Cacat Mayor = ${defectCounts.major} ≥ batas Re = ${samplingPlan.major.re}`
    }
    // Minor: reject when count reaches Re
    else if (defectCounts.minor >= samplingPlan.minor.re) {
      decision = 'reject'
      reason = `Cacat Minor = ${defectCounts.minor} ≥ batas Re = ${samplingPlan.minor.re}`
    }
    // All defects below Re — accept. On Reduced level, check the Ac–Re gap:
    // if any defect count exceeds Ac (but is below Re), lot accepted but next
    // lot must be inspected on Normal level.
    else {
      decision = 'accept'

      const majorInGap = defectCounts.major > samplingPlan.major.ac
      const minorInGap = defectCounts.minor > samplingPlan.minor.ac

      if (samplingResult.inspectionLevel === 'reduced' && (majorInGap || minorInGap)) {
        revertToNormal = true
        const breaches: string[] = []
        if (majorInGap) breaches.push(`Mayor ${defectCounts.major} > Ac ${samplingPlan.major.ac}`)
        if (minorInGap) breaches.push(`Minor ${defectCounts.minor} > Ac ${samplingPlan.minor.ac}`)
        reason = `Lot diterima (semua cacat < Re), namun terdapat cacat dalam zona Ac–Re (${breaches.join(', ')}). Inspeksi berikutnya WAJIB kembali ke level Normal per Z1.4 Table II-C.`
      } else {
        reason = `Semua cacat dalam batas (Critical: ${defectCounts.critical} = 0, Mayor: ${defectCounts.major} ≤ Ac ${samplingPlan.major.ac}, Minor: ${defectCounts.minor} ≤ Ac ${samplingPlan.minor.ac})`
      }
    }

    return {
      decision,
      reason,
      revertToNormal,
      summary: {
        productName: samplingResult.productName,
        batchNumber: samplingResult.batchNumber,
        lotSize: samplingResult.lotSize,
        letterCode: samplingResult.letterCode,
        sampleSize: samplingResult.samplingPlan.sampleSize,
        defectCounts,
        limits: {
          major: samplingResult.samplingPlan.major,
          minor: samplingResult.samplingPlan.minor
        }
      }
    }
  }

  /**
   * Get reference tables data
   */
  static async getReferenceTables() {
    return {
      lotCodeMappings: AnsiRepository.getAllLotCodeMappings(),
      samplingPlans: AnsiRepository.getAllNormalPlans(),
      tightenedPlans: AnsiRepository.getAllTightenedPlans(),
      reducedPlans: AnsiRepository.getAllReducedPlans(),
      defectClassifications: AnsiRepository.getDefectClassifications()
    }
  }

  /**
   * Get inspection switching rules
   */
  static getInspectionSwitchingRules() {
    return {
      normalToTightened: {
        condition: '2 dari 5 lot berturut-turut ditolak (Reject)',
        action: 'Beralih dari Normal ke Diperketat (Tightened)'
      },
      tightenedToNormal: {
        condition: '5 lot berturut-turut diterima (Accept) pada inspeksi diperketat',
        action: 'Beralih dari Diperketat ke Normal'
      },
      normalToReduced: {
        condition: '10 lot berturut-turut diterima (Accept) pada inspeksi normal',
        action: 'Beralih dari Normal ke Diperlonggar (Reduced)'
      },
      reducedToNormal: {
        condition: '1 lot ditolak (Reject) pada inspeksi diperlonggar',
        action: 'Beralih dari Diperlonggar ke Normal'
      }
    }
  }

  /**
   * Validate sampling request
   */
  private static validateSamplingRequest(request: SamplingRequest): void {
    // productName and batchNumber are now optional - no validation needed

    if (!request.lotSize || request.lotSize < 1) {
      throw new ValidationError('Lot size must be greater than 0')
    }
    if (!['normal', 'tightened', 'reduced'].includes(request.inspectionLevel)) {
      throw new ValidationError('Invalid inspection level (must be: normal, tightened, or reduced)')
    }
    const validInspectionCodes: InspectionCode[] = ['S1', 'S2', 'S3', 'S4', 'GI', 'GII', 'GIII']
    if (!validInspectionCodes.includes(request.inspectionCode)) {
      throw new ValidationError(
        'Invalid inspection code (must be: S1, S2, S3, S4, GI, GII, or GIII)'
      )
    }
  }


  /**
   * Validate defect counts
   */
  private static validateDefectCounts(defectCounts: DefectCount): void {
    if (defectCounts.critical < 0 || defectCounts.major < 0 || defectCounts.minor < 0) {
      throw new ValidationError('Defect counts cannot be negative')
    }
    if (
      !Number.isInteger(defectCounts.critical) ||
      !Number.isInteger(defectCounts.major) ||
      !Number.isInteger(defectCounts.minor)
    ) {
      throw new ValidationError('Defect counts must be integers')
    }
  }
}