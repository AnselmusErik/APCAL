/**
 * API Route: Get ANSI Reference Tables
 * GET /api/ansi/references
 */

import { NextResponse } from 'next/server'
import { AnsiService } from '@/server/services/ansiService'
import { handleApiError } from '@/server/utils/errors'

export async function GET() {
  try {
    // Get reference tables
    const references = await AnsiService.getReferenceTables()

    // Get switching rules
    const switchingRules = AnsiService.getInspectionSwitchingRules()

    return NextResponse.json({
      success: true,
      data: {
        ...references,
        switchingRules
      }
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