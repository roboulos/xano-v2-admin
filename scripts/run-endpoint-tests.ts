#!/usr/bin/env tsx
/**
 * CLI Endpoint Test Runner
 *
 * Runs all 174 endpoints and shows failures immediately.
 * Use this to systematically close gaps in MINUTES.
 *
 * Setup:
 *   1. Copy .env.test.local.example to .env.test.local
 *   2. Set TEST_USER_PASSWORD in .env.test.local
 *   3. Run: npm run test:endpoints
 */

import 'dotenv/config'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import axios from 'axios'

const OPENAPI_SPEC_PATH = resolve(__dirname, '../lib/frontend-api-v2-openapi.json')
const BASE_URL = process.env.V2_BASE_URL
  ? `${process.env.V2_BASE_URL}/api:pe1wjL5I`
  : 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I'
const AUTH_URL = process.env.V2_BASE_URL
  ? `${process.env.V2_BASE_URL}/api:i6a062_x/auth/test-login`
  : 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x/auth/test-login'

// Test user credentials from environment variables
const TEST_USER = {
  id: parseInt(process.env.TEST_USER_ID || '7', 10),
  email: process.env.TEST_USER_EMAIL || 'dave@premieregrp.com',
  password: process.env.TEST_USER_PASSWORD || '',
  agent_id: parseInt(process.env.TEST_AGENT_ID || '37208', 10),
  team_id: parseInt(process.env.TEST_TEAM_ID || '1', 10),
}

// Validate required environment variables
if (!TEST_USER.password) {
  console.error('\n❌ ERROR: TEST_USER_PASSWORD not set in environment\n')
  console.error('Setup instructions:')
  console.error('  1. Copy .env.test.local.example to .env.test.local')
  console.error('  2. Set TEST_USER_PASSWORD in .env.test.local')
  console.error('  3. Run: npm run test:endpoints\n')
  process.exit(1)
}

let AUTH_TOKEN: string | null = null

interface TestResult {
  endpoint: string
  method: string
  status: 'pass' | 'fail'
  statusCode?: number
  responseTime: number
  error?: string
  recordCount?: number
}

async function getAuthToken(): Promise<string> {
  try {
    const response = await axios.post(AUTH_URL, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    })

    // Response format: { result: { data: { authToken: "..." } } }
    const token = response.data?.result?.data?.authToken
    if (token) {
      return token
    }
    throw new Error('Failed to get auth token from response')
  } catch (error: any) {
    throw new Error(`Auth failed: ${error.response?.data?.message || error.message}`)
  }
}

async function testEndpoint(path: string, method: string): Promise<TestResult> {
  const startTime = Date.now()

  try {
    const config: any = {
      url: `${BASE_URL}${path}`,
      method,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
      },
    }

    // Add test params
    if (method === 'GET') {
      config.params = { user_id: TEST_USER.id }
    } else {
      config.data = { user_id: TEST_USER.id }
    }

    const response = await axios(config)
    const responseTime = Date.now() - startTime

    let recordCount: number | undefined
    if (Array.isArray(response.data)) {
      recordCount = response.data.length
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      recordCount = response.data.data.length
    }

    return {
      endpoint: path,
      method,
      status: 'pass',
      statusCode: response.status,
      responseTime,
      recordCount,
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    return {
      endpoint: path,
      method,
      status: 'fail',
      statusCode: error.response?.status,
      responseTime,
      error: error.response?.data?.message || error.message || String(error),
    }
  }
}

async function main() {
  console.log('🧪 Running Endpoint Test Matrix...\n')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Test User: ${TEST_USER.id} (David Keener)`)

  // Get auth token first
  console.log('🔐 Getting auth token...')
  try {
    AUTH_TOKEN = await getAuthToken()
    console.log(`✅ Auth token obtained: ${AUTH_TOKEN.substring(0, 20)}...`)
  } catch (error: any) {
    console.error(`❌ Failed to get auth token: ${error.message}`)
    console.error('Cannot proceed without authentication.')
    process.exit(1)
  }

  console.log('')

  // Load OpenAPI spec
  const spec = JSON.parse(readFileSync(OPENAPI_SPEC_PATH, 'utf-8'))

  // Extract endpoints
  const endpoints: Array<{ path: string; method: string }> = []
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const method of Object.keys(methods as any)) {
      endpoints.push({ path, method: method.toUpperCase() })
    }
  }

  console.log(`📊 Testing ${endpoints.length} endpoints...\n`)

  const results: TestResult[] = []
  let current = 0

  for (const { path, method } of endpoints) {
    current++
    process.stdout.write(
      `\r[${current}/${endpoints.length}] Testing ${method} ${path}...`.padEnd(100)
    )

    const result = await testEndpoint(path, method)
    results.push(result)
  }

  console.log('\n\n' + '='.repeat(80))
  console.log('📊 TEST RESULTS')
  console.log('='.repeat(80) + '\n')

  const passed = results.filter((r) => r.status === 'pass')
  const failed = results.filter((r) => r.status === 'fail')

  console.log(
    `✅ Passed: ${passed.length}/${results.length} (${Math.round((passed.length / results.length) * 100)}%)`
  )
  console.log(
    `❌ Failed: ${failed.length}/${results.length} (${Math.round((failed.length / results.length) * 100)}%)`
  )

  if (failed.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('❌ FAILURES (Fix these NOW)')
    console.log('='.repeat(80) + '\n')

    failed.forEach((result, idx) => {
      console.log(`${idx + 1}. ${result.method} ${result.endpoint}`)
      console.log(`   Status: ${result.statusCode || 'N/A'}`)
      console.log(`   Error: ${result.error}`)
      console.log(
        `   curl -X ${result.method} "${BASE_URL}${result.endpoint}" -d '{"user_id":${TEST_USER.id}}'`
      )
      console.log('')
    })
  }

  if (passed.length > 0 && failed.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 100% coverage achieved!')
  }

  console.log('='.repeat(80))
  console.log(`\n💡 Next Steps:`)
  console.log(`   1. Fix failures using xano-mcp tools`)
  console.log(`   2. Re-run: npm run test:endpoints`)
  console.log(`   3. Repeat until 100%\n`)

  process.exit(failed.length > 0 ? 1 : 0)
}

main()
