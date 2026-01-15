// Endpoint/API Group Mappings for V1 → V2 Migration Orchestrator
// Maps V1 API groups (44) to V2 API groups (26)
// Shows consolidation patterns and endpoint coverage

import type { EndpointMapping, EndpointDetail, MappingType } from "@/types/mappings"

// ═══════════════════════════════════════════════════════════════
// API GROUP MAPPINGS - V1 (44 groups) → V2 (26 groups)
// Major consolidation from fragmented V1 to organized V2
// ═══════════════════════════════════════════════════════════════

export const ENDPOINT_MAPPINGS: EndpointMapping[] = [
  // ═══════════════════════════════════════════════════════════════
  // CORE FRONTEND API - Major Consolidation
  // V2 Frontend API v2 (Group 515) consolidates MANY V1 groups
  // ═══════════════════════════════════════════════════════════════

  {
    v1_group: "API v1 - Legacy Dashboard",
    v1_canonical: "api:legacy_dashboard",
    v1_id: 342,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "Legacy dashboard merged into unified Frontend API v2",
    endpoint_count_v1: 45,
    endpoint_count_v2: 150
  },
  {
    v1_group: "API v1 - Legacy Individual",
    v1_canonical: "api:legacy_individual",
    v1_id: 343,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "Individual user API merged into Frontend API v2",
    endpoint_count_v1: 25,
    endpoint_count_v2: 150
  },
  {
    v1_group: "API v1 - Legacy Team",
    v1_canonical: "api:legacy_team",
    v1_id: 339,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "Team API merged into Frontend API v2",
    endpoint_count_v1: 35,
    endpoint_count_v2: 150
  },
  {
    v1_group: "API v1 - Legacy Charts",
    v1_canonical: "api:legacy_charts",
    v1_id: 344,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "Charts API merged into Frontend API v2 with new chart system",
    endpoint_count_v1: 15,
    endpoint_count_v2: 150
  },
  {
    v1_group: "API v1 - Legacy Luzmo",
    v1_canonical: "api:legacy_luzmo",
    v1_id: 355,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "Luzmo analytics merged into Frontend API v2",
    endpoint_count_v1: 10,
    endpoint_count_v2: 150
  },

  // ═══════════════════════════════════════════════════════════════
  // AUTHENTICATION - Consolidated from multiple groups
  // ═══════════════════════════════════════════════════════════════

  {
    v1_group: "Auth v1",
    v1_canonical: "api:legacy_auth",
    v1_id: 341,
    v2_groups: ["Auth"],
    v2_canonicals: ["api:i6a062_x"],
    v2_ids: [519],
    type: "merged",
    notes: "V1 Auth consolidated into single Auth group",
    endpoint_count_v1: 12,
    endpoint_count_v2: 20
  },
  {
    v1_group: "Auth 2FA v1",
    v1_canonical: "api:legacy_2fa",
    v1_id: 364,
    v2_groups: ["Auth"],
    v2_canonicals: ["api:i6a062_x"],
    v2_ids: [519],
    type: "merged",
    notes: "2FA endpoints merged into main Auth group",
    endpoint_count_v1: 8,
    endpoint_count_v2: 20
  },

  // ═══════════════════════════════════════════════════════════════
  // WEBHOOKS - Organized by source
  // ═══════════════════════════════════════════════════════════════

  {
    v1_group: "Webhooks - Stripe",
    v1_canonical: "api:stripe_webhooks",
    v1_id: 340,
    v2_groups: ["Webhook: Stripe"],
    v2_canonicals: ["api:ihFeqSDq"],
    v2_ids: [340],
    type: "direct",
    notes: "Stripe webhooks - direct mapping",
    endpoint_count_v1: 5,
    endpoint_count_v2: 6
  },
  {
    v1_group: "Webhooks - FUB",
    v1_canonical: "api:fub_webhooks",
    v1_id: 348,
    v2_groups: ["Webhook: FUB"],
    v2_canonicals: ["api:sCYsDnFD"],
    v2_ids: [348],
    type: "direct",
    notes: "FUB webhooks - direct mapping",
    endpoint_count_v1: 8,
    endpoint_count_v2: 10
  },
  {
    v1_group: "Webhooks - Rezen",
    v1_canonical: "api:rezen_webhooks",
    v1_id: 350,
    v2_groups: ["Webhooks"],
    v2_canonicals: ["api:XOwEm4wm"],
    v2_ids: [646],
    type: "merged",
    notes: "Rezen webhooks merged into general Webhooks group",
    endpoint_count_v1: 6,
    endpoint_count_v2: 15
  },

  // ═══════════════════════════════════════════════════════════════
  // LEGACY GROUPS - Still referenced for backwards compatibility
  // ═══════════════════════════════════════════════════════════════

  {
    v1_group: "Legacy Preferences",
    v1_canonical: "api:legacy_preferences",
    v1_id: 533,
    v2_groups: ["Legacy: Preferences"],
    v2_canonicals: ["api:GavJZkAu"],
    v2_ids: [533],
    type: "direct",
    notes: "Legacy preferences API - maintained for compatibility",
    endpoint_count_v1: 10,
    endpoint_count_v2: 10
  },
  {
    v1_group: "Legacy Notifications",
    v1_canonical: "api:legacy_notifications",
    v1_id: 361,
    v2_groups: ["Legacy: Notifications"],
    v2_canonicals: ["api:PFPOc_Ym"],
    v2_ids: [361],
    type: "direct",
    notes: "Legacy notifications API - maintained for compatibility",
    endpoint_count_v1: 8,
    endpoint_count_v2: 8
  },
  {
    v1_group: "Legacy Onboarding",
    v1_canonical: "api:legacy_onboarding",
    v1_id: 345,
    v2_groups: ["Legacy: Onboarding"],
    v2_canonicals: ["api:LxaOlI7l"],
    v2_ids: [345],
    type: "direct",
    notes: "Legacy onboarding API - maintained for compatibility",
    endpoint_count_v1: 12,
    endpoint_count_v2: 12
  },
  {
    v1_group: "Legacy Workers",
    v1_canonical: "api:legacy_workers",
    v1_id: 346,
    v2_groups: ["Legacy: Workers"],
    v2_canonicals: ["api:Cmzol9bx"],
    v2_ids: [346],
    type: "direct",
    notes: "Legacy worker endpoints - maintained for compatibility",
    endpoint_count_v1: 15,
    endpoint_count_v2: 15
  },
  {
    v1_group: "Legacy CSV Import",
    v1_canonical: "api:legacy_csv",
    v1_id: 349,
    v2_groups: ["Legacy: CSV Import"],
    v2_canonicals: ["api:SuvFkHvn"],
    v2_ids: [349],
    type: "direct",
    notes: "Legacy CSV import API",
    endpoint_count_v1: 5,
    endpoint_count_v2: 5
  },

  // ═══════════════════════════════════════════════════════════════
  // MCP (Model Context Protocol) GROUPS - Testing/Internal
  // ═══════════════════════════════════════════════════════════════

  {
    v1_group: "MCP - System",
    v1_canonical: "api:mcp_system",
    v1_id: 535,
    v2_groups: ["MCP: System"],
    v2_canonicals: ["api:LIdBL1AN"],
    v2_ids: [535],
    type: "direct",
    notes: "MCP system oversight endpoints",
    endpoint_count_v1: 10,
    endpoint_count_v2: 10
  },
  {
    v1_group: "MCP - Workers",
    v1_canonical: "api:mcp_workers",
    v1_id: 536,
    v2_groups: ["MCP: Workers"],
    v2_canonicals: ["api:4UsTtl3m"],
    v2_ids: [536],
    type: "direct",
    notes: "MCP worker test endpoints",
    endpoint_count_v1: 8,
    endpoint_count_v2: 8
  },
  {
    v1_group: "MCP - Tasks",
    v1_canonical: "api:mcp_tasks",
    v1_id: 532,
    v2_groups: ["MCP: Tasks"],
    v2_canonicals: ["api:4psV7fp6"],
    v2_ids: [532],
    type: "direct",
    notes: "MCP task test endpoints",
    endpoint_count_v1: 6,
    endpoint_count_v2: 6
  },
  {
    v1_group: "MCP - Seeding",
    v1_canonical: "api:mcp_seeding",
    v1_id: 531,
    v2_groups: ["MCP: Seeding"],
    v2_canonicals: ["api:2kCRUYxG"],
    v2_ids: [531],
    type: "direct",
    notes: "MCP data seeding endpoints",
    endpoint_count_v1: 5,
    endpoint_count_v2: 5
  },
  {
    v1_group: "MCP - SkySlope Tests",
    v1_canonical: "api:mcp_skyslope",
    v1_id: 574,
    v2_groups: ["MCP: SkySlope Tests"],
    v2_canonicals: ["api:6kzol9na"],
    v2_ids: [574],
    type: "direct",
    notes: "MCP SkySlope test endpoints",
    endpoint_count_v1: 4,
    endpoint_count_v2: 4
  },

  // ═══════════════════════════════════════════════════════════════
  // MIGRATION API GROUP - V2 Only
  // ═══════════════════════════════════════════════════════════════

  {
    v1_group: "",
    v1_canonical: "",
    v1_id: 0,
    v2_groups: ["Migration: V1 to V2"],
    v2_canonicals: ["api:Lrekz_3S"],
    v2_ids: [650],
    type: "new",
    notes: "New V2 API group for migration tooling",
    endpoint_count_v1: 0,
    endpoint_count_v2: 25
  },

  // ═══════════════════════════════════════════════════════════════
  // DEPRECATED V1 GROUPS - No V2 equivalent
  // ═══════════════════════════════════════════════════════════════

  {
    v1_group: "Auto CRUD",
    v1_canonical: "api:auto_crud",
    v1_id: 337,
    v2_groups: [],
    v2_canonicals: [],
    v2_ids: [],
    type: "deprecated",
    notes: "Auto-generated CRUD endpoints deprecated in V2 - replaced by explicit endpoints",
    endpoint_count_v1: 50,
    endpoint_count_v2: 0
  },
  {
    v1_group: "Old Reports API",
    v1_canonical: "api:old_reports",
    v1_id: 360,
    v2_groups: [],
    v2_canonicals: [],
    v2_ids: [],
    type: "deprecated",
    notes: "Old reporting API deprecated - replaced by new aggregation system",
    endpoint_count_v1: 20,
    endpoint_count_v2: 0
  },

  // ═══════════════════════════════════════════════════════════════
  // INTEGRATION-SPECIFIC GROUPS (Various patterns)
  // ═══════════════════════════════════════════════════════════════

  {
    v1_group: "FUB Integration",
    v1_canonical: "api:fub_integration",
    v1_id: 370,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "FUB integration endpoints merged into Frontend API v2",
    endpoint_count_v1: 20,
    endpoint_count_v2: 150
  },
  {
    v1_group: "Rezen Integration",
    v1_canonical: "api:rezen_integration",
    v1_id: 371,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "Rezen integration endpoints merged into Frontend API v2",
    endpoint_count_v1: 15,
    endpoint_count_v2: 150
  },
  {
    v1_group: "SkySlope Integration",
    v1_canonical: "api:skyslope_integration",
    v1_id: 372,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "SkySlope integration endpoints merged into Frontend API v2",
    endpoint_count_v1: 10,
    endpoint_count_v2: 150
  },
  {
    v1_group: "DotLoop Integration",
    v1_canonical: "api:dotloop_integration",
    v1_id: 373,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "DotLoop integration endpoints merged into Frontend API v2",
    endpoint_count_v1: 8,
    endpoint_count_v2: 150
  },
  {
    v1_group: "Lofty Integration",
    v1_canonical: "api:lofty_integration",
    v1_id: 374,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "Lofty integration endpoints merged into Frontend API v2",
    endpoint_count_v1: 6,
    endpoint_count_v2: 150
  },

  // ═══════════════════════════════════════════════════════════════
  // ADMIN-ONLY GROUPS
  // ═══════════════════════════════════════════════════════════════

  {
    v1_group: "Admin API v1",
    v1_canonical: "api:admin_v1",
    v1_id: 380,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "Admin API merged into Frontend API v2 with role-based access",
    endpoint_count_v1: 30,
    endpoint_count_v2: 150
  },
  {
    v1_group: "Super Admin v1",
    v1_canonical: "api:superadmin_v1",
    v1_id: 381,
    v2_groups: ["Frontend API v2"],
    v2_canonicals: ["api:pe1wjL5I"],
    v2_ids: [515],
    type: "merged",
    notes: "Super admin endpoints merged into Frontend API v2",
    endpoint_count_v1: 15,
    endpoint_count_v2: 150
  },
]

