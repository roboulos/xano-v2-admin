/**
 * GET /api/v1/record-counts
 *
 * Returns V1 workspace record counts from multiple sources:
 * 1. The sync endpoint (5 core entities with V1 vs V2 counts)
 * 2. The workspace-record-counts Xano endpoint (24 major tables via Meta API)
 *
 * The 24 tables cover 25M+ records across core, FUB, logs, and lambda categories.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SYNC_URL = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/sync-v1-to-v2-direct'
const RECORD_COUNTS_URL =
  'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:g79A_W7O/workspace-record-counts'

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
    const [syncRes, countsRes] = await Promise.allSettled([
      fetch(SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15_000),
      }),
      fetch(RECORD_COUNTS_URL, {
        signal: AbortSignal.timeout(120_000),
      }),
    ])

    // Parse sync data (V1 vs V2 for 5 entities)
    let syncData: SyncResponse | null = null
    if (syncRes.status === 'fulfilled' && syncRes.value.ok) {
      syncData = await syncRes.value.json()
    }

    // Parse detailed counts (24 tables)
    let recordCounts: RecordCounts | null = null
    let grandTotal = 0
    if (countsRes.status === 'fulfilled' && countsRes.value.ok) {
      const raw: RecordCounts = await countsRes.value.json()
      const hasData = Object.values(raw).some((v) => typeof v === 'number' && v > 0)
      if (hasData) {
        recordCounts = raw
        grandTotal = Object.values(raw).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0)
      }
    }

    const syncSummary = syncData?.entity_counts ?? []
    const syncTotal = syncSummary.reduce((sum, e) => sum + e.v1, 0)

    return NextResponse.json({
      grand_total: grandTotal,
      tables_counted: recordCounts ? Object.keys(recordCounts).length : 0,
      total_v1_tables: 251,
      sync_entities: syncSummary,
      sync_total_v1: syncTotal,
      categories: recordCounts ? categorize(recordCounts) : null,
      raw_counts: recordCounts,
      uncounted_tables: 251 - (recordCounts ? Object.keys(recordCounts).length : 0),
      note: 'Remaining ~227 tables contain config, aggregation, staging, charts, AI, page builder, and integration data — estimated additional 500K-2M records.',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
