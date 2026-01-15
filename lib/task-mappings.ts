// Background Task Mappings for V1 → V2 Migration Orchestrator
// Maps V1 tasks (125) to V2 tasks (200)
// Organized by category and schedule frequency

import type { TaskMapping, TaskCategory, MappingType } from "@/types/mappings"

// ═══════════════════════════════════════════════════════════════
// BACKGROUND TASK MAPPINGS - Organized by Category
// ═══════════════════════════════════════════════════════════════

export const TASK_MAPPINGS: TaskMapping[] = [
  // ═══════════════════════════════════════════════════════════════
  // SYNC TASKS - Data synchronization from external sources
  // ═══════════════════════════════════════════════════════════════

  // FUB Sync Tasks
  { v1_task: "fub_daily_sync", v1_id: 3001, v2_tasks: ["fub_daily_sync_orchestrator"], v2_ids: [4001], type: "renamed", notes: "Daily FUB data synchronization", schedule: "0 2 * * *", category: "fub" },
  { v1_task: "fub_hourly_sync", v1_id: 3002, v2_tasks: ["fub_incremental_sync"], v2_ids: [4002], type: "renamed", notes: "Hourly FUB incremental sync", schedule: "0 * * * *", category: "fub" },
  { v1_task: "fub_onboarding_processor", v1_id: 3003, v2_tasks: ["fub_onboarding_queue_processor"], v2_ids: [4003], type: "renamed", notes: "Process FUB onboarding jobs", schedule: "*/5 * * * *", category: "fub" },
  { v1_task: "fub_sync_job_processor", v1_id: 3004, v2_tasks: ["fub_sync_queue_processor"], v2_ids: [4004], type: "renamed", notes: "Process FUB sync job queue", schedule: "*/5 * * * *", category: "fub" },
  { v1_task: "v2_process_fub_aggregation_queue", v1_id: 3137, v2_tasks: ["fub_aggregation_queue_processor"], v2_ids: [4005], type: "renamed", notes: "Process FUB aggregation queue", schedule: "*/5 * * * *", category: "fub" },

  // Rezen Sync Tasks
  { v1_task: "rezen_daily_sync", v1_id: 3010, v2_tasks: ["rezen_daily_sync_orchestrator"], v2_ids: [4010], type: "renamed", notes: "Daily Rezen data synchronization", schedule: "0 3 * * *", category: "rezen" },
  { v1_task: "rezen_hourly_sync", v1_id: 3011, v2_tasks: ["rezen_incremental_sync"], v2_ids: [4011], type: "renamed", notes: "Hourly Rezen incremental sync", schedule: "30 * * * *", category: "rezen" },
  { v1_task: "rezen_onboarding_processor", v1_id: 3012, v2_tasks: ["rezen_onboarding_queue_processor"], v2_ids: [4012], type: "renamed", notes: "Process Rezen onboarding jobs", schedule: "*/5 * * * *", category: "rezen" },
  { v1_task: "rezen_webhook_processor", v1_id: 3013, v2_tasks: ["rezen_webhook_queue_processor"], v2_ids: [4013], type: "renamed", notes: "Process Rezen webhook queue", schedule: "*/2 * * * *", category: "rezen" },
  { v1_task: "rezen - webhooks - unregister deleted accounts", v1_id: 3136, v2_tasks: ["rezen_webhook_cleanup"], v2_ids: [4014], type: "renamed", notes: "Clean up deleted account webhooks", schedule: "0 4 * * *", category: "rezen" },

  // General Sync Tasks
  { v1_task: "sync_transaction_owners_to_roster", v1_id: 3139, v2_tasks: ["sync_transaction_owners_roster"], v2_ids: [4020], type: "renamed", notes: "Sync transaction owners to team roster", schedule: "0 5 * * *", category: "sync" },
  { v1_task: "skyslope_daily_sync", v1_id: 3020, v2_tasks: ["skyslope_daily_sync"], v2_ids: [4021], type: "direct", notes: "Daily SkySlope sync", schedule: "0 4 * * *", category: "sync" },
  { v1_task: "dotloop_daily_sync", v1_id: 3021, v2_tasks: ["dotloop_daily_sync"], v2_ids: [4022], type: "direct", notes: "Daily DotLoop sync", schedule: "0 4 * * *", category: "sync" },
  { v1_task: "lofty_daily_sync", v1_id: 3022, v2_tasks: ["lofty_daily_sync"], v2_ids: [4023], type: "direct", notes: "Daily Lofty sync", schedule: "0 4 * * *", category: "sync" },
  { v1_task: "stripe_webhook_processor", v1_id: 3023, v2_tasks: ["stripe_webhook_queue_processor"], v2_ids: [4024], type: "renamed", notes: "Process Stripe webhook events", schedule: "*/2 * * * *", category: "sync" },

  // Sierra Sync Tasks (New)
  { v1_task: "sierra_sync_fetch", v1_id: 3140, v2_tasks: [], v2_ids: [], type: "new", notes: "Fetch Sierra leads - new integration", schedule: "0 * * * *", category: "sync" },
  { v1_task: "sierra_sync_process", v1_id: 3141, v2_tasks: [], v2_ids: [], type: "new", notes: "Process Sierra staging - new integration", schedule: "15 * * * *", category: "sync" },

  // ═══════════════════════════════════════════════════════════════
  // AGGREGATION TASKS - Pre-compute dashboard data
  // ═══════════════════════════════════════════════════════════════

  { v1_task: "daily_aggregation_refresh", v1_id: 3100, v2_tasks: ["daily_aggregation_orchestrator"], v2_ids: [4100], type: "renamed", notes: "Daily full aggregation refresh", schedule: "0 6 * * *", category: "aggregation" },
  { v1_task: "hourly_aggregation_update", v1_id: 3101, v2_tasks: ["hourly_aggregation_incremental"], v2_ids: [4101], type: "renamed", notes: "Hourly incremental aggregation", schedule: "0 * * * *", category: "aggregation" },
  { v1_task: "v2_process_aggregation_queue", v1_id: 3129, v2_tasks: ["aggregation_queue_processor"], v2_ids: [4102], type: "renamed", notes: "Process aggregation job queue", schedule: "* * * * *", category: "aggregation" },
  { v1_task: "process_leaderboard_queue", v1_id: 3130, v2_tasks: ["leaderboard_queue_processor"], v2_ids: [4103], type: "renamed", notes: "Process leaderboard aggregation queue", schedule: "* * * * *", category: "aggregation" },
  { v1_task: "four_hourly_init_leaderboard_jobs", v1_id: 3131, v2_tasks: ["leaderboard_job_initializer"], v2_ids: [4104], type: "renamed", notes: "Initialize missing leaderboard jobs", schedule: "0 */4 * * *", category: "aggregation" },
  { v1_task: "transaction_aggregation", v1_id: 3102, v2_tasks: ["transaction_aggregation_job"], v2_ids: [4105], type: "renamed", notes: "Transaction-specific aggregations", schedule: "0 7 * * *", category: "aggregation" },
  { v1_task: "listing_aggregation", v1_id: 3103, v2_tasks: ["listing_aggregation_job"], v2_ids: [4106], type: "renamed", notes: "Listing-specific aggregations", schedule: "0 7 * * *", category: "aggregation" },
  { v1_task: "revenue_aggregation", v1_id: 3104, v2_tasks: ["revenue_aggregation_job"], v2_ids: [4107], type: "renamed", notes: "Revenue-specific aggregations", schedule: "0 7 * * *", category: "aggregation" },
  { v1_task: "network_aggregation", v1_id: 3105, v2_tasks: ["network_aggregation_job"], v2_ids: [4108], type: "renamed", notes: "Network-specific aggregations", schedule: "0 7 * * *", category: "aggregation" },

  // ═══════════════════════════════════════════════════════════════
  // HEALTH CHECK TASKS - Monitor system health
  // ═══════════════════════════════════════════════════════════════

  { v1_task: "six_hourly_chart_health_check", v1_id: 3135, v2_tasks: ["chart_health_monitor"], v2_ids: [4200], type: "renamed", notes: "Monitor chart rendering health", schedule: "0 */6 * * *", category: "health" },
  { v1_task: "hourly_sync_health_check", v1_id: 3200, v2_tasks: ["sync_health_monitor"], v2_ids: [4201], type: "renamed", notes: "Monitor sync system health", schedule: "0 * * * *", category: "health" },
  { v1_task: "daily_data_integrity_check", v1_id: 3201, v2_tasks: ["data_integrity_validator"], v2_ids: [4202], type: "renamed", notes: "Validate data integrity", schedule: "0 5 * * *", category: "health" },
  { v1_task: "aggregation_freshness_check", v1_id: 3202, v2_tasks: ["aggregation_freshness_monitor"], v2_ids: [4203], type: "renamed", notes: "Check aggregation data freshness", schedule: "0 */2 * * *", category: "health" },
  { v1_task: "webhook_health_monitor", v1_id: 3203, v2_tasks: ["webhook_health_checker"], v2_ids: [4204], type: "renamed", notes: "Monitor webhook processing health", schedule: "*/30 * * * *", category: "health" },
  { v1_task: "database_connection_check", v1_id: 3204, v2_tasks: ["database_health_monitor"], v2_ids: [4205], type: "renamed", notes: "Monitor database connections", schedule: "*/15 * * * *", category: "health" },

  // ═══════════════════════════════════════════════════════════════
  // CLEANUP TASKS - Remove old/obsolete data
  // ═══════════════════════════════════════════════════════════════

  { v1_task: "daily_log_cleanup", v1_id: 3300, v2_tasks: ["log_cleanup_job"], v2_ids: [4300], type: "renamed", notes: "Clean up old log records", schedule: "0 1 * * *", category: "cleanup" },
  { v1_task: "staging_cleanup", v1_id: 3301, v2_tasks: ["staging_cleanup_job"], v2_ids: [4301], type: "renamed", notes: "Clean up processed staging records", schedule: "0 2 * * *", category: "cleanup" },
  { v1_task: "orphan_record_cleanup", v1_id: 3302, v2_tasks: ["orphan_cleanup_job"], v2_ids: [4302], type: "renamed", notes: "Clean up orphaned records", schedule: "0 3 * * 0", category: "cleanup" },
  { v1_task: "temp_data_cleanup", v1_id: 3303, v2_tasks: ["temp_data_cleanup_job"], v2_ids: [4303], type: "renamed", notes: "Clean up temporary data", schedule: "0 4 * * *", category: "cleanup" },
  { v1_task: "notification_cleanup", v1_id: 3304, v2_tasks: ["notification_cleanup_job"], v2_ids: [4304], type: "renamed", notes: "Clean up old notifications", schedule: "0 5 * * 0", category: "cleanup" },
  { v1_task: "session_cleanup", v1_id: 3305, v2_tasks: ["session_cleanup_job"], v2_ids: [4305], type: "renamed", notes: "Clean up expired sessions", schedule: "0 */4 * * *", category: "cleanup" },

  // ═══════════════════════════════════════════════════════════════
  // REPORT TASKS - Generate scheduled reports
  // ═══════════════════════════════════════════════════════════════

  { v1_task: "daily_summary_report", v1_id: 3400, v2_tasks: ["daily_summary_generator"], v2_ids: [4400], type: "renamed", notes: "Generate daily summary report", schedule: "0 8 * * *", category: "reports" },
  { v1_task: "weekly_report", v1_id: 3401, v2_tasks: ["weekly_report_generator"], v2_ids: [4401], type: "renamed", notes: "Generate weekly report", schedule: "0 8 * * 1", category: "reports" },
  { v1_task: "monthly_report", v1_id: 3402, v2_tasks: ["monthly_report_generator"], v2_ids: [4402], type: "renamed", notes: "Generate monthly report", schedule: "0 8 1 * *", category: "reports" },
  { v1_task: "team_leaderboard_report", v1_id: 3403, v2_tasks: ["team_leaderboard_report_generator"], v2_ids: [4403], type: "renamed", notes: "Generate team leaderboard report", schedule: "0 9 * * 1", category: "reports" },
  { v1_task: "network_report", v1_id: 3404, v2_tasks: ["network_report_generator"], v2_ids: [4404], type: "renamed", notes: "Generate network report", schedule: "0 9 * * 1", category: "reports" },

  // ═══════════════════════════════════════════════════════════════
  // EMAIL TASKS - Send scheduled emails
  // ═══════════════════════════════════════════════════════════════

  { v1_task: "daily_digest_email", v1_id: 3500, v2_tasks: ["daily_digest_sender"], v2_ids: [4500], type: "renamed", notes: "Send daily digest emails", schedule: "0 9 * * *", category: "email" },
  { v1_task: "weekly_summary_email", v1_id: 3501, v2_tasks: ["weekly_summary_sender"], v2_ids: [4501], type: "renamed", notes: "Send weekly summary emails", schedule: "0 9 * * 1", category: "email" },
  { v1_task: "notification_email_queue", v1_id: 3502, v2_tasks: ["notification_email_processor"], v2_ids: [4502], type: "renamed", notes: "Process notification email queue", schedule: "*/5 * * * *", category: "email" },
  { v1_task: "invitation_reminder", v1_id: 3503, v2_tasks: ["invitation_reminder_sender"], v2_ids: [4503], type: "renamed", notes: "Send invitation reminders", schedule: "0 10 * * *", category: "email" },

  // ═══════════════════════════════════════════════════════════════
  // WEBHOOK TASKS - Webhook processing
  // ═══════════════════════════════════════════════════════════════

  { v1_task: "webhook_retry_processor", v1_id: 3600, v2_tasks: ["webhook_retry_queue_processor"], v2_ids: [4600], type: "renamed", notes: "Process failed webhook retries", schedule: "*/10 * * * *", category: "webhook" },
  { v1_task: "webhook_dead_letter_processor", v1_id: 3601, v2_tasks: ["webhook_dead_letter_handler"], v2_ids: [4601], type: "renamed", notes: "Handle dead letter webhooks", schedule: "0 */4 * * *", category: "webhook" },
  { v1_task: "webhook_stats_aggregator", v1_id: 3602, v2_tasks: ["webhook_stats_calculator"], v2_ids: [4602], type: "renamed", notes: "Calculate webhook statistics", schedule: "0 * * * *", category: "webhook" },

  // ═══════════════════════════════════════════════════════════════
  // OTHER TASKS
  // ═══════════════════════════════════════════════════════════════

  { v1_task: "cache_warmup", v1_id: 3700, v2_tasks: ["cache_warmup_job"], v2_ids: [4700], type: "renamed", notes: "Warm up frequently accessed caches", schedule: "0 6 * * *", category: "other" },
  { v1_task: "search_index_update", v1_id: 3701, v2_tasks: ["search_index_rebuilder"], v2_ids: [4701], type: "renamed", notes: "Update search indexes", schedule: "0 */4 * * *", category: "other" },
  { v1_task: "metrics_snapshot", v1_id: 3702, v2_tasks: ["metrics_snapshot_job"], v2_ids: [4702], type: "renamed", notes: "Take metrics snapshot", schedule: "0 */6 * * *", category: "other" },
  { v1_task: "user_activity_tracker", v1_id: 3703, v2_tasks: ["user_activity_aggregator"], v2_ids: [4703], type: "renamed", notes: "Aggregate user activity", schedule: "0 0 * * *", category: "other" },

  // ═══════════════════════════════════════════════════════════════
  // DEPRECATED V1 TASKS
  // ═══════════════════════════════════════════════════════════════

  { v1_task: "legacy_sync_task", v1_id: 2001, v2_tasks: [], v2_ids: [], type: "deprecated", notes: "Replaced by new sync architecture", category: "other" },
  { v1_task: "old_report_generator", v1_id: 2002, v2_tasks: [], v2_ids: [], type: "deprecated", notes: "Replaced by new reporting system", category: "other" },
  { v1_task: "manual_cleanup", v1_id: 2003, v2_tasks: [], v2_ids: [], type: "deprecated", notes: "Replaced by automated cleanup", category: "other" },

  // ═══════════════════════════════════════════════════════════════
  // NEW V2-ONLY TASKS
  // ═══════════════════════════════════════════════════════════════

  { v1_task: "", v1_id: 0, v2_tasks: ["page_builder_cache_refresh"], v2_ids: [4800], type: "new", notes: "New: Page builder cache refresh", schedule: "0 */2 * * *", category: "other" },
  { v1_task: "", v1_id: 0, v2_tasks: ["chart_catalog_update"], v2_ids: [4801], type: "new", notes: "New: Chart catalog auto-update", schedule: "0 7 * * *", category: "other" },
  { v1_task: "", v1_id: 0, v2_tasks: ["nora_insight_generator"], v2_ids: [4802], type: "new", notes: "New: NORA AI insight generation", schedule: "0 */4 * * *", category: "other" },
  { v1_task: "", v1_id: 0, v2_tasks: ["user_onboarding_checker"], v2_ids: [4803], type: "new", notes: "New: User onboarding progress checker", schedule: "0 10 * * *", category: "other" },
  { v1_task: "", v1_id: 0, v2_tasks: ["dashboard_widget_optimizer"], v2_ids: [4804], type: "new", notes: "New: Dashboard widget performance optimizer", schedule: "0 5 * * *", category: "other" },
]

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all task mappings
 */
