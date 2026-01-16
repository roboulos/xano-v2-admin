import { NextResponse } from "next/server"
import {
  TASKS_FUNCTIONS,
  getTasksFunctionsStats,
  type TaskFunction,
} from "@/lib/tasks-inventory"

// Cache configuration - 5 minute TTL
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds
let cachedData: {
  functions: TaskFunction[]
  stats: ReturnType<typeof getTasksFunctionsStats>
  timestamp: number
} | null = null

// GET: Returns all Tasks/ functions with caching
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Check query params for filtering
  const domain = searchParams.get("domain")
  const category = searchParams.get("category")
  const status = searchParams.get("status")
  const requiresUserId = searchParams.get("requiresUserId")
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
    if (requiresUserId === "true") {
      functions = functions.filter(f => f.expectedInputs.includes("user_id"))
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
  const functions = TASKS_FUNCTIONS
  const stats = getTasksFunctionsStats()

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
  if (requiresUserId === "true") {
    filteredFunctions = filteredFunctions.filter(f => f.expectedInputs.includes("user_id"))
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

// POST: Update task status (for marking as tested/untested/broken)
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
    const fn = TASKS_FUNCTIONS.find(f => f.id === functionId)
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
