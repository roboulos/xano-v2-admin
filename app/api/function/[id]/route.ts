/**
 * GET /api/function/[id]?workspace=1|5
 *
 * Get full function details including XanoScript code
 */

import { NextResponse } from 'next/server'
import { v1Client, v2Client } from '@/lib/snappy-client'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const workspace = searchParams.get('workspace') || '5'
    const resolvedParams = await params
    const functionId = parseInt(resolvedParams.id)

    // Choose client based on workspace
    const client = workspace === '1' ? v1Client : v2Client

    // Get full function details
    const result = await client.getFunction(functionId)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      workspace: workspace === '1' ? 'V1' : 'V2',
      function: result,
    })
  } catch (error: any) {
    console.error('[Function Details API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
