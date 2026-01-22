/**
 * Phase 1.3: Endpoint Integration Testing Script
 *
 * Tests all 801 V2 endpoints across 5 API groups:
 * - Frontend API v2 (200 endpoints)
 * - WORKERS (374 endpoints)
 * - TASKS (165 endpoints)
 * - SYSTEM (38 endpoints)
 * - SEEDING (24 endpoints)
 *
 * Tests include:
 * - HTTP status code (200 expected)
 * - Response time (< 2s expected)
 * - Response structure
 * - Error handling
 *
 * Usage:
 *   pnpm tsx scripts/validation/validate-endpoints.ts
 *   pnpm tsx scripts/validation/validate-endpoints.ts --api-group=frontend
 *   pnpm tsx scripts/validation/validate-endpoints.ts --endpoint=/roster
 */

import {
  validateEndpoint,
  generateReport,
  saveReport,
  printResults,
  ValidationResult,
  xanoMCP,
  V2_CONFIG,
} from './utils'

interface Endpoint {
  path: string
  method: string
  api_group: string
  name?: string
  requires_auth?: boolean
}

/**
 * Fetch all endpoints from V2 workspace
 */
async function fetchAllEndpoints(): Promise<Endpoint[]> {
  console.log('📥 Fetching all endpoints from V2 workspace...')

  const allEndpoints: Endpoint[] = []

  // Fetch endpoints for each API group
  for (const [key, config] of Object.entries(V2_CONFIG.api_groups)) {
    console.log(`\n   Fetching ${config.name} endpoints...`)

    let page = 1
    const perPage = 50

    while (true) {
      try {
        const result = await xanoMCP('list_endpoints', {
          workspace_id: V2_CONFIG.workspace_id,
          api_group_id: config.id,
          page,
          per_page: perPage,
        })

        if (!result.endpoints || result.endpoints.length === 0) {
          break
        }

        // Map to our Endpoint interface
        const endpoints = result.endpoints.map((ep: any) => ({
          path: ep.path || ep.name,
          method: ep.method || 'POST',
          api_group: key,
          name: ep.name,
          requires_auth: ep.requires_auth || false,
        }))

        allEndpoints.push(...endpoints)
        console.log(`      Page ${page}: ${endpoints.length} endpoints`)

        if (result.endpoints.length < perPage) {
          break
        }

        page++
      } catch (error) {
        console.error(`      ❌ Failed to fetch page ${page}:`, error)
        break
      }
    }
  }

  console.log(`\n✅ Total endpoints fetched: ${allEndpoints.length}`)
  return allEndpoints
}

/**
 * Validate a batch of endpoints
 */
