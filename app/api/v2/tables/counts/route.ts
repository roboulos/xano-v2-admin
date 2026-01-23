/**
 * GET /api/v2/tables/counts
 *
 * Fetch V1 vs V2 record counts LIVE via snappy CLI
 * Compares total record counts between production V1 and normalized V2 workspaces
 */

import { NextResponse } from 'next/server'
import { v1Client, v2Client } from '@/lib/snappy-client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch tables from both workspaces
    // NOTE: Snappy CLI returns max 50 tables per page, so we'll fetch all pages
    console.log('[Counts API] Fetching all tables from V1 and V2...')

    // Fetch all pages for V1
    const v1Tables = []
    let v1Page = 1
    let v1HasMore = true
    while (v1HasMore) {
      const page = await v1Client.listTables({ limit: 50, page: v1Page })
      v1Tables.push(...page.tables)
      v1HasMore = page.tables.length === 50 // Continue if we got a full page
      v1Page++
      if (v1Page > 10) break // Safety limit to prevent infinite loops
    }

    // Fetch all pages for V2
    const v2Tables = []
    let v2Page = 1
    let v2HasMore = true
    while (v2HasMore) {
      const page = await v2Client.listTables({ limit: 50, page: v2Page })
      v2Tables.push(...page.tables)
      v2HasMore = page.tables.length === 50 // Continue if we got a full page
      v2Page++
      if (v2Page > 10) break // Safety limit to prevent infinite loops
    }

    console.log('[Counts API] V1 tables fetched:', v1Tables.length)
    console.log('[Counts API] V2 tables fetched:', v2Tables.length)

    // Helper function to parse record count (can be string, number, or undefined)
    // record_count can be: 0, 123, "1,234", "1+" (means at least 1)
    const parseRecordCount = (recordCount: any): number => {
      if (recordCount === null || recordCount === undefined) return 0
      if (typeof recordCount === 'number') return recordCount
      if (typeof recordCount === 'string') {
        // Handle "1+" case - use 1 as the count
        if (recordCount.includes('+')) {
          return 1
        }
        // Remove commas and parse
        const cleaned = recordCount.replace(/,/g, '')
        const parsed = parseInt(cleaned, 10)
        return isNaN(parsed) ? 0 : parsed
      }
      return 0
    }

    // Sum up all record counts from V1
    let v1TotalRecords = 0
    for (const table of v1Tables) {
      v1TotalRecords += parseRecordCount(table.record_count)
    }

    // Sum up all record counts from V2
    let v2TotalRecords = 0
    for (const table of v2Tables) {
      v2TotalRecords += parseRecordCount(table.record_count)
    }

    // Calculate percentage
    const percentage = v1TotalRecords > 0
      ? Math.round((v2TotalRecords / v1TotalRecords) * 100)
      : 0

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      v1: {
        workspace: 'V1 (Production)',
        instance: 'xmpx-swi5-tlvy.n7c.xano.io',
        workspace_id: 1,
        table_count: v1Tables.length,
        total_records: v1TotalRecords,
      },
      v2: {
        workspace: 'V2 (Normalized)',
        instance: 'x2nu-xcjc-vhax.agentdashboards.xano.io',
        workspace_id: 5,
        table_count: v2Tables.length,
        total_records: v2TotalRecords,
      },
      comparison: {
        percentage,
        delta: v2TotalRecords - v1TotalRecords,
        status: percentage >= 95 ? 'READY' : percentage >= 80 ? 'NEAR_READY' : 'IN_PROGRESS',
      },
    })
  } catch (error: any) {
    console.error('[V2 Tables Counts API] Error:', error)
    console.error('[V2 Tables Counts API] Stack:', error.stack)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