// ═══════════════════════════════════════════════════════════════
// ENDPOINT DETAILS - Sample endpoints within key groups
// ═══════════════════════════════════════════════════════════════

export const FRONTEND_API_V2_ENDPOINTS: EndpointDetail[] = [
  // User endpoints
  { method: "GET", path: "/auth/me", auth_required: true, v2_id: 1001 },
  { method: "POST", path: "/auth/logout", auth_required: true, v2_id: 1002 },
  { method: "PUT", path: "/user/profile", auth_required: true, v2_id: 1003 },
  { method: "GET", path: "/user/preferences", auth_required: true, v2_id: 1004 },
  { method: "PUT", path: "/user/preferences", auth_required: true, v2_id: 1005 },

  // Transaction endpoints
  { method: "GET", path: "/transactions", auth_required: true, v2_id: 1010 },
  { method: "GET", path: "/transactions/{id}", auth_required: true, v2_id: 1011 },
  { method: "GET", path: "/transactions/summary", auth_required: true, v2_id: 1012 },
  { method: "GET", path: "/transactions/by-agent", auth_required: true, v2_id: 1013 },

  // Listing endpoints
  { method: "GET", path: "/listings", auth_required: true, v2_id: 1020 },
  { method: "GET", path: "/listings/{id}", auth_required: true, v2_id: 1021 },
  { method: "GET", path: "/listings/summary", auth_required: true, v2_id: 1022 },

  // Network endpoints
  { method: "GET", path: "/network/tree", auth_required: true, v2_id: 1030 },
  { method: "GET", path: "/network/downline", auth_required: true, v2_id: 1031 },
  { method: "GET", path: "/network/stats", auth_required: true, v2_id: 1032 },

  // Team endpoints
  { method: "GET", path: "/team/roster", auth_required: true, v2_id: 1040 },
  { method: "GET", path: "/team/stats", auth_required: true, v2_id: 1041 },
  { method: "GET", path: "/team/leaderboard", auth_required: true, v2_id: 1042 },

  // Revenue endpoints
  { method: "GET", path: "/revenue/summary", auth_required: true, v2_id: 1050 },
  { method: "GET", path: "/revenue/breakdown", auth_required: true, v2_id: 1051 },
  { method: "GET", path: "/revenue/revshare", auth_required: true, v2_id: 1052 },

  // Dashboard endpoints
  { method: "GET", path: "/dashboard/widgets", auth_required: true, v2_id: 1060 },
  { method: "GET", path: "/dashboard/kpis", auth_required: true, v2_id: 1061 },
  { method: "PUT", path: "/dashboard/configuration", auth_required: true, v2_id: 1062 },

  // Leads/FUB endpoints
  { method: "GET", path: "/leads/fub/people", auth_required: true, v2_id: 1070 },
  { method: "GET", path: "/leads/fub/events", auth_required: true, v2_id: 1071 },
  { method: "GET", path: "/leads/fub/calls", auth_required: true, v2_id: 1072 },
  { method: "GET", path: "/leads/fub/appointments", auth_required: true, v2_id: 1073 },
  { method: "GET", path: "/leads/fub/deals", auth_required: true, v2_id: 1074 },
  { method: "GET", path: "/leads/fub/aggregates", auth_required: true, v2_id: 1075 },

  // Aggregation endpoints
  { method: "GET", path: "/aggregations/transactions/by-month", auth_required: true, v2_id: 1080 },
  { method: "GET", path: "/aggregations/listings/by-month", auth_required: true, v2_id: 1081 },
  { method: "GET", path: "/aggregations/revenue/by-month", auth_required: true, v2_id: 1082 },
  { method: "GET", path: "/aggregations/network/by-tier", auth_required: true, v2_id: 1083 },

  // Admin endpoints
  { method: "GET", path: "/admin/users", auth_required: true, v2_id: 1090 },
  { method: "POST", path: "/admin/impersonate", auth_required: true, v2_id: 1091 },
  { method: "GET", path: "/admin/audit-log", auth_required: true, v2_id: 1092 },
]

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all endpoint mappings
 */