async function validateEndpointBatch(
  endpoints: Endpoint[],
  batchName: string
): Promise<ValidationResult[]> {
  console.log(`\n🔍 Validating ${batchName} (${endpoints.length} endpoints)...`)

  const results: ValidationResult[] = []
  let successCount = 0
  let errorCount = 0
  let slowCount = 0

  for (const endpoint of endpoints) {
    process.stdout.write(`   Testing ${endpoint.path}... `)

    const result = await validateEndpoint(endpoint.path, endpoint.method, endpoint.api_group)
    results.push(result)

    if (result.success) {
      successCount++
      const duration = result.metadata?.duration_ms || 0

      if (duration > 2000) {
        slowCount++
        console.log(`⚠️  SLOW (${duration}ms)`)
      } else {
        console.log(`✅ (${duration}ms)`)
      }
    } else {
      errorCount++
      console.log(`❌ ${result.error}`)
    }

    // Progress indicator every 25 endpoints
    if ((successCount + errorCount) % 25 === 0) {
      console.log(`\n   Progress: ${successCount + errorCount}/${endpoints.length}`)
      console.log(`   ✅ Passed: ${successCount} | ❌ Failed: ${errorCount} | ⚠️  Slow: ${slowCount}\n`)
    }
  }

  console.log(`\n   Final Results:`)
  console.log(`   ✅ Passed: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)
  console.log(`   ⚠️  Slow (>2s): ${slowCount}`)

  return results
}

/**
 * Validate all endpoints
 */
async function validateAllEndpoints(): Promise<void> {
  console.log('🚀 Starting V2 Endpoint Validation')
  console.log(`📊 Target: 801 endpoints across 5 API groups`)

  const allEndpoints = await fetchAllEndpoints()

  // Group by API group
  const byApiGroup: Record<string, Endpoint[]> = {}
  for (const endpoint of allEndpoints) {
    if (!byApiGroup[endpoint.api_group]) {
      byApiGroup[endpoint.api_group] = []
    }
    byApiGroup[endpoint.api_group].push(endpoint)
  }

  console.log('\n📊 Endpoint Distribution:')
  for (const [group, endpoints] of Object.entries(byApiGroup)) {
    console.log(`   ${group}: ${endpoints.length} endpoints`)
  }

  const allResults: ValidationResult[] = []

  // Test each API group
  for (const [group, endpoints] of Object.entries(byApiGroup)) {
    const groupConfig = V2_CONFIG.api_groups[group as keyof typeof V2_CONFIG.api_groups]
    const results = await validateEndpointBatch(endpoints, `${groupConfig.name} endpoints`)
    allResults.push(...results)
  }

  // Generate report
  const report = generateReport(allResults)
  printResults(report)

  // Additional performance analysis
  console.log('\n⚡ Performance Analysis:')
  const durations = allResults
    .filter(r => r.success && r.metadata?.duration_ms)
    .map(r => r.metadata!.duration_ms)
    .sort((a, b) => a - b)

  if (durations.length > 0) {
    const p50 = durations[Math.floor(durations.length * 0.5)]
    const p95 = durations[Math.floor(durations.length * 0.95)]
    const p99 = durations[Math.floor(durations.length * 0.99)]

    console.log(`   p50: ${p50}ms`)
    console.log(`   p95: ${p95}ms`)
    console.log(`   p99: ${p99}ms`)
    console.log(`   max: ${durations[durations.length - 1]}ms`)
  }

  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `endpoint-validation-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

/**
 * Validate endpoints by API group
 */
async function validateByApiGroup(apiGroup: string): Promise<void> {
  const groupConfig = V2_CONFIG.api_groups[apiGroup as keyof typeof V2_CONFIG.api_groups]

  if (!groupConfig) {
    console.error(`❌ Unknown API group: ${apiGroup}`)
    console.log(`Available groups: ${Object.keys(V2_CONFIG.api_groups).join(', ')}`)
    process.exit(1)
  }

  console.log(`🔍 Validating ${groupConfig.name} endpoints`)

  const allEndpoints = await fetchAllEndpoints()
  const endpoints = allEndpoints.filter(ep => ep.api_group === apiGroup)

  if (endpoints.length === 0) {
    console.error(`❌ No endpoints found for API group: ${apiGroup}`)
    process.exit(1)
  }

  const results = await validateEndpointBatch(endpoints, groupConfig.name)
  const report = generateReport(results)
  printResults(report)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `endpoint-validation-${apiGroup}-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

/**
 * Validate single endpoint
 */
async function validateSingleEndpoint(endpointPath: string): Promise<void> {
  console.log(`🔍 Validating endpoint: ${endpointPath}`)

  // Try to find the endpoint in all API groups
  const allEndpoints = await fetchAllEndpoints()
  const endpoint = allEndpoints.find(ep => ep.path === endpointPath)

  if (!endpoint) {
    console.error(`❌ Endpoint not found: ${endpointPath}`)
    console.log('\nSearching for similar endpoints...')

    const similar = allEndpoints
      .filter(ep => ep.path.includes(endpointPath) || endpointPath.includes(ep.path))
      .slice(0, 5)

    if (similar.length > 0) {
      console.log('\nDid you mean one of these?')
      similar.forEach(ep => console.log(`   - ${ep.path} (${ep.api_group})`))
    }

    process.exit(1)
  }

  const result = await validateEndpoint(endpoint.path, endpoint.method, endpoint.api_group)

  if (result.success) {
    console.log(`\n✅ Endpoint validation passed`)
    console.log(`   Status: ${result.metadata?.status_code}`)
    console.log(`   Duration: ${result.metadata?.duration_ms}ms`)
    console.log(`   Response size: ${result.metadata?.response_size} bytes`)
  } else {
    console.log(`\n❌ Endpoint validation failed`)
    console.log(`   Error: ${result.error}`)
  }

  const report = generateReport([result])
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const cleanPath = endpointPath.replace(/\//g, '-').replace(/^-/, '')
  await saveReport(report, `endpoint-validation-${cleanPath}-${timestamp}.json`)

  process.exit(result.success ? 0 : 1)
}

/**
 * Validate critical endpoints (high-priority production endpoints)
 */
async function validateCriticalEndpoints(): Promise<void> {
  console.log('🚨 Validating CRITICAL production endpoints')

  const criticalEndpoints = [
    // Frontend API v2 - High traffic
    { path: '/roster', api_group: 'frontend', name: 'Team Roster' },
    { path: '/transactions/all', api_group: 'frontend', name: 'Transactions List' },
    { path: '/listings/all', api_group: 'frontend', name: 'Listings List' },
    { path: '/revenue/all', api_group: 'frontend', name: 'Revenue Data' },
    { path: '/network/all', api_group: 'frontend', name: 'Network Tree' },
    { path: '/hq/dashboard', api_group: 'frontend', name: 'HQ Dashboard' },
    { path: '/leaderboard', api_group: 'frontend', name: 'Leaderboard' },

    // WORKERS - Background jobs
    { path: '/sync-fub-data', api_group: 'workers', name: 'FUB Sync' },
    { path: '/sync-transactions', api_group: 'workers', name: 'Transaction Sync' },
    { path: '/sync-network', api_group: 'workers', name: 'Network Sync' },

    // SYSTEM - Admin operations
    { path: '/health-check', api_group: 'system', name: 'Health Check' },
    { path: '/metrics', api_group: 'system', name: 'System Metrics' },
  ]

  const results: ValidationResult[] = []

  for (const endpoint of criticalEndpoints) {
    console.log(`\n🔍 Testing ${endpoint.name}...`)
    const result = await validateEndpoint(endpoint.path, 'POST', endpoint.api_group)
    results.push(result)

    if (result.success) {
      console.log(`   ✅ Passed (${result.metadata?.duration_ms}ms)`)
    } else {
      console.log(`   ❌ FAILED: ${result.error}`)
    }
  }

  const report = generateReport(results)
  printResults(report)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `endpoint-validation-critical-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  const apiGroupArg = args.find(a => a.startsWith('--api-group='))
  const endpointArg = args.find(a => a.startsWith('--endpoint='))
  const criticalFlag = args.includes('--critical')

  if (criticalFlag) {
    await validateCriticalEndpoints()
  } else if (endpointArg) {
    const endpoint = endpointArg.split('=')[1]
    await validateSingleEndpoint(endpoint)
  } else if (apiGroupArg) {
    const apiGroup = apiGroupArg.split('=')[1]
    await validateByApiGroup(apiGroup)
  } else {
    await validateAllEndpoints()
  }
}

main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
