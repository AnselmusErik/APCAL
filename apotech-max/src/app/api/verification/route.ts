/**
 * API: /api/verification
 *
 * POST → create a new Lampiran Verifikasi Produk Bermasalah
 * GET  → list recent verifications (latest 20)
 *
 * Both routes require authentication via NextAuth (withAuth wrapper).
 */

import { NextRequest, NextResponse } from 'next/server'
// @ts-expect-error — next-auth/jwt types don't expose getToken cleanly in TS strict; runtime is fine.
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'

import { withAuth } from '@/lib/rbac-middleware'
import { VerificationService } from '@/server/services/verificationService'
import { handleApiError } from '@/server/utils/errors'
import {
  CONTAINER_TYPES,
  GENERAL_LEVELS,
  UNIT_TYPES
} from '@/server/types/verification'

const createSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  productCode: z.string().min(1, 'Kode produk wajib diisi'),
  batchNumber: z.string().min(1, 'Nomor batch wajib diisi'),
  location: z.string().min(1, 'Lokasi wajib diisi'),
  aqlCriteria: z.string().min(1, 'Kriteria penerimaan (AQL) wajib diisi'),
  unitType: z.enum(UNIT_TYPES),
  generalLevel: z.enum(GENERAL_LEVELS),
  sampleSize: z.number().int().positive('Jumlah unit sampel harus > 0'),
  keterangan: z.string().nullish(),
  kesimpulan: z.string().nullish(),
  findings: z
    .array(
      z.object({
        label: z.string().min(1, 'Label wadah wajib diisi'),
        containerType: z.enum(CONTAINER_TYPES),
        findingCount: z.number().int().min(0, 'Jumlah temuan tidak boleh negatif'),
        description: z.string().nullish()
      })
    )
    .min(1, 'Tambahkan minimal 1 baris temuan')
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const parsed = createSchema.parse(body)
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const createdById = (token?.sub as string | undefined) ?? null

    const verification = await VerificationService.create(parsed, createdById)
    return NextResponse.json({ success: true, data: verification }, { status: 201 })
  } catch (error) {
    const { message, status } = handleApiError(error)
    return NextResponse.json({ success: false, error: message }, { status })
  }
})

export const GET = withAuth(async () => {
  try {
    const data = await VerificationService.listRecent(20)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const { message, status } = handleApiError(error)
    return NextResponse.json({ success: false, error: message }, { status })
  }
})
