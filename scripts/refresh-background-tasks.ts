/**
 * Refresh Background Tasks Cache
 *
 * Fetches background tasks using xano-mcp and caches them
 * Run with: pnpm tsx scripts/refresh-background-tasks.ts
 */

import fs from 'fs'
import path from 'path'

// Hardcoded task data from xano-mcp (2026-01-24)
// To refresh: run the xano-mcp list_tasks tool manually and update this array
const TASKS_DATA = [
  {
    id: 3138,
    name: 'AD - unregister all webhooks',
    type: 'xs',
    active: true,
    schedule: '',
    draft: false,
  },
  {
    id: 3134,
    name: 'Aggregation - Leaderboard Worker',
    type: 'xs',
    active: true,
    schedule: '',
    draft: false,
  },
  {
    id: 3133,
    name: 'Aggregation - Monthly Worker',
    type: 'xs',
    active: true,
    schedule: '',
    draft: false,
  },
  {
    id: 3132,
    name: 'Aggregation - Daily Scheduler',
    type: 'xs',
    active: true,
    schedule: '',
    draft: false,
  },
  { id: 3123, name: 'Daily Commission Sync', type: 'xs', active: true, schedule: '', draft: false },
  {
    id: 3121,
    name: 'AD - Run All Linking Functions',
    type: 'xs',
    active: true,
    schedule: '',
    draft: false,
  },
  {
    id: 2478,
    name: 'reZEN - Network - Downline Sync v2 V3',
    type: 'xs',
    active: true,
    schedule: '',
    draft: false,
  },
  {
    id: 2477,
    name: 'reZEN - Onboarding - Process Pending Contributions V3',
    type: 'xs',
    active: true,
    schedule: '',
    draft: false,
  },
  {
    id: 2476,
    name: 'reZEN - Onboarding - Process Stage Contributions V3',
    type: 'xs',
    active: true,
    schedule: '',
    draft: false,
  },
  {
    id: 2475,
    name: 'reZEN - Onboarding - Process Stage Listings V3',
    type: 'xs',
    active: true,
    schedule: '',
    draft: false,
  },
]

const cacheFilePath = path.join(process.cwd(), 'lib', 'background-tasks-cache.json')

const cacheData = {
  tasks: TASKS_DATA,
  total: TASKS_DATA.length,
  last_updated: new Date().toISOString(),
  note: "Background tasks data from xano-mcp. Snappy CLI's list_tasks is broken (returns 404).",
}

fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2))

console.log(`✓ Refreshed background tasks cache: ${TASKS_DATA.length} tasks`)
console.log(`  Cache file: ${cacheFilePath}`)
