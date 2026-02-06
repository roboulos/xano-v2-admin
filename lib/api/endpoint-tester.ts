/**
 * Endpoint Test Matrix System
 *
 * Systematically tests all Frontend API v2 endpoints to identify gaps.
 * Tests with real user credentials and shows exactly what's broken.
 */

import { api } from './client'

export interface TestUser {
  id: number
  name: string
  email: string
  auth_token?: string
  agent_id?: number
  team_id?: number
}

export interface EndpointTest {
  path: string
  method: string
  name: string
  requiresAuth: boolean
  testParams?: Record<string, any>
  expectedFields?: string[]
}

export interface TestResult {
  endpoint: string
  method: string
  status: 'pass' | 'fail' | 'skip' | 'pending'
  statusCode?: number
  responseTime?: number
  error?: string
  data?: any
  curlCommand?: string
  recordCount?: number
  missingFields?: string[]
}

export interface TestSummary {
  total: number
  passed: number
  failed: number
  skipped: number
  pending: number
  successRate: number
  totalTime: number
  timestamp: string
}

/**
 * Test configuration for User 7 (David Keener)
 */
export const TEST_USER: TestUser = {
  id: 7,
  name: 'David Keener',
  email: 'david@test.agentdashboards.com',
  agent_id: 37208,
  team_id: 1,
}

/**
 * Generate curl command for debugging
 */
function generateCurlCommand(
  baseUrl: string,
  path: string,
  method: string,
  params?: Record<string, any>,
  authToken?: string
): string {
  const url = `${baseUrl}${path}`
  const headers = [
    '-H "Content-Type: application/json"',
    authToken ? `-H "Authorization: Bearer ${authToken}"` : '',
  ].filter(Boolean)

  if (method === 'GET' && params) {
    const queryString = new URLSearchParams(params).toString()
    return `curl -X GET "${url}?${queryString}" ${headers.join(' ')}`
  }

  if (method !== 'GET' && params) {
    const jsonData = JSON.stringify(params, null, 2)
    return `curl -X ${method} "${url}" ${headers.join(' ')} -d '${jsonData}'`
  }

  return `curl -X ${method} "${url}" ${headers.join(' ')}`
}

/**
 * Test a single endpoint
 */
export async function testEndpoint(endpoint: EndpointTest, user: TestUser): Promise<TestResult> {
  const startTime = Date.now()
  const baseUrl =
    process.env.NEXT_PUBLIC_XANO_BASE_URL ||
    'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I'

  // Build test params with user context
  const testParams = {
    ...endpoint.testParams,
    user_id: user.id,
  }

  // Generate curl command for debugging
  const curlCommand = generateCurlCommand(
    baseUrl,
    endpoint.path,
    endpoint.method,
    testParams,
    user.auth_token
  )

  try {
    let response: any

    if (endpoint.method === 'GET') {
      response = await api.get(endpoint.path, { params: testParams })
    } else if (endpoint.method === 'POST') {
      response = await api.post(endpoint.path, testParams)
    } else if (endpoint.method === 'PUT') {
      response = await api.put(endpoint.path, testParams)
    } else if (endpoint.method === 'DELETE') {
      response = await api.delete(endpoint.path, { data: testParams })
    }

    const responseTime = Date.now() - startTime

    // Check for expected fields
    const missingFields: string[] = []
    if (endpoint.expectedFields && response) {
      for (const field of endpoint.expectedFields) {
        if (!(field in response)) {
          missingFields.push(field)
        }
      }
    }

    // Determine record count
    let recordCount: number | undefined
    if (Array.isArray(response)) {
      recordCount = response.length
    } else if (response?.data && Array.isArray(response.data)) {
      recordCount = response.data.length
    }

    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      status: missingFields.length > 0 ? 'fail' : 'pass',
      statusCode: 200,
      responseTime,
      data: response,
      curlCommand,
      recordCount,
      missingFields: missingFields.length > 0 ? missingFields : undefined,
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      status: 'fail',
      statusCode: error.response?.status,
      responseTime,
      error: error.message || String(error),
      curlCommand,
    }
  }
}

/**
 * Test all endpoints in the OpenAPI spec
 */
export async function testAllEndpoints(
  endpoints: EndpointTest[],
  user: TestUser,
  onProgress?: (current: number, total: number, result: TestResult) => void
): Promise<{ results: TestResult[]; summary: TestSummary }> {
  const startTime = Date.now()
  const results: TestResult[] = []

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i]
    const result = await testEndpoint(endpoint, user)
    results.push(result)

    if (onProgress) {
      onProgress(i + 1, endpoints.length, result)
    }
  }

  const totalTime = Date.now() - startTime

  const summary: TestSummary = {
    total: results.length,
    passed: results.filter((r) => r.status === 'pass').length,
    failed: results.filter((r) => r.status === 'fail').length,
    skipped: results.filter((r) => r.status === 'skip').length,
    pending: results.filter((r) => r.status === 'pending').length,
    successRate: 0,
    totalTime,
    timestamp: new Date().toISOString(),
  }

  summary.successRate = Math.round((summary.passed / summary.total) * 100)

  return { results, summary }
}

/**
 * Extract endpoints from OpenAPI spec
 */
export function extractEndpointsFromOpenAPI(spec: any): EndpointTest[] {
  const endpoints: EndpointTest[] = []

  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(methods as any)) {
      const op = operation as any
      const requiresAuth = !!(op.security && op.security.length > 0)
      const name = op.summary || `${method.toUpperCase()} ${path}`

      endpoints.push({
        path,
        method: method.toUpperCase(),
        name,
        requiresAuth,
        testParams: {}, // Will be populated based on endpoint
      })
    }
  }

  return endpoints
}

/**
 * Group results by status
 */
export function groupResultsByStatus(results: TestResult[]) {
  return {
    passed: results.filter((r) => r.status === 'pass'),
    failed: results.filter((r) => r.status === 'fail'),
    skipped: results.filter((r) => r.status === 'skip'),
    pending: results.filter((r) => r.status === 'pending'),
  }
}

/**
 * Get high-priority failures (endpoints that dashboards2.0 depends on)
 */
export function getHighPriorityFailures(results: TestResult[]): TestResult[] {
  const criticalEndpoints = [
    '/chart/revenue-trends',
    '/chart/transactions-status',
    '/chart/network-activity',
    '/team',
    '/transactions',
    '/listings',
    '/network',
    '/notifications',
  ]

  return results
    .filter((r) => r.status === 'fail')
    .filter((r) => criticalEndpoints.some((path) => r.endpoint.includes(path)))
}
