// Tasks/ Function Inventory for V2 Workspace (Workspace 5)
// These are Xano functions in the "Tasks/" folder that serve as orchestrators
// Background tasks call these functions to coordinate work
// Generated from task-data.ts analysis on 2026-01-16

export interface TaskFunction {
  id: number           // Xano function ID
  name: string         // Full path name (e.g., "Tasks/FUB - Daily Update People")
  shortName: string    // Display name without "Tasks/" prefix
  domain: TaskDomain   // Which integration/system this belongs to
  category: TaskCategory  // Type of task
  description: string  // What this function does
  expectedInputs: string[]  // Required input parameters
  status: "tested" | "untested" | "broken"  // Testing status
  lastTested?: string  // ISO date of last test
  notes?: string       // Additional notes
}

export type TaskDomain =
  | "fub"          // Follow Up Boss
  | "rezen"        // reZEN brokerage API
  | "skyslope"     // SkySlope transaction management
  | "aggregation"  // Data aggregation jobs
  | "title"        // Title company (Qualia)
  | "ad"           // AgentDashboards internal
  | "reporting"    // Error reporting/Slack

export type TaskCategory =
  | "onboarding"   // Initial data load for new users
  | "daily-sync"   // Daily data updates
  | "worker"       // Background worker processes
  | "scheduler"    // Job schedulers
  | "fix"          // Data repair/fix operations
  | "webhook"      // Webhook processing
  | "utility"      // General utilities

// Helper to derive domain from function name
function deriveDomain(name: string): TaskDomain {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("fub")) return "fub"
  if (lowerName.includes("rezen")) return "rezen"
  if (lowerName.includes("skyslope")) return "skyslope"
  if (lowerName.includes("aggregation") || lowerName.includes("leaderboard")) return "aggregation"
  if (lowerName.includes("title") || lowerName.includes("qualia")) return "title"
  if (lowerName.includes("reporting") || lowerName.includes("slack")) return "reporting"
  return "ad"
}

// Helper to derive category from function name
function deriveCategory(name: string): TaskCategory {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("onboarding") || lowerName.includes("load")) return "onboarding"
  if (lowerName.includes("daily")) return "daily-sync"
  if (lowerName.includes("worker")) return "worker"
  if (lowerName.includes("scheduler")) return "scheduler"
  if (lowerName.includes("fix") || lowerName.includes("missing") || lowerName.includes("repair")) return "fix"
  if (lowerName.includes("webhook")) return "webhook"
  return "utility"
}

// Helper to generate description from function name
function generateDescription(name: string): string {
  const shortName = name.replace("Tasks/", "")

  // FUB descriptions
  if (name.includes("FUB - Daily Update")) {
    const dataType = shortName.replace("FUB - Daily Update ", "")
    return `Sync ${dataType.toLowerCase()} data from FUB API for all active accounts`
  }
  if (name.includes("FUB - Onboarding")) {
    const part = shortName.replace("FUB - Onboarding ", "")
    return `Process FUB ${part.toLowerCase()} during user onboarding`
  }
  if (name.includes("FUB - Fix")) {
    return `Data repair: ${shortName.replace("FUB - ", "").toLowerCase()}`
  }

  // reZEN descriptions
  if (name.includes("reZEN - Onboarding")) {
    const action = shortName.replace("reZEN - Onboarding ", "")
    return `Onboarding step: ${action.toLowerCase()}`
  }
  if (name.includes("reZEN - Network")) {
    return `Network data sync: ${shortName.replace("reZEN - Network ", "").toLowerCase()}`
  }
  if (name.includes("reZEN - Transactions")) {
    return `Process transaction sync for reZEN data`
  }

  // SkySlope descriptions
  if (name.includes("SkySlope")) {
    return `SkySlope integration: ${shortName.replace("SkySlope - ", "").toLowerCase()}`
  }

  // Aggregation descriptions
  if (name.includes("Aggregation")) {
    return `Aggregation job: ${shortName.replace("Aggregation - ", "").toLowerCase()}`
  }

  // Title descriptions
  if (name.includes("Title")) {
    return `Title company integration: ${shortName.replace("Title - ", "").toLowerCase()}`
  }

  // Default
  return `${shortName}`
}

