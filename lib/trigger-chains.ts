/**
 * Complete Trigger Chain Mapping for V2 Background Tasks
 *
 * The system has 100 background tasks:
 * - 8 SCHEDULED tasks (entry points that run on cron)
 * - 90 ACTIVE workers (triggered by other tasks or called directly)
 * - 2 INACTIVE tasks
 *
 * Pattern: Background Task → Tasks/ function → Workers/ function
 */

export interface TriggerStep {
  type: "background_task" | "task_function" | "worker_function" | "db_job" | "api_call"
  name: string
  id?: number
  description?: string
}

export interface TriggerChain {
  id: string
  name: string
  domain: "aggregation" | "fub" | "rezen" | "skyslope"
  schedule: string
  description: string
  steps: TriggerStep[]
  pattern: "job_queue" | "direct_call" | "credential_loop"
}

/**
 * The 8 Scheduled Entry Points and their complete trigger chains
 */
export const TRIGGER_CHAINS: TriggerChain[] = [
  // ============================================
  // AGGREGATION DOMAIN (3 schedulers)
  // ============================================
  {
    id: "agg-daily",
    name: "Aggregation - Daily Scheduler",
    domain: "aggregation",
    schedule: "Every 24 hours",
    description: "Creates job records for all agents, processed by Monthly Worker",
    pattern: "job_queue",
    steps: [
      {
        type: "background_task",
        name: "Aggregation - Daily Scheduler",
        id: 3132,
        description: "Scheduled BG task runs daily"
      },
      {
        type: "task_function",
        name: "Tasks/Aggregation - Daily Scheduler",
        id: 11076,
        description: "Queries all agents, creates job_status records"
      },
      {
        type: "db_job",
        name: "job_status table",
        description: "Creates PENDING jobs for MONTHLY_AGGREGATION"
      },
      {
        type: "background_task",
        name: "Aggregation - Monthly Worker",
        id: 3133,
        description: "Picks up PENDING jobs (runs every 5 min)"
      },
      {
        type: "task_function",
        name: "Tasks/Aggregation - Monthly Worker",
        id: 11080,
        description: "Processes one job: queries transactions, calculates GCI"
      },
      {
        type: "worker_function",
        name: "agg_agent_monthly table",
        description: "Writes aggregated data per agent/month"
      }
    ]
  },
  {
    id: "agg-monthly",
    name: "Aggregation - Monthly Worker",
    domain: "aggregation",
    schedule: "Every 5 minutes",
    description: "Processes pending aggregation jobs one at a time",
    pattern: "job_queue",
    steps: [
      {
        type: "background_task",
        name: "Aggregation - Monthly Worker",
        id: 3133,
        description: "Scheduled BG task runs every 5 min"
      },
      {
        type: "task_function",
        name: "Tasks/Aggregation - Monthly Worker",
        id: 11080,
        description: "Queries job_status for PENDING, processes one"
      },
      {
        type: "db_job",
        name: "Query transactions",
        description: "Gets agent's transactions for the period"
      },
      {
        type: "worker_function",
        name: "Calculate aggregates",
        description: "txn_count, txn_volume, gci_total"
      },
      {
        type: "db_job",
        name: "agg_agent_monthly",
        description: "Upserts aggregated record"
      }
    ]
  },
  {
    id: "agg-leaderboard",
    name: "Aggregation - Leaderboard Worker",
    domain: "aggregation",
    schedule: "Every 1 hour",
    description: "Rebuilds leaderboard rankings from monthly aggregates",
    pattern: "direct_call",
    steps: [
      {
        type: "background_task",
        name: "Aggregation - Leaderboard Worker",
        id: 3134,
        description: "Scheduled BG task runs hourly"
      },
      {
        type: "task_function",
        name: "Tasks/Aggregation - Leaderboard Worker",
        id: 11081,
        description: "Queries agg_agent_monthly for current period"
      },
      {
        type: "db_job",
        name: "agg_leaderboard table",
        description: "Updates rankings (gci_rank, units_rank, volume_rank)"
      }
    ]
  },

  // ============================================
  // FUB DOMAIN (4 schedulers)
  // ============================================
  {
    id: "fub-onboarding-jobs",
    name: "FUB - Onboarding Jobs",
    domain: "fub",
    schedule: "Every 1 minute",
    description: "Master orchestrator for FUB onboarding - creates sync jobs",
    pattern: "job_queue",
    steps: [
      {
        type: "background_task",
        name: "FUB - Onboarding Jobs",
        id: 2467,
        description: "Scheduled BG task runs every 1 min"
      },
      {
        type: "task_function",
        name: "Tasks/FUB - Onboarding Jobs",
        description: "Queries fub_onboarding_jobs table"
      },
      {
        type: "db_job",
        name: "fub_onboarding_jobs",
        description: "Creates jobs for users needing FUB sync"
      },
      {
        type: "worker_function",
        name: "Workers/FUB - Onboarding Orchestrator",
        description: "Coordinates the full FUB onboarding flow"
      }
    ]
  },
  {
    id: "fub-people-worker",
    name: "FUB - Onboarding People Worker 1",
    domain: "fub",
    schedule: "Every 1 minute",
    description: "Syncs FUB contacts for all users with FUB credentials",
    pattern: "credential_loop",
    steps: [
      {
        type: "background_task",
        name: "FUB - Onboarding People Worker 1",
        id: 2469,
        description: "Scheduled BG task runs every 1 min"
      },
      {
        type: "task_function",
        name: "Tasks/FUB - Onboarding People Worker 1",
        id: 7977,
        description: "Queries credentials table for FUB users"
      },
      {
        type: "db_job",
        name: "Loop: For each FUB credential",
        description: "Iterates through all active FUB credentials"
      },
      {
        type: "worker_function",
        name: "Workers/FUB - Lambda Coordinator Worker Task",
        description: "Calls FUB API to fetch people"
      },
      {
        type: "worker_function",
        name: "Workers/FUB - Get People",
        description: "Syncs people to fub_people table"
      }
    ]
  },
  {
    id: "fub-calls-worker",
    name: "FUB - Onboarding Calls Worker 1",
    domain: "fub",
    schedule: "Every 1 minute",
    description: "Syncs FUB call records",
    pattern: "credential_loop",
    steps: [
      {
        type: "background_task",
        name: "FUB - Onboarding Calls Worker 1",
        id: 2470,
        description: "Scheduled BG task runs every 1 min"
      },
      {
        type: "task_function",
        name: "Tasks/FUB - Onboarding Calls Worker 1",
        description: "Queries credentials for FUB users"
      },
      {
        type: "worker_function",
        name: "Workers/FUB - Get Calls",
        id: 8065,
        description: "Calls FUB API, syncs to fub_calls"
      },
      {
        type: "worker_function",
        name: "Workers/FUB - Get People (if needed)",
        description: "Sync order enforcement - ensures people exist first"
      }
    ]
  },
  {
    id: "fub-daily-update",
    name: "FUB - Daily Update People",
    domain: "fub",
    schedule: "Every 1 minute",
    description: "Daily sync of updated FUB contacts",
    pattern: "job_queue",
    steps: [
      {
        type: "background_task",
        name: "FUB - Daily Update People",
        id: 2468,
        description: "Scheduled BG task runs every 1 min"
      },
      {
        type: "task_function",
        name: "Tasks/FUB - Daily Update People",
        id: 7960,
        description: "Queries fub_sync_jobs for pending syncs"
      },
      {
        type: "db_job",
        name: "fub_sync_jobs table",
        description: "Jobs where peoples_status != IN_PROGRESS"
      },
      {
        type: "worker_function",
        name: "Workers/FUB - Get People",
        description: "Fetches updated people (type='Updated Today')"
      }
    ]
  },

  // ============================================
  // REZEN DOMAIN (1 scheduler)
  // ============================================
  {
    id: "rezen-onboarding",
    name: "reZEN - Onboarding Start Job",
    domain: "rezen",
    schedule: "Every 3 minutes",
    description: "Orchestrates reZEN agent onboarding",
    pattern: "job_queue",
    steps: [
      {
        type: "background_task",
        name: "reZEN - Onboarding - Start Onboarding Job V3",
        id: 2385,
        description: "Scheduled BG task runs every 3 min"
      },
      {
        type: "task_function",
        name: "Tasks/reZEN - Onboarding Start Job",
        id: 7981,
        description: "Queries rezen_onboarding_jobs for status='New'"
      },
      {
        type: "db_job",
        name: "rezen_onboarding_jobs table",
        description: "Job queue for users needing reZEN onboarding"
      },
      {
        type: "worker_function",
        name: "Workers/reZEN - Onboarding Orchestrator",
        description: "Master orchestrator for reZEN sync"
      },
      {
        type: "worker_function",
        name: "Workers/reZEN - Transactions Sync",
        id: 8052,
        description: "Syncs transactions from reZEN API"
      },
      {
        type: "worker_function",
        name: "Workers/reZEN - Network Sync",
        description: "Syncs network/downline data"
      },
      {
        type: "worker_function",
        name: "Workers/reZEN - Agent Sync",
        description: "Syncs agent profile data"
      }
    ]
  },

  // ============================================
  // SKYSLOPE DOMAIN (1 scheduler - but actually 0 active)
  // ============================================
  {
    id: "skyslope-transactions",
    name: "SkySlope - Transactions Sync Worker 1",
    domain: "skyslope",
    schedule: "Every 1 minute",
    description: "Syncs SkySlope transaction data",
    pattern: "credential_loop",
    steps: [
      {
        type: "background_task",
        name: "SkySlope - Transactions Sync Worker 1",
        id: 3123,
        description: "Scheduled BG task runs every 1 min"
      },
      {
        type: "task_function",
        name: "Tasks/SkySlope - Transactions Sync",
        description: "Queries SkySlope credentials"
      },
      {
        type: "api_call",
        name: "SkySlope API",
        description: "Fetches transactions from SkySlope"
      },
      {
        type: "worker_function",
        name: "Workers/SkySlope - Transaction Processor",
        description: "Maps and stores transaction data"
      }
    ]
  }
]

