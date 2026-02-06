/**
 * GET /api/v1/record-counts
 *
 * Returns record counts from BOTH V1 and V2 workspaces:
 * 1. The sync endpoint (5 core entities with V1 vs V2 counts)
 * 2. The V1 workspace-record-counts (24 major tables via Meta API)
 * 3. The V2 table-counts (core V2 table counts via SYSTEM endpoint)
 *
 * Shows the full honest picture — V1 totals, V2 totals, and sync coverage.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SYNC_URL = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/sync-v1-to-v2-direct'
const V1_RECORD_COUNTS_URL =
  'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O/workspace-record-counts'
const V2_TABLE_COUNTS_URL =
  'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:LIdBL1AN/table-counts'

interface SyncEntity {
  entity: string
  v1: number
  v2: number
}

interface SyncResponse {
  entity_counts: SyncEntity[]
}

type RecordCounts = Record<string, number>

function categorize(counts: RecordCounts) {
  const core = [
    'agent',
    'user',
    'transaction',
    'listing',
    'participant',
    'paid_participant',
    'network',
    'contributions',
    'contributors',
    'income',
    'connections',
    'revshare_totals',
  ]
  const fub = [
    'fub_people',
    'fub_calls',
    'fub_events',
    'fub_appointments',
    'fub_deals',
    'fub_text_messages',
  ]
  const logs = ['audits', 'system_audit', 'event_log']
  const lambda = ['lambda_jobs', 'lambda_status', 'lambda_worker']

  const sumGroup = (keys: string[]) => keys.reduce((s, k) => s + (counts[k] ?? 0), 0)

  return {
    core: {
      tables: core.length,
      records: sumGroup(core),
      breakdown: Object.fromEntries(core.map((k) => [k, counts[k] ?? 0])),
    },
    fub: {
      tables: fub.length,
      records: sumGroup(fub),
      breakdown: Object.fromEntries(fub.map((k) => [k, counts[k] ?? 0])),
    },
    logs: {
      tables: logs.length,
      records: sumGroup(logs),
      breakdown: Object.fromEntries(logs.map((k) => [k, counts[k] ?? 0])),
    },
    lambda: {
      tables: lambda.length,
      records: sumGroup(lambda),
      breakdown: Object.fromEntries(lambda.map((k) => [k, counts[k] ?? 0])),
    },
  }
}

export async function GET() {
  try {
    const [syncRes, v1CountsRes, v2CountsRes] = await Promise.allSettled([
      fetch(SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15_000),
      }),
      fetch(V1_RECORD_COUNTS_URL, {
        signal: AbortSignal.timeout(120_000),
      }),
      fetch(V2_TABLE_COUNTS_URL, {
        signal: AbortSignal.timeout(15_000),
      }),
    ])

    // Parse sync data (V1 vs V2 for 5 entities)
    let syncData: SyncResponse | null = null
    if (syncRes.status === 'fulfilled' && syncRes.value.ok) {
      syncData = await syncRes.value.json()
    }

    // Parse V1 detailed counts (24 tables)
    let v1RecordCounts: RecordCounts | null = null
    let v1GrandTotal = 0
    if (v1CountsRes.status === 'fulfilled' && v1CountsRes.value.ok) {
      const raw: RecordCounts = await v1CountsRes.value.json()
      const hasData = Object.values(raw).some((v) => typeof v === 'number' && v > 0)
      if (hasData) {
        v1RecordCounts = raw
        v1GrandTotal = Object.values(raw).reduce(
          (sum, v) => sum + (typeof v === 'number' ? v : 0),
          0
        )
      }
    }

    // Parse V2 table counts (response is nested: { core_tables: {...}, network_tables: {...}, ... })
    let v2RecordCounts: RecordCounts | null = null
    let v2GrandTotal = 0
    let v2TablesCounted = 0
    if (v2CountsRes.status === 'fulfilled' && v2CountsRes.value.ok) {
      const v2Raw = await v2CountsRes.value.json()
      if (v2Raw && typeof v2Raw === 'object') {
        // Flatten nested groups into a single flat map
        const flat: RecordCounts = {}
        for (const [, group] of Object.entries(v2Raw)) {
          if (group && typeof group === 'object' && !Array.isArray(group)) {
            for (const [table, count] of Object.entries(group as RecordCounts)) {
              if (typeof count === 'number') {
                flat[table] = count
              }
            }
          }
        }
        if (Object.keys(flat).length > 0) {
          v2RecordCounts = flat
          v2TablesCounted = Object.keys(flat).length
          v2GrandTotal = Object.values(flat).reduce((sum, v) => sum + v, 0)
        }
      }
    }

    const syncSummary = syncData?.entity_counts ?? []
    const syncTotalV1 = syncSummary.reduce((sum, e) => sum + e.v1, 0)
    const syncTotalV2 = syncSummary.reduce((sum, e) => sum + e.v2, 0)

    return NextResponse.json({
      // V1 data
      grand_total: v1GrandTotal,
      tables_counted: v1RecordCounts ? Object.keys(v1RecordCounts).length : 0,
      total_v1_tables: 251,
      categories: v1RecordCounts ? categorize(v1RecordCounts) : null,
      raw_counts: v1RecordCounts,
      uncounted_tables: 251 - (v1RecordCounts ? Object.keys(v1RecordCounts).length : 0),
      note: 'Remaining ~227 tables contain config, aggregation, staging, charts, AI, page builder, and integration data — estimated additional 500K-2M records.',
      // V2 data
      v2_grand_total: v2GrandTotal,
      v2_tables_counted: v2TablesCounted,
      total_v2_tables: 193,
      v2_raw_counts: v2RecordCounts,
      // Sync data (V1↔V2 entity comparison)
      sync_entities: syncSummary,
      sync_total_v1: syncTotalV1,
      sync_total_v2: syncTotalV2,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
