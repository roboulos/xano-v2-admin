/**
 * Phase 1.1: Table Validation Script
 *
 * Tests all 193 V2 tables for:
 * - Existence
 * - Record counts
 * - Schema integrity
 * - Data presence
 *
 * Usage:
 *   pnpm tsx scripts/validation/validate-tables.ts
 *   pnpm tsx scripts/validation/validate-tables.ts --category=core
 *   pnpm tsx scripts/validation/validate-tables.ts --table=user
 */

import {
  validateTable,
  generateReport,
  saveReport,
  printResults,
  ValidationResult,
} from './utils'
import { TABLES_DATA as v2Tables } from '../../lib/v2-data'

// Table categories for organized testing
const TABLE_CATEGORIES = {
  core_identity: ['user', 'user_credentials', 'user_settings', 'user_roles', 'user_subscriptions',
    'agent', 'agent_cap_data', 'agent_commission', 'agent_hierarchy', 'agent_performance',
    'team', 'team_members', 'team_settings', 'team_director_assignments', 'team_owners', 'team_admins', 'team_admins_permissions'],

  transactions: ['transaction', 'transaction_financials', 'transaction_history', 'transaction_participants',
    'transaction_tags', 'participant', 'paid_participant', 'closing_disclosure'],

  listings: ['listing', 'listing_history', 'listing_photos'],

  financial: ['income', 'contribution', 'contributors', 'contributions_pending', 'revshare_totals',
    'equity_annual', 'equity_monthly', 'equity_transactions'],

  network: ['network', 'network_hierarchy', 'network_member', 'network_user_prefs', 'network_change_log',
    'sponsor_tree', 'connections'],

  fub: ['fub_accounts', 'fub_people', 'fub_deals', 'fub_stages', 'fub_events', 'fub_users', 'fub_groups',
    'fub_calls', 'fub_text_messages', 'fub_appointments', 'fub_sync_jobs', 'fub_onboarding_jobs',
    'fub_aggregation_jobs', 'fub_appointments_staging'],

  integrations: [
    // Rezen
    'rezen_sync_jobs', 'rezen_onboarding_jobs', 'rezen_webhooks', 'rezen_referral_codes',
    'rezen_contributions_staging', 'rezen_listings_staging', 'rezen_network_staging',
    // SkySlope
    'skyslope_sync_jobs', 'skyslope_listing_staging', 'skyslope_transaction_staging',
    // DotLoop
    'dotloop_accounts', 'dotloop_contacts', 'dotloop_loops', 'dotloop_profiles', 'dotloop_staging', 'dotloop_sync_state',
    // Lofty
    'lofty_accounts', 'lofty_leads', 'lofty_staging', 'lofty_sync_state',
  ],

  system: ['audit_log', 'system_audit', 'error_logs', 'event_log', 'job_status', 'lambda_jobs_log',
    'lambda_jobs_status', 'lambda_worker_log', 'lambda_failed_record', 'api_workers', 'notification'],

  configuration: ['brokerage', 'office', 'global_variables', 'permissions', 'modules', 'integration',
    'state_or_province', 'calendar', 'tags', 'revshare_plan', 'dashboard_templates', 'report_templates'],
}

async function validateTableCategory(category: string, tables: string[]): Promise<ValidationResult[]> {
  console.log(`\n🔍 Validating ${category} tables (${tables.length} tables)...`)

  const results: ValidationResult[] = []

  for (const tableName of tables) {
    process.stdout.write(`   Testing ${tableName}... `)
    const result = await validateTable(tableName)
    results.push(result)

    if (result.success) {
      console.log(`✅ (${result.metadata?.record_count || 0} records)`)
    } else {
      console.log(`❌ ${result.error}`)
    }
  }

  return results
}

async function validateAllTables(): Promise<void> {
  console.log('🚀 Starting V2 Table Validation')
  console.log(`📊 Total tables to validate: ${v2Tables.length}`)
  console.log(`🏷️  Categories: ${Object.keys(TABLE_CATEGORIES).length}`)

  const allResults: ValidationResult[] = []

  // Validate by category
  for (const [category, tables] of Object.entries(TABLE_CATEGORIES)) {
    const results = await validateTableCategory(category, tables)
    allResults.push(...results)
  }

  // Validate any remaining tables not in categories
  const categorizedTables = new Set(Object.values(TABLE_CATEGORIES).flat())
  const uncategorized = v2Tables.filter(t => !categorizedTables.has(t.name))

  if (uncategorized.length > 0) {
    console.log(`\n🔍 Validating uncategorized tables (${uncategorized.length} tables)...`)
    for (const table of uncategorized) {
      const result = await validateTable(table.name)
      allResults.push(result)
      console.log(`   ${table.name}: ${result.success ? '✅' : '❌'}`)
    }
  }

  // Generate and save report
  const report = generateReport(allResults)
  printResults(report)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `table-validation-${timestamp}.json`)

  // Exit with error if any failures
  if (report.summary.failed > 0) {
    process.exit(1)
  }
}

async function validateSingleTable(tableName: string): Promise<void> {
  console.log(`🔍 Validating table: ${tableName}`)

  const result = await validateTable(tableName)

  if (result.success) {
    console.log(`\n✅ Table validation passed`)
    console.log(`   Records: ${result.metadata?.record_count || 0}`)
    console.log(`   Duration: ${result.metadata?.duration_ms}ms`)
  } else {
    console.log(`\n❌ Table validation failed`)
    console.log(`   Error: ${result.error}`)
  }

  // Save single result
  const report = generateReport([result])
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `table-validation-${tableName}-${timestamp}.json`)

  process.exit(result.success ? 0 : 1)
}

async function validateCategory(category: string): Promise<void> {
  const tables = TABLE_CATEGORIES[category as keyof typeof TABLE_CATEGORIES]

  if (!tables) {
    console.error(`❌ Unknown category: ${category}`)
    console.log(`Available categories: ${Object.keys(TABLE_CATEGORIES).join(', ')}`)
    process.exit(1)
  }

  console.log(`🔍 Validating category: ${category} (${tables.length} tables)`)

  const results = await validateTableCategory(category, tables)
  const report = generateReport(results)
  printResults(report)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await saveReport(report, `table-validation-${category}-${timestamp}.json`)

  process.exit(report.summary.failed > 0 ? 1 : 0)
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  // Parse arguments
  const tableArg = args.find(a => a.startsWith('--table='))
  const categoryArg = args.find(a => a.startsWith('--category='))

  if (tableArg) {
    const tableName = tableArg.split('=')[1]
    await validateSingleTable(tableName)
  } else if (categoryArg) {
    const category = categoryArg.split('=')[1]
    await validateCategory(category)
  } else {
    await validateAllTables()
  }
}

main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
