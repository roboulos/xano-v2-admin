// Detailed Table Mappings with Field-Level Information
// Shows how V1 tables were Split, Merged, Renamed, or Deprecated in V2

export type MappingStrategy = "split" | "merged" | "renamed" | "new" | "deprecated" | "direct"

export interface FieldMapping {
  v1Field: string
  v2Table: string
  v2Field: string
  notes?: string
}

export interface DetailedTableMapping {
  strategy: MappingStrategy
  v1Table: string
  v2Tables: string[]
  reason: string // Why this strategy was chosen
  fieldMappings?: FieldMapping[] // Where each V1 field went
  color: string // Badge color
  icon: string // Emoji icon
}

// ============================================================================
// SPLIT MAPPINGS - V1 Monolithic Tables → Multiple V2 Tables
// ============================================================================

export const SPLIT_MAPPINGS: Record<string, DetailedTableMapping> = {
  user: {
    strategy: "split",
    v1Table: "user",
    v2Tables: ["user", "user_credentials", "user_settings", "user_roles", "user_subscriptions"],
    reason: "Split from monolithic user table into identity, auth, settings, roles, and subscriptions",
    color: "purple",
    icon: "🔀",
    fieldMappings: [
      { v1Field: "id", v2Table: "user", v2Field: "id" },
      { v1Field: "email", v2Table: "user", v2Field: "email" },
      { v1Field: "first_name", v2Table: "user", v2Field: "first_name" },
      { v1Field: "last_name", v2Table: "user", v2Field: "last_name" },
      { v1Field: "full_name", v2Table: "user", v2Field: "full_name" },
      { v1Field: "password", v2Table: "user_credentials", v2Field: "password_hash" },
      { v1Field: "role", v2Table: "user_roles", v2Field: "role_name" },
      { v1Field: "view", v2Table: "user_settings", v2Field: "default_view" },
      { v1Field: "team_id", v2Table: "user", v2Field: "team_id" },
      { v1Field: "agent_id", v2Table: "user", v2Field: "agent_id" },
      { v1Field: "organization", v2Table: "user", v2Field: "organization" },
      { v1Field: "is_account_admin", v2Table: "user_roles", v2Field: "is_admin", notes: "Role flag" },
      { v1Field: "is_director", v2Table: "user_roles", v2Field: "is_director", notes: "Role flag" },
      { v1Field: "is_team_owner", v2Table: "user_roles", v2Field: "is_team_owner", notes: "Role flag" },
      { v1Field: "demo", v2Table: "user_settings", v2Field: "demo_mode" },
      { v1Field: "created_at", v2Table: "user", v2Field: "created_at" },
      { v1Field: "updated_at", v2Table: "user", v2Field: "updated_at" },
    ],
  },
  agent: {
    strategy: "split",
    v1Table: "agent",
    v2Tables: ["agent", "agent_cap_data", "agent_commission", "agent_hierarchy", "agent_performance"],
    reason: "Split from monolithic agent table into profile, caps, commissions, hierarchy, and performance metrics",
    color: "purple",
    icon: "🔀",
    fieldMappings: [
      { v1Field: "id", v2Table: "agent", v2Field: "id" },
      { v1Field: "agent_id", v2Table: "agent", v2Field: "agent_id" },
      { v1Field: "first_name", v2Table: "agent", v2Field: "first_name" },
      { v1Field: "last_name", v2Table: "agent", v2Field: "last_name" },
      { v1Field: "full_name", v2Table: "agent", v2Field: "full_name" },
      { v1Field: "agent_name", v2Table: "agent", v2Field: "agent_name" },
      { v1Field: "email", v2Table: "agent", v2Field: "email" },
      { v1Field: "phone", v2Table: "agent", v2Field: "phone" },
      { v1Field: "user_id", v2Table: "agent", v2Field: "user_id" },
      { v1Field: "team_id", v2Table: "agent_hierarchy", v2Field: "team_id" },
      { v1Field: "sponsor_id", v2Table: "agent_hierarchy", v2Field: "sponsor_id" },
      { v1Field: "status", v2Table: "agent", v2Field: "status" },
      { v1Field: "join_date", v2Table: "agent", v2Field: "join_date" },
      { v1Field: "anniversary_date", v2Table: "agent", v2Field: "anniversary_date" },
      { v1Field: "license_state", v2Table: "agent", v2Field: "license_state" },
      { v1Field: "license_number", v2Table: "agent", v2Field: "license_number" },
      { v1Field: "created_at", v2Table: "agent", v2Field: "created_at" },
    ],
  },
  transaction: {
    strategy: "split",
    v1Table: "transaction",
    v2Tables: ["transaction", "transaction_financials", "transaction_history", "transaction_participants"],
    reason: "Split from monolithic transaction into core, financials, audit history, and participants",
    color: "purple",
    icon: "🔀",
    fieldMappings: [
      { v1Field: "id", v2Table: "transaction", v2Field: "id" },
      { v1Field: "transaction_id", v2Table: "transaction", v2Field: "transaction_id" },
      { v1Field: "address", v2Table: "transaction", v2Field: "address" },
      { v1Field: "city", v2Table: "transaction", v2Field: "city" },
      { v1Field: "state", v2Table: "transaction", v2Field: "state" },
      { v1Field: "zip", v2Table: "transaction", v2Field: "zip" },
      { v1Field: "price", v2Table: "transaction_financials", v2Field: "list_price" },
      { v1Field: "close_price", v2Table: "transaction_financials", v2Field: "close_price" },
      { v1Field: "status", v2Table: "transaction", v2Field: "status" },
      { v1Field: "type", v2Table: "transaction", v2Field: "type" },
      { v1Field: "close_date", v2Table: "transaction", v2Field: "close_date" },
      { v1Field: "team_id", v2Table: "transaction", v2Field: "team_id" },
      { v1Field: "transaction_owner_agent_id", v2Table: "transaction_participants", v2Field: "agent_id", notes: "Junction table" },
      { v1Field: "listing_agent_id", v2Table: "transaction_participants", v2Field: "agent_id", notes: "Junction table" },
      { v1Field: "buying_agent_id", v2Table: "transaction_participants", v2Field: "agent_id", notes: "Junction table" },
      { v1Field: "source", v2Table: "transaction", v2Field: "source" },
      { v1Field: "created_at", v2Table: "transaction", v2Field: "created_at" },
    ],
  },
  listing: {
    strategy: "split",
    v1Table: "listing",
    v2Tables: ["listing", "listing_history", "listing_photos"],
    reason: "Split into core listing data, price/status history tracking, and media storage",
    color: "purple",
    icon: "🔀",
    fieldMappings: [
      { v1Field: "id", v2Table: "listing", v2Field: "id" },
      { v1Field: "listing_id", v2Table: "listing", v2Field: "listing_id" },
      { v1Field: "address", v2Table: "listing", v2Field: "address" },
      { v1Field: "city", v2Table: "listing", v2Field: "city" },
      { v1Field: "state", v2Table: "listing", v2Field: "state" },
      { v1Field: "zip", v2Table: "listing", v2Field: "zip" },
      { v1Field: "price", v2Table: "listing", v2Field: "current_price", notes: "History in listing_history" },
      { v1Field: "status", v2Table: "listing", v2Field: "current_status", notes: "History in listing_history" },
      { v1Field: "type", v2Table: "listing", v2Field: "type" },
      { v1Field: "team_id", v2Table: "listing", v2Field: "team_id" },
      { v1Field: "agent_id", v2Table: "listing", v2Field: "agent_id" },
      { v1Field: "list_date", v2Table: "listing", v2Field: "list_date" },
      { v1Field: "expire_date", v2Table: "listing", v2Field: "expire_date" },
      { v1Field: "created_at", v2Table: "listing", v2Field: "created_at" },
    ],
  },
  network: {
    strategy: "split",
    v1Table: "network",
    v2Tables: ["network_hierarchy", "network_member", "network_user_prefs"],
    reason: "Split into hierarchy relationships, member profiles, and user preferences",
    color: "purple",
    icon: "🔀",
    fieldMappings: [
      { v1Field: "id", v2Table: "network_member", v2Field: "id" },
      { v1Field: "user_id", v2Table: "network_member", v2Field: "user_id" },
      { v1Field: "agent_id", v2Table: "network_member", v2Field: "agent_id" },
      { v1Field: "first_name", v2Table: "network_member", v2Field: "first_name" },
      { v1Field: "last_name", v2Table: "network_member", v2Field: "last_name" },
      { v1Field: "agent_name", v2Table: "network_member", v2Field: "agent_name" },
      { v1Field: "downline_agent_id", v2Table: "network_hierarchy", v2Field: "child_agent_id" },
      { v1Field: "downline_agent_name", v2Table: "network_hierarchy", v2Field: "child_agent_name" },
      { v1Field: "sponsoring_agent_id", v2Table: "network_hierarchy", v2Field: "parent_agent_id" },
      { v1Field: "sponsoring_agent_name", v2Table: "network_hierarchy", v2Field: "parent_agent_name" },
      { v1Field: "tier", v2Table: "network_hierarchy", v2Field: "tier" },
      { v1Field: "status", v2Table: "network_member", v2Field: "status" },
      { v1Field: "created_at", v2Table: "network_member", v2Field: "created_at" },
    ],
  },
  team: {
    strategy: "split",
    v1Table: "team",
    v2Tables: ["team", "team_settings", "team_members"],
    reason: "Split into core team record, settings, and membership",
    color: "purple",
    icon: "🔀",
    fieldMappings: [
      { v1Field: "id", v2Table: "team", v2Field: "id" },
      { v1Field: "team_id", v2Table: "team", v2Field: "team_id" },
      { v1Field: "name", v2Table: "team", v2Field: "name" },
      { v1Field: "type", v2Table: "team_settings", v2Field: "team_type" },
      { v1Field: "status", v2Table: "team", v2Field: "status" },
      { v1Field: "owner_agent_id", v2Table: "team", v2Field: "owner_agent_id" },
      { v1Field: "brokerage", v2Table: "team_settings", v2Field: "brokerage" },
      { v1Field: "created_at", v2Table: "team", v2Field: "created_at" },
    ],
  },
}

