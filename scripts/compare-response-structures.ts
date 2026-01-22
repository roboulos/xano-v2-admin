#!/usr/bin/env tsx
/**
 * Compare Response Structures: V1 vs V2
 *
 * Fetches the SAME endpoints from both workspaces and compares response structures
 */

import axios from 'axios'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// V1 (Workspace 1) - What dashboards2.0 currently uses
const V1_BASE = 'https://xmpx-swi5-tlvy.n7c.xano.io'
const V1_API_GROUPS = {
  MAIN_V1_0: 'api:kaVkk3oM',
  TRANSACTIONS_V2: 'api:KPx5ivcP',
}

// V2 (Workspace 5) - Frontend API v2
const V2_BASE = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io'
const V2_API_GROUP = 'api:pe1wjL5I'

// Auth endpoints
const V1_AUTH_URL = 'https://xmpx-swi5-tlvy.n7c.xano.io/api:lkmcgxf_:v1.5/auth/login'
const V2_AUTH_URL = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x/auth/test-login'

const TEST_USER = {
  email: 'dave@premieregrp.com',
  password: 'Password123!',
  user_id: 60,
}

interface ComparisonResult {
  endpoint: string
  match: boolean
  v1_structure: string[]
  v2_structure: string[]
  differences: string[]
  v1_sample?: any
  v2_sample?: any
}

// Get V1 auth token
async function getV1AuthToken(): Promise<string> {
  try {
    const response = await axios.post(V1_AUTH_URL, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    })
    return response.data?.authToken || ''
  } catch (error: any) {
    console.error('V1 Auth failed:', error.message)
    throw error
  }
}

// Get V2 auth token
async function getV2AuthToken(): Promise<string> {
  try {
    const response = await axios.post(V2_AUTH_URL, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    })
    return response.data?.result?.data?.authToken || ''
  } catch (error: any) {
    console.error('V2 Auth failed:', error.message)
    throw error
  }
}

// Extract JSON structure (field names and types)
function getStructure(obj: any, prefix = ''): string[] {
  if (obj === null || obj === undefined) {
    return [`${prefix}: null`]
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return [`${prefix}: []`]
    return getStructure(obj[0], `${prefix}[0]`)
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
        fields.push(...getStructure(value[0], `${path}[0]`))
      }
    } else if (typeof value === 'object') {
      fields.push(...getStructure(value, path))
    } else {
      fields.push(`${path}: ${typeof value}`)
    }
  }
  return fields
}

// Compare structures
function compareStructures(v1Data: any, v2Data: any): { differences: string[]; match: boolean } {
  const v1Structure = getStructure(v1Data)
  const v2Structure = getStructure(v2Data)

  const v1Set = new Set(v1Structure)
  const v2Set = new Set(v2Structure)

  const differences: string[] = []

  // Fields in V1 but not V2
  v1Structure.forEach(field => {
    if (!v2Set.has(field)) {
      differences.push(`V1 has: ${field}`)
    }
  })

  // Fields in V2 but not V1
  v2Structure.forEach(field => {
    if (!v1Set.has(field)) {
      differences.push(`V2 has: ${field}`)
    }
  })

  return {
    differences,
    match: differences.length === 0,
  }
}

// Test endpoints to compare
const ENDPOINTS_TO_TEST = [
  {
    name: 'Transactions All',
    v1_url: `${V1_BASE}/${V1_API_GROUPS.TRANSACTIONS_V2}/transactions/all?user_id=${TEST_USER.user_id}`,
    v2_url: `${V2_BASE}/${V2_API_GROUP}/transactions/all?user_id=${TEST_USER.user_id}`,
    method: 'GET',
  },
  {
    name: 'Listings All',
    v1_url: `${V1_BASE}/${V1_API_GROUPS.TRANSACTIONS_V2}/listings/all?user_id=${TEST_USER.user_id}`,
    v2_url: `${V2_BASE}/${V2_API_GROUP}/listings/all?user_id=${TEST_USER.user_id}`,
    method: 'GET',
  },
  {
    name: 'Network All',
    v1_url: `${V1_BASE}/${V1_API_GROUPS.TRANSACTIONS_V2}/network/all?user_id=${TEST_USER.user_id}`,
    v2_url: `${V2_BASE}/${V2_API_GROUP}/network/all?user_id=${TEST_USER.user_id}`,
    method: 'GET',
  },
  {
    name: 'Revenue All',
    v1_url: `${V1_BASE}/${V1_API_GROUPS.TRANSACTIONS_V2}/revenue/all?user_id=${TEST_USER.user_id}`,
    v2_url: `${V2_BASE}/${V2_API_GROUP}/revenue/all?user_id=${TEST_USER.user_id}`,
    method: 'GET',
  },
  {
    name: 'Team Management Roster',
    v1_url: `${V1_BASE}/${V1_API_GROUPS.TRANSACTIONS_V2}/team_management/roster?team_id=1`,
    v2_url: `${V2_BASE}/${V2_API_GROUP}/team_management/roster?team_id=1`,
    method: 'GET',
  },
  {
    name: 'Dashboard Sections',
    v1_url: `${V1_BASE}/${V1_API_GROUPS.MAIN_V1_0}/dashboard_sections`,
    v2_url: `${V2_BASE}/${V2_API_GROUP}/dashboard_sections`,
    method: 'GET',
  },
  {
    name: 'Chart Catalog',
    v1_url: `${V1_BASE}/${V1_API_GROUPS.MAIN_V1_0}/chart_catalog`,
    v2_url: `${V2_BASE}/${V2_API_GROUP}/chart_catalog`,
    method: 'GET',
  },
  {
    name: 'Contributions',
    v1_url: `${V1_BASE}/${V1_API_GROUPS.TRANSACTIONS_V2}/contributions?user_id=${TEST_USER.user_id}`,
    v2_url: `${V2_BASE}/${V2_API_GROUP}/contributions?user_id=${TEST_USER.user_id}`,
    method: 'GET',
  },
  {
    name: 'Network Counts',
    v1_url: `${V1_BASE}/${V1_API_GROUPS.TRANSACTIONS_V2}/network/counts?user_id=${TEST_USER.user_id}`,
    v2_url: `${V2_BASE}/${V2_API_GROUP}/network/counts?user_id=${TEST_USER.user_id}`,
    method: 'GET',
  },
  {
    name: 'Contact Log',
    v1_url: `${V1_BASE}/${V1_API_GROUPS.TRANSACTIONS_V2}/contact_log`,
    v2_url: `${V2_BASE}/${V2_API_GROUP}/contact_log`,
    method: 'GET',
  },
]

