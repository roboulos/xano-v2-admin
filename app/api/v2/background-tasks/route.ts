/**
 * GET /api/v2/background-tasks
 *
 * Fetch all background tasks from WORKERS and TASKS API groups
 */

import { NextResponse } from 'next/server'
import { v2Client } from '@/lib/snappy-client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group') // 'workers', 'tasks', or null for both
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // API Group IDs from CLAUDE.md
    const WORKERS_API_GROUP = 536 // api:4UsTtl3m
    const TASKS_API_GROUP = 532   // api:4psV7fp6

    let results: any[] = []

    if (!group || group === 'workers') {
      // Fetch WORKERS endpoints
      const workersData = await v2Client.listEndpoints({
        api_group_id: WORKERS_API_GROUP,
        page,
        limit
      })
      results.push(...workersData.endpoints.map((e: any) => ({
        ...e,
        group: 'WORKERS',
        group_id: WORKERS_API_GROUP
      })))
    }

    if (!group || group === 'tasks') {
      // Fetch TASKS endpoints
      const tasksData = await v2Client.listEndpoints({
        api_group_id: TASKS_API_GROUP,
        page,
        limit
      })
      results.push(...tasksData.endpoints.map((e: any) => ({
        ...e,
        group: 'TASKS',
        group_id: TASKS_API_GROUP
      })))
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tasks: results,
      total: results.length,
      summary: {
        workers: results.filter(r => r.group === 'WORKERS').length,
        tasks: results.filter(r => r.group === 'TASKS').length
      }
    })
  } catch (error: any) {
    console.error('[Background Tasks API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
