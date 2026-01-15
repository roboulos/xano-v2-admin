// Markdown Export utilities for V2 Migration Orchestrator
// Generates documentation-ready markdown files

import { TABLE_MAPPINGS, getMappingStats, MAPPING_TYPE_LABELS } from "@/lib/table-mappings"
import { FUNCTION_MAPPINGS, getFunctionMappingStats } from "@/lib/function-mappings"
import { TASK_MAPPINGS, getTaskMappingStats, describeCronSchedule } from "@/lib/task-mappings"
import { ENDPOINT_MAPPINGS, getEndpointMappingStats } from "@/lib/endpoint-mappings"
import { TIMELINE_EVENTS, getTimelineStats, getWeekSummary } from "@/lib/timeline-events"
import {
  FUNCTION_CATEGORY_LABELS,
  TASK_CATEGORY_LABELS,
  TIMELINE_CATEGORY_LABELS,
} from "@/types/mappings"

// Generate table mappings markdown
export function generateTableMappingsMD(): string {
  const stats = getMappingStats()

  let md = `# V1 → V2 Table Mappings

> Generated: ${new Date().toISOString()}

## Summary

| Metric | Count |
|--------|-------|
| Total Mappings | ${stats.total} |
| Direct (1:1) | ${stats.direct} |
| Renamed | ${stats.renamed} |
| Split (1:N) | ${stats.split} |
| Merged (N:1) | ${stats.merged} |
| Deprecated | ${stats.deprecated} |

## Mappings by Type

`

  // Group by type
  const types = ["direct", "renamed", "split", "merged", "deprecated"] as const
  for (const type of types) {
    const mappings = TABLE_MAPPINGS.filter(m => m.type === type)
    if (mappings.length === 0) continue

    md += `### ${MAPPING_TYPE_LABELS[type]} (${mappings.length})\n\n`
    md += `| V1 Table | V2 Table(s) | Notes |\n`
    md += `|----------|-------------|-------|\n`

    for (const m of mappings) {
      const v2Tables = m.v2_tables.length > 0 ? m.v2_tables.join(", ") : "—"
      md += `| \`${m.v1_table}\` | ${v2Tables} | ${m.notes} |\n`
    }
    md += "\n"
  }

  return md
}

// Generate function mappings markdown
export function generateFunctionMappingsMD(): string {
  const stats = getFunctionMappingStats()

  let md = `# V1 → V2 Function Mappings

> Generated: ${new Date().toISOString()}

## Summary

| Metric | Count |
|--------|-------|
| Total Functions | ${stats.total} |
| Direct | ${stats.direct} |
| Renamed | ${stats.renamed} |
| Deprecated | ${stats.deprecated} |
| New in V1 | ${stats.new || 0} |

## Mappings by Category

`

  // Group by category
  const categories = new Set(FUNCTION_MAPPINGS.map(m => m.category).filter(Boolean))
  for (const category of categories) {
    const mappings = FUNCTION_MAPPINGS.filter(m => m.category === category)
    const label = FUNCTION_CATEGORY_LABELS[category!] || category

    md += `### ${label} (${mappings.length})\n\n`
    md += `| V1 Function | Type | V2 Function(s) | Notes |\n`
    md += `|-------------|------|----------------|-------|\n`

    for (const m of mappings.slice(0, 20)) {
      const v2 = m.v2_functions.length > 0 ? m.v2_functions.join(", ") : "—"
      md += `| \`${m.v1_function}\` | ${m.type} | ${v2} | ${m.notes} |\n`
    }
    if (mappings.length > 20) {
      md += `| ... | ... | ... | +${mappings.length - 20} more |\n`
    }
    md += "\n"
  }

  return md
}

