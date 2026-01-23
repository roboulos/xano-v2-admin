/**
 * GET /api/v1/tables
 *
 * Fetch V1 workspace tables LIVE via snappy CLI
 */

import { NextResponse } from 'next/server'
import { v1Client } from '@/lib/snappy-client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 200
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1

    const result = await v1Client.listTables({ search, limit, page })

    return NextResponse.json({
      success: true,
      workspace: 'V1 (Production)',
      instance: 'xmpx-swi5-tlvy.n7c.xano.io',
      workspace_id: 1,
      ...result,
    })
  } catch (error: any) {
    console.error('[V1 Tables API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
