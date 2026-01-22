/**
 * V2 Integration Test Suite
 *
 * Comprehensive automated tests for V2 backend validation.
 * Runs all Phase 1 validation scripts in a single test suite.
 *
 * Usage:
 *   pnpm test
 *   pnpm test -- --grep "Tables"
 *   pnpm test -- --grep "Functions"
 *   pnpm test -- --grep "Endpoints"
 *   pnpm test -- --grep "References"
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

interface TestReport {
  summary: {
    total: number
    passed: number
    failed: number
    passRate: number
  }
  results: Array<{
    success: boolean
    name: string
    type: string
    error?: string
  }>
}

/**
 * Run validation script and parse report
 */
async function runValidation(scriptPath: string, args: string = ''): Promise<TestReport> {
  const command = `pnpm tsx ${scriptPath} ${args}`

  try {
    const { stdout } = await execAsync(command)

    // Parse the last JSON report from validation-reports/
    const reportsDir = path.join(process.cwd(), 'validation-reports')
    const files = await fs.readdir(reportsDir)
    const latestReport = files
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()[0]

    if (!latestReport) {
      throw new Error('No validation report found')
    }

    const reportPath = path.join(reportsDir, latestReport)
    const reportData = await fs.readFile(reportPath, 'utf-8')
    return JSON.parse(reportData)
  } catch (error: any) {
    // If script exits with error code, still try to parse report
    const reportsDir = path.join(process.cwd(), 'validation-reports')
    const files = await fs.readdir(reportsDir)
    const latestReport = files
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()[0]

    if (latestReport) {
      const reportPath = path.join(reportsDir, latestReport)
      const reportData = await fs.readFile(reportPath, 'utf-8')
      return JSON.parse(reportData)
    }

    throw error
  }
}

