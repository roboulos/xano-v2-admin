import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

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

    // Calculate overall score if we have all reports
    let overallScore = null
    if (reportsByType.tables && reportsByType.functions && reportsByType.endpoints && reportsByType.references) {
      const tableScore = reportsByType.tables.summary.passRate
      const functionScore = reportsByType.functions.summary.passRate
      const endpointScore = reportsByType.endpoints.summary.passRate
      const referenceScore = reportsByType.references.summary.passRate

      overallScore = (tableScore * 0.2 + functionScore * 0.3 + endpointScore * 0.3 + referenceScore * 0.2)
    }

    return NextResponse.json({
      reports: reportsByType,
      overallScore,
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
