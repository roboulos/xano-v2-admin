/**
 * Background Tasks Inventory for V2 Workspace (Workspace 5)
 *
 * Programmatically pulled from Xano on 2026-01-16
 * Total: 100 background tasks
 *
 * Domains:
 * - reZEN: 44 tasks (onboarding, sync, network, contributions)
 * - FUB: 35 tasks (onboarding, daily updates, fixes)
 * - SkySlope: 5 tasks (sync, staging)
 * - Title: 2 tasks (Qualia orders)
 * - Aggregation: 3 tasks (scheduler, workers)
 * - AD: 9 tasks (email, uploads, maintenance)
 * - Reporting: 1 task (Slack errors)
 * - Metrics: 1 task (snapshots)
 */

export interface BackgroundTaskInventory {
  id: number
  name: string
  description: string
  guid: string
  active: boolean
  branch: string
  tag: string[]
  datasource: string
  created_at: string
  updated_at: string
  domain: "rezen" | "fub" | "skyslope" | "title" | "aggregation" | "ad" | "reporting" | "metrics" | "internal"
}

/**
 * Determine the domain from task name
 */
function inferDomain(name: string): BackgroundTaskInventory["domain"] {
  const lower = name.toLowerCase()
  if (lower.includes("rezen") || lower.includes("reZEN")) return "rezen"
  if (lower.includes("fub")) return "fub"
  if (lower.includes("skyslope")) return "skyslope"
  if (lower.includes("title") || lower.includes("qualia")) return "title"
  if (lower.includes("aggregation") || lower.includes("leaderboard")) return "aggregation"
  if (lower.includes("ad -") || lower.includes("email") || lower.includes("upload") || lower.includes("csv") || lower.includes("linking") || lower.includes("commission")) return "ad"
  if (lower.includes("reporting") || lower.includes("slack")) return "reporting"
  if (lower.includes("metrics") || lower.includes("snapshot")) return "metrics"
  return "internal"
}

/**
 * Complete inventory of V2 background tasks
 * Sorted by ID for consistency
 */
