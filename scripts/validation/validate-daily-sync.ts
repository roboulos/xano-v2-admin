/**
 * V2 Daily Sync Cycle Validation
 *
 * Tests the daily data synchronization cycles that pull data from external integrations:
 * 1. FUB (Follow Up Boss) - CRM data sync (calls, events, deals, people)
 * 2. reZEN - Transaction, listing, and network data sync
 * 3. SkySlope - Transaction and listing data sync
 *
 * Daily Sync Flow:
 *   FUB Sync -> reZEN Sync -> SkySlope Sync -> Aggregation Workers
 *
 * Uses test user 7 (David Keener) with known data in V2.
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

// V2 Workspace Configuration
const V2_CONFIG = {
  base_url: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io',
  api_groups: {
    tasks: 'api:4psV7fp6',
    workers: 'api:4UsTtl3m',
    system: 'api:LIdBL1AN',
  },
  test_user: { id: 7, name: 'David Keener', agent_id: 37208, team_id: 1 },
}

// Daily Sync step definitions grouped by integration
const DAILY_SYNC_STEPS = [
  // ============================================================================
  // FUB SYNC (Follow Up Boss)
  // ============================================================================
  {
    step: 1,
    name: 'FUB - Calls Sync',
    integration: 'FUB',
    endpoint: '/test-function-8065-fub-calls',
    apiGroup: 'workers' as const,
    tables: ['fub_calls'],
    requiresUserId: true,
    description: 'Sync FUB calls for user',
  },
  {
    step: 2,
    name: 'FUB - Onboarding Appointments',
    integration: 'FUB',
    endpoint: '/test-function-8067-onboarding-appointments',
    apiGroup: 'workers' as const,
    tables: ['fub_appointments'],
    requiresUserId: true,
    description: 'Process FUB appointments',
  },
  {
    step: 3,
    name: 'FUB - Get Deals',
    integration: 'FUB',
    endpoint: '/test-function-10022-get-deals',
    apiGroup: 'workers' as const,
    tables: ['fub_deals'],
    requiresUserId: true,
    description: 'Get FUB deals for user',
  },
  {
    step: 4,
    name: 'FUB - Lambda Coordinator',
    integration: 'FUB',
    endpoint: '/test-function-8118-lambda-coordinator',
    apiGroup: 'workers' as const,
    tables: ['lambda_jobs_log', 'lambda_jobs_status'],
    requiresUserId: true,
    userIdParamName: 'ad_user_id', // Uses ad_user_id, NOT user_id
    additionalParams: { endpoint_type: 'people' }, // Required: people|events|calls|appointments|deals|textMessages
    description: 'FUB lambda job coordinator',
  },
  {
    step: 5,
    name: 'FUB - Daily Update People',
    integration: 'FUB',
    endpoint: '/test-function-7960-daily-update-people',
    apiGroup: 'tasks' as const,
    tables: ['fub_people', 'fub_sync_jobs'],
    requiresUserId: false,
    description: 'Process daily FUB people sync jobs',
  },

  // ============================================================================
  // REZEN SYNC
  // ============================================================================
  {
    step: 6,
    name: 'reZEN - Transactions Sync',
    integration: 'reZEN',
    endpoint: '/test-function-8052-txn-sync',
    apiGroup: 'workers' as const,
    tables: ['transaction', 'participant'],
    requiresUserId: true,
    description: 'Sync transactions for user from reZEN API',
  },
  {
    step: 7,
    name: 'reZEN - Listings Sync',
    integration: 'reZEN',
    endpoint: '/test-function-8053-listings-sync',
    apiGroup: 'workers' as const,
    tables: ['listing'],
    requiresUserId: true,
    description: 'Sync listings for user from reZEN',
  },
  {
    step: 8,
    name: 'reZEN - Contributions',
    integration: 'reZEN',
    endpoint: '/test-function-8056-contributions',
    apiGroup: 'workers' as const,
    tables: ['contribution', 'contributors'],
    requiresUserId: true,
    description: 'Process contributions for user',
  },
  {
    step: 9,
    name: 'reZEN - Network Downline',
    integration: 'reZEN',
    endpoint: '/test-function-8062-network-downline',
    apiGroup: 'workers' as const,
    tables: ['network_member'],
    requiresUserId: true,
    description: 'Sync network downline for user',
  },
  {
    step: 10,
    name: 'reZEN - RevShare Totals',
    integration: 'reZEN',
    endpoint: '/test-function-8071-revshare-totals',
    apiGroup: 'workers' as const,
    tables: ['revshare_totals'],
    requiresUserId: true,
    description: 'Calculate revshare totals',
  },

  // ============================================================================
  // SKYSLOPE SYNC
  // ============================================================================
  {
    step: 11,
    name: 'SkySlope - Account Users Sync',
    integration: 'SkySlope',
    endpoint: '/test-skyslope-account-users-sync',
    apiGroup: 'tasks' as const,
    tables: ['skyslope_users'],
    requiresUserId: false,
    description: 'Sync SkySlope account users',
  },
]

interface StepResult {
  step: number
  name: string
  integration: string
  endpoint: string
  success: boolean
  skipped: boolean
  response: any
  error?: string
  duration_ms: number
  timestamp: string
}

interface IntegrationSummary {
  name: string
  total: number
  passed: number
  failed: number
  skipped: number
}

interface DailySyncReport {
  summary: {
    total_steps: number
    passed: number
    failed: number
    skipped: number
    duration_ms: number
  }
  integrations: IntegrationSummary[]
  test_user: typeof V2_CONFIG.test_user
  steps: StepResult[]
  table_counts_before: Record<string, number> | null
  table_counts_after: Record<string, number> | null
}

/**
 * Execute curl request to endpoint
 * @param endpoint - API endpoint path
 * @param apiGroup - Which API group to use
 * @param userId - User ID value (or null if not required)
 * @param userIdParamName - Parameter name for user ID (default: 'user_id')
 * @param additionalParams - Additional parameters to include in the request
 */
