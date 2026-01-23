/**
 * POST /api/v2/endpoints/[id]/test
 *
 * Test a specific endpoint by its ID
 * Returns status, response time, success, and error details
 */

import { NextResponse } from 'next/server'
import { MCP_BASES, MCP_ENDPOINTS } from '@/lib/mcp-endpoints'
import { ALL_FRONTEND_ENDPOINTS } from '@/lib/frontend-api-v2-endpoints'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // Allow 30 seconds for single test

interface SingleTestRequest {
  user_id?: number
  params?: Record<string, unknown>
}

interface SingleTestResponse {
  success: boolean
  endpoint: string
  method: string
  status: number
  response_time_ms: number
  error: string | null
  response_data?: unknown
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const endpointId = parseInt(id)

    if (isNaN(endpointId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid endpoint ID' },
        { status: 400 }
      )
    }

    // Find endpoint in MCP_ENDPOINTS or FRONTEND_ENDPOINTS
    let endpoint = MCP_ENDPOINTS.find(e => e.taskId === endpointId)
    let isMcpEndpoint = true

    if (!endpoint) {
      // Try frontend endpoints
      const frontendEndpoint = ALL_FRONTEND_ENDPOINTS.find(e => e.id === endpointId)

      if (!frontendEndpoint) {
        return NextResponse.json(
          { success: false, error: 'Endpoint not found' },
          { status: 404 }
        )
      }

      // Convert to MCP format for testing
      endpoint = {
        taskId: frontendEndpoint.id,
        taskName: frontendEndpoint.name,
        endpoint: frontendEndpoint.path,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiGroup: 'WORKERS' as any, // Most frontend endpoints use Frontend API v2
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        method: frontendEndpoint.method as any,
        requiresUserId: !!frontendEndpoint.authRequired,
        description: frontendEndpoint.description,
      }

      isMcpEndpoint = false
    }

    // Parse request body for custom params
    const body = await request.json().catch(() => ({})) as SingleTestRequest

    // Build URL
    const baseUrl = isMcpEndpoint
      ? MCP_BASES[endpoint.apiGroup as keyof typeof MCP_BASES]
      : 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I'

    const fullUrl = `${baseUrl}${endpoint.endpoint}`

    console.log(`[Endpoint Test] Testing ${endpoint.method} ${fullUrl}`)

    const startTime = Date.now()

    try {
      // Build request body
      const requestBody = body.params || {}

      // Add user_id if required and not provided
      if (endpoint.requiresUserId && !('user_id' in requestBody)) {
        requestBody.user_id = body.user_id || 60 // Default test user
      }

      const response = await fetch(fullUrl, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: endpoint.method === 'POST' ? JSON.stringify(requestBody) : undefined,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      const responseTime = Date.now() - startTime

      // Try to parse response
      let responseData = null
      try {
        responseData = await response.json()
      } catch {
        responseData = await response.text()
      }

      const result: SingleTestResponse = {
        success: response.ok,
        endpoint: endpoint.endpoint,
        method: endpoint.method,
        status: response.status,
        response_time_ms: responseTime,
        error: response.ok ? null : `HTTP ${response.status}`,
        response_data: responseData,
      }

      console.log(`[Endpoint Test] Result: ${response.status} in ${responseTime}ms`)

      return NextResponse.json(result)
    } catch (error) {
      const responseTime = Date.now() - startTime

      console.error(`[Endpoint Test] Error:`, error instanceof Error ? error.message : 'Unknown error')

      const result: SingleTestResponse = {
        success: false,
        endpoint: endpoint.endpoint,
        method: endpoint.method,
        status: 0,
        response_time_ms: responseTime,
        error: error instanceof Error ? error.message : 'Request failed',
      }

      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('[Endpoint Test API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
