/**
 * V2 Onboarding Flow Validation
 *
 * Tests the complete user onboarding flow end-to-end:
 * 1. Team Data (roster sync)
 * 2. Agent Data (profile sync)
 * 3. Transactions (sync from reZEN)
 * 4. Listings (sync from reZEN)
 * 5. Contributions (process contributions)
 * 6. Network (downline sync)
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
    workers: 'api:4UsTtl3m',
    system: 'api:LIdBL1AN',
  },
  test_user: { id: 7, name: 'David Keener', agent_id: 37208, team_id: 1 },
}

// Onboarding step definitions with CORRECT endpoint names
const ONBOARDING_STEPS = [
  {
    step: 1,
    name: 'Team Data',
    endpoint: '/test-rezen-team-roster-sync',
    tables: ['team', 'team_roster', 'team_owners', 'team_admins'],
    description: 'Sync team roster data from reZEN API',
  },
  {
    step: 2,
    name: 'Agent Data',
    endpoint: '/test-function-8051-agent-data',
    tables: ['agent', 'user'],
    description: 'Get agent profile data from reZEN',
  },
  {
    step: 3,
    name: 'Transactions',
    endpoint: '/test-function-8052-txn-sync',
    tables: ['transaction', 'participant', 'paid_participant'],
    description: 'Sync transactions for user from reZEN API',
  },
  {
    step: 4,
    name: 'Listings',
    endpoint: '/test-function-8053-listings-sync',
    tables: ['listing'],
    description: 'Sync listings for user from reZEN',
  },
  {
    step: 5,
    name: 'Contributions',
    endpoint: '/test-function-8056-contributions',
    tables: ['contribution', 'income', 'revshare_totals', 'contributors'],
    description: 'Process contributions for user',
  },
  {
    step: 6,
    name: 'Network',
    endpoint: '/test-function-8062-network-downline',
    tables: ['network', 'connections'],
    description: 'Sync network downline for user',
  },
]

interface StepResult {
  step: number
  name: string
  endpoint: string
  success: boolean
  skipped: boolean
  response: any
  error?: string
  duration_ms: number
  timestamp: string
}

interface OnboardingReport {
  summary: {
    total_steps: number
    passed: number
    failed: number
    skipped: number
    duration_ms: number
  }
  test_user: typeof V2_CONFIG.test_user
  steps: StepResult[]
  table_counts: Record<string, number> | null
}

/**
 * Execute curl request to Workers endpoint
 */
async function callWorkerEndpoint(
  endpoint: string,
  userId: number
): Promise<{ response: any; duration: number }> {
  const url = `${V2_CONFIG.base_url}/${V2_CONFIG.api_groups.workers}${endpoint}`
  const startTime = Date.now()

  const curlCommand = `curl -s -X POST "${url}" -H "Content-Type: application/json" -d '{"user_id": ${userId}}'`

  const { stdout } = await execAsync(curlCommand, { maxBuffer: 5 * 1024 * 1024 })
  const duration = Date.now() - startTime

  try {
    const response = JSON.parse(stdout)
    return { response, duration }
  } catch {
    return { response: { raw: stdout }, duration }
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
    }
  } catch {
    return {}
  }
}

/**
 * Determine if step passed, failed, or was skipped
 */
function evaluateStepResult(response: any): { success: boolean; skipped: boolean; error?: string } {
  // Check for explicit success flag
  if (response.success === true) {
    return { success: true, skipped: false }
  }

  // Check for skipped flag (common in V2 FP pattern)
  if (response.skipped === true) {
    return { success: true, skipped: true, error: response.error || 'Skipped (no data to process)' }
  }

  // Check for error
  if (response.success === false || response.error) {
    return { success: false, skipped: false, error: response.error || 'Unknown error' }
  }

  // Check for Xano error codes
  if (response.code && response.code.startsWith('ERROR_')) {
    return { success: false, skipped: false, error: `${response.code}: ${response.message}` }
  }

  // Default to success if no clear failure
  return { success: true, skipped: false }
}

