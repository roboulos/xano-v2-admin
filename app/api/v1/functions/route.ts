/**
 * GET /api/v1/functions
 *
 * Fetch ALL V1 functions with full details
 * Uses snappy CLI to get complete function list from workspace 1
 */

import { NextResponse } from 'next/server'
import { v1Client } from '@/lib/snappy-client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Fetch functions from V1
    const result = await v1Client.listFunctions({
      page,
      limit,
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      functions: result.functions,
      total: result.total,
      page,
      limit,
    })
  } catch (error: any) {
    console.error('[V1 Functions API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
