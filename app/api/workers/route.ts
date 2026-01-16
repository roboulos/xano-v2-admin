import { NextResponse } from "next/server"
import {
  WORKERS_FUNCTIONS,
  getWorkersFunctionsStats,
  type WorkerFunction,
} from "@/lib/workers-inventory"

// Cache configuration - 5 minute TTL
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds
let cachedData: {
  functions: WorkerFunction[]
  stats: ReturnType<typeof getWorkersFunctionsStats>
  timestamp: number
} | null = null

// GET: Returns all Workers/ functions with caching
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Check query params for filtering
  const domain = searchParams.get("domain")
  const category = searchParams.get("category")
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const hasFpPattern = searchParams.get("hasFpPattern")
  const refresh = searchParams.get("refresh") === "true"

  // Check cache validity
  const now = Date.now()
  const isCacheValid = cachedData && (now - cachedData.timestamp) < CACHE_TTL

  // Use cached data if valid and not forcing refresh
  if (isCacheValid && !refresh) {
    let functions = cachedData!.functions

    // Apply filters
    if (domain) {
      functions = functions.filter(f => f.domain === domain)
    }
    if (category) {
      functions = functions.filter(f => f.category === category)
    }
    if (status) {
      functions = functions.filter(f => f.status === status)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      functions = functions.filter(f =>
        f.name.toLowerCase().includes(searchLower) ||
        f.shortName.toLowerCase().includes(searchLower) ||
        f.description.toLowerCase().includes(searchLower)
      )
    }
    if (hasFpPattern === "true") {
      functions = functions.filter(f =>
        f.tags.some(t => t.toLowerCase().includes("fp-pattern") || t.toLowerCase().includes("fp-result-type"))
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        functions,
        stats: cachedData!.stats,
        cached: true,
        cacheAge: Math.floor((now - cachedData!.timestamp) / 1000),
      },
    })
  }

  // Build fresh data
  const functions = WORKERS_FUNCTIONS
  const stats = getWorkersFunctionsStats()

  // Update cache
  cachedData = {
    functions,
    stats,
    timestamp: now,
  }

  // Apply filters to response
  let filteredFunctions = functions
  if (domain) {
    filteredFunctions = filteredFunctions.filter(f => f.domain === domain)
  }
  if (category) {
    filteredFunctions = filteredFunctions.filter(f => f.category === category)
  }
  if (status) {
    filteredFunctions = filteredFunctions.filter(f => f.status === status)
  }
  if (search) {
    const searchLower = search.toLowerCase()
    filteredFunctions = filteredFunctions.filter(f =>
      f.name.toLowerCase().includes(searchLower) ||
      f.shortName.toLowerCase().includes(searchLower) ||
      f.description.toLowerCase().includes(searchLower)
    )
  }
  if (hasFpPattern === "true") {
    filteredFunctions = filteredFunctions.filter(f =>
      f.tags.some(t => t.toLowerCase().includes("fp-pattern") || t.toLowerCase().includes("fp-result-type"))
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      functions: filteredFunctions,
      stats,
      cached: false,
      cacheAge: 0,
    },
  })
}

// POST: Update worker status (for marking as tested/untested/broken)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { functionId, status, notes, lastTested } = body

    // Validate input
    if (!functionId || !status) {
      return NextResponse.json(
        { success: false, error: "functionId and status are required" },
        { status: 400 }
      )
    }

    if (!["tested", "untested", "broken"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "status must be one of: tested, untested, broken" },
        { status: 400 }
      )
    }

    // Find the function in our data
    const fn = WORKERS_FUNCTIONS.find(f => f.id === functionId)
    if (!fn) {
      return NextResponse.json(
        { success: false, error: `Function with id ${functionId} not found` },
        { status: 404 }
      )
    }

    // Update the function (in-memory only for now)
    // In a real implementation, this would persist to a database
    fn.status = status
    if (notes) fn.notes = notes
    if (lastTested) fn.lastTested = lastTested

    // Invalidate cache
    cachedData = null

    return NextResponse.json({
      success: true,
      data: {
        function: fn,
        message: `Updated ${fn.name} status to ${status}`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    )
  }
}
