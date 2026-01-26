/**
 * Build Function-to-Endpoint Mapping
 *
 * Creates a mapping between V2 functions and the endpoints that call them.
 * This enables function validation by curling the endpoints instead of
 * trying to execute functions directly (which Xano doesn't support).
 *
 * Strategy: Name-based heuristics
 * - Workers functions → test-function-*-{name} in WORKERS API
 * - Tasks functions → {name}-worker-N in TASKS API
 * - Utils functions → test-{name} in various APIs
 *
 * Output: lib/function-endpoint-mapping.json
 *
 * Usage:
 *   pnpm tsx scripts/build-function-endpoint-mapping.ts
 */

import { xanoMCP, V2_CONFIG } from './validation/utils'
import fs from 'fs/promises'
import path from 'path'

interface XanoFunction {
  id: number
  name: string
  path?: string
}

interface XanoEndpoint {
  id: number
  name: string
  method: string
  path?: string
}

interface FunctionEndpointMapping {
  function_id: number
  function_name: string
  endpoints: Array<{
    path: string
    method: string
    api_group: string
    api_group_id: number
  }>
}

/**
 * Fetch all functions from V2 workspace
 */
async function fetchAllFunctions(): Promise<XanoFunction[]> {
  console.log('📥 Fetching all functions from V2 workspace...')

  const allFunctions: XanoFunction[] = []
  let page = 1
  const perPage = 50

  while (true) {
    try {
      const result = await xanoMCP('list_functions', {
        workspace_id: V2_CONFIG.workspace_id,
        page,
        per_page: perPage,
      })

      if (!result.functions || result.functions.length === 0) {
        break
      }

      allFunctions.push(...result.functions)
      console.log(`   Fetched page ${page} (${result.functions.length} functions)`)

      if (result.functions.length < perPage) {
        break
      }

      page++
    } catch (error) {
      console.error(`❌ Failed to fetch page ${page}:`, error)
      break
    }
  }

  console.log(`✅ Total functions fetched: ${allFunctions.length}`)
  return allFunctions
}

/**
 * Fetch all endpoints for a given API group (with pagination)
 */
async function fetchEndpointsForGroup(
  apiGroupName: string,
  apiGroupId: number
): Promise<XanoEndpoint[]> {
  console.log(`📥 Fetching endpoints for ${apiGroupName} (ID: ${apiGroupId})...`)

  const allEndpoints: XanoEndpoint[] = []
  let page = 1
  const perPage = 50

  while (true) {
    try {
      const result = await xanoMCP('list_endpoints', {
        workspace_id: V2_CONFIG.workspace_id,
        api_group_id: apiGroupId,
        page,
        per_page: perPage,
      })

      const endpoints = result.endpoints || []
      if (endpoints.length === 0) {
        break
      }

      allEndpoints.push(...endpoints)
      console.log(`   Fetched page ${page} (${endpoints.length} endpoints)`)

      if (endpoints.length < perPage) {
        break
      }

      page++
    } catch (error) {
      console.error(`❌ Failed to fetch page ${page} for ${apiGroupName}:`, error)
      break
    }
  }

  console.log(`   ✅ Total endpoints fetched: ${allEndpoints.length}`)
  return allEndpoints
}

/**
 * Sanitize function name for matching with endpoint paths
 * Examples:
 *   "Workers/Syncing - Team Roster" → "team-roster"
 *   "Tasks/FUB - Onboarding People Worker 1" → "fub-onboarding-people-worker-1"
 *   "Utils/Backfill Agent Team ID" → "backfill-agent-team-id"
 */
