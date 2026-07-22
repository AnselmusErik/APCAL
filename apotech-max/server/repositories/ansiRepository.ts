/**
 * ANSI Repository
 * Static data repository for ANSI/ASQ Z1.4 single-sampling plans.
 *
 * AQL columns used (per PT Dankos Farma SOP, sterile injection line):
 *   - Critical: 0%   → Ac = 0 across all code letters (zero-tolerance)
 *   - Major:   2.5%  → Z1.4 Tables II-A (Normal), II-B (Tightened), II-C (Reduced)
 *   - Minor:   4.0%  → Z1.4 Tables II-A (Normal), II-B (Tightened), II-C (Reduced)
 *
 * Sample sizes:
 *   - Normal & Tightened share the same n column (per code letter)
 *   - Reduced uses a SEPARATE, smaller n column (Z1.4 II-C)
 *
 * Arrow resolution policy (all 3 tables):
 *   - ↓ at small code letters → values clamped to {ac:0, re:1} (stricter than
 *     strict-spec; defensible for pharma where small lots default to 100%
 *     inspection / zero-defect acceptance)
 *   - ↑ at large code letters → values clamped to the largest tabulated
 *     Ac/Re of that column (also stricter than strict-spec)
 *
 * Sources: ANSI/ASQ Z1.4-2003 (R2018) Tables I, II-A, II-B, II-C
 */

import type { SamplingPlan, LotCodeMapping, DefectClassification, DefectType, InspectionCode } from '@/server/types/ansi'

// ─── ANSI Table I — Lot Size Ranges ────────────────────────────────────────

interface LotSizeRow {
  minSize: number
  maxSize: number
  /** Code letter per inspection level */
  S1: string
  S2: string
  S3: string
  S4: string
  GI: string
  GII: string
  GIII: string
}

/**
 * ANSI/ASQ Z1.4 Table I — Sample Size Code Letters
 * All 7 inspection levels for 16 lot-size ranges.
 */
const ANSI_TABLE_I: LotSizeRow[] = [
  { minSize: 2,       maxSize: 8,       S1: 'A', S2: 'A', S3: 'A', S4: 'A', GI: 'A', GII: 'A', GIII: 'B' },
  { minSize: 9,       maxSize: 15,      S1: 'A', S2: 'A', S3: 'A', S4: 'A', GI: 'A', GII: 'B', GIII: 'C' },
  { minSize: 16,      maxSize: 25,      S1: 'A', S2: 'A', S3: 'B', S4: 'B', GI: 'B', GII: 'C', GIII: 'D' },
  { minSize: 26,      maxSize: 50,      S1: 'A', S2: 'B', S3: 'B', S4: 'C', GI: 'C', GII: 'D', GIII: 'E' },
  { minSize: 51,      maxSize: 90,      S1: 'B', S2: 'B', S3: 'C', S4: 'C', GI: 'C', GII: 'E', GIII: 'F' },
  { minSize: 91,      maxSize: 150,     S1: 'B', S2: 'B', S3: 'C', S4: 'D', GI: 'D', GII: 'F', GIII: 'G' },
  { minSize: 151,     maxSize: 280,     S1: 'B', S2: 'C', S3: 'D', S4: 'E', GI: 'E', GII: 'G', GIII: 'H' },
  { minSize: 281,     maxSize: 500,     S1: 'B', S2: 'C', S3: 'D', S4: 'E', GI: 'F', GII: 'H', GIII: 'J' },
  { minSize: 501,     maxSize: 1200,    S1: 'C', S2: 'C', S3: 'E', S4: 'F', GI: 'G', GII: 'J', GIII: 'K' },
  { minSize: 1201,    maxSize: 3200,    S1: 'C', S2: 'D', S3: 'E', S4: 'G', GI: 'H', GII: 'K', GIII: 'L' },
  { minSize: 3201,    maxSize: 10000,   S1: 'C', S2: 'D', S3: 'F', S4: 'G', GI: 'J', GII: 'L', GIII: 'M' },
  { minSize: 10001,   maxSize: 35000,   S1: 'C', S2: 'D', S3: 'F', S4: 'H', GI: 'K', GII: 'M', GIII: 'N' },
  { minSize: 35001,   maxSize: 150000,  S1: 'D', S2: 'E', S3: 'G', S4: 'J', GI: 'L', GII: 'N', GIII: 'P' },
  { minSize: 150001,  maxSize: 500000,  S1: 'D', S2: 'E', S3: 'G', S4: 'J', GI: 'M', GII: 'P', GIII: 'Q' },
  { minSize: 500001,  maxSize: 2000000, S1: 'D', S2: 'E', S3: 'H', S4: 'K', GI: 'N', GII: 'Q', GIII: 'R' },
  { minSize: 2000001, maxSize: 9999999, S1: 'D', S2: 'E', S3: 'H', S4: 'K', GI: 'P', GII: 'R', GIII: 'R' },
]

