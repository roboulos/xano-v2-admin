// @ts-nocheck
// Task Execution Hierarchy - Organized by WHAT RUNS WHEN
// This file organizes tasks by execution order, not just domain
// Note: Type checking disabled for legacy data file

import { BACKGROUND_TASKS } from "./task-data"
import type { BackgroundTask } from "./types-v2"

// =============================================================================
// TIER 1: SCHEDULED ENTRY POINTS (4 tasks)
// These are the orchestrators that kick off workflows
// =============================================================================
export const SCHEDULED_ENTRY_POINTS = BACKGROUND_TASKS.filter(t => t.schedule !== null)

// =============================================================================
// TIER 2: ONBOARDING FLOWS
// Tasks that run when setting up a new workspace/account
// =============================================================================

// reZEN Onboarding Pipeline (runs in sequence for new accounts)
export const REZEN_ONBOARDING_FLOW = {
  name: "reZEN Onboarding Pipeline",
  description: "Complete workspace onboarding sequence for new reZEN accounts",
  phases: [
    {
      name: "1. Start",
      tasks: BACKGROUND_TASKS.filter(t =>
        t.name.includes("Start Onboarding Job")
      )
    },
    {
      name: "2. Load Data",
      tasks: BACKGROUND_TASKS.filter(t =>
        t.name.includes("Onboarding - Load") && t.domain === "rezen"
      )
    },
    {
      name: "3. Process Stage",
      tasks: BACKGROUND_TASKS.filter(t =>
        t.name.includes("Process Stage") && t.domain === "rezen"
      )
    },
    {
      name: "4. Process Data",
      tasks: BACKGROUND_TASKS.filter(t =>
        t.name.includes("Onboarding - Process") &&
        !t.name.includes("Stage") &&
        t.domain === "rezen"
      )
    },
    {
      name: "5. Finalize",
      tasks: BACKGROUND_TASKS.filter(t =>
        t.name.includes("Onboarding - Completion") ||
        t.name.includes("Onboarding - Load Contributions")
      )
    }
  ]
}

// FUB Onboarding Flow
export const FUB_ONBOARDING_FLOW = {
  name: "FUB Onboarding Pipeline",
  description: "Import data from Follow Up Boss for new accounts",
  phases: [
    {
      name: "1. Setup",
      tasks: BACKGROUND_TASKS.filter(t =>
        t.name.includes("FUB - Onboarding Jobs") ||
        t.name.includes("FUB - import")
      )
    },
    {
      name: "2. People & Calls (Continuous)",
      tasks: BACKGROUND_TASKS.filter(t =>
        (t.name.includes("Onboarding - People") || t.name.includes("Onboarding - Calls")) &&
        t.domain === "fub"
      )
    },
    {
      name: "3. Events & Appointments",
      tasks: BACKGROUND_TASKS.filter(t =>
        (t.name.includes("Onboarding - Events") || t.name.includes("Onboarding - Appointments")) &&
        t.domain === "fub"
      )
    },
    {
      name: "4. Deals & Messages",
      tasks: BACKGROUND_TASKS.filter(t =>
        (t.name.includes("Onboarding - Deals") || t.name.includes("Onboarding - Text")) &&
        t.domain === "fub"
      )
    }
  ]
}

// =============================================================================
// TIER 3: DAILY/CONTINUOUS SYNCS
// Tasks that keep data up to date
// =============================================================================

export const DAILY_SYNCS = {
  fub: BACKGROUND_TASKS.filter(t =>
    t.name.includes("Daily Update") && t.domain === "fub"
  ),
  rezen: BACKGROUND_TASKS.filter(t =>
    (t.name.includes("daily") || t.name.includes("Daily")) &&
    t.domain === "rezen" &&
    !t.name.includes("Onboarding")
  ),
  aggregation: BACKGROUND_TASKS.filter(t =>
    t.domain === "aggregation" &&
    !t.schedule // Workers, not the scheduler
  )
}

