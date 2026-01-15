// JSON Export utilities for V2 Migration Orchestrator
// Generates downloadable JSON files for all mapping categories

import { TABLE_MAPPINGS, getMappingStats } from "@/lib/table-mappings"
import { FUNCTION_MAPPINGS, getFunctionMappingStats } from "@/lib/function-mappings"
import { TASK_MAPPINGS, getTaskMappingStats } from "@/lib/task-mappings"
import { ENDPOINT_MAPPINGS, getEndpointMappingStats } from "@/lib/endpoint-mappings"
import { TIMELINE_EVENTS, getTimelineStats } from "@/lib/timeline-events"
import type { MigrationSummary } from "@/types/mappings"

// Export table mappings as JSON
export function exportTableMappingsJSON(): string {
  const stats = getMappingStats()
  return JSON.stringify({
    _meta: {
      exportedAt: new Date().toISOString(),
      type: "table-mappings",
      version: "1.0.0",
    },
    stats,
    mappings: TABLE_MAPPINGS,
  }, null, 2)
}

// Export function mappings as JSON
export function exportFunctionMappingsJSON(): string {
  const stats = getFunctionMappingStats()
  return JSON.stringify({
    _meta: {
      exportedAt: new Date().toISOString(),
      type: "function-mappings",
      version: "1.0.0",
    },
    stats,
    mappings: FUNCTION_MAPPINGS,
  }, null, 2)
}

// Export task mappings as JSON
export function exportTaskMappingsJSON(): string {
  const stats = getTaskMappingStats()
  return JSON.stringify({
    _meta: {
      exportedAt: new Date().toISOString(),
      type: "task-mappings",
      version: "1.0.0",
    },
    stats,
    mappings: TASK_MAPPINGS,
  }, null, 2)
}

// Export endpoint mappings as JSON
export function exportEndpointMappingsJSON(): string {
  const stats = getEndpointMappingStats()
  return JSON.stringify({
    _meta: {
      exportedAt: new Date().toISOString(),
      type: "endpoint-mappings",
      version: "1.0.0",
    },
    stats,
    mappings: ENDPOINT_MAPPINGS,
  }, null, 2)
}

// Export timeline as JSON
export function exportTimelineJSON(): string {
  const stats = getTimelineStats()
  return JSON.stringify({
    _meta: {
      exportedAt: new Date().toISOString(),
      type: "migration-timeline",
      version: "1.0.0",
      dateRange: {
        start: "2025-12-05",
        end: "2026-01-14",
        durationDays: 40,
      },
    },
    stats,
    events: TIMELINE_EVENTS,
  }, null, 2)
}

// Export complete migration summary as JSON
export function exportMigrationSummaryJSON(): string {
  const tableStats = getMappingStats()
  const functionStats = getFunctionMappingStats()
  const taskStats = getTaskMappingStats()
  const endpointStats = getEndpointMappingStats()
  const timelineStats = getTimelineStats()

  const summary: MigrationSummary = {
    tables: {
      v1_total: 251,
      v2_total: 193,
      mapped: tableStats.total - tableStats.deprecated,
      deprecated: tableStats.deprecated,
      new_in_v2: 0, // Would need to calculate V2-only tables
    },
    functions: {
      v1_total: 500,
      v2_total: 500,
      mapped: functionStats.total - functionStats.deprecated,
      deprecated: functionStats.deprecated,
      new_in_v2: functionStats.new || 0,
    },
    tasks: {
      v1_total: 125,
      v2_total: 200,
      mapped: taskStats.total - taskStats.deprecated,
      deprecated: taskStats.deprecated,
      new_in_v2: taskStats.new || 0,
    },
    endpoints: {
      v1_groups: endpointStats.v1_groups,
      v2_groups: endpointStats.v2_groups,
      v1_endpoints: endpointStats.v1_endpoints,
      v2_endpoints: endpointStats.v2_endpoints,
      consolidated: endpointStats.v1_groups - endpointStats.v2_groups,
    },
  }

  return JSON.stringify({
    _meta: {
      exportedAt: new Date().toISOString(),
      type: "migration-summary",
      version: "1.0.0",
      project: "AgentDashboards V1 → V2 Migration",
      dateRange: {
        start: "2025-12-05",
        end: "2026-01-14",
        durationDays: 40,
      },
    },
    summary,
    timeline: {
      totalEvents: timelineStats.totalEvents,
      milestones: timelineStats.byCategory.milestone || 0,
      decisions: timelineStats.byCategory.decision || 0,
      fixes: timelineStats.byCategory.fix || 0,
    },
  }, null, 2)
}

// Download helper
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export all as single function
export function exportAllJSON(type: "tables" | "functions" | "tasks" | "endpoints" | "timeline" | "summary"): void {
  const exporters: Record<string, { fn: () => string; filename: string }> = {
    tables: { fn: exportTableMappingsJSON, filename: "v1-v2-table-mappings.json" },
    functions: { fn: exportFunctionMappingsJSON, filename: "v1-v2-function-mappings.json" },
    tasks: { fn: exportTaskMappingsJSON, filename: "v1-v2-task-mappings.json" },
    endpoints: { fn: exportEndpointMappingsJSON, filename: "v1-v2-endpoint-mappings.json" },
    timeline: { fn: exportTimelineJSON, filename: "v1-v2-migration-timeline.json" },
    summary: { fn: exportMigrationSummaryJSON, filename: "v1-v2-migration-summary.json" },
  }

  const exporter = exporters[type]
  if (exporter) {
    downloadJSON(exporter.fn(), exporter.filename)
  }
}
