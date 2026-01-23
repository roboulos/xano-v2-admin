/**
 * POST /api/v2/functions/test-all
 *
 * Test multiple V2 functions in batch
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for batch testing

interface TestResult {
  function_id: number
  function_name: string
  success: boolean
  execution_time_ms: number
  tested_at: string
  status: 'passed' | 'failed' | 'simulated'
  error?: string
  message?: string
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const functionIds: number[] = body.functionIds || []
    const testParams = body.testParams || { user_id: 60 }

    if (functionIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No function IDs provided'
      }, { status: 400 })
    }

    // Test each function
    const results: TestResult[] = []
    let passed = 0
    let failed = 0

    for (const functionId of functionIds) {
      try {
        // Call individual test endpoint
        const testResponse = await fetch(
          `${request.url.replace('/test-all', `/${functionId}/test`)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testParams })
          }
        )

        const testResult = await testResponse.json()

        results.push({
          function_id: functionId,
          function_name: testResult.function_name || `Function ${functionId}`,
          success: testResult.success,
          execution_time_ms: testResult.execution_time_ms,
          tested_at: testResult.tested_at,
          status: testResult.status || (testResult.success ? 'passed' : 'failed'),
          error: testResult.error,
          message: testResult.message
        })

        if (testResult.success) {
          passed++
        } else {
          failed++
        }
      } catch (error: unknown) {
        results.push({
          function_id: functionId,
          function_name: `Function ${functionId}`,
          success: false,
          execution_time_ms: 0,
          tested_at: new Date().toISOString(),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        failed++
      }
    }

    const totalTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      tested: results.length,
      passed,
      failed,
      total_time_ms: totalTime,
      results,
      summary: {
        pass_rate: Math.round((passed / results.length) * 100),
        avg_execution_time_ms: Math.round(
          results.reduce((sum, r) => sum + r.execution_time_ms, 0) / results.length
        )
      }
    })
  } catch (error: unknown) {
    console.error('[Batch Function Test API] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
