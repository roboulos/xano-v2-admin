// Migration Mapping Types for V2 Migration Orchestrator
// Extends beyond table mappings to cover functions, tasks, endpoints, and timeline

// Re-export from table-mappings for consistency
export type { MappingType, TableMapping } from "@/lib/table-mappings"
export { MAPPING_TYPE_COLORS, MAPPING_TYPE_LABELS } from "@/lib/table-mappings"

import type { MappingType } from "@/lib/table-mappings"

// ═══════════════════════════════════════════════════════════════
// FUNCTION MAPPINGS
// ═══════════════════════════════════════════════════════════════

export interface FunctionMapping {
  v1_function: string        // V1 function name (full path like "Workers/sync_fub")
  v1_id: number             // V1 function ID
  v2_functions: string[]    // V2 function name(s) - can be multiple if split
  v2_ids: number[]          // V2 function ID(s)
  type: MappingType
  notes: string
  category?: FunctionCategory
  folder?: string           // V1 folder path
}

export type FunctionCategory =
  | "sync"          // Data synchronization (FUB, Rezen, etc.)
  | "aggregation"   // Aggregation computations
  | "worker"        // Background workers
  | "health"        // Health checks
  | "cleanup"       // Data cleanup
  | "email"         // Email operations
  | "notification"  // Notification handling
  | "auth"          // Authentication
  | "api"           // API handlers
  | "util"          // Utility functions
  | "migration"     // Migration helpers
  | "other"

export const FUNCTION_CATEGORY_LABELS: Record<FunctionCategory, string> = {
  sync: "Data Sync",
  aggregation: "Aggregation",
  worker: "Workers",
  health: "Health Checks",
  cleanup: "Cleanup",
  email: "Email",
  notification: "Notifications",
  auth: "Authentication",
  api: "API Handlers",
  util: "Utilities",
  migration: "Migration",
  other: "Other",
}

export const FUNCTION_CATEGORY_ICONS: Record<FunctionCategory, string> = {
  sync: "🔄",
  aggregation: "📊",
  worker: "⚙️",
  health: "💚",
  cleanup: "🧹",
  email: "📧",
  notification: "🔔",
  auth: "🔐",
  api: "🚀",
  util: "🔧",
  migration: "📦",
  other: "📋",
}

// ═══════════════════════════════════════════════════════════════
// BACKGROUND TASK MAPPINGS
// ═══════════════════════════════════════════════════════════════

export interface TaskMapping {
  v1_task: string           // V1 task name
  v1_id: number            // V1 task ID
  v2_tasks: string[]       // V2 task name(s)
  v2_ids: number[]         // V2 task ID(s)
  type: MappingType
  notes: string
  schedule?: string        // Cron schedule if known
  category?: TaskCategory
}

export type TaskCategory =
  | "sync"          // Scheduled syncs
  | "aggregation"   // Scheduled aggregation updates
  | "cleanup"       // Scheduled cleanups
  | "health"        // Health check tasks
  | "reports"       // Report generation
  | "email"         // Scheduled emails
  | "webhook"       // Webhook processing
  | "fub"           // FUB-specific tasks
  | "rezen"         // Rezen-specific tasks
  | "other"

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  sync: "Sync Tasks",
  aggregation: "Aggregation",
  cleanup: "Cleanup",
  health: "Health Checks",
  reports: "Reports",
  email: "Email",
  webhook: "Webhooks",
  fub: "Follow Up Boss",
  rezen: "Rezen",
  other: "Other",
}

