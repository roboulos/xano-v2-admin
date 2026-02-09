/**
 * GET /api/v1/record-counts
 *
 * Uses the full-count-comparison endpoint (Bulk Migration API group) which does
 * cross-workspace SQL to count records in V1 and V2 across 238 tables.
 * 13 V1 tables are excluded because they lack cross-workspace SQL aliases.
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

export async function GET() {
  try {
    const res = await fetch(FULL_COMPARISON_URL, {
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `Xano returned ${res.status}: ${text}` },
        { status: res.status }
      )
    }

    const data: Record<string, unknown> = await res.json()

    // Dynamically flatten all array categories into a single entity list
    const allEntities: EntityRow[] = []
    for (const [, val] of Object.entries(data)) {
      if (Array.isArray(val)) {
        for (const row of val) {
          if (row && typeof row === 'object' && 'entity' in row) {
            allEntities.push(row as EntityRow)
          }
        }
      }
    }

    // Compute totals — only count entities that exist in BOTH workspaces for fair comparison
    const comparable = allEntities.filter((e) => e.v1_tid > 0 && e.v2_tid > 0)
    const v1ComparableTotal = comparable.reduce((sum, e) => sum + e.v1_count, 0)
    const v2ComparableTotal = comparable.reduce((sum, e) => sum + e.v2_count, 0)

    // Full totals including one-sided entities
    const v1AllTotal = allEntities.reduce((sum, e) => sum + e.v1_count, 0)
    const v2AllTotal = allEntities.reduce((sum, e) => sum + e.v2_count, 0)

    // Group by category for the frontend
    const categories: Record<
      string,
      { entities: EntityRow[]; v1_total: number; v2_total: number }
    > = {}
    for (const entity of allEntities) {
      const cat = entity.category ?? 'unknown'
      if (!categories[cat]) {
        categories[cat] = { entities: [], v1_total: 0, v2_total: 0 }
      }
      categories[cat].entities.push(entity)
      categories[cat].v1_total += entity.v1_count
      categories[cat].v2_total += entity.v2_count
    }

    return NextResponse.json({
      // Like-for-like comparison (only tables that exist in BOTH workspaces)
      comparable_v1_total: v1ComparableTotal,
      comparable_v2_total: v2ComparableTotal,
      comparable_tables: comparable.length,
      comparable_gap: v1ComparableTotal - v2ComparableTotal,
      comparable_pct: v1ComparableTotal > 0 ? (v2ComparableTotal / v1ComparableTotal) * 100 : 0,
      // Full V1 total (what the census should show)
      v1_all_total: v1AllTotal,
      v2_all_total: v2AllTotal,
      total_entities: allEntities.length,
      // 13 tables excluded from SQL due to missing cross-workspace aliases
      excluded_tables: 13,
      total_v1_tables: 251,
      tables_covered: allEntities.filter((e) => e.v1_tid > 0).length,
      // By category
      categories,
      // Raw entities
      entities: allEntities,
      // Metadata
      timestamp: data.timestamp as string,
      excluded_note: data.excluded_tables as string,
      note: data.note as string,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
