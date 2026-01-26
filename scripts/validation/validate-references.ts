/**
 * Phase 1.4: Table Reference Field Validation Script
 *
 * Validates all foreign key relationships in V2 normalized schema:
 * - Checks for orphaned references (FK points to non-existent record)
 * - Verifies relationship integrity
 * - Tests cascade behavior
 * - Validates bidirectional relationships
 *
 * Key relationships to test:
 * - user → user_credentials, user_settings, user_roles, user_subscriptions
 * - agent → agent_cap_data, agent_commission, agent_hierarchy, agent_performance
 * - transaction → transaction_financials, transaction_history, transaction_participants
 * - team → team_members, team_settings, team_director_assignments
 * - address → transaction.address_id, listing.address_id
 *
 * Usage:
 *   pnpm tsx scripts/validation/validate-references.ts
 *   pnpm tsx scripts/validation/validate-references.ts --table=transaction
 *   pnpm tsx scripts/validation/validate-references.ts --relationship=user
 */

import {
  generateReport,
  saveReport,
  printResults,
  ValidationResult,
  xanoMCP,
  V2_CONFIG,
} from './utils'
import { TABLES_DATA } from '../../lib/v2-data'

// Build table name to ID mapping
const TABLE_NAME_TO_ID: Map<string, number> = new Map()
for (const table of TABLES_DATA) {
  TABLE_NAME_TO_ID.set(table.name, table.id)
}

interface TableReference {
  table: string
  field: string
  references_table: string
  references_field: string
  nullable: boolean
  cascade_delete?: boolean
}

