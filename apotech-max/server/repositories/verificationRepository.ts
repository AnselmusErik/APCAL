import { db } from '@/server/db/client'
import type {
  CreateVerificationInput,
  ContainerType,
  InspectionGeneralLevel,
  UnitType
} from '@/server/types/verification'

/**
 * Repository for Lampiran Verifikasi Produk Bermasalah.
 * Pure data access — no validation, no business logic.
 */
export const verificationRepository = {
  /**
   * Insert the verification + all findings in a single transaction. Findings
   * are renumbered 1..N based on array order so `position` is always dense.
   */
  async create(input: CreateVerificationInput, createdById: string | null) {
    return db.problemVerification.create({
      data: {
        date: new Date(input.date),
        productCode: input.productCode,
        batchNumber: input.batchNumber,
        location: input.location,
        aqlCriteria: input.aqlCriteria,
        unitType: input.unitType as UnitType,
        generalLevel: input.generalLevel as InspectionGeneralLevel,
        sampleSize: input.sampleSize,
        keterangan: input.keterangan ?? null,
        kesimpulan: input.kesimpulan ?? null,
        createdById,
        findings: {
          create: input.findings.map((f, i) => ({
            position: i + 1,
            label: f.label,
            containerType: f.containerType as ContainerType,
            findingCount: f.findingCount,
            description: f.description ?? null
          }))
        }
      },
      include: { findings: { orderBy: { position: 'asc' } } }
    })
  },

  async findById(id: string) {
    return db.problemVerification.findUnique({
      where: { id },
      include: { findings: { orderBy: { position: 'asc' } } }
    })
  },

  async findRecent(limit = 20) {
    return db.problemVerification.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { findings: { orderBy: { position: 'asc' } } }
    })
  },

  async delete(id: string) {
    // Cascade is configured on the FK; findings are removed automatically.
    return db.problemVerification.delete({ where: { id } })
  }
}