// =============================================================================
// TIER 4: CONTINUOUS SYNC WORKERS
// Tasks that run every minute to keep things in sync
// =============================================================================

export const CONTINUOUS_WORKERS = BACKGROUND_TASKS.filter(t =>
  t.schedule?.frequency === 60 // Every minute
)

// =============================================================================
// TIER 5: DATA MAINTENANCE & REPAIR
// Tasks that fix/clean data
// =============================================================================

export const DATA_MAINTENANCE = {
  fub: BACKGROUND_TASKS.filter(t =>
    (t.name.toLowerCase().includes("fix") ||
     t.name.toLowerCase().includes("missing") ||
     t.name.toLowerCase().includes("delete")) &&
    t.domain === "fub"
  ),
  rezen: BACKGROUND_TASKS.filter(t =>
    (t.name.toLowerCase().includes("missing") ||
     t.name.toLowerCase().includes("duplicate") ||
     t.name.toLowerCase().includes("monitor")) &&
    t.domain === "rezen"
  ),
  ad: BACKGROUND_TASKS.filter(t =>
    (t.name.toLowerCase().includes("missing") ||
     t.name.toLowerCase().includes("upload") ||
     t.name.toLowerCase().includes("csv")) &&
    t.domain === "ad"
  )
}

// =============================================================================
// TIER 6: UTILITY WORKERS
// Helper tasks for specific operations
// =============================================================================

export const UTILITY_WORKERS = {
  fub: BACKGROUND_TASKS.filter(t =>
    (t.name.includes("Get Users") ||
     t.name.includes("Get Stages") ||
     t.name.includes("Refresh Tokens") ||
     t.name.includes("Pull Count") ||
     t.name.includes("people url")) &&
    t.domain === "fub"
  ),
  skyslope: BACKGROUND_TASKS.filter(t =>
    t.name.includes("Move") && t.domain === "skyslope"
  ),
  email: BACKGROUND_TASKS.filter(t =>
    t.name.includes("Email") && t.domain === "ad"
  ),
  webhooks: BACKGROUND_TASKS.filter(t =>
    t.name.toLowerCase().includes("webhook")
  )
}

// =============================================================================
// TIER 7: INACTIVE/DEPRECATED
// Tasks that are turned off
// =============================================================================

export const INACTIVE_TASKS = BACKGROUND_TASKS.filter(t => !t.active)

// =============================================================================
// HIERARCHY CATEGORIES FOR UI
// =============================================================================

export interface TaskCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  tasks: BackgroundTask[]
  subcategories?: {
    name: string
    tasks: BackgroundTask[]
  }[]
}