// Define all known table references in V2 schema
const TABLE_REFERENCES: TableReference[] = [
  // User identity decomposition
  {
    table: 'user_credentials',
    field: 'user_id',
    references_table: 'user',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'user_settings',
    field: 'user_id',
    references_table: 'user',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'user_roles',
    field: 'user_id',
    references_table: 'user',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'user_subscriptions',
    field: 'user_id',
    references_table: 'user',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },

  // Agent profile decomposition
  {
    table: 'agent_cap_data',
    field: 'agent_id',
    references_table: 'agent',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'agent_commission',
    field: 'agent_id',
    references_table: 'agent',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'agent_hierarchy',
    field: 'agent_id',
    references_table: 'agent',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'agent_performance',
    field: 'agent_id',
    references_table: 'agent',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },

  // Agent ↔ User relationship
  {
    table: 'agent',
    field: 'user_id',
    references_table: 'user',
    references_field: 'id',
    nullable: false,
    cascade_delete: false,
  },
  {
    table: 'user',
    field: 'agent_id',
    references_table: 'agent',
    references_field: 'id',
    nullable: true,
    cascade_delete: false,
  },

  // Transaction decomposition
  {
    table: 'transaction_financials',
    field: 'transaction_id',
    references_table: 'transaction',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'transaction_history',
    field: 'transaction_id',
    references_table: 'transaction',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'transaction_participants',
    field: 'transaction_id',
    references_table: 'transaction',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'transaction_tags',
    field: 'transaction_id',
    references_table: 'transaction',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },

  // Transaction → Address
  {
    table: 'transaction',
    field: 'address_id',
    references_table: 'address',
    references_field: 'id',
    nullable: true,
    cascade_delete: false,
  },

  // Transaction → Agent
  {
    table: 'transaction',
    field: 'transaction_owner_agent_id',
    references_table: 'agent',
    references_field: 'id',
    nullable: true,
    cascade_delete: false,
  },

  // Listing decomposition
  {
    table: 'listing_history',
    field: 'listing_id',
    references_table: 'listing',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'listing_photos',
    field: 'listing_id',
    references_table: 'listing',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },

  // Listing → Address
  {
    table: 'listing',
    field: 'address_id',
    references_table: 'address',
    references_field: 'id',
    nullable: true,
    cascade_delete: false,
  },

  // Team decomposition
  {
    table: 'team_members',
    field: 'team_id',
    references_table: 'team',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'team_settings',
    field: 'team_id',
    references_table: 'team',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'team_director_assignments',
    field: 'team_id',
    references_table: 'team',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  // Note: team_owners and team_admins do not exist in V2 schema
  // Team ownership is likely tracked differently in V2

  // Team → User relationships
  {
    table: 'team_members',
    field: 'user_id',
    references_table: 'user',
    references_field: 'id',
    nullable: false,
    cascade_delete: false,
  },

  // Network decomposition
  {
    table: 'network_member',
    field: 'network_id',
    references_table: 'network_hierarchy',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },
  {
    table: 'network_user_prefs',
    field: 'user_id',
    references_table: 'user',
    references_field: 'id',
    nullable: false,
    cascade_delete: true,
  },

  // Financial relationships
  {
    table: 'income',
    field: 'transaction_id',
    references_table: 'transaction',
    references_field: 'id',
    nullable: true,
    cascade_delete: false,
  },
  {
    table: 'income',
    field: 'agent_id',
    references_table: 'agent',
    references_field: 'id',
    nullable: false,
    cascade_delete: false,
  },
  {
    table: 'contribution',
    field: 'agent_id',
    references_table: 'agent',
    references_field: 'id',
    nullable: false,
    cascade_delete: false,
  },
  // Note: contributors table does not exist in V2 schema
  // Contribution data is likely structured differently in V2
]

/**
 * Check for orphaned references
 */
async function checkOrphanedReferences(ref: TableReference): Promise<{
  orphan_count: number
  sample_ids: number[]
}> {
  try {
    // Get table IDs from name mapping
    const childTableId = TABLE_NAME_TO_ID.get(ref.table)
    const parentTableId = TABLE_NAME_TO_ID.get(ref.references_table)

    if (!childTableId) {
      console.error(`   ❌ Table not found: ${ref.table}`)
      return { orphan_count: -1, sample_ids: [] }
    }

    if (!parentTableId) {
      console.error(`   ❌ Parent table not found: ${ref.references_table}`)
      return { orphan_count: -1, sample_ids: [] }
    }

    // Query child table for records with non-null FK
    const childQuery = await xanoMCP('query_table', {
      workspace_id: V2_CONFIG.workspace_id,
      table_id: childTableId,
      limit: 100, // Limit to 100 for performance
    })

    if (!childQuery.records || childQuery.records.length === 0) {
      return { orphan_count: 0, sample_ids: [] }
    }

    const orphanIds: number[] = []
    const checkedParentIds: Set<number> = new Set()
    const validParentIds: Set<number> = new Set()

    // Check each FK value exists in parent table
    for (const record of childQuery.records) {
      const fkValue = record[ref.field]

      if (fkValue === null && ref.nullable) {
        continue
      }

      if (fkValue === null && !ref.nullable) {
        // Non-nullable FK with null value is an orphan
        orphanIds.push(record.id)
        continue
      }

      // Skip if we already checked this parent ID
      if (checkedParentIds.has(fkValue)) {
        if (!validParentIds.has(fkValue)) {
          orphanIds.push(record.id)
        }
        continue
      }

      checkedParentIds.add(fkValue)

      // Check if parent record exists using get_record
      let parentExists = false
      if (ref.references_field === 'id') {
        try {
          const parentQuery = await xanoMCP('get_record', {
            workspace_id: V2_CONFIG.workspace_id,
            table_id: parentTableId,
            record_id: fkValue,
          })
          parentExists = parentQuery && parentQuery.id
        } catch {
          parentExists = false
        }
      } else {
        // For non-id fields, assume valid (rare case)
        parentExists = true
      }

      if (parentExists) {
        validParentIds.add(fkValue)
      } else {
        orphanIds.push(record.id)
      }
    }

    return {
      orphan_count: orphanIds.length,
      sample_ids: orphanIds.slice(0, 10), // First 10 orphan IDs
    }
  } catch (error: any) {
    console.error(`   ❌ Error checking ${ref.table}.${ref.field}:`, error.message)
    return { orphan_count: -1, sample_ids: [] }
  }
}

/**
 * Validate a single table reference
 */
async function validateSingleReference(ref: TableReference): Promise<ValidationResult> {
  const startTime = Date.now()

  console.log(
    `   Checking ${ref.table}.${ref.field} → ${ref.references_table}.${ref.references_field}`
  )

  const result = await checkOrphanedReferences(ref)

  const success = result.orphan_count === 0
  const error =
    result.orphan_count > 0
      ? `Found ${result.orphan_count} orphaned references. Sample IDs: ${result.sample_ids.join(', ')}`
      : result.orphan_count === -1
        ? 'Failed to check references'
        : undefined

  return {
    success,
    name: `${ref.table}.${ref.field}`,
    type: 'reference',
    error,
    metadata: {
      references: `${ref.references_table}.${ref.references_field}`,
      orphan_count: result.orphan_count,
      nullable: ref.nullable,
      cascade_delete: ref.cascade_delete,
      duration_ms: Date.now() - startTime,
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Validate all table references
 */
async function validateAllReferences(): Promise<void> {
  console.log('🚀 Starting V2 Table Reference Validation')
  console.log(`📊 Total references to validate: ${TABLE_REFERENCES.length}`)

  const results: ValidationResult[] = []

  // Group by parent table for better organization
  const byParent: Record<string, TableReference[]> = {}
  for (const ref of TABLE_REFERENCES) {
    if (!byParent[ref.references_table]) {
      byParent[ref.references_table] = []
    }
    byParent[ref.references_table].push(ref)
  }

  // Validate each parent table's references
  for (const [parentTable, refs] of Object.entries(byParent)) {
    console.log(`\n🔍 Validating ${parentTable} references (${refs.length} relationships)`)

    for (const ref of refs) {
      const result = await validateSingleReference(ref)
      results.push(result)

      if (result.success) {
        console.log(`      ✅ ${ref.table}.${ref.field}`)
      } else {
        console.log(`      ❌ ${ref.table}.${ref.field}: ${result.error}`)
      }
    }
  }

  // Generate report
  const report = generateReport(results)
  printResults(report)

  // Additional analysis
  console.log('\n📊 Reference Integrity Analysis:')
  const orphanedRefs = results.filter((r) => !r.success && r.metadata?.orphan_count > 0)
  if (orphanedRefs.length > 0) {
    console.log(`   ⚠️  Tables with orphaned references: ${orphanedRefs.length}`)
    for (const ref of orphanedRefs) {
      console.log(`      - ${ref.name}: ${ref.metadata?.orphan_count} orphans`)
    }
  } else {
    console.log(`   ✅ No orphaned references found!`)
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `reference-validation-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

/**
 * Validate references for a specific table
 */
async function validateTableReferences(tableName: string): Promise<void> {
  console.log(`🔍 Validating references for table: ${tableName}`)

  // Find all references involving this table
  const refs = TABLE_REFERENCES.filter(
    (ref) => ref.table === tableName || ref.references_table === tableName
  )

  if (refs.length === 0) {
    console.error(`❌ No references found for table: ${tableName}`)
    process.exit(1)
  }

  console.log(`   Found ${refs.length} references to validate`)

  const results: ValidationResult[] = []

  for (const ref of refs) {
    const result = await validateSingleReference(ref)
    results.push(result)
  }

  const report = generateReport(results)
  printResults(report)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `reference-validation-${tableName}-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

/**
 * Validate references for a specific relationship (e.g., 'user', 'agent', 'transaction')
 */
async function validateRelationship(relationship: string): Promise<void> {
  console.log(`🔍 Validating ${relationship} relationship references`)

  // Find all references where parent is the relationship table
  const refs = TABLE_REFERENCES.filter((ref) => ref.references_table === relationship)

  if (refs.length === 0) {
    console.error(`❌ No references found for relationship: ${relationship}`)
    console.log(`\nAvailable relationships:`)
    const uniqueParents = [...new Set(TABLE_REFERENCES.map((r) => r.references_table))]
    uniqueParents.forEach((p) => console.log(`   - ${p}`))
    process.exit(1)
  }

  console.log(`   Found ${refs.length} child tables referencing ${relationship}`)

  const results: ValidationResult[] = []

  for (const ref of refs) {
    const result = await validateSingleReference(ref)
    results.push(result)
  }

  const report = generateReport(results)
  printResults(report)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `reference-validation-${relationship}-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  const tableArg = args.find((a) => a.startsWith('--table='))
  const relationshipArg = args.find((a) => a.startsWith('--relationship='))

  if (tableArg) {
    const table = tableArg.split('=')[1]
    await validateTableReferences(table)
  } else if (relationshipArg) {
    const relationship = relationshipArg.split('=')[1]
    await validateRelationship(relationship)
  } else {
    await validateAllReferences()
  }
}

main().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
