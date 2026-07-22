/**
 * API Route: Calculate Sampling Plan
 * POST /api/ansi/sampling-plan
 */

import { NextRequest, NextResponse } from 'next/server'
import { AnsiService } from '@/server/services/ansiService'
import { handleApiError } from '@/server/utils/errors'
import { z } from 'zod'

// Request validation schema
const samplingRequestSchema = z.object({
  productName: z.string().optional().default(''),
  batchNumber: z.string().optional().default(''),
  lotSize: z.number().int().positive('Lot size must be a positive integer'),
  /** Inspection Type: selects which ANSI sampling plan table to use */
  inspectionLevel: z.enum(['normal', 'tightened', 'reduced']),
  /** Inspection Code: selects which column in ANSI Table I for Code Letter lookup */
  inspectionCode: z
    .enum(['S1', 'S2', 'S3', 'S4', 'GI', 'GII', 'GIII'])
    .default('GII')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = samplingRequestSchema.parse(body)

    // Calculate sampling plan
    const result = await AnsiService.calculateSamplingPlan(validatedData)

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