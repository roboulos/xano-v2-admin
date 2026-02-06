// API Route for Test Endpoints
// GET: Returns all test endpoints from inventory
// POST: Runs a test endpoint with specified parameters

import { NextRequest, NextResponse } from 'next/server'
import {
  TEST_ENDPOINTS,
  TEST_API_BASE,
  VERIFIED_TEST_USER,
  getTestStats,
  buildTestUrl,
  type TestEndpoint,
} from '@/lib/test-endpoints-inventory'

// GET /api/test-endpoints - Returns all test endpoints with stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const status = searchParams.get('status')

  let endpoints = [...TEST_ENDPOINTS]

  // Filter by category if specified
  if (category && category !== 'all') {
    endpoints = endpoints.filter((e) => e.category === category)
  }

  // Filter by status if specified
  if (status) {
    if (status === 'pass') {
      endpoints = endpoints.filter((e) => e.testResult === 'pass')
    } else if (status === 'fail') {
      endpoints = endpoints.filter((e) => e.testResult === 'fail')
    } else if (status === 'untested') {
      endpoints = endpoints.filter((e) => e.testResult === 'untested' || !e.testResult)
    }
  }

  const stats = getTestStats()

  return NextResponse.json({
    success: true,
    endpoints,
    stats,
    metadata: {
      apiGroup: 659,
      canonical: '20LTQtIX',
      baseUrl: TEST_API_BASE,
      verifiedTestUser: VERIFIED_TEST_USER,
    },
  })
}

// POST /api/test-endpoints - Run a test endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpointId, userId = VERIFIED_TEST_USER.v1_id } = body // Default to V1 ID for migration endpoints

    // Find the endpoint
    const endpoint = TEST_ENDPOINTS.find((e) => e.id === endpointId)
    if (!endpoint) {
      return NextResponse.json(
        {
          success: false,
          error: `Endpoint with ID ${endpointId} not found`,
        },
        { status: 404 }
      )
    }

    // Build the request
    const url = buildTestUrl(endpoint)
    const inputs = endpoint.requiresUserId
      ? { ...endpoint.defaultInputs, user_id: userId }
      : endpoint.defaultInputs

    const startTime = Date.now()

    // Call the endpoint
    const response = await fetch(url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    let data: unknown
    let isSuccess = false
    let errorMessage: string | null = null

    try {
      data = await response.json()
      // Check for success - endpoint might return { success: true/false } or just be a successful response
      if (response.ok) {
        if (typeof data === 'object' && data !== null && 'success' in data) {
          isSuccess = (data as { success: boolean }).success !== false
        } else {
          isSuccess = true
        }
      } else {
        isSuccess = false
        errorMessage =
          typeof data === 'object' && data !== null && 'message' in data
            ? String((data as { message: string }).message)
            : `HTTP ${response.status}`
      }
    } catch (parseError) {
      isSuccess = response.ok
      errorMessage = parseError instanceof Error ? parseError.message : 'Failed to parse response'
    }

    return NextResponse.json({
      success: true,
      result: {
        endpointId: endpoint.id,
        endpointPath: endpoint.path,
        testResult: isSuccess ? 'pass' : 'fail',
        httpStatus: response.status,
        duration,
        data,
        error: errorMessage,
        testedAt: new Date().toISOString(),
        userId,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
