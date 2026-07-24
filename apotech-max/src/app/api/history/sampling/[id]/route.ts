/**
 * API Route: Delete single sampling history entry
 * DELETE /api/history/sampling/[id]
 *
 * Forwards delete request to C# backend.
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/utils/errors'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:5075'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const res = await fetch(`${BACKEND_URL}/api/history/sampling/${id}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    const { message, status } = handleApiError(error)
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
