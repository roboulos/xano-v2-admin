/**
 * GET /api/v2/tables/integrity
 *
 * Validate foreign key relationships in V2 workspace
 * Checks for orphaned records (references to non-existent records)
 *
 * Strategy:
 * 1. Fetch all V2 tables
 * 2. For each table, get schema and identify foreign key fields
 * 3. Sample records from tables with foreign keys
 * 4. Check if referenced records exist
 * 5. Return summary of all checks
 */

import { NextResponse } from 'next/server'
import { v2Client } from '@/lib/snappy-client'
import {
  extractReferences,
  checkOrphans,
  countAllReferences,
  type IntegrityReport,
  type OrphanCheck,
} from '@/lib/table-integrity'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for thorough checks

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sampleSize = parseInt(searchParams.get('sample_size') || '20', 10)
    const maxTables = parseInt(searchParams.get('max_tables') || '20', 10)

    console.log(`[Integrity API] Starting integrity check (sample_size: ${sampleSize}, max_tables: ${maxTables})`)

    // Step 1: Count all foreign key references across workspace
    console.log('[Integrity API] Counting total foreign key references...')
    const totalReferences = await countAllReferences()
    console.log(`[Integrity API] Found ${totalReferences} total foreign key references`)

    // Step 2: Fetch sample of tables to check
    console.log('[Integrity API] Fetching sample tables...')
    const result = await v2Client.listTables({ limit: 50, page: 1 })
    const tables = result.tables.slice(0, maxTables) // Limit to sample size

    console.log(`[Integrity API] Checking ${tables.length} tables for foreign key integrity...`)

    // Step 3: Check each table's foreign keys
    const checks: OrphanCheck[] = []
    let tablesWithReferences = 0

    for (const table of tables) {
      try {
        // Get table schema
        const schema = await v2Client.getTableSchema(table.id)

        // Extract foreign key references
        const references = extractReferences(schema)

        if (references.length === 0) {
          continue // Skip tables with no foreign keys
        }

        tablesWithReferences++
        console.log(`[Integrity API] Checking ${table.name} (${references.length} foreign keys)`)

        // Check each foreign key relationship
        for (const ref of references) {
          const check = await checkOrphans(
            ref.tableName,
            ref.fieldName,
            ref.referencedTable,
            ref.referencedField,
            sampleSize
          )
          checks.push(check)

          if (check.status === 'orphans_found') {
            console.log(
              `[Integrity API] ⚠️ Orphans found in ${table.name}.${ref.fieldName}: ${check.orphanedRecords}/${check.totalRecords}`
            )
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[Integrity API] Error checking table ${table.name}:`, message)
        // Continue checking other tables
      }
    }

    // Step 4: Calculate summary statistics
    const orphansFound = checks.reduce((sum, check) => sum + check.orphanedRecords, 0)
    const validated = checks.length
    const tablesChecked = tablesWithReferences

    const report: IntegrityReport = {
      totalReferences,
      validated,
      orphansFound,
      tablesChecked,
      checks: checks.sort((a, b) => b.orphanedRecords - a.orphanedRecords), // Sort by orphan count (desc)
      timestamp: new Date().toISOString(),
    }

    console.log('[Integrity API] Check complete:', {
      totalReferences,
      validated,
      orphansFound,
      tablesChecked,
    })

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error')
    console.error('[Integrity API] Error:', err)
    console.error('[Integrity API] Stack:', err.stack)
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        stack: err.stack,
      },
      { status: 500 }
    )
  }
}
