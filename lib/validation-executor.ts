/**
 * Validation Pipeline Execution Engine
 *
 * Executes validation stages defined in validation.config.ts
 * Handles dependencies, checks success criteria, reads reports
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { validationConfig, getStage, type ValidationStage } from '@/validation.config'

const execAsync = promisify(exec)

export interface StageResult {
  stageId: string
  success: boolean
  startTime: Date
  endTime?: Date
  duration?: number
  report?: any
  error?: string
  meetsSuccessCriteria: boolean
}

export interface PipelineStatus {
  running: boolean
  currentStage?: string
  completedStages: string[]
  results: Record<string, StageResult>
}

// Global pipeline state
let pipelineStatus: PipelineStatus = {
  running: false,
  completedStages: [],
  results: {},
}

/**
 * Check if a stage's dependencies are met
 */
export function areDependenciesMet(stageId: string): boolean {
  const stage = getStage(stageId)
  if (!stage) return false

  for (const depId of stage.dependencies) {
    const result = pipelineStatus.results[depId]
    if (!result || !result.success || !result.meetsSuccessCriteria) {
      return false
    }
  }

  return true
}

/**
 * Check if stage has already completed successfully
 */
export function isStageComplete(stageId: string): boolean {
  const result = pipelineStatus.results[stageId]
  return result?.success && result?.meetsSuccessCriteria
}

/**
 * Read the latest validation report for a stage
 */
async function readLatestReport(reportPattern: string): Promise<any> {
  const reportsDir = path.join(process.cwd(), 'validation-reports')

  try {
    const files = await fs.readdir(reportsDir)

    // Extract pattern (e.g., "table-validation-*.json" → "table-validation")
    const basePattern = reportPattern.split('*')[0].replace('validation-reports/', '')

    // Find matching files
    const matchingFiles = files
      .filter(f => f.startsWith(basePattern) && f.endsWith('.json'))
      .sort()
      .reverse() // Latest first

    if (matchingFiles.length === 0) {
      return null
    }

    const latestFile = matchingFiles[0]
    const filepath = path.join(reportsDir, latestFile)
    const content = await fs.readFile(filepath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    return null
  }
}

/**
 * Check if report meets stage success criteria
 */
function meetsSuccessCriteria(report: any, stage: ValidationStage): boolean {
  if (!report || !report.summary) return false

  const { passed, total } = report.summary
  const { target, threshold } = stage.metrics

  // Calculate actual vs expected
  const actualPassed = passed
  const expectedPassed = target
  const failed = total - passed
  const allowedFailures = threshold

  return actualPassed >= expectedPassed && failed <= allowedFailures
}

/**
 * Execute a single validation stage
 */
export async function executeStage(stageId: string): Promise<StageResult> {
  const stage = getStage(stageId)
  if (!stage) {
    throw new Error(`Stage ${stageId} not found in config`)
  }

  // Check dependencies
  if (!areDependenciesMet(stageId)) {
    throw new Error(`Dependencies not met for stage ${stageId}`)
  }

  const result: StageResult = {
    stageId,
    success: false,
    startTime: new Date(),
    meetsSuccessCriteria: false,
  }

  try {
    console.log(`[Executor] Starting stage: ${stage.name}`)

    // Execute command
    const { stdout, stderr } = await execAsync(stage.command, {
      cwd: process.cwd(),
      timeout: (stage.estimatedDuration + 60) * 1000, // Add 1 minute buffer
    })

    result.endTime = new Date()
    result.duration = result.endTime.getTime() - result.startTime.getTime()

    console.log(`[Executor] Stage ${stageId} completed in ${result.duration}ms`)

    // Read report
    const report = await readLatestReport(stage.outputs.report)
    result.report = report

    if (!report) {
      result.success = false
      result.error = 'No validation report generated'
      result.meetsSuccessCriteria = false
    } else {
      result.success = true
      result.meetsSuccessCriteria = meetsSuccessCriteria(report, stage)

      if (!result.meetsSuccessCriteria) {
        result.error = `Failed success criteria: ${stage.successCriteria}`
      }
    }
  } catch (error: any) {
    result.endTime = new Date()
    result.duration = result.endTime.getTime() - result.startTime.getTime()
    result.success = false
    result.error = error.message
    result.meetsSuccessCriteria = false

    console.error(`[Executor] Stage ${stageId} failed:`, error.message)
  }

  // Update pipeline status
  pipelineStatus.results[stageId] = result
  if (result.success) {
    pipelineStatus.completedStages.push(stageId)
  }

  return result
}

/**
 * Execute entire validation pipeline
 */
export async function executePipeline(): Promise<Record<string, StageResult>> {
  pipelineStatus.running = true
  pipelineStatus.completedStages = []
  pipelineStatus.results = {}

  console.log('[Executor] Starting validation pipeline')

  try {
    // Execute stages in dependency order
    for (const stage of validationConfig.stages) {
      pipelineStatus.currentStage = stage.id

      console.log(`[Executor] Executing stage: ${stage.name}`)

      const result = await executeStage(stage.id)

      // Stop if critical stage fails
      if (stage.criticalPath && !result.meetsSuccessCriteria) {
        console.error(`[Executor] Critical stage ${stage.id} failed. Stopping pipeline.`)
        break
      }
    }

    console.log('[Executor] Pipeline execution complete')
  } finally {
    pipelineStatus.running = false
    pipelineStatus.currentStage = undefined
  }

  return pipelineStatus.results
}

/**
 * Get current pipeline status
 */
export function getPipelineStatus(): PipelineStatus {
  return { ...pipelineStatus }
}

/**
 * Calculate overall migration score from results
 */
export function calculateOverallScore(results: Record<string, StageResult>): number {
  const stages = validationConfig.stages

  let totalWeight = 0
  let weightedScore = 0

  const weights = {
    tables: 0.2,
    functions: 0.3,
    endpoints: 0.3,
    references: 0.2,
  }

  for (const stage of stages) {
    const result = results[stage.id]
    if (!result?.report?.summary) continue

    const weight = weights[stage.id as keyof typeof weights] || 0
    const passRate = result.report.summary.passRate || 0

    weightedScore += passRate * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? weightedScore : 0
}

/**
 * Check if overall success criteria are met
 */
export function meetsOverallCriteria(results: Record<string, StageResult>): boolean {
  const score = calculateOverallScore(results)
  const { minimumScore, criticalStagesMustPass } = validationConfig.overallSuccessCriteria

  // Check score
  if (score < minimumScore) {
    return false
  }

  // Check critical stages
  for (const stageId of criticalStagesMustPass) {
    const result = results[stageId]
    if (!result?.success || !result?.meetsSuccessCriteria) {
      return false
    }
  }

  return true
}
