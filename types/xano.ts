// Types for Xano V2 workspace data

export interface XanoTable {
  id: number
  name: string
  auth_enabled: boolean
  record_count: number | string // Can be "1+" for non-zero counts
  last_modified: string
  tags: string[]
  description: string | null
}

export interface XanoAPIGroup {
  api_group_id: number
  name: string
  canonical: string
  endpoint_count: number | string
  last_modified: string
  tags: string[]
}

export interface XanoEndpoint {
  id: number
  name: string
  method: string
  path: string
  auth_required: boolean
  description?: string
}

// Category grouping for tables
export interface TableCategory {
  id: string
  label: string
  icon: string
  pattern: RegExp | string[] // Match by regex or exact names
  tables: XanoTable[]
}

// Category grouping for API groups
export interface APICategory {
  id: string
  label: string
  icon: string
  pattern: RegExp | string[]
  groups: XanoAPIGroup[]
}

// Health status for visual indicators
export type HealthStatus = "healthy" | "empty" | "error" | "untested"

export interface TableHealth {
  table_id: number
  status: HealthStatus
  record_count: number
  last_check: string
}

// Table category definitions
export const TABLE_CATEGORIES: Omit<TableCategory, "tables">[] = [
  {
    id: "core",
    label: "Core Identity",
    icon: "👤",
    pattern: ["user", "agent", "team", "brokerage", "office"],
  },
  {
    id: "agent",
    label: "Agent Data",
    icon: "🏢",
    pattern: /^agent_/,
  },
  {
    id: "team",
    label: "Team Structure",
    icon: "👥",
    pattern: /^team_|^leader$|^director$|^mentor$/,
  },
  {
    id: "transaction",
    label: "Transactions",
    icon: "💰",
    pattern: /^transaction|^participant|^commission/,
  },
  {
    id: "listing",
    label: "Listings",
    icon: "🏠",
    pattern: /^listing/,
  },
  {
    id: "network",
    label: "Network/Rev Share",
    icon: "🌐",
    pattern: /^network|^revshare|^contribution|^frontline/,
  },
  {
    id: "financial",
    label: "Financial",
    icon: "💵",
    pattern: /^equity|^income|^outgoing|^ledger|^mortgage/,
  },
  {
    id: "fub",
    label: "Follow Up Boss",
    icon: "📞",
    pattern: /^fub_/,
  },
  {
    id: "rezen",
    label: "Rezen Integration",
    icon: "🏘️",
    pattern: /^rezen_/,
  },
  {
    id: "skyslope",
    label: "SkySlope",
    icon: "📂",
    pattern: /^skyslope/,
  },
  {
    id: "dotloop",
    label: "DotLoop",
    icon: "🔗",
    pattern: /^dotloop/,
  },
  {
    id: "lofty",
    label: "Lofty",
    icon: "☁️",
    pattern: /^lofty/,
  },
  {
    id: "stripe",
    label: "Stripe/Billing",
    icon: "💳",
    pattern: /^stripe/,
  },
  {
    id: "pagebuilder",
    label: "Page Builder",
    icon: "📄",
    pattern: /^page|^widget|^chart_catalog|^chart_types|^chart_libraries/,
  },
  {
    id: "staging",
    label: "Staging/Import",
    icon: "📥",
    pattern: /^stage_|^csv_|^lambda_/,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "🔔",
    pattern: /^notification/,
  },
  {
    id: "logs",
    label: "Logs & Audit",
    icon: "📝",
    pattern: /log$|^audit|^error/,
  },
  {
    id: "config",
    label: "Configuration",
    icon: "⚙️",
    pattern: /^credentials|^permissions|^modules|^global|^job_status/,
  },
  {
    id: "other",
    label: "Other",
    icon: "📦",
    pattern: /.*/, // Catch-all for uncategorized
  },
]

// API category definitions
export const API_CATEGORIES: Omit<APICategory, "groups">[] = [
  {
    id: "frontend",
    label: "Frontend APIs",
    icon: "🚀",
    pattern: /Frontend|Auth/,
  },
  {
    id: "mcp",
    label: "MCP Tools",
    icon: "🔧",
    pattern: /MCP/,
  },
  {
    id: "webhooks",
    label: "Webhooks",
    icon: "📥",
    pattern: /Webhook/,
  },
  {
    id: "migration",
    label: "Migration",
    icon: "🔄",
    pattern: /Migration/,
  },
  {
    id: "legacy",
    label: "Legacy (V1)",
    icon: "📦",
    pattern: /Legacy/,
  },
  {
    id: "other",
    label: "Other",
    icon: "📋",
    pattern: /.*/,
  },
]

// Helper to categorize a table
export function categorizeTable(table: XanoTable): string {
  for (const cat of TABLE_CATEGORIES) {
    if (cat.id === "other") continue // Skip catch-all

    if (Array.isArray(cat.pattern)) {
      if (cat.pattern.includes(table.name)) return cat.id
    } else if (cat.pattern instanceof RegExp) {
      if (cat.pattern.test(table.name)) return cat.id
    }
  }
  return "other"
}

// Helper to categorize an API group
export function categorizeAPIGroup(group: XanoAPIGroup): string {
  for (const cat of API_CATEGORIES) {
    if (cat.id === "other") continue

    if (cat.pattern instanceof RegExp) {
      if (cat.pattern.test(group.name)) return cat.id
    }
  }
  return "other"
}

// Helper to parse record count
export function parseRecordCount(count: number | string): number {
  if (typeof count === "number") return count
  if (count === "1+") return 1 // Treat "1+" as at least 1
  return parseInt(count, 10) || 0
}

// Helper to get health status from record count
export function getHealthStatus(count: number | string): HealthStatus {
  const parsed = parseRecordCount(count)
  if (parsed > 0) return "healthy"
  if (parsed === 0) return "empty"
  return "untested"
}
