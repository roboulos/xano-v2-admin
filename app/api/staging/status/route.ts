/**
 * GET /api/staging/status?user_id=X
 *
 * Proxies the SYSTEM /staging-status endpoint from the V2 Xano workspace.
 * Returns staging table status for a given user.
 */

import { NextResponse } from 'next/server'
import { MCP_BASES } from '@/lib/mcp-endpoints'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'user_id query parameter is required' },
      { status: 400 }
    )
  }

  try {
    const url = `${MCP_BASES.SYSTEM}/staging-status?user_id=${encodeURIComponent(userId)}`
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { success: false, error: `Xano returned ${res.status}: ${text}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Staging Status API] Error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