// Complete list of Tasks/ functions from V2 Workspace
// IDs are placeholder values - use Xano MCP to get actual IDs
export const TASKS_FUNCTIONS: TaskFunction[] = [
  // ============================================================================
  // AGGREGATION DOMAIN (3 functions)
  // ============================================================================
  {
    id: 8100,
    name: "Tasks/Aggregation - Daily Scheduler",
    shortName: "Aggregation - Daily Scheduler",
    domain: "aggregation",
    category: "scheduler",
    description: "Schedule daily aggregation jobs across all tables",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8101,
    name: "Tasks/Aggregation - Leaderboard Worker",
    shortName: "Aggregation - Leaderboard Worker",
    domain: "aggregation",
    category: "worker",
    description: "Process leaderboard calculations for team rankings",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8102,
    name: "Tasks/Aggregation - Monthly Worker",
    shortName: "Aggregation - Monthly Worker",
    domain: "aggregation",
    category: "worker",
    description: "Process monthly aggregation calculations",
    expectedInputs: [],
    status: "untested",
  },

  // ============================================================================
  // FUB - FOLLOW UP BOSS DOMAIN (27 functions)
  // ============================================================================
  // Daily Update Functions
  {
    id: 8110,
    name: "Tasks/FUB - Daily Update Appointments",
    shortName: "FUB - Daily Update Appointments",
    domain: "fub",
    category: "daily-sync",
    description: "Sync appointment data from FUB API for all active accounts",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8111,
    name: "Tasks/FUB - Daily Update Calls",
    shortName: "FUB - Daily Update Calls",
    domain: "fub",
    category: "daily-sync",
    description: "Sync call data from FUB API for all active accounts",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8112,
    name: "Tasks/FUB - Daily Update Deals",
    shortName: "FUB - Daily Update Deals",
    domain: "fub",
    category: "daily-sync",
    description: "Sync deal data from FUB API for all active accounts",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8113,
    name: "Tasks/FUB - Daily Update Events",
    shortName: "FUB - Daily Update Events",
    domain: "fub",
    category: "daily-sync",
    description: "Sync event data from FUB API for all active accounts",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8114,
    name: "Tasks/FUB - Daily Update People",
    shortName: "FUB - Daily Update People",
    domain: "fub",
    category: "daily-sync",
    description: "Sync people/contact data from FUB API for all active accounts",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8115,
    name: "Tasks/FUB - Daily Update Text Messages",
    shortName: "FUB - Daily Update Text Messages",
    domain: "fub",
    category: "daily-sync",
    description: "Sync text message data from FUB API for all active accounts",
    expectedInputs: [],
    status: "untested",
  },
  // Fix Functions
  {
    id: 8120,
    name: "Tasks/FUB - Fix Calls Missing Username",
    shortName: "FUB - Fix Calls Missing Username",
    domain: "fub",
    category: "fix",
    description: "Data repair: fix calls missing record username",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8121,
    name: "Tasks/FUB - Fix People Data",
    shortName: "FUB - Fix People Data",
    domain: "fub",
    category: "fix",
    description: "Data repair: fix people data in FUB records",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8122,
    name: "Tasks/FUB - Get Appointments Missing Data",
    shortName: "FUB - Get Appointments Missing Data",
    domain: "fub",
    category: "fix",
    description: "Fetch missing appointment data from FUB API",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8123,
    name: "Tasks/FUB - Import FUB Users",
    shortName: "FUB - Import FUB Users",
    domain: "fub",
    category: "utility",
    description: "Import FUB users from account",
    expectedInputs: ["fub_users_id"],
    status: "untested",
  },
  // Onboarding Functions
  {
    id: 8130,
    name: "Tasks/FUB - Onboarding Appointments",
    shortName: "FUB - Onboarding Appointments",
    domain: "fub",
    category: "onboarding",
    description: "Process FUB appointments from users during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8131,
    name: "Tasks/FUB - Onboarding Appointments Worker",
    shortName: "FUB - Onboarding Appointments Worker",
    domain: "fub",
    category: "worker",
    description: "Worker process for FUB appointment onboarding",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8132,
    name: "Tasks/FUB - Onboarding Calls Worker 1",
    shortName: "FUB - Onboarding Calls Worker 1",
    domain: "fub",
    category: "worker",
    description: "Worker 1 for processing FUB calls during onboarding",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8133,
    name: "Tasks/FUB - Onboarding Calls Worker 2",
    shortName: "FUB - Onboarding Calls Worker 2",
    domain: "fub",
    category: "worker",
    description: "Worker 2 for processing FUB calls during onboarding",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8134,
    name: "Tasks/FUB - Onboarding Calls Worker 3",
    shortName: "FUB - Onboarding Calls Worker 3",
    domain: "fub",
    category: "worker",
    description: "Worker 3 for processing FUB calls during onboarding",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8135,
    name: "Tasks/FUB - Onboarding Calls Worker 4",
    shortName: "FUB - Onboarding Calls Worker 4",
    domain: "fub",
    category: "worker",
    description: "Worker 4 for processing FUB calls during onboarding",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8136,
    name: "Tasks/FUB - Onboarding Events Worker 1",
    shortName: "FUB - Onboarding Events Worker 1",
    domain: "fub",
    category: "worker",
    description: "Worker for processing FUB events during onboarding",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8137,
    name: "Tasks/FUB - Onboarding Jobs",
    shortName: "FUB - Onboarding Jobs",
    domain: "fub",
    category: "scheduler",
    description: "Scheduler for FUB onboarding job queue",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8138,
    name: "Tasks/FUB - Onboarding People Worker 1",
    shortName: "FUB - Onboarding People Worker 1",
    domain: "fub",
    category: "worker",
    description: "Worker for processing FUB people during onboarding",
    expectedInputs: [],
    status: "untested",
  },
  // Utility Functions
  {
    id: 8140,
    name: "Tasks/FUB - Pull Count Records",
    shortName: "FUB - Pull Count Records",
    domain: "fub",
    category: "utility",
    description: "Pull count records from FUB and update",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8141,
    name: "Tasks/FUB - Pull Events People ID 0",
    shortName: "FUB - Pull Events People ID 0",
    domain: "fub",
    category: "fix",
    description: "Pull events with people_id 0 for repair",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8142,
    name: "Tasks/FUB - Pull Text Messages Calling Number",
    shortName: "FUB - Pull Text Messages Calling Number",
    domain: "fub",
    category: "utility",
    description: "Pull text messages by calling number",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8143,
    name: "Tasks/FUB - Webhook Check",
    shortName: "FUB - Webhook Check",
    domain: "fub",
    category: "webhook",
    description: "Check FUB webhook status and registration",
    expectedInputs: [],
    status: "untested",
  },

  // ============================================================================
  // REZEN DOMAIN (44 functions)
  // ============================================================================
  // Contributions
  {
    id: 8200,
    name: "Tasks/rezen - Contributions Daily Update",
    shortName: "rezen - Contributions Daily Update",
    domain: "rezen",
    category: "daily-sync",
    description: "Daily processing of contribution records",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8201,
    name: "Tasks/reZEN - Contributions Full Update",
    shortName: "reZEN - Contributions Full Update",
    domain: "rezen",
    category: "utility",
    description: "Full update of all contribution records",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8202,
    name: "Tasks/reZEN - Daily Load Pending Contributions",
    shortName: "reZEN - Daily Load Pending Contributions",
    domain: "rezen",
    category: "daily-sync",
    description: "Load pending contributions from reZEN API daily",
    expectedInputs: [],
    status: "untested",
  },
  // Monitoring
  {
    id: 8210,
    name: "Tasks/reZEN - Monitor Sync Locks",
    shortName: "reZEN - Monitor Sync Locks",
    domain: "rezen",
    category: "utility",
    description: "Monitor sync locks and recover stuck processes",
    expectedInputs: [],
    status: "untested",
  },
  // Network Functions
  {
    id: 8220,
    name: "Tasks/reZEN - Network Downline Sync",
    shortName: "reZEN - Network Downline Sync",
    domain: "rezen",
    category: "utility",
    description: "Sync network downline data from reZEN API",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8221,
    name: "Tasks/reZEN - Network Frontline Brad",
    shortName: "reZEN - Network Frontline Brad",
    domain: "rezen",
    category: "worker",
    description: "Process network frontline for Brad's hierarchy",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8222,
    name: "Tasks/reZEN - Network Frontline Tim",
    shortName: "reZEN - Network Frontline Tim",
    domain: "rezen",
    category: "worker",
    description: "Process network frontline for Tim's hierarchy",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8223,
    name: "Tasks/reZEN - Network Missing Cap Data",
    shortName: "reZEN - Network Missing Cap Data",
    domain: "rezen",
    category: "fix",
    description: "Find and fix network records with missing cap data",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8224,
    name: "Tasks/reZEN - Network Missing Frontline",
    shortName: "reZEN - Network Missing Frontline",
    domain: "rezen",
    category: "fix",
    description: "Find and fix network records with missing frontline data",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8225,
    name: "Tasks/rezen - Network Name Sync",
    shortName: "rezen - Network Name Sync",
    domain: "rezen",
    category: "utility",
    description: "Sync network names from reZEN",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8226,
    name: "Tasks/reZEN - Network Update Frontline Brad",
    shortName: "reZEN - Network Update Frontline Brad",
    domain: "rezen",
    category: "worker",
    description: "Async update of frontline data for Brad's hierarchy",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8227,
    name: "Tasks/reZEN - Network Update Frontline Tim",
    shortName: "reZEN - Network Update Frontline Tim",
    domain: "rezen",
    category: "worker",
    description: "Async update of frontline data for Tim's hierarchy",
    expectedInputs: [],
    status: "untested",
  },
  // Onboarding Functions
  {
    id: 8230,
    name: "Tasks/reZEN - Onboarding Completion",
    shortName: "reZEN - Onboarding Completion",
    domain: "rezen",
    category: "onboarding",
    description: "Complete the onboarding process for a user",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8231,
    name: "Tasks/reZEN - Onboarding Load Contributions",
    shortName: "reZEN - Onboarding Load Contributions",
    domain: "rezen",
    category: "onboarding",
    description: "Load contributions during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8232,
    name: "Tasks/reZEN - Onboarding Load Listings",
    shortName: "reZEN - Onboarding Load Listings",
    domain: "rezen",
    category: "onboarding",
    description: "Load listings during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8233,
    name: "Tasks/reZEN - Onboarding Load Network Downline",
    shortName: "reZEN - Onboarding Load Network Downline",
    domain: "rezen",
    category: "onboarding",
    description: "Load network downline during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8234,
    name: "Tasks/reZEN - Onboarding Load Transactions",
    shortName: "reZEN - Onboarding Load Transactions",
    domain: "rezen",
    category: "onboarding",
    description: "Load transactions during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8235,
    name: "Tasks/reZEN - Onboarding Process Cap Data",
    shortName: "reZEN - Onboarding Process Cap Data",
    domain: "rezen",
    category: "onboarding",
    description: "Process cap data during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8236,
    name: "Tasks/reZEN - Onboarding Process Contributions",
    shortName: "reZEN - Onboarding Process Contributions",
    domain: "rezen",
    category: "onboarding",
    description: "Process contributions during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8237,
    name: "Tasks/reZEN - Onboarding Process Contributors",
    shortName: "reZEN - Onboarding Process Contributors",
    domain: "rezen",
    category: "onboarding",
    description: "Process contributors during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8238,
    name: "Tasks/reZEN - Onboarding Process Equity",
    shortName: "reZEN - Onboarding Process Equity",
    domain: "rezen",
    category: "onboarding",
    description: "Process equity data during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8239,
    name: "Tasks/reZEN - Onboarding Process Listings",
    shortName: "reZEN - Onboarding Process Listings",
    domain: "rezen",
    category: "onboarding",
    description: "Process listings during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8240,
    name: "Tasks/reZEN - Onboarding Process Network Downline",
    shortName: "reZEN - Onboarding Process Network Downline",
    domain: "rezen",
    category: "onboarding",
    description: "Process network downline during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8241,
    name: "Tasks/reZEN - Onboarding Process Network Frontline",
    shortName: "reZEN - Onboarding Process Network Frontline",
    domain: "rezen",
    category: "onboarding",
    description: "Process network frontline during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8242,
    name: "Tasks/reZEN - Onboarding Process Pending Contributions",
    shortName: "reZEN - Onboarding Process Pending Contributions",
    domain: "rezen",
    category: "onboarding",
    description: "Process pending contributions during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8243,
    name: "Tasks/reZEN - Onboarding Process RevShare Totals",
    shortName: "reZEN - Onboarding Process RevShare Totals",
    domain: "rezen",
    category: "onboarding",
    description: "Process pending revshare totals during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8244,
    name: "Tasks/reZEN - Onboarding Process Sponsor Tree",
    shortName: "reZEN - Onboarding Process Sponsor Tree",
    domain: "rezen",
    category: "onboarding",
    description: "Process agent sponsor tree during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8245,
    name: "Tasks/reZEN - Onboarding Process Stage Contributions",
    shortName: "reZEN - Onboarding Process Stage Contributions",
    domain: "rezen",
    category: "onboarding",
    description: "Process staged contributions during onboarding",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8246,
    name: "Tasks/reZEN - Onboarding Process Stage Listings",
    shortName: "reZEN - Onboarding Process Stage Listings",
    domain: "rezen",
    category: "onboarding",
    description: "Process staged listings during onboarding",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8247,
    name: "Tasks/reZEN - Onboarding Process Stage Transactions Large",
    shortName: "reZEN - Onboarding Process Stage Transactions Large",
    domain: "rezen",
    category: "onboarding",
    description: "Process large staged transaction sets during onboarding",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8248,
    name: "Tasks/reZEN - Onboarding Process Stage Transactions Small",
    shortName: "reZEN - Onboarding Process Stage Transactions Small",
    domain: "rezen",
    category: "onboarding",
    description: "Process small staged transaction sets during onboarding",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8249,
    name: "Tasks/reZEN - Onboarding Process Transactions",
    shortName: "reZEN - Onboarding Process Transactions",
    domain: "rezen",
    category: "onboarding",
    description: "Process transactions during onboarding",
    expectedInputs: ["user_id"],
    status: "untested",
  },
  {
    id: 8250,
    name: "Tasks/reZEN - Onboarding Start Job",
    shortName: "reZEN - Onboarding Start Job",
    domain: "rezen",
    category: "scheduler",
    description: "Start onboarding job from scheduler",
    expectedInputs: [],
    status: "untested",
  },
  // Paid Participant Functions
  {
    id: 8260,
    name: "Tasks/reZEN - Paid Participant Incomplete Mapping",
    shortName: "reZEN - Paid Participant Incomplete Mapping",
    domain: "rezen",
    category: "fix",
    description: "Find and fix paid participants with incomplete mapping",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8261,
    name: "Tasks/reZEN - Paid Participant Missing Addresses",
    shortName: "reZEN - Paid Participant Missing Addresses",
    domain: "rezen",
    category: "fix",
    description: "Find and fix paid participants with missing addresses",
    expectedInputs: [],
    status: "untested",
  },
  // Process Functions
  {
    id: 8270,
    name: "Tasks/reZEN - Process Pending Contributions",
    shortName: "reZEN - Process Pending Contributions",
    domain: "rezen",
    category: "utility",
    description: "Process pending contributions queue",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8271,
    name: "Tasks/reZEN - Process Webhooks",
    shortName: "reZEN - Process Webhooks",
    domain: "rezen",
    category: "webhook",
    description: "Process reZEN webhooks and delete processed records",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8272,
    name: "Tasks/reZEN - Remove Duplicates",
    shortName: "reZEN - Remove Duplicates",
    domain: "rezen",
    category: "fix",
    description: "Remove duplicate network and contribution records",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8273,
    name: "Tasks/reZEN - RevShare Totals",
    shortName: "reZEN - RevShare Totals",
    domain: "rezen",
    category: "utility",
    description: "Calculate and update revshare totals",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8274,
    name: "Tasks/reZEN - Team Roster Caps and Splits",
    shortName: "reZEN - Team Roster Caps and Splits",
    domain: "rezen",
    category: "utility",
    description: "Update team roster caps and splits data",
    expectedInputs: [],
    status: "untested",
  },
  // Transaction Workers
  {
    id: 8280,
    name: "Tasks/reZEN - Transactions Sync Worker 1",
    shortName: "reZEN - Transactions Sync Worker 1",
    domain: "rezen",
    category: "worker",
    description: "Worker 1 for transaction sync processing",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8281,
    name: "Tasks/reZEN - Transactions Sync Worker 2",
    shortName: "reZEN - Transactions Sync Worker 2",
    domain: "rezen",
    category: "worker",
    description: "Worker 2 for transaction sync processing",
    expectedInputs: [],
    status: "untested",
  },
  // Webhook
  {
    id: 8290,
    name: "Tasks/rezen - Webhooks Register",
    shortName: "rezen - Webhooks Register",
    domain: "rezen",
    category: "webhook",
    description: "Register and check reZEN webhook status",
    expectedInputs: [],
    status: "untested",
  },

  // ============================================================================
  // SKYSLOPE DOMAIN (3 functions)
  // ============================================================================
  {
    id: 8300,
    name: "Tasks/SkySlope - Account Users Sync Worker 1",
    shortName: "SkySlope - Account Users Sync Worker 1",
    domain: "skyslope",
    category: "worker",
    description: "Worker for syncing SkySlope account users",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8301,
    name: "Tasks/SkySlope - Listings Sync Worker 1",
    shortName: "SkySlope - Listings Sync Worker 1",
    domain: "skyslope",
    category: "worker",
    description: "Worker for syncing SkySlope listings",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8302,
    name: "Tasks/SkySlope - Transactions Sync Worker 1",
    shortName: "SkySlope - Transactions Sync Worker 1",
    domain: "skyslope",
    category: "worker",
    description: "Worker for syncing SkySlope transactions",
    expectedInputs: [],
    status: "untested",
  },

  // ============================================================================
  // TITLE DOMAIN (2 functions)
  // ============================================================================
  {
    id: 8400,
    name: "Tasks/Title - Get Todays Qualia Orders",
    shortName: "Title - Get Todays Qualia Orders",
    domain: "title",
    category: "daily-sync",
    description: "Fetch today's Qualia title orders",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8401,
    name: "Tasks/Title - Orders",
    shortName: "Title - Orders",
    domain: "title",
    category: "utility",
    description: "Process title orders",
    expectedInputs: [],
    status: "untested",
  },

  // ============================================================================
  // AD - AGENTDASHBOARDS DOMAIN (2 functions)
  // ============================================================================
  {
    id: 8500,
    name: "Tasks/AD - Email Network News Daily - Worker",
    shortName: "AD - Email Network News Daily - Worker",
    domain: "ad",
    category: "worker",
    description: "Send daily network news emails",
    expectedInputs: [],
    status: "untested",
  },
  {
    id: 8501,
    name: "Tasks/AD - Email Network News Weekly",
    shortName: "AD - Email Network News Weekly",
    domain: "ad",
    category: "worker",
    description: "Send weekly network news emails",
    expectedInputs: [],
    status: "untested",
  },

  // ============================================================================
  // REPORTING DOMAIN (1 function)
  // ============================================================================
  {
    id: 8600,
    name: "Tasks/Reporting - Process Errors Slack",
    shortName: "Reporting - Process Errors Slack",
    domain: "reporting",
    category: "utility",
    description: "Process errors and send to Slack for monitoring",
    expectedInputs: [],
    status: "untested",
  },
]

