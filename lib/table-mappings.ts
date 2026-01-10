// Table Mappings: V1 → V2
// Defines how V1 denormalized tables map to V2 normalized tables

export type MappingType =
  | "direct"      // 1:1 mapping, same name
  | "renamed"     // 1:1 but different name in V2
  | "split"       // V1 table split into multiple V2 tables
  | "merged"      // V1 table merged with others in V2
  | "deprecated"  // V1 table has no V2 equivalent
  | "new"         // V2 table has no V1 source

export interface TableMapping {
  v1_table: string
  v1_label: string
  v2_tables: string[]  // Can be multiple for split mappings
  v2_labels: string[]
  type: MappingType
  notes: string
  // For comparison - which V2 table holds the "main" record count
  primary_v2_table?: string
}

// Complete mapping of all 33 V1 tables to V2
export const TABLE_MAPPINGS: TableMapping[] = [
  // ═══════════════════════════════════════════════════════════════
  // CORE TABLES (8)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "user",
    v1_label: "Users",
    v2_tables: ["user", "user_credentials", "user_settings", "user_roles", "user_subscriptions"],
    v2_labels: ["User", "User Credentials", "User Settings", "User Roles", "User Subscriptions"],
    type: "split",
    notes: "V1 user split into identity, credentials, settings, roles, and subscriptions in V2",
    primary_v2_table: "user"
  },
  {
    v1_table: "agent",
    v1_label: "Agents",
    v2_tables: ["agent", "agent_cap_data", "agent_commission", "agent_hierarchy", "agent_performance"],
    v2_labels: ["Agent", "Agent Cap Data", "Agent Commission", "Agent Hierarchy", "Agent Performance"],
    type: "split",
    notes: "V1 agent split into profile, caps, commissions, hierarchy, and performance in V2",
    primary_v2_table: "agent"
  },
  {
    v1_table: "team",
    v1_label: "Teams",
    v2_tables: ["team", "team_settings", "team_members"],
    v2_labels: ["Team", "Team Settings", "Team Members"],
    type: "split",
    notes: "Team core record + settings + membership normalized",
    primary_v2_table: "team"
  },
  {
    v1_table: "roster",
    v1_label: "Roster",
    v2_tables: ["team_members"],
    v2_labels: ["Team Members"],
    type: "renamed",
    notes: "V1 roster renamed to team_members in V2",
    primary_v2_table: "team_members"
  },
  {
    v1_table: "network",
    v1_label: "Network",
    v2_tables: ["network_hierarchy", "network_member", "network_user_prefs"],
    v2_labels: ["Network Hierarchy", "Network Member", "Network User Prefs"],
    type: "split",
    notes: "V1 network decomposed into hierarchy, members, and preferences",
    primary_v2_table: "network_member"
  },
  {
    v1_table: "transaction",
    v1_label: "Transactions",
    v2_tables: ["transaction", "transaction_financials", "transaction_history", "transaction_participants", "transaction_tags"],
    v2_labels: ["Transaction", "Transaction Financials", "Transaction History", "Transaction Participants", "Transaction Tags"],
    type: "split",
    notes: "Fully normalized - core record, financials, audit history, participants junction, tags",
    primary_v2_table: "transaction"
  },
  {
    v1_table: "listing",
    v1_label: "Listings",
    v2_tables: ["listing", "listing_history", "listing_photos"],
    v2_labels: ["Listing", "Listing History", "Listing Photos"],
    type: "split",
    notes: "Core listing + price/status history + media separated",
    primary_v2_table: "listing"
  },
  {
    v1_table: "participant",
    v1_label: "Participants",
    v2_tables: ["participant"],
    v2_labels: ["Participant"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "participant"
  },

  // ═══════════════════════════════════════════════════════════════
  // FINANCIAL TABLES (4)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "contribution",
    v1_label: "Contributions",
    v2_tables: ["contribution", "contribution_tiers"],
    v2_labels: ["Contribution", "Contribution Tiers"],
    type: "split",
    notes: "Contribution records + tier definitions separated",
    primary_v2_table: "contribution"
  },
  {
    v1_table: "income",
    v1_label: "Income",
    v2_tables: ["income"],
    v2_labels: ["Income"],
    type: "direct",
    notes: "Direct 1:1 mapping - unified income tracking",
    primary_v2_table: "income"
  },
  {
    v1_table: "revshare_totals",
    v1_label: "RevShare Totals",
    v2_tables: ["revshare_totals", "revshare_payment"],
    v2_labels: ["RevShare Totals", "RevShare Payment"],
    type: "split",
    notes: "Totals + individual payment records separated",
    primary_v2_table: "revshare_totals"
  },
  {
    v1_table: "contributors",
    v1_label: "Contributors",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Merged into contribution table in V2 - no longer separate",
    primary_v2_table: undefined
  },

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS TABLES (8)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "subscription",
    v1_label: "Subscriptions",
    v2_tables: ["stripe_subscriptions", "user_subscriptions"],
    v2_labels: ["Stripe Subscriptions", "User Subscriptions"],
    type: "split",
    notes: "Stripe data + user subscription status separated",
    primary_v2_table: "stripe_subscriptions"
  },
  {
    v1_table: "notifications",
    v1_label: "Notifications",
    v2_tables: ["notification", "notification_items", "notification_defaults", "notification_user_prefs"],
    v2_labels: ["Notification", "Notification Items", "Notification Defaults", "Notification User Prefs"],
    type: "split",
    notes: "Fully normalized notification system",
    primary_v2_table: "notification"
  },
  {
    v1_table: "pipeline_prospects",
    v1_label: "Pipeline Prospects",
    v2_tables: ["pipeline_prospects", "pipeline_prospect_defaults"],
    v2_labels: ["Pipeline Prospects", "Pipeline Prospect Defaults"],
    type: "split",
    notes: "Prospects + default configs separated",
    primary_v2_table: "pipeline_prospects"
  },
  {
    v1_table: "pipeline_stages",
    v1_label: "Pipeline Stages",
    v2_tables: ["pipeline_stages", "pipeline_stage_defaults"],
    v2_labels: ["Pipeline Stages", "Pipeline Stage Defaults"],
    type: "split",
    notes: "Stages + default configs separated",
    primary_v2_table: "pipeline_stages"
  },
  {
    v1_table: "leaders",
    v1_label: "Leaders",
    v2_tables: ["leader", "team_leader_assignments"],
    v2_labels: ["Leader", "Team Leader Assignments"],
    type: "split",
    notes: "Leader records + team assignments junction",
    primary_v2_table: "leader"
  },
  {
    v1_table: "directors",
    v1_label: "Directors",
    v2_tables: ["director", "team_director_assignments"],
    v2_labels: ["Director", "Team Director Assignments"],
    type: "split",
    notes: "Director records + team assignments junction",
    primary_v2_table: "director"
  },
  {
    v1_table: "team_owners",
    v1_label: "Team Owners",
    v2_tables: ["team"],
    v2_labels: ["Team"],
    type: "merged",
    notes: "Team owner info merged into team table in V2",
    primary_v2_table: "team"
  },
  {
    v1_table: "paid_participant",
    v1_label: "Paid Participants",
    v2_tables: ["participant_paid"],
    v2_labels: ["Participant Paid"],
    type: "renamed",
    notes: "Renamed from paid_participant to participant_paid",
    primary_v2_table: "participant_paid"
  },

  // ═══════════════════════════════════════════════════════════════
  // FUB TABLES (9)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "fub_accounts",
    v1_label: "FUB Accounts",
    v2_tables: ["fub_accounts"],
    v2_labels: ["FUB Accounts"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "fub_accounts"
  },
  {
    v1_table: "fub_appointments",
    v1_label: "FUB Appointments",
    v2_tables: ["fub_appointments"],
    v2_labels: ["FUB Appointments"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "fub_appointments"
  },
  {
    v1_table: "fub_deal_stages",
    v1_label: "FUB Deal Stages",
    v2_tables: ["fub_stages"],
    v2_labels: ["FUB Stages"],
    type: "renamed",
    notes: "Renamed from fub_deal_stages to fub_stages",
    primary_v2_table: "fub_stages"
  },
  {
    v1_table: "fub_deals",
    v1_label: "FUB Deals",
    v2_tables: ["fub_deals"],
    v2_labels: ["FUB Deals"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "fub_deals"
  },
  {
    v1_table: "fub_notes",
    v1_label: "FUB Notes",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "FUB notes merged into contact log in V2",
    primary_v2_table: undefined
  },
  {
    v1_table: "fub_people",
    v1_label: "FUB People",
    v2_tables: ["fub_people"],
    v2_labels: ["FUB People"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "fub_people"
  },
  {
    v1_table: "fub_tasks",
    v1_label: "FUB Tasks",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "FUB tasks not migrated to V2",
    primary_v2_table: undefined
  },
  {
    v1_table: "fub_calls",
    v1_label: "FUB Calls",
    v2_tables: ["fub_calls"],
    v2_labels: ["FUB Calls"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "fub_calls"
  },
  {
    v1_table: "fub_texts",
    v1_label: "FUB Texts",
    v2_tables: ["fub_text_messages"],
    v2_labels: ["FUB Text Messages"],
    type: "renamed",
    notes: "Renamed from fub_texts to fub_text_messages",
    primary_v2_table: "fub_text_messages"
  },

  // ═══════════════════════════════════════════════════════════════
  // OTHER TABLES (4)
  // ═══════════════════════════════════════════════════════════════
  {
    v1_table: "links",
    v1_label: "Links",
    v2_tables: ["team_links", "user_links"],
    v2_labels: ["Team Links", "User Links"],
    type: "split",
    notes: "Split into team-specific and user-specific links",
    primary_v2_table: "team_links"
  },
  {
    v1_table: "leads",
    v1_label: "Leads",
    v2_tables: ["leads"],
    v2_labels: ["Leads"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "leads"
  },
  {
    v1_table: "team_admins",
    v1_label: "Team Admins",
    v2_tables: [],
    v2_labels: [],
    type: "deprecated",
    notes: "Team admin role merged into team_members with role flag in V2",
    primary_v2_table: undefined
  },
  {
    v1_table: "connections",
    v1_label: "Connections",
    v2_tables: ["connections"],
    v2_labels: ["Connections"],
    type: "direct",
    notes: "Direct 1:1 mapping",
    primary_v2_table: "connections"
  },
]

// Get mapping for a specific V1 table
export function getMapping(v1TableName: string): TableMapping | undefined {
  return TABLE_MAPPINGS.find(m => m.v1_table === v1TableName)
}

// Get all mappings by type
export function getMappingsByType(type: MappingType): TableMapping[] {
  return TABLE_MAPPINGS.filter(m => m.type === type)
}

// Get mapping statistics
export function getMappingStats() {
  return {
    total: TABLE_MAPPINGS.length,
    direct: TABLE_MAPPINGS.filter(m => m.type === "direct").length,
    renamed: TABLE_MAPPINGS.filter(m => m.type === "renamed").length,
    split: TABLE_MAPPINGS.filter(m => m.type === "split").length,
    merged: TABLE_MAPPINGS.filter(m => m.type === "merged").length,
    deprecated: TABLE_MAPPINGS.filter(m => m.type === "deprecated").length,
  }
}

// Get all unique V2 tables that have V1 mappings
export function getMappedV2Tables(): string[] {
  const tables = new Set<string>()
  for (const mapping of TABLE_MAPPINGS) {
    for (const v2Table of mapping.v2_tables) {
      tables.add(v2Table)
    }
  }
  return Array.from(tables)
}

// Color coding for mapping types
export const MAPPING_TYPE_COLORS: Record<MappingType, { bg: string; text: string; border: string }> = {
  direct: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  renamed: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  split: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  merged: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  deprecated: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  new: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
}

export const MAPPING_TYPE_LABELS: Record<MappingType, string> = {
  direct: "Direct",
  renamed: "Renamed",
  split: "Split",
  merged: "Merged",
  deprecated: "Deprecated",
  new: "New in V2",
}
