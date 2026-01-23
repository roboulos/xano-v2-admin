/**
 * GET /api/v2/functions
 *
 * Fetch ALL V2 functions with full details
 * Uses snappy CLI to get complete function list
 * Cached for 5 minutes to improve performance
 */

import { NextResponse } from 'next/server'
import { v2Client } from '@/lib/snappy-client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow 60 seconds for large fetch

// In-memory cache
let cachedFunctions: any[] | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Categorize function based on name/folder
 */
function categorizeFunction(name: string): { category: string; folder?: string; subFolder?: string } {
  const nameLower = name.toLowerCase()

  // Folder-based categorization (Workers/, Tasks/, etc.)
  if (nameLower.startsWith('workers/')) {
    return { category: 'Workers', folder: 'Workers' }
  }
  if (nameLower.startsWith('tasks/')) {
    return { category: 'Tasks', folder: 'Tasks' }
  }
  if (nameLower.startsWith('utils/')) {
    return { category: 'Utils', folder: 'Utils' }
  }

  // Archive with sub-folders
  if (nameLower.startsWith('archive/')) {
    const parts = name.split('/')
    const subFolder = parts[1] || 'Other'
    return { category: 'Archive', folder: 'Archive', subFolder }
  }

  // Integration categorization based on name patterns
  if (nameLower.includes('fub') || nameLower.includes('followupboss')) {
    return { category: 'FUB', folder: 'Integrations' }
  }
  if (nameLower.includes('rezen')) {
    return { category: 'reZEN', folder: 'Integrations' }
  }
  if (nameLower.includes('skyslope')) {
    return { category: 'SkySlope', folder: 'Integrations' }
  }
  if (nameLower.includes('dotloop')) {
    return { category: 'DotLoop', folder: 'Integrations' }
  }
  if (nameLower.includes('lofty')) {
    return { category: 'Lofty', folder: 'Integrations' }
  }
  if (nameLower.includes('title') || nameLower.includes('qualia')) {
    return { category: 'Title/Qualia', folder: 'Integrations' }
  }

  return { category: 'Other' }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const category = searchParams.get('category') // Filter by category
    const hideArchive = searchParams.get('hideArchive') === 'true'
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Check cache first
    const now = Date.now()
    const isCacheValid = cachedFunctions && (now - cacheTimestamp) < CACHE_TTL && !forceRefresh

    let allFunctions: any[] = []

    if (isCacheValid) {
      console.log('[V2 Functions API] Using cached functions')
      allFunctions = cachedFunctions!
    } else {
      // Fetch ALL functions from V2 (we need all to properly categorize)
      // Note: Xano limit is per page, so we may need multiple requests
      let currentPage = 1
      const fetchLimit = 50 // Xano maxes at 50 per request

      console.log('[V2 Functions API] Starting to fetch all functions...')

    // Fetch all functions in batches until we get no more results
    while (true) {
      const result = await v2Client.listFunctions({
        page: currentPage,
        limit: fetchLimit,
      })

      console.log(`[V2 Functions API] Page ${currentPage}: fetched ${result.functions.length} functions`)

      // Break if no more results
      if (!result.functions || result.functions.length === 0) {
        break
      }

      allFunctions.push(...result.functions)

      // Break if we got fewer results than requested (last page)
      if (result.functions.length < fetchLimit) {
        break
      }

      currentPage++

      // Safety limit to prevent infinite loops
      if (currentPage > 50) {
        console.warn('[V2 Functions API] Hit safety limit of 50 pages')
        break
      }
    }

      console.log(`[V2 Functions API] Total functions fetched: ${allFunctions.length}`)

      // Cache the results
      cachedFunctions = allFunctions
      cacheTimestamp = Date.now()
    }

    // Categorize ALL functions
    const categorized = allFunctions.map(func => {
      const { category: cat, folder, subFolder } = categorizeFunction(func.name)
      return {
        ...func,
        category: cat,
        folder,
        subFolder,
      }
    })

    // Build comprehensive category summary with ALL functions
    const byCategory = categorized.reduce((acc, func) => {
      if (!acc[func.category]) acc[func.category] = []
      acc[func.category].push(func)
      return acc
    }, {} as Record<string, typeof categorized>)

    const summary = Object.entries(byCategory)
      .map(([category, funcs]) => ({
        category,
        count: Array.isArray(funcs) ? funcs.length : 0,
      }))
      .sort((a, b) => b.count - a.count) // Sort by count descending

    // Filter functions based on query params
    let filteredFunctions = categorized

    if (hideArchive) {
      filteredFunctions = filteredFunctions.filter(f => f.category !== 'Archive')
    }

    if (category) {
      filteredFunctions = filteredFunctions.filter(f => f.category === category)
    }

    // Paginate filtered results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedFunctions = filteredFunctions.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      functions: paginatedFunctions,
      total: filteredFunctions.length,
      totalAll: categorized.length,
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
