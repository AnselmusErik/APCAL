import { verificationRepository } from '@/server/repositories/verificationRepository'
import { ValidationError, NotFoundError } from '@/server/utils/errors'
import {
  CONTAINER_TYPES,
  GENERAL_LEVELS,
  UNIT_TYPES,
  type ContainerType,
  type CreateVerificationInput,
  type InspectionGeneralLevel,
  type UnitType,
  type VerificationDTO,
  type VerificationFindingDTO
} from '@/server/types/verification'

type PrismaVerification = Awaited<ReturnType<typeof verificationRepository.findById>>

export class VerificationService {
  /**
   * Validate and persist a verification with findings.
   */
  static async create(
    input: CreateVerificationInput,
    createdById: string | null
  ): Promise<VerificationDTO> {
    this.validate(input)
    const record = await verificationRepository.create(input, createdById)
    return this.toDTO(record)
  }

  static async getById(id: string): Promise<VerificationDTO> {
    const record = await verificationRepository.findById(id)
    if (!record) throw new NotFoundError(`Verifikasi dengan id "${id}" tidak ditemukan`)
    return this.toDTO(record)
  }

  static async listRecent(limit = 20): Promise<VerificationDTO[]> {
    const records = await verificationRepository.findRecent(limit)
    return records.map(r => this.toDTO(r))
  }

  /* ------------------------------------------------------------------ */
  /*  Internals                                                          */
  /* ------------------------------------------------------------------ */

  private static validate(input: CreateVerificationInput): void {
    if (!input.date || Number.isNaN(Date.parse(input.date))) {
      throw new ValidationError('Tanggal tidak valid')
    }
    if (!input.productCode?.trim()) throw new ValidationError('Kode produk wajib diisi')
    if (!input.batchNumber?.trim()) throw new ValidationError('Nomor batch wajib diisi')
    if (!input.location?.trim()) throw new ValidationError('Lokasi wajib diisi')
    if (!input.aqlCriteria?.trim()) throw new ValidationError('Kriteria Penerimaan (AQL) wajib diisi')
    if (!UNIT_TYPES.includes(input.unitType as UnitType)) {
      throw new ValidationError(`Jenis unit produk tidak valid: ${input.unitType}`)
    }
    if (!GENERAL_LEVELS.includes(input.generalLevel as InspectionGeneralLevel)) {
      throw new ValidationError(`Tingkat inspeksi tidak valid: ${input.generalLevel}`)
    }
    if (!Number.isInteger(input.sampleSize) || input.sampleSize <= 0) {
      throw new ValidationError('Jumlah unit sampel harus bilangan bulat > 0')
    }
    if (!Array.isArray(input.findings) || input.findings.length === 0) {
      throw new ValidationError('Tambahkan minimal 1 baris temuan')
    }
    input.findings.forEach((f, i) => {
      const row = i + 1
      if (!f.label?.trim()) {
        throw new ValidationError(`Baris ${row}: label wadah wajib diisi`)
      }
      if (!CONTAINER_TYPES.includes(f.containerType as ContainerType)) {
        throw new ValidationError(`Baris ${row}: jenis wadah tidak valid`)
      }
      if (!Number.isInteger(f.findingCount) || f.findingCount < 0) {
        throw new ValidationError(`Baris ${row}: jumlah temuan harus bilangan bulat ≥ 0`)
      }
    })
  }

  private static toDTO(record: NonNullable<PrismaVerification>): VerificationDTO {
    const findings: VerificationFindingDTO[] = record.findings.map(f => ({
      id: f.id,
      position: f.position,
      label: f.label,
      containerType: f.containerType as ContainerType,
      findingCount: f.findingCount,
      description: f.description ?? null
    }))

    const totalFindings = findings.reduce((s, f) => s + f.findingCount, 0)
    // Percentage = totalFindings / sampleSize × 100. `sampleSize` is validated
    // > 0 for new records; guard for older / malformed data.
    const findingsPercentage =
      record.sampleSize > 0 ? +((totalFindings / record.sampleSize) * 100).toFixed(2) : 0

    return {
      id: record.id,
      date: record.date.toISOString().slice(0, 10),
      productCode: record.productCode,
      batchNumber: record.batchNumber,
      location: record.location,
      aqlCriteria: record.aqlCriteria,
      unitType: record.unitType as UnitType,
      generalLevel: record.generalLevel as InspectionGeneralLevel,
      sampleSize: record.sampleSize,
      keterangan: record.keterangan ?? null,
      kesimpulan: record.kesimpulan ?? null,
      findings,
      createdById: record.createdById ?? null,
      createdAt: record.createdAt.toISOString(),
      totalFindings,
      findingsPercentage
    }
  }
}
