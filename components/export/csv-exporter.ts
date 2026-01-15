// CSV Export utilities for V2 Migration Orchestrator
// Generates downloadable CSV files for all mapping categories

import { TABLE_MAPPINGS } from "@/lib/table-mappings"
import { FUNCTION_MAPPINGS } from "@/lib/function-mappings"
import { TASK_MAPPINGS } from "@/lib/task-mappings"
import { ENDPOINT_MAPPINGS } from "@/lib/endpoint-mappings"
import { TIMELINE_EVENTS } from "@/lib/timeline-events"

// Helper to escape CSV values
function escapeCSV(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return ""
  const str = String(value)
  // If contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Helper to create CSV from array of objects
function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const header = columns.map(c => c.header).join(",")
  const rows = data.map(row =>
    columns.map(c => escapeCSV(row[c.key] as string | number | boolean | undefined)).join(",")
  )
  return [header, ...rows].join("\n")
}

// Export table mappings
export function exportTableMappingsCSV(): string {
  return arrayToCSV(
    TABLE_MAPPINGS.map(m => ({
      ...m,
      v2_tables_str: m.v2_tables.join("; "),
    })),
    [
      { key: "v1_table", header: "V1 Table" },
      { key: "type", header: "Mapping Type" },
      { key: "v2_tables_str", header: "V2 Tables" },
      { key: "primary_v2_table", header: "Primary V2 Table" },
      { key: "notes", header: "Notes" },
    ]
  )
}

// Export function mappings
export function exportFunctionMappingsCSV(): string {
  return arrayToCSV(
    FUNCTION_MAPPINGS.map(m => ({
      ...m,
      v2_functions_str: m.v2_functions.join("; "),
    })),
    [
      { key: "v1_function", header: "V1 Function" },
      { key: "v1_id", header: "V1 ID" },
      { key: "type", header: "Mapping Type" },
      { key: "category", header: "Category" },
      { key: "folder", header: "Folder" },
      { key: "v2_functions_str", header: "V2 Functions" },
      { key: "notes", header: "Notes" },
    ]
  )
}

// Export task mappings
export function exportTaskMappingsCSV(): string {
  return arrayToCSV(
    TASK_MAPPINGS.map(m => ({
      ...m,
      v2_tasks_str: m.v2_tasks.join("; "),
    })),
    [
      { key: "v1_task", header: "V1 Task" },
      { key: "v1_id", header: "V1 ID" },
      { key: "type", header: "Mapping Type" },
      { key: "category", header: "Category" },
      { key: "schedule", header: "Cron Schedule" },
      { key: "v2_tasks_str", header: "V2 Tasks" },
      { key: "notes", header: "Notes" },
    ]
  )
}

// Export endpoint mappings
export function exportEndpointMappingsCSV(): string {
  return arrayToCSV(
    ENDPOINT_MAPPINGS.map(m => ({
      ...m,
      v2_groups_str: m.v2_groups.join("; "),
      v2_canonicals_str: m.v2_canonicals.join("; "),
    })),
    [
      { key: "v1_group", header: "V1 API Group" },
      { key: "v1_canonical", header: "V1 Canonical" },
      { key: "v1_id", header: "V1 ID" },
      { key: "type", header: "Mapping Type" },
      { key: "endpoint_count_v1", header: "V1 Endpoint Count" },
      { key: "v2_groups_str", header: "V2 Groups" },
      { key: "v2_canonicals_str", header: "V2 Canonicals" },
      { key: "endpoint_count_v2", header: "V2 Endpoint Count" },
      { key: "notes", header: "Notes" },
    ]
  )
}

// Export timeline events
export function exportTimelineCSV(): string {
  return arrayToCSV(
    TIMELINE_EVENTS.map(e => ({
      ...e,
      artifacts_str: e.artifacts?.join("; ") || "",
      tables_migrated: e.metrics?.tables_migrated,
      endpoints_verified: e.metrics?.endpoints_verified,
    })),
    [
      { key: "date", header: "Date" },
      { key: "title", header: "Title" },
      { key: "category", header: "Category" },
      { key: "impact", header: "Impact" },
      { key: "description", header: "Description" },
      { key: "tables_migrated", header: "Tables Migrated" },
      { key: "endpoints_verified", header: "Endpoints Verified" },
      { key: "artifacts_str", header: "Artifacts" },
    ]
  )
}

// Download helper
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
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
export function exportAllCSV(type: "tables" | "functions" | "tasks" | "endpoints" | "timeline"): void {
  const exporters: Record<string, { fn: () => string; filename: string }> = {
    tables: { fn: exportTableMappingsCSV, filename: "v1-v2-table-mappings.csv" },
    functions: { fn: exportFunctionMappingsCSV, filename: "v1-v2-function-mappings.csv" },
    tasks: { fn: exportTaskMappingsCSV, filename: "v1-v2-task-mappings.csv" },
    endpoints: { fn: exportEndpointMappingsCSV, filename: "v1-v2-endpoint-mappings.csv" },
    timeline: { fn: exportTimelineCSV, filename: "v1-v2-migration-timeline.csv" },
  }

  const exporter = exporters[type]
  if (exporter) {
    downloadCSV(exporter.fn(), exporter.filename)
  }
}