export const TASK_CATEGORY_ICONS: Record<TaskCategory, string> = {
  sync: "🔄",
  aggregation: "📊",
  cleanup: "🧹",
  health: "💚",
  reports: "📑",
  email: "📧",
  webhook: "📥",
  fub: "📞",
  rezen: "🏘️",
  other: "📋",
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINT/API GROUP MAPPINGS
// ═══════════════════════════════════════════════════════════════

export interface EndpointMapping {
  v1_group: string          // V1 API group name
  v1_canonical: string      // V1 canonical path (api:xxx)
  v1_id: number            // V1 API group ID
  v2_groups: string[]      // V2 API group name(s)
  v2_canonicals: string[]  // V2 canonical paths
  v2_ids: number[]         // V2 API group ID(s)
  type: MappingType
  notes: string
  endpoint_count_v1?: number
  endpoint_count_v2?: number
}

export interface EndpointDetail {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  auth_required: boolean
  v1_id?: number
  v2_id?: number
}

// ═══════════════════════════════════════════════════════════════
// TIMELINE EVENTS
// ═══════════════════════════════════════════════════════════════

export interface TimelineEvent {
  date: string              // ISO date string (YYYY-MM-DD)
  title: string             // Short title
  description: string       // Detailed description
  category: TimelineCategory
  impact: "high" | "medium" | "low"
  artifacts?: string[]      // Related file paths or URLs
  metrics?: TimelineMetrics // Optional metrics snapshot
}

export type TimelineCategory =
  | "milestone"     // Major project milestones
  | "decision"      // Architecture decisions
  | "fix"           // Bug fixes
  | "feature"       // Feature implementations
  | "migration"     // Data migration events
  | "performance"   // Performance improvements
  | "integration"   // Integration work
  | "launch"        // Launch events

export const TIMELINE_CATEGORY_LABELS: Record<TimelineCategory, string> = {
  milestone: "Milestone",
  decision: "Decision",
  fix: "Bug Fix",
  feature: "Feature",
  migration: "Migration",
  performance: "Performance",
  integration: "Integration",
  launch: "Launch",
}

export const TIMELINE_CATEGORY_COLORS: Record<TimelineCategory, { bg: string; text: string; border: string }> = {
  milestone: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  decision: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  fix: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  feature: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  migration: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  performance: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  integration: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  launch: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
}

export interface TimelineMetrics {
  tables_migrated?: number
  endpoints_verified?: number
  functions_mapped?: number
  tests_passed?: number
  test_total?: number
}

// ═══════════════════════════════════════════════════════════════
// MIGRATION SUMMARY TYPES
// ═══════════════════════════════════════════════════════════════

export interface MigrationSummary {
  tables: {
    v1_total: number
    v2_total: number
    mapped: number
    deprecated: number
    new_in_v2: number
  }
  functions: {
    v1_total: number
    v2_total: number
    mapped: number
    deprecated: number
    new_in_v2: number
  }
  tasks: {
    v1_total: number
    v2_total: number
    mapped: number
    deprecated: number
    new_in_v2: number
  }
  endpoints: {
    v1_groups: number
    v2_groups: number
    v1_endpoints: number
    v2_endpoints: number
    consolidated: number  // How many V1 groups merged into fewer V2 groups
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTO-DETECTION RESULT TYPES
// ═══════════════════════════════════════════════════════════════

export interface AutoDetectionResult<T> {
  item: T
  confidence: "high" | "medium" | "low"
  detectedType: MappingType
  reason: string
}

export type DetectionPattern =
  | "exact_match"           // Names match exactly
  | "case_insensitive"      // Names match ignoring case
  | "snake_to_camel"        // snake_case → camelCase
  | "prefix_stripped"       // sync_fub → fub
  | "folder_match"          // Workers/sync → sync
  | "tag_match"             // 2+ matching tags
  | "semantic_match"        // Similar meaning different name
  | "no_match"              // No match found

// ═══════════════════════════════════════════════════════════════
// EXPORT TYPES
// ═══════════════════════════════════════════════════════════════

export type ExportFormat = "csv" | "json" | "markdown"

export interface ExportOptions {
  format: ExportFormat
  includeMetrics?: boolean
  includeDates?: boolean
  category?: string        // Filter by category
  type?: MappingType       // Filter by mapping type
}

export interface ExportResult {
  filename: string
  content: string
  mimeType: string
  size: number
}