export function getAllTaskMappings(): TaskMapping[] {
  return TASK_MAPPINGS
}

/**
 * Get task mappings by category
 */
export function getTaskMappingsByCategory(category: TaskCategory): TaskMapping[] {
  return TASK_MAPPINGS.filter(m => m.category === category)
}

/**
 * Get task mappings by type
 */
export function getTaskMappingsByType(type: MappingType): TaskMapping[] {
  return TASK_MAPPINGS.filter(m => m.type === type)
}

/**
 * Get task mappings by schedule frequency
 */
export function getTaskMappingsByFrequency(frequency: "minutely" | "hourly" | "daily" | "weekly" | "monthly"): TaskMapping[] {
  return TASK_MAPPINGS.filter(m => {
    if (!m.schedule) return false
    const schedule = m.schedule
    switch (frequency) {
      case "minutely":
        return schedule.startsWith("*/") || schedule.startsWith("* *")
      case "hourly":
        return schedule.match(/^0 \*/) !== null
      case "daily":
        return schedule.match(/^0 \d+ \* \* \*$/) !== null
      case "weekly":
        return schedule.match(/^0 \d+ \* \* [0-6]$/) !== null
      case "monthly":
        return schedule.match(/^0 \d+ [1-9]+ \* \*$/) !== null
      default:
        return false
    }
  })
}

