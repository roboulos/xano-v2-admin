/**
 * Table Integrity Validation Library
 *
 * Helper functions for validating foreign key relationships
 * and detecting orphaned records in V2 workspace
 */

import { v2Client } from './snappy-client'

export interface ReferenceField {
  fieldName: string
  tableName: string
  referencedTable: string
  referencedField: string
  required: boolean
}

export interface OrphanCheck {
  tableName: string
  fieldName: string
  referencedTable: string
  totalRecords: number
  orphanedRecords: number
  sampleOrphans: any[]
  status: 'valid' | 'orphans_found' | 'error'
  error?: string
}

export interface IntegrityReport {
  totalReferences: number
  validated: number
  orphansFound: number
  tablesChecked: number
  checks: OrphanCheck[]
  timestamp: string
}

/**
 * Parse reference field format: "table.field"
 */
export function parseReference(reference: string): { table: string; field: string } {
  const [table, field] = reference.split('.')
  return { table, field }
}

/**
 * Extract all foreign key relationships from a table schema
 */
export function extractReferences(schema: any): ReferenceField[] {
  const references: ReferenceField[] = []

  if (!schema || !schema.schema || !schema.schema.fields) {
    return references
  }

  const fields = schema.schema.fields

  for (const field of fields) {
    // Check if field has a reference property
    if (field.reference) {
      const { table, field: refField } = parseReference(field.reference)
      references.push({
        fieldName: field.name,
        tableName: schema.name,
        referencedTable: table,
        referencedField: refField,
        required: field.required || false,
      })
    }
  }

  return references
}

/**
 * Check for orphaned records in a specific foreign key relationship
 *
 * Strategy: Query the table and check if referenced records exist
 * Sample a subset of records to avoid long queries
 */
export async function checkOrphans(
  tableName: string,
  fieldName: string,
  referencedTable: string,
  referencedField: string,
  sampleSize: number = 100
): Promise<OrphanCheck> {
  try {
    // Query the table with the foreign key
    const data = await v2Client.queryTable(tableName, {
      limit: sampleSize,
    })

    if (!data || !data.items) {
      return {
        tableName,
        fieldName,
        referencedTable,
        totalRecords: 0,
        orphanedRecords: 0,
        sampleOrphans: [],
        status: 'valid',
      }
    }

    const records = data.items
    const orphans: Array<{
      id: number
      [key: string]: unknown
      referencedTable: string
      referencedField: string
      message: string
    }> = []

    // For each record, check if the referenced record exists
    for (const record of records) {
      const foreignKeyValue = record[fieldName]

      // Skip null foreign keys (allowed if field is not required)
      if (foreignKeyValue === null || foreignKeyValue === undefined) {
        continue
      }

      try {
        // Query the referenced table to see if the record exists
        const refData = await v2Client.queryTable(referencedTable, {
          limit: 1,
          filters: {
            [referencedField]: foreignKeyValue,
          },
        })

        // If no matching record found, this is an orphan
        if (!refData || !refData.items || refData.items.length === 0) {
          orphans.push({
            id: record.id,
            [fieldName]: foreignKeyValue,
            referencedTable,
            referencedField,
            message: `References ${referencedTable}.${referencedField}=${foreignKeyValue} (not found)`,
          })
        }
      } catch (error) {
        // If referenced table doesn't exist or query fails, note it
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.warn(`[Integrity] Error checking reference from ${tableName}.${fieldName} to ${referencedTable}:`, message)
      }
    }

    return {
      tableName,
      fieldName,
      referencedTable,
      totalRecords: records.length,
      orphanedRecords: orphans.length,
      sampleOrphans: orphans.slice(0, 5), // Return max 5 sample orphans
      status: orphans.length > 0 ? 'orphans_found' : 'valid',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      tableName,
      fieldName,
      referencedTable,
      totalRecords: 0,
      orphanedRecords: 0,
      sampleOrphans: [],
      status: 'error',
      error: message,
    }
  }
}

/**
 * Generate SQL-like query for manual orphan detection (for reference)
 */
export function generateOrphanQuery(
  tableName: string,
  fieldName: string,
  referencedTable: string,
  referencedField: string
): string {
  return `
-- Check for orphaned records in ${tableName}
SELECT
  t.id,
  t.${fieldName}
FROM ${tableName} t
LEFT JOIN ${referencedTable} r
  ON t.${fieldName} = r.${referencedField}
WHERE
  t.${fieldName} IS NOT NULL
  AND r.${referencedField} IS NULL
LIMIT 100;
  `.trim()
}

/**
 * Count all foreign key references across all tables
 */
export async function countAllReferences(): Promise<number> {
  try {
    // Fetch all tables
    let allTables: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const result = await v2Client.listTables({ limit: 50, page })
      allTables.push(...result.tables)
      hasMore = result.tables.length === 50
      page++
      if (page > 10) break // Safety limit
    }

    let totalReferences = 0

    // For each table, get schema and count references
    for (const table of allTables) {
      try {
        const schema = await v2Client.getTableSchema(table.id)
        const refs = extractReferences(schema)
        totalReferences += refs.length
      } catch (error) {
        // Skip tables that can't be accessed
        continue
      }
    }

    return totalReferences
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Integrity] Error counting references:', message)
    throw error
  }
}
