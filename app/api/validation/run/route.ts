import { NextRequest, NextResponse } from 'next/server'
import { executeStage, executePipeline, getPipelineStatus, areDependenciesMet } from '@/lib/validation-executor'
import { getStage, validationConfig } from '@/validation.config'

/**
 * POST /api/validation/run
 *
 * Execute validation stages using config-driven executor
 */
export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()

    if (!type || !['tables', 'functions', 'endpoints', 'references', 'all'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid validation type. Must be: tables, functions, endpoints, references, or all' },
        { status: 400 }
      )
    }

    // Check if pipeline is already running
    const status = getPipelineStatus()
    if (status.running) {
      return NextResponse.json(
        { error: 'Pipeline is already running', running: true, currentStage: status.currentStage },
        { status: 409 }
      )
    }

    // Execute all stages
    if (type === 'all') {
      // Run in background
      executePipeline().catch(error => {
        console.error('[API] Pipeline execution failed:', error)
      })

      return NextResponse.json({
        success: true,
        message: 'Full pipeline execution started',
        stages: validationConfig.stages.map(s => s.id),
      })
    }

    // Execute single stage
    const stage = getStage(type)
    if (!stage) {
      return NextResponse.json(
        { error: `Stage ${type} not found in config` },
        { status: 404 }
      )
    }

    // Check dependencies
    if (!areDependenciesMet(type)) {
      const unmetDeps = stage.dependencies.filter(depId => {
        const depResult = status.results[depId]
        return !depResult || !depResult.success || !depResult.meetsSuccessCriteria
      })

      return NextResponse.json(
        {
          error: `Dependencies not met for stage ${type}`,
          unmetDependencies: unmetDeps,
          dependencies: stage.dependencies,
        },
        { status: 400 }
      )
    }

    // Run in background
    executeStage(type).catch(error => {
      console.error(`[API] Stage ${type} execution failed:`, error)
    })

    return NextResponse.json({
      success: true,
      message: `Stage ${type} execution started`,
      stage: {
        id: stage.id,
        name: stage.name,
        estimatedDuration: stage.estimatedDuration,
      },
    })
  } catch (error: any) {
    console.error('[API] Validation run error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
