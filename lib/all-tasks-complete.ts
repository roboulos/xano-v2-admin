/**
 * COMPLETE LIST OF ALL 100 BACKGROUND TASKS
 *
 * Every task runs on a schedule and calls a Tasks/ function.
 * The Tasks/ function does the actual work (queries DB, calls APIs, etc.)
 */

export interface CompleteTask {
  id: number
  name: string
  freq: number // seconds between runs
  freqLabel: string
  calls: string // Tasks/ function it calls
  does: string // Plain English what it does
  domain: "rezen" | "fub" | "skyslope" | "title" | "aggregation" | "ad" | "reporting" | "metrics"
  active: boolean
}

function freqToLabel(freq: number): string {
  if (freq === 60) return "Every 1 min"
  if (freq === 180) return "Every 3 min"
  if (freq === 300) return "Every 5 min"
  if (freq === 600) return "Every 10 min"
  if (freq === 3600) return "Every 1 hour"
  if (freq === 86400) return "Every 24 hours"
  return `Every ${freq}s`
}

export const ALL_TASKS: CompleteTask[] = [
  // ============================================
  // REZEN DOMAIN - 28 tasks
  // ============================================
  { id: 2385, name: "reZEN - Onboarding - Start Job", freq: 180, freqLabel: "Every 3 min", calls: "Tasks/reZEN - Onboarding Start Job", does: "Kicks off new user onboarding - queries rezen_onboarding_jobs for status='New'", domain: "rezen", active: true },
  { id: 2386, name: "reZEN - Onboarding - Load Transactions", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Load Transactions", does: "Pulls transactions from reZEN API into staging table", domain: "rezen", active: true },
  { id: 2387, name: "reZEN - Onboarding - Load Listings", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Load Listings", does: "Pulls listings from reZEN API into staging table", domain: "rezen", active: true },
  { id: 2388, name: "reZEN - Onboarding - Load Network Downline", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Load Network Downline", does: "Pulls network/downline tree from reZEN API", domain: "rezen", active: true },
  { id: 2389, name: "reZEN - Onboarding - Process Transactions", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Transactions", does: "Moves staged transactions to main transaction table", domain: "rezen", active: true },
  { id: 2390, name: "reZEN - Onboarding - Process Listings", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Listings", does: "Moves staged listings to main listing table", domain: "rezen", active: true },
  { id: 2391, name: "reZEN - Onboarding - Process Network Downline", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Network Downline", does: "Moves staged network data to main network table", domain: "rezen", active: true },
  { id: 2392, name: "reZEN - Onboarding - Process Network Frontline", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Network Frontline", does: "Processes tier-1 direct sponsors separately", domain: "rezen", active: true },
  { id: 2393, name: "reZEN - Onboarding - Process Cap Data", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Cap Data", does: "Agent commission cap and split percentages", domain: "rezen", active: true },
  { id: 2394, name: "reZEN - Onboarding - Process Equity", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Equity", does: "Stock equity award processing for agents", domain: "rezen", active: true },
  { id: 2395, name: "reZEN - Onboarding - Process Agent Sponsor Tree", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Sponsor Tree", does: "Builds complete 5-tier sponsor hierarchy", domain: "rezen", active: true },
  { id: 2396, name: "reZEN - Onboarding - Process Contributions", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Contributions", does: "Revenue share contribution records from transactions", domain: "rezen", active: true },
  { id: 2397, name: "reZEN - Onboarding - Process Contributors", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Contributors", does: "Who contributed to each agent's revshare pool", domain: "rezen", active: true },
  { id: 2398, name: "reZEN - Onboarding - Process RevShare Totals", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process RevShare Totals", does: "Calculate total revshare amounts per agent", domain: "rezen", active: true },
  { id: 2435, name: "reZEN - Contributions - Full Update", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Contributions Full Update", does: "Full refresh of contribution data", domain: "rezen", active: true },
  { id: 2437, name: "reZEN - Contributions - Daily Update Processing", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Contributions Daily", does: "Process daily contribution changes", domain: "rezen", active: true },
  { id: 2439, name: "reZEN - Daily - Load Pending Contributions", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Load Pending Contributions", does: "Load new contributions needing processing", domain: "rezen", active: true },
  { id: 2442, name: "reZEN - Process Pending Contributions", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Pending Contributions", does: "Process contributions in pending state", domain: "rezen", active: true },
  { id: 2445, name: "reZEN - Onboarding - Completion", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Onboarding Completion", does: "Mark onboarding jobs as complete", domain: "rezen", active: true },
  { id: 2448, name: "reZEN - Onboarding - Load Contributions", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Load Contributions", does: "Pull contributions from reZEN API", domain: "rezen", active: true },
  { id: 2466, name: "reZEN - Remove Duplicates - Network and Contributions", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Remove Duplicates", does: "Clean up duplicate records in network/contributions", domain: "rezen", active: true },
  { id: 2467, name: "reZEN - Network - Frontline - Brad", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Frontline Brad", does: "Process Brad's frontline network specifically", domain: "rezen", active: true },
  { id: 2468, name: "reZEN - Network - Frontline - Tim", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Frontline Tim", does: "Process Tim's frontline network specifically", domain: "rezen", active: true },
  { id: 2469, name: "reZEN - Network - Update Frontline ASYNC Tim", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Update Frontline Tim", does: "Async update of Tim's frontline", domain: "rezen", active: true },
  { id: 2470, name: "reZEN - Network - Update Frontline ASYNC Brad", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Update Frontline Brad", does: "Async update of Brad's frontline", domain: "rezen", active: true },
  { id: 2471, name: "reZEN - Transactions Sync - Worker 1", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Transactions Sync 1", does: "Sync transactions batch 1", domain: "rezen", active: true },
  { id: 2472, name: "reZEN - Transactions Sync - Worker 2", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Transactions Sync 2", does: "Sync transactions batch 2", domain: "rezen", active: true },
  { id: 2473, name: "reZEN - Onboarding - Process Stage Transactions Large", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Stage Transactions Large", does: "Process large transaction batches from staging", domain: "rezen", active: true },
  { id: 2474, name: "reZEN - Onboarding - Process Stage Transactions Small", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Stage Transactions Small", does: "Process small transaction batches from staging", domain: "rezen", active: true },
  { id: 2475, name: "reZEN - Onboarding - Process Stage Listings", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Stage Listings", does: "Process listings from staging table", domain: "rezen", active: true },
  { id: 2476, name: "reZEN - Onboarding - Process Stage Contributions", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Stage Contributions", does: "Process contributions from staging table", domain: "rezen", active: true },
  { id: 2477, name: "reZEN - Onboarding - Process Pending Contributions", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Pending Contributions", does: "Process contributions in pending queue", domain: "rezen", active: true },
  { id: 2478, name: "reZEN - Network - Downline Sync v2", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Downline Sync", does: "Sync network downline data v2", domain: "rezen", active: true },
  { id: 2401, name: "reZEN - Monitor Sync Locks and Recover", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Monitor Locks", does: "Detect and recover stuck sync jobs", domain: "rezen", active: true },
  { id: 2403, name: "reZEN - Webhooks - Register and Check", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Webhooks", does: "Register webhooks with reZEN API", domain: "rezen", active: false },
  { id: 2405, name: "reZEN - Process Webhooks and Delete", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Process Webhooks", does: "Handle incoming webhooks, clean up old ones", domain: "rezen", active: true },
  { id: 2408, name: "reZEN - Network Name Sync", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Network Name Sync", does: "Sync agent names in network table", domain: "rezen", active: true },
  { id: 2412, name: "reZEN - Generate Referral Code", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Generate Referral Code", does: "Create referral codes for agents", domain: "rezen", active: true },
  { id: 2413, name: "reZEN - RevShare Totals", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - RevShare Totals", does: "Calculate revshare totals", domain: "rezen", active: true },
  { id: 2415, name: "reZEN - Team Roster - Caps and Splits", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Caps and Splits", does: "Update team roster with cap/split data", domain: "rezen", active: true },
  { id: 2417, name: "reZEN - Paid Participant - Missing Addresses", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Missing Addresses", does: "Fill in missing addresses for paid participants", domain: "rezen", active: true },
  { id: 2419, name: "reZEN - Paid Participant - Incomplete Mapping", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Incomplete Mapping", does: "Fix incomplete participant mappings", domain: "rezen", active: true },
  { id: 2420, name: "reZEN - Network - Missing Cap Data", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Missing Cap Data", does: "Fill in missing cap data for network agents", domain: "rezen", active: true },
  { id: 2421, name: "reZEN - Network - Missing Frontline Data", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/reZEN - Missing Frontline Data", does: "Fill in missing frontline data", domain: "rezen", active: true },

  // ============================================
  // FUB DOMAIN - 32 tasks
  // ============================================
  { id: 2418, name: "FUB - Daily Update - People", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Daily Update People", does: "Sync contacts updated today from FUB API", domain: "fub", active: true },
  { id: 2422, name: "FUB - Onboarding - People - Worker 1", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Onboarding People Worker 1", does: "Initial FUB contact sync for all FUB credentials", domain: "fub", active: true },
  { id: 2423, name: "FUB - Onboarding - Calls - Worker 1", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Onboarding Calls Worker 1", does: "Sync FUB call records to fub_calls table", domain: "fub", active: true },
  { id: 2424, name: "FUB - Onboarding - Events - Worker 1", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Onboarding Events Worker 1", does: "Sync FUB events (property views, searches, etc.)", domain: "fub", active: true },
  { id: 2425, name: "FUB - Onboarding - Appointments Worker", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Onboarding Appointments", does: "Sync FUB appointments to fub_appointments table", domain: "fub", active: true },
  { id: 2426, name: "FUB - Onboarding - Text Messages from People", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Text Messages from People", does: "Sync SMS messages linked to contacts", domain: "fub", active: true },
  { id: 2427, name: "FUB - Onboarding - Deals from People", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Deals from People", does: "Sync FUB deals to fub_deals table", domain: "fub", active: true },
  { id: 2428, name: "FUB - Refresh Tokens", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Refresh Tokens", does: "Refresh OAuth tokens before they expire", domain: "fub", active: true },
  { id: 2429, name: "FUB - Get Users", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Get Users", does: "Sync FUB user accounts to fub_users table", domain: "fub", active: true },
  { id: 2430, name: "FUB - Get Stages", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Get Stages", does: "Sync deal pipeline stages from FUB", domain: "fub", active: true },
  { id: 2431, name: "FUB - Webhook Check", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Webhook Check", does: "Verify FUB webhooks are registered", domain: "fub", active: false },
  { id: 2432, name: "FUB - Delete Lambda Logs", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Delete Lambda Logs", does: "Clean up old lambda execution logs", domain: "fub", active: true },
  { id: 2441, name: "FUB - Process Text Messages from Stage", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Process Text Stage", does: "Move staged text messages to main table", domain: "fub", active: true },
  { id: 2444, name: "FUB - Pull Count Records and Update", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Update Counts", does: "Update record counts for FUB data", domain: "fub", active: true },
  { id: 2447, name: "FUB - Fix People Data in Events", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Fix People in Events", does: "Link orphan events to correct people records", domain: "fub", active: true },
  { id: 2449, name: "FUB - Get Appointments Missing Data", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Missing Appointment Data", does: "Fill in incomplete appointment records", domain: "fub", active: true },
  { id: 2451, name: "FUB - Pull Events with People ID 0", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Orphan Events", does: "Find and fix events with missing people links", domain: "fub", active: true },
  { id: 2454, name: "FUB - Import fub_users_id", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Import Users ID", does: "Import FUB user IDs into records", domain: "fub", active: true },
  { id: 2455, name: "FUB - Onboarding Jobs", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Onboarding Jobs", does: "Master orchestrator - creates FUB sync jobs", domain: "fub", active: true },
  { id: 2456, name: "FUB - Daily Update - Text Messages via Phone", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Text Messages via Phone", does: "Sync texts by phone number lookup", domain: "fub", active: true },
  { id: 2457, name: "FUB - People URL", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - People URL", does: "Generate FUB profile URLs for people", domain: "fub", active: true },
  { id: 2458, name: "FUB - Fix Calls Missing Record Username", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Fix Calls Username", does: "Fill in missing usernames on call records", domain: "fub", active: true },
  { id: 2459, name: "FUB - Fix Appointments Missing Created By", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Fix Appointments CreatedBy", does: "Fill in missing created_by on appointments", domain: "fub", active: true },
  { id: 2460, name: "FUB - Pull Text Messages from Calling Number", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Texts from Calling Number", does: "Fetch texts associated with call numbers", domain: "fub", active: true },
  { id: 2461, name: "FUB - Onboarding - Appointments from Users", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Appointments from Users", does: "Sync appointments for each FUB user", domain: "fub", active: true },
  { id: 2462, name: "FUB - Onboarding - Calls - Worker 2", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Calls Worker 2", does: "Parallel call sync worker 2", domain: "fub", active: true },
  { id: 2463, name: "FUB - Onboarding - Calls - Worker 3", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Calls Worker 3", does: "Parallel call sync worker 3", domain: "fub", active: true },
  { id: 2464, name: "FUB - Onboarding - Calls - Worker 4", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Calls Worker 4", does: "Parallel call sync worker 4", domain: "fub", active: true },
  { id: 2465, name: "FUB - Fix People Data in FUB - People", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Fix People Data", does: "Fix data quality issues in fub_people table", domain: "fub", active: true },
  { id: 2406, name: "FUB - Daily Update - Calls", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Daily Update Calls", does: "Sync today's calls from FUB", domain: "fub", active: true },
  { id: 2409, name: "FUB - Daily Update - Appointments", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Daily Update Appointments", does: "Sync today's appointments from FUB", domain: "fub", active: true },
  { id: 2411, name: "FUB - Daily Update - Text Messages", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Daily Update Texts", does: "Sync today's text messages from FUB", domain: "fub", active: true },
  { id: 2414, name: "FUB - Daily Update - Deals", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Daily Update Deals", does: "Sync today's deals from FUB", domain: "fub", active: true },
  { id: 2416, name: "FUB - Daily Update - Events", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/FUB - Daily Update Events", does: "Sync today's events from FUB", domain: "fub", active: true },

  // ============================================
  // SKYSLOPE DOMAIN - 5 tasks
  // ============================================
  { id: 2436, name: "SkySlope - Transactions Sync - Worker 1", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/SkySlope - Transactions Sync", does: "Sync transactions from SkySlope API", domain: "skyslope", active: true },
  { id: 2438, name: "SkySlope - Move Transactions from Staging", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/SkySlope - Move Transactions", does: "Move staged transactions to main table", domain: "skyslope", active: true },
  { id: 2440, name: "SkySlope - Move Listings from Staging", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/SkySlope - Move Listings", does: "Move staged listings to main table", domain: "skyslope", active: true },
  { id: 2443, name: "SkySlope - Listings Sync - Worker 1", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/SkySlope - Listings Sync", does: "Sync listings from SkySlope API", domain: "skyslope", active: true },
  { id: 2446, name: "SkySlope - Account Users Sync - Worker 1", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/SkySlope - Users Sync", does: "Sync users from SkySlope accounts", domain: "skyslope", active: true },

  // ============================================
  // TITLE DOMAIN - 2 tasks
  // ============================================
  { id: 2450, name: "Title - Orders", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/Title - Orders", does: "Sync title orders from Qualia", domain: "title", active: true },
  { id: 2452, name: "Title - Get Today's Qualia Orders", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/Title - Today's Orders", does: "Fetch today's title orders from Qualia", domain: "title", active: true },

  // ============================================
  // AGGREGATION DOMAIN - 3 tasks
  // ============================================
  { id: 3132, name: "Aggregation - Daily Scheduler", freq: 86400, freqLabel: "Every 24 hours", calls: "Tasks/Aggregation - Daily Scheduler", does: "Creates aggregation jobs for ALL agents daily", domain: "aggregation", active: true },
  { id: 3133, name: "Aggregation - Monthly Worker", freq: 300, freqLabel: "Every 5 min", calls: "Tasks/Aggregation - Monthly Worker", does: "Processes one pending aggregation job (calculates GCI, volume)", domain: "aggregation", active: true },
  { id: 3134, name: "Aggregation - Leaderboard Worker", freq: 3600, freqLabel: "Every 1 hour", calls: "Tasks/Aggregation - Leaderboard Worker", does: "Rebuilds agent leaderboard rankings from monthly data", domain: "aggregation", active: true },

  // ============================================
  // AD (AgentDashboards) DOMAIN - 9 tasks
  // ============================================
  { id: 2399, name: "AD - Email - Network News - Daily", freq: 86400, freqLabel: "Every 24 hours", calls: "Tasks/AD - Daily Network Email", does: "Send daily network news email digest", domain: "ad", active: true },
  { id: 2400, name: "AD - Email - Network News - Weekly", freq: 604800, freqLabel: "Every 7 days", calls: "Tasks/AD - Weekly Network Email", does: "Send weekly network news email digest", domain: "ad", active: true },
  { id: 2402, name: "AD - Missing Agent IDs Participants", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/AD - Missing Agent IDs", does: "Fill in missing agent_id on participant records", domain: "ad", active: true },
  { id: 2404, name: "AD - Missing Team Roster Avatars", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/AD - Missing Avatars", does: "Download missing avatar images for team roster", domain: "ad", active: true },
  { id: 2407, name: "AD - Upload Network Images", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/AD - Upload Network Images", does: "Upload network agent profile images", domain: "ad", active: true },
  { id: 2410, name: "AD - CSV Insert Data from Temp Table", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/AD - CSV Import", does: "Process CSV imports from temp staging table", domain: "ad", active: true },
  { id: 2453, name: "AD - Upload Team Roster Images", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/AD - Upload Roster Images", does: "Upload team roster profile images", domain: "ad", active: true },
  { id: 3121, name: "AD - Run All Linking Functions", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/AD - Run Linking", does: "Execute all record linking/matching functions", domain: "ad", active: true },
  { id: 3138, name: "AD - Unregister All Webhooks", freq: 60, freqLabel: "Every 1 min", calls: "Tasks/AD - Unregister Webhooks", does: "Clean up and unregister old webhooks", domain: "ad", active: true },

  // ============================================
  // REPORTING DOMAIN - 1 task
  // ============================================
  { id: 2434, name: "Reporting - Process Errors and Send to Slack", freq: 300, freqLabel: "Every 5 min", calls: "Tasks/Reporting - Process Errors", does: "Aggregate errors from error_logs table, send to Slack", domain: "reporting", active: true },

  // ============================================
  // METRICS DOMAIN - 1 task
  // ============================================
  { id: 2433, name: "Metrics - Create Snapshot", freq: 86400, freqLabel: "Every 24 hours", calls: "Tasks/Metrics - Create Snapshot", does: "Create daily snapshot of system metrics", domain: "metrics", active: true },

  // ============================================
  // MISC - 1 task
  // ============================================
  { id: 3123, name: "Daily Commission Sync", freq: 86400, freqLabel: "Every 24 hours", calls: "Tasks/Daily Commission Sync", does: "Daily sync of commission data across all sources", domain: "rezen", active: true },
]

// Group tasks by domain
export function getTasksByDomain() {
  const byDomain: Record<string, CompleteTask[]> = {}
  for (const task of ALL_TASKS) {
    if (!byDomain[task.domain]) byDomain[task.domain] = []
    byDomain[task.domain].push(task)
  }
  return byDomain
}

// Get stats
export function getAllTaskStats() {
  const active = ALL_TASKS.filter(t => t.active).length
  const inactive = ALL_TASKS.filter(t => !t.active).length
  const byFreq: Record<string, number> = {}

  for (const task of ALL_TASKS) {
    byFreq[task.freqLabel] = (byFreq[task.freqLabel] || 0) + 1
  }

  return {
    total: ALL_TASKS.length,
    active,
    inactive,
    byFreq,
    byDomain: {
      rezen: ALL_TASKS.filter(t => t.domain === "rezen").length,
      fub: ALL_TASKS.filter(t => t.domain === "fub").length,
      skyslope: ALL_TASKS.filter(t => t.domain === "skyslope").length,
      title: ALL_TASKS.filter(t => t.domain === "title").length,
      aggregation: ALL_TASKS.filter(t => t.domain === "aggregation").length,
      ad: ALL_TASKS.filter(t => t.domain === "ad").length,
      reporting: ALL_TASKS.filter(t => t.domain === "reporting").length,
      metrics: ALL_TASKS.filter(t => t.domain === "metrics").length,
    }
  }
}