/** Human-readable labels for each inspection code */
export const INSPECTION_CODE_LABELS: Record<InspectionCode, string> = {
  S1: 'Special S-1',
  S2: 'Special S-2',
  S3: 'Special S-3',
  S4: 'Special S-4',
  GI: 'General I',
  GII: 'General II',
  GIII: 'General III',
}

export class AnsiRepository {
  /**
   * Normal inspection — Z1.4 Table II-A, Single Sampling
   * AQL: Critical 0%, Major 2.5%, Minor 4.0%
   */
  private static readonly normalPlans: Record<string, SamplingPlan> = {
    A: { code: 'A', sampleSize: 2,    critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    B: { code: 'B', sampleSize: 3,    critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    C: { code: 'C', sampleSize: 5,    critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    D: { code: 'D', sampleSize: 8,    critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    E: { code: 'E', sampleSize: 13,   critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 1, re: 2 } },
    F: { code: 'F', sampleSize: 20,   critical: { ac: 0, re: 1 }, major: { ac: 1, re: 2 },   minor: { ac: 2, re: 3 } },
    G: { code: 'G', sampleSize: 32,   critical: { ac: 0, re: 1 }, major: { ac: 2, re: 3 },   minor: { ac: 3, re: 4 } },
    H: { code: 'H', sampleSize: 50,   critical: { ac: 0, re: 1 }, major: { ac: 3, re: 4 },   minor: { ac: 5, re: 6 } },
    J: { code: 'J', sampleSize: 80,   critical: { ac: 0, re: 1 }, major: { ac: 5, re: 6 },   minor: { ac: 7, re: 8 } },
    K: { code: 'K', sampleSize: 125,  critical: { ac: 0, re: 1 }, major: { ac: 7, re: 8 },   minor: { ac: 10, re: 11 } },
    L: { code: 'L', sampleSize: 200,  critical: { ac: 0, re: 1 }, major: { ac: 10, re: 11 }, minor: { ac: 14, re: 15 } },
    M: { code: 'M', sampleSize: 315,  critical: { ac: 0, re: 1 }, major: { ac: 14, re: 15 }, minor: { ac: 21, re: 22 } },
    N: { code: 'N', sampleSize: 500,  critical: { ac: 0, re: 1 }, major: { ac: 21, re: 22 }, minor: { ac: 21, re: 22 } },
    P: { code: 'P', sampleSize: 800,  critical: { ac: 0, re: 1 }, major: { ac: 21, re: 22 }, minor: { ac: 21, re: 22 } },
    Q: { code: 'Q', sampleSize: 1250, critical: { ac: 0, re: 1 }, major: { ac: 21, re: 22 }, minor: { ac: 21, re: 22 } },
    R: { code: 'R', sampleSize: 2000, critical: { ac: 0, re: 1 }, major: { ac: 21, re: 22 }, minor: { ac: 21, re: 22 } }
  }

  /**
   * Tightened inspection — Z1.4 Table II-B, Single Sampling
   * Same n column as Normal A–R; plus an EXTRA code letter S (n=3150) that
   * exists only in Tightened per Z1.4 II-B (used as the arrow-down destination
   * from R at very tight AQLs).
   */
  private static readonly tightenedPlans: Record<string, SamplingPlan> = {
    A: { code: 'A', sampleSize: 2,    critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    B: { code: 'B', sampleSize: 3,    critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    C: { code: 'C', sampleSize: 5,    critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    D: { code: 'D', sampleSize: 8,    critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    E: { code: 'E', sampleSize: 13,   critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    F: { code: 'F', sampleSize: 20,   critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 1, re: 2 } },
    G: { code: 'G', sampleSize: 32,   critical: { ac: 0, re: 1 }, major: { ac: 1, re: 2 },   minor: { ac: 2, re: 3 } },
    H: { code: 'H', sampleSize: 50,   critical: { ac: 0, re: 1 }, major: { ac: 2, re: 3 },   minor: { ac: 3, re: 4 } },
    J: { code: 'J', sampleSize: 80,   critical: { ac: 0, re: 1 }, major: { ac: 3, re: 4 },   minor: { ac: 5, re: 6 } },
    K: { code: 'K', sampleSize: 125,  critical: { ac: 0, re: 1 }, major: { ac: 5, re: 6 },   minor: { ac: 8, re: 9 } },
    L: { code: 'L', sampleSize: 200,  critical: { ac: 0, re: 1 }, major: { ac: 8, re: 9 },   minor: { ac: 12, re: 13 } },
    M: { code: 'M', sampleSize: 315,  critical: { ac: 0, re: 1 }, major: { ac: 12, re: 13 }, minor: { ac: 18, re: 19 } },
    N: { code: 'N', sampleSize: 500,  critical: { ac: 0, re: 1 }, major: { ac: 18, re: 19 }, minor: { ac: 18, re: 19 } },
    P: { code: 'P', sampleSize: 800,  critical: { ac: 0, re: 1 }, major: { ac: 18, re: 19 }, minor: { ac: 18, re: 19 } },
    Q: { code: 'Q', sampleSize: 1250, critical: { ac: 0, re: 1 }, major: { ac: 18, re: 19 }, minor: { ac: 18, re: 19 } },
    R: { code: 'R', sampleSize: 2000, critical: { ac: 0, re: 1 }, major: { ac: 18, re: 19 }, minor: { ac: 18, re: 19 } },
    S: { code: 'S', sampleSize: 3150, critical: { ac: 0, re: 1 }, major: { ac: 18, re: 19 }, minor: { ac: 18, re: 19 } }
  }

  /**
   * Reduced inspection — Z1.4 Table II-C, Single Sampling
   *
   * IMPORTANT differences from Normal/Tightened:
   *   1. Smaller sample size per code letter (own n column)
   *   2. GAP between Ac and Re (Re > Ac+1). When defect count d satisfies
   *      Ac < d < Re, the lot IS accepted but the production line must
   *      revert to Normal inspection on the next lot (the `revertToNormal`
   *      flag is set by AnsiService.evaluateDefects).
   */
  private static readonly reducedPlans: Record<string, SamplingPlan> = {
    A: { code: 'A', sampleSize: 2,   critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    B: { code: 'B', sampleSize: 2,   critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    C: { code: 'C', sampleSize: 2,   critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    D: { code: 'D', sampleSize: 3,   critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 1 } },
    E: { code: 'E', sampleSize: 5,   critical: { ac: 0, re: 1 }, major: { ac: 0, re: 1 },   minor: { ac: 0, re: 2 } },
    F: { code: 'F', sampleSize: 8,   critical: { ac: 0, re: 1 }, major: { ac: 0, re: 2 },   minor: { ac: 1, re: 3 } },
    G: { code: 'G', sampleSize: 13,  critical: { ac: 0, re: 1 }, major: { ac: 1, re: 3 },   minor: { ac: 1, re: 4 } },
    H: { code: 'H', sampleSize: 20,  critical: { ac: 0, re: 1 }, major: { ac: 1, re: 4 },   minor: { ac: 2, re: 5 } },
    J: { code: 'J', sampleSize: 32,  critical: { ac: 0, re: 1 }, major: { ac: 2, re: 5 },   minor: { ac: 3, re: 6 } },
    K: { code: 'K', sampleSize: 50,  critical: { ac: 0, re: 1 }, major: { ac: 3, re: 6 },   minor: { ac: 5, re: 8 } },
    L: { code: 'L', sampleSize: 80,  critical: { ac: 0, re: 1 }, major: { ac: 5, re: 8 },   minor: { ac: 7, re: 10 } },
    M: { code: 'M', sampleSize: 125, critical: { ac: 0, re: 1 }, major: { ac: 7, re: 10 },  minor: { ac: 10, re: 13 } },
    N: { code: 'N', sampleSize: 200, critical: { ac: 0, re: 1 }, major: { ac: 10, re: 13 }, minor: { ac: 10, re: 13 } },
    P: { code: 'P', sampleSize: 315, critical: { ac: 0, re: 1 }, major: { ac: 10, re: 13 }, minor: { ac: 10, re: 13 } },
    Q: { code: 'Q', sampleSize: 500, critical: { ac: 0, re: 1 }, major: { ac: 10, re: 13 }, minor: { ac: 10, re: 13 } },
    R: { code: 'R', sampleSize: 800, critical: { ac: 0, re: 1 }, major: { ac: 10, re: 13 }, minor: { ac: 10, re: 13 } }
  }

  /**
   * Lot size to code mapping — kept for backward-compat (General II only).
   * Use getCodeFromLotSizeAndLevel() for full multi-level support.
   */
  private static readonly lotCodeMappings: LotCodeMapping[] = ANSI_TABLE_I.map(r => ({
    minSize: r.minSize,
    maxSize: r.maxSize,
    code: r.GII
  }))

  /**
   * Defect classifications for sterile injection products
   */
  private static readonly defectClassifications: DefectClassification[] = [
    {
      type: 'critical',
      aql: '0%',
      colorCode: '#d9534f',
      icon: '🔴',
      examples: [
        'Partikel asing (logam, kaca)',
        'Kebocoran vial/ampul',
        'Kontaminasi mikroba',
        'Label salah produk / kekuatan sediaan',
        'Kerusakan segel sterilitas',
        'Warna sediaan tidak sesuai'
      ]
    },
    {
      type: 'major',
      aql: '2.5%',
      colorCode: '#f0ad4e',
      icon: '🟠',
      examples: [
        'Kerusakan fisik ringan tapi fungsi terganggu',
        'Printing blur / batch number tidak jelas',
        'Kesalahan minor pada leaflet',
        'Vial retak (tanpa bocor)',
        'Segel aluminium longgar tapi tidak lepas'
      ]
    },
    {
      type: 'minor',
      aql: '4%',
      colorCode: '#5bc0de',
      icon: '🟢',
      examples: [
        'Goresan luar tidak mempengaruhi sterilitas',
        'Kemasan luar (kardus) penyok',
        'Perbedaan warna segel yang tidak kritis',
        'Bekas lem berlebih pada label',
        'Tulisan pada etiket sedikit buram namun masih terbaca'
      ]
    }
  ]

  // ─── Public Methods ─────────────────────────────────────────────────────────

  /**
   * Get sample code letter from lot size AND inspection code.
   * Uses ANSI/ASQ Z1.4 Table I — the correct column per inspection level.
   */
  static getCodeFromLotSizeAndLevel(lotSize: number, inspectionCode: InspectionCode): string {
    const row = ANSI_TABLE_I.find(r => lotSize >= r.minSize && lotSize <= r.maxSize)
    if (!row) return 'R' // Clamp to max for very large lots
    return row[inspectionCode]
  }

  /**
   * Get letter code from lot size — General Inspection Level II (backward compat).
   * @deprecated Use getCodeFromLotSizeAndLevel() for full level support.
   */
  static getCodeFromLotSize(lotSize: number): string {
    return this.getCodeFromLotSizeAndLevel(lotSize, 'GII')
  }

  /**
   * Get normal sampling plan by code (Z1.4 Table II-A)
   */
  static getNormalPlan(code: string): SamplingPlan | null {
    return this.normalPlans[code] ?? null
  }

  /**
   * Get tightened sampling plan by code (Z1.4 Table II-B)
   */
  static getTightenedPlan(code: string): SamplingPlan | null {
    return this.tightenedPlans[code] ?? null
  }

  /**
   * Get reduced sampling plan by code (Z1.4 Table II-C).
   * NOTE: Uses smaller sample size and has Ac–Re gap; the service layer
   * is responsible for setting `revertToNormal` when a defect count falls
   * in the gap.
   */
  static getReducedPlan(code: string): SamplingPlan | null {
    return this.reducedPlans[code] ?? null
  }

  /**
   * Get all lot code mappings (General II — backward compat)
   */
  static getAllLotCodeMappings(): LotCodeMapping[] {
    return this.lotCodeMappings
  }

  /**
   * Get full ANSI Table I with all inspection levels
   */
  static getFullLotSizeTable(): LotSizeRow[] {
    return ANSI_TABLE_I
  }

  /**
   * Get all normal sampling plans
   */
  static getAllNormalPlans(): SamplingPlan[] {
    return Object.values(this.normalPlans)
  }

  /**
   * Get all tightened sampling plans
   */
  static getAllTightenedPlans(): SamplingPlan[] {
    return Object.values(this.tightenedPlans)
  }

  /**
   * Get all reduced sampling plans
   */
  static getAllReducedPlans(): SamplingPlan[] {
    return Object.values(this.reducedPlans)
  }

  /**
   * Get defect classifications
   */
  static getDefectClassifications(): DefectClassification[] {
    return this.defectClassifications
  }

  /**
   * Get defect classification by type
   */
  static getDefectClassificationByType(type: DefectType): DefectClassification | null {
    return this.defectClassifications.find(d => d.type === type) ?? null
  }
}
