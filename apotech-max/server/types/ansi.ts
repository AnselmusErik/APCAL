/**
 * ANSI/AQL Calculator Types
 * PT Dankos Farma - QA Line Injeksi
 */

/** Inspection Type — determines which sampling plan table to use (II-A / II-B / II-C) */
export type InspectionLevel = 'normal' | 'tightened' | 'reduced'

/**
 * Inspection Code — determines which column to use in ANSI Table I
 * for Lot Size → Sample Code Letter lookup.
 *
 * S1–S4  : Special Inspection Levels
 * GI–GIII: General Inspection Levels I, II, III
 */
export type InspectionCode = 'S1' | 'S2' | 'S3' | 'S4' | 'GI' | 'GII' | 'GIII'

export type DefectType = 'critical' | 'major' | 'minor'
export type DecisionType = 'accept' | 'reject'

export interface SamplingPlan {
  code: string
  sampleSize: number
  critical: {
    ac: number
    re: number
  }
  major: {
    ac: number
    re: number
  }
  minor: {
    ac: number
    re: number
  }
}

export interface LotCodeMapping {
  minSize: number
  maxSize: number
  code: string
}

export interface DefectCount {
  critical: number
  major: number
  minor: number
}

export interface SamplingRequest {
  productName: string
  batchNumber: string
  lotSize: number
  /** Inspection Type: Normal / Tightened / Reduced — selects sampling plan table */
  inspectionLevel: InspectionLevel
  /** Inspection Code: which column in ANSI Table I to use for Code Letter lookup */
  inspectionCode: InspectionCode
}

export interface SamplingResult extends SamplingRequest {
  letterCode: string
  samplingPlan: SamplingPlan
  inspectionTypeLabel: string
  /** Human-readable label for the inspection code, e.g. "General II" or "Special S-1" */
  inspectionCodeLabel: string
}

export interface EvaluationRequest {
  samplingResult: SamplingResult
  defectCounts: DefectCount
}

export interface EvaluationResult {
  decision: DecisionType
  reason: string
  /**
   * True when, per ANSI/ASQ Z1.4 Table II-C (Reduced), the lot is accepted
   * but a defect count fell in the Ac–Re gap. Next lot MUST be inspected on
   * Normal level. Only ever true when `inspectionLevel === 'reduced'`.
   */
  revertToNormal?: boolean
  summary: {
    productName: string
    batchNumber: string
    lotSize: number
    letterCode: string
    sampleSize: number
    defectCounts: DefectCount
    limits: {
      major: { ac: number; re: number }
      minor: { ac: number; re: number }
    }
  }
}

export interface DefectClassification {
  type: DefectType
  aql: string
  examples: string[]
  colorCode: string
  icon: string
}