// Generate task mappings markdown
export function generateTaskMappingsMD(): string {
  const stats = getTaskMappingStats()

  let md = `# V1 → V2 Background Task Mappings

> Generated: ${new Date().toISOString()}

## Summary

| Metric | Count |
|--------|-------|
| V1 Tasks | 125 |
| V2 Tasks | 200 |
| Total Mappings | ${stats.total} |
| Direct | ${stats.direct} |
| Renamed | ${stats.renamed} |
| Deprecated | ${stats.deprecated} |

## Mappings by Category

`

  // Group by category
  const categories = new Set(TASK_MAPPINGS.map(m => m.category).filter(Boolean))
  for (const category of categories) {
    const mappings = TASK_MAPPINGS.filter(m => m.category === category)
    const label = TASK_CATEGORY_LABELS[category!] || category

    md += `### ${label} (${mappings.length})\n\n`
    md += `| V1 Task | Schedule | Type | V2 Task(s) |\n`
    md += `|---------|----------|------|------------|\n`

    for (const m of mappings) {
      const schedule = m.schedule ? describeCronSchedule(m.schedule) : "—"
      const v2 = m.v2_tasks.length > 0 ? m.v2_tasks.join(", ") : "—"
      md += `| \`${m.v1_task}\` | ${schedule} | ${m.type} | ${v2} |\n`
    }
    md += "\n"
  }

  return md
}

// Generate endpoint mappings markdown
export function generateEndpointMappingsMD(): string {
  const stats = getEndpointMappingStats()

  let md = `# V1 → V2 API Endpoint Mappings

> Generated: ${new Date().toISOString()}

## Summary

| Metric | V1 | V2 |
|--------|----|----|
| API Groups | ${stats.v1_groups} | ${stats.v2_groups} |
| Endpoints | ${stats.v1_endpoints}+ | ${stats.v2_endpoints}+ |

**Consolidation Ratio:** ${stats.v1_groups}:${stats.v2_groups} (${Math.round((1 - stats.v2_groups / stats.v1_groups) * 100)}% reduction)

## API Group Mappings

| V1 Group | V1 Canonical | Type | V2 Group | Notes |
|----------|-------------|------|----------|-------|
`

  for (const m of ENDPOINT_MAPPINGS) {
    const v2Group = m.v2_groups.length > 0 ? m.v2_groups.join(", ") : "—"
    md += `| ${m.v1_group} | \`${m.v1_canonical}\` | ${m.type} | ${v2Group} | ${m.notes} |\n`
  }

  md += `

## Key Consolidations

### Frontend API v2 (Group 515)

The main Frontend API v2 consolidates multiple V1 groups:

`

  const frontendMerges = ENDPOINT_MAPPINGS.filter(m => m.v2_groups.includes("Frontend API v2"))
  for (const m of frontendMerges) {
    md += `- **${m.v1_group}** (\`${m.v1_canonical}\`) - ${m.endpoint_count_v1} endpoints\n`
  }

  return md
}

// Generate timeline markdown
export function generateTimelineMD(): string {
  const stats = getTimelineStats()

  let md = `# V1 → V2 Migration Timeline

> December 5, 2025 - January 14, 2026 (40 days)

## Summary

| Category | Count |
|----------|-------|
| Total Events | ${stats.totalEvents} |
| Milestones | ${stats.byCategory.milestone || 0} |
| Decisions | ${stats.byCategory.decision || 0} |
| Bug Fixes | ${stats.byCategory.fix || 0} |
| Features | ${stats.byCategory.feature || 0} |

## Week-by-Week Progress

`

  // Generate week summaries
  for (let weekNum = 1; weekNum <= 6; weekNum++) {
    const summary = getWeekSummary(weekNum)

    md += `### Week ${weekNum}: ${summary.title}\n\n`
    if (summary.description) {
      md += `${summary.description}\n\n`
      if (summary.keyAchievements.length > 0) {
        md += `**Key Highlights:**\n`
        for (const h of summary.keyAchievements) {
          md += `- ${h}\n`
        }
      }
    }
    md += "\n"
  }

  md += `## Complete Event Log

`

  for (const event of TIMELINE_EVENTS) {
    const categoryLabel = TIMELINE_CATEGORY_LABELS[event.category]
    md += `### ${event.date} - ${event.title}

**Category:** ${categoryLabel} | **Impact:** ${event.impact}

${event.description}

`
    if (event.metrics) {
      md += `**Metrics:**\n`
      if (event.metrics.tables_migrated) md += `- Tables migrated: ${event.metrics.tables_migrated}\n`
      if (event.metrics.endpoints_verified) md += `- Endpoints verified: ${event.metrics.endpoints_verified}\n`
      if (event.metrics.tests_passed && event.metrics.test_total) {
        md += `- Tests: ${event.metrics.tests_passed}/${event.metrics.test_total}\n`
      }
    }
    md += "\n---\n\n"
  }

  return md
}

