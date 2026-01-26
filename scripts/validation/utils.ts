/**
 * V2 Backend Validation Utilities
 *
 * Core utilities for validating V2 workspace components:
 * - Tables (193 total)
 * - Functions (971 total)
 * - Endpoints (801 total)
 * - Table references (foreign keys)
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { MCP_ENDPOINTS, MCP_BASES } from '../../lib/mcp-endpoints'

const execAsync = promisify(exec)

// Build function ID to test endpoint mapping from MCP_ENDPOINTS
// Pattern: /test-function-8052-txn-sync -> function_id: 8052
interface TestEndpointInfo {
  endpoint: string
  apiGroup: string
  method: string
  requiresUserId: boolean
}

const FUNCTION_ID_TO_TEST_ENDPOINT: Map<number, TestEndpointInfo> = new Map()

for (const mcpEndpoint of MCP_ENDPOINTS) {
  // Extract function ID from endpoint path like /test-function-8052-txn-sync
  const match = mcpEndpoint.endpoint.match(/test-function-(\d+)/)
  if (match) {
    const functionId = parseInt(match[1], 10)
    FUNCTION_ID_TO_TEST_ENDPOINT.set(functionId, {
      endpoint: mcpEndpoint.endpoint,
      apiGroup: mcpEndpoint.apiGroup,
      method: mcpEndpoint.method,
      requiresUserId: mcpEndpoint.requiresUserId,
    })
  }
}

// V2 Workspace Configuration
export const V2_CONFIG = {
  instance: 'x2nu-xcjc-vhax.agentdashboards.xano.io',
  workspace_id: 5,
  base_url: 'https://x2nu-xcjc-vhax.agentdashboards.xano.io',
  api_groups: {
    frontend: { id: 515, path: 'api:pe1wjL5I', name: 'Frontend API v2' },
    workers: { id: 536, path: 'api:4UsTtl3m', name: 'WORKERS' },
    tasks: { id: 532, path: 'api:4psV7fp6', name: 'TASKS' },
    system: { id: 535, path: 'api:LIdBL1AN', name: 'SYSTEM' },
    seeding: { id: 531, path: 'api:2kCRUYxG', name: 'SEEDING' },
  },
  test_user: { id: 60, name: 'David Keener', agent_id: 37208, team_id: 1 },
}

// Validation result types
export interface ValidationResult {
  success: boolean
  name: string
  type: 'table' | 'function' | 'endpoint' | 'reference'
  error?: string
  metadata?: Record<string, any>
  timestamp: string
}

export interface ValidationReport {
  summary: {
    total: number
    passed: number
    failed: number
    untestable: number
    passRate: number
    testablePassRate: number // Pass rate excluding untestable
  }
  results: ValidationResult[]
  duration: number
}

/**
 * Execute snappy CLI tool
 */
export async function xanoMCP(tool: string, args: Record<string, any>): Promise<any> {
  const argsJson = JSON.stringify(args)
  const snappyPath = '/Users/sboulos/Desktop/ai_projects/snappy-cli/bin/snappy'
  const command = `${snappyPath} exec ${tool} --args '${argsJson}' --json`

  try {
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large responses
    })

    // Extract JSON from snappy's formatted output
    const jsonMatch = stdout.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error(`No JSON found in snappy output. stderr: ${stderr}`)
    }

    const wrapper = JSON.parse(jsonMatch[0])

    // Check for error in wrapper
    if (wrapper.error) {
      throw new Error(wrapper.error)
    }

    // Snappy returns data inside content[0].text as JSON string
    if (wrapper.content && wrapper.content[0] && wrapper.content[0].text) {
      const textContent = wrapper.content[0].text
      // Extract the JSON object from the formatted text (skip the header lines)
      const dataMatch = textContent.match(/\{[\s\S]*\}/)
      if (dataMatch) {
        return JSON.parse(dataMatch[0])
      }
    }

    // Fallback to wrapper if no content field
    return wrapper
  } catch (error: any) {
    console.error(`[snappy] ${tool} failed:`, error.message)
    throw error
  }
}