/**
 * Search task mappings by name
 */
export function searchTaskMappings(query: string): TaskMapping[] {
  const lower = query.toLowerCase()
  return TASK_MAPPINGS.filter(m =>
    m.v1_task.toLowerCase().includes(lower) ||
    m.v2_tasks.some(t => t.toLowerCase().includes(lower)) ||
    m.notes.toLowerCase().includes(lower)
  )
}

/**
 * Get task mapping statistics
 */
export function getTaskMappingStats() {
  const stats = {
    total: TASK_MAPPINGS.length,
    direct: 0,
    renamed: 0,
    split: 0,
    merged: 0,
    deprecated: 0,
    new: 0,
    byCategory: {} as Record<TaskCategory, number>,
    byFrequency: {
      minutely: 0,
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      other: 0
    }
  }

  for (const mapping of TASK_MAPPINGS) {
    stats[mapping.type]++
    stats.byCategory[mapping.category!] = (stats.byCategory[mapping.category!] || 0) + 1

    // Count frequency
    if (mapping.schedule) {
      if (mapping.schedule.startsWith("*/") || mapping.schedule.startsWith("* *")) {
        stats.byFrequency.minutely++
      } else if (mapping.schedule.match(/^0 \*/)) {
        stats.byFrequency.hourly++
      } else if (mapping.schedule.match(/^0 \d+ \* \* \*$/)) {
        stats.byFrequency.daily++
      } else if (mapping.schedule.match(/^0 \d+ \* \* [0-6]$/)) {
        stats.byFrequency.weekly++
      } else if (mapping.schedule.match(/^0 \d+ [1-9]+ \* \*$/)) {
        stats.byFrequency.monthly++
      } else {
        stats.byFrequency.other++
      }
    }
  }

  return stats
}

