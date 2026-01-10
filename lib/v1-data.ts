// V1 Workspace Data - AgentDashboards Production (Workspace 1)
// Instance: xmpx-swi5-tlvy.n7c.xano.io
// 33 tables - denormalized schema

export interface V1Table {
  id: string
  name: string
  label: string
  category: "core" | "financial" | "business" | "fub" | "other"
  description: string
  // Record counts will be fetched dynamically or set here as baseline
  v1_record_count?: number
}

// V1 Tables - All 33 tables from the production workspace
export const V1_TABLES: V1Table[] = [
  // Core Tables (8)
  { id: "user", name: "user", label: "Users", category: "core", description: "Login accounts with role/view fields" },
  { id: "agent", name: "agent", label: "Agents", category: "core", description: "Agent profiles and identity" },
  { id: "team", name: "team", label: "Teams", category: "core", description: "Team entities" },
  { id: "roster", name: "roster", label: "Roster", category: "core", description: "Team membership (team_roster)" },
  { id: "network", name: "network", label: "Network", category: "core", description: "Downline/sponsorship tree" },
  { id: "transaction", name: "transaction", label: "Transactions", category: "core", description: "All transactions" },
  { id: "listing", name: "listing", label: "Listings", category: "core", description: "Property listings" },
  { id: "participant", name: "participant", label: "Participants", category: "core", description: "Transaction participants" },

  // Financial Tables (4)
  { id: "contribution", name: "contribution", label: "Contributions", category: "financial", description: "Rev share contribution records" },
  { id: "income", name: "income", label: "Income", category: "financial", description: "Income records" },
  { id: "revshare_totals", name: "revshare_totals", label: "RevShare Totals", category: "financial", description: "Aggregated rev share totals" },
  { id: "contributors", name: "contributors", label: "Contributors", category: "financial", description: "Contributor records" },

  // Business Tables (8)
  { id: "subscription", name: "subscription", label: "Subscriptions", category: "business", description: "Stripe subscriptions" },
  { id: "notifications", name: "notifications", label: "Notifications", category: "business", description: "User notifications" },
  { id: "pipeline_prospects", name: "pipeline_prospects", label: "Pipeline Prospects", category: "business", description: "CRM prospects" },
  { id: "pipeline_stages", name: "pipeline_stages", label: "Pipeline Stages", category: "business", description: "Pipeline stages" },
  { id: "leaders", name: "leaders", label: "Leaders", category: "business", description: "Leader roles" },
  { id: "directors", name: "directors", label: "Directors", category: "business", description: "Director roles" },
  { id: "team_owners", name: "team_owners", label: "Team Owners", category: "business", description: "Team ownership records" },
  { id: "paid_participant", name: "paid_participant", label: "Paid Participants", category: "business", description: "Paid participant records" },

  // FUB Tables (9)
  { id: "fub_accounts", name: "fub_accounts", label: "FUB Accounts", category: "fub", description: "Follow Up Boss account connections" },
  { id: "fub_appointments", name: "fub_appointments", label: "FUB Appointments", category: "fub", description: "FUB appointment sync" },
  { id: "fub_deal_stages", name: "fub_deal_stages", label: "FUB Deal Stages", category: "fub", description: "FUB deal stages" },
  { id: "fub_deals", name: "fub_deals", label: "FUB Deals", category: "fub", description: "FUB deals" },
  { id: "fub_notes", name: "fub_notes", label: "FUB Notes", category: "fub", description: "FUB notes sync" },
  { id: "fub_people", name: "fub_people", label: "FUB People", category: "fub", description: "FUB contacts sync" },
  { id: "fub_tasks", name: "fub_tasks", label: "FUB Tasks", category: "fub", description: "FUB tasks sync" },
  { id: "fub_calls", name: "fub_calls", label: "FUB Calls", category: "fub", description: "FUB call log sync" },
  { id: "fub_texts", name: "fub_texts", label: "FUB Texts", category: "fub", description: "FUB SMS sync" },

  // Other Tables (4)
  { id: "links", name: "links", label: "Links", category: "other", description: "User links" },
  { id: "leads", name: "leads", label: "Leads", category: "other", description: "Lead records" },
  { id: "team_admins", name: "team_admins", label: "Team Admins", category: "other", description: "Team admin roles" },
  { id: "connections", name: "connections", label: "Connections", category: "other", description: "User connections" },
]

export const V1_CATEGORIES = [
  { id: "core", label: "Core Tables", icon: "👤", count: 8 },
  { id: "financial", label: "Financial Tables", icon: "💵", count: 4 },
  { id: "business", label: "Business Tables", icon: "🏢", count: 8 },
  { id: "fub", label: "Follow Up Boss", icon: "📞", count: 9 },
  { id: "other", label: "Other Tables", icon: "📦", count: 4 },
]

export function getV1Tables(): V1Table[] {
  return V1_TABLES
}

export function getV1TablesByCategory(category: string): V1Table[] {
  return V1_TABLES.filter(t => t.category === category)
}

export function getV1Stats() {
  return {
    total: V1_TABLES.length,
    core: V1_TABLES.filter(t => t.category === "core").length,
    financial: V1_TABLES.filter(t => t.category === "financial").length,
    business: V1_TABLES.filter(t => t.category === "business").length,
    fub: V1_TABLES.filter(t => t.category === "fub").length,
    other: V1_TABLES.filter(t => t.category === "other").length,
  }
}
