// @ts-nocheck
// Real Background Task Data from V2 Xano Workspace (Workspace 5)
// Generated from xano-mcp list_tasks on 2026-01-14
// Note: Type checking disabled for legacy data file

import type { BackgroundTask, TaskDomain } from "./types-v2"
import { parseDomainFromName } from "./types-v2"

// All 100 background tasks from the V2 workspace
// Organized by the function they call and their schedule
export const BACKGROUND_TASKS: BackgroundTask[] = [
  // ============================================================================
  // AGGREGATION TASKS (4 tasks)
  // ============================================================================
  {
    id: 3138,
    name: "AD - unregister all webhooks",
    active: true,
    schedule: null,
    tags: [],
    domain: "ad",
    callsFunction: null,
    lastModified: "2026-01-07 07:35:08+0000",
    created: "2026-01-07 07:26:20+0000"
  },
  {
    id: 3134,
    name: "Aggregation - Leaderboard Worker",
    active: true,
    schedule: { startsOn: "2025-12-26 07:30:00+0000", frequency: 3600, frequencyLabel: "Every hour" },
    tags: ["aggregation", "leaderboard", "v3", "hourly"],
    domain: "aggregation",
    callsFunction: "Tasks/Aggregation - Leaderboard Worker",
    lastModified: "2025-12-25 08:05:51+0000",
    created: "2025-12-25 08:05:51+0000"
  },
  {
    id: 3133,
    name: "Aggregation - Monthly Worker",
    active: true,
    schedule: { startsOn: "2025-12-26 07:05:00+0000", frequency: 300, frequencyLabel: "Every 5 min" },
    tags: ["aggregation", "worker", "v3", "monthly"],
    domain: "aggregation",
    callsFunction: "Tasks/Aggregation - Monthly Worker",
    lastModified: "2025-12-25 08:03:00+0000",
    created: "2025-12-25 08:03:00+0000"
  },
  {
    id: 3132,
    name: "Aggregation - Daily Scheduler",
    active: true,
    schedule: { startsOn: "2025-12-26 07:00:00+0000", frequency: 86400, frequencyLabel: "Daily" },
    tags: ["aggregation", "scheduler", "v3", "daily"],
    domain: "aggregation",
    callsFunction: "Tasks/Aggregation - Daily Scheduler",
    lastModified: "2025-12-25 07:50:18+0000",
    created: "2025-12-25 07:50:02+0000"
  },
  {
    id: 3123,
    name: "Daily Commission Sync",
    active: true,
    schedule: null,
    tags: [],
    domain: "ad",
    callsFunction: null,
    lastModified: "2025-12-23 17:56:42+0000",
    created: "2025-12-23 17:56:42+0000"
  },
  {
    id: 3121,
    name: "AD - Run All Linking Functions",
    active: true,
    schedule: null,
    tags: [],
    domain: "ad",
    callsFunction: "Workers/Run All Linking Functions",
    lastModified: "2025-12-19 05:57:59+0000",
    created: "2025-12-19 05:57:59+0000"
  },

  // ============================================================================
  // REZEN TASKS (28 tasks)
  // ============================================================================
  {
    id: 2478,
    name: "reZEN - Network - Downline Sync v2 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Network Downline Sync",
    lastModified: "2025-12-08 22:47:26+0000",
    created: "2025-12-03 08:01:15+0000"
  },
  {
    id: 2477,
    name: "reZEN - Onboarding - Process Pending Contributions V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Pending Contributions",
    lastModified: "2025-12-08 22:47:46+0000",
    created: "2025-12-03 07:14:30+0000"
  },
  {
    id: 2476,
    name: "reZEN - Onboarding - Process Stage Contributions V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Stage Contributions",
    lastModified: "2025-12-08 22:48:30+0000",
    created: "2025-12-03 07:14:22+0000"
  },
  {
    id: 2475,
    name: "reZEN - Onboarding - Process Stage Listings V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Stage Listings",
    lastModified: "2025-12-08 22:48:40+0000",
    created: "2025-12-03 07:14:16+0000"
  },
  {
    id: 2474,
    name: "reZEN - Onboarding - Process Stage Transactions - Small Sets V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Stage Transactions Small",
    lastModified: "2025-12-08 22:48:52+0000",
    created: "2025-12-03 07:14:11+0000"
  },
  {
    id: 2473,
    name: "reZEN - Onboarding - Process Stage Transactions - Large Sets V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Stage Transactions Large",
    lastModified: "2025-12-08 22:48:46+0000",
    created: "2025-12-03 07:14:05+0000"
  },
  {
    id: 2472,
    name: "reZEN - Transactions Sync - Worker 2 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Transactions Sync Worker 2",
    lastModified: "2025-12-08 22:53:17+0000",
    created: "2025-12-03 07:13:58+0000"
  },
  {
    id: 2471,
    name: "reZEN - Transactions Sync - Worker 1 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Transactions Sync Worker 1",
    lastModified: "2025-12-08 22:53:11+0000",
    created: "2025-12-03 07:13:51+0000"
  },
  {
    id: 2470,
    name: "reZEN - Network - Update Frontline ASYNC, Brad V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Network Update Frontline Brad",
    lastModified: "2025-12-08 22:49:38+0000",
    created: "2025-12-03 07:13:43+0000"
  },
  {
    id: 2469,
    name: "reZEN - Network - Update Frontline ASYNC, Tim V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Network Update Frontline Tim",
    lastModified: "2025-12-08 22:49:43+0000",
    created: "2025-12-03 07:13:35+0000"
  },
  {
    id: 2468,
    name: "reZEN - Network - Frontline - Tim V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Network Frontline Tim",
    lastModified: "2025-12-08 22:48:27+0000",
    created: "2025-12-03 07:13:28+0000"
  },
  {
    id: 2467,
    name: "reZEN - Network - Frontline - Brad V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Network Frontline Brad",
    lastModified: "2025-12-08 22:48:20+0000",
    created: "2025-12-03 07:13:21+0000"
  },
  {
    id: 2466,
    name: "reZEN - Remove Duplicates - Network and Contributions V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Remove Duplicates",
    lastModified: "2025-12-08 22:51:53+0000",
    created: "2025-12-03 07:12:48+0000"
  },
  {
    id: 2448,
    name: "reZEN - Onboarding - Load Contributions V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Load Contributions",
    lastModified: "2025-12-08 22:44:34+0000",
    created: "2025-12-03 06:54:41+0000"
  },
  {
    id: 2445,
    name: "reZEN - Onboarding - Completion V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Completion",
    lastModified: "2025-12-08 22:44:22+0000",
    created: "2025-12-03 06:54:34+0000"
  },
  {
    id: 2442,
    name: "reZEN - Process Pending Contributions V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Process Pending Contributions",
    lastModified: "2025-12-08 22:50:44+0000",
    created: "2025-12-03 06:54:25+0000"
  },
  {
    id: 2439,
    name: "reZEN - daily - Load Pending Contributions V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Daily Load Pending Contributions",
    lastModified: "2025-12-08 22:45:51+0000",
    created: "2025-12-03 06:54:16+0000"
  },
  {
    id: 2437,
    name: "rezen - Contributions - daily update - processing V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/rezen - Contributions Daily Update",
    lastModified: "2025-12-08 22:44:39+0000",
    created: "2025-12-03 06:54:08+0000"
  },
  {
    id: 2435,
    name: "reZEN - Contributions - Full Update V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Contributions Full Update",
    lastModified: "2025-12-08 22:45:05+0000",
    created: "2025-12-03 06:54:00+0000"
  },
  {
    id: 2421,
    name: "reZEN - Network - Missing Frontline Data V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Network Missing Frontline",
    lastModified: "2025-12-08 22:49:30+0000",
    created: "2025-12-03 06:47:53+0000"
  },
  {
    id: 2420,
    name: "reZEN - Network - Missing Cap Data V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Network Missing Cap Data",
    lastModified: "2025-12-08 22:49:21+0000",
    created: "2025-12-03 06:47:46+0000"
  },
  {
    id: 2419,
    name: "reZEN - Paid Participant - Incomplete Mapping V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Paid Participant Incomplete Mapping",
    lastModified: "2025-12-08 22:50:33+0000",
    created: "2025-12-03 06:47:38+0000"
  },
  {
    id: 2417,
    name: "reZEN - Paid Participant - Missing Addresses V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Paid Participant Missing Addresses",
    lastModified: "2025-12-08 22:50:38+0000",
    created: "2025-12-03 06:47:31+0000"
  },
  {
    id: 2415,
    name: "reZEN - Team Roster - Caps and Splits V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Team Roster Caps and Splits",
    lastModified: "2025-12-08 22:52:06+0000",
    created: "2025-12-03 06:47:23+0000"
  },
  {
    id: 2413,
    name: "reZEN - RevShare Totals V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - RevShare Totals",
    lastModified: "2025-12-08 22:51:59+0000",
    created: "2025-12-03 06:47:17+0000"
  },
  {
    id: 2412,
    name: "rezen - generate referral code V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Workers/reZEN - Generate Referral Code",
    lastModified: "2025-12-08 22:46:10+0000",
    created: "2025-12-03 06:47:09+0000"
  },
  {
    id: 2408,
    name: "rezen - Network Name Sync V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/rezen - Network Name Sync",
    lastModified: "2025-12-08 22:50:27+0000",
    created: "2025-12-03 06:47:01+0000"
  },
  {
    id: 2405,
    name: "reZEN - process webhooks and delete V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Process Webhooks",
    lastModified: "2025-12-08 22:51:47+0000",
    created: "2025-12-03 06:46:53+0000"
  },
  {
    id: 2403,
    name: "rezen - webhooks - register and check status V3",
    active: false,  // INACTIVE
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/rezen - Webhooks Register",
    lastModified: "2026-01-07 09:30:09+0000",
    created: "2025-12-03 06:46:46+0000"
  },
  {
    id: 2401,
    name: "reZEN - Monitor Sync Locks and Recover V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Monitor Sync Locks",
    lastModified: "2025-12-08 22:47:09+0000",
    created: "2025-12-03 06:46:37+0000"
  },

  // Onboarding Process Tasks (12 tasks)
  {
    id: 2398,
    name: "reZEN - Onboarding - Process Pending RevShare Totals V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process RevShare Totals",
    lastModified: "2025-12-08 22:47:52+0000",
    created: "2025-12-03 06:44:36+0000"
  },
  {
    id: 2397,
    name: "reZEN - Onboarding - Process Contributors V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Contributors",
    lastModified: "2025-12-08 22:46:23+0000",
    created: "2025-12-03 06:44:28+0000"
  },
  {
    id: 2396,
    name: "reZEN - Onboarding - Process Contributions V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Contributions",
    lastModified: "2025-12-08 22:46:14+0000",
    created: "2025-12-03 06:44:19+0000"
  },
  {
    id: 2395,
    name: "reZEN - Onboarding - Process Agent Sponsor Tree V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Sponsor Tree",
    lastModified: "2025-12-08 22:45:52+0000",
    created: "2025-12-03 06:44:13+0000"
  },
  {
    id: 2394,
    name: "reZEN - Onboarding - Process Equity V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Equity",
    lastModified: "2025-12-08 22:46:30+0000",
    created: "2025-12-03 06:44:05+0000"
  },
  {
    id: 2393,
    name: "reZEN - Onboarding - Process Cap Data V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Cap Data",
    lastModified: "2025-12-08 22:46:03+0000",
    created: "2025-12-03 06:43:57+0000"
  },
  {
    id: 2392,
    name: "reZEN - Onboarding - Process Network Frontline V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Network Frontline",
    lastModified: "2025-12-08 22:47:40+0000",
    created: "2025-12-03 06:43:49+0000"
  },
  {
    id: 2391,
    name: "reZEN - Onboarding - Process Network Downline V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Network Downline",
    lastModified: "2025-12-08 22:47:29+0000",
    created: "2025-12-03 06:43:41+0000"
  },
  {
    id: 2390,
    name: "reZEN - Onboarding - Process Listings V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Listings",
    lastModified: "2025-12-08 22:47:16+0000",
    created: "2025-12-03 06:43:16+0000"
  },
  {
    id: 2389,
    name: "reZEN - Onboarding - Process Transactions V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Process Transactions",
    lastModified: "2025-12-08 22:48:59+0000",
    created: "2025-12-03 06:43:06+0000"
  },
  {
    id: 2388,
    name: "reZEN - Onboarding - Load Network Downline V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Load Network Downline",
    lastModified: "2025-12-08 22:45:02+0000",
    created: "2025-12-03 06:42:59+0000"
  },
  {
    id: 2387,
    name: "reZEN - Onboarding - Load Listings V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Load Listings",
    lastModified: "2025-12-08 22:44:50+0000",
    created: "2025-12-03 06:42:51+0000"
  },
  {
    id: 2386,
    name: "reZEN - Onboarding - Load Transactions V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Load Transactions",
    lastModified: "2025-12-08 22:45:11+0000",
    created: "2025-12-03 06:42:44+0000"
  },
  {
    id: 2385,
    name: "reZEN - Onboarding - Start Onboarding Job V3",
    active: true,
    schedule: { startsOn: "2025-12-03 04:00:00+0000", frequency: 180, frequencyLabel: "Every 3 min" },
    tags: ["onboard", "rezen", "frequent", "v3"],
    domain: "rezen",
    callsFunction: "Tasks/reZEN - Onboarding Start Job",
    lastModified: "2025-12-08 22:49:38+0000",
    created: "2025-12-03 06:42:35+0000"
  },

  // ============================================================================
  // FUB TASKS (29 tasks)
  // ============================================================================
  {
    id: 2465,
    name: "FUB - Fix_people_data_in_FUB - People V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Fix People Data",
    lastModified: "2025-12-08 22:44:59+0000",
    created: "2025-12-03 07:11:10+0000"
  },
  {
    id: 2464,
    name: "FUB - Onboarding - Calls - Worker 4 V3",
    active: true,
    schedule: null,
    tags: ["onboard", "fub", "frequent", "v3"],
    domain: "fub",
    callsFunction: "Tasks/FUB - Onboarding Calls Worker 4",
    lastModified: "2025-12-08 22:47:34+0000",
    created: "2025-12-03 07:11:03+0000"
  },
  {
    id: 2463,
    name: "FUB - Onboarding - Calls - Worker 3 V3",
    active: true,
    schedule: null,
    tags: ["onboard", "fub", "frequent", "v3"],
    domain: "fub",
    callsFunction: "Tasks/FUB - Onboarding Calls Worker 3",
    lastModified: "2025-12-08 22:47:27+0000",
    created: "2025-12-03 07:10:55+0000"
  },
  {
    id: 2462,
    name: "FUB - Onboarding - Calls - Worker 2 V3",
    active: true,
    schedule: null,
    tags: ["onboard", "fub", "frequent", "v3"],
    domain: "fub",
    callsFunction: "Tasks/FUB - Onboarding Calls Worker 2",
    lastModified: "2025-12-08 22:47:20+0000",
    created: "2025-12-03 07:10:48+0000"
  },
  {
    id: 2461,
    name: "FUB - Onboarding - Appointments from Users V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Onboarding Appointments",
    lastModified: "2025-12-08 22:46:17+0000",
    created: "2025-12-03 07:10:41+0000"
  },
  {
    id: 2460,
    name: "FUB - Pull Text Messages From Calling Number V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Pull Text Messages Calling Number",
    lastModified: "2025-12-08 22:49:53+0000",
    created: "2025-12-03 06:55:41+0000"
  },
  {
    id: 2459,
    name: "FUB - fix_appointments_missing_created_by V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Workers/FUB - Fix Appointments Missing Created By",
    lastModified: "2025-12-08 22:44:25+0000",
    created: "2025-12-03 06:55:35+0000"
  },
  {
    id: 2458,
    name: "FUB - fix_calls_missing_record_username V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Fix Calls Missing Username",
    lastModified: "2025-12-08 22:44:42+0000",
    created: "2025-12-03 06:55:27+0000"
  },
  {
    id: 2457,
    name: "FUB - people url V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Workers/FUB - Get People URL",
    lastModified: "2025-12-08 22:49:13+0000",
    created: "2025-12-03 06:55:19+0000"
  },
  {
    id: 2456,
    name: "FUB - Daily Update - Text Messages via phone V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Daily Update Text Messages",
    lastModified: "2025-12-08 22:46:54+0000",
    created: "2025-12-03 06:55:13+0000"
  },
  {
    id: 2455,
    name: "FUB - Onboarding Jobs V3",
    active: true,
    schedule: { startsOn: "2025-12-03 04:00:00+0000", frequency: 60, frequencyLabel: "Every minute" },
    tags: ["onboard", "fub", "scheduler", "v3"],
    domain: "fub",
    callsFunction: "Tasks/FUB - Onboarding Jobs",
    lastModified: "2025-12-08 22:49:07+0000",
    created: "2025-12-03 06:55:05+0000"
  },
  {
    id: 2454,
    name: "FUB - import_[fub_users_id] V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Import FUB Users",
    lastModified: "2025-12-08 22:46:07+0000",
    created: "2025-12-03 06:54:57+0000"
  },
  {
    id: 2451,
    name: "FUB - pull_events_with_people_id_0 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Pull Events People ID 0",
    lastModified: "2025-12-08 22:49:59+0000",
    created: "2025-12-03 06:54:49+0000"
  },
  {
    id: 2449,
    name: "FUB - Get_appointments_missing_data V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Get Appointments Missing Data",
    lastModified: "2025-12-08 22:45:56+0000",
    created: "2025-12-03 06:54:41+0000"
  },
  {
    id: 2447,
    name: "FUB - Fix People Data in events V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Workers/FUB - Events Pull People Data",
    lastModified: "2025-12-08 22:44:15+0000",
    created: "2025-12-03 06:54:37+0000"
  },
  {
    id: 2444,
    name: "FUB - Pull count records and update V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Pull Count Records",
    lastModified: "2025-12-08 22:49:26+0000",
    created: "2025-12-03 06:54:29+0000"
  },
  {
    id: 2441,
    name: "FUB - process text messages from stage table V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Workers/FUB - Process Text Messages Stage",
    lastModified: "2025-12-08 22:49:20+0000",
    created: "2025-12-03 06:54:21+0000"
  },
  {
    id: 2432,
    name: "FUB - Delete Lambda Logs V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Workers/FUB - Delete Lambda Logs",
    lastModified: "2025-12-08 22:47:04+0000",
    created: "2025-12-03 06:49:21+0000"
  },
  {
    id: 2431,
    name: "FUB - Webhook Check V3",
    active: false,  // INACTIVE
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Webhook Check",
    lastModified: "2026-01-06 07:22:25+0000",
    created: "2025-12-03 06:49:13+0000"
  },
  {
    id: 2430,
    name: "FUB - Get Stages V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Workers/FUB - Get Stages",
    lastModified: "2025-12-08 22:47:11+0000",
    created: "2025-12-03 06:49:05+0000"
  },
  {
    id: 2429,
    name: "FUB - Get Users V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Workers/FUB - Get Account Users",
    lastModified: "2025-12-08 22:47:21+0000",
    created: "2025-12-03 06:48:57+0000"
  },
  {
    id: 2428,
    name: "FUB - Refresh Tokens V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Workers/FUB - Refresh Tokens",
    lastModified: "2025-12-08 22:47:28+0000",
    created: "2025-12-03 06:48:49+0000"
  },
  {
    id: 2427,
    name: "FUB - Onboarding - Deals from People V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Workers/FUB - Get Deals",
    lastModified: "2025-12-08 22:48:05+0000",
    created: "2025-12-03 06:48:28+0000"
  },
  {
    id: 2426,
    name: "FUB - Onboarding - Text Messages from People V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Workers/FUB - Get Text Messages V3",
    lastModified: "2025-12-08 22:48:27+0000",
    created: "2025-12-03 06:48:21+0000"
  },
  {
    id: 2425,
    name: "FUB - Onboarding - Appointments Worker V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Onboarding Appointments Worker",
    lastModified: "2025-12-08 22:46:26+0000",
    created: "2025-12-03 06:48:13+0000"
  },
  {
    id: 2424,
    name: "FUB - Onboarding - Events - Worker 1 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Onboarding Events Worker 1",
    lastModified: "2025-12-08 22:48:11+0000",
    created: "2025-12-03 06:48:09+0000"
  },
  {
    id: 2423,
    name: "FUB - Onboarding - Calls - Worker 1 V3",
    active: true,
    schedule: { startsOn: "2025-12-03 04:00:00+0000", frequency: 60, frequencyLabel: "Every minute" },
    tags: ["onboard", "fub", "frequent", "v3"],
    domain: "fub",
    callsFunction: "Tasks/FUB - Onboarding Calls Worker 1",
    lastModified: "2025-12-08 22:47:09+0000",
    created: "2025-12-03 06:48:01+0000"
  },
  {
    id: 2422,
    name: "FUB - Onboarding - People - Worker 1 V3",
    active: true,
    schedule: { startsOn: "2025-12-03 04:00:00+0000", frequency: 60, frequencyLabel: "Every minute" },
    tags: ["onboard", "fub", "frequent", "v3"],
    domain: "fub",
    callsFunction: "Tasks/FUB - Onboarding People Worker 1",
    lastModified: "2025-12-08 22:48:20+0000",
    created: "2025-12-03 06:47:53+0000"
  },
  // Daily Update tasks
  {
    id: 2418,
    name: "FUB - Daily Update - People V2 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Daily Update People",
    lastModified: "2025-12-08 22:46:11+0000",
    created: "2025-12-03 06:47:33+0000"
  },
  {
    id: 2416,
    name: "FUB - Daily Update - Events V2 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Daily Update Events",
    lastModified: "2025-12-08 22:45:47+0000",
    created: "2025-12-03 06:47:25+0000"
  },
  {
    id: 2414,
    name: "FUB - Daily Update - Deals V2 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Daily Update Deals",
    lastModified: "2025-12-08 22:45:35+0000",
    created: "2025-12-03 06:47:17+0000"
  },
  {
    id: 2411,
    name: "FUB - Daily Update - Text Messages V2 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Daily Update Text Messages",
    lastModified: "2025-12-08 22:46:22+0000",
    created: "2025-12-03 06:47:09+0000"
  },
  {
    id: 2409,
    name: "FUB - Daily Update - Appointments V2 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Daily Update Appointments",
    lastModified: "2025-12-08 22:45:19+0000",
    created: "2025-12-03 06:47:03+0000"
  },
  {
    id: 2406,
    name: "FUB - Daily Update - Calls V2 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "fub",
    callsFunction: "Tasks/FUB - Daily Update Calls",
    lastModified: "2025-12-08 22:45:27+0000",
    created: "2025-12-03 06:46:56+0000"
  },

  // ============================================================================
  // SKYSLOPE TASKS (5 tasks)
  // ============================================================================
  {
    id: 2446,
    name: "SkySlope - Account Users Sync - Worker 1 V3",
    active: true,
    schedule: null,
    tags: ["sync", "skyslope", "frequent", "v3"],
    domain: "skyslope",
    callsFunction: "Tasks/SkySlope - Account Users Sync Worker 1",
    lastModified: "2025-12-08 22:49:44+0000",
    created: "2025-12-03 06:54:34+0000"
  },
  {
    id: 2443,
    name: "Skyslope - Listings Sync - Worker 1 V3",
    active: true,
    schedule: null,
    tags: ["sync", "skyslope", "frequent", "v3"],
    domain: "skyslope",
    callsFunction: "Tasks/SkySlope - Listings Sync Worker 1",
    lastModified: "2025-12-08 22:49:50+0000",
    created: "2025-12-03 06:54:27+0000"
  },
  {
    id: 2440,
    name: "SkySlope - Move Listings from Staging V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "skyslope",
    callsFunction: "Workers/SkySlope - Move Listings from Staging",
    lastModified: "2025-12-08 22:49:57+0000",
    created: "2025-12-03 06:54:20+0000"
  },
  {
    id: 2438,
    name: "SkySlope - Move Transactions from Staging V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "skyslope",
    callsFunction: "Workers/reZEN - Move Transactions from Staging",
    lastModified: "2025-12-08 22:50:05+0000",
    created: "2025-12-03 06:54:12+0000"
  },
  {
    id: 2436,
    name: "SkySlope - Transactions Sync - Worker 1 V3",
    active: true,
    schedule: { startsOn: "2025-12-03 04:00:00+0000", frequency: 60, frequencyLabel: "Every minute" },
    tags: ["sync", "skyslope", "frequent", "v3"],
    domain: "skyslope",
    callsFunction: "Tasks/SkySlope - Transactions Sync Worker 1",
    lastModified: "2025-12-08 22:50:42+0000",
    created: "2025-12-03 06:54:04+0000"
  },

  // ============================================================================
  // TITLE TASKS (2 tasks)
  // ============================================================================
  {
    id: 2452,
    name: "Title - Get Today's Qualia Orders V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "title",
    callsFunction: "Tasks/Title - Get Todays Qualia Orders",
    lastModified: "2025-12-08 22:50:48+0000",
    created: "2025-12-03 06:54:50+0000"
  },
  {
    id: 2450,
    name: "Title - Orders V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "title",
    callsFunction: "Tasks/Title - Orders",
    lastModified: "2025-12-08 22:50:55+0000",
    created: "2025-12-03 06:54:42+0000"
  },

  // ============================================================================
  // AD - AGENTDASHBOARDS TASKS (11 tasks)
  // ============================================================================
  {
    id: 2453,
    name: "AD - upload team roster images V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "ad",
    callsFunction: "Workers/AD - Upload Team Roster Images to Cloud",
    lastModified: "2025-12-08 22:45:43+0000",
    created: "2025-12-03 06:54:56+0000"
  },
  {
    id: 2410,
    name: "AD - CSV_Insert_data_from_temp_table V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "ad",
    callsFunction: "Workers/AD - CSV Insert Data from Temp Table",
    lastModified: "2025-12-08 22:44:34+0000",
    created: "2025-12-03 06:47:04+0000"
  },
  {
    id: 2407,
    name: "AD - upload network images V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "ad",
    callsFunction: "Workers/AD - Upload Network Images to Cloud",
    lastModified: "2025-12-08 22:45:36+0000",
    created: "2025-12-03 06:46:57+0000"
  },
  {
    id: 2404,
    name: "AD - Missing Team Roster Avatars V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "ad",
    callsFunction: "Workers/AD - Missing Team Roster Avatars",
    lastModified: "2025-12-08 22:45:27+0000",
    created: "2025-12-03 06:46:49+0000"
  },
  {
    id: 2402,
    name: "AD - Missing Agent IDs Participants V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "ad",
    callsFunction: "Workers/AD - Missing Agent IDs Participants",
    lastModified: "2025-12-08 22:45:15+0000",
    created: "2025-12-03 06:46:41+0000"
  },
  {
    id: 2400,
    name: "AD - Email - Network News - Weekly v2 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "ad",
    callsFunction: "Tasks/AD - Email Network News Weekly",
    lastModified: "2025-12-08 22:45:02+0000",
    created: "2025-12-03 06:46:34+0000"
  },
  {
    id: 2399,
    name: "AD - Email - Network News - Daily v2 V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "ad",
    callsFunction: "Tasks/AD - Email Network News Daily - Worker",
    lastModified: "2025-12-08 22:44:47+0000",
    created: "2025-12-03 06:46:25+0000"
  },

  // ============================================================================
  // REPORTING & METRICS TASKS (2 tasks)
  // ============================================================================
  {
    id: 2434,
    name: "Reporting - Process Errors and Send to Slack V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "reporting",
    callsFunction: "Tasks/Reporting - Process Errors Slack",
    lastModified: "2025-12-08 22:51:09+0000",
    created: "2025-12-03 06:49:38+0000"
  },
  {
    id: 2433,
    name: "Metrics - Create Snapshot V3",
    active: true,
    schedule: null,
    tags: [],
    domain: "metrics",
    callsFunction: "Workers/Metrics - Create Snapshot",
    lastModified: "2025-12-08 22:51:02+0000",
    created: "2025-12-03 06:49:29+0000"
  },
]

