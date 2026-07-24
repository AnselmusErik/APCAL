/**
 * API Route: Riwayat Sampling Plan History
 *
 * GET  /api/history/sampling?limit=50  → ambil riwayat dari C# backend
 * POST /api/history/sampling           → simpan entry baru ke C# backend
 * DELETE /api/history/sampling         → hapus semua riwayat
 *
 * Thin proxy: validasi Zod → forward ke backend/history/sampling
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError } from '@/utils/errors'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:5075'

// Request body schema untuk POST (save)
const saveHistorySchema = z.object({
  productName:        z.string().optional().default(''),
  batchNumber:        z.string().optional().default(''),
  lotSize:            z.number().int().positive(),
  letterCode:         z.string(),
  sampleSize:         z.number().int().positive(),
  inspectionLevel:    z.enum(['normal', 'tightened', 'reduced']),
  inspectionCode:     z.enum(['S1', 'S2', 'S3', 'S4', 'GI', 'GII', 'GIII']).default('GII'),
  inspectionCodeLabel: z.string(),
  inspectionTypeLabel: z.string(),
  samplingPlanCritical: z.object({ ac: z.number(), re: z.number() }),
  samplingPlanMajor:    z.object({ ac: z.number(), re: z.number() }),
  samplingPlanMinor:    z.object({ ac: z.number(), re: z.number() }),
  createdById: z.string().optional(),
})

// GET — ambil daftar riwayat
export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get('limit') ?? '50'
    const res = await fetch(`${BACKEND_URL}/api/history/sampling?limit=${limit}`, {
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    const { message, status } = handleApiError(error)
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

// POST — simpan entry baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = saveHistorySchema.parse(body)

    const res = await fetch(`${BACKEND_URL}/api/history/sampling`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    const { message, status } = handleApiError(error)
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

// DELETE — hapus semua riwayat
export async function DELETE() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/history/sampling`, {
      method: 'DELETE',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    const { message, status } = handleApiError(error)
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