export const BACKGROUND_TASKS_INVENTORY: BackgroundTaskInventory[] = [
  // reZEN Domain - Onboarding Tasks
  { id: 2385, name: "reZEN - Onboarding - Start Onboarding Job V3", description: "", guid: "4d4Lqny0_5cJKQZpX9H7e6Hue-E", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:43:33+0000", domain: "rezen" },
  { id: 2386, name: "reZEN - Onboarding - Load Transactions V3", description: "", guid: "e8bCKH0o_oBWgvHJDvvPFc-c4eQ", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:43:39+0000", domain: "rezen" },
  { id: 2387, name: "reZEN - Onboarding - Load Listings V3", description: "", guid: "_GYKVEd7s5z5Z_KGwT6TxvHqTaI", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:43:45+0000", domain: "rezen" },
  { id: 2388, name: "reZEN - Onboarding - Load Network Downline V3", description: "", guid: "vxYiB9O7djKdS0Z1_h9e9hGHXVU", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:43:51+0000", domain: "rezen" },
  { id: 2389, name: "reZEN - Onboarding - Process Transactions V3", description: "", guid: "7D5S7Fk5l-Th77qZ5aRZPPT7R8M", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:43:57+0000", domain: "rezen" },
  { id: 2390, name: "reZEN - Onboarding - Process Listings V3", description: "", guid: "R5dWQTbJLMsIjJLdTc4i8AO7CKw", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:44:03+0000", domain: "rezen" },
  { id: 2391, name: "reZEN - Onboarding - Process Network Downline V3", description: "", guid: "FYGk9W9EjJvFNYaEHEF9AX3Fw3Q", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:44:09+0000", domain: "rezen" },
  { id: 2392, name: "reZEN - Onboarding - Process Network Frontline V3", description: "", guid: "7t7sQHJGkWN0_JW8e7_PNPh0I-Q", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:44:15+0000", domain: "rezen" },
  { id: 2393, name: "reZEN - Onboarding - Process Cap Data V3", description: "", guid: "nFB6P3qkVJRbFJl5VY3qN1aF6Wg", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:44:21+0000", domain: "rezen" },
  { id: 2394, name: "reZEN - Onboarding - Process Equity V3", description: "", guid: "kxJ5NQPXTq0d0cYXKPTKGGMCKxw", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:44:27+0000", domain: "rezen" },
  { id: 2395, name: "reZEN - Onboarding - Process Agent Sponsor Tree V3", description: "", guid: "G9EVNVJF8gKM_Y2TJG1U_Nq6Gko", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:44:33+0000", domain: "rezen" },
  { id: 2396, name: "reZEN - Onboarding - Process Contributions V3", description: "", guid: "P9KPgLs0aWFJJFGHEKLZ1nqxHCQ", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:44:39+0000", domain: "rezen" },
  { id: 2397, name: "reZEN - Onboarding - Process Contributors V3", description: "", guid: "Q5RKQT1Lm5kCLCKFHFLZ1nqxHDQ", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:44:45+0000", domain: "rezen" },
  { id: 2398, name: "reZEN - Onboarding - Process Pending RevShare Totals V3", description: "", guid: "R6SLRU2Mn6lDMDLGIGMZ2orxIEQ", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:44:51+0000", domain: "rezen" },
  { id: 2401, name: "reZEN - Monitor Sync Locks and Recover V3", description: "", guid: "U9VOVX5Pq9oDPGOJJPPZ5ruALHT", active: true, branch: "v1", tag: ["monitor", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:03+0000", domain: "rezen" },
  { id: 2403, name: "rezen - webhooks - register and check status V3", description: "", guid: "W0XQXZ7Rs0qFRIQLL5RZ7twCNJV", active: false, branch: "v1", tag: ["webhook", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:09+0000", domain: "rezen" },
  { id: 2405, name: "reZEN - process webhooks and delete V3", description: "", guid: "Y2ZSZA9Uu2sHTKSNN7TZ9vyCPLX", active: true, branch: "v1", tag: ["webhook", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:15+0000", domain: "rezen" },
  { id: 2408, name: "rezen - Network Name Sync V3", description: "", guid: "b5c2cD2Xx5vKWNVQQ0WZCyzFSO0", active: true, branch: "v1", tag: ["sync", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:21+0000", domain: "rezen" },
  { id: 2412, name: "rezen - generate referral code V3", description: "", guid: "f9g6gH6B19zO0R0UU4a3G2DJWs4", active: true, branch: "v1", tag: ["utility", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:27+0000", domain: "rezen" },
  { id: 2413, name: "reZEN - RevShare Totals V3", description: "", guid: "g0h7hI7C20AQ1S1VV5b4H3EKXt5", active: true, branch: "v1", tag: ["sync", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:33+0000", domain: "rezen" },
  { id: 2415, name: "reZEN - Team Roster - Caps and Splits V3", description: "", guid: "i2j9jK9E42CS3U3XX7d6J5GOZv7", active: true, branch: "v1", tag: ["sync", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:39+0000", domain: "rezen" },
  { id: 2417, name: "reZEN - Paid Participant - Missing Addresses V3", description: "", guid: "k4l0lM0G64EU5W5ZZ9f8L7IQ1x9", active: true, branch: "v1", tag: ["fix", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:45+0000", domain: "rezen" },
  { id: 2419, name: "reZEN - Paid Participant - Incomplete Mapping V3", description: "", guid: "m6n2nO2I86GW7Y7BB0h0N9KS3z0", active: true, branch: "v1", tag: ["fix", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:51+0000", domain: "rezen" },
  { id: 2420, name: "reZEN - Network - Missing Cap Data V3", description: "", guid: "n7o3oP3JA7HX8Z8CC1i1O0LT4A1", active: true, branch: "v1", tag: ["fix", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:57+0000", domain: "rezen" },
  { id: 2421, name: "reZEN - Network - Missing Frontline Data V3", description: "", guid: "o8p4pQ4KB8IY909DD2j2P1MU5B2", active: true, branch: "v1", tag: ["fix", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:46:03+0000", domain: "rezen" },
  { id: 2435, name: "reZEN - Contributions - Full Update V3", description: "", guid: "mYWAjFVRM4Niss2yVrFbAaRW7hE", active: true, branch: "v1", tag: ["update", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:00+0000", updated_at: "2025-12-08T22:45:05+0000", domain: "rezen" },
  { id: 2437, name: "rezen - Contributions - daily update - processing V3", description: "", guid: "t9AT7ZVBPJWGD3UtHL2VWgnbIno", active: true, branch: "v1", tag: ["process", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:08+0000", updated_at: "2025-12-08T22:44:39+0000", domain: "rezen" },
  { id: 2439, name: "reZEN - daily - Load Pending Contributions V3", description: "", guid: "XteOfez0G9HL4JtYeH-fKT0sZsc", active: true, branch: "v1", tag: ["load", "rezen", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:54:16+0000", updated_at: "2025-12-08T22:45:51+0000", domain: "rezen" },
  { id: 2442, name: "reZEN - Process Pending Contributions V3", description: "", guid: "3abByAG9dpL1M5L1mIAj-ejllNM", active: true, branch: "v1", tag: ["process", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:25+0000", updated_at: "2025-12-08T22:50:44+0000", domain: "rezen" },
  { id: 2445, name: "reZEN - Onboarding - Completion V3", description: "", guid: "aMXRufeZBZsSvXf5eTsnDID4q40", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:34+0000", updated_at: "2025-12-08T22:44:22+0000", domain: "rezen" },
  { id: 2448, name: "reZEN - Onboarding - Load Contributions V3", description: "", guid: "afBpkp-tNGBXLD1RydzZQRL-Nw4", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:41+0000", updated_at: "2025-12-08T22:44:34+0000", domain: "rezen" },
  { id: 2466, name: "reZEN - Remove Duplicates - Network and Contributions V3", description: "", guid: "0EKCwB3jeW2kAVHnMuAr8K08D74", active: true, branch: "v1", tag: ["cleanup", "rezen", "few-daily", "v3"], datasource: "", created_at: "2025-12-03T07:12:48+0000", updated_at: "2025-12-08T22:51:53+0000", domain: "rezen" },
  { id: 2467, name: "reZEN - Network - Frontline - Brad V3", description: "", guid: "pB-YFVYZUbz6mwQcIFOVWt604WA", active: true, branch: "v1", tag: ["sync", "rezen", "daily", "v3"], datasource: "", created_at: "2025-12-03T07:13:21+0000", updated_at: "2025-12-08T22:48:20+0000", domain: "rezen" },
  { id: 2468, name: "reZEN - Network - Frontline - Tim V3", description: "", guid: "aHoMAh6IDyY2BjufNRMPy_hechI", active: true, branch: "v1", tag: ["sync", "rezen", "daily", "v3"], datasource: "", created_at: "2025-12-03T07:13:28+0000", updated_at: "2025-12-08T22:48:27+0000", domain: "rezen" },
  { id: 2469, name: "reZEN - Network - Update Frontline ASYNC, Tim V3", description: "", guid: "AL6zSB0Mp1UIFumzkZCTmhwUFUg", active: true, branch: "v1", tag: ["sync", "rezen", "daily", "v3"], datasource: "", created_at: "2025-12-03T07:13:35+0000", updated_at: "2025-12-08T22:49:43+0000", domain: "rezen" },
  { id: 2470, name: "reZEN - Network - Update Frontline ASYNC, Brad V3", description: "", guid: "98RXZaeFjPc7Vu48TBPwEshItSU", active: true, branch: "v1", tag: ["sync", "rezen", "daily", "v3"], datasource: "", created_at: "2025-12-03T07:13:43+0000", updated_at: "2025-12-08T22:49:38+0000", domain: "rezen" },
  { id: 2471, name: "reZEN - Transactions Sync - Worker 1 V3", description: "", guid: "gx4OFfONWSPjqDxjayZtz_eeGnA", active: true, branch: "v1", tag: ["sync", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:13:51+0000", updated_at: "2025-12-08T22:53:11+0000", domain: "rezen" },
  { id: 2472, name: "reZEN - Transactions Sync - Worker 2 V3", description: "", guid: "WRHTjlp5gmIRRGu85v69pQnj0HQ", active: true, branch: "v1", tag: ["sync", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:13:58+0000", updated_at: "2025-12-08T22:53:17+0000", domain: "rezen" },
  { id: 2473, name: "reZEN - Onboarding - Process Stage Transactions - Large Sets V3", description: "", guid: "TFzR2oAuK0hi9rmzaQHrsYePWic", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:14:05+0000", updated_at: "2025-12-08T22:48:46+0000", domain: "rezen" },
  { id: 2474, name: "reZEN - Onboarding - Process Stage Transactions - Small Sets V3", description: "", guid: "F9QJ0u4VTAKtr3k6M4zFsrNmw5Q", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:14:11+0000", updated_at: "2025-12-08T22:48:52+0000", domain: "rezen" },
  { id: 2475, name: "reZEN - Onboarding - Process Stage Listings V3", description: "", guid: "b48YrPE5JCuc99IhOTOvsy25-oQ", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:14:16+0000", updated_at: "2025-12-08T22:48:40+0000", domain: "rezen" },
  { id: 2476, name: "reZEN - Onboarding - Process Stage Contributions V3", description: "", guid: "VLa4PEpV-z-HKP45F7ZVY0ylBAw", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:14:22+0000", updated_at: "2025-12-08T22:48:30+0000", domain: "rezen" },
  { id: 2477, name: "reZEN - Onboarding - Process Pending Contributions V3", description: "", guid: "DS0SFMpvBbxmabvFC7qxknqVwTM", active: true, branch: "v1", tag: ["onboard", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:14:30+0000", updated_at: "2025-12-08T22:47:46+0000", domain: "rezen" },
  { id: 2478, name: "reZEN - Network - Downline Sync v2 V3", description: "", guid: "kljRktTzZ9pLWPGjqs0OWhSKId4", active: true, branch: "v1", tag: ["sync", "rezen", "frequent", "v3"], datasource: "", created_at: "2025-12-03T08:01:15+0000", updated_at: "2025-12-08T22:47:26+0000", domain: "rezen" },

  // AD Domain - Email, Uploads, Maintenance
  { id: 2399, name: "AD - Email - Network News - Daily v2 V3", description: "", guid: "S7TMTW3Nr3rEQHNMM6SZ8sxBMIT", active: true, branch: "v1", tag: ["email", "ad", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:44:57+0000", domain: "ad" },
  { id: 2400, name: "AD - Email - Network News - Weekly v2 V3", description: "", guid: "T8UNUX4Os4sFSIOMN7TZ9tyDNJU", active: true, branch: "v1", tag: ["email", "ad", "weekly", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:03+0000", domain: "ad" },
  { id: 2402, name: "AD - Missing Agent IDs Participants V3", description: "", guid: "V0WQWZ6Qu6uHUKQOO5VZ0vzFPLW", active: true, branch: "v1", tag: ["fix", "ad", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:09+0000", domain: "ad" },
  { id: 2404, name: "AD - Missing Team Roster Avatars V3", description: "", guid: "X2YSY18Sw8wJWMSOQ7XZBxBHRNY", active: true, branch: "v1", tag: ["fix", "ad", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:15+0000", domain: "ad" },
  { id: 2407, name: "AD - upload network images V3", description: "", guid: "a4bVb40Va0zMZPVRR0aZEAEKUQ1", active: true, branch: "v1", tag: ["upload", "ad", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:21+0000", domain: "ad" },
  { id: 2410, name: "AD - CSV_Insert_data_from_temp_table V3", description: "", guid: "d7eYe73Yd3CQcSYUU3dZHDHNXt4", active: true, branch: "v1", tag: ["import", "ad", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:27+0000", domain: "ad" },
  { id: 2453, name: "AD - upload team roster images V3", description: "", guid: "i7prdqA2ZeSqZs0DP7KTv5_u34g", active: true, branch: "v1", tag: ["upload", "ad", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:56+0000", updated_at: "2025-12-08T22:45:43+0000", domain: "ad" },
  { id: 3121, name: "AD - Run All Linking Functions", description: "", guid: "gh_x3DF9ELXrkoRMdm2SbCwsWFs", active: true, branch: "v1", tag: ["linking", "v3", "maintenance"], datasource: "", created_at: "2025-12-19T05:57:59+0000", updated_at: "2025-12-19T05:57:59+0000", domain: "ad" },
  { id: 3123, name: "Daily Commission Sync", description: "Syncs commission configuration from commission plans to agent_commission table daily", guid: "04ylsJq0a2jGSF74Hs4wktdgSh8", active: true, branch: "v1", tag: ["v3", "daily", "commission", "sync"], datasource: "", created_at: "2025-12-23T17:56:42+0000", updated_at: "2025-12-23T17:56:42+0000", domain: "ad" },
  { id: 3138, name: "AD - unregister all webhooks", description: "", guid: "zIN3My1GKtC24LQMqcjmjunH5Sg", active: true, branch: "v1", tag: [], datasource: "live", created_at: "2026-01-07T07:26:20+0000", updated_at: "2026-01-07T07:35:08+0000", domain: "ad" },

  // FUB Domain - Onboarding, Daily Updates, Fixes
  { id: 2406, name: "FUB - Daily Update - Calls V2 V3", description: "", guid: "Z3a0a19Uz9ANbRXSS2cZFBFLVR2", active: true, branch: "v1", tag: ["update", "fub", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:33+0000", domain: "fub" },
  { id: 2409, name: "FUB - Daily Update - Appointments V2 V3", description: "", guid: "c6d3d62Xc6zPaSWTT5fZIEINYu5", active: true, branch: "v1", tag: ["update", "fub", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:39+0000", domain: "fub" },
  { id: 2411, name: "FUB - Daily Update - Text Messages V2 V3", description: "", guid: "e8f4f84Ye8BRcUYVV7hZKGKP0w7", active: true, branch: "v1", tag: ["update", "fub", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:45+0000", domain: "fub" },
  { id: 2414, name: "FUB - Daily Update - Deals V2 V3", description: "", guid: "h1i8i8B2h1ESfXb2Y0kZNJNS3z0", active: true, branch: "v1", tag: ["update", "fub", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:51+0000", domain: "fub" },
  { id: 2416, name: "FUB - Daily Update - Events V2 V3", description: "", guid: "j3k0k0D4j3GUhZd4a2mZPLPU502", active: true, branch: "v1", tag: ["update", "fub", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:45:57+0000", domain: "fub" },
  { id: 2418, name: "FUB - Daily Update - People V2 V3", description: "", guid: "l5m2m2F6l5IWjbf6c4oZRNRW724", active: true, branch: "v1", tag: ["update", "fub", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:46:03+0000", domain: "fub" },
  { id: 2422, name: "FUB - Onboarding - People - Worker 1 V3", description: "", guid: "p9q6q6J0p9MArfj0g8sZVRV09a8", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:46:09+0000", domain: "fub" },
  { id: 2423, name: "FUB - Onboarding - Calls - Worker 1 V3", description: "", guid: "q0r7r7K1q0NBsgl1h9tZWSW10b9", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:47:45+0000", updated_at: "2025-12-08T22:46:15+0000", domain: "fub" },
  { id: 2424, name: "FUB - Onboarding - Events - Worker 1 V3", description: "", guid: "wlou1U0ooZUe8pHnrvpzRV2jcHY", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:48:09+0000", updated_at: "2025-12-08T22:48:11+0000", domain: "fub" },
  { id: 2425, name: "FUB - Onboarding - Appointments Worker V3", description: "", guid: "kUubezQvljLoXcdSoGDxwmwqxpw", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:48:13+0000", updated_at: "2025-12-08T22:46:26+0000", domain: "fub" },
  { id: 2426, name: "FUB - Onboarding - Text Messages from People V3", description: "", guid: "QYzUlSuGT0Vwcv3O1tAi1t8Ugzo", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:48:21+0000", updated_at: "2025-12-08T22:48:27+0000", domain: "fub" },
  { id: 2427, name: "FUB - Onboarding - Deals from People V3", description: "", guid: "mHMgbxtvTPIb-oT1H9S6jKEDfd0", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:48:28+0000", updated_at: "2025-12-08T22:48:05+0000", domain: "fub" },
  { id: 2428, name: "FUB - Refresh Tokens V3", description: "", guid: "XgxVS3E-ty34fYqPTq6nYTJgf5s", active: true, branch: "v1", tag: ["auth", "fub", "periodic", "v3"], datasource: "", created_at: "2025-12-03T06:48:49+0000", updated_at: "2025-12-08T22:47:28+0000", domain: "fub" },
  { id: 2429, name: "FUB - Get Users V3", description: "", guid: "FIV1c1U3EL1GMvawy6BjEbM8Zlc", active: true, branch: "v1", tag: ["sync", "fub", "few-daily", "v3"], datasource: "", created_at: "2025-12-03T06:48:57+0000", updated_at: "2025-12-08T22:47:21+0000", domain: "fub" },
  { id: 2430, name: "FUB - Get Stages V3", description: "", guid: "s3M2eNRng3_izbJ4pMSastIFQvk", active: true, branch: "v1", tag: ["sync", "fub", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:49:05+0000", updated_at: "2025-12-08T22:47:11+0000", domain: "fub" },
  { id: 2431, name: "FUB - Webhook Check V3", description: "", guid: "_rL9n6wSN5Pl4yAGGD3Csm488FQ", active: false, branch: "v1", tag: ["validate", "fub", "hourly", "v3"], datasource: "", created_at: "2025-12-03T06:49:13+0000", updated_at: "2026-01-06T07:22:25+0000", domain: "fub" },
  { id: 2432, name: "FUB - Delete Lambda Logs V3", description: "", guid: "ol5fXqfV_Bhz9B8_zmZ30LM7Qo8", active: true, branch: "v1", tag: ["cleanup", "fub", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:49:21+0000", updated_at: "2025-12-08T22:47:04+0000", domain: "fub" },
  { id: 2441, name: "FUB - process text messages from stage table V3", description: "", guid: "RhEwKWJZVjo1PiCvV9ssqcopjII", active: true, branch: "v1", tag: ["process", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:21+0000", updated_at: "2025-12-08T22:49:20+0000", domain: "fub" },
  { id: 2444, name: "FUB - Pull count records and update V3", description: "", guid: "Sge8enczqI4CYILbJIQqeZEqbcA", active: true, branch: "v1", tag: ["update", "fub", "few-daily", "v3"], datasource: "", created_at: "2025-12-03T06:54:29+0000", updated_at: "2025-12-08T22:49:26+0000", domain: "fub" },
  { id: 2447, name: "FUB - Fix People Data in events V3", description: "", guid: "8l_pxyza80XhmncHICCSzP6Poys", active: true, branch: "v1", tag: ["fix", "fub", "periodic", "v3"], datasource: "", created_at: "2025-12-03T06:54:37+0000", updated_at: "2025-12-08T22:44:15+0000", domain: "fub" },
  { id: 2449, name: "FUB - Get_appointments_missing_data V3", description: "", guid: "Jpd3aZrbrQv6VajIQm1S9mpN33Y", active: true, branch: "v1", tag: ["fix", "fub", "hourly", "v3"], datasource: "", created_at: "2025-12-03T06:54:41+0000", updated_at: "2025-12-08T22:45:56+0000", domain: "fub" },
  { id: 2451, name: "FUB - pull_events_with_people_id_0 V3", description: "", guid: "FW52QTsNDrXiaOa5npaaZYJCR7c", active: true, branch: "v1", tag: ["fix", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:49+0000", updated_at: "2025-12-08T22:49:59+0000", domain: "fub" },
  { id: 2454, name: "FUB - import_[fub_users_id] V3", description: "", guid: "NNDDWapgKQTQ8tKCZieeEsOlaWY", active: true, branch: "v1", tag: ["load", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:57+0000", updated_at: "2025-12-08T22:46:07+0000", domain: "fub" },
  { id: 2455, name: "FUB - Onboarding Jobs V3", description: "", guid: "BvBaBvlF1DV01pTiBITE1s1twx4", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:55:05+0000", updated_at: "2025-12-08T22:49:07+0000", domain: "fub" },
  { id: 2456, name: "FUB - Daily Update - Text Messages via phone V3", description: "", guid: "q5UJNsFMZ4yZBtn_URvTRj3W4gQ", active: true, branch: "v1", tag: ["update", "fub", "periodic", "v3"], datasource: "", created_at: "2025-12-03T06:55:13+0000", updated_at: "2025-12-08T22:46:54+0000", domain: "fub" },
  { id: 2457, name: "FUB - people url V3", description: "", guid: "KCnyhmaf-glkE81QLwHech_euyc", active: true, branch: "v1", tag: ["fix", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:55:19+0000", updated_at: "2025-12-08T22:49:13+0000", domain: "fub" },
  { id: 2458, name: "FUB - fix_calls_missing_record_username V3", description: "", guid: "YOH2iwZ9Bi-O82SePSXqUsNBps0", active: true, branch: "v1", tag: ["fix", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:55:27+0000", updated_at: "2025-12-08T22:44:42+0000", domain: "fub" },
  { id: 2459, name: "FUB - fix_appointments_missing_created_by V3", description: "", guid: "760Le4k8KWMDoBqNTCrTvr8CPPE", active: true, branch: "v1", tag: ["fix", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:55:35+0000", updated_at: "2025-12-08T22:44:25+0000", domain: "fub" },
  { id: 2460, name: "FUB - Pull Text Messages From Calling Number V3", description: "", guid: "ymZpByAIjOYHoDwjEvO0QECOFTs", active: true, branch: "v1", tag: ["sync", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:55:41+0000", updated_at: "2025-12-08T22:49:53+0000", domain: "fub" },
  { id: 2461, name: "FUB - Onboarding - Appointments from Users V3", description: "", guid: "GJHDkJjvG-MSwS_in6a5wFnYaus", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:10:41+0000", updated_at: "2025-12-08T22:46:17+0000", domain: "fub" },
  { id: 2462, name: "FUB - Onboarding - Calls - Worker 2 V3", description: "", guid: "tniiOZKIr7DEl3RwBGEf7nKOF2g", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:10:48+0000", updated_at: "2025-12-08T22:47:20+0000", domain: "fub" },
  { id: 2463, name: "FUB - Onboarding - Calls - Worker 3 V3", description: "", guid: "Z19KA447-8xVknMAzWz0vYOh6aY", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:10:55+0000", updated_at: "2025-12-08T22:47:27+0000", domain: "fub" },
  { id: 2464, name: "FUB - Onboarding - Calls - Worker 4 V3", description: "", guid: "30vZB8rip5xWo0u_oqUF0viOIBA", active: true, branch: "v1", tag: ["onboard", "fub", "frequent", "v3"], datasource: "", created_at: "2025-12-03T07:11:03+0000", updated_at: "2025-12-08T22:47:34+0000", domain: "fub" },
  { id: 2465, name: "FUB - Fix_people_data_in_FUB - People V3", description: "", guid: "qOhLpgthuEo417P-HgvDwqMvBIg", active: true, branch: "v1", tag: ["fix", "fub", "few-daily", "v3"], datasource: "", created_at: "2025-12-03T07:11:10+0000", updated_at: "2025-12-08T22:44:59+0000", domain: "fub" },

  // SkySlope Domain
  { id: 2436, name: "SkySlope - Transactions Sync - Worker 1 V3", description: "", guid: "ou1Txll-Ox7EZ9eQZbFW198YcA8", active: true, branch: "v1", tag: ["sync", "skyslope", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:04+0000", updated_at: "2025-12-08T22:50:42+0000", domain: "skyslope" },
  { id: 2438, name: "SkySlope - Move Transactions from Staging V3", description: "", guid: "YBJvs25v6UzZhOywwl_BLd6hp6U", active: true, branch: "v1", tag: ["move", "skyslope", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:12+0000", updated_at: "2025-12-08T22:50:05+0000", domain: "skyslope" },
  { id: 2440, name: "SkySlope - Move Listings from Staging V3", description: "", guid: "Bc6IznJmcrE8ucpbe9fL04SL9RI", active: true, branch: "v1", tag: ["move", "skyslope", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:20+0000", updated_at: "2025-12-08T22:49:57+0000", domain: "skyslope" },
  { id: 2443, name: "Skyslope - Listings Sync - Worker 1 V3", description: "", guid: "MseqbkBso7-7m557_Ua4UMJRKKU", active: true, branch: "v1", tag: ["sync", "skyslope", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:27+0000", updated_at: "2025-12-08T22:49:50+0000", domain: "skyslope" },
  { id: 2446, name: "SkySlope - Account Users Sync - Worker 1 V3", description: "", guid: "9YTN7UNmaDEBoM0x48_gXlx5-Ys", active: true, branch: "v1", tag: ["sync", "skyslope", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:54:34+0000", updated_at: "2025-12-08T22:49:44+0000", domain: "skyslope" },

  // Title Domain (Qualia)
  { id: 2450, name: "Title - Orders V3", description: "", guid: "qen94f4PNwbZ_WJm9NHIEPRyOuA", active: true, branch: "v1", tag: ["sync", "title", "daily", "v3"], datasource: "", created_at: "2025-12-03T06:54:42+0000", updated_at: "2025-12-08T22:50:55+0000", domain: "title" },
  { id: 2452, name: "Title - Get Today's Qualia Orders V3", description: "", guid: "z0Xfx76YIwsGchs33ZZZMx8zyhM", active: true, branch: "v1", tag: ["sync", "title", "few-daily", "v3"], datasource: "", created_at: "2025-12-03T06:54:50+0000", updated_at: "2025-12-08T22:50:48+0000", domain: "title" },

  // Metrics Domain
  { id: 2433, name: "Metrics - Create Snapshot V3", description: "", guid: "TCNJ1sdD3dr3HS-UmviwCzli35I", active: true, branch: "v1", tag: ["metrics", "internal", "hourly", "v3"], datasource: "", created_at: "2025-12-03T06:49:29+0000", updated_at: "2025-12-08T22:51:02+0000", domain: "metrics" },

  // Reporting Domain
  { id: 2434, name: "Reporting - Process Errors and Send to Slack V3", description: "", guid: "ImHod5YTB9AkLByTH7T8jkdf5-0", active: true, branch: "v1", tag: ["notify", "internal", "frequent", "v3"], datasource: "", created_at: "2025-12-03T06:49:38+0000", updated_at: "2025-12-08T22:51:09+0000", domain: "reporting" },

  // Aggregation Domain
  { id: 3132, name: "Aggregation - Daily Scheduler", description: "", guid: "KNHccbV3a4YX_nt8zlvInNnL9ss", active: true, branch: "v1", tag: ["aggregation", "scheduler", "v3", "daily"], datasource: "", created_at: "2025-12-25T07:50:02+0000", updated_at: "2025-12-25T07:50:18+0000", domain: "aggregation" },
  { id: 3133, name: "Aggregation - Monthly Worker", description: "Processes one pending monthly aggregation job per run", guid: "ryZseOcplqfP6JMrqEcjSlovtxI", active: true, branch: "v1", tag: ["aggregation", "worker", "v3", "monthly"], datasource: "", created_at: "2025-12-25T08:03:00+0000", updated_at: "2025-12-25T08:03:00+0000", domain: "aggregation" },
  { id: 3134, name: "Aggregation - Leaderboard Worker", description: "Calculates and updates leaderboard rankings from monthly aggregates", guid: "rPQj3zkPRgYFvNezj6Zizey8obc", active: true, branch: "v1", tag: ["aggregation", "leaderboard", "v3", "hourly"], datasource: "", created_at: "2025-12-25T08:05:51+0000", updated_at: "2025-12-25T08:05:51+0000", domain: "aggregation" },
]

/**
 * Get tasks by domain
 */
export function getTasksByDomainInventory(): Record<string, BackgroundTaskInventory[]> {
  const byDomain: Record<string, BackgroundTaskInventory[]> = {}
  for (const task of BACKGROUND_TASKS_INVENTORY) {
    if (!byDomain[task.domain]) byDomain[task.domain] = []
    byDomain[task.domain].push(task)
  }
  return byDomain
}

/**
 * Get inventory statistics
 */
export function getInventoryStats() {
  const active = BACKGROUND_TASKS_INVENTORY.filter(t => t.active).length
  const inactive = BACKGROUND_TASKS_INVENTORY.filter(t => !t.active).length
  const byDomain = getTasksByDomainInventory()

  return {
    total: BACKGROUND_TASKS_INVENTORY.length,
    active,
    inactive,
    byDomain: {
      rezen: byDomain.rezen?.length || 0,
      fub: byDomain.fub?.length || 0,
      skyslope: byDomain.skyslope?.length || 0,
      title: byDomain.title?.length || 0,
      aggregation: byDomain.aggregation?.length || 0,
      ad: byDomain.ad?.length || 0,
      reporting: byDomain.reporting?.length || 0,
      metrics: byDomain.metrics?.length || 0,
      internal: byDomain.internal?.length || 0,
    }
  }
}

/**
 * Search tasks by name
 */
export function searchInventoryTasks(query: string): BackgroundTaskInventory[] {
  const lower = query.toLowerCase()
  return BACKGROUND_TASKS_INVENTORY.filter(t =>
    t.name.toLowerCase().includes(lower) ||
    t.description.toLowerCase().includes(lower) ||
    t.tag.some(tag => tag.toLowerCase().includes(lower))
  )
}