// Get tasks grouped by domain
export function getTasksByDomain(): Record<TaskDomain, BackgroundTask[]> {
  const grouped: Record<TaskDomain, BackgroundTask[]> = {
    fub: [],
    rezen: [],
    skyslope: [],
    aggregation: [],
    title: [],
    ad: [],
    reporting: [],
    metrics: []
  }

  for (const task of BACKGROUND_TASKS) {
    grouped[task.domain].push(task)
  }

  return grouped
}

// Get stats
export function getTaskStats() {
  const byDomain = getTasksByDomain()
  const active = BACKGROUND_TASKS.filter(t => t.active).length
  const inactive = BACKGROUND_TASKS.filter(t => !t.active).length
  const scheduled = BACKGROUND_TASKS.filter(t => t.schedule !== null).length

  return {
    total: BACKGROUND_TASKS.length,
    active,
    inactive,
    scheduled,
    byDomain: Object.fromEntries(
      Object.entries(byDomain).map(([domain, tasks]) => [
        domain,
        { total: tasks.length, active: tasks.filter(t => t.active).length }
      ])
    )
  }
}

// Domain display info
export const DOMAIN_INFO: Record<TaskDomain, { name: string; description: string; color: string; icon: string }> = {
  fub: {
    name: "Follow Up Boss",
    description: "CRM sync: people, calls, texts, appointments, deals, events",
    color: "blue",
    icon: "Phone"
  },
  rezen: {
    name: "reZEN",
    description: "Brokerage API: transactions, network, contributions, onboarding",
    color: "green",
    icon: "Building"
  },
  skyslope: {
    name: "SkySlope",
    description: "Transaction management: listings, transactions, users",
    color: "purple",
    icon: "FileText"
  },
  aggregation: {
    name: "Aggregation",
    description: "Data aggregation: leaderboards, daily/monthly stats",
    color: "orange",
    icon: "BarChart"
  },
  title: {
    name: "Title",
    description: "Title company: Qualia orders, disbursements",
    color: "yellow",
    icon: "FileCheck"
  },
  ad: {
    name: "AgentDashboards",
    description: "Internal: images, avatars, CSV imports, emails",
    color: "slate",
    icon: "Settings"
  },
  reporting: {
    name: "Reporting",
    description: "Error reporting, Slack notifications",
    color: "red",
    icon: "AlertCircle"
  },
  metrics: {
    name: "Metrics",
    description: "System snapshots and analytics",
    color: "cyan",
    icon: "Activity"
  }
}
