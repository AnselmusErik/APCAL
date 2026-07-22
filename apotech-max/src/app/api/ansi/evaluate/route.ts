/**
 * API Route: Evaluate Defects
 * POST /api/ansi/evaluate
 */

import { NextRequest, NextResponse } from 'next/server'
import { AnsiService } from '@/server/services/ansiService'
import { handleApiError } from '@/server/utils/errors'
import { z } from 'zod'

// Request validation schema
const evaluationRequestSchema = z.object({
  samplingResult: z.object({
    productName: z.string(),
    batchNumber: z.string(),
    lotSize: z.number(),
    inspectionLevel: z.enum(['normal', 'tightened', 'reduced']),
    /** Inspection Code: S1-S4, GI-GIII — persisted from sampling plan step */
    inspectionCode: z
      .enum(['S1', 'S2', 'S3', 'S4', 'GI', 'GII', 'GIII'])
      .default('GII'),
    inspectionCodeLabel: z.string().default('General II'),
    letterCode: z.string(),
    inspectionTypeLabel: z.string(),
    samplingPlan: z.object({
      code: z.string(),
      sampleSize: z.number(),
      critical: z.object({ ac: z.number(), re: z.number() }),
      major:    z.object({ ac: z.number(), re: z.number() }),
      minor:    z.object({ ac: z.number(), re: z.number() })
    })
  }),
  defectCounts: z.object({
    critical: z.number().int().min(0, 'Defect count cannot be negative'),
    major:    z.number().int().min(0, 'Defect count cannot be negative'),
    minor:    z.number().int().min(0, 'Defect count cannot be negative')
  })
})


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = evaluationRequestSchema.parse(body)

    // Evaluate defects
    const result = await AnsiService.evaluateDefects(validatedData)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    const { message, status } = handleApiError(error)
    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status }
    )
  }
}