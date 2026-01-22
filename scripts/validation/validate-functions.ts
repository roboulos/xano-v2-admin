/**
 * Phase 1.2: Function Validation Script
 *
 * Tests all 971 V2 functions for:
 * - Execution without errors
 * - Response structure
 * - Logic integrity
 *
 * Organizes functions by:
 * - API Groups (WORKERS, TASKS, Frontend, SYSTEM, SEEDING)
 * - Integration type (FUB, Rezen, SkySlope, etc.)
 * - Domain (transactions, network, listings, etc.)
 *
 * Usage:
 *   pnpm tsx scripts/validation/validate-functions.ts
 *   pnpm tsx scripts/validation/validate-functions.ts --api-group=workers
 *   pnpm tsx scripts/validation/validate-functions.ts --integration=fub
 *   pnpm tsx scripts/validation/validate-functions.ts --domain=transactions
 */

import {
  validateFunction,
  generateReport,
  saveReport,
  printResults,
  ValidationResult,
  xanoMCP,
  V2_CONFIG,
} from './utils'

interface XanoFunction {
  id: number
  name: string
  path?: string
  api_group?: string
  domain?: string
}

// Function organization by API group
const API_GROUPS = {
  workers: { id: 536, name: 'WORKERS', estimated_count: 100 },
  tasks: { id: 532, name: 'TASKS', estimated_count: 50 },
  frontend: { id: 515, name: 'Frontend API v2', estimated_count: 120 },
  system: { id: 535, name: 'SYSTEM', estimated_count: 38 },
  seeding: { id: 531, name: 'SEEDING', estimated_count: 24 },
  archived: { id: null, name: 'Archive/*', estimated_count: 700 },
}

// Integration categories
const INTEGRATIONS = {
  fub: { name: 'Follow Up Boss', path_pattern: /fub/i },
  rezen: { name: 'reZEN', path_pattern: /rezen/i },
  skyslope: { name: 'SkySlope', path_pattern: /skyslope/i },
  dotloop: { name: 'DotLoop', path_pattern: /dotloop/i },
  lofty: { name: 'Lofty', path_pattern: /lofty/i },
  qualia: { name: 'Qualia', path_pattern: /qualia/i },
}

