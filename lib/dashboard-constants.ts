/**
 * Dashboard Constants — Single source of truth for counts shown across all tabs.
 *
 * Import these instead of hardcoding numbers. Record totals that change
 * during migration (e.g. 32.8M) should come from live API calls, not constants.
 */

import { V1_TABLES } from '@/lib/v1-data'
import { TABLES_DATA } from '@/lib/v2-data'

/** Total V1 production tables */
export const V1_TABLE_COUNT = V1_TABLES.length // 251

/** Total V2 normalized tables (from workspace data) */
export const V2_TABLE_COUNT = TABLES_DATA.length

/** Number of frontend projects in the ecosystem */
export const PROJECT_COUNT = 3

/** Number of Xano workspaces (V1 production + V2 normalized) */
export const WORKSPACE_COUNT = 2

/** Number of dashboard tabs (non-separator entries in NAV_ITEMS) */
export const NAV_TAB_COUNT = 27

// Architecture constants - workspace inspection snapshots
export const V2_TASKS_TOTAL = 109
export const V2_TASKS_PASSING = 102
export const V2_WORKERS_TOTAL = 194
export const V2_WORKERS_UNMAPPED = 187 // 194 - 7 workers with mapped endpoints
export const V2_ACTIVE_FUNCTIONS = V2_TASKS_TOTAL + V2_WORKERS_TOTAL // 303

// Schema transformation constants
export const SPLIT_ENTITIES_COUNT = 5 // user, agent, team, network, transaction
export const NORMALIZED_SPLIT_TARGETS = 14 // total tables from splits
export const MAPPED_FIELDS_COUNT = 449
export const SYNCED_DOMAINS_COUNT = 5
