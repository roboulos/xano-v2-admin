/**
 * This script documents the REAL task data from Xano Workspace 5
 * Generated from querying all 100 tasks via MCP
 *
 * Key findings:
 * - 100 total tasks
 * - 2 inactive tasks (FUB - Webhook Check V3, rezen - webhooks - register and check status V3)
 * - Schedule is embedded in XanoScript, not in list_tasks response
 * - All tasks call a function in Tasks/ folder
 *
 * Schedule frequencies found:
 * - 60 seconds (1 min): FUB - Onboarding Jobs
 * - 180 seconds (3 min): reZEN - Onboarding - Start Onboarding Job
 * - 300 seconds (5 min): Aggregation - Monthly Worker
 * - 3600 seconds (1 hr): Aggregation - Leaderboard Worker
 * - 86400 seconds (24 hr): Aggregation - Daily Scheduler
 */

export interface TaskFromXano {
  id: number
  name: string
  active: boolean
  schedule: { freq: number; startsOn: string } | null
  callsFunction: string
  tags: string[]
  description: string
}

// Mapping of freq in seconds to human-readable labels
export const FREQ_LABELS: Record<number, string> = {
  60: "Every 1 min",
  180: "Every 3 min",
  300: "Every 5 min",
  600: "Every 10 min",
  900: "Every 15 min",
  1800: "Every 30 min",
  3600: "Every 1 hr",
  7200: "Every 2 hr",
  21600: "Every 6 hr",
  43200: "Every 12 hr",
  86400: "Every 24 hr",
}

