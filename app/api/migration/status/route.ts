/**
 * GET /api/migration/status
 *
 * Live V1 ↔ V2 migration status comparison
 * Fetches real-time record counts from Xano + validation results
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
import { V2_TASKS_TOTAL, V2_WORKERS_TOTAL, V2_ACTIVE_FUNCTIONS } from '@/lib/dashboard-constants'

export const dynamic = 'force-dynamic'

interface EntityCount {
  entity: string
  v1: number
  v2: number
}

interface LiveSyncResponse {
  entity_counts: EntityCount[]
}

/**
 * Fetch live V1 vs V2 record counts from Xano
 */
async function getLiveEntityCounts(): Promise<EntityCount[]> {
  try {
    const res = await fetch(
      'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/sync-v1-to-v2-direct',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    )

    if (!res.ok) {
      console.error('[Migration Status] Failed to fetch live counts:', res.status)
      return []
    }

    const data: LiveSyncResponse = await res.json()
    return data.entity_counts || []
  } catch (error) {
    console.error('[Migration Status] Error fetching live counts:', error)
    return []
  }
}

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

    // Get live V1 vs V2 record counts from Xano
    const liveEntityCounts = await getLiveEntityCounts()

    // Calculate sync percentages for each entity
    const dataSyncStatus = liveEntityCounts.map((entity) => {
      const syncPercent = entity.v1 > 0 ? Math.round((entity.v2 / entity.v1) * 100 * 10) / 10 : 100
      return {
        entity: entity.entity,
        v1_count: entity.v1,
        v2_count: entity.v2,
        sync_percent: Math.min(syncPercent, 100), // Cap at 100%
        delta: entity.v2 - entity.v1,
        status: syncPercent >= 99 ? 'synced' : syncPercent >= 90 ? 'partial' : 'pending',
      }
    })

    // Calculate overall data sync progress
    const totalV1 = liveEntityCounts.reduce((sum, e) => sum + e.v1, 0)
    const totalV2 = liveEntityCounts.reduce((sum, e) => sum + e.v2, 0)
    const overallSyncPercent = totalV1 > 0 ? Math.round((totalV2 / totalV1) * 100 * 10) / 10 : 0

    // V2 function breakdown from dashboard-constants.ts
    const archiveCount = KNOWN_TOTALS.V2_FUNCTIONS - V2_ACTIVE_FUNCTIONS // ~668

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      v1: {
        workspace: 'V1 (Production)',
        tables: {
          count: KNOWN_TOTALS.V1_TABLES,
        },
        // V1 functions/endpoints not tracked by validation - only V2 is validated
        functions: {
          count: null, // Not tracked
        },
        api_groups: {
          count: null, // Not tracked
        },
        endpoints: {
          count: null, // Not tracked
        },
      },
      v2: {
        workspace: 'V2 (Normalized)',
        tables: {
          count: KNOWN_TOTALS.V2_TABLES,
          validated: KNOWN_TOTALS.V2_TABLES_VALIDATED,
        },
        functions: {
          count: KNOWN_TOTALS.V2_FUNCTIONS,
          active: V2_ACTIVE_FUNCTIONS,
          breakdown: {
            archive: archiveCount,
            workers: V2_WORKERS_TOTAL,
            tasks: V2_TASKS_TOTAL,
          },
        },
        api_groups: {
          count: 25, // From API_GROUPS_DATA in v2-data.ts
        },
        endpoints: {
          count: KNOWN_TOTALS.V2_ENDPOINTS,
        },
      },
      comparison: {
        tables: {
          gap: KNOWN_TOTALS.V1_TABLES - KNOWN_TOTALS.V2_TABLES,
          v1_to_v2_ratio: KNOWN_TOTALS.V2_TABLES / KNOWN_TOTALS.V1_TABLES,
          description: `V1 had ${KNOWN_TOTALS.V1_TABLES} tables with redundancy, V2 normalized to ${KNOWN_TOTALS.V2_TABLES} tables`,
          explanation:
            '58 fewer tables through normalization - split tables (user → 5, agent → 5, transaction → 4) replaced redundant aggregation tables',
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
      // Live V1 ↔ V2 data sync status (fetched from Xano)
      data_sync: {
        entities: dataSyncStatus,
        totals: {
          v1_records: totalV1,
          v2_records: totalV2,
          sync_percent: overallSyncPercent,
          status:
            overallSyncPercent >= 99 ? 'synced' : overallSyncPercent >= 90 ? 'partial' : 'pending',
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