// ============================================================================
// MERGED MAPPINGS - Multiple V1 Tables → Single V2 Table
// ============================================================================

export const MERGED_MAPPINGS: Record<string, DetailedTableMapping> = {
  contribution: {
    strategy: "merged",
    v1Table: "contributions",
    v2Tables: ["contribution"],
    reason: "Merged contributions and contributors into single normalized contribution table",
    color: "blue",
    icon: "🔗",
  },
}

// ============================================================================
// RENAMED MAPPINGS - V1 Table → V2 Table (Different Name)
// ============================================================================

export const RENAMED_MAPPINGS: Record<string, DetailedTableMapping> = {
  roster: {
    strategy: "renamed",
    v1Table: "roster",
    v2Tables: ["team_members"],
    reason: "Renamed from 'roster' to more descriptive 'team_members'",
    color: "green",
    icon: "📝",
  },
  "team - roster": {
    strategy: "renamed",
    v1Table: "team - roster",
    v2Tables: ["team_members"],
    reason: "V1 'team - roster' junction table renamed to 'team_members'",
    color: "green",
    icon: "📝",
  },
}

// ============================================================================
// NEW MAPPINGS - V2 Tables with No V1 Source
// ============================================================================

export const NEW_MAPPINGS: Record<string, DetailedTableMapping> = {
  user_credentials: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["user_credentials"],
    reason: "New table for secure credential storage (password, 2FA, etc)",
    color: "cyan",
    icon: "➕",
  },
  user_settings: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["user_settings"],
    reason: "New table for user preferences and settings",
    color: "cyan",
    icon: "➕",
  },
  user_roles: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["user_roles"],
    reason: "New table for role-based permissions",
    color: "cyan",
    icon: "➕",
  },
  user_subscriptions: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["user_subscriptions"],
    reason: "New table for subscription management",
    color: "cyan",
    icon: "➕",
  },
  agent_cap_data: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["agent_cap_data"],
    reason: "New table for agent cap tracking and calculations",
    color: "cyan",
    icon: "➕",
  },
  agent_commission: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["agent_commission"],
    reason: "New table for commission calculations and splits",
    color: "cyan",
    icon: "➕",
  },
  agent_hierarchy: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["agent_hierarchy"],
    reason: "New table for agent sponsorship hierarchy",
    color: "cyan",
    icon: "➕",
  },
  agent_performance: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["agent_performance"],
    reason: "New table for performance metrics and KPIs",
    color: "cyan",
    icon: "➕",
  },
  transaction_financials: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["transaction_financials"],
    reason: "New table for detailed financial data",
    color: "cyan",
    icon: "➕",
  },
  transaction_history: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["transaction_history"],
    reason: "New table for audit trail of changes",
    color: "cyan",
    icon: "➕",
  },
  transaction_participants: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["transaction_participants"],
    reason: "New junction table for agent participation",
    color: "cyan",
    icon: "➕",
  },
  listing_history: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["listing_history"],
    reason: "New table for price/status change history",
    color: "cyan",
    icon: "➕",
  },
  listing_photos: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["listing_photos"],
    reason: "New table for media storage",
    color: "cyan",
    icon: "➕",
  },
  network_hierarchy: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["network_hierarchy"],
    reason: "New table for network relationships",
    color: "cyan",
    icon: "➕",
  },
  network_user_prefs: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["network_user_prefs"],
    reason: "New table for network display preferences",
    color: "cyan",
    icon: "➕",
  },
  team_settings: {
    strategy: "new",
    v1Table: "",
    v2Tables: ["team_settings"],
    reason: "New table for team configuration",
    color: "cyan",
    icon: "➕",
  },
}

