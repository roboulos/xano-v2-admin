/**
 * POST /api/v2/sync-status
 *
 * Proxy for live V1 ↔ V2 entity count comparison.
 * Keeps the Xano URL server-side.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SYNC_ENDPOINT =
  'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:20LTQtIX/sync-v1-to-v2-direct'

export async function POST() {
  try {
    const res = await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream returned ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
