/**
 * GET /api/migration/status
 *
 * Live V1 ↔ V2 migration status comparison
 * Uses known counts from migration plan + validation results
 */

import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import {
  calculateMigrationScore,
  getDefaultScoreData,
  KNOWN_TOTALS,
  type MigrationScoreData,
} from '@/lib/migration-score'

export const dynamic = 'force-dynamic'

interface ValidationReport {
  summary: {
    total: number
    passed: number
    failed: number
    passRate: number
  }
}

/**
 * Read validation reports from disk to get real scores
 */
async function getValidationScores(): Promise<MigrationScoreData> {
  const reportsDir = path.join(process.cwd(), 'validation-reports')

  try {
    await fs.access(reportsDir)
  } catch {
    // No reports yet - return zeros
    return getDefaultScoreData()
  }

  const files = await fs.readdir(reportsDir)
  const reportsByType: Record<string, ValidationReport> = {}

  // Read latest report for each type
  for (const file of files) {
    if (!file.endsWith('.json')) continue

    const match = file.match(/^(table|function|endpoint|reference)-validation/)
    if (!match) continue

    const reportType = match[1] + 's' // tables, functions, endpoints, references

    try {
      const filepath = path.join(reportsDir, file)
      const content = await fs.readFile(filepath, 'utf-8')
      const report: ValidationReport = JSON.parse(content)

      // Keep only latest (files are sorted by timestamp in filename)
      const stats = await fs.stat(filepath)
      if (!reportsByType[reportType]) {
        reportsByType[reportType] = report
      } else {
        const existingFile = path.join(
          reportsDir,
          files.find((f) => f.includes(reportType.slice(0, -1))) || ''
        )
        const existingStats = await fs.stat(existingFile)
        if (stats.mtime > existingStats.mtime) {
          reportsByType[reportType] = report
        }
      }
    } catch (error) {
      console.error(`Failed to read report ${file}:`, error)
    }
  }

  // Build score data from reports
  return {
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
}

export async function GET() {
  try {
    // Get real validation scores from reports
    const scoreData = await getValidationScores()
    const migrationScore = calculateMigrationScore(scoreData)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      v1: {
        workspace: 'V1 (Production)',
        instance: 'xmpx-swi5-tlvy.n7c.xano.io',
        workspace_id: 1,
        tables: {
          count: KNOWN_TOTALS.V1_TABLES,
          total_records: '~500K', // Estimated from production
        },
        functions: {
          count: KNOWN_TOTALS.V1_FUNCTIONS,
        },
        api_groups: {
          count: 15, // Estimated
        },
        endpoints: {
          count: KNOWN_TOTALS.V1_ENDPOINTS,
        },
      },
      v2: {
        workspace: 'V2 (Normalized)',
        instance: 'x2nu-xcjc-vhax.agentdashboards.xano.io',
        workspace_id: 5,
        tables: {
          count: KNOWN_TOTALS.V2_TABLES,
          total_records: '~500K', // Synced from V1
          validated: KNOWN_TOTALS.V2_TABLES_VALIDATED, // From validation scripts
        },
        functions: {
          count: KNOWN_TOTALS.V2_FUNCTIONS,
          breakdown: {
            archive: 700,
            workers: 100,
            tasks: 50,
            endpoints: 121,
          },
        },
        api_groups: {
          count: 27, // 27 API groups identified
          major: 5, // Frontend API v2, WORKERS, TASKS, SYSTEM, SEEDING
        },
        endpoints: {
          count: KNOWN_TOTALS.V2_ENDPOINTS,
          breakdown: {
            frontend_api_v2: 200,
            workers: 374,
            tasks: 165,
            system: 38,
            seeding: 24,
          },
        },
      },
      comparison: {
        tables: {
          gap: KNOWN_TOTALS.V1_TABLES - KNOWN_TOTALS.V2_TABLES,
          v1_to_v2_ratio: KNOWN_TOTALS.V2_TABLES / KNOWN_TOTALS.V1_TABLES,
          description: 'V1 had 251 tables with redundancy, V2 normalized to 193 tables',
          explanation:
            '58 fewer tables through normalization - split tables (user → 5, agent → 5, transaction → 4) replaced redundant aggregation tables',
        },
        functions: {
          gap: 0,
          v1_to_v2_ratio: 1,
          description: 'Same function count, reorganized by domain (Archive/*, Workers/, Tasks/)',
        },
        endpoints: {
          gap: KNOWN_TOTALS.V2_ENDPOINTS - KNOWN_TOTALS.V1_ENDPOINTS,
          v1_to_v2_ratio: KNOWN_TOTALS.V2_ENDPOINTS / KNOWN_TOTALS.V1_ENDPOINTS,
          description: 'V2 has +1 endpoint - refactored API groups with clearer separation',
        },
      },
      migration_score: {
        tables: migrationScore.tables,
        functions: migrationScore.functions,
        endpoints: migrationScore.endpoints,
        references: migrationScore.references,
        overall: migrationScore.overall,
        status: migrationScore.status,
        breakdown: migrationScore.breakdown,
      },
      validation_results: {
        tables: {
          validated: scoreData.tables.validated,
          total: scoreData.tables.total,
          pass_rate: scoreData.tables.passRate,
        },
        functions: {
          validated: scoreData.functions.validated,
          total: scoreData.functions.total,
          pass_rate: scoreData.functions.passRate,
        },
        endpoints: {
          validated: scoreData.endpoints.validated,
          total: scoreData.endpoints.total,
          pass_rate: scoreData.endpoints.passRate,
        },
        references: {
          validated: scoreData.references.validated,
          total: scoreData.references.total,
          pass_rate: scoreData.references.passRate,
        },
      },
    })
  } catch (error: any) {
    console.error('[Migration Status API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
