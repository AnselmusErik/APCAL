/**
 * Client-side ANSI/AQL Calculator Types
 */

export type TabType = 'sampling' | 'defects' | 'verification' | 'references' | 'guide'

/**
 * Inspection Code — determines which column in ANSI Table I
 * to use for Lot Size → Sample Code Letter lookup.
 */
export type InspectionCode = 'S1' | 'S2' | 'S3' | 'S4' | 'GI' | 'GII' | 'GIII'

export interface FormData {
  productName: string
  batchNumber: string
  lotSize: string
  /** Inspection Type: Normal / Tightened / Reduced */
  inspectionLevel: 'normal' | 'tightened' | 'reduced'
  /** Inspection Code: General I/II/III or Special S-1/S-2/S-3/S-4 */
  inspectionCode: InspectionCode
}

export interface DefectInput {
  critical: number
  major: number
  minor: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface SamplingPlanResponse {
  productName: string
  batchNumber: string
  lotSize: number
  inspectionLevel: 'normal' | 'tightened' | 'reduced'
  inspectionCode: InspectionCode
  inspectionCodeLabel: string
  letterCode: string
  inspectionTypeLabel: string
  samplingPlan: {
    code: string
    sampleSize: number
    critical: { ac: number; re: number }
    major: { ac: number; re: number }
    minor: { ac: number; re: number }
  }
}

export interface EvaluationResponse {
  decision: 'accept' | 'reject'
  reason: string
  /**
   * Set when, on Reduced inspection, a defect count fell in the Ac–Re gap.
   * Lot is accepted but the next inspection must revert to Normal level.
   */
  revertToNormal?: boolean
  summary: {
    productName: string
    batchNumber: string
    lotSize: number
    letterCode: string
    sampleSize: number
    defectCounts: {
      critical: number
      major: number
      minor: number
    }
    limits: {
      major: { ac: number; re: number }
      minor: { ac: number; re: number }
    }
  }
}

export interface ReferenceData {
  lotCodeMappings: Array<{
    minSize: number
    maxSize: number
    code: string
  }>
  samplingPlans: Array<{
    code: string
    sampleSize: number
    critical: { ac: number; re: number }
    major: { ac: number; re: number }
    minor: { ac: number; re: number }
  }>
  tightenedPlans: Array<{
    code: string
    sampleSize: number
    critical: { ac: number; re: number }
    major: { ac: number; re: number }
    minor: { ac: number; re: number }
  }>
  reducedPlans: Array<{
    code: string
    sampleSize: number
    critical: { ac: number; re: number }
    major: { ac: number; re: number }
    minor: { ac: number; re: number }
  }>
  defectClassifications: Array<{
    type: 'critical' | 'major' | 'minor'
    aql: string
    colorCode: string
    icon: string
    examples: string[]
  }>
  switchingRules: {
    normalToTightened: { condition: string; action: string }
    tightenedToNormal: { condition: string; action: string }
    normalToReduced: { condition: string; action: string }
    reducedToNormal: { condition: string; action: string }
  }
}