// ============================================================================
// DEPRECATED MAPPINGS - V1 Tables with No V2 Equivalent
// ============================================================================

export const DEPRECATED_MAPPINGS: Record<string, DetailedTableMapping> = {
  "user - 2FA": {
    strategy: "deprecated",
    v1Table: "user - 2FA",
    v2Tables: [],
    reason: "Merged into user_credentials table",
    color: "gray",
    icon: "➖",
  },
  "FUB - notes": {
    strategy: "deprecated",
    v1Table: "FUB - notes",
    v2Tables: [],
    reason: "Merged into contact_log table",
    color: "gray",
    icon: "➖",
  },
  "team - owners": {
    strategy: "deprecated",
    v1Table: "team - owners",
    v2Tables: [],
    reason: "Owner relationship now in team.owner_agent_id",
    color: "gray",
    icon: "➖",
  },
  "team - admins": {
    strategy: "deprecated",
    v1Table: "team - admins",
    v2Tables: [],
    reason: "Admin role now in user_roles",
    color: "gray",
    icon: "➖",
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTableMapping(tableName: string): DetailedTableMapping | null {
  return (
    SPLIT_MAPPINGS[tableName] ||
    MERGED_MAPPINGS[tableName] ||
    RENAMED_MAPPINGS[tableName] ||
    NEW_MAPPINGS[tableName] ||
    DEPRECATED_MAPPINGS[tableName] ||
    null
  )
}

export function getStrategyBadgeColor(strategy: MappingStrategy): string {
  switch (strategy) {
    case "split":
      return "bg-purple-50 text-purple-700 border-purple-200"
    case "merged":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "renamed":
      return "bg-green-50 text-green-700 border-green-200"
    case "new":
      return "bg-cyan-50 text-cyan-700 border-cyan-200"
    case "deprecated":
      return "bg-gray-50 text-gray-700 border-gray-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

export function getStrategyLabel(strategy: MappingStrategy): string {
  switch (strategy) {
    case "split":
      return "Split"
    case "merged":
      return "Merged"
    case "renamed":
      return "Renamed"
    case "new":
      return "New"
    case "deprecated":
      return "Deprecated"
    case "direct":
      return "Direct"
  }
}
