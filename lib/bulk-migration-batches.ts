// Bulk Migration Batch Registry
// 12 batch copy endpoints in the "Bulk Migration" API group (api:eQhit4Ux)
// Each batch copies records from V1 (mvpw1_) to V2 (mvpw5_) using cross-workspace SQL

export const BULK_MIGRATION_BASE = 'https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:eQhit4Ux'

export interface BatchTable {
  name: string
  expectedCount: number
}

export interface MigrationBatch {
  id: number
  endpointId: number
  slug: string
  tables: BatchTable[]
}

export const MIGRATION_BATCHES: MigrationBatch[] = [
  {
    id: 1,
    endpointId: 18690,
    slug: 'copy-remaining-1',
    tables: [
      { name: 'closing_disclosure', expectedCount: 43820 },
      { name: 'integrations', expectedCount: 7 },
      { name: 'frontline_stats', expectedCount: 99 },
      { name: 'lifecycle_groups', expectedCount: 3 },
      { name: 'commission_plans', expectedCount: 6 },
    ],
  },
  {
    id: 2,
    endpointId: 18691,
    slug: 'copy-remaining-2',
    tables: [
      { name: 'revshare_plans', expectedCount: 3 },
      { name: 'feedback', expectedCount: 7 },
      { name: 'leads', expectedCount: 4963 },
      { name: 'leads_messages', expectedCount: 42 },
      { name: 'equity_transactions', expectedCount: 5933 },
      { name: 'global_variables', expectedCount: 1 },
    ],
  },
  {
    id: 3,
    endpointId: 18692,
    slug: 'copy-remaining-3',
    tables: [
      { name: 'team_director_assignments', expectedCount: 40 },
      { name: 'team_leader_assignments', expectedCount: 234 },
      { name: 'team_mentor_assignments', expectedCount: 9 },
      { name: 'domestic_partnership', expectedCount: 3 },
      { name: 'domestic_partnership_members', expectedCount: 3 },
      { name: 'waitlist', expectedCount: 3 },
    ],
  },
  {
    id: 4,
    endpointId: 18693,
    slug: 'copy-remaining-4',
    tables: [
      { name: 'audits', expectedCount: 263 },
      { name: 'deduction_items', expectedCount: 15 },
      { name: 'fub_groups', expectedCount: 0 },
      { name: 'log_contributions', expectedCount: 133652 },
      { name: 'log_network', expectedCount: 952 },
      { name: 'webhook_events', expectedCount: 25 },
    ],
  },
  {
    id: 5,
    endpointId: 18694,
    slug: 'copy-remaining-5',
    tables: [
      { name: 'contributions_pending', expectedCount: 32959 },
      { name: 'mortgages', expectedCount: 62 },
      { name: 'title_orders', expectedCount: 8849 },
      { name: 'title_agencies', expectedCount: 81 },
      { name: 'lead_source_defaults', expectedCount: 103 },
      { name: 'title_disbursements', expectedCount: 131377 },
    ],
  },
  {
    id: 6,
    endpointId: 18695,
    slug: 'copy-remaining-6',
    tables: [
      { name: 'lead_source_user', expectedCount: 21944 },
      { name: 'tags', expectedCount: 6 },
      { name: 'notes', expectedCount: 128 },
      { name: 'network_change_log', expectedCount: 89871 },
      { name: 'title_closing_items', expectedCount: 8554 },
      { name: 'modules', expectedCount: 23 },
    ],
  },
  {
    id: 7,
    endpointId: 18696,
    slug: 'copy-remaining-7',
    tables: [
      { name: 'stripe_subscription_packages', expectedCount: 19 },
      { name: 'title_events', expectedCount: 89561 },
      { name: 'title_users', expectedCount: 98 },
      { name: 'luzmo_collections', expectedCount: 5 },
      { name: 'luzmo_dashboards', expectedCount: 30 },
      { name: 'luzmo_charts', expectedCount: 2 },
    ],
  },
  {
    id: 8,
    endpointId: 18697,
    slug: 'copy-remaining-8',
    tables: [
      { name: 'log_api_keys', expectedCount: 411 },
      { name: 'chart_transactions', expectedCount: 0 },
      { name: 'website_contacts', expectedCount: 7 },
      { name: 'agent_task_history', expectedCount: 0 },
      { name: 'user_task_history', expectedCount: 1 },
      { name: 'skyslope_connection', expectedCount: 5 },
    ],
  },
  {
    id: 9,
    endpointId: 18698,
    slug: 'copy-remaining-9',
    tables: [
      { name: 'invitations', expectedCount: 215 },
      { name: 'checklists', expectedCount: 2 },
      { name: 'checklist_items', expectedCount: 2 },
      { name: 'notification_items', expectedCount: 75353 },
      { name: 'team_links', expectedCount: 43 },
      { name: 'pipeline_prospects', expectedCount: 2100 },
    ],
  },
  {
    id: 10,
    endpointId: 18699,
    slug: 'copy-remaining-10',
    tables: [
      { name: 'pipeline_stages', expectedCount: 1863 },
      { name: 'pipeline_stage_defaults', expectedCount: 8 },
      { name: 'pipeline_prospect_defaults', expectedCount: 8 },
      { name: 'notification_defaults', expectedCount: 7 },
      { name: 'notification_user_prefs', expectedCount: 1488 },
    ],
  },
  {
    id: 11,
    endpointId: 18700,
    slug: 'copy-remaining-11',
    tables: [
      { name: 'rezen_referral_code', expectedCount: 56 },
      { name: 'email_logs', expectedCount: 33847 },
      { name: 'email_master', expectedCount: 605 },
      { name: 'metrics_snapshots', expectedCount: 31072 },
    ],
  },
  {
    id: 12,
    endpointId: 18701,
    slug: 'copy-remaining-12',
    tables: [
      { name: 'equity_annual', expectedCount: 224 },
      { name: 'equity_monthly', expectedCount: 2942 },
      { name: 'user_links', expectedCount: 43 },
    ],
  },
]

export const TOTAL_BATCH_TABLES = MIGRATION_BATCHES.reduce((sum, b) => sum + b.tables.length, 0)

export const TOTAL_EXPECTED_RECORDS = MIGRATION_BATCHES.reduce(
  (sum, b) => sum + b.tables.reduce((s, t) => s + t.expectedCount, 0),
  0
)