// Generate complete migration documentation
export function generateMigrationDocMD(): string {
  let md = `# AgentDashboards V1 → V2 Migration Documentation

> Complete migration reference documentation
> Generated: ${new Date().toISOString()}

## Overview

This document provides comprehensive documentation for the AgentDashboards V1 to V2 migration project, completed over 40 days from December 5, 2025 to January 14, 2026.

### Key Metrics

| Category | V1 | V2 | Change |
|----------|----|----|--------|
| Tables | 251 | 193 | Normalized |
| Functions | 500 | 500 | Refactored |
| Background Tasks | 125 | 200 | Enhanced |
| API Groups | 44 | 26 | Consolidated |

### Migration Principles

1. **Schema Normalization** - Split denormalized V1 tables into properly normalized V2 tables
2. **Foreign Key Migration** - Convert text UUIDs to integer FK references
3. **API Consolidation** - Merge fragmented V1 API groups into cohesive V2 groups
4. **Type Safety** - Add proper typing and validation throughout

---

`

  md += `## Table of Contents

1. [Table Mappings](#table-mappings)
2. [Function Mappings](#function-mappings)
3. [Task Mappings](#task-mappings)
4. [Endpoint Mappings](#endpoint-mappings)
5. [Timeline](#timeline)

---

`

  // Add each section (abbreviated for file size)
  const tableStats = getMappingStats()
  const funcStats = getFunctionMappingStats()
  const taskStats = getTaskMappingStats()
  const endpointStats = getEndpointMappingStats()

  md += `## Table Mappings

**Summary:** ${tableStats.total} V1 tables mapped (${tableStats.direct} direct, ${tableStats.split} split, ${tableStats.deprecated} deprecated)

See [table-mappings.md](./table-mappings.md) for full details.

## Function Mappings

**Summary:** ${funcStats.total} V1 functions mapped across ${new Set(FUNCTION_MAPPINGS.map(m => m.category)).size} categories

See [function-mappings.md](./function-mappings.md) for full details.

## Task Mappings

**Summary:** ${taskStats.total} V1 tasks mapped to V2 equivalents

See [task-mappings.md](./task-mappings.md) for full details.

## Endpoint Mappings

**Summary:** ${endpointStats.v1_groups} V1 API groups consolidated into ${endpointStats.v2_groups} V2 groups

See [endpoint-mappings.md](./endpoint-mappings.md) for full details.

## Timeline

**Duration:** 40 days (Dec 5, 2025 - Jan 14, 2026)

See [timeline.md](./timeline.md) for full event log.

---

*Generated by V2 Migration Orchestrator*
`

  return md
}

// Download helper
export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown" })
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
export function exportAllMarkdown(type: "tables" | "functions" | "tasks" | "endpoints" | "timeline" | "full"): void {
  const exporters: Record<string, { fn: () => string; filename: string }> = {
    tables: { fn: generateTableMappingsMD, filename: "table-mappings.md" },
    functions: { fn: generateFunctionMappingsMD, filename: "function-mappings.md" },
    tasks: { fn: generateTaskMappingsMD, filename: "task-mappings.md" },
    endpoints: { fn: generateEndpointMappingsMD, filename: "endpoint-mappings.md" },
    timeline: { fn: generateTimelineMD, filename: "migration-timeline.md" },
    full: { fn: generateMigrationDocMD, filename: "v1-v2-migration-documentation.md" },
  }

  const exporter = exporters[type]
  if (exporter) {
    downloadMarkdown(exporter.fn(), exporter.filename)
  }
}