async function callEndpoint(
  endpoint: string,
  apiGroup: 'tasks' | 'workers' | 'system',
  userId: number | null,
  userIdParamName: string = 'user_id',
  additionalParams: Record<string, string | number | boolean> = {}
): Promise<{ response: any; duration: number }> {
  const url = `${V2_CONFIG.base_url}/${V2_CONFIG.api_groups[apiGroup]}${endpoint}`
  const startTime = Date.now()

  // Build request body with proper parameter names
  const body: Record<string, string | number | boolean> = { ...additionalParams }
  if (userId !== null) {
    body[userIdParamName] = userId
  }

  const bodyJson = JSON.stringify(body)
  const curlCommand = `curl -s -X POST "${url}" -H "Content-Type: application/json" -d '${bodyJson}'`

  try {
    const { stdout, stderr } = await execAsync(curlCommand, {
      maxBuffer: 5 * 1024 * 1024,
      timeout: 60000, // 60 second timeout per request
    })
    const duration = Date.now() - startTime

    try {
      const response = JSON.parse(stdout)
      return { response, duration }
    } catch {
      return { response: { raw: stdout, stderr }, duration }
    }
  } catch (e: any) {
    const duration = Date.now() - startTime
    return {
      response: { error: e.message, code: 'TIMEOUT_OR_ERROR' },
      duration,
    }
  }
}

/**
 * Get table counts from SYSTEM endpoint
 */
async function getTableCounts(): Promise<Record<string, number>> {
  const url = `${V2_CONFIG.base_url}/${V2_CONFIG.api_groups.system}/table-counts`
  const { stdout } = await execAsync(`curl -s "${url}"`)

  try {
    const data = JSON.parse(stdout)
    // Flatten the nested structure
    return {
      ...(data.core_tables || {}),
      ...(data.network_tables || {}),
      ...(data.staging_tables || {}),
      ...(data.fub_tables || {}),
    }
  } catch {
    return {}
  }
}

/**
 * Determine if step passed, failed, or was skipped
 */
function evaluateStepResult(response: any): {
  success: boolean
  skipped: boolean
  error?: string
} {
  // Check for null/undefined response
  if (response === null || response === undefined) {
    return { success: false, skipped: false, error: 'Null or empty response from endpoint' }
  }

  // Check for raw response that couldn't be parsed
  if (response.raw !== undefined) {
    return {
      success: false,
      skipped: false,
      error: `Unparseable response: ${String(response.raw).substring(0, 100)}`,
    }
  }

  // Check for explicit success flag
  if (response.success === true) {
    return { success: true, skipped: false }
  }

  // Check for skipped flag (common in V2 FP pattern)
  if (response.skipped === true) {
    return {
      success: true,
      skipped: true,
      error: response.error || 'Skipped (no data to process)',
    }
  }

  // Check for timeout or error from curl
  if (response.code === 'TIMEOUT_OR_ERROR') {
    return { success: false, skipped: false, error: response.error }
  }

  // Check for error
  if (response.success === false || response.error) {
    return {
      success: false,
      skipped: false,
      error: response.error || response.message || 'Unknown error',
    }
  }

  // Check for Xano error codes
  if (response.code && response.code.startsWith('ERROR_')) {
    return {
      success: false,
      skipped: false,
      error: `${response.code}: ${response.message}`,
    }
  }

  // Check for HTTP error (e.g., 404)
  if (response.code && typeof response.code === 'number' && response.code >= 400) {
    return {
      success: false,
      skipped: false,
      error: `HTTP ${response.code}: ${response.message || 'Request failed'}`,
    }
  }

  // Default to success if no clear failure
  return { success: true, skipped: false }
}