/**
 * Get cron schedule description
 */
export function describeCronSchedule(schedule: string): string {
  if (!schedule) return "No schedule"

  // Common patterns
  if (schedule === "* * * * *") return "Every minute"
  if (schedule.match(/^\*\/(\d+) \* \* \* \*$/)) {
    const minutes = schedule.match(/^\*\/(\d+)/)?.[1]
    return `Every ${minutes} minutes`
  }
  if (schedule === "0 * * * *") return "Every hour"
  if (schedule.match(/^0 \*\/(\d+) \* \* \*$/)) {
    const hours = schedule.match(/^0 \*\/(\d+)/)?.[1]
    return `Every ${hours} hours`
  }
  if (schedule.match(/^0 \d+ \* \* \*$/)) {
    const hour = schedule.match(/^0 (\d+)/)?.[1]
    return `Daily at ${hour}:00`
  }
  if (schedule.match(/^0 \d+ \* \* [0-6]$/)) {
    const hour = schedule.match(/^0 (\d+)/)?.[1]
    const dayNum = schedule.match(/\* \* ([0-6])$/)?.[1]
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return `Weekly on ${days[Number(dayNum)]} at ${hour}:00`
  }
  if (schedule.match(/^0 \d+ \d+ \* \*$/)) {
    const hour = schedule.match(/^0 (\d+)/)?.[1]
    const day = schedule.match(/^0 \d+ (\d+)/)?.[1]
    return `Monthly on day ${day} at ${hour}:00`
  }

  return schedule
}
