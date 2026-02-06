/**
 * GET /api/v1/record-counts
 *
 * Uses the full-count-comparison endpoint (Bulk Migration API group) which does
 * cross-workspace SQL to get V1 and V2 counts for ~50 tables in a single call.
 * This gives an honest like-for-like comparison — same tables counted in both workspaces.
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
        { error: `Xano returned ${res.status}: ${text}` },
        { status: res.status }
      )
    }

    const data: FullComparisonResponse = await res.json()

    // Flatten all categories into a single entity list
    const allEntities: EntityRow[] = [
      ...(data.core ?? []),
      ...(data.financial ?? []),
      ...(data.network ?? []),
      ...(data.team_hierarchy ?? []),
      ...(data.fub ?? []),
      ...(data.logs ?? []),
      ...(data.config ?? []),
    ]

    // Compute totals — only count entities that exist in BOTH workspaces for fair comparison
    // (v1_tid > 0 means it exists in V1, v2_tid > 0 means it exists in V2)
    const comparable = allEntities.filter((e) => e.v1_tid > 0 && e.v2_tid > 0)
    const v1Total = comparable.reduce((sum, e) => sum + e.v1_count, 0)
    const v2Total = comparable.reduce((sum, e) => sum + e.v2_count, 0)

    // Also compute full totals including one-sided entities
    const v1AllTotal = allEntities.reduce((sum, e) => sum + e.v1_count, 0)
    const v2AllTotal = allEntities.reduce((sum, e) => sum + e.v2_count, 0)

    // Group by category for the frontend
    const categories: Record<
      string,
      { entities: EntityRow[]; v1_total: number; v2_total: number }
    > = {}
    for (const entity of allEntities) {
      if (!categories[entity.category]) {
        categories[entity.category] = { entities: [], v1_total: 0, v2_total: 0 }
      }
      categories[entity.category].entities.push(entity)
      categories[entity.category].v1_total += entity.v1_count
      categories[entity.category].v2_total += entity.v2_count
    }

    return NextResponse.json({
      // Like-for-like comparison (only tables that exist in BOTH workspaces)
      comparable_v1_total: v1Total,
      comparable_v2_total: v2Total,
      comparable_tables: comparable.length,
      comparable_gap: v1Total - v2Total,
      comparable_pct: v1Total > 0 ? (v2Total / v1Total) * 100 : 0,
      // Full totals (including one-sided)
      v1_all_total: v1AllTotal,
      v2_all_total: v2AllTotal,
      total_entities: allEntities.length,
      // By category
      categories,
      // Raw entities
      entities: allEntities,
      // Metadata
      timestamp: data.timestamp,
      note: data.note,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
