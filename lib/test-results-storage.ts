/**
 * Test Results Storage
 *
 * Manages function test results in localStorage
 */

export interface FunctionTestResult {
  function_id: number
  function_name: string
  success: boolean
  execution_time_ms: number
  tested_at: string
  status: 'passed' | 'failed' | 'simulated'
  error?: string
  message?: string
}

const STORAGE_KEY = 'xano_v2_function_test_results'
const MAX_RESULTS = 500 // Keep last 500 test results

/**
 * Get all test results from localStorage
 */
export function getTestResults(): Record<number, FunctionTestResult> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to load test results:', error)
    return {}
  }
}

/**
 * Save test result for a function
 */
export function saveTestResult(result: FunctionTestResult): void {
  if (typeof window === 'undefined') return

  try {
    const results = getTestResults()
    results[result.function_id] = result

    // Keep only the most recent results (by function_id)
    const resultArray = Object.values(results)
    if (resultArray.length > MAX_RESULTS) {
      // Sort by tested_at and keep the most recent
      const sorted = resultArray.sort((a, b) =>
        new Date(b.tested_at).getTime() - new Date(a.tested_at).getTime()
      )
      const truncated = sorted.slice(0, MAX_RESULTS)
      const newResults: Record<number, FunctionTestResult> = {}
      truncated.forEach(r => {
        newResults[r.function_id] = r
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newResults))
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
    }
  } catch (error) {
    console.error('Failed to save test result:', error)
  }
}

/**
 * Save multiple test results
 */
export function saveTestResults(results: FunctionTestResult[]): void {
  if (typeof window === 'undefined') return

  try {
    const existing = getTestResults()
    results.forEach(result => {
      existing[result.function_id] = result
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Failed to save test results:', error)
  }
}

/**
 * Get test result for a specific function
 */
export function getTestResult(functionId: number): FunctionTestResult | null {
  const results = getTestResults()
  return results[functionId] || null
}

/**
 * Clear all test results
 */
export function clearTestResults(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear test results:', error)
  }
}

/**
 * Get test statistics
 */
export function getTestStats(): {
  total: number
  passed: number
  failed: number
  simulated: number
  pass_rate: number
} {
  const results = Object.values(getTestResults())
  const total = results.length
  const passed = results.filter(r => r.status === 'passed').length
  const failed = results.filter(r => r.status === 'failed').length
  const simulated = results.filter(r => r.status === 'simulated').length
  const pass_rate = total > 0 ? Math.round((passed / total) * 100) : 0

  return { total, passed, failed, simulated, pass_rate }
}