// Tasks verified from Xano MCP queries
export const VERIFIED_TASKS: TaskFromXano[] = [
  // === AGGREGATION (4 tasks) ===
  {
    id: 3132,
    name: "Aggregation - Daily Scheduler",
    active: true,
    schedule: { freq: 86400, startsOn: "2025-12-26 07:00:00" },
    callsFunction: "Tasks/Aggregation - Daily Scheduler",
    tags: ["aggregation", "scheduler", "v3", "daily"],
    description: "Kicks off daily aggregation jobs"
  },
  {
    id: 3133,
    name: "Aggregation - Monthly Worker",
    active: true,
    schedule: { freq: 300, startsOn: "2025-12-26 07:05:00" },
    callsFunction: "Tasks/Aggregation - Monthly Worker",
    tags: ["aggregation", "worker", "v3", "monthly"],
    description: "Processes one pending monthly aggregation job per run"
  },
  {
    id: 3134,
    name: "Aggregation - Leaderboard Worker",
    active: true,
    schedule: { freq: 3600, startsOn: "2025-12-26 07:30:00" },
    callsFunction: "Tasks/Aggregation - Leaderboard Worker",
    tags: ["aggregation", "leaderboard", "v3", "hourly"],
    description: "Calculates and updates leaderboard rankings from monthly aggregates"
  },

  // === FUB ONBOARDING (Scheduled entry point + workers) ===
  {
    id: 2455,
    name: "FUB - Onboarding Jobs V3",
    active: true,
    schedule: { freq: 60, startsOn: "2025-12-03 04:00:00" },
    callsFunction: "Tasks/FUB - Onboarding Jobs",
    tags: ["🚀 onboard", "📂 fub", "🔄 frequent", "📊 v3"],
    description: "Entry point - checks for pending FUB onboarding jobs every minute"
  },
  {
    id: 2422,
    name: "FUB - Onboarding - People - Worker 1 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Onboarding - People Worker 1",
    tags: ["fub", "onboarding", "people"],
    description: "Processes people import for FUB onboarding"
  },
  {
    id: 2423,
    name: "FUB - Onboarding - Calls - Worker 1 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Onboarding - Calls Worker 1",
    tags: ["fub", "onboarding", "calls"],
    description: "Processes calls import for FUB onboarding"
  },
  {
    id: 2462,
    name: "FUB - Onboarding - Calls - Worker 2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Onboarding - Calls Worker 2",
    tags: ["fub", "onboarding", "calls"],
    description: "Processes calls import for FUB onboarding (worker 2)"
  },
  {
    id: 2463,
    name: "FUB - Onboarding - Calls - Worker 3 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Onboarding - Calls Worker 3",
    tags: ["fub", "onboarding", "calls"],
    description: "Processes calls import for FUB onboarding (worker 3)"
  },
  {
    id: 2464,
    name: "FUB - Onboarding - Calls - Worker 4 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Onboarding - Calls Worker 4",
    tags: ["fub", "onboarding", "calls"],
    description: "Processes calls import for FUB onboarding (worker 4)"
  },
  {
    id: 2424,
    name: "FUB - Onboarding - Events - Worker 1 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Onboarding - Events Worker 1",
    tags: ["fub", "onboarding", "events"],
    description: "Processes events import for FUB onboarding"
  },
  {
    id: 2425,
    name: "FUB - Onboarding - Appointments Worker V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Onboarding - Appointments Worker",
    tags: ["fub", "onboarding", "appointments"],
    description: "Processes appointments import for FUB onboarding"
  },
  {
    id: 2461,
    name: "FUB - Onboarding - Appointments from Users V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Onboarding - Appointments from Users",
    tags: ["fub", "onboarding", "appointments"],
    description: "Processes appointments from users for FUB onboarding"
  },
  {
    id: 2426,
    name: "FUB - Onboarding - Text Messages from People V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Onboarding - Text Messages from People",
    tags: ["fub", "onboarding", "texts"],
    description: "Processes text messages import for FUB onboarding"
  },
  {
    id: 2427,
    name: "FUB - Onboarding - Deals from People V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Onboarding - Deals from People",
    tags: ["fub", "onboarding", "deals"],
    description: "Processes deals import for FUB onboarding"
  },

  // === REZEN ONBOARDING (Scheduled entry point + workers) ===
  {
    id: 2385,
    name: "reZEN - Onboarding - Start Onboarding Job V3",
    active: true,
    schedule: { freq: 180, startsOn: "2025-12-03 04:00:00" },
    callsFunction: "Tasks/reZEN - Onboarding Start Job",
    tags: ["🚀 onboard", "📂 rezen", "🔄 frequent", "📊 v3"],
    description: "Entry point - checks for pending reZEN onboarding jobs every 3 minutes"
  },
  {
    id: 2386,
    name: "reZEN - Onboarding - Load Transactions V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Load Transactions",
    tags: ["rezen", "onboarding", "transactions"],
    description: "Loads transactions from reZEN API during onboarding"
  },
  {
    id: 2387,
    name: "reZEN - Onboarding - Load Listings V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Load Listings",
    tags: ["rezen", "onboarding", "listings"],
    description: "Loads listings from reZEN API during onboarding"
  },
  {
    id: 2388,
    name: "reZEN - Onboarding - Load Network Downline V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Load Network Downline",
    tags: ["rezen", "onboarding", "network"],
    description: "Loads network downline from reZEN API during onboarding"
  },
  {
    id: 2448,
    name: "reZEN - Onboarding - Load Contributions V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Load Contributions",
    tags: ["rezen", "onboarding", "contributions"],
    description: "Loads contributions from reZEN API during onboarding"
  },
  {
    id: 2389,
    name: "reZEN - Onboarding - Process Transactions V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Transactions",
    tags: ["rezen", "onboarding", "transactions"],
    description: "Processes loaded transactions during onboarding"
  },
  {
    id: 2390,
    name: "reZEN - Onboarding - Process Listings V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Listings",
    tags: ["rezen", "onboarding", "listings"],
    description: "Processes loaded listings during onboarding"
  },
  {
    id: 2391,
    name: "reZEN - Onboarding - Process Network Downline V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Network Downline",
    tags: ["rezen", "onboarding", "network"],
    description: "Processes network downline during onboarding"
  },
  {
    id: 2392,
    name: "reZEN - Onboarding - Process Network Frontline V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Network Frontline",
    tags: ["rezen", "onboarding", "network"],
    description: "Processes network frontline during onboarding"
  },
  {
    id: 2393,
    name: "reZEN - Onboarding - Process Cap Data V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Cap Data",
    tags: ["rezen", "onboarding", "caps"],
    description: "Processes cap data during onboarding"
  },
  {
    id: 2394,
    name: "reZEN - Onboarding - Process Equity V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Equity",
    tags: ["rezen", "onboarding", "equity"],
    description: "Processes equity data during onboarding"
  },
  {
    id: 2395,
    name: "reZEN - Onboarding - Process Agent Sponsor Tree V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Agent Sponsor Tree",
    tags: ["rezen", "onboarding", "network"],
    description: "Processes agent sponsor tree during onboarding"
  },
  {
    id: 2396,
    name: "reZEN - Onboarding - Process Contributions V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Contributions",
    tags: ["rezen", "onboarding", "contributions"],
    description: "Processes contributions during onboarding"
  },
  {
    id: 2397,
    name: "reZEN - Onboarding - Process Contributors V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Contributors",
    tags: ["rezen", "onboarding", "contributions"],
    description: "Processes contributors during onboarding"
  },
  {
    id: 2398,
    name: "reZEN - Onboarding - Process Pending RevShare Totals V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Pending RevShare Totals",
    tags: ["rezen", "onboarding", "revshare"],
    description: "Processes pending revshare totals during onboarding"
  },
  {
    id: 2445,
    name: "reZEN - Onboarding - Completion V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Completion",
    tags: ["rezen", "onboarding"],
    description: "Marks onboarding as complete"
  },
  {
    id: 2473,
    name: "reZEN - Onboarding - Process Stage Transactions - Large Sets V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Stage Transactions Large",
    tags: ["rezen", "onboarding", "transactions"],
    description: "Processes large transaction sets during staging"
  },
  {
    id: 2474,
    name: "reZEN - Onboarding - Process Stage Transactions - Small Sets V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Stage Transactions Small",
    tags: ["rezen", "onboarding", "transactions"],
    description: "Processes small transaction sets during staging"
  },
  {
    id: 2475,
    name: "reZEN - Onboarding - Process Stage Listings V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Stage Listings",
    tags: ["rezen", "onboarding", "listings"],
    description: "Processes listings during staging"
  },
  {
    id: 2476,
    name: "reZEN - Onboarding - Process Stage Contributions V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Stage Contributions",
    tags: ["rezen", "onboarding", "contributions"],
    description: "Processes contributions during staging"
  },
  {
    id: 2477,
    name: "reZEN - Onboarding - Process Pending Contributions V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Onboarding - Process Pending Contributions",
    tags: ["rezen", "onboarding", "contributions"],
    description: "Processes pending contributions"
  },

  // === FUB DAILY UPDATES ===
  {
    id: 2418,
    name: "FUB - Daily Update - People V2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Daily Update - People V2",
    tags: ["fub", "daily", "people"],
    description: "Daily sync of FUB people data"
  },
  {
    id: 2416,
    name: "FUB - Daily Update - Events V2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Daily Update - Events V2",
    tags: ["fub", "daily", "events"],
    description: "Daily sync of FUB events"
  },
  {
    id: 2406,
    name: "FUB - Daily Update - Calls V2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Daily Update - Calls V2",
    tags: ["fub", "daily", "calls"],
    description: "Daily sync of FUB calls"
  },
  {
    id: 2409,
    name: "FUB - Daily Update - Appointments V2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Daily Update - Appointments V2",
    tags: ["fub", "daily", "appointments"],
    description: "Daily sync of FUB appointments"
  },
  {
    id: 2411,
    name: "FUB - Daily Update - Text Messages V2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Daily Update - Text Messages V2",
    tags: ["fub", "daily", "texts"],
    description: "Daily sync of FUB text messages"
  },
  {
    id: 2456,
    name: "FUB - Daily Update - Text Messages via phone V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Daily Update - Text Messages via phone",
    tags: ["fub", "daily", "texts"],
    description: "Daily sync of FUB text messages via phone number"
  },
  {
    id: 2414,
    name: "FUB - Daily Update - Deals V2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Daily Update - Deals V2",
    tags: ["fub", "daily", "deals"],
    description: "Daily sync of FUB deals"
  },

  // === FUB UTILITIES ===
  {
    id: 2428,
    name: "FUB - Refresh Tokens V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Refresh Tokens",
    tags: ["fub", "utility", "auth"],
    description: "Refreshes OAuth tokens for FUB integration"
  },
  {
    id: 2429,
    name: "FUB - Get Users V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Get Users",
    tags: ["fub", "utility"],
    description: "Fetches users from FUB API"
  },
  {
    id: 2430,
    name: "FUB - Get Stages V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Get Stages",
    tags: ["fub", "utility"],
    description: "Fetches deal stages from FUB API"
  },
  {
    id: 2431,
    name: "FUB - Webhook Check V3",
    active: false, // INACTIVE
    schedule: null,
    callsFunction: "Tasks/FUB - Webhook Check",
    tags: ["fub", "webhook"],
    description: "Checks FUB webhook status (INACTIVE)"
  },
  {
    id: 2432,
    name: "FUB - Delete Lambda Logs V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Delete Lambda Logs",
    tags: ["fub", "maintenance"],
    description: "Cleans up old lambda logs"
  },
  {
    id: 2444,
    name: "FUB - Pull count records and update V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Pull count records and update",
    tags: ["fub", "utility"],
    description: "Updates FUB record counts"
  },
  {
    id: 2454,
    name: "FUB - import_[fub_users_id] V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - import_[fub_users_id]",
    tags: ["fub", "import"],
    description: "Imports data for specific FUB user"
  },
  {
    id: 2457,
    name: "FUB - people url V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - people url",
    tags: ["fub", "utility"],
    description: "Updates people URLs"
  },
  {
    id: 2460,
    name: "FUB - Pull Text Messages From Calling Number V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Pull Text Messages From Calling Number",
    tags: ["fub", "utility", "texts"],
    description: "Pulls text messages from calling number"
  },

  // === FUB DATA FIXES ===
  {
    id: 2447,
    name: "FUB - Fix People Data in events V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Fix People Data in events",
    tags: ["fub", "fix"],
    description: "Fixes missing people data in events"
  },
  {
    id: 2449,
    name: "FUB - Get_appointments_missing_data V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Get_appointments_missing_data",
    tags: ["fub", "fix", "appointments"],
    description: "Fetches missing appointment data"
  },
  {
    id: 2451,
    name: "FUB - pull_events_with_people_id_0 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - pull_events_with_people_id_0",
    tags: ["fub", "fix", "events"],
    description: "Fixes events with missing people ID"
  },
  {
    id: 2458,
    name: "FUB - fix_calls_missing_record_username V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - fix_calls_missing_record_username",
    tags: ["fub", "fix", "calls"],
    description: "Fixes calls missing record username"
  },
  {
    id: 2459,
    name: "FUB - fix_appointments_missing_created_by V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - fix_appointments_missing_created_by",
    tags: ["fub", "fix", "appointments"],
    description: "Fixes appointments missing created_by"
  },
  {
    id: 2465,
    name: "FUB - Fix_people_data_in_FUB - People V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - Fix_people_data_in_FUB - People",
    tags: ["fub", "fix", "people"],
    description: "Fixes people data in FUB"
  },
  {
    id: 2441,
    name: "FUB - process text messages from stage table V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/FUB - process text messages from stage table",
    tags: ["fub", "utility", "texts"],
    description: "Processes text messages from staging"
  },

  // === REZEN DAILY / SYNC ===
  {
    id: 2437,
    name: "rezen - Contributions - daily update - processing V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/rezen - Contributions - daily update - processing",
    tags: ["rezen", "daily", "contributions"],
    description: "Daily processing of contributions"
  },
  {
    id: 2439,
    name: "reZEN - daily - Load Pending Contributions V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - daily - Load Pending Contributions",
    tags: ["rezen", "daily", "contributions"],
    description: "Loads pending contributions daily"
  },
  {
    id: 2435,
    name: "reZEN - Contributions - Full Update V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Contributions - Full Update",
    tags: ["rezen", "contributions"],
    description: "Full update of contributions"
  },
  {
    id: 2442,
    name: "reZEN - Process Pending Contributions V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Process Pending Contributions",
    tags: ["rezen", "contributions"],
    description: "Processes pending contributions"
  },
  {
    id: 2471,
    name: "reZEN - Transactions Sync - Worker 1 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Transactions Sync - Worker 1",
    tags: ["rezen", "sync", "transactions"],
    description: "Transaction sync worker 1"
  },
  {
    id: 2472,
    name: "reZEN - Transactions Sync - Worker 2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Transactions Sync - Worker 2",
    tags: ["rezen", "sync", "transactions"],
    description: "Transaction sync worker 2"
  },
  {
    id: 2478,
    name: "reZEN - Network - Downline Sync v2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Network - Downline Sync v2",
    tags: ["rezen", "sync", "network"],
    description: "Syncs network downline data"
  },

  // === REZEN NETWORK ===
  {
    id: 2467,
    name: "reZEN - Network - Frontline - Brad V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Network - Frontline - Brad",
    tags: ["rezen", "network", "frontline"],
    description: "Processes Brad's frontline network"
  },
  {
    id: 2468,
    name: "reZEN - Network - Frontline - Tim V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Network - Frontline - Tim",
    tags: ["rezen", "network", "frontline"],
    description: "Processes Tim's frontline network"
  },
  {
    id: 2469,
    name: "reZEN - Network - Update Frontline ASYNC, Tim V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Network - Update Frontline ASYNC Tim",
    tags: ["rezen", "network", "frontline"],
    description: "Async update of Tim's frontline"
  },
  {
    id: 2470,
    name: "reZEN - Network - Update Frontline ASYNC, Brad V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Network - Update Frontline ASYNC Brad",
    tags: ["rezen", "network", "frontline"],
    description: "Async update of Brad's frontline"
  },
  {
    id: 2420,
    name: "reZEN - Network - Missing Cap Data V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Network - Missing Cap Data",
    tags: ["rezen", "network", "fix"],
    description: "Fixes missing cap data in network"
  },
  {
    id: 2421,
    name: "reZEN - Network - Missing Frontline Data V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Network - Missing Frontline Data",
    tags: ["rezen", "network", "fix"],
    description: "Fixes missing frontline data"
  },
  {
    id: 2408,
    name: "rezen - Network Name Sync V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/rezen - Network Name Sync",
    tags: ["rezen", "network", "sync"],
    description: "Syncs network names"
  },

  // === REZEN OTHER ===
  {
    id: 2412,
    name: "rezen - generate referral code V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/rezen - generate referral code",
    tags: ["rezen", "utility"],
    description: "Generates referral codes"
  },
  {
    id: 2413,
    name: "reZEN - RevShare Totals V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - RevShare Totals",
    tags: ["rezen", "revshare"],
    description: "Calculates revshare totals"
  },
  {
    id: 2415,
    name: "reZEN - Team Roster - Caps and Splits V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Team Roster - Caps and Splits",
    tags: ["rezen", "team"],
    description: "Updates team roster caps and splits"
  },
  {
    id: 2417,
    name: "reZEN - Paid Participant - Missing Addresses V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Paid Participant - Missing Addresses",
    tags: ["rezen", "fix"],
    description: "Fixes missing addresses on paid participants"
  },
  {
    id: 2419,
    name: "reZEN - Paid Participant - Incomplete Mapping V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Paid Participant - Incomplete Mapping",
    tags: ["rezen", "fix"],
    description: "Fixes incomplete participant mapping"
  },
  {
    id: 2401,
    name: "reZEN - Monitor Sync Locks and Recover V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Monitor Sync Locks and Recover",
    tags: ["rezen", "monitoring"],
    description: "Monitors and recovers sync locks"
  },
  {
    id: 2403,
    name: "rezen - webhooks - register and check status V3",
    active: false, // INACTIVE
    schedule: null,
    callsFunction: "Tasks/rezen - webhooks - register and check status",
    tags: ["rezen", "webhook"],
    description: "Registers and checks webhook status (INACTIVE)"
  },
  {
    id: 2405,
    name: "reZEN - process webhooks and delete V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - process webhooks and delete",
    tags: ["rezen", "webhook"],
    description: "Processes and cleans up webhooks"
  },
  {
    id: 2466,
    name: "reZEN - Remove Duplicates - Network and Contributions V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/reZEN - Remove Duplicates - Network and Contributions",
    tags: ["rezen", "maintenance"],
    description: "Removes duplicate records"
  },

  // === SKYSLOPE ===
  {
    id: 2436,
    name: "SkySlope - Transactions Sync - Worker 1 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/SkySlope - Transactions Sync - Worker 1",
    tags: ["skyslope", "sync", "transactions"],
    description: "Syncs transactions from SkySlope"
  },
  {
    id: 2438,
    name: "SkySlope - Move Transactions from Staging V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/SkySlope - Move Transactions from Staging",
    tags: ["skyslope", "processing"],
    description: "Moves transactions from staging"
  },
  {
    id: 2440,
    name: "SkySlope - Move Listings from Staging V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/SkySlope - Move Listings from Staging",
    tags: ["skyslope", "processing"],
    description: "Moves listings from staging"
  },
  {
    id: 2443,
    name: "Skyslope - Listings Sync - Worker 1 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/Skyslope - Listings Sync - Worker 1",
    tags: ["skyslope", "sync", "listings"],
    description: "Syncs listings from SkySlope"
  },
  {
    id: 2446,
    name: "SkySlope - Account Users Sync - Worker 1 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/SkySlope - Account Users Sync - Worker 1",
    tags: ["skyslope", "sync", "users"],
    description: "Syncs account users from SkySlope"
  },

  // === TITLE (QUALIA) ===
  {
    id: 2450,
    name: "Title - Orders V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/Title - Orders",
    tags: ["title", "qualia"],
    description: "Processes title orders"
  },
  {
    id: 2452,
    name: "Title - Get Today's Qualia Orders V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/Title - Get Today's Qualia Orders",
    tags: ["title", "qualia", "daily"],
    description: "Fetches today's Qualia orders"
  },

  // === AD (AGENT DASHBOARDS INTERNAL) ===
  {
    id: 2399,
    name: "AD - Email - Network News - Daily v2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/AD - Email - Network News - Daily v2",
    tags: ["ad", "email", "daily"],
    description: "Sends daily network news email"
  },
  {
    id: 2400,
    name: "AD - Email - Network News - Weekly v2 V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/AD - Email - Network News - Weekly v2",
    tags: ["ad", "email", "weekly"],
    description: "Sends weekly network news email"
  },
  {
    id: 2402,
    name: "AD - Missing Agent IDs Participants V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/AD - Missing Agent IDs Participants",
    tags: ["ad", "fix"],
    description: "Fixes missing agent IDs on participants"
  },
  {
    id: 2404,
    name: "AD - Missing Team Roster Avatars V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/AD - Missing Team Roster Avatars",
    tags: ["ad", "fix", "images"],
    description: "Fixes missing team roster avatars"
  },
  {
    id: 2407,
    name: "AD - upload network images V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/AD - upload network images",
    tags: ["ad", "images"],
    description: "Uploads network agent images"
  },
  {
    id: 2410,
    name: "AD - CSV_Insert_data_from_temp_table V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/AD - CSV_Insert_data_from_temp_table",
    tags: ["ad", "import", "csv"],
    description: "Inserts data from CSV temp table"
  },
  {
    id: 2453,
    name: "AD - upload team roster images V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/AD - upload team roster images",
    tags: ["ad", "images"],
    description: "Uploads team roster images"
  },
  {
    id: 3121,
    name: "AD - Run All Linking Functions",
    active: true,
    schedule: null,
    callsFunction: "Tasks/AD - Run All Linking Functions",
    tags: ["ad", "utility"],
    description: "Runs all linking functions"
  },
  {
    id: 3138,
    name: "AD - unregister all webhooks",
    active: true,
    schedule: null,
    callsFunction: "Tasks/AD - unregister all webhooks",
    tags: ["ad", "webhook"],
    description: "Unregisters all webhooks"
  },

  // === REPORTING ===
  {
    id: 2434,
    name: "Reporting - Process Errors and Send to Slack V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/Reporting - Process Errors and Send to Slack",
    tags: ["reporting", "slack", "errors"],
    description: "Processes errors and sends to Slack"
  },

  // === METRICS ===
  {
    id: 2433,
    name: "Metrics - Create Snapshot V3",
    active: true,
    schedule: null,
    callsFunction: "Tasks/Metrics - Create Snapshot",
    tags: ["metrics", "snapshot"],
    description: "Creates system metrics snapshot"
  },

  // === DAILY COMMISSION ===
  {
    id: 3123,
    name: "Daily Commission Sync",
    active: true,
    schedule: null,
    callsFunction: "Tasks/Daily Commission Sync",
    tags: ["commission", "daily"],
    description: "Daily sync of commission data"
  },
]