// Domain categories
const DOMAINS = {
  transactions: { path_pattern: /transaction/i },
  listings: { path_pattern: /listing/i },
  network: { path_pattern: /network/i },
  revenue: { path_pattern: /revenue|income|commission/i },
  team: { path_pattern: /team|roster/i },
  user: { path_pattern: /user|agent|profile/i },
  email: { path_pattern: /email/i },
  metrics: { path_pattern: /metric|aggregate|agg_/i },
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
 * Categorize functions by API group, integration, and domain
 */
function categorizeFunctions(functions: XanoFunction[]): Record<string, XanoFunction[]> {
  const categories: Record<string, XanoFunction[]> = {
    workers: [],
    tasks: [],
    frontend: [],
    system: [],
    seeding: [],
    archived: [],
    uncategorized: [],
  }

  for (const func of functions) {
    const path = func.path || func.name || ''

    // Check if archived
    if (path.startsWith('Archive/')) {
      categories.archived.push(func)
      continue
    }

    // Categorize by API group (based on path patterns)
    if (path.includes('Workers/') || path.includes('workers/')) {
      categories.workers.push(func)
    } else if (path.includes('Tasks/') || path.includes('tasks/')) {
      categories.tasks.push(func)
    } else if (path.includes('Frontend/') || path.includes('api:pe1wjL5I')) {
      categories.frontend.push(func)
    } else if (path.includes('System/') || path.includes('system/')) {
      categories.system.push(func)
    } else if (path.includes('Seeding/') || path.includes('seeding/')) {
      categories.seeding.push(func)
    } else {
      categories.uncategorized.push(func)
    }
  }

  return categories
}

/**
 * Filter functions by integration
 */
function filterByIntegration(functions: XanoFunction[], integration: string): XanoFunction[] {
  const config = INTEGRATIONS[integration as keyof typeof INTEGRATIONS]
  if (!config) {
    return []
  }

  return functions.filter(f => {
    const path = f.path || f.name || ''
    return config.path_pattern.test(path)
  })
}

/**
 * Filter functions by domain
 */
function filterByDomain(functions: XanoFunction[], domain: string): XanoFunction[] {
  const config = DOMAINS[domain as keyof typeof DOMAINS]
  if (!config) {
    return []
  }

  return functions.filter(f => {
    const path = f.path || f.name || ''
    return config.path_pattern.test(path)
  })
}

/**
 * Validate a batch of functions
 */
async function validateFunctionBatch(
  functions: XanoFunction[],
  batchName: string
): Promise<ValidationResult[]> {
  console.log(`\n🔍 Validating ${batchName} (${functions.length} functions)...`)

  const results: ValidationResult[] = []
  let successCount = 0
  let errorCount = 0

  for (const func of functions) {
    process.stdout.write(`   Testing ${func.name}... `)

    const result = await validateFunction(func.id, func.name)
    results.push(result)

    if (result.success) {
      successCount++
      console.log(`✅`)
    } else {
      errorCount++
      console.log(`❌ ${result.error}`)
    }

    // Progress indicator
    if ((successCount + errorCount) % 10 === 0) {
      console.log(`   Progress: ${successCount + errorCount}/${functions.length}`)
    }
  }

  console.log(`\n   ✅ Passed: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)

  return results
}

/**
 * Validate all functions (excluding archived)
 */
async function validateAllFunctions(): Promise<void> {
  console.log('🚀 Starting V2 Function Validation')

  const allFunctions = await fetchAllFunctions()
  const categories = categorizeFunctions(allFunctions)

  console.log('\n📊 Function Distribution:')
  for (const [category, funcs] of Object.entries(categories)) {
    console.log(`   ${category}: ${funcs.length} functions`)
  }

  const allResults: ValidationResult[] = []

  // Test active functions (skip archived)
  for (const [category, funcs] of Object.entries(categories)) {
    if (category === 'archived') {
      console.log(`\n⏭️  Skipping ${funcs.length} archived functions`)
      continue
    }

    if (funcs.length > 0) {
      const results = await validateFunctionBatch(funcs, category)
      allResults.push(...results)
    }
  }

  // Generate report
  const report = generateReport(allResults)
  printResults(report)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `function-validation-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

/**
 * Validate functions by API group
 */
async function validateByApiGroup(apiGroup: string): Promise<void> {
  console.log(`🔍 Validating ${apiGroup.toUpperCase()} functions`)

  const allFunctions = await fetchAllFunctions()
  const categories = categorizeFunctions(allFunctions)

  const functions = categories[apiGroup] || []

  if (functions.length === 0) {
    console.error(`❌ No functions found for API group: ${apiGroup}`)
    process.exit(1)
  }

  const results = await validateFunctionBatch(functions, `${apiGroup} functions`)
  const report = generateReport(results)
  printResults(report)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `function-validation-${apiGroup}-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

/**
 * Validate functions by integration
 */
async function validateByIntegration(integration: string): Promise<void> {
  console.log(`🔍 Validating ${integration.toUpperCase()} integration functions`)

  const allFunctions = await fetchAllFunctions()
  const functions = filterByIntegration(allFunctions, integration)

  if (functions.length === 0) {
    console.error(`❌ No functions found for integration: ${integration}`)
    process.exit(1)
  }

  const results = await validateFunctionBatch(functions, `${integration} integration`)
  const report = generateReport(results)
  printResults(report)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `function-validation-${integration}-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

/**
 * Validate functions by domain
 */
async function validateByDomain(domain: string): Promise<void> {
  console.log(`🔍 Validating ${domain.toUpperCase()} domain functions`)

  const allFunctions = await fetchAllFunctions()
  const functions = filterByDomain(allFunctions, domain)

  if (functions.length === 0) {
    console.error(`❌ No functions found for domain: ${domain}`)
    process.exit(1)
  }

  const results = await validateFunctionBatch(functions, `${domain} domain`)
  const report = generateReport(results)
  printResults(report)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `function-validation-${domain}-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  const apiGroupArg = args.find(a => a.startsWith('--api-group='))
  const integrationArg = args.find(a => a.startsWith('--integration='))
  const domainArg = args.find(a => a.startsWith('--domain='))

  if (apiGroupArg) {
    const apiGroup = apiGroupArg.split('=')[1]
    await validateByApiGroup(apiGroup)
  } else if (integrationArg) {
    const integration = integrationArg.split('=')[1]
    await validateByIntegration(integration)
  } else if (domainArg) {
    const domain = domainArg.split('=')[1]
    await validateByDomain(domain)
  } else {
    await validateAllFunctions()
  }
}

main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
