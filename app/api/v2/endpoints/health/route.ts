/**
 * GET /api/v2/endpoints/health
 *
 * Sample test critical V2 endpoints to measure health status
 * Tests 20-50 endpoints and measures response times and errors
 */

import { NextResponse } from 'next/server'
import { MCP_BASES, MCP_ENDPOINTS } from '@/lib/mcp-endpoints'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow 60 seconds for testing

interface EndpointTestResult {
  endpoint: string
  method: string
  status: number
  response_time_ms: number
  success: boolean
  error: string | null
  apiGroup: string
}

interface HealthCheckResponse {
  success: boolean
  timestamp: string
  tested: number
  passed: number
  failed: number
  avg_response_time: number
  results: EndpointTestResult[]
  summary: {
    by_group: Record<string, { tested: number; passed: number; failed: number; avg_time: number }>
  }
}

/**
 * Test a single endpoint
 */
async function testEndpoint(endpoint: (typeof MCP_ENDPOINTS)[0]): Promise<EndpointTestResult> {
  const baseUrl = MCP_BASES[endpoint.apiGroup]

  // For GET requests with user_id, add query param
  let fullUrl = `${baseUrl}${endpoint.endpoint}`
  if (endpoint.method === 'GET' && endpoint.requiresUserId) {
    const params = new URLSearchParams({ user_id: '7' }) // V2 user (David Keener)
    fullUrl = `${fullUrl}?${params.toString()}`
  }

  const startTime = Date.now()

  try {
    // For POST requests that require user_id, use V2 test user 7 (David Keener)
    let body: Record<string, unknown> = {}
    if (endpoint.method === 'POST' && endpoint.requiresUserId) {
      const paramName = endpoint.userIdParamName || 'user_id'
      body[paramName] = 7
    }
    // Merge in any additional required params
    if (endpoint.additionalParams) {
      body = { ...body, ...endpoint.additionalParams }
    }

    const response = await fetch(fullUrl, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: endpoint.method === 'POST' ? JSON.stringify(body) : undefined,
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    })

    const responseTime = Date.now() - startTime

    return {
      endpoint: endpoint.endpoint,
      method: endpoint.method,
      status: response.status,
      response_time_ms: responseTime,
      success: response.ok,
      error: response.ok ? null : `HTTP ${response.status}`,
      apiGroup: endpoint.apiGroup,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    return {
      endpoint: endpoint.endpoint,
      method: endpoint.method,
      status: 0,
      response_time_ms: responseTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      apiGroup: endpoint.apiGroup,
    }
  }
}

/**
 * Select critical endpoints to test (max 30 to keep test time reasonable)
 */
function selectCriticalEndpoints(): typeof MCP_ENDPOINTS {
  const critical = []

  // Test a sample from each API group
  const groups = ['TASKS', 'WORKERS', 'SYSTEM', 'SEEDING'] as const

  for (const group of groups) {
    const groupEndpoints = MCP_ENDPOINTS.filter((e) => e.apiGroup === group)

    if (group === 'WORKERS') {
      // Test more WORKERS endpoints (most critical for frontend)
      critical.push(...groupEndpoints.slice(0, 12))
    } else if (group === 'TASKS') {
      // Test sample of TASKS
      critical.push(...groupEndpoints.slice(0, 6))
    } else if (group === 'SYSTEM') {
      // Test all SYSTEM endpoints (status/admin)
      critical.push(...groupEndpoints.slice(0, 7))
    } else if (group === 'SEEDING') {
      // Test a few SEEDING endpoints
      critical.push(...groupEndpoints.slice(0, 3))
    }
  }

  return critical
}

export async function GET() {
  try {
    console.log('[Endpoint Health] Starting health check...')

    const criticalEndpoints = selectCriticalEndpoints()
    console.log(`[Endpoint Health] Testing ${criticalEndpoints.length} critical endpoints...`)

    // Test all endpoints in parallel (with timeout protection)
    const results = await Promise.all(criticalEndpoints.map((endpoint) => testEndpoint(endpoint)))

    // Calculate summary statistics
    const passed = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length
    const avgResponseTime = Math.round(
      results.reduce((sum, r) => sum + r.response_time_ms, 0) / results.length
    )

    // Group by API group
    const byGroup: Record<
      string,
      { tested: number; passed: number; failed: number; avg_time: number }
    > = {}

    for (const result of results) {
      if (!byGroup[result.apiGroup]) {
        byGroup[result.apiGroup] = { tested: 0, passed: 0, failed: 0, avg_time: 0 }
      }

      byGroup[result.apiGroup].tested++
      if (result.success) {
        byGroup[result.apiGroup].passed++
      } else {
        byGroup[result.apiGroup].failed++
      }
    }

    // Calculate average time per group
    for (const group in byGroup) {
      const groupResults = results.filter((r) => r.apiGroup === group)
      byGroup[group].avg_time = Math.round(
        groupResults.reduce((sum, r) => sum + r.response_time_ms, 0) / groupResults.length
      )
    }

    console.log(
      `[Endpoint Health] Complete - ${passed}/${results.length} passed, avg ${avgResponseTime}ms`
    )

    const response: HealthCheckResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      tested: results.length,
      passed,
      failed,
      avg_response_time: avgResponseTime,
      results,
      summary: {
        by_group: byGroup,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Endpoint Health API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