export function getAllEndpointMappings(): EndpointMapping[] {
  return ENDPOINT_MAPPINGS
}

/**
 * Get endpoint mappings by type
 */
export function getEndpointMappingsByType(type: MappingType): EndpointMapping[] {
  return ENDPOINT_MAPPINGS.filter(m => m.type === type)
}

/**
 * Search endpoint mappings by group name
 */
export function searchEndpointMappings(query: string): EndpointMapping[] {
  const lower = query.toLowerCase()
  return ENDPOINT_MAPPINGS.filter(m =>
    m.v1_group.toLowerCase().includes(lower) ||
    m.v2_groups.some(g => g.toLowerCase().includes(lower)) ||
    m.notes.toLowerCase().includes(lower)
  )
}

/**
 * Get endpoint mapping statistics
 */
export function getEndpointMappingStats() {
  const stats = {
    v1_groups: 0,
    v2_groups: 0,
    v1_endpoints: 0,
    v2_endpoints: 0,
    direct: 0,
    renamed: 0,
    split: 0,
    merged: 0,
    deprecated: 0,
    new: 0,
    consolidation_ratio: 0
  }

  const v1Set = new Set<number>()
  const v2Set = new Set<number>()

  for (const mapping of ENDPOINT_MAPPINGS) {
    stats[mapping.type]++

    if (mapping.v1_id > 0) {
      v1Set.add(mapping.v1_id)
      stats.v1_endpoints += mapping.endpoint_count_v1 || 0
    }

    for (const v2Id of mapping.v2_ids) {
      v2Set.add(v2Id)
    }
    if (mapping.v2_ids.length > 0) {
      stats.v2_endpoints = Math.max(stats.v2_endpoints, mapping.endpoint_count_v2 || 0)
    }
  }

  stats.v1_groups = v1Set.size
  stats.v2_groups = v2Set.size
  stats.consolidation_ratio = stats.v1_groups > 0 ? (stats.v1_groups - stats.v2_groups) / stats.v1_groups : 0

  return stats
}

/**
 * Get merged groups - V1 groups that were consolidated into fewer V2 groups
 */
export function getMergedGroups(): EndpointMapping[] {
  return ENDPOINT_MAPPINGS.filter(m => m.type === "merged")
}

/**
 * Get the main Frontend API v2 endpoint details
 */
export function getFrontendApiEndpoints(): EndpointDetail[] {
  return FRONTEND_API_V2_ENDPOINTS
}

/**
 * Group endpoint mappings by V2 target
 */
export function groupByV2Target(): Map<string, EndpointMapping[]> {
  const groups = new Map<string, EndpointMapping[]>()

  for (const mapping of ENDPOINT_MAPPINGS) {
    for (const v2Group of mapping.v2_groups) {
      const existing = groups.get(v2Group) || []
      existing.push(mapping)
      groups.set(v2Group, existing)
    }
    if (mapping.v2_groups.length === 0 && mapping.type !== "new") {
      const existing = groups.get("(Deprecated)") || []
      existing.push(mapping)
      groups.set("(Deprecated)", existing)
    }
  }

  return groups
}