/**
 * Pattern descriptions for the UI
 */
export const PATTERN_INFO = {
  job_queue: {
    name: "Job Queue Pattern",
    description: "Scheduler creates DB records, worker picks them up one by one",
    icon: "📋",
    color: "bg-blue-100 text-blue-800"
  },
  direct_call: {
    name: "Direct Call Pattern",
    description: "Task function directly processes data without a job queue",
    icon: "⚡",
    color: "bg-green-100 text-green-800"
  },
  credential_loop: {
    name: "Credential Loop Pattern",
    description: "Iterates through all credentials and calls worker for each",
    icon: "🔄",
    color: "bg-purple-100 text-purple-800"
  }
}

/**
 * Summary stats
 */
export const CHAIN_STATS = {
  totalScheduled: 8,
  totalActive: 90,
  totalInactive: 2,
  domains: {
    aggregation: { scheduled: 3, description: "Dashboard aggregations & leaderboards" },
    fub: { scheduled: 4, description: "Follow Up Boss CRM integration" },
    rezen: { scheduled: 1, description: "Real Brokerage platform sync" },
    skyslope: { scheduled: 0, description: "Transaction management (inactive)" }
  },
  patterns: {
    job_queue: 5,
    direct_call: 1,
    credential_loop: 2
  }
}
