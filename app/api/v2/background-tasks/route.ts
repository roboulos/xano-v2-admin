/**
 * GET /api/v2/background-tasks
 *
 * Fetch all background tasks from V2 workspace
 * Background tasks are scheduled jobs that run XanoScript code
 */

import { NextResponse } from 'next/server'
import { v2Client } from '@/lib/snappy-client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    // Fetch background tasks using snappy CLI
    const result = await v2Client.listTasks({
      search: search || undefined,
      limit,
      page
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tasks: result.tasks || [],
      total: result.total || 0,
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
