/**
 * GET /api/v2/background-tasks
 *
 * Fetch all background tasks from V2 workspace
 * Background tasks are scheduled jobs that run XanoScript code
 */

import { NextResponse } from 'next/server'
import { v2Client } from '@/lib/snappy-client'

export const dynamic = 'force-dynamic'

// Known total from xano-mcp verification (2026-01-23)
// This represents scheduled background tasks (not functions)
const TOTAL_BACKGROUND_TASKS = 218

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    // Fetch the requested page
    const result = await v2Client.listTasks({
      search: search || undefined,
      limit,
      page
    })

    // Use known total for performance (avoids fetching all pages)
    // If search is active, use the result total from that page
    const actualTotal = search ? (result.total || 0) : TOTAL_BACKGROUND_TASKS

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tasks: result.tasks || [],
      total: actualTotal,
      page,
      per_page: limit
    })
  } catch (error: any) {
    console.error('[Background Tasks API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        tasks: [],
        total: 0
      },
      { status: 500 }
    )
  }
}
