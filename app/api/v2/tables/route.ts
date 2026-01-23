/**
 * GET /api/v2/tables
 *
 * Fetch V2 workspace tables LIVE via snappy CLI
 */

import { NextResponse } from 'next/server'
import { v2Client } from '@/lib/snappy-client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 200
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1

    const result = await v2Client.listTables({ search, limit, page })

    return NextResponse.json({
      success: true,
      workspace: 'V2 (Normalized)',
      instance: 'x2nu-xcjc-vhax.agentdashboards.xano.io',
      workspace_id: 5,
      ...result,
    })
  } catch (error: any) {
    console.error('[V2 Tables API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