// Get all tasks functions
export function getAllTasksFunctions(): TaskFunction[] {
  return TASKS_FUNCTIONS
}

// Get tasks by domain
export function getTasksFunctionsByDomain(domain: TaskDomain): TaskFunction[] {
  return TASKS_FUNCTIONS.filter(f => f.domain === domain)
}

// Get tasks by category
export function getTasksFunctionsByCategory(category: TaskCategory): TaskFunction[] {
  return TASKS_FUNCTIONS.filter(f => f.category === category)
}

// Get tasks that require user_id
export function getTasksRequiringUserId(): TaskFunction[] {
  return TASKS_FUNCTIONS.filter(f => f.expectedInputs.includes("user_id"))
}

// Get statistics
export function getTasksFunctionsStats() {
  const byDomain: Record<TaskDomain, number> = {
    fub: 0,
    rezen: 0,
    skyslope: 0,
    aggregation: 0,
    title: 0,
    ad: 0,
    reporting: 0,
  }

  const byCategory: Record<TaskCategory, number> = {
    onboarding: 0,
    "daily-sync": 0,
    worker: 0,
    scheduler: 0,
    fix: 0,
    webhook: 0,
    utility: 0,
  }

  const byStatus: Record<string, number> = {
    tested: 0,
    untested: 0,
    broken: 0,
  }

  for (const fn of TASKS_FUNCTIONS) {
    byDomain[fn.domain]++
    byCategory[fn.category]++
    byStatus[fn.status]++
  }

  return {
    total: TASKS_FUNCTIONS.length,
    byDomain,
    byCategory,
    byStatus,
    requiresUserId: getTasksRequiringUserId().length,
  }
}

// Domain display configuration
export const DOMAIN_CONFIG: Record<TaskDomain, { name: string; color: string; icon: string }> = {
  fub: { name: "Follow Up Boss", color: "blue", icon: "Phone" },
  rezen: { name: "reZEN", color: "green", icon: "Building" },
  skyslope: { name: "SkySlope", color: "purple", icon: "FileText" },
  aggregation: { name: "Aggregation", color: "orange", icon: "BarChart" },
  title: { name: "Title/Qualia", color: "yellow", icon: "FileCheck" },
  ad: { name: "AgentDashboards", color: "slate", icon: "Settings" },
  reporting: { name: "Reporting", color: "red", icon: "AlertCircle" },
}

// Category display configuration
export const CATEGORY_CONFIG: Record<TaskCategory, { name: string; color: string }> = {
  onboarding: { name: "Onboarding", color: "emerald" },
  "daily-sync": { name: "Daily Sync", color: "blue" },
  worker: { name: "Worker", color: "violet" },
  scheduler: { name: "Scheduler", color: "amber" },
  fix: { name: "Fix/Repair", color: "rose" },
  webhook: { name: "Webhook", color: "cyan" },
  utility: { name: "Utility", color: "gray" },
}
