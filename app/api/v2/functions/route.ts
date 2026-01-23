/**
 * GET /api/v2/functions
 *
 * Fetch ALL V2 functions with full details
 * Uses snappy CLI to get complete function list
 */

import { NextResponse } from 'next/server'
import { v2Client } from '@/lib/snappy-client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow 60 seconds for large fetch

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const domain = searchParams.get('domain') // Filter by domain

    // Fetch functions from V2
    const result = await v2Client.listFunctions({
      page,
      limit,
      search: domain || undefined,
    })

    // Categorize by domain based on function name
    const categorized = result.functions.map(func => {
      const name = func.name.toLowerCase()
      let category = 'Other'

      if (name.startsWith('workers/')) category = 'Workers'
      else if (name.startsWith('tasks/')) category = 'Tasks'
      else if (name.startsWith('utils/')) category = 'Utils'
      else if (name.startsWith('archive/')) category = 'Archive'
      else if (name.includes('fub')) category = 'FUB'
      else if (name.includes('rezen')) category = 'reZEN'
      else if (name.includes('skyslope')) category = 'SkySlope'
      else if (name.includes('dotloop')) category = 'DotLoop'
      else if (name.includes('lofty')) category = 'Lofty'
      else if (name.includes('title') || name.includes('qualia')) category = 'Title/Qualia'

      return {
        ...func,
        category,
      }
    })

    // Group by category for summary
    const byCategory = categorized.reduce((acc, func) => {
      if (!acc[func.category]) acc[func.category] = []
      acc[func.category].push(func)
      return acc
    }, {} as Record<string, typeof categorized>)

    const summary = Object.entries(byCategory).map(([category, funcs]) => ({
      category,
      count: funcs.length,
    }))

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      functions: categorized,
      total: result.total,
      page,
      limit,
      summary,
    })
  } catch (error: any) {
    console.error('[V2 Functions API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