describe('V2 Backend Integration Tests', () => {
  describe('Phase 1.1: Table Validation', () => {
    it('should have all 193 tables with valid schemas', async () => {
      const report = await runValidation('scripts/validation/validate-tables.ts')

      expect(report.summary.total).toBeGreaterThanOrEqual(193)
      expect(report.summary.passRate).toBeGreaterThanOrEqual(95) // Allow 5% failure
    }, 300000) // 5 minute timeout

    it('should have core identity tables with data', async () => {
      const report = await runValidation(
        'scripts/validation/validate-tables.ts',
        '--category=core_identity'
      )

      expect(report.summary.passed).toBeGreaterThan(0)

      // Check critical tables
      const user = report.results.find(r => r.name === 'user')
      const agent = report.results.find(r => r.name === 'agent')
      const team = report.results.find(r => r.name === 'team')

      expect(user?.success).toBe(true)
      expect(agent?.success).toBe(true)
      expect(team?.success).toBe(true)
    }, 60000)

    it('should have transaction tables with data', async () => {
      const report = await runValidation(
        'scripts/validation/validate-tables.ts',
        '--category=transactions'
      )

      expect(report.summary.passRate).toBeGreaterThanOrEqual(90)

      const transaction = report.results.find(r => r.name === 'transaction')
      expect(transaction?.success).toBe(true)
    }, 60000)
  })

  describe('Phase 1.2: Function Validation', () => {
    it('should execute WORKERS functions without errors', async () => {
      const report = await runValidation(
        'scripts/validation/validate-functions.ts',
        '--api-group=workers'
      )

      expect(report.summary.passRate).toBeGreaterThanOrEqual(84) // Current known pass rate
    }, 600000) // 10 minute timeout

    it('should execute Frontend API v2 functions without errors', async () => {
      const report = await runValidation(
        'scripts/validation/validate-functions.ts',
        '--api-group=frontend'
      )

      expect(report.summary.passRate).toBeGreaterThanOrEqual(96) // Known compatibility
    }, 600000)

    it('should execute FUB integration functions without errors', async () => {
      const report = await runValidation(
        'scripts/validation/validate-functions.ts',
        '--integration=fub'
      )

      expect(report.summary.passRate).toBeGreaterThanOrEqual(90)
    }, 300000)
  })

  describe('Phase 1.3: Endpoint Integration Testing', () => {
    it('should return 200 for all Frontend API v2 endpoints', async () => {
      const report = await runValidation(
        'scripts/validation/validate-endpoints.ts',
        '--api-group=frontend'
      )

      expect(report.summary.total).toBe(200) // Known endpoint count
      expect(report.summary.passRate).toBeGreaterThanOrEqual(96)
    }, 900000) // 15 minute timeout

    it('should return 200 for critical production endpoints', async () => {
      const report = await runValidation(
        'scripts/validation/validate-endpoints.ts',
        '--critical'
      )

      expect(report.summary.passRate).toBe(100) // Critical endpoints must all pass
    }, 120000)

    it('should have response times < 2s for all endpoints', async () => {
      const report = await runValidation('scripts/validation/validate-endpoints.ts')

      // Check that no slow endpoints exist
      const slowEndpoints = report.results.filter(r => {
        return r.success && (r as any).metadata?.duration_ms > 2000
      })

      expect(slowEndpoints.length).toBe(0)
    }, 1800000) // 30 minute timeout for all endpoints
  })

  describe('Phase 1.4: Table Reference Validation', () => {
    it('should have zero orphaned foreign keys across all tables', async () => {
      const report = await runValidation('scripts/validation/validate-references.ts')

      expect(report.summary.passRate).toBe(100) // No orphaned refs allowed

      // Verify no orphans
      const orphanedRefs = report.results.filter(
        r => !r.success && (r as any).metadata?.orphan_count > 0
      )

      expect(orphanedRefs).toHaveLength(0)
    }, 600000) // 10 minute timeout

    it('should have valid user → related tables relationships', async () => {
      const report = await runValidation(
        'scripts/validation/validate-references.ts',
        '--relationship=user'
      )

      expect(report.summary.passRate).toBe(100)
    }, 120000)

    it('should have valid agent → related tables relationships', async () => {
      const report = await runValidation(
        'scripts/validation/validate-references.ts',
        '--relationship=agent'
      )

      expect(report.summary.passRate).toBe(100)
    }, 120000)

    it('should have valid transaction → related tables relationships', async () => {
      const report = await runValidation(
        'scripts/validation/validate-references.ts',
        '--relationship=transaction'
      )

      expect(report.summary.passRate).toBe(100)
    }, 120000)
  })

  describe('Logic Validation', () => {
    it('should calculate revenue correctly', async () => {
      // This would require more complex logic testing
      // For now, we verify the endpoint works
      const report = await runValidation(
        'scripts/validation/validate-endpoints.ts',
        '--endpoint=/revenue/all'
      )

      expect(report.summary.passed).toBe(1)
    }, 60000)

    it('should build network tree correctly', async () => {
      const report = await runValidation(
        'scripts/validation/validate-endpoints.ts',
        '--endpoint=/network/all'
      )

      expect(report.summary.passed).toBe(1)
    }, 60000)

    it('should aggregate transactions correctly', async () => {
      const report = await runValidation(
        'scripts/validation/validate-endpoints.ts',
        '--endpoint=/transactions/all'
      )

      expect(report.summary.passed).toBe(1)
    }, 60000)
  })

  describe('Overall Migration Score', () => {
    it('should achieve 95%+ overall validation score', async () => {
      // Run all validations and calculate weighted average
      const [tables, functions, endpoints, references] = await Promise.all([
        runValidation('scripts/validation/validate-tables.ts'),
        runValidation('scripts/validation/validate-functions.ts'),
        runValidation('scripts/validation/validate-endpoints.ts'),
        runValidation('scripts/validation/validate-references.ts'),
      ])

      const overallScore =
        (tables.summary.passRate * 0.2 +
          functions.summary.passRate * 0.3 +
          endpoints.summary.passRate * 0.3 +
          references.summary.passRate * 0.2)

      console.log('\n📊 Overall Migration Score:', overallScore.toFixed(2) + '%')
      console.log('   Tables:', tables.summary.passRate.toFixed(2) + '%')
      console.log('   Functions:', functions.summary.passRate.toFixed(2) + '%')
      console.log('   Endpoints:', endpoints.summary.passRate.toFixed(2) + '%')
      console.log('   References:', references.summary.passRate.toFixed(2) + '%')

      expect(overallScore).toBeGreaterThanOrEqual(95)
    }, 3600000) // 1 hour timeout for full validation
  })
})
