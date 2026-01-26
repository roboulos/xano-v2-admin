/**
 * GET /api/v2/background-tasks
 *
 * Fetch all background tasks from cached data
 *
 * NOTE: Snappy CLI's list_tasks is broken (returns 404)
 * Data is cached from xano-mcp tool
 * To refresh: pnpm tsx scripts/refresh-background-tasks.ts
 */

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

interface XanoTask {
  id: number
  name: string
  type: string
  active: boolean
  schedule: string
  draft: boolean
  last_modified?: string
  created?: string
}

interface TaskCache {
  tasks: XanoTask[]
  total: number
  last_updated: string
  note: string
}

/**
 * Load tasks from cache file
 */
function loadTasksFromCache(): TaskCache {
  try {
    const cacheFilePath = path.join(process.cwd(), 'lib', 'background-tasks-cache.json')
    const cacheData = fs.readFileSync(cacheFilePath, 'utf-8')
    return JSON.parse(cacheData)
  } catch (error) {
    console.error('[Background Tasks] Error loading cache:', error)
    return {
      tasks: [],
      total: 0,
      last_updated: new Date().toISOString(),
      note: 'Cache file not found',
    }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    // Load from cache
    const cache = loadTasksFromCache()
    let tasks = cache.tasks

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase()
      tasks = tasks.filter((task) => task.name.toLowerCase().includes(searchLower))
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTasks = tasks.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tasks: paginatedTasks,
      total: tasks.length,
      page,
      per_page: limit,
      cache_updated: cache.last_updated,
    })
  } catch (error: any) {
    console.error('[Background Tasks API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        tasks: [],
        total: 0,
      },
      { status: 500 }
    )
  }
}