export const TASK_HIERARCHY: TaskCategory[] = [
  {
    id: "scheduled",
    name: "⏰ Scheduled Entry Points",
    description: "Tasks that run on a schedule and kick off workflows",
    icon: "Clock",
    color: "blue",
    tasks: SCHEDULED_ENTRY_POINTS,
  },
  {
    id: "continuous",
    name: "🔄 Continuous Sync (Every Minute)",
    description: "High-frequency workers that keep data in sync",
    icon: "RefreshCw",
    color: "green",
    tasks: CONTINUOUS_WORKERS,
  },
  {
    id: "rezen-onboarding",
    name: "🚀 reZEN Onboarding",
    description: "New account setup pipeline for reZEN integration",
    icon: "Rocket",
    color: "purple",
    tasks: REZEN_ONBOARDING_FLOW.phases.flatMap(p => p.tasks),
    subcategories: REZEN_ONBOARDING_FLOW.phases.map(p => ({
      name: p.name,
      tasks: p.tasks
    }))
  },
  {
    id: "fub-onboarding",
    name: "📥 FUB Onboarding",
    description: "Import data from Follow Up Boss",
    icon: "Download",
    color: "blue",
    tasks: FUB_ONBOARDING_FLOW.phases.flatMap(p => p.tasks),
    subcategories: FUB_ONBOARDING_FLOW.phases.map(p => ({
      name: p.name,
      tasks: p.tasks
    }))
  },
  {
    id: "daily-sync",
    name: "📅 Daily Updates",
    description: "Tasks that sync incremental changes daily",
    icon: "Calendar",
    color: "orange",
    tasks: [...DAILY_SYNCS.fub, ...DAILY_SYNCS.rezen, ...DAILY_SYNCS.aggregation],
    subcategories: [
      { name: "FUB Updates", tasks: DAILY_SYNCS.fub },
      { name: "reZEN Updates", tasks: DAILY_SYNCS.rezen },
      { name: "Aggregation Workers", tasks: DAILY_SYNCS.aggregation },
    ]
  },
  {
    id: "maintenance",
    name: "🔧 Data Maintenance",
    description: "Fix and repair data issues",
    icon: "Wrench",
    color: "amber",
    tasks: [...DATA_MAINTENANCE.fub, ...DATA_MAINTENANCE.rezen, ...DATA_MAINTENANCE.ad],
    subcategories: [
      { name: "FUB Repairs", tasks: DATA_MAINTENANCE.fub },
      { name: "reZEN Repairs", tasks: DATA_MAINTENANCE.rezen },
      { name: "AD Maintenance", tasks: DATA_MAINTENANCE.ad },
    ]
  },
  {
    id: "utilities",
    name: "🛠️ Utilities",
    description: "Helper tasks for specific operations",
    icon: "Settings",
    color: "slate",
    tasks: [...UTILITY_WORKERS.fub, ...UTILITY_WORKERS.skyslope, ...UTILITY_WORKERS.email, ...UTILITY_WORKERS.webhooks],
    subcategories: [
      { name: "FUB Helpers", tasks: UTILITY_WORKERS.fub },
      { name: "SkySlope Processing", tasks: UTILITY_WORKERS.skyslope },
      { name: "Email Workers", tasks: UTILITY_WORKERS.email },
      { name: "Webhook Management", tasks: UTILITY_WORKERS.webhooks },
    ]
  },
  {
    id: "other",
    name: "📦 Other Tasks",
    description: "Tasks not in other categories",
    icon: "Package",
    color: "gray",
    tasks: [], // Will be populated with uncategorized tasks
  },
  {
    id: "inactive",
    name: "⏸️ Inactive",
    description: "Tasks that are currently disabled",
    icon: "PauseCircle",
    color: "gray",
    tasks: INACTIVE_TASKS,
  },
]

// Find uncategorized tasks
const categorizedIds = new Set(
  TASK_HIERARCHY.filter(c => c.id !== "other")
    .flatMap(c => c.tasks.map(t => t.id))
)

const uncategorized = BACKGROUND_TASKS.filter(t =>
  !categorizedIds.has(t.id) && t.active
)

// Add to "other" category
TASK_HIERARCHY.find(c => c.id === "other")!.tasks = uncategorized

// =============================================================================
// STATS
// =============================================================================

export function getHierarchyStats() {
  return {
    scheduled: SCHEDULED_ENTRY_POINTS.length,
    continuous: CONTINUOUS_WORKERS.length,
    rezenOnboarding: REZEN_ONBOARDING_FLOW.phases.flatMap(p => p.tasks).length,
    fubOnboarding: FUB_ONBOARDING_FLOW.phases.flatMap(p => p.tasks).length,
    dailySync: DAILY_SYNCS.fub.length + DAILY_SYNCS.rezen.length + DAILY_SYNCS.aggregation.length,
    maintenance: DATA_MAINTENANCE.fub.length + DATA_MAINTENANCE.rezen.length + DATA_MAINTENANCE.ad.length,
    utilities: UTILITY_WORKERS.fub.length + UTILITY_WORKERS.skyslope.length + UTILITY_WORKERS.email.length + UTILITY_WORKERS.webhooks.length,
    uncategorized: uncategorized.length,
    inactive: INACTIVE_TASKS.length,
    total: BACKGROUND_TASKS.length,
  }
}
