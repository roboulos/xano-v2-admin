import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import {
  calculateMigrationScore,
  getDefaultScoreData,
  KNOWN_TOTALS,
  type MigrationScoreData,
} from '@/lib/migration-score'

interface ValidationReport {
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
    metadata?: Record<string, any>
  }>
  duration: number
  timestamp?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'tables', 'functions', 'endpoints', 'references', or null for all

    const reportsDir = path.join(process.cwd(), 'validation-reports')

    // Ensure reports directory exists
    try {
      await fs.access(reportsDir)
    } catch {
      await fs.mkdir(reportsDir, { recursive: true })
      return NextResponse.json({
        reports: {},
        message: 'No validation reports found. Run validations first.',
      })
    }

    // Read all report files
    const files = await fs.readdir(reportsDir)

    if (files.length === 0) {
      return NextResponse.json({
        reports: {},
        message: 'No validation reports found. Run validations first.',
      })
    }

    // Group reports by type
    const reportsByType: Record<string, ValidationReport & { filename: string; timestamp: string }> = {}

    for (const file of files) {
      if (!file.endsWith('.json')) continue

      try {
        const filepath = path.join(reportsDir, file)
        const content = await fs.readFile(filepath, 'utf-8')
        const report: ValidationReport = JSON.parse(content)

        // Extract type from filename (e.g., "table-validation-2026-01-22T10-30-00.json" → "table")
        const match = file.match(/^(table|function|endpoint|reference)-validation/)
        if (match) {
          const reportType = match[1] + 's' // tables, functions, endpoints, references

          // Only include if matches requested type or no type specified
          if (!type || reportType === type) {
            // Get file timestamp
            const stats = await fs.stat(filepath)

            // Keep only the latest report for each type
            if (!reportsByType[reportType] || stats.mtime > new Date(reportsByType[reportType].timestamp)) {
              reportsByType[reportType] = {
                ...report,
                filename: file,
                timestamp: stats.mtime.toISOString(),
              }
            }
          }
        }
      } catch (error) {
        console.error(`Failed to read report ${file}:`, error)
      }
    }

    // Build score data from reports
    const scoreData: MigrationScoreData = {
      tables: {
        validated: reportsByType.tables?.summary.total || 0,
        total: KNOWN_TOTALS.V2_TABLES_VALIDATED,
        passRate: reportsByType.tables?.summary.passRate || 0,
      },
      functions: {
        validated: reportsByType.functions?.summary.total || 0,
        total: KNOWN_TOTALS.V2_FUNCTIONS,
        passRate: reportsByType.functions?.summary.passRate || 0,
      },
      endpoints: {
        validated: reportsByType.endpoints?.summary.total || 0,
        total: KNOWN_TOTALS.V2_ENDPOINTS,
        passRate: reportsByType.endpoints?.summary.passRate || 0,
      },
      references: {
        validated: reportsByType.references?.summary.total || 0,
        total: KNOWN_TOTALS.V2_REFERENCES,
        passRate: reportsByType.references?.summary.passRate || 0,
      },
    }

    // Calculate migration score using shared calculation
    const migrationScore = calculateMigrationScore(scoreData)

    return NextResponse.json({
      reports: reportsByType,
      migrationScore: {
        overall: migrationScore.overall,
        status: migrationScore.status,
        breakdown: {
          tables: migrationScore.tables,
          functions: migrationScore.functions,
          endpoints: migrationScore.endpoints,
          references: migrationScore.references,
        },
        weights: migrationScore.breakdown,
      },
      scoreData,
      message: Object.keys(reportsByType).length > 0 ? 'Reports loaded successfully' : 'No reports found',
    })
  } catch (error: any) {
    console.error('[API] Reports read error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