async function compareEndpoint(
  endpoint: typeof ENDPOINTS_TO_TEST[0],
  v1Token: string,
  v2Token: string
): Promise<ComparisonResult> {
  console.log(`\n🔍 Testing: ${endpoint.name}`)

  try {
    // Fetch V1
    console.log(`  📥 Fetching V1...`)
    const v1Response = await axios.get(endpoint.v1_url, {
      headers: { Authorization: `Bearer ${v1Token}` },
      timeout: 30000,
    })
    const v1Data = v1Response.data
    console.log(`  ✅ V1 returned ${JSON.stringify(v1Data).length} chars`)

    // Fetch V2
    console.log(`  📥 Fetching V2...`)
    const v2Response = await axios.get(endpoint.v2_url, {
      headers: { Authorization: `Bearer ${v2Token}` },
      timeout: 30000,
    })
    const v2Data = v2Response.data
    console.log(`  ✅ V2 returned ${JSON.stringify(v2Data).length} chars`)

    // Compare structures
    const v1Structure = getStructure(v1Data)
    const v2Structure = getStructure(v2Data)
    const comparison = compareStructures(v1Data, v2Data)

    return {
      endpoint: endpoint.name,
      match: comparison.match,
      v1_structure: v1Structure,
      v2_structure: v2Structure,
      differences: comparison.differences,
      v1_sample: v1Data,
      v2_sample: v2Data,
    }
  } catch (error: any) {
    console.error(`  ❌ Error:`, error.message)
    return {
      endpoint: endpoint.name,
      match: false,
      v1_structure: [],
      v2_structure: [],
      differences: [`Error: ${error.message}`],
    }
  }
}

async function main() {
  console.log('🚀 Starting V1 vs V2 Response Structure Comparison\n')

  // Get auth tokens
  console.log('🔐 Getting auth tokens...')
  let v1Token: string
  let v2Token: string

  try {
    v1Token = await getV1AuthToken()
    console.log(`✅ V1 token: ${v1Token.substring(0, 20)}...`)
  } catch (error) {
    console.error('❌ Failed to get V1 token')
    process.exit(1)
  }

  try {
    v2Token = await getV2AuthToken()
    console.log(`✅ V2 token: ${v2Token.substring(0, 20)}...`)
  } catch (error) {
    console.error('❌ Failed to get V2 token')
    process.exit(1)
  }

  // Compare all endpoints
  const results: ComparisonResult[] = []

  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await compareEndpoint(endpoint, v1Token, v2Token)
    results.push(result)

    if (result.match) {
      console.log(`  ✅ MATCH - Structures are identical`)
    } else {
      console.log(`  ❌ MISMATCH - ${result.differences.length} differences found`)
    }
  }

  // Generate report
  console.log('\n' + '='.repeat(80))
  console.log('📊 COMPARISON REPORT')
  console.log('='.repeat(80) + '\n')

  const matches = results.filter(r => r.match).length
  const mismatches = results.filter(r => !r.match).length

  console.log(`✅ Matches: ${matches}/${results.length}`)
  console.log(`❌ Mismatches: ${mismatches}/${results.length}`)
  console.log(`📈 Compatibility: ${Math.round((matches / results.length) * 100)}%\n`)

  if (mismatches > 0) {
    console.log('='.repeat(80))
    console.log('❌ MISMATCHES DETAILS')
    console.log('='.repeat(80) + '\n')

    results.filter(r => !r.match).forEach(result => {
      console.log(`\n🔴 ${result.endpoint}`)
      console.log(`   Differences (${result.differences.length}):`)
      result.differences.slice(0, 20).forEach(diff => {
        console.log(`   - ${diff}`)
      })
      if (result.differences.length > 20) {
        console.log(`   ... and ${result.differences.length - 20} more`)
      }
    })
  }

  // Save detailed results
  const outputPath = resolve(__dirname, '../RESPONSE_STRUCTURE_COMPARISON.json')
  writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`\n💾 Detailed results saved to: ${outputPath}`)

  // Exit with appropriate code
  process.exit(mismatches > 0 ? 1 : 0)
}

main()