function sanitizeFunctionName(name: string): string {
  return name
    .replace(/^(Workers|Tasks|Utils|Frontend|System|Seeding)\//, '') // Remove folder prefix
    .replace(/[^\w\s-]/g, '') // Remove special chars except dash
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with dashes
}

/**
 * Find matching endpoints for a function using name-based heuristics
 */
function findMatchingEndpoints(
  func: XanoFunction,
  allEndpoints: Record<string, XanoEndpoint[]>
): Array<{ path: string; method: string; api_group: string; api_group_id: number }> {
  const matches: Array<{
    path: string
    method: string
    api_group: string
    api_group_id: number
  }> = []

  const funcName = func.name
  const sanitizedName = sanitizeFunctionName(funcName)

  // Skip archived functions
  if (funcName.startsWith('Archive/')) {
    return matches
  }

  // Strategy 1: Workers functions → test-function-*-{name} in WORKERS
  if (funcName.startsWith('Workers/')) {
    for (const ep of allEndpoints.workers || []) {
      if (!ep.name) continue
      const epName = ep.name.toLowerCase()
      if (epName.includes('test-function') && epName.includes(sanitizedName)) {
        matches.push({
          path: '/' + ep.name,
          method: ep.method || 'POST',
          api_group: 'WORKERS',
          api_group_id: V2_CONFIG.api_groups.workers.id,
        })
      }
    }
  }

  // Strategy 2: Tasks functions → {integration}-{operation}-worker-N in TASKS
  if (funcName.startsWith('Tasks/')) {
    for (const ep of allEndpoints.tasks || []) {
      if (!ep.name) continue
      const epName = ep.name.toLowerCase()
      // Match by key parts of the name
      const nameParts = sanitizedName.split('-').filter((p) => p.length > 3)
      const matchCount = nameParts.filter((part) => epName.includes(part)).length

      // If at least 2 significant parts match, consider it a match
      if (matchCount >= 2) {
        matches.push({
          path: '/' + ep.name,
          method: ep.method || 'POST',
          api_group: 'TASKS',
          api_group_id: V2_CONFIG.api_groups.tasks.id,
        })
      }
    }
  }

  // Strategy 3: Utils/Frontend/System functions → look in multiple API groups
  if (
    funcName.startsWith('Utils/') ||
    funcName.startsWith('Frontend/') ||
    funcName.startsWith('System/')
  ) {
    // Check WORKERS for test endpoints
    for (const ep of allEndpoints.workers || []) {
      if (!ep.name) continue
      const epName = ep.name.toLowerCase()
      if (epName.includes(sanitizedName) || sanitizedName.includes(epName.replace('/', ''))) {
        matches.push({
          path: '/' + ep.name,
          method: ep.method || 'POST',
          api_group: 'WORKERS',
          api_group_id: V2_CONFIG.api_groups.workers.id,
        })
      }
    }

    // Check SYSTEM
    for (const ep of allEndpoints.system || []) {
      if (!ep.name) continue
      const epName = ep.name.toLowerCase()
      if (epName.includes(sanitizedName) || sanitizedName.includes(epName.replace('/', ''))) {
        matches.push({
          path: '/' + ep.name,
          method: ep.method || 'POST',
          api_group: 'SYSTEM',
          api_group_id: V2_CONFIG.api_groups.system.id,
        })
      }
    }

    // Check Frontend API
    for (const ep of allEndpoints.frontend || []) {
      if (!ep.name) continue
      const epName = ep.name.toLowerCase()
      if (epName.includes(sanitizedName) || sanitizedName.includes(epName.replace('/', ''))) {
        matches.push({
          path: '/' + ep.name,
          method: ep.method || 'POST',
          api_group: 'Frontend API v2',
          api_group_id: V2_CONFIG.api_groups.frontend.id,
        })
      }
    }
  }

  // Strategy 4: Seeding functions → check SEEDING API
  if (funcName.startsWith('Seeding/')) {
    for (const ep of allEndpoints.seeding || []) {
      if (!ep.name) continue
      const epName = ep.name.toLowerCase()
      if (epName.includes(sanitizedName) || sanitizedName.includes(epName.replace('/', ''))) {
        matches.push({
          path: '/' + ep.name,
          method: ep.method || 'POST',
          api_group: 'SEEDING',
          api_group_id: V2_CONFIG.api_groups.seeding.id,
        })
      }
    }
  }

  return matches
}

/**
 * Build complete function-to-endpoint mapping
 */
async function buildMapping(): Promise<void> {
  console.log('🚀 Building Function-to-Endpoint Mapping\n')

  // Step 1: Fetch all functions
  const allFunctions = await fetchAllFunctions()

  // Step 2: Fetch all endpoints for each API group
  console.log('\n📡 Fetching endpoints from all API groups...')
  const allEndpoints: Record<string, XanoEndpoint[]> = {
    workers: await fetchEndpointsForGroup('WORKERS', V2_CONFIG.api_groups.workers.id),
    tasks: await fetchEndpointsForGroup('TASKS', V2_CONFIG.api_groups.tasks.id),
    frontend: await fetchEndpointsForGroup('Frontend API v2', V2_CONFIG.api_groups.frontend.id),
    system: await fetchEndpointsForGroup('SYSTEM', V2_CONFIG.api_groups.system.id),
    seeding: await fetchEndpointsForGroup('SEEDING', V2_CONFIG.api_groups.seeding.id),
  }

  // Step 3: Build mapping using name-based heuristics
  console.log('\n🔗 Building mappings using name-based heuristics...')
  const mappings: FunctionEndpointMapping[] = []
  let matchedCount = 0
  let unmatchedCount = 0

  for (const func of allFunctions) {
    const matchingEndpoints = findMatchingEndpoints(func, allEndpoints)

    mappings.push({
      function_id: func.id,
      function_name: func.name,
      endpoints: matchingEndpoints,
    })

    if (matchingEndpoints.length > 0) {
      matchedCount++
    } else if (!func.name.startsWith('Archive/')) {
      unmatchedCount++
    }
  }

  // Step 4: Save mapping to file
  const outputPath = path.join(process.cwd(), 'lib', 'function-endpoint-mapping.json')
  await fs.writeFile(outputPath, JSON.stringify(mappings, null, 2))

  console.log('\n✅ Mapping complete!')
  console.log(`   Total functions: ${allFunctions.length}`)
  console.log(`   Matched: ${matchedCount}`)
  console.log(`   Unmatched (active): ${unmatchedCount}`)
  console.log(
    `   Archived (skipped): ${allFunctions.filter((f) => f.name.startsWith('Archive/')).length}`
  )
  console.log(`\n📁 Mapping saved to: ${outputPath}`)

  // Show sample mappings
  console.log('\n📊 Sample Mappings:')
  const samples = mappings.filter((m) => m.endpoints.length > 0).slice(0, 5)
  samples.forEach((m) => {
    console.log(`\n   ${m.function_name}`)
    m.endpoints.forEach((ep) => {
      console.log(`      → ${ep.api_group}: ${ep.path}`)
    })
  })

  // Show unmatched active functions
  const unmatchedActive = mappings
    .filter((m) => m.endpoints.length === 0 && !m.function_name.startsWith('Archive/'))
    .slice(0, 10)

  if (unmatchedActive.length > 0) {
    console.log('\n⚠️  Sample Unmatched Functions (first 10):')
    unmatchedActive.forEach((m) => {
      console.log(`   - ${m.function_name}`)
    })
  }
}

// Main execution
buildMapping().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
