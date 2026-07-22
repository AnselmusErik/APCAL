/**
 * Client-side types for Lampiran Verifikasi Produk Bermasalah.
 * Mirror of `server/types/verification.ts` minus internal helpers.
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

export interface VerificationFormData {
  date: string
  productCode: string
  batchNumber: string
  location: string
  aqlCriteria: string
  unitType: UnitType
  generalLevel: InspectionGeneralLevel
  sampleSize: string
  /** Filled in AFTER findings — supporting remarks. */
  keterangan: string
  /** Filled in AFTER findings — final conclusion. */
  kesimpulan: string
}

export interface FindingRow {
  /** Local row id (uuid) — not persisted; only for React keys + remove */
  rowId: string
  label: string
  containerType: ContainerType
  findingCount: string
  description: string
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
  totalFindings: number
  findingsPercentage: number
  createdAt: string
  createdById: string | null
}