/**
 * Run all onboarding steps
 */
async function runOnboardingFlow(): Promise<OnboardingReport> {
  const startTime = Date.now()
  const results: StepResult[] = []

  console.log('='.repeat(80))
  console.log('V2 ONBOARDING FLOW TEST')
  console.log('='.repeat(80))
  console.log(`\nTest User: ${V2_CONFIG.test_user.name} (ID: ${V2_CONFIG.test_user.id})`)
  console.log(`Agent ID: ${V2_CONFIG.test_user.agent_id}`)
  console.log(`Team ID: ${V2_CONFIG.test_user.team_id}`)
  console.log('')

  // Get initial table counts
  console.log('Fetching table counts...')
  let tableCounts: Record<string, number> | null = null
  try {
    tableCounts = await getTableCounts()
    console.log(
      `Core tables: agent=${tableCounts.agent || 0}, listing=${tableCounts.listing || 0}, transaction=${tableCounts.transaction || 0}`
    )
  } catch (e: any) {
    console.log(`Failed to get table counts: ${e.message}`)
  }
  console.log('')

  // Run each step
  for (const step of ONBOARDING_STEPS) {
    console.log(`Step ${step.step}: ${step.name}`)
    console.log(`  Endpoint: ${step.endpoint}`)
    console.log(`  Tables: ${step.tables.join(', ')}`)

    try {
      const { response, duration } = await callWorkerEndpoint(step.endpoint, V2_CONFIG.test_user.id)
      const evaluation = evaluateStepResult(response)

      const result: StepResult = {
        step: step.step,
        name: step.name,
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
      if (response.data) {
        console.log(`  Data: ${JSON.stringify(response.data).substring(0, 100)}...`)
      }
    } catch (e: any) {
      const result: StepResult = {
        step: step.step,
        name: step.name,
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

    console.log('')
  }

  // Calculate summary
  const passed = results.filter((r) => r.success && !r.skipped).length
  const skipped = results.filter((r) => r.skipped).length
  const failed = results.filter((r) => !r.success && !r.skipped).length
  const totalDuration = Date.now() - startTime

  const report: OnboardingReport = {
    summary: {
      total_steps: ONBOARDING_STEPS.length,
      passed,
      failed,
      skipped,
      duration_ms: totalDuration,
    },
    test_user: V2_CONFIG.test_user,
    steps: results,
    table_counts: tableCounts,
  }

  // Print summary
  console.log('='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total Steps: ${ONBOARDING_STEPS.length}`)
  console.log(`  PASS: ${passed}`)
  console.log(`  FAIL: ${failed}`)
  console.log(`  SKIP: ${skipped}`)
  console.log(`Duration: ${(totalDuration / 1000).toFixed(2)}s`)

  // Acceptance criteria check
  console.log('')
  console.log('ACCEPTANCE CRITERIA:')
  console.log(
    `  [${passed + skipped === ONBOARDING_STEPS.length ? 'X' : ' '}] All steps return success or skip`
  )
  console.log(`  [${failed === 0 ? 'X' : ' '}] No hard failures`)
  console.log(`  [${totalDuration < 30000 ? 'X' : ' '}] Flow completes in < 30 seconds`)

  return report
}

/**
 * Save report to file
 */
async function saveReport(report: OnboardingReport): Promise<string> {
  const reportsDir = path.join(process.cwd(), 'validation-reports')
  await fs.mkdir(reportsDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `onboarding-flow-${timestamp}.json`
  const filepath = path.join(reportsDir, filename)

  await fs.writeFile(filepath, JSON.stringify(report, null, 2))
  console.log(`\nReport saved to: ${filepath}`)

  return filepath
}

// Main execution
async function main() {
  try {
    const report = await runOnboardingFlow()
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
