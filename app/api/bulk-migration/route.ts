/**
 * POST /api/bulk-migration
 *
 * Proxies batch copy requests to the Xano "Bulk Migration" API group (api:eQhit4Ux).
 * Body: { batchSlug: string }
 *
 * Returns the raw Xano response (per-table V1/V2 counts + success flag).
 */

import { NextResponse } from 'next/server'
import { BULK_MIGRATION_BASE, MIGRATION_BATCHES } from '@/lib/bulk-migration-batches'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { batchSlug } = body as { batchSlug?: string }

    if (!batchSlug) {
      return NextResponse.json({ success: false, error: 'batchSlug is required' }, { status: 400 })
    }

    const batch = MIGRATION_BATCHES.find((b) => b.slug === batchSlug)
    if (!batch) {
      return NextResponse.json(
        { success: false, error: `Unknown batch slug: ${batchSlug}` },
        { status: 400 }
      )
    }

    const url = `${BULK_MIGRATION_BASE}/${batchSlug}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(120_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { success: false, error: `Xano returned ${res.status}: ${text}`, batchId: batch.id },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      batchId: batch.id,
      batchSlug,
      result: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Bulk Migration API] Error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
