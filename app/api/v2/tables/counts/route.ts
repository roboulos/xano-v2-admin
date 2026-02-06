/**
 * GET /api/v2/tables/counts
 *
 * Fetch V1 vs V2 record counts via the full-count-comparison endpoint.
 * Uses cross-workspace SQL for accurate like-for-like comparison.
 *
 * Previously used snappy CLI (slow, fragile, depended on local binary).
 * Now uses the same Bulk Migration API endpoint as the Record Census tab.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FULL_COMPARISON_URL =
  'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:eQhit4Ux/full-count-comparison'

interface EntityRow {
  entity: string
  category: string
  v1_tid: number
  v2_tid: number
  v1_count: number
  v2_count: number
}

interface FullComparisonResponse {
  core: EntityRow[]
  financial: EntityRow[]
  network: EntityRow[]
  team_hierarchy: EntityRow[]
  fub: EntityRow[]
  logs: EntityRow[]
  config: EntityRow[]
  timestamp: string
  note: string
}

export async function GET() {
  try {
    const res = await fetch(FULL_COMPARISON_URL, {
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { success: false, error: `Xano returned ${res.status}: ${text}` },
        { status: res.status }
      )
    }

    const data: FullComparisonResponse = await res.json()

    // Flatten all categories
    const allEntities: EntityRow[] = [
      ...(data.core ?? []),
      ...(data.financial ?? []),
      ...(data.network ?? []),
      ...(data.team_hierarchy ?? []),
      ...(data.fub ?? []),
      ...(data.logs ?? []),
      ...(data.config ?? []),
    ]

    // Count tables per workspace
    const v1TableCount = allEntities.filter((e) => e.v1_tid > 0).length
    const v2TableCount = allEntities.filter((e) => e.v2_tid > 0).length

    // Sum record counts
    const v1TotalRecords = allEntities.reduce((sum, e) => sum + e.v1_count, 0)
    const v2TotalRecords = allEntities.reduce((sum, e) => sum + e.v2_count, 0)

    // Like-for-like comparison (only tables in BOTH workspaces)
    const comparable = allEntities.filter((e) => e.v1_tid > 0 && e.v2_tid > 0)
    const comparableV1 = comparable.reduce((sum, e) => sum + e.v1_count, 0)
    const comparableV2 = comparable.reduce((sum, e) => sum + e.v2_count, 0)
    const percentage = comparableV1 > 0 ? Math.round((comparableV2 / comparableV1) * 100) : 0

    return NextResponse.json({
      success: true,
      timestamp: data.timestamp || new Date().toISOString(),
      v1: {
        workspace: 'V1 (Production)',
        instance: 'xmpx-swi5-tlvy.n7c.xano.io',
        workspace_id: 1,
        table_count: v1TableCount,
        total_records: v1TotalRecords,
      },
      v2: {
        workspace: 'V2 (Normalized)',
        instance: 'x2nu-xcjc-vhax.agentdashboards.xano.io',
        workspace_id: 5,
        table_count: v2TableCount,
        total_records: v2TotalRecords,
      },
      comparison: {
        percentage,
        delta: comparableV2 - comparableV1,
        comparable_tables: comparable.length,
        status: percentage >= 95 ? 'READY' : percentage >= 80 ? 'NEAR_READY' : 'IN_PROGRESS',
      },
    })
  } catch (error: any) {
    console.error('[V2 Tables Counts API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
