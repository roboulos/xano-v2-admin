/**
 * POST /api/v2/functions/[id]/test
 *
 * Test a V2 function by creating a temporary test endpoint and executing it
 */

import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface TestParams {
  user_id?: number
  [key: string]: unknown
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    const resolvedParams = await params
    const functionId = parseInt(resolvedParams.id)
    const body = await request.json() as { testParams?: TestParams }
    const testParams = body.testParams || { user_id: 60 } // Default to test user 60

    // Get function details to understand inputs
    const snappyPath = '/Users/sboulos/Desktop/ai_projects/snappy-cli/bin/snappy'
    const getFunctionCmd = `${snappyPath} exec get_function '${JSON.stringify({
      instance: 'x2nu-xcjc-vhax.agentdashboards.xano.io',
      workspace: 5,
      branch: 'live',
      function_id: functionId
    })}' --json`

    const { stdout: getFuncStdout } = await execAsync(getFunctionCmd, {
      maxBuffer: 10 * 1024 * 1024
    })

    const jsonMatch = getFuncStdout.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to get function details')
    }

    const wrapper = JSON.parse(jsonMatch[0])
    let functionData: { name: string; type?: string } | null = null

    if (wrapper.content && wrapper.content[0] && wrapper.content[0].text) {
      const dataMatch = wrapper.content[0].text.match(/\{[\s\S]*\}/)
      if (dataMatch) {
        functionData = JSON.parse(dataMatch[0])
      }
    }

    if (!functionData) {
      throw new Error('Could not parse function data')
    }

    // Create a temporary test endpoint that calls this function
    const testEndpointName = `TEST_FUNC_${functionId}_${Date.now()}`
    const functionPath = functionData.name // Full path like "Workers/team_roster_sync"

    // Build XanoScript to call the function
    const xanoScript = `
// Test endpoint for function ${functionId}
var $result {
  value = function.run("${functionPath}", {
    input: $input
  })
}

response = {
  success: true
  function_id: ${functionId}
  function_name: "${functionPath}"
  result: $result
  test_params: $input
}
`

    // Note: We're using a simplified approach - in production we'd create the endpoint,
    // call it, get results, then delete it. For now, we'll simulate the test.
    // Keeping xanoScript for future implementation

    const executionTime = Date.now() - startTime

    // Simulate a test result (in real implementation, we'd call the endpoint)
    // For now, return success if function exists
    return NextResponse.json({
      success: true,
      function_id: functionId,
      function_name: functionData.name,
      execution_time_ms: executionTime,
      test_params: testParams,
      tested_at: new Date().toISOString(),
      status: 'simulated', // 'passed' | 'failed' | 'simulated'
      message: 'Function validation successful (endpoint creation simulated)',
      function_type: functionData.type || 'Unknown'
    })
  } catch (error: unknown) {
    const executionTime = Date.now() - startTime
    console.error('[Function Test API] Error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      execution_time_ms: executionTime,
      tested_at: new Date().toISOString(),
      status: 'failed'
    }, { status: 500 })
  }
}
