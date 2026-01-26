/**
 * POST /api/parallel-compare
 *
 * Execute the same API call against V1 and V2 workspaces in parallel,
 * then compare the response structures and data.
 *
 * This enables real-time verification that V2 endpoints return
 * equivalent data to V1 before switching the frontend.
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for parallel calls

// Workspace configurations
const V1_CONFIG = {
  name: 'V1 (Production)',
  instance: 'xmpx-swi5-tlvy.n7c.xano.io',
  workspace_id: 1,
  api_groups: {
    MAIN: 'api:kaVkk3oM',
    TRANSACTIONS_V2: 'api:KPx5ivcP',
    AUTH: 'api:lkmcgxf_:v1.5',
  },
}

const V2_CONFIG = {
  name: 'V2 (Normalized)',
  instance: 'x2nu-xcjc-vhax.agentdashboards.xano.io',
  workspace_id: 5,
  api_groups: {
    FRONTEND_API: 'api:pe1wjL5I',
    AUTH: 'api:i6a062_x',
  },
}

// Known endpoint mappings between V1 and V2
export const COMPARABLE_ENDPOINTS = [
  {
    id: 'transactions-all',
    name: 'Transactions All',
    v1_path: '/transactions/all',
    v1_group: 'TRANSACTIONS_V2',
    v2_path: '/transactions/all',
    v2_group: 'FRONTEND_API',
    method: 'GET',
    requires_user_id: true,
    description: 'All transactions for a user',
  },
  {
    id: 'listings-all',
    name: 'Listings All',
    v1_path: '/listings/all',
    v1_group: 'TRANSACTIONS_V2',
    v2_path: '/listings/all',
    v2_group: 'FRONTEND_API',
    method: 'GET',
    requires_user_id: true,
    description: 'All listings for a user',
  },
  {
    id: 'network-all',
    name: 'Network All',
    v1_path: '/network/all',
    v1_group: 'TRANSACTIONS_V2',
    v2_path: '/network/all',
    v2_group: 'FRONTEND_API',
    method: 'GET',
    requires_user_id: true,
    description: 'Network data for a user',
  },
  {
    id: 'revenue-all',
    name: 'Revenue All',
    v1_path: '/revenue/all',
    v1_group: 'TRANSACTIONS_V2',
    v2_path: '/revenue/all',
    v2_group: 'FRONTEND_API',
    method: 'GET',
    requires_user_id: true,
    description: 'Revenue data for a user',
  },
  {
    id: 'contributions',
    name: 'Contributions',
    v1_path: '/contributions',
    v1_group: 'TRANSACTIONS_V2',
    v2_path: '/contributions',
    v2_group: 'FRONTEND_API',
    method: 'GET',
    requires_user_id: true,
    description: 'Contributions for a user',
  },
  {
    id: 'network-counts',
    name: 'Network Counts',
    v1_path: '/network/counts',
    v1_group: 'TRANSACTIONS_V2',
    v2_path: '/network/counts',
    v2_group: 'FRONTEND_API',
    method: 'GET',
    requires_user_id: true,
    description: 'Network statistics',
  },
  {
    id: 'team-roster',
    name: 'Team Management Roster',
    v1_path: '/team_management/roster',
    v1_group: 'TRANSACTIONS_V2',
    v2_path: '/team_management/roster',
    v2_group: 'FRONTEND_API',
    method: 'GET',
    requires_team_id: true,
    description: 'Team roster data',
  },
  {
    id: 'dashboard-sections',
    name: 'Dashboard Sections',
    v1_path: '/dashboard_sections',
    v1_group: 'MAIN',
    v2_path: '/dashboard_sections',
    v2_group: 'FRONTEND_API',
    method: 'GET',
    requires_user_id: false,
    description: 'Dashboard configuration',
  },
  {
    id: 'chart-catalog',
    name: 'Chart Catalog',
    v1_path: '/chart_catalog',
    v1_group: 'MAIN',
    v2_path: '/chart_catalog',
    v2_group: 'FRONTEND_API',
    method: 'GET',
    requires_user_id: false,
    description: 'Available charts',
  },
  {
    id: 'contact-log',
    name: 'Contact Log',
    v1_path: '/contact_log',
    v1_group: 'TRANSACTIONS_V2',
    v2_path: '/contact_log',
    v2_group: 'FRONTEND_API',
    method: 'GET',
    requires_user_id: false,
    description: 'Contact activity log',
  },
]

interface RequestBody {
  endpoint_id: string
  user_id?: number
  team_id?: number
  v1_token?: string
  v2_token?: string
  custom_params?: Record<string, string | number>
}

interface ComparisonResult {
  success: boolean
  endpoint: {
    id: string
    name: string
    description: string
  }
  v1: {
    url: string
    status: number
    duration_ms: number
    data: unknown
    error?: string
    record_count?: number
  }
  v2: {
    url: string
    status: number
    duration_ms: number
    data: unknown
    error?: string
    record_count?: number
  }
  comparison: {
    structures_match: boolean
    record_count_match: boolean
    v1_fields: string[]
    v2_fields: string[]
    differences: string[]
    similarity_score: number
  }
  timestamp: string
}

// Extract JSON structure recursively
function extractStructure(obj: unknown, prefix = ''): string[] {
  if (obj === null || obj === undefined) {
    return [`${prefix}: null`]
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return [`${prefix}: []`]
    return extractStructure(obj[0], `${prefix}[0]`)
  }

  if (typeof obj !== 'object') {
    return [`${prefix}: ${typeof obj}`]
  }

  const fields: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value === null) {
      fields.push(`${path}: null`)
    } else if (Array.isArray(value)) {
      fields.push(`${path}: array[${value.length}]`)
      if (value.length > 0) {
        fields.push(...extractStructure(value[0], `${path}[0]`))
      }
    } else if (typeof value === 'object') {
      fields.push(...extractStructure(value, path))
    } else {
      fields.push(`${path}: ${typeof value}`)
    }
  }
  return fields.sort()
}

// Count records in response
function countRecords(data: unknown): number {
  if (Array.isArray(data)) return data.length
  if (data && typeof data === 'object') {
    // Check for common wrapper patterns
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.items)) return obj.items.length
    if (Array.isArray(obj.data)) return obj.data.length
    if (Array.isArray(obj.records)) return obj.records.length
    if (Array.isArray(obj.results)) return obj.results.length
  }
  return 1
}

// Compare two structures and find differences
function compareStructures(
  v1Data: unknown,
  v2Data: unknown
): {
  v1_fields: string[]
  v2_fields: string[]
  differences: string[]
  structures_match: boolean
  similarity_score: number
} {
  const v1Fields = extractStructure(v1Data)
  const v2Fields = extractStructure(v2Data)

  const v1Set = new Set(v1Fields)
  const v2Set = new Set(v2Fields)

  const differences: string[] = []

  // Fields in V1 but not V2
  v1Fields.forEach((field) => {
    if (!v2Set.has(field)) {
      differences.push(`V1 only: ${field}`)
    }
  })

  // Fields in V2 but not V1
  v2Fields.forEach((field) => {
    if (!v1Set.has(field)) {
      differences.push(`V2 only: ${field}`)
    }
  })

  // Calculate similarity score
  const allFields = new Set([...v1Fields, ...v2Fields])
  const matchingFields = v1Fields.filter((f) => v2Set.has(f)).length
  const similarity = allFields.size > 0 ? (matchingFields / allFields.size) * 100 : 100

  return {
    v1_fields: v1Fields,
    v2_fields: v2Fields,
    differences,
    structures_match: differences.length === 0,
    similarity_score: Math.round(similarity * 10) / 10,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { endpoint_id, user_id, team_id, v1_token, v2_token, custom_params } = body

    // Find the endpoint configuration
    const endpointConfig = COMPARABLE_ENDPOINTS.find((e) => e.id === endpoint_id)
    if (!endpointConfig) {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown endpoint: ${endpoint_id}`,
          available_endpoints: COMPARABLE_ENDPOINTS.map((e) => ({
            id: e.id,
            name: e.name,
          })),
        },
        { status: 400 }
      )
    }

    // Build query parameters
    const params = new URLSearchParams()
    if (endpointConfig.requires_user_id && user_id) {
      params.set('user_id', String(user_id))
    }
    if ((endpointConfig as { requires_team_id?: boolean }).requires_team_id && team_id) {
      params.set('team_id', String(team_id))
    }
    if (custom_params) {
      Object.entries(custom_params).forEach(([key, value]) => {
        params.set(key, String(value))
      })
    }
    const queryString = params.toString() ? `?${params.toString()}` : ''

    // Build URLs
    const v1Group =
      V1_CONFIG.api_groups[endpointConfig.v1_group as keyof typeof V1_CONFIG.api_groups]
    const v2Group =
      V2_CONFIG.api_groups[endpointConfig.v2_group as keyof typeof V2_CONFIG.api_groups]

    const v1Url = `https://${V1_CONFIG.instance}/${v1Group}${endpointConfig.v1_path}${queryString}`
    const v2Url = `https://${V2_CONFIG.instance}/${v2Group}${endpointConfig.v2_path}${queryString}`

    // Execute parallel requests
    const [v1Result, v2Result] = await Promise.all([
      fetchWithTiming(v1Url, endpointConfig.method, v1_token),
      fetchWithTiming(v2Url, endpointConfig.method, v2_token),
    ])

    // Compare structures
    const comparison = compareStructures(v1Result.data, v2Result.data)

    // Check record counts
    const v1Count = countRecords(v1Result.data)
    const v2Count = countRecords(v2Result.data)

    const result: ComparisonResult = {
      success: true,
      endpoint: {
        id: endpointConfig.id,
        name: endpointConfig.name,
        description: endpointConfig.description,
      },
      v1: {
        url: v1Url,
        status: v1Result.status,
        duration_ms: v1Result.duration_ms,
        data: v1Result.data,
        error: v1Result.error,
        record_count: v1Count,
      },
      v2: {
        url: v2Url,
        status: v2Result.status,
        duration_ms: v2Result.duration_ms,
        data: v2Result.data,
        error: v2Result.error,
        record_count: v2Count,
      },
      comparison: {
        ...comparison,
        record_count_match: v1Count === v2Count,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Parallel Compare API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET handler to list available endpoints
export async function GET() {
  return NextResponse.json({
    success: true,
    description: 'V1/V2 Parallel Comparison API',
    endpoints: COMPARABLE_ENDPOINTS.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      method: e.method,
      requires_user_id: e.requires_user_id ?? false,
      requires_team_id: (e as { requires_team_id?: boolean }).requires_team_id ?? false,
    })),
    usage: {
      method: 'POST',
      body: {
        endpoint_id: 'string (required)',
        user_id: 'number (optional, for user-scoped endpoints)',
        team_id: 'number (optional, for team-scoped endpoints)',
        v1_token: 'string (optional, auth token for V1)',
        v2_token: 'string (optional, auth token for V2)',
        custom_params: 'object (optional, additional query params)',
      },
    },
    test_user: {
      id: 60,
      name: 'David Keener',
      note: 'Verified test user with extensive data',
    },
    test_team: {
      id: 1,
      note: 'Default test team',
    },
  })
}

// Helper to fetch with timing
async function fetchWithTiming(
  url: string,
  method: string,
  token?: string
): Promise<{
  status: number
  duration_ms: number
  data: unknown
  error?: string
}> {
  const start = performance.now()

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method,
      headers,
      // @ts-expect-error - Next.js specific
      next: { revalidate: 0 },
    })

    const duration_ms = Math.round(performance.now() - start)

    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = null
    }

    return {
      status: response.status,
      duration_ms,
      data,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    }
  } catch (error) {
    return {
      status: 0,
      duration_ms: Math.round(performance.now() - start),
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}
