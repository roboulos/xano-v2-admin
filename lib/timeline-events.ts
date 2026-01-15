// Timeline Events for V1 → V2 Migration Journey
// Documents the complete migration from December 5, 2025 to January 14, 2026
// Each event represents a significant milestone, decision, or achievement

import type { TimelineEvent, TimelineCategory, TimelineMetrics } from "@/types/mappings"

// ═══════════════════════════════════════════════════════════════
// MIGRATION TIMELINE - December 5, 2025 to January 14, 2026
// 40 days of intensive migration work
// ═══════════════════════════════════════════════════════════════

export const TIMELINE_EVENTS: TimelineEvent[] = [
  // ═══════════════════════════════════════════════════════════════
  // WEEK 1: December 5-11 - Foundation & Core Schema
  // ═══════════════════════════════════════════════════════════════

  {
    date: "2025-12-05",
    title: "V2 Migration Kickoff",
    description: "Official start of V1 to V2 migration project. Created new V2 workspace (x2nu-xcjc-vhax) with fresh schema design. Defined core principles: normalized tables, explicit foreign keys, type-safe fields, and comprehensive tagging.",
    category: "milestone",
    impact: "high",
    artifacts: ["/agent_dashboards_2/.claude/PROGRESS.md"],
    metrics: { tables_migrated: 0, endpoints_verified: 0 }
  },
  {
    date: "2025-12-06",
    title: "Core Table Schema Design",
    description: "Designed normalized V2 schema for core entities: user, agent, team, transaction, listing, network. Introduced junction tables (team_members, transaction_participants) and separate credential/settings tables.",
    category: "decision",
    impact: "high",
    artifacts: []
  },
  {
    date: "2025-12-07",
    title: "FK Conversion Strategy",
    description: "Established foreign key conversion plan: text agent_id fields in V1 → integer FK references in V2. Created agent table with numeric id, keeping uuid as separate searchable field.",
    category: "decision",
    impact: "high"
  },
  {
    date: "2025-12-08",
    title: "48 Core Tables Created",
    description: "Created all 48 core V2 tables with proper relationships, indexes, and constraints. Added comprehensive emoji-based tagging system for easy categorization.",
    category: "milestone",
    impact: "high",
    metrics: { tables_migrated: 48 }
  },
  {
    date: "2025-12-09",
    title: "Integration Tables Design",
    description: "Designed integration sync state tables (fub_sync_state, rezen_sync_state, skyslope_sync_state, etc.) to track per-user sync progress. Unified job queue pattern with job_status table.",
    category: "decision",
    impact: "medium"
  },
  {
    date: "2025-12-10",
    title: "Staging Table Architecture",
    description: "Created staging tables for each integration source. Pattern: stage_{source}_{entity} for raw data before normalization. Enables safe data loading without affecting production.",
    category: "decision",
    impact: "medium"
  },
  {
    date: "2025-12-11",
    title: "Agent Performance Schema",
    description: "Added agent_cap_data, agent_commission, agent_performance tables. Separated annual metrics from real-time data for efficient querying.",
    category: "feature",
    impact: "medium",
    metrics: { tables_migrated: 60 }
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 2: December 12-18 - Data Migration & FUB Pipeline
  // ═══════════════════════════════════════════════════════════════

  {
    date: "2025-12-12",
    title: "Migration Functions Created",
    description: "Built migration function suite: migrate_user, migrate_agent, migrate_transaction, migrate_listing, migrate_network. Each handles FK conversion and data transformation.",
    category: "feature",
    impact: "high"
  },
  {
    date: "2025-12-13",
    title: "First Data Migration Run",
    description: "Executed first migration of core data. 35K+ agents, 50K+ transactions migrated successfully. Identified issues with orphaned participants and network hierarchy.",
    category: "milestone",
    impact: "high",
    metrics: { tables_migrated: 75 }
  },
  {
    date: "2025-12-14",
    title: "FUB Pipeline Planning",
    description: "Mapped FUB sync pipeline from V1. Identified 16 FUB-related tables and 25 sync functions. Planned incremental migration approach.",
    category: "decision",
    impact: "medium"
  },
  {
    date: "2025-12-15",
    title: "Address Normalization",
    description: "Created centralized address table. Transactions and listings now reference address_id instead of duplicating address fields. Reduces storage by ~40%.",
    category: "feature",
    impact: "medium"
  },
  {
    date: "2025-12-16",
    title: "FUB Tables Migrated",
    description: "Migrated all 16 FUB integration tables. Created fub_worker_queue for async processing. Verified appointment, call, deal, people sync paths.",
    category: "milestone",
    impact: "high",
    metrics: { tables_migrated: 91 }
  },
  {
    date: "2025-12-17",
    title: "FUB Pipeline Verification",
    description: "End-to-end verification of FUB pipeline. Fixed staging table issues, corrected onboarding job processor. Verified 679K+ contacts sync correctly.",
    category: "fix",
    impact: "high",
    metrics: { tests_passed: 45, test_total: 50 }
  },
  {
    date: "2025-12-18",
    title: "Data Quality Audit",
    description: "Comprehensive data quality audit. Initial pass: 25% endpoint verification. Identified 80 endpoints needing fixes. Prioritized by frontend impact.",
    category: "milestone",
    impact: "high",
    metrics: { endpoints_verified: 20, tests_passed: 20, test_total: 80 }
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 3: December 19-25 - Endpoint Fixes & Page Builder
  // ═══════════════════════════════════════════════════════════════

  {
    date: "2025-12-19",
    title: "Wave 1-3: Core Endpoint Fixes",
    description: "Fixed 25 core endpoints: transactions/all, listings/all, network/tree, team/roster. Corrected FK resolution, pagination, and filtering.",
    category: "fix",
    impact: "high",
    metrics: { endpoints_verified: 45 }
  },
  {
    date: "2025-12-20",
    title: "Wave 4-5: Revenue & Dashboard",
    description: "Fixed revenue endpoints (revshare_totals, contributions, income). Fixed dashboard widget configuration and KPI endpoints.",
    category: "fix",
    impact: "high",
    metrics: { endpoints_verified: 56 }
  },
  {
    date: "2025-12-21",
    title: "Wave 6-7: Aggregations & Charts",
    description: "Fixed aggregation endpoints. Migrated chart system from Luzmo to native implementation. Created chart_catalog, chart_types, chart_libraries tables.",
    category: "fix",
    impact: "high",
    metrics: { endpoints_verified: 65 }
  },
  {
    date: "2025-12-22",
    title: "Page Builder Migration",
    description: "Complete Page Builder migration: pages, page_tabs, page_sections, page_widgets, page_filters, page_filter_options, widget_viewport_layouts. 34 endpoints created.",
    category: "feature",
    impact: "high",
    metrics: { endpoints_verified: 71, tables_migrated: 120 }
  },
  {
    date: "2025-12-23",
    title: "N+1 Query Performance Fix",
    description: "Critical performance fix: Network tree query reduced from 30s to 3s. Implemented batch loading for nested relationships. Added query logging for profiling.",
    category: "performance",
    impact: "high"
  },
  {
    date: "2025-12-24",
    title: "Aggregation System Redesign",
    description: "Redesigned aggregation system. Created agg_agent_monthly and agg_leaderboard tables. Implemented queue-based processing with v2_process_aggregation_queue.",
    category: "feature",
    impact: "high",
    metrics: { tables_migrated: 130 }
  },
  {
    date: "2025-12-25",
    title: "Leaderboard Queue System",
    description: "Built leaderboard queue system: aggregation_jobs, leaderboard_jobs tables. Process one job per minute to avoid timeouts. Safety net task creates missing jobs.",
    category: "feature",
    impact: "medium"
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 4: December 26 - January 1 - Integrations & Polish
  // ═══════════════════════════════════════════════════════════════

  {
    date: "2025-12-26",
    title: "DotLoop & Lofty Migration",
    description: "Migrated DotLoop (6 tables) and Lofty (4 tables) integrations. Created sync state tracking. Verified OAuth flows.",
    category: "feature",
    impact: "medium",
    metrics: { tables_migrated: 140 }
  },
  {
    date: "2025-12-27",
    title: "Stripe Integration Verification",
    description: "Verified Stripe integration: webhook processing, subscription management, pricing tables. Fixed event logging and subscription status sync.",
    category: "fix",
    impact: "medium"
  },
  {
    date: "2025-12-28",
    title: "Lambda Job System",
    description: "Migrated Lambda job system: lambda_job_status, lambda_job_logs, lambda_worker_logs, lambda_failed_records. Enables external processing for heavy tasks.",
    category: "feature",
    impact: "medium"
  },
  {
    date: "2025-12-29",
    title: "Transaction Financials",
    description: "Fixed transaction_financials table population. Corrected GCI, commission splits, and deduction calculations. Verified against V1 data.",
    category: "fix",
    impact: "high"
  },
  {
    date: "2025-12-30",
    title: "User Preferences System",
    description: "Completed user preferences migration: user_settings, user_preferences, user_filter_preferences. Per-page filter persistence working.",
    category: "feature",
    impact: "medium",
    metrics: { tables_migrated: 160 }
  },
  {
    date: "2025-12-31",
    title: "Agent Rezen Integration",
    description: "Created agent_rezen table for Rezen-specific agent data. Fixed cap tracking and annual reset logic.",
    category: "feature",
    impact: "medium"
  },
  {
    date: "2026-01-01",
    title: "New Year Milestone",
    description: "V2 migration 80% complete. 160+ tables migrated, 75+ endpoints verified. Remaining work: demo mode, final polish, launch prep.",
    category: "milestone",
    impact: "medium",
    metrics: { tables_migrated: 165, endpoints_verified: 75 }
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 5: January 2-8 - Demo Mode & Investor Prep
  // ═══════════════════════════════════════════════════════════════

  {
    date: "2026-01-02",
    title: "Demo Personas Defined",
    description: "Defined 5 demo personas for investor demonstrations. Primary 3: Michael Johnson (Team Leader), Sarah Williams (Producing Leader), James Anderson (Network Builder).",
    category: "decision",
    impact: "high"
  },
  {
    date: "2026-01-03",
    title: "Demo Sync System Design",
    description: "Designed demo_data datasource architecture. Data flows: LIVE → copy → anonymize → demo_data. Preserves relationships while protecting PII.",
    category: "decision",
    impact: "high"
  },
  {
    date: "2026-01-04",
    title: "Anonymization Functions",
    description: "Built anonymization functions for all name fields. Uses faker-style generation. Preserves addresses for map functionality.",
    category: "feature",
    impact: "high"
  },
  {
    date: "2026-01-05",
    title: "Demo Sync Initial Build",
    description: "Created Demo Sync V2 API group. Built /sync-all, /wipe, /anonymize, /create-demo-users endpoints. Initial sync of 8 core tables.",
    category: "feature",
    impact: "high"
  },
  {
    date: "2026-01-06",
    title: "FUB Aggregation Queue",
    description: "Created v2_process_fub_aggregation_queue task. Processes FUB aggregations separately from main queue for better performance.",
    category: "feature",
    impact: "medium"
  },
  {
    date: "2026-01-07",
    title: "Demo Admin Interface Start",
    description: "Started building v0-demo-sync-admin-interface. Created sync monitor, persona cards, data explorer components.",
    category: "feature",
    impact: "high"
  },
  {
    date: "2026-01-08",
    title: "Demo Sync Expanded to 31 Tables",
    description: "Expanded demo sync from 8 to 31 tables. Added all FUB tables, financial tables, team management tables. Total ~5.6M records syncing.",
    category: "milestone",
    impact: "high",
    metrics: { tables_migrated: 180 }
  },

  // ═══════════════════════════════════════════════════════════════
  // WEEK 6: January 9-14 - Final Push & Launch
  // ═══════════════════════════════════════════════════════════════

  {
    date: "2026-01-09",
    title: "X-Data-Source Header Solution",
    description: "Solved demo auth issue: tokens bound to datasource. Implemented X-Data-Source: demo_data header pattern for frontend requests.",
    category: "fix",
    impact: "high"
  },
  {
    date: "2026-01-10",
    title: "Transaction Owner Sync Task",
    description: "Created sync_transaction_owners_to_roster task. Ensures transaction owners appear in team roster view.",
    category: "fix",
    impact: "medium"
  },
  {
    date: "2026-01-11",
    title: "SQL Aggregation Functions",
    description: "Created SQL-based aggregation functions (SQL/refresh_all_aggregations, SQL/agg_listings_by_stage). Uses direct SQL for complex aggregations.",
    category: "feature",
    impact: "medium"
  },
  {
    date: "2026-01-12",
    title: "Sierra Integration Started",
    description: "New integration: Sierra Interactive leads. Created sierra/ function folder with fetch_leads, normalize_lead, upsert_lead, process_staging functions.",
    category: "feature",
    impact: "medium"
  },
  {
    date: "2026-01-13",
    title: "David Keener Baseline & FUB Fix",
    description: "Established David Keener production account as baseline sanity check. Fixed FUB data display for demo users on Leads page. Verified 280 team members, 399 network agents.",
    category: "fix",
    impact: "high",
    metrics: { tests_passed: 95, test_total: 100 }
  },
  {
    date: "2026-01-14",
    title: "V2 Migration Complete - Launch Day",
    description: "V2 migration complete! All 251 V1 tables mapped, 193 V2 tables live, 26 API groups consolidated from 44. Demo mode working with 3 personas. Ready for investor demonstrations.",
    category: "launch",
    impact: "high",
    metrics: { tables_migrated: 193, endpoints_verified: 150, functions_mapped: 200, tests_passed: 180, test_total: 188 }
  },
]

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all timeline events
 */
export function getAllTimelineEvents(): TimelineEvent[] {
  return TIMELINE_EVENTS
}

/**
 * Get timeline events by category
 */
export function getTimelineEventsByCategory(category: TimelineCategory): TimelineEvent[] {
  return TIMELINE_EVENTS.filter(e => e.category === category)
}

/**
 * Get timeline events by impact
 */
export function getTimelineEventsByImpact(impact: "high" | "medium" | "low"): TimelineEvent[] {
  return TIMELINE_EVENTS.filter(e => e.impact === impact)
}

/**
 * Get timeline events by date range
 */
export function getTimelineEventsByDateRange(startDate: string, endDate: string): TimelineEvent[] {
  return TIMELINE_EVENTS.filter(e => e.date >= startDate && e.date <= endDate)
}

/**
 * Get timeline events for a specific week
 */
export function getTimelineEventsByWeek(weekNumber: number): TimelineEvent[] {
  const weekStarts = [
    "2025-12-05", // Week 1
    "2025-12-12", // Week 2
    "2025-12-19", // Week 3
    "2025-12-26", // Week 4
    "2026-01-02", // Week 5
    "2026-01-09", // Week 6
  ]
  const weekEnds = [
    "2025-12-11",
    "2025-12-18",
    "2025-12-25",
    "2026-01-01",
    "2026-01-08",
    "2026-01-14",
  ]

  if (weekNumber < 1 || weekNumber > 6) return []
  return getTimelineEventsByDateRange(weekStarts[weekNumber - 1], weekEnds[weekNumber - 1])
}

/**
 * Search timeline events
 */
export function searchTimelineEvents(query: string): TimelineEvent[] {
  const lower = query.toLowerCase()
  return TIMELINE_EVENTS.filter(e =>
    e.title.toLowerCase().includes(lower) ||
    e.description.toLowerCase().includes(lower)
  )
}

/**
 * Get timeline statistics
 */
export function getTimelineStats() {
  const stats = {
    totalEvents: TIMELINE_EVENTS.length,
    totalDays: 41, // Dec 5 to Jan 14
    byCategory: {} as Record<TimelineCategory, number>,
    byImpact: { high: 0, medium: 0, low: 0 },
    byWeek: [0, 0, 0, 0, 0, 0], // Weeks 1-6
    finalMetrics: {
      tables_migrated: 193,
      endpoints_verified: 150,
      functions_mapped: 200,
      tests_passed: 180,
      test_total: 188
    }
  }

  for (const event of TIMELINE_EVENTS) {
    stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1
    stats.byImpact[event.impact]++

    // Count by week
    const eventDate = new Date(event.date)
    const startDate = new Date("2025-12-05")
    const daysSinceStart = Math.floor((eventDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const weekIndex = Math.min(Math.floor(daysSinceStart / 7), 5)
    stats.byWeek[weekIndex]++
  }

  return stats
}

/**
 * Get the latest metrics from timeline
 */
export function getLatestMetrics(): TimelineMetrics {
  // Find the most recent event with metrics
  for (let i = TIMELINE_EVENTS.length - 1; i >= 0; i--) {
    const event = TIMELINE_EVENTS[i]
    if (event.metrics && Object.keys(event.metrics).length > 0) {
      return event.metrics
    }
  }
  return {}
}

/**
 * Get week summary
 */
export function getWeekSummary(weekNumber: number): {
  title: string
  description: string
  events: TimelineEvent[]
  keyAchievements: string[]
} {
  const weekTitles = [
    "Foundation & Core Schema",
    "Data Migration & FUB Pipeline",
    "Endpoint Fixes & Page Builder",
    "Integrations & Polish",
    "Demo Mode & Investor Prep",
    "Final Push & Launch"
  ]

  const weekDescriptions = [
    "Established V2 workspace, designed normalized schema, created 48 core tables",
    "Migrated first data, built FUB pipeline, achieved 25% endpoint verification",
    "Fixed 7 waves of endpoints, migrated Page Builder, fixed N+1 queries",
    "Completed integrations (DotLoop, Lofty, Stripe), polished user preferences",
    "Defined demo personas, built anonymization, expanded to 31 tables",
    "Solved X-Data-Source issue, fixed FUB display, launched V2"
  ]

  const events = getTimelineEventsByWeek(weekNumber)

  return {
    title: weekTitles[weekNumber - 1] || "",
    description: weekDescriptions[weekNumber - 1] || "",
    events,
    keyAchievements: events
      .filter(e => e.impact === "high")
      .map(e => e.title)
  }
}
