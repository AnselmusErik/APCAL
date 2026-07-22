/**
 * Types for "Lampiran Verifikasi Produk Bermasalah" — QC inspection sheet.
 *
 * Enums mirror prisma/models/verification.prisma. They're duplicated as
 * literal unions instead of `import { UnitType } from '@prisma/client'` so
 * the client bundle never pulls Prisma in.
 */

export const UNIT_TYPES = [
  'TABLET',
  'KAPLET',
  'KAPSUL',
  'SOFT_KAPSUL',
  'VIAL',
  'AMPUL',
  'BLISTER',
  'STRIP',
  'BOTOL',
  'KAFT'
] as const
export type UnitType = (typeof UNIT_TYPES)[number]

export const GENERAL_LEVELS = ['I', 'II', 'III'] as const
export type InspectionGeneralLevel = (typeof GENERAL_LEVELS)[number]

export const CONTAINER_TYPES = ['WADAH', 'KANTONG', 'BAK', 'MB'] as const
export type ContainerType = (typeof CONTAINER_TYPES)[number]

export interface FindingInput {
  label: string
  containerType: ContainerType
  findingCount: number
  description?: string | null
}

export interface CreateVerificationInput {
  date: string // ISO date string (YYYY-MM-DD)
  productCode: string
  batchNumber: string
  location: string
  aqlCriteria: string
  unitType: UnitType
  generalLevel: InspectionGeneralLevel
  sampleSize: number
  /** Free-form remarks filled in after the findings are entered. */
  keterangan?: string | null
  /** Final conclusion (accept / reject / next steps), filled after findings. */
  kesimpulan?: string | null
  findings: FindingInput[]
}

export interface VerificationFindingDTO {
  id: string
  position: number
  label: string
  containerType: ContainerType
  findingCount: number
  description: string | null
}

export interface VerificationDTO {
  id: string
  date: string
  productCode: string
  batchNumber: string
  location: string
  aqlCriteria: string
  unitType: UnitType
  generalLevel: InspectionGeneralLevel
  sampleSize: number
  keterangan: string | null
  kesimpulan: string | null
  findings: VerificationFindingDTO[]
  createdById: string | null
  createdAt: string
  /** Sum of findingCount across all findings. */
  totalFindings: number
  /** totalFindings / sampleSize × 100, rounded to 2 decimals. */
  findingsPercentage: number
}

/**
 * Human-readable labels for enum display.
 */
export const UNIT_TYPE_LABEL: Record<UnitType, string> = {
  TABLET: 'Tablet',
  KAPLET: 'Kaplet',
  KAPSUL: 'Kapsul',
  SOFT_KAPSUL: 'Soft Kapsul',
  VIAL: 'Vial',
  AMPUL: 'Ampul',
  BLISTER: 'Blister',
  STRIP: 'Strip',
  BOTOL: 'Botol',
  KAFT: 'Kaft'
}

export const CONTAINER_TYPE_LABEL: Record<ContainerType, string> = {
  WADAH: 'Wadah',
  KANTONG: 'Kantong',
  BAK: 'Bak',
  MB: 'MB'
}