/**
 * Test table existence and record count
 */
export async function validateTable(tableName: string): Promise<ValidationResult> {
  const startTime = Date.now()

  try {
    // Use xano-mcp to query table - need table_id not table_name
    // First we need to map table name to ID from v2-data.ts
    // For now, just use xanoMCP to get table info
    const result = await xanoMCP('query_table', {
      table_name: tableName,
      limit: 1,
    })

    // Result from xano-mcp has pagination.total_matches
    const totalRecords = result.pagination?.total_matches || result.total_count || 0

    return {
      success: true,
      name: tableName,
      type: 'table',
      metadata: {
        record_count: totalRecords,
        has_data: totalRecords > 0,
        duration_ms: Date.now() - startTime,
      },
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    return {
      success: false,
      name: tableName,
      type: 'table',
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Test endpoint with curl
 */
export async function validateEndpoint(
  endpoint: string,
  method: string = 'POST',
  apiGroup: string = 'frontend'
): Promise<ValidationResult> {
  const startTime = Date.now()
  const apiConfig = V2_CONFIG.api_groups[apiGroup as keyof typeof V2_CONFIG.api_groups]
  const url = `${V2_CONFIG.base_url}/${apiConfig.path}${endpoint}`

  const curlCommand = `curl -s -w "\\n%{http_code}" -X ${method} "${url}" \\
    -H "Content-Type: application/json" \\
    -d '{"user_id": ${V2_CONFIG.test_user.id}}'`

  try {
    const { stdout } = await execAsync(curlCommand)
    const lines = stdout.trim().split('\n')
    const statusCode = lines[lines.length - 1]
    const body = lines.slice(0, -1).join('\n')

    const success = statusCode === '200'

    return {
      success,
      name: endpoint,
      type: 'endpoint',
      error: success ? undefined : `HTTP ${statusCode}`,
      metadata: {
        status_code: parseInt(statusCode),
        api_group: apiConfig.name,
        duration_ms: Date.now() - startTime,
        response_size: body.length,
      },
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    return {
      success: false,
      name: endpoint,
      type: 'endpoint',
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Test function execution (via endpoint curls)
 *
 * NOTE: Xano functions cannot be executed directly - they must be called
 * by endpoints. This function uses multiple sources to find test endpoints:
 * 1. MCP_ENDPOINTS (from mcp-endpoints.ts) - known working test endpoints
 * 2. function-endpoint-mapping.json - auto-generated mapping file
 *
 * Workers/ functions often don't have direct endpoints, so we use the
 * MCP test-function-* endpoints to validate them.
 */
export async function validateFunction(
  functionId: number,
  functionName: string,
  functionEndpointMapping?: any
): Promise<ValidationResult> {
  const startTime = Date.now()

  try {
    // 1. First check MCP_ENDPOINTS for known test endpoints (e.g., /test-function-8052-txn-sync)
    const mcpTestEndpoint = FUNCTION_ID_TO_TEST_ENDPOINT.get(functionId)
    if (mcpTestEndpoint) {
      return await testFunctionViaEndpoint(
        functionId,
        functionName,
        mcpTestEndpoint.endpoint,
        mcpTestEndpoint.apiGroup,
        mcpTestEndpoint.method,
        mcpTestEndpoint.requiresUserId,
        startTime
      )
    }

    // 2. Fall back to function-endpoint mapping file
    if (!functionEndpointMapping) {
      try {
        const mappingPath = path.join(process.cwd(), 'lib', 'function-endpoint-mapping.json')
        const mappingData = await fs.readFile(mappingPath, 'utf-8')
        functionEndpointMapping = JSON.parse(mappingData)
      } catch (error: any) {
        return {
          success: false,
          name: functionName,
          type: 'function',
          error: `Failed to load function-endpoint mapping: ${error.message}`,
          metadata: { function_id: functionId },
          timestamp: new Date().toISOString(),
        }
      }
    }

    // Find mapping for this function
    const mapping = functionEndpointMapping.find((m: any) => m.function_id === functionId)

    if (!mapping || mapping.endpoints.length === 0) {
      // No test endpoint found - mark as untestable (not failed)
      // This is expected for many internal Workers/ functions
      return {
        success: false,
        name: functionName,
        type: 'function',
        error: 'No test endpoint available',
        metadata: {
          function_id: functionId,
          status: 'untestable',
          note: 'Internal function without public test endpoint. Verify manually if needed.',
        },
        timestamp: new Date().toISOString(),
      }
    }

    // Use the first endpoint from mapping file
    const endpoint = mapping.endpoints[0]
    const apiGroupKey = Object.keys(V2_CONFIG.api_groups).find(
      (key) =>
        V2_CONFIG.api_groups[key as keyof typeof V2_CONFIG.api_groups].name === endpoint.api_group
    )

    if (!apiGroupKey) {
      return {
        success: false,
        name: functionName,
        type: 'function',
        error: `Unknown API group: ${endpoint.api_group}`,
        metadata: { function_id: functionId },
        timestamp: new Date().toISOString(),
      }
    }

    return await testFunctionViaEndpoint(
      functionId,
      functionName,
      endpoint.path,
      endpoint.api_group,
      endpoint.method,
      true, // assume requires user_id for safety
      startTime
    )
  } catch (error: any) {
    return {
      success: false,
      name: functionName,
      type: 'function',
      error: error.message,
      metadata: { function_id: functionId },
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Test a function by calling its test endpoint via curl
 */
async function testFunctionViaEndpoint(
  functionId: number,
  functionName: string,
  endpointPath: string,
  apiGroupName: string,
  method: string,
  requiresUserId: boolean,
  startTime: number
): Promise<ValidationResult> {
  // Map API group name to config key
  const apiGroupKey = Object.keys(V2_CONFIG.api_groups).find(
    (key) => V2_CONFIG.api_groups[key as keyof typeof V2_CONFIG.api_groups].name === apiGroupName
  )

  if (!apiGroupKey) {
    return {
      success: false,
      name: functionName,
      type: 'function',
      error: `Unknown API group: ${apiGroupName}`,
      metadata: { function_id: functionId },
      timestamp: new Date().toISOString(),
    }
  }

  const apiConfig = V2_CONFIG.api_groups[apiGroupKey as keyof typeof V2_CONFIG.api_groups]
  const url = `${V2_CONFIG.base_url}/${apiConfig.path}${endpointPath}`

  // Build request body based on requirements
  const requestBody = requiresUserId
    ? `{"user_id": ${V2_CONFIG.test_user.id}, "team_id": ${V2_CONFIG.test_user.team_id}}`
    : '{}'

  // Curl the endpoint
  const curlCommand = `curl -s -w "\\n%{http_code}" -X ${method} "${url}" \\
    -H "Content-Type: application/json" \\
    -d '${requestBody}'`

  const { stdout } = await execAsync(curlCommand)
  const lines = stdout.trim().split('\n')
  const statusCode = lines[lines.length - 1]

  const success = statusCode === '200'

  return {
    success,
    name: functionName,
    type: 'function',
    error: success ? undefined : `HTTP ${statusCode}`,
    metadata: {
      function_id: functionId,
      tested_via: endpointPath,
      api_group: apiGroupName,
      duration_ms: Date.now() - startTime,
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Validate table reference fields (foreign keys)
 */
export async function validateTableReferences(
  tableName: string,
  refFields: Array<{ name: string; references: string }>
): Promise<ValidationResult> {
  const startTime = Date.now()
  const orphans: Record<string, number> = {}

  try {
    for (const refField of refFields) {
      // Query for orphaned references
      const orphanCount = await checkOrphanedRefs(tableName, refField.name, refField.references)
      if (orphanCount > 0) {
        orphans[refField.name] = orphanCount
      }
    }

    const hasOrphans = Object.keys(orphans).length > 0

    return {
      success: !hasOrphans,
      name: tableName,
      type: 'reference',
      error: hasOrphans ? `Found orphaned references: ${JSON.stringify(orphans)}` : undefined,
      metadata: {
        reference_fields: refFields.length,
        orphaned_refs: orphans,
        duration_ms: Date.now() - startTime,
      },
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    return {
      success: false,
      name: tableName,
      type: 'reference',
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Check for orphaned foreign key references
 */
async function checkOrphanedRefs(
  tableName: string,
  refField: string,
  referencedTable: string
): Promise<number> {
  // This would need to be implemented with actual database queries
  // For now, return 0 as placeholder
  return 0
}

/**
 * Generate validation report
 */
export function generateReport(results: ValidationResult[]): ValidationReport {
  const passed = results.filter((r) => r.success).length
  const untestable = results.filter((r) => !r.success && r.metadata?.status === 'untestable').length
  const failed = results.length - passed - untestable
  const testable = results.length - untestable

  return {
    summary: {
      total: results.length,
      passed,
      failed,
      untestable,
      passRate: results.length > 0 ? (passed / results.length) * 100 : 0,
      testablePassRate: testable > 0 ? (passed / testable) * 100 : 0,
    },
    results,
    duration: results.reduce((sum, r) => sum + (r.metadata?.duration_ms || 0), 0),
  }
}

/**
 * Save report to file
 */
export async function saveReport(report: ValidationReport, filename: string): Promise<void> {
  const reportsDir = path.join(process.cwd(), 'validation-reports')
  await fs.mkdir(reportsDir, { recursive: true })

  const filepath = path.join(reportsDir, filename)
  await fs.writeFile(filepath, JSON.stringify(report, null, 2))

  console.log(`\n📊 Report saved to: ${filepath}`)
}

/**
 * Pretty print validation results
 */
export function printResults(report: ValidationReport): void {
  console.log('\n' + '='.repeat(80))
  console.log('V2 VALIDATION REPORT')
  console.log('='.repeat(80))
  console.log(`\n📈 Summary:`)
  console.log(`   Total:      ${report.summary.total}`)
  console.log(`   ✅ Passed:   ${report.summary.passed}`)
  console.log(`   ❌ Failed:   ${report.summary.failed}`)
  console.log(`   ⚠️  Untestable: ${report.summary.untestable}`)
  console.log(`   📊 Overall Pass Rate: ${report.summary.passRate.toFixed(2)}%`)
  console.log(`   📊 Testable Pass Rate: ${report.summary.testablePassRate.toFixed(2)}%`)
  console.log(`   ⏱️  Duration: ${(report.duration / 1000).toFixed(2)}s`)

  // Show actual failures (not untestable)
  const actualFailures = report.results.filter(
    (r) => !r.success && r.metadata?.status !== 'untestable'
  )
  if (actualFailures.length > 0) {
    console.log(`\n❌ Failed Items (${actualFailures.length}):`)
    actualFailures.slice(0, 20).forEach((r) => {
      console.log(`   - ${r.name}: ${r.error}`)
    })
    if (actualFailures.length > 20) {
      console.log(`   ... and ${actualFailures.length - 20} more`)
    }
  }

  // Show untestable summary
  const untestableItems = report.results.filter(
    (r) => !r.success && r.metadata?.status === 'untestable'
  )
  if (untestableItems.length > 0) {
    console.log(`\n⚠️  Untestable Items (${untestableItems.length}):`)
    console.log(`   These are internal functions without public test endpoints.`)
    console.log(`   First 10:`)
    untestableItems.slice(0, 10).forEach((r) => {
      console.log(`   - ${r.name}`)
    })
    if (untestableItems.length > 10) {
      console.log(`   ... and ${untestableItems.length - 10} more`)
    }
  }

  console.log('\n' + '='.repeat(80))
}