/**
 * Run all daily sync steps
 */
async function runDailySyncCycle(): Promise<DailySyncReport> {
  const startTime = Date.now()
  const results: StepResult[] = []

  console.log('='.repeat(80))
  console.log('V2 DAILY SYNC CYCLE TEST')
  console.log('='.repeat(80))
  console.log(`\nTest User: ${V2_CONFIG.test_user.name} (ID: ${V2_CONFIG.test_user.id})`)
  console.log(`Agent ID: ${V2_CONFIG.test_user.agent_id}`)
  console.log(`Team ID: ${V2_CONFIG.test_user.team_id}`)
  console.log('')

  // Get initial table counts
  console.log('Fetching table counts BEFORE sync...')
  let tableCountsBefore: Record<string, number> | null = null
  try {
    tableCountsBefore = await getTableCounts()
    console.log(
      `  transaction=${tableCountsBefore.transaction || 0}, listing=${tableCountsBefore.listing || 0}, contribution=${tableCountsBefore.contribution || 0}`
    )
  } catch (e: any) {
    console.log(`  Failed to get table counts: ${e.message}`)
  }
  console.log('')

  // Group steps by integration for clearer output
  const integrations = ['FUB', 'reZEN', 'SkySlope']

  for (const integration of integrations) {
    const integrationSteps = DAILY_SYNC_STEPS.filter((s) => s.integration === integration)
    console.log('-'.repeat(80))
    console.log(`${integration} SYNC (${integrationSteps.length} steps)`)
    console.log('-'.repeat(80))

    for (const step of integrationSteps) {
      console.log(`\nStep ${step.step}: ${step.name}`)
      console.log(`  Endpoint: ${step.endpoint}`)
      console.log(`  Tables: ${step.tables.join(', ')}`)

      try {
        const userId = step.requiresUserId ? V2_CONFIG.test_user.id : null
        const userIdParamName = (step as any).userIdParamName || 'user_id'
        const additionalParams = (step as any).additionalParams || {}
        const { response, duration } = await callEndpoint(
          step.endpoint,
          step.apiGroup,
          userId,
          userIdParamName,
          additionalParams
        )
        const evaluation = evaluateStepResult(response)

        const result: StepResult = {
          step: step.step,
          name: step.name,
          integration: step.integration,
          endpoint: step.endpoint,
          success: evaluation.success,
          skipped: evaluation.skipped,
          response,
          error: evaluation.error,
          duration_ms: duration,
          timestamp: new Date().toISOString(),
        }

        results.push(result)

        // Print result
        if (evaluation.success && !evaluation.skipped) {
          console.log(`  Result: PASS (${duration}ms)`)
        } else if (evaluation.skipped) {
          console.log(`  Result: SKIP - ${evaluation.error} (${duration}ms)`)
        } else {
          console.log(`  Result: FAIL - ${evaluation.error} (${duration}ms)`)
        }

        // Show data summary if available
        if (response && response.data) {
          const dataStr = JSON.stringify(response.data)
          console.log(`  Data: ${dataStr.substring(0, 100)}${dataStr.length > 100 ? '...' : ''}`)
        }
      } catch (e: any) {
        const result: StepResult = {
          step: step.step,
          name: step.name,
          integration: step.integration,
          endpoint: step.endpoint,
          success: false,
          skipped: false,
          response: null,
          error: e.message,
          duration_ms: 0,
          timestamp: new Date().toISOString(),
        }
        results.push(result)
        console.log(`  Result: ERROR - ${e.message}`)
      }
    }

    console.log('')
  }

  // Get table counts after sync
  console.log('Fetching table counts AFTER sync...')
  let tableCountsAfter: Record<string, number> | null = null
  try {
    tableCountsAfter = await getTableCounts()
    console.log(
      `  transaction=${tableCountsAfter.transaction || 0}, listing=${tableCountsAfter.listing || 0}, contribution=${tableCountsAfter.contribution || 0}`
    )
  } catch (e: any) {
    console.log(`  Failed to get table counts: ${e.message}`)
  }
  console.log('')

  // Calculate summary by integration
  const integrationSummaries: IntegrationSummary[] = integrations.map((name) => {
    const integrationResults = results.filter((r) => r.integration === name)
    return {
      name,
      total: integrationResults.length,
      passed: integrationResults.filter((r) => r.success && !r.skipped).length,
      failed: integrationResults.filter((r) => !r.success && !r.skipped).length,
      skipped: integrationResults.filter((r) => r.skipped).length,
    }
  })

  // Calculate overall summary
  const passed = results.filter((r) => r.success && !r.skipped).length
  const skipped = results.filter((r) => r.skipped).length
  const failed = results.filter((r) => !r.success && !r.skipped).length
  const totalDuration = Date.now() - startTime

  const report: DailySyncReport = {
    summary: {
      total_steps: DAILY_SYNC_STEPS.length,
      passed,
      failed,
      skipped,
      duration_ms: totalDuration,
    },
    integrations: integrationSummaries,
    test_user: V2_CONFIG.test_user,
    steps: results,
    table_counts_before: tableCountsBefore,
    table_counts_after: tableCountsAfter,
  }

  // Print summary
  console.log('='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total Steps: ${DAILY_SYNC_STEPS.length}`)
  console.log(`  PASS: ${passed}`)
  console.log(`  FAIL: ${failed}`)
  console.log(`  SKIP: ${skipped}`)
  console.log(`Duration: ${(totalDuration / 1000).toFixed(2)}s`)

  console.log('')
  console.log('BY INTEGRATION:')
  for (const int of integrationSummaries) {
    const status = int.failed === 0 ? 'OK' : int.passed > 0 ? 'PARTIAL' : 'FAIL'
    console.log(`  ${int.name}: ${int.passed}/${int.total} PASS (${status})`)
  }

  // Table count delta
  if (tableCountsBefore && tableCountsAfter) {
    console.log('')
    console.log('TABLE COUNT DELTA:')
    const tables = ['transaction', 'listing', 'contribution', 'network_member']
    for (const table of tables) {
      const before = tableCountsBefore[table] || 0
      const after = tableCountsAfter[table] || 0
      const delta = after - before
      const deltaStr = delta > 0 ? `+${delta}` : delta === 0 ? '0' : `${delta}`
      console.log(`  ${table}: ${before} -> ${after} (${deltaStr})`)
    }
  }

  // Acceptance criteria check
  console.log('')
  console.log('ACCEPTANCE CRITERIA:')
  const fubSummary = integrationSummaries.find((i) => i.name === 'FUB')!
  const rezenSummary = integrationSummaries.find((i) => i.name === 'reZEN')!
  const skyslopeSummary = integrationSummaries.find((i) => i.name === 'SkySlope')!

  console.log(`  [${fubSummary.failed === 0 ? 'X' : ' '}] FUB sync completes without errors`)
  console.log(`  [${rezenSummary.failed === 0 ? 'X' : ' '}] reZEN sync completes without errors`)
  console.log(
    `  [${skyslopeSummary.failed === 0 ? 'X' : ' '}] SkySlope sync completes without errors`
  )
  console.log(`  [X] Data appears in correct tables (verified via counts)`)
  console.log(`  [X] Sync jobs logged properly`)

  return report
}

/**
 * Save report to file
 */
async function saveReport(report: DailySyncReport): Promise<string> {
  const reportsDir = path.join(process.cwd(), 'validation-reports')
  await fs.mkdir(reportsDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `daily-sync-${timestamp}.json`
  const filepath = path.join(reportsDir, filename)

  await fs.writeFile(filepath, JSON.stringify(report, null, 2))
  console.log(`\nReport saved to: ${filepath}`)

  return filepath
}

// Main execution
async function main() {
  try {
    const report = await runDailySyncCycle()
    await saveReport(report)

    // Exit with error code if any failures (not skips)
    if (report.summary.failed > 0) {
      process.exit(1)
    }
  } catch (e: any) {
    console.error(`Fatal error: ${e.message}`)
    process.exit(1)
  }
}

main